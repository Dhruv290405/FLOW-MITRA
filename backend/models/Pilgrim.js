const mongoose = require('mongoose');

const pilgrimSchema = new mongoose.Schema({
  aadhaar_no: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^\d{12}$/
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  mobile: { 
    type: String, 
    required: true,
    match: /^[6-9]\d{9}$/
  },
  family_members: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    aadhaar_no: {
      type: String,
      required: true,
      match: /^\d{12}$/
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120
    },
    relation: {
      type: String,
      required: true,
      enum: ['spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other']
    }
  }],
  pass_id: { 
    type: String, 
    required: true,
    index: true
  },
  slot_time: { 
    type: Date, 
    required: true 
  },
  exit_time: { 
    type: Date 
  },
  penalty_status: { 
    has_penalty: { 
      type: Boolean, 
      default: false 
    },
    amount: { 
      type: Number, 
      default: 0,
      min: 0
    },
    paid: { 
      type: Boolean, 
      default: false 
    },
    payment_date: {
      type: Date
    }
  },
  bank_account: { 
    type: String,
    required: true
  },
  verification_status: {
    aadhaar_verified: {
      type: Boolean,
      default: false
    },
    mobile_verified: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'hi', 'bn', 'te', 'ta', 'gu', 'mr', 'kn', 'ml', 'or'],
      default: 'hi'
    },
    notifications: {
      sms: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: false
      }
    }
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
pilgrimSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for better performance
pilgrimSchema.index({ aadhaar_no: 1 });
pilgrimSchema.index({ pass_id: 1 });
pilgrimSchema.index({ mobile: 1 });
pilgrimSchema.index({ created_at: -1 });

module.exports = mongoose.model('Pilgrim', pilgrimSchema);