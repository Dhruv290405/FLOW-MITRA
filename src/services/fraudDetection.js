// Mock fraud detection system
export const validateAadhaar = async (aadhaar) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate Aadhaar validation
      const isValid = /^\d{4}\s?\d{4}\s?\d{4}$/.test(aadhaar.replace(/\s/g, ''));
      const exists = Math.random() > 0.1; // 90% valid Aadhaar numbers
      const previousBookings = Math.floor(Math.random() * 3);
      const riskScore = previousBookings > 1 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3;
      
      resolve({
        isValid,
        exists,
        linkedMobile: exists ? `9${Math.floor(Math.random() * 900000000) + 100000000}` : undefined,
        linkedBank: exists ? `${aadhaar.replace(/\D/g, '').slice(-4)}XXXX` : undefined,
        previousBookings,
        riskScore
      });
    }, 1000);
  });
};

export const checkForDuplicateBookings = async (aadhaar) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alerts = [];
      
      // Simulate duplicate detection
      if (Math.random() > 0.9) {
        alerts.push({
          id: `FRAUD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'duplicate_aadhaar',
          severity: 'high',
          aadhaar,
          details: 'Multiple active passes found for this Aadhaar number',
          timestamp: new Date(),
          resolved: false
        });
      }
      
      // Simulate suspicious activity
      if (Math.random() > 0.95) {
        alerts.push({
          id: `FRAUD_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'suspicious_activity',
          severity: 'medium',
          aadhaar,
          details: 'Rapid booking attempts detected from this Aadhaar',
          timestamp: new Date(),
          resolved: false
        });
      }
      
      resolve(alerts);
    }, 800);
  });
};

export const getFraudAlerts = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alerts = [
        {
          id: 'FRAUD_001',
          type: 'duplicate_aadhaar',
          severity: 'critical',
          aadhaar: '1234-5678-9012',
          details: 'Same Aadhaar used for 5 different passes',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          resolved: false
        },
        {
          id: 'FRAUD_002',
          type: 'multiple_bookings',
          severity: 'high',
          aadhaar: '9876-5432-1098',
          details: 'Multiple group bookings from same device',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          resolved: false
        },
        {
          id: 'FRAUD_003',
          type: 'fake_document',
          severity: 'medium',
          aadhaar: '1111-2222-3333',
          details: 'Invalid Aadhaar format detected',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          resolved: true,
          actionTaken: 'Booking cancelled, user notified'
        }
      ];
      resolve(alerts);
    }, 500);
  });
};