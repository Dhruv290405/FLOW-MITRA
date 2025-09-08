// Mock YOLO v8n integration for crowd counting

// Mock camera feeds for different zones
export const getCameraFeeds = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const feeds = [
        {
          id: 'CAM_001',
          zoneId: 'zone_1',
          zoneName: 'Sangam Ghat',
          cameraName: 'Main Entry Camera 1',
          location: 'North Gate',
          status: 'active',
          personCount: Math.floor(Math.random() * 500) + 100,
          confidence: 0.92,
          lastUpdate: new Date(),
          bufferZoneAlert: Math.random() > 0.8
        },
        {
          id: 'CAM_002',
          zoneId: 'zone_1',
          zoneName: 'Sangam Ghat',
          cameraName: 'Bathing Area Camera 2',
          location: 'Central Bathing Area',
          status: 'active',
          personCount: Math.floor(Math.random() * 800) + 200,
          confidence: 0.89,
          lastUpdate: new Date(),
          bufferZoneAlert: Math.random() > 0.7
        },
        {
          id: 'CAM_003',
          zoneId: 'zone_2',
          zoneName: 'Akshayavat',
          cameraName: 'Tree Area Monitor',
          location: 'Sacred Tree Vicinity',
          status: 'active',
          personCount: Math.floor(Math.random() * 300) + 50,
          confidence: 0.95,
          lastUpdate: new Date(),
          bufferZoneAlert: false
        },
        {
          id: 'CAM_004',
          zoneId: 'zone_3',
          zoneName: 'Hanuman Temple',
          cameraName: 'Temple Entry Camera',
          location: 'Temple Main Entrance',
          status: 'active',
          personCount: Math.floor(Math.random() * 400) + 75,
          confidence: 0.87,
          lastUpdate: new Date(),
          bufferZoneAlert: Math.random() > 0.9
        },
        {
          id: 'CAM_005',
          zoneId: 'zone_4',
          zoneName: 'Saraswati Ghat',
          cameraName: 'Ghat Overview Camera',
          location: 'Ghat Platform',
          status: 'inactive',
          personCount: 0,
          confidence: 0,
          lastUpdate: new Date(Date.now() - 10 * 60 * 1000),
          bufferZoneAlert: false
        }
      ];
      resolve(feeds);
    }, 800);
  });
};

// Mock YOLO v8n person detection
export const detectPersons = async (cameraId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const detections = [];
      const personCount = Math.floor(Math.random() * 20) + 5;
      
      for (let i = 0; i < personCount; i++) {
        detections.push({
          id: `DETECT_${Date.now()}_${i}`,
          cameraId,
          boundingBox: {
            x: Math.floor(Math.random() * 800),
            y: Math.floor(Math.random() * 600),
            width: Math.floor(Math.random() * 100) + 50,
            height: Math.floor(Math.random() * 150) + 100
          },
          confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
          timestamp: new Date()
        });
      }
      
      resolve(detections);
    }, 1500);
  });
};

// AI-powered crowd analytics and predictions
export const getCrowdAnalytics = async (zoneId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalPeople = Math.floor(Math.random() * 1000) + 200;
      const bufferZoneCount = Math.floor(totalPeople * 0.15); // 15% in buffer zone
      const criticalAreas = [];
      
      // Determine critical areas based on crowd density
      if (totalPeople > 800) {
        criticalAreas.push('Main Bathing Area', 'North Entrance');
      }
      if (bufferZoneCount > 100) {
        criticalAreas.push('Buffer Zone Overflow');
      }
      
      const riskLevel = 
        totalPeople > 900 ? 'critical' :
        totalPeople > 700 ? 'high' :
        totalPeople > 400 ? 'medium' : 'low';
      
      const analytics = {
        zoneId,
        totalPeople,
        averageConfidence: 0.91,
        bufferZoneCount,
        criticalAreas,
        predictions: {
          nextHourCount: totalPeople + Math.floor(Math.random() * 200) - 100,
          peakTime: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000), // Next 4 hours
          riskLevel
        }
      };
      
      resolve(analytics);
    }, 1200);
  });
};

// Buffer zone monitoring
export const getBufferZoneAlerts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alerts = [
        {
          id: 'BUFFER_001',
          zoneId: 'zone_1',
          zoneName: 'Sangam Ghat',
          cameraId: 'CAM_001',
          personCount: 156,
          threshold: 150,
          severity: 'medium',
          message: 'Buffer zone approaching capacity limit',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: 'BUFFER_002',
          zoneId: 'zone_2',
          zoneName: 'Akshayavat',
          cameraId: 'CAM_003',
          personCount: 89,
          threshold: 100,
          severity: 'low',
          message: 'Buffer zone within normal limits',
          timestamp: new Date()
        }
      ];
      resolve(alerts);
    }, 600);
  });
};