const mongoose = require('mongoose');

const iotLogSchema = new mongoose.Schema({
  zone_id: { 
    type: String, 
    required: true,
    index: true
  },
  sensor_type: { 
    type: String, 
    required: true,
    enum: ['people_counter', 'rfid_reader', 'qr_scanner', 'thermal_camera', 'sound_monitor']
  },
  sensor_id: { 
    type: String, 
    required: true,
    index: true
  },
  data: {
    count: Number,
    temperature: Number,
    sound_level: Number,
    qr_code: String,
    rfid_tag: String,
    yolo_detections: [{
      class: {
        type: String,
        enum: ['person', 'vehicle', 'baggage']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      bounding_box: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }]
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'error'], 
    default: 'active',
    index: true
  },
  battery_level: {
    type: Number,
    min: 0,
    max: 100
  },
  connectivity: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Indexes for performance
iotLogSchema.index({ sensor_id: 1, timestamp: -1 });
iotLogSchema.index({ zone_id: 1, timestamp: -1 });
iotLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('IoTLog', iotLogSchema);