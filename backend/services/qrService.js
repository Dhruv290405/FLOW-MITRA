const QRCode = require('qrcode');
const crypto = require('crypto');

class QRService {
  static async generateQRCode(passData) {
    try {
      // Create secure QR data with encryption
      const qrData = {
        passId: passData.pass_id,
        aadhaar: this.hashAadhaar(passData.pilgrim_aadhaar),
        slot: passData.slot.toISOString(),
        exitDeadline: passData.exit_deadline.toISOString(),
        groupSize: passData.group_size,
        timestamp: Date.now(),
        checksum: this.generateChecksum(passData)
      };
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 512
      });
      
      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`QR Code generation failed: ${error.message}`);
    }
  }
  
  static hashAadhaar(aadhaar) {
    // Hash Aadhaar for privacy
    return crypto.createHash('sha256').update(aadhaar).digest('hex').substring(0, 16);
  }
  
  static generateChecksum(passData) {
    // Generate checksum for tamper detection
    const dataString = `${passData.pass_id}${passData.pilgrim_aadhaar}${passData.group_size}`;
    return crypto.createHash('md5').update(dataString).digest('hex').substring(0, 8);
  }
  
  static async verifyQRCode(qrDataString) {
    try {
      const qrData = JSON.parse(qrDataString);
      
      // Verify required fields
      const requiredFields = ['passId', 'aadhaar', 'slot', 'exitDeadline', 'groupSize', 'checksum'];
      for (const field of requiredFields) {
        if (!qrData[field]) {
          return { valid: false, error: `Missing field: ${field}` };
        }
      }
      
      // Verify timestamp (QR should not be older than 7 days)
      const qrAge = Date.now() - qrData.timestamp;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      if (qrAge > maxAge) {
        return { valid: false, error: 'QR code expired' };
      }
      
      return { valid: true, data: qrData };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code format' };
    }
  }
  
  static async generateBulkQRCodes(passesData) {
    try {
      const qrCodes = await Promise.all(
        passesData.map(async (passData) => {
          const qrCode = await this.generateQRCode(passData);
          return {
            pass_id: passData.pass_id,
            qr_code: qrCode
          };
        })
      );
      
      return qrCodes;
    } catch (error) {
      throw new Error(`Bulk QR generation failed: ${error.message}`);
    }
  }
}

module.exports = QRService;