// SMS Templates for different scenarios
const smsTemplates = [
  {
    id: 'penalty_en',
    type: 'penalty',
    language: 'en',
    template: 'MAHAKUMBH ALERT: Penalty of ₹{amount} issued for overstaying. Amount auto-deducted from linked bank account. Pass ID: {passId}. Contact helpline: 1800-XXX-XXXX'
  },
  {
    id: 'penalty_hi',
    type: 'penalty',
    language: 'hi',
    template: 'महाकुंभ अलर्ट: अधिक रुकने के लिए ₹{amount} का जुर्माना। राशि बैंक खाते से काट ली गई। पास ID: {passId}। हेल्पलाइन: 1800-XXX-XXXX'
  },
  {
    id: 'exit_warning_en',
    type: 'exit_warning',
    language: 'en',
    template: 'MAHAKUMBH REMINDER: Your pass expires in 6 hours. Please exit {zoneName} to avoid penalty charges. Pass ID: {passId}'
  },
  {
    id: 'exit_warning_hi',
    type: 'exit_warning',
    language: 'hi',
    template: 'महाकुंभ रिमाइंडर: आपका पास 6 घंटे में समाप्त हो जाएगा। जुर्माने से बचने के लिए {zoneName} से बाहर निकलें। पास ID: {passId}'
  },
  {
    id: 'extension_en',
    type: 'extension',
    language: 'en',
    template: 'MAHAKUMBH: Your tent city extension approved. Additional ₹{amount} charged for {days} days. New exit deadline: {deadline}'
  },
  {
    id: 'extension_hi',
    type: 'extension',
    language: 'hi',
    template: 'महाकुंभ: आपका टेंट सिटी विस्तार स्वीकृत। {days} दिनों के लिए अतिरिक्त ₹{amount} शुल्क। नई समाप्ति तिथि: {deadline}'
  }
];

// Mock SMS service
export const sendSMS = async (
  mobile, 
  templateType, 
  language,
  variables
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template = smsTemplates.find(t => t.type === templateType && t.language === language);
      let message = template?.template || 'Default message';
      
      // Replace variables in template
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, value);
      });
      
      const smsAlert = {
        id: `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        mobile,
        message,
        type: templateType,
        status: Math.random() > 0.95 ? 'failed' : 'sent',
        timestamp: new Date(),
        language
      };
      
      resolve(smsAlert);
    }, 1000);
  });
};

export const getSMSHistory = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const history = [
        {
          id: 'SMS_001',
          mobile: '9876543210',
          message: 'MAHAKUMBH ALERT: Penalty of ₹2500 issued for overstaying.',
          type: 'penalty',
          status: 'delivered',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          language: 'en'
        },
        {
          id: 'SMS_002',
          mobile: '9123456789',
          message: 'महाकुंभ रिमाइंडर: आपका पास 6 घंटे में समाप्त हो जाएगा।',
          type: 'exit_warning',
          status: 'sent',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          language: 'hi'
        },
        {
          id: 'SMS_003',
          mobile: '9988776655',
          message: 'MAHAKUMBH: Your tent city extension approved.',
          type: 'extension',
          status: 'delivered',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          language: 'en'
        }
      ];
      resolve(history);
    }, 500);
  });
};

// IVR System simulation

export const makeIVRCall = async (
  mobile,
  message,
  language
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const statuses = ['completed', 'busy', 'no_answer', 'failed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const call = {
        id: `IVR_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        mobile,
        language,
        message,
        status,
        duration: status === 'completed' ? Math.floor(Math.random() * 120) + 30 : 0,
        timestamp: new Date()
      };
      
      resolve(call);
    }, 2000);
  });
};