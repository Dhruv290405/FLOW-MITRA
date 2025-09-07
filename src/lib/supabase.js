import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helpers
export const auth = {
  signUp: async (email, password, metadata = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  },

  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // Users/Pilgrims
  createUser: async (userData) => {
    return await supabase.from('users').insert(userData).select().single()
  },

  getUser: async (id) => {
    return await supabase.from('users').select('*').eq('id', id).single()
  },

  getUserByAadhaar: async (aadhaar) => {
    return await supabase.from('users').select('*').eq('aadhaar_number', aadhaar).single()
  },

  updateUser: async (id, updates) => {
    return await supabase.from('users').update(updates).eq('id', id).select().single()
  },

  // Passes
  createPass: async (passData) => {
    return await supabase.from('passes').insert(passData).select().single()
  },

  getPass: async (passId) => {
    return await supabase.from('passes').select('*, users(*)').eq('pass_id', passId).single()
  },

  getUserPasses: async (userId) => {
    return await supabase.from('passes').select('*').eq('user_id', userId)
  },

  updatePass: async (id, updates) => {
    return await supabase.from('passes').update(updates).eq('id', id).select().single()
  },

  // Zones
  getZones: async () => {
    return await supabase.from('zones').select('*')
  },

  getZoneById: async (id) => {
    return await supabase.from('zones').select('*').eq('id', id).single()
  },

  updateZone: async (id, updates) => {
    return await supabase.from('zones').update(updates).eq('id', id).select().single()
  },

  // Crowd Data
  getCrowdData: async (zoneId = null) => {
    let query = supabase.from('crowd_data').select('*, zones(*)')
    if (zoneId) {
      query = query.eq('zone_id', zoneId)
    }
    return await query.order('created_at', { ascending: false })
  },

  createCrowdData: async (data) => {
    return await supabase.from('crowd_data').insert(data).select().single()
  },

  // IoT Logs
  createIoTLog: async (logData) => {
    return await supabase.from('iot_logs').insert(logData).select().single()
  },

  getIoTLogs: async (zoneId = null, limit = 50) => {
    let query = supabase.from('iot_logs').select('*')
    if (zoneId) {
      query = query.eq('zone_id', zoneId)
    }
    return await query.order('created_at', { ascending: false }).limit(limit)
  },

  // Alerts
  createAlert: async (alertData) => {
    return await supabase.from('alerts').insert(alertData).select().single()
  },

  getAlerts: async (zoneId = null) => {
    let query = supabase.from('alerts').select('*, zones(*)')
    if (zoneId) {
      query = query.eq('zone_id', zoneId)
    }
    return await query.order('created_at', { ascending: false })
  },

  // Penalties
  getUserPenalties: async (userId) => {
    return await supabase.from('penalties').select('*, passes(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  createPenalty: async (penaltyData) => {
    return await supabase.from('penalties').insert(penaltyData).select().single()
  },

  // Extensions
  createExtension: async (extensionData) => {
    return await supabase.from('extensions').insert(extensionData).select().single()
  },

  getUserExtensions: async (userId) => {
    return await supabase.from('extensions').select('*, passes(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  }
}

// Edge Functions
export const edgeFunctions = {
  // Crowd Management
  predictCrowdDensity: async (zoneId) => {
    return await supabase.functions.invoke('crowd-management', {
      body: { action: 'predict_crowd_density', data: { zone_id: zoneId } }
    })
  },

  detectBottleneck: async (zoneIds) => {
    return await supabase.functions.invoke('crowd-management', {
      body: { action: 'detect_bottleneck', data: { zone_ids: zoneIds } }
    })
  },

  getOptimalRoute: async (fromZone, toZone, groupSize) => {
    return await supabase.functions.invoke('crowd-management', {
      body: { 
        action: 'route_optimization', 
        data: { from_zone: fromZone, to_zone: toZone, group_size: groupSize } 
      }
    })
  },

  sendAlert: async (zoneId, message, severity, language = 'hi') => {
    return await supabase.functions.invoke('crowd-management', {
      body: { 
        action: 'send_alert', 
        data: { zone_id: zoneId, message, severity, language } 
      }
    })
  },

  // Pass Generation
  verifyAadhaar: async (aadhaarNumber) => {
    return await supabase.functions.invoke('pass-generation', {
      body: { action: 'verify_aadhaar', data: { aadhaar_number: aadhaarNumber } }
    })
  },

  generatePass: async (userData) => {
    return await supabase.functions.invoke('pass-generation', {
      body: { action: 'generate_pass', data: userData }
    })
  },

  scanQR: async (qrData, scanType, zoneId) => {
    return await supabase.functions.invoke('pass-generation', {
      body: { 
        action: 'scan_qr', 
        data: { qr_data: qrData, scan_type: scanType, zone_id: zoneId } 
      }
    })
  },

  extendPass: async (passId, additionalHours, tentBooking = false) => {
    return await supabase.functions.invoke('pass-generation', {
      body: { 
        action: 'extend_pass', 
        data: { pass_id: passId, additional_hours: additionalHours, tent_booking: tentBooking } 
      }
    })
  }
}

// Real-time subscriptions
export const subscriptions = {
  subscribeToCrowdData: (callback) => {
    return supabase
      .channel('crowd_data_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crowd_data' }, 
        callback
      )
      .subscribe()
  },

  subscribeToAlerts: (callback) => {
    return supabase
      .channel('alerts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alerts' }, 
        callback
      )
      .subscribe()
  },

  subscribeToZoneUpdates: (callback) => {
    return supabase
      .channel('zones_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'zones' }, 
        callback
      )
      .subscribe()
  }
}