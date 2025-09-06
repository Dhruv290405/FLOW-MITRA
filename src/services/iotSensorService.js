export interface IoTSensor {
  sensorId: string;
  type: 'people_counter' | 'rfid_reader' | 'qr_scanner' | 'thermal_camera' | 'sound_monitor';
  location: string;
  zone: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastReading: Date;
  batteryLevel?: number;
  connectivity: 'online' | 'offline';
}

export interface SensorReading {
  sensorId: string;
  timestamp: Date;
  data: {
    count?: number;
    temperature?: number;
    soundLevel?: number;
    qrCode?: string;
    rfidTag?: string;
    yoloDetections?: YOLODetection[];
  };
  confidence: number;
}

export interface YOLODetection {
  class: 'person' | 'vehicle' | 'baggage';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  zone: string;
}

export interface RealTimeData {
  zoneId: string;
  currentCount: number;
  entryRate: number; // people per minute
  exitRate: number;
  avgDwellTime: number; // minutes
  alerts: string[];
  sensorHealth: number; // percentage of sensors online
  lastUpdated: Date;
}

// Mock IoT sensor network simulation
export class IoTSensorManager {
  private sensors: Map<string, IoTSensor> = new Map();
  private realtimeData: Map<string, RealTimeData> = new Map();
  private dataStream: NodeJS.Timeout | null = null;
  
  constructor() {
    this.initializeSensors();
    this.startDataStreaming();
  }
  
  private initializeSensors() {
    const sensorConfigs = [
      { id: 'COUNTER_001', type: 'people_counter', location: 'Entry_Gate_1', zone: 'Zone_A' },
      { id: 'COUNTER_002', type: 'people_counter', location: 'Entry_Gate_2', zone: 'Zone_B' },
      { id: 'RFID_001', type: 'rfid_reader', location: 'Checkpoint_1', zone: 'Zone_A' },
      { id: 'QR_001', type: 'qr_scanner', location: 'Digital_Gate_1', zone: 'Zone_B' },
      { id: 'THERMAL_001', type: 'thermal_camera', location: 'Buffer_Zone_1', zone: 'Buffer_1' },
      { id: 'SOUND_001', type: 'sound_monitor', location: 'Main_Area', zone: 'Zone_C' },
      { id: 'YOLO_CAM_001', type: 'thermal_camera', location: 'Crowd_Monitor_1', zone: 'Buffer_1' },
      { id: 'YOLO_CAM_002', type: 'thermal_camera', location: 'Crowd_Monitor_2', zone: 'Buffer_2' },
    ];
    
    sensorConfigs.forEach(config => {
      this.sensors.set(config.id, {
        sensorId: config.id,
        type: config.type as any,
        location: config.location,
        zone: config.zone,
        status: Math.random() > 0.1 ? 'active' : 'maintenance', // 90% active
        lastReading: new Date(),
        batteryLevel: Math.floor(Math.random() * 100),
        connectivity: Math.random() > 0.05 ? 'online' : 'offline' // 95% online
      });
    });
  }
  
  private startDataStreaming() {
    // Simulate real-time data streaming every 2 seconds
    this.dataStream = setInterval(() => {
      this.updateRealTimeData();
    }, 2000);
  }
  
  private updateRealTimeData() {
    const zones = ['Zone_A', 'Zone_B', 'Zone_C', 'Zone_D', 'Buffer_1', 'Buffer_2'];
    
    zones.forEach(zoneId => {
      const zoneSensors = Array.from(this.sensors.values()).filter(s => s.zone === zoneId);
      const activeSensors = zoneSensors.filter(s => s.status === 'active' && s.connectivity === 'online');
      
      const currentCount = Math.floor(Math.random() * 200) + 50;
      const entryRate = Math.random() * 15 + 5; // 5-20 people per minute
      const exitRate = Math.random() * 12 + 3; // 3-15 people per minute
      const avgDwellTime = Math.random() * 60 + 30; // 30-90 minutes
      
      const alerts = [];
      if (currentCount > 180) alerts.push('High density detected');
      if (entryRate > exitRate * 2) alerts.push('Entry bottleneck forming');
      if (activeSensors.length < zoneSensors.length * 0.8) alerts.push('Sensor connectivity issues');
      
      this.realtimeData.set(zoneId, {
        zoneId,
        currentCount,
        entryRate: Math.round(entryRate * 10) / 10,
        exitRate: Math.round(exitRate * 10) / 10,
        avgDwellTime: Math.round(avgDwellTime),
        alerts,
        sensorHealth: Math.round((activeSensors.length / zoneSensors.length) * 100),
        lastUpdated: new Date()
      });
    });
  }
  
  async getSensorReadings(sensorId: string): Promise<SensorReading[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sensor = this.sensors.get(sensorId);
        if (!sensor) {
          resolve([]);
          return;
        }
        
        const readings: SensorReading[] = [];
        const currentTime = new Date();
        
        // Generate mock readings for the last hour
        for (let i = 0; i < 12; i++) {
          const timestamp = new Date(currentTime.getTime() - i * 5 * 60 * 1000); // Every 5 minutes
          
          let data: any = {};
          let confidence = 0.85 + Math.random() * 0.1;
          
          switch (sensor.type) {
            case 'people_counter':
              data.count = Math.floor(Math.random() * 30) + 5;
              break;
            case 'thermal_camera':
              data.temperature = 25 + Math.random() * 10;
              // YOLO v8n detections simulation
              data.yoloDetections = this.generateYOLODetections(sensor.zone);
              break;
            case 'sound_monitor':
              data.soundLevel = 40 + Math.random() * 40; // dB
              break;
            case 'qr_scanner':
              data.qrCode = Math.random() > 0.7 ? `QR_${Math.random().toString(36).substr(2, 8)}` : undefined;
              break;
            case 'rfid_reader':
              data.rfidTag = Math.random() > 0.8 ? `RFID_${Math.random().toString(36).substr(2, 6)}` : undefined;
              break;
          }
          
          readings.push({
            sensorId,
            timestamp,
            data,
            confidence
          });
        }
        
        resolve(readings.reverse());
      }, 300);
    });
  }
  
  private generateYOLODetections(zone: string): YOLODetection[] {
    const detections: YOLODetection[] = [];
    const numPeople = Math.floor(Math.random() * 15) + 5; // 5-20 people detected
    
    for (let i = 0; i < numPeople; i++) {
      detections.push({
        class: 'person',
        confidence: 0.75 + Math.random() * 0.2,
        boundingBox: {
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          width: 60 + Math.random() * 40,
          height: 120 + Math.random() * 60
        },
        zone
      });
    }
    
    // Occasionally detect vehicles or baggage
    if (Math.random() > 0.8) {
      detections.push({
        class: 'vehicle',
        confidence: 0.82,
        boundingBox: {
          x: Math.random() * 1920,
          y: Math.random() * 1080,
          width: 200 + Math.random() * 100,
          height: 150 + Math.random() * 50
        },
        zone
      });
    }
    
    return detections;
  }
  
  async getRealTimeData(): Promise<RealTimeData[]> {
    return Array.from(this.realtimeData.values());
  }
  
  async getSensorStatus(): Promise<IoTSensor[]> {
    return Array.from(this.sensors.values());
  }
  
  async updateSensorStatus(sensorId: string, status: IoTSensor['status']): Promise<boolean> {
    const sensor = this.sensors.get(sensorId);
    if (sensor) {
      sensor.status = status;
      sensor.lastReading = new Date();
      return true;
    }
    return false;
  }
  
  stopDataStreaming() {
    if (this.dataStream) {
      clearInterval(this.dataStream);
      this.dataStream = null;
    }
  }
}

// Global IoT manager instance
export const iotSensorManager = new IoTSensorManager();