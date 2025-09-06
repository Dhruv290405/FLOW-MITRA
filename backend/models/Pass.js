const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  pass_id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  qr_code: { 
    type: String, 
    required: true 
  },
  slot: { 
    type: Date, 
    required: true 
  },
  exit_deadline: { 
    type: Date, 
    required: true 
  },
  group_size: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 10 
  },
  pilgrim_aadhaar: { 
    type: String, 
    required: true,
    match: /^\d{12}$/
  },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'used', 'cancelled'], 
    default: 'active',
    index: true
  },
  entry_scans: [{
    scanned_at: { type: Date, required: true },
    scanner_id: { type: String, required: true },
    zone: { type: String, required: true }
  }],
  exit_scans: [{
    scanned_at: { type: Date, required: true },
    scanner_id: { type: String, required: true },
    zone: { type: String, required: true }
  }],
  extensions: [{
    extended_at: { type: Date, required: true },
    additional_hours: { type: Number, required: true },
    cost: { type: Number, required: true },
    new_deadline: { type: Date, required: true },
    tent_booked: { type: Boolean, default: false }
  }],
  pricing: {
    base_price: { type: Number, required: true, default: 50 },
    surge_multiplier: { type: Number, default: 1.0 },
    final_price: { type: Number, required: true }
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updated_at field before saving
passSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Calculate final price based on surge pricing
passSchema.pre('save', function(next) {
  if (this.pricing && this.pricing.base_price && this.pricing.surge_multiplier) {
    this.pricing.final_price = Math.round(this.pricing.base_price * this.pricing.surge_multiplier);
  }
  next();
});

// Indexes for better performance
passSchema.index({ pass_id: 1 });
passSchema.index({ pilgrim_aadhaar: 1 });
passSchema.index({ status: 1 });
passSchema.index({ slot: 1 });
passSchema.index({ exit_deadline: 1 });
passSchema.index({ created_at: -1 });

module.exports = mongoose.model('Pass', passSchema);