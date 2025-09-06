const twilio = require('twilio');
const axios = require('axios');

class SMSService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }
  
  async sendSMS(to, message, language = 'en') {
    try {
      // Translate message if needed
      const translatedMessage = await this.translateMessage(message, language);
      
      const result = await this.client.messages.create({
        body: translatedMessage,
        from: this.fromNumber,
        to: `+91${to}`
      });
      
      console.log(`SMS sent successfully: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  async sendBulkSMS(recipients, message, language = 'en') {
    try {
      const translatedMessage = await this.translateMessage(message, language);
      
      const results = await Promise.allSettled(
        recipients.map(recipient => 
          this.client.messages.create({
            body: translatedMessage,
            from: this.fromNumber,
            to: `+91${recipient.mobile}`
          })
        )
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.length - successful;
      
      return {
        total: results.length,
        successful,
        failed,
        results: results
      };
    } catch (error) {
      throw new Error(`Bulk SMS failed: ${error.message}`);
    }
  }
  
  async translateMessage(message, targetLanguage) {
    if (targetLanguage === 'en') return message;
    
    try {
      // Use Google Translate API or mock translation
      if (process.env.GOOGLE_TRANSLATE_API_KEY) {
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
          {
            q: message,
            target: targetLanguage,
            source: 'en'
          }
        );
        
        return response.data.data.translations[0].translatedText;
      } else {
        // Mock translation for demo
        return this.mockTranslate(message, targetLanguage);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      return message; // Return original message if translation fails
    }
  }
  
  mockTranslate(message, language) {
    const translations = {
      'hi': {
        'Your pass has been generated successfully': 'आपका पास सफलतापूर्वक बन गया है',
        'Please exit before deadline to avoid penalty': 'जुर्माने से बचने के लिए कृपया समय सीमा से पहले निकलें',
        'Penalty applied for late exit': 'देर से निकलने के लिए जुर्माना लगाया गया',
        'High crowd density in your zone': 'आपके क्षेत्र में भीड़ का घनत्व अधिक है',
        'Extension approved for your pass': 'आपके पास का विस्तार स्वीकृत'
      }
    };
    
    return translations[language]?.[message] || message;
  }
  
  // Predefined SMS templates
  getTemplate(templateType, data = {}) {
    const templates = {
      PASS_GENERATED: {
        en: `Mahakumbh 2028: Your digital pass ${data.passId} has been generated. Entry slot: ${data.slotTime}. Exit deadline: ${data.exitDeadline}. Download: ${data.downloadUrl}`,
        hi: `महाकुम्भ 2028: आपका डिजिटल पास ${data.passId} बन गया है। प्रवेश समय: ${data.slotTime}। निकासी की अंतिम तिथि: ${data.exitDeadline}`
      },
      PENALTY_WARNING: {
        en: `Mahakumbh 2028: Your pass expires in 2 hours. Please exit to avoid penalty of ₹500/hour. Current time: ${new Date().toLocaleString()}`,
        hi: `महाकुम्भ 2028: आपका पास 2 घंटे में समाप्त हो जाएगा। ₹500/घंटा जुर्माना से बचने के लिए कृपया निकलें`
      },
      PENALTY_APPLIED: {
        en: `Mahakumbh 2028: Penalty of ₹${data.amount} applied for late exit. Pay online or at counter. Pass ID: ${data.passId}`,
        hi: `महाकुम्भ 2028: देर से निकलने के लिए ₹${data.amount} जुर्माना लगाया गया। ऑनलाइन या काउंटर पर भुगतान करें`
      },
      CROWD_ALERT: {
        en: `Mahakumbh 2028: High crowd density in ${data.zone}. Consider alternate routes. Current wait time: ${data.waitTime} minutes`,
        hi: `महाकुम्भ 2028: ${data.zone} में अधिक भीड़। वैकल्पिक रास्ते का उपयोग करें। वर्तमान प्रतीक्षा समय: ${data.waitTime} मिनट`
      },
      EXTENSION_APPROVED: {
        en: `Mahakumbh 2028: Extension approved. New exit deadline: ${data.newDeadline}. Amount charged: ₹${data.amount}. Pass ID: ${data.passId}`,
        hi: `महाकुम्भ 2028: विस्तार स्वीकृत। नई निकासी की अंतिम तिथि: ${data.newDeadline}। शुल्क: ₹${data.amount}`
      }
    };
    
    return templates[templateType] || { en: 'Mahakumbh 2028: System notification', hi: 'महाकुम्भ 2028: सिस्टम सूचना' };
  }
  
  async sendTemplatedSMS(mobile, templateType, data = {}, language = 'hi') {
    const template = this.getTemplate(templateType, data);
    const message = template[language] || template.en;
    
    return await this.sendSMS(mobile, message, language);
  }
}

module.exports = new SMSService();