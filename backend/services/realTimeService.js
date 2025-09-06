const { Server } = require('socket.io');
const CrowdData = require('../models/CrowdData');
const IoTLog = require('../models/IoTLog');

class RealTimeService {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:8080",
        methods: ["GET", "POST"]
      }
    });
    
    this.setupSocketHandlers();
    this.startRealTimeUpdates();
  }
  
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Join zone-specific rooms
      socket.on('join-zone', (zoneId) => {
        socket.join(`zone-${zoneId}`);
        console.log(`Client ${socket.id} joined zone ${zoneId}`);
      });
      
      // Join authority dashboard
      socket.on('join-authority', () => {
        socket.join('authority');
        console.log(`Authority client ${socket.id} connected`);
      });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  
  startRealTimeUpdates() {
    // Send crowd updates every 5 seconds
    setInterval(async () => {
      try {
        const crowdData = await this.generateRealTimeCrowdData();
        this.io.emit('crowd-update', crowdData);
      } catch (error) {
        console.error('Real-time crowd update failed:', error);
      }
    }, 5000);
    
    // Send IoT sensor updates every 3 seconds
    setInterval(async () => {
      try {
        const sensorData = await this.generateSensorData();
        this.io.emit('sensor-update', sensorData);
      } catch (error) {
        console.error('Real-time sensor update failed:', error);
      }
    }, 3000);
    
    // Send alerts as needed
    setInterval(async () => {
      try {
        const alerts = await this.checkForAlerts();
        if (alerts.length > 0) {
          this.io.to('authority').emit('new-alerts', alerts);
        }
      } catch (error) {
        console.error('Alert check failed:', error);
      }
    }, 10000);
  }
  
  async generateRealTimeCrowdData() {
    const zones = ['Zone_A', 'Zone_B', 'Zone_C', 'Zone_D', 'Buffer_1', 'Buffer_2'];
    
    const crowdData = await Promise.all(zones.map(async (zoneId) => {
      const currentDensity = Math.floor(Math.random() * 100);
      const entryRate = Math.random() * 20 + 5;
      const exitRate = Math.random() * 15 + 3;
      
      // Save to database
      await CrowdData.findOneAndUpdate(
        { zone_id: zoneId },
        {
          zone_id: zoneId,
          current_density: currentDensity,
          predicted_density: Math.min(100, currentDensity + (Math.random() - 0.5) * 20),
          flow_direction: entryRate > exitRate ? 'in' : exitRate > entryRate * 1.2 ? 'out' : 'stable',
          bottleneck_risk: currentDensity > 80 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
          timestamp: new Date()
        },
        { upsert: true, new: true }
      );
      
      return {
        zoneId,
        currentDensity,
        entryRate: Math.round(entryRate * 10) / 10,
        exitRate: Math.round(exitRate * 10) / 10,
        avgDwellTime: Math.floor(Math.random() * 60 + 30),
        alerts: currentDensity > 80 ? ['High density detected'] : [],
        timestamp: new Date()
      };
    }));
    
    return crowdData;
  }
  
  async generateSensorData() {
    const sensors = [
      { id: 'COUNTER_001', type: 'people_counter', zone: 'Zone_A' },
      { id: 'COUNTER_002', type: 'people_counter', zone: 'Zone_B' },
      { id: 'YOLO_CAM_001', type: 'thermal_camera', zone: 'Buffer_1' },
      { id: 'YOLO_CAM_002', type: 'thermal_camera', zone: 'Buffer_2' }
    ];
    
    const sensorReadings = await Promise.all(sensors.map(async (sensor) => {
      let data = {};
      
      if (sensor.type === 'people_counter') {
        data.count = Math.floor(Math.random() * 30) + 5;
      } else if (sensor.type === 'thermal_camera') {
        data.yolo_detections = this.generateYOLODetections(sensor.zone);
      }
      
      // Save to database
      const iotLog = new IoTLog({
        zone_id: sensor.zone,
        sensor_type: sensor.type,
        sensor_id: sensor.id,
        data: data,
        status: Math.random() > 0.05 ? 'active' : 'error'
      });
      
      await iotLog.save();
      
      return {
        sensorId: sensor.id,
        type: sensor.type,
        zone: sensor.zone,
        data: data,
        timestamp: new Date(),
        status: iotLog.status
      };
    }));
    
    return sensorReadings;
  }
  
  generateYOLODetections(zone) {
    const numPeople = Math.floor(Math.random() * 20) + 10;
    const detections = [];
    
    for (let i = 0; i < numPeople; i++) {
      detections.push({
        class: 'person',
        confidence: 0.75 + Math.random() * 0.2,
        bounding_box: {
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          width: 60 + Math.random() * 40,
          height: 120 + Math.random() * 60
        },
        zone: zone
      });
    }
    
    // Occasionally detect vehicles
    if (Math.random() > 0.8) {
      detections.push({
        class: 'vehicle',
        confidence: 0.82,
        bounding_box: {
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          width: 200 + Math.random() * 100,
          height: 150 + Math.random() * 50
        },
        zone: zone
      });
    }
    
    return detections;
  }
  
  async checkForAlerts() {
    const crowdData = await CrowdData.find({ 
      timestamp: { $gte: new Date(Date.now() - 60000) } // Last minute
    });
    
    const alerts = [];
    
    crowdData.forEach(zone => {
      if (zone.current_density > 85) {
        alerts.push({
          id: `ALERT_${Date.now()}_${zone.zone_id}`,
          type: 'crowd_congestion',
          severity: zone.current_density > 95 ? 'critical' : 'high',
          zone: zone.zone_id,
          message: `High crowd density (${zone.current_density}%) in ${zone.zone_id}`,
          timestamp: new Date()
        });
      }
      
      if (zone.bottleneck_risk > 0.7) {
        alerts.push({
          id: `ALERT_${Date.now()}_BOTTLENECK_${zone.zone_id}`,
          type: 'bottleneck_risk',
          severity: 'high',
          zone: zone.zone_id,
          message: `Bottleneck risk detected in ${zone.zone_id}`,
          timestamp: new Date()
        });
      }
    });
    
    return alerts;
  }
  
  // Methods to be called from API routes
  broadcastAlert(alert) {
    this.io.to('authority').emit('new-alert', alert);
  }
  
  broadcastZoneUpdate(zoneId, data) {
    this.io.to(`zone-${zoneId}`).emit('zone-update', data);
  }
  
  broadcastSystemUpdate(data) {
    this.io.emit('system-update', data);
  }
}

module.exports = RealTimeService;