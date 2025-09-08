export const translations = {
  en: {
    // Navigation
    home: 'Home',
    pilgrimPortal: 'Pilgrim Portal',
    authorityDashboard: 'Authority Dashboard',
    login: 'Login',
    logout: 'Logout',
    
    // Landing Page
    heroTitle: 'Smart Crowd Management Solution',
    heroSubtitle: 'For Mahakumbh 2028',
    heroDescription: 'Advanced digital infrastructure ensuring safe and organized pilgrimage experience through AI-powered crowd monitoring, digital passes, and real-time management.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Features
    digitalPass: 'Digital Pass System',
    digitalPassDesc: 'QR code-based entry passes with real-time validation',
    crowdMonitoring: 'Live Crowd Monitoring',
    crowdMonitoringDesc: 'AI-powered density tracking and prediction alerts',
    multiLanguage: 'Multilingual Support',
    multiLanguageDesc: 'Available in English and Hindi with SMS/IVR integration',
    
    // Authentication
    welcomeBack: 'Welcome Back',
    enterMobile: 'Enter your mobile number',
    mobileNumber: 'Mobile Number',
    selectRole: 'Select Role',
    pilgrim: 'Pilgrim',
    authority: 'Authority',
    signIn: 'Sign In',
    
    // Pilgrim Portal
    welcomePilgrim: 'Welcome, Pilgrim',
    bookPass: 'Book New Pass',
    myPasses: 'My Passes',
    penalties: 'Penalties',
    viewPass: 'View Pass',
    downloadPass: 'Download Pass',
    passBooked: 'Pass Successfully Booked!',
    
    // Authority Dashboard
    authorityWelcome: 'Authority Dashboard',
    liveMonitoring: 'Live Crowd Monitoring',
    totalPilgrims: 'Total Pilgrims',
    activeAlerts: 'Active Alerts',
    zoneCapacity: 'Zone Capacity',
    recentEntries: 'Recent Entries',
    
    // Common
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    
    // Pilgrim Portal specific
    passGenerated: 'Pass Generated Successfully',
    addFamilyMembers: 'Please add at least one family member',
    selectTimeSlot: 'Please select a time slot',
    familyMembers: 'Family Members',
    addMember: 'Add Member',
    mainMember: 'Main Member',
    you: 'You',
    fullName: 'Full Name',
    name: 'Name',
    aadhaar: 'Aadhaar Number', 
    age: 'Age',
    relation: 'Relation',
    passId: 'Pass ID',
    groupSize: 'Group Size', 
    members: 'Members',
    slotTime: 'Slot Time',
    exitDeadline: 'Exit Deadline',
    scanQRCode: 'Scan this QR code at entry/exit points',
    downloadPass: 'Download Pass',
    extendPass: 'Extend Pass',
    additionalHours: 'Additional Hours',
    hours: 'Hours',
    bookTent: 'Book Tent City',
    payAndExtend: 'Pay & Extend'
  },
  hi: {
    // Navigation
    home: 'होम',
    pilgrimPortal: 'यात्री पोर्टल',
    authorityDashboard: 'प्राधिकरण डैशबोर्ड',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    
    // Landing Page
    heroTitle: 'स्मार्ट भीड़ प्रबंधन समाधान',
    heroSubtitle: 'महाकुंभ 2028 के लिए',
    heroDescription: 'एआई-संचालित भीड़ निगरानी, डिजिटल पास, और रियल-टाइम प्रबंधन के माध्यम से सुरक्षित और व्यवस्थित तीर्थयात्रा अनुभव सुनिश्चित करने वाला उन्नत डिजिटल ढांचा।',
    getStarted: 'शुरू करें',
    learnMore: 'और जानें',
    
    // Features
    digitalPass: 'डिजिटल पास सिस्टम',
    digitalPassDesc: 'रियल-टाइम सत्यापन के साथ QR कोड-आधारित प्रवेश पास',
    crowdMonitoring: 'लाइव भीड़ निगरानी',
    crowdMonitoringDesc: 'एआई-संचालित घनत्व ट्रैकिंग और भविष्यवाणी अलर्ट',
    multiLanguage: 'बहुभाषी समर्थन',
    multiLanguageDesc: 'एसएमएस/आईवीआर एकीकरण के साथ अंग्रेजी और हिंदी में उपलब्ध',
    
    // Authentication
    welcomeBack: 'वापस स्वागत है',
    enterMobile: 'अपना मोबाइल नंबर दर्ज करें',
    mobileNumber: 'मोबाइल नंबर',
    selectRole: 'भूमिका चुनें',
    pilgrim: 'यात्री',
    authority: 'प्राधिकरण',
    signIn: 'साइन इन करें',
    
    // Pilgrim Portal
    welcomePilgrim: 'स्वागत है, यात्री',
    bookPass: 'नया पास बुक करें',
    myPasses: 'मेरे पास',
    penalties: 'जुर्माना',
    viewPass: 'पास देखें',
    downloadPass: 'पास डाउनलोड करें',
    passBooked: 'पास सफलतापूर्वक बुक हुआ!',
    
    // Authority Dashboard
    authorityWelcome: 'प्राधिकरण डैशबोर्ड',
    liveMonitoring: 'लाइव भीड़ निगरानी',
    totalPilgrims: 'कुल यात्री',
    activeAlerts: 'सक्रिय अलर्ट',
    zoneCapacity: 'क्षेत्र क्षमता',
    recentEntries: 'हाल की प्रविष्टियां',
    
    // Common
    loading: 'लोड हो रहा...',
    error: 'त्रुटि हुई',
    success: 'सफलता',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
  }
};

export const useTranslation = (language) => {
  return (key) => {
    return translations[language][key] || key;
  };
};