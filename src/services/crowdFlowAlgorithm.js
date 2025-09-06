export interface CrowdFlowData {
  zoneId: string;
  currentDensity: number;
  predictedDensity: number;
  flowDirection: 'in' | 'out' | 'stable';
  bottleneckRisk: number;
  recommendedActions: string[];
}

export interface RouteSuggestion {
  routeId: string;
  zonePath: string[];
  estimatedTime: number;
  crowdLevel: 'low' | 'medium' | 'high';
  dynamicPricing: number;
  alternativeRoutes: string[];
}

export interface PredictiveAlert {
  id: string;
  type: 'congestion' | 'safety' | 'capacity' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  prediction: string;
  confidence: number;
  timeToOccur: number; // minutes
  suggestedActions: string[];
  timestamp: Date;
}

// Advanced crowd flow prediction using mock ML algorithms
export const calculateCrowdFlow = async (historicalData: any[]): Promise<CrowdFlowData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const zones = ['Zone_A', 'Zone_B', 'Zone_C', 'Zone_D', 'Zone_E', 'Buffer_1', 'Buffer_2'];
      
      const flowData: CrowdFlowData[] = zones.map(zoneId => {
        const currentDensity = Math.random() * 100;
        const trendFactor = (Math.random() - 0.5) * 20;
        const predictedDensity = Math.max(0, Math.min(100, currentDensity + trendFactor));
        
        const flowDirection = trendFactor > 5 ? 'in' : trendFactor < -5 ? 'out' : 'stable';
        const bottleneckRisk = currentDensity > 80 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3;
        
        const recommendedActions = [];
        if (currentDensity > 85) recommendedActions.push('Implement crowd diversion');
        if (bottleneckRisk > 0.7) recommendedActions.push('Deploy additional security');
        if (predictedDensity > 90) recommendedActions.push('Activate emergency protocols');
        if (currentDensity < 30) recommendedActions.push('Encourage more entries');
        
        return {
          zoneId,
          currentDensity: Math.round(currentDensity),
          predictedDensity: Math.round(predictedDensity),
          flowDirection,
          bottleneckRisk: Math.round(bottleneckRisk * 100) / 100,
          recommendedActions
        };
      });
      
      resolve(flowData);
    }, 1200);
  });
};

export const generateDynamicRoutes = async (destination: string, crowdData: CrowdFlowData[]): Promise<RouteSuggestion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const basePrice = 50; // Base pass price in INR
      
      const routes: RouteSuggestion[] = [
        {
          routeId: 'ROUTE_OPTIMAL',
          zonePath: ['Entry_Gate_1', 'Zone_A', 'Zone_B', destination],
          estimatedTime: 45,
          crowdLevel: 'medium',
          dynamicPricing: basePrice,
          alternativeRoutes: ['ROUTE_FAST', 'ROUTE_PREMIUM']
        },
        {
          routeId: 'ROUTE_FAST',
          zonePath: ['Entry_Gate_2', 'Buffer_1', destination],
          estimatedTime: 25,
          crowdLevel: 'low',
          dynamicPricing: basePrice * 1.5, // 50% surge pricing
          alternativeRoutes: ['ROUTE_OPTIMAL', 'ROUTE_PREMIUM']
        },
        {
          routeId: 'ROUTE_PREMIUM',
          zonePath: ['VIP_Entry', 'Premium_Zone', destination],
          estimatedTime: 20,
          crowdLevel: 'low',
          dynamicPricing: basePrice * 3, // Premium pricing
          alternativeRoutes: ['ROUTE_OPTIMAL', 'ROUTE_FAST']
        }
      ];
      
      // Adjust pricing based on crowd density
      routes.forEach(route => {
        const avgDensity = route.zonePath.reduce((sum, zone) => {
          const zoneData = crowdData.find(d => d.zoneId === zone);
          return sum + (zoneData?.currentDensity || 50);
        }, 0) / route.zonePath.length;
        
        if (avgDensity > 80) {
          route.dynamicPricing *= 1.8; // High demand pricing
          route.crowdLevel = 'high';
        } else if (avgDensity < 30) {
          route.dynamicPricing *= 0.8; // Incentive pricing
          route.crowdLevel = 'low';
        }
        
        route.dynamicPricing = Math.round(route.dynamicPricing);
      });
      
      resolve(routes);
    }, 800);
  });
};

export const generatePredictiveAlerts = async (crowdData: CrowdFlowData[]): Promise<PredictiveAlert[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const alerts: PredictiveAlert[] = [];
      
      crowdData.forEach(zone => {
        // Congestion prediction
        if (zone.predictedDensity > 85) {
          alerts.push({
            id: `PRED_${Date.now()}_${zone.zoneId}`,
            type: 'congestion',
            severity: zone.predictedDensity > 95 ? 'critical' : 'high',
            zone: zone.zoneId,
            prediction: `Zone ${zone.zoneId} expected to reach ${zone.predictedDensity}% capacity in next 30 minutes`,
            confidence: 0.85,
            timeToOccur: 30,
            suggestedActions: [
              'Activate crowd diversion to alternate routes',
              'Deploy additional crowd control staff',
              'Send SMS alerts to incoming pilgrims'
            ],
            timestamp: new Date()
          });
        }
        
        // Safety prediction based on bottleneck risk
        if (zone.bottleneckRisk > 0.7) {
          alerts.push({
            id: `SAFE_${Date.now()}_${zone.zoneId}`,
            type: 'safety',
            severity: 'high',
            zone: zone.zoneId,
            prediction: `High bottleneck risk detected in ${zone.zoneId}. Potential safety concern.`,
            confidence: 0.78,
            timeToOccur: 15,
            suggestedActions: [
              'Implement one-way flow control',
              'Position additional security personnel',
              'Consider temporary zone closure'
            ],
            timestamp: new Date()
          });
        }
      });
      
      // Add system-wide predictions
      const avgDensity = crowdData.reduce((sum, zone) => sum + zone.currentDensity, 0) / crowdData.length;
      if (avgDensity > 75) {
        alerts.push({
          id: `SYS_${Date.now()}_CAPACITY`,
          type: 'capacity',
          severity: 'medium',
          zone: 'ALL_ZONES',
          prediction: 'Overall system approaching high capacity. Peak conditions expected.',
          confidence: 0.82,
          timeToOccur: 45,
          suggestedActions: [
            'Activate surge pricing across all zones',
            'Send capacity warnings to registered pilgrims',
            'Prepare emergency evacuation protocols'
          ],
          timestamp: new Date()
        });
      }
      
      resolve(alerts);
    }, 1000);
  });
};