const mongoose = require('mongoose');

const crowdDataSchema = new mongoose.Schema({
  zone_id: { 
    type: String, 
    required: true,
    index: true
  },
  current_density: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  predicted_density: { 
    type: Number,
    min: 0,
    max: 100
  },
  flow_direction: { 
    type: String, 
    enum: ['in', 'out', 'stable'],
    default: 'stable'
  },
  bottleneck_risk: { 
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  ai_recommendations: [{
    type: String
  }],
  entry_rate: {
    type: Number,
    default: 0
  },
  exit_rate: {
    type: Number,
    default: 0
  },
  avg_dwell_time: {
    type: Number,
    default: 0
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Indexes for performance
crowdDataSchema.index({ zone_id: 1, timestamp: -1 });
crowdDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('CrowdData', crowdDataSchema);