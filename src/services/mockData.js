// Mock data service for the prototype

export interface CrowdData {
  zoneId: string;
  zoneName: string;
  currentCount: number;
  maxCapacity: number;
  density: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface GroupMember {
  aadhaar: string;
  name: string;
  age?: number;
  relation?: string;
}

export interface Pass {
  id: string;
  userId: string;
  zoneId: string;
  zoneName: string;
  entryTime: Date;
  exitDeadline: Date;
  exitTime?: Date;
  status: 'active' | 'used' | 'expired' | 'overstay';
  qrCode: string;
  groupSize: number;
  groupMembers: GroupMember[];
  tentCityDays?: number;
  extraCharges?: number;
}

export interface Alert {
  id: string;
  zoneId: string;
  zoneName: string;
  type: 'capacity' | 'emergency' | 'fraud' | 'system';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

export interface Penalty {
  id: string;
  userId: string;
  passId: string;
  amount: number;
  reason: string;
  dateIssued: Date;
  status: 'pending' | 'paid' | 'auto_deducted';
  smsAlertSent: boolean;
  overstayHours: number;
}

// Mock zones for Mahakumbh
export const mockZones: CrowdData[] = [
  {
    zoneId: 'zone_1',
    zoneName: 'Sangam Ghat',
    currentCount: 12500,
    maxCapacity: 15000,
    density: 83.3,
    status: 'warning',
    lastUpdated: new Date(),
  },
  {
    zoneId: 'zone_2',
    zoneName: 'Akshaya Vat',
    currentCount: 8200,
    maxCapacity: 10000,
    density: 82.0,
    status: 'warning',
    lastUpdated: new Date(),
  },
  {
    zoneId: 'zone_3',
    zoneName: 'Hanuman Temple',
    currentCount: 5600,
    maxCapacity: 8000,
    density: 70.0,
    status: 'normal',
    lastUpdated: new Date(),
  },
  {
    zoneId: 'zone_4',
    zoneName: 'Patalpuri Temple',
    currentCount: 2800,
    maxCapacity: 5000,
    density: 56.0,
    status: 'normal',
    lastUpdated: new Date(),
  },
  {
    zoneId: 'zone_5',
    zoneName: 'Saraswati Koop',
    currentCount: 9400,
    maxCapacity: 10000,
    density: 94.0,
    status: 'critical',
    lastUpdated: new Date(),
  },
];

// Generate random crowd data updates
export const generateLiveCrowdData = (): CrowdData[] => {
  return mockZones.map(zone => {
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const newCount = Math.max(0, Math.min(zone.maxCapacity, 
      Math.floor(zone.currentCount * (1 + variation))
    ));
    const newDensity = (newCount / zone.maxCapacity) * 100;
    
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (newDensity >= 90) status = 'critical';
    else if (newDensity >= 75) status = 'warning';
    
    return {
      ...zone,
      currentCount: newCount,
      density: newDensity,
      status,
      lastUpdated: new Date(),
    };
  });
};

// Mock alerts
export const generateMockAlerts = (): Alert[] => {
  const alertMessages = [
    'Zone 5 nearing capacity - consider redirecting pilgrims',
    'Unusual crowd pattern detected in Sangam Ghat',
    'Weather alert: Strong winds expected in 2 hours',
    'Emergency exit blocked in Zone 3 - maintenance required',
    'Multiple failed QR scans detected - possible fraud attempt',
  ];

  return alertMessages.map((message, index) => ({
    id: `alert_${Date.now()}_${index}`,
    zoneId: mockZones[index % mockZones.length].zoneId,
    zoneName: mockZones[index % mockZones.length].zoneName,
    type: ['capacity', 'emergency', 'fraud', 'system'][index % 4] as any,
    message,
    severity: ['high', 'critical', 'medium', 'low'][index % 4] as any,
    timestamp: new Date(Date.now() - Math.random() * 3600000),
    resolved: Math.random() > 0.7,
  }));
};

// Generate QR code data
export const generateQRCode = (passId: string): string => {
  return `MAHAKUMBH2028_${passId}_${Date.now()}`;
};

// Mock pass generation
export let mockPasses: Pass[] = [];

export const generatePass = (
  userId: string, 
  zoneId: string, 
  zoneName: string, 
  groupMembers: GroupMember[],
  tentCityDays?: number
): Pass => {
  const now = new Date();
  const exitDeadline = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // 3 days default
  const passId = `PASS_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const pass: Pass = {
    id: passId,
    userId,
    zoneId,
    zoneName,
    entryTime: now,
    exitDeadline,
    status: 'active',
    qrCode: generateQRCode(passId),
    groupSize: groupMembers.length,
    groupMembers,
    tentCityDays,
    extraCharges: tentCityDays ? tentCityDays * 500 * groupMembers.length : 0
  };
  
  mockPasses.push(pass);
  return pass;
};

// Mock penalties
export const mockPenalties: Penalty[] = [
  {
    id: 'penalty_1',
    userId: 'user_123',
    passId: 'PASS_001',
    amount: 2500,
    reason: 'Overstaying beyond 72-hour deadline',
    status: 'pending',
    dateIssued: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    smsAlertSent: true,
    overstayHours: 24
  },
  {
    id: 'penalty_2',
    userId: 'user_456',
    passId: 'PASS_002',
    amount: 1000,
    reason: 'Extended tent city stay (2 extra days)',
    status: 'auto_deducted',
    dateIssued: new Date(Date.now() - 48 * 60 * 60 * 1000),
    smsAlertSent: true,
    overstayHours: 0
  }
];

// Service functions
export const getCrowdData = (): Promise<CrowdData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateLiveCrowdData());
    }, 500);
  });
};

export const getAlerts = (): Promise<Alert[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockAlerts());
    }, 300);
  });
};

export const getUserPasses = (userId: string): Promise<Pass[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPasses.filter(pass => pass.userId === userId));
    }, 400);
  });
};

export const getUserPenalties = (userId: string): Promise<Penalty[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPenalties.filter(penalty => penalty.userId === userId));
    }, 300);
  });
};