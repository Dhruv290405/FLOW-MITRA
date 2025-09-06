const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async pilgrimLogin(aadhaar_no, name) {
    const response = await this.request('/auth/pilgrim-login', {
      method: 'POST',
      body: JSON.stringify({ aadhaar_no, name })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async authorityLogin(aadhaar_no, name) {
    const response = await this.request('/auth/authority-login', {
      method: 'POST',
      body: JSON.stringify({ aadhaar_no, name })
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Pass methods
  async generatePass(family_members, slot_time, duration_hours = 24) {
    return await this.request('/passes/generate', {
      method: 'POST',
      body: JSON.stringify({ family_members, slot_time, duration_hours })
    });
  }

  async scanPass(qr_data, scan_type) {
    return await this.request('/passes/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_data, scan_type })
    });
  }

  async extendPass(pass_id, additional_hours, tent_booking = false) {
    return await this.request('/passes/extend', {
      method: 'POST',
      body: JSON.stringify({ pass_id, additional_hours, tent_booking })
    });
  }

  // Dashboard methods
  async getDashboardStats() {
    return await this.request('/dashboard/stats');
  }

  // IoT methods
  async sendSensorData(zone_id, sensor_type, sensor_id, data) {
    return await this.request('/iot/sensor-data', {
      method: 'POST',
      body: JSON.stringify({ zone_id, sensor_type, sensor_id, data })
    });
  }

  // Alert methods
  async sendAlert(type, message, zone_id, lang = 'hi') {
    return await this.request('/alerts/send', {
      method: 'POST',
      body: JSON.stringify({ type, message, zone_id, lang })
    });
  }

  // Payment methods
  async payPenalty(aadhaar_no) {
    return await this.request('/payments/penalty', {
      method: 'POST',
      body: JSON.stringify({ aadhaar_no })
    });
  }
}

export default new ApiService();