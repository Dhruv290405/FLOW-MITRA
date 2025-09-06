const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mahakumbh', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const pilgrimSchema = new mongoose.Schema({
  aadhaar_no: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  family_members: [{
    name: String,
    aadhaar_no: String,
    age: Number,
    relation: String
  }],
  pass_id: { type: String, required: true },
  slot_time: { type: Date, required: true },
  exit_time: { type: Date },
  penalty_status: { 
    has_penalty: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    paid: { type: Boolean, default: false }
  },
  bank_account: { type: String },
  created_at: { type: Date, default: Date.now }
});

const passSchema = new mongoose.Schema({
  pass_id: { type: String, required: true, unique: true },
  qr_code: { type: String, required: true },
  slot: { type: Date, required: true },
  exit_deadline: { type: Date, required: true },
  group_size: { type: Number, required: true, max: 10 },
  pilgrim_aadhaar: { type: String, required: true },
  status: { type: String, enum: ['active', 'expired', 'used', 'cancelled'], default: 'active' },
  scanned_at_entry: { type: Date },
  scanned_at_exit: { type: Date },
  created_at: { type: Date, default: Date.now }
});

const alertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  lang: { type: String, required: true, default: 'en' },
  zone_id: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  time_sent: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' }
});

const iotLogSchema = new mongoose.Schema({
  zone_id: { type: String, required: true },
  sensor_type: { type: String, required: true },
  sensor_id: { type: String, required: true },
  data: {
    count: Number,
    temperature: Number,
    sound_level: Number,
    yolo_detections: [{
      class: String,
      confidence: Number,
      bounding_box: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }]
  },
  status: { type: String, enum: ['active', 'inactive', 'error'], default: 'active' },
  timestamp: { type: Date, default: Date.now }
});

const crowdDataSchema = new mongoose.Schema({
  zone_id: { type: String, required: true },
  current_density: { type: Number, required: true },
  predicted_density: { type: Number },
  flow_direction: { type: String, enum: ['in', 'out', 'stable'] },
  bottleneck_risk: { type: Number },
  ai_recommendations: [String],
  timestamp: { type: Date, default: Date.now }
});

// Models
const Pilgrim = mongoose.model('Pilgrim', pilgrimSchema);
const Pass = mongoose.model('Pass', passSchema);
const Alert = mongoose.model('Alert', alertSchema);
const IoTLog = mongoose.model('IoTLog', iotLogSchema);
const CrowdData = mongoose.model('CrowdData', crowdDataSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'mahakumbh_secret_2028';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Authentication Routes
app.post('/api/auth/pilgrim-login', async (req, res) => {
  try {
    const { aadhaar_no, name } = req.body;
    
    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaar_no)) {
      return res.status(400).json({ error: 'Invalid Aadhaar number format' });
    }
    
    let pilgrim = await Pilgrim.findOne({ aadhaar_no });
    
    if (!pilgrim) {
      // Create new pilgrim record
      pilgrim = new Pilgrim({
        aadhaar_no,
        name,
        mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`, // Mock mobile
        pass_id: '',
        slot_time: new Date(),
        bank_account: `${aadhaar_no.slice(-4)}XXXX`
      });
      await pilgrim.save();
    }
    
    const token = jwt.sign(
      { id: pilgrim._id, aadhaar_no: pilgrim.aadhaar_no, role: 'pilgrim' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: pilgrim._id,
        name: pilgrim.name,
        aadhaar_no: pilgrim.aadhaar_no,
        mobile: pilgrim.mobile,
        role: 'pilgrim'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/authority-login', async (req, res) => {
  try {
    const { aadhaar_no, name } = req.body;
    
    // For demo purposes, any aadhaar starting with '999' is authority
    if (!aadhaar_no.startsWith('999')) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const token = jwt.sign(
      { aadhaar_no, name, role: 'authority' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: { aadhaar_no, name, role: 'authority' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pass Generation Routes
app.post('/api/passes/generate', authenticateToken, async (req, res) => {
  try {
    const { family_members, slot_time, duration_hours = 24 } = req.body;
    
    if (family_members.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 people allowed per pass' });
    }
    
    const passId = `PASS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const slotDate = new Date(slot_time);
    const exitDeadline = new Date(slotDate.getTime() + (duration_hours * 60 * 60 * 1000));
    
    // Generate QR Code
    const qrData = {
      passId,
      aadhaar: req.user.aadhaar_no,
      slot: slotDate.toISOString(),
      exitDeadline: exitDeadline.toISOString(),
      groupSize: family_members.length
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    
    // Create pass record
    const pass = new Pass({
      pass_id: passId,
      qr_code: qrCode,
      slot: slotDate,
      exit_deadline: exitDeadline,
      group_size: family_members.length,
      pilgrim_aadhaar: req.user.aadhaar_no
    });
    
    await pass.save();
    
    // Update pilgrim record
    await Pilgrim.findOneAndUpdate(
      { aadhaar_no: req.user.aadhaar_no },
      {
        family_members,
        pass_id: passId,
        slot_time: slotDate
      }
    );
    
    res.json({
      pass_id: passId,
      qr_code: qrCode,
      slot_time: slotDate,
      exit_deadline: exitDeadline,
      group_size: family_members.length,
      status: 'active'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QR Scanning Routes
app.post('/api/passes/scan', authenticateToken, async (req, res) => {
  try {
    const { qr_data, scan_type } = req.body; // scan_type: 'entry' or 'exit'
    
    const passData = JSON.parse(qr_data);
    const pass = await Pass.findOne({ pass_id: passData.passId });
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }
    
    if (pass.status !== 'active') {
      return res.status(400).json({ error: 'Pass is not active' });
    }
    
    const now = new Date();
    
    if (scan_type === 'entry') {
      if (now > new Date(pass.slot)) {
        return res.status(400).json({ error: 'Entry slot expired' });
      }
      
      pass.scanned_at_entry = now;
      await pass.save();
      
      res.json({ message: 'Entry successful', pass_id: pass.pass_id });
      
    } else if (scan_type === 'exit') {
      pass.scanned_at_exit = now;
      
      // Check if exit is after deadline
      if (now > pass.exit_deadline) {
        const hoursLate = Math.ceil((now - pass.exit_deadline) / (1000 * 60 * 60));
        const penaltyAmount = hoursLate * 500; // ₹500 per hour penalty
        
        // Update pilgrim penalty
        await Pilgrim.findOneAndUpdate(
          { aadhaar_no: pass.pilgrim_aadhaar },
          {
            exit_time: now,
            'penalty_status.has_penalty': true,
            'penalty_status.amount': penaltyAmount
          }
        );
        
        pass.status = 'expired';
        
        res.json({
          message: 'Late exit - penalty applied',
          penalty_amount: penaltyAmount,
          hours_late: hoursLate
        });
      } else {
        await Pilgrim.findOneAndUpdate(
          { aadhaar_no: pass.pilgrim_aadhaar },
          { exit_time: now }
        );
        
        pass.status = 'used';
        res.json({ message: 'Exit successful', pass_id: pass.pass_id });
      }
      
      await pass.save();
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IoT Data Routes
app.post('/api/iot/sensor-data', async (req, res) => {
  try {
    const { zone_id, sensor_type, sensor_id, data } = req.body;
    
    const iotLog = new IoTLog({
      zone_id,
      sensor_type,
      sensor_id,
      data
    });
    
    await iotLog.save();
    
    // Update crowd data based on sensor input
    if (data.count !== undefined) {
      await CrowdData.findOneAndUpdate(
        { zone_id },
        {
          zone_id,
          current_density: Math.min(100, (data.count / 200) * 100), // Normalize to percentage
          timestamp: new Date()
        },
        { upsert: true }
      );
    }
    
    res.json({ message: 'Sensor data received', log_id: iotLog._id });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Data Routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const totalPilgrims = await Pilgrim.countDocuments();
    const activePasses = await Pass.countDocuments({ status: 'active' });
    const totalPenalties = await Pilgrim.aggregate([
      { $match: { 'penalty_status.has_penalty': true } },
      { $group: { _id: null, total: { $sum: '$penalty_status.amount' } } }
    ]);
    
    const crowdData = await CrowdData.find().sort({ timestamp: -1 }).limit(10);
    const recentAlerts = await Alert.find().sort({ time_sent: -1 }).limit(5);
    
    res.json({
      total_pilgrims: totalPilgrims,
      active_passes: activePasses,
      total_penalties: totalPenalties[0]?.total || 0,
      crowd_data: crowdData,
      recent_alerts: recentAlerts
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SMS Alert Routes
app.post('/api/alerts/send', authenticateToken, async (req, res) => {
  try {
    const { type, message, zone_id, lang = 'en' } = req.body;
    
    const alert = new Alert({
      type,
      message,
      lang,
      zone_id
    });
    
    await alert.save();
    
    // Here you would integrate with SMS service (Twilio, etc.)
    // For demo, we'll just log it
    console.log(`SMS Alert: ${message} (${lang}) to zone ${zone_id}`);
    
    alert.status = 'sent';
    await alert.save();
    
    res.json({ message: 'Alert sent successfully', alert_id: alert._id });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Penalty Payment Routes
app.post('/api/payments/penalty', authenticateToken, async (req, res) => {
  try {
    const { aadhaar_no } = req.body;
    
    const pilgrim = await Pilgrim.findOne({ aadhaar_no });
    
    if (!pilgrim || !pilgrim.penalty_status.has_penalty) {
      return res.status(404).json({ error: 'No penalty found' });
    }
    
    // Mock payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate
    
    if (paymentSuccess) {
      pilgrim.penalty_status.paid = true;
      await pilgrim.save();
      
      res.json({
        message: 'Penalty payment successful',
        amount_paid: pilgrim.penalty_status.amount,
        transaction_id: `TXN_${Date.now()}`
      });
    } else {
      res.status(400).json({ error: 'Payment failed. Please try again.' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Extension Requests
app.post('/api/passes/extend', authenticateToken, async (req, res) => {
  try {
    const { pass_id, additional_hours, tent_booking = false } = req.body;
    
    const pass = await Pass.findOne({ pass_id });
    
    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }
    
    const extensionCost = additional_hours * 100; // ₹100 per hour
    const tentCost = tent_booking ? 2000 : 0; // ₹2000 for tent
    const totalCost = extensionCost + tentCost;
    
    // Mock payment processing
    const paymentSuccess = Math.random() > 0.1;
    
    if (paymentSuccess) {
      pass.exit_deadline = new Date(pass.exit_deadline.getTime() + (additional_hours * 60 * 60 * 1000));
      await pass.save();
      
      res.json({
        message: 'Extension successful',
        new_exit_deadline: pass.exit_deadline,
        amount_charged: totalCost,
        tent_booked: tent_booking
      });
    } else {
      res.status(400).json({ error: 'Payment failed for extension' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mahakumbh Backend Server running on port ${PORT}`);
  console.log('MongoDB connected successfully');
});

module.exports = app;