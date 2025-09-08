import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/utils/translations';
import { getCrowdData, getAlerts, type CrowdData, type Alert } from '@/services/mockData';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  MapPin, 
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const AuthorityDashboard = () => {
  const { language } = useAuth();
  const t = useTranslation(language);
  const [crowdData, setCrowdData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 10 seconds for live data
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [crowdDataResponse, alertsResponse] = await Promise.all([
        getCrowdData(),
        getAlerts()
      ]);
      
      setCrowdData(crowdDataResponse);
      setAlerts(alertsResponse);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPilgrims = () => {
    return crowdData.reduce((total, zone) => total + zone.currentCount, 0);
  };

  const getActiveAlerts = () => {
    return alerts.filter(alert => !alert.resolved).length;
  };

  const getCriticalZones = () => {
    return crowdData.filter(zone => zone.status === 'critical').length;
  };

  const getAverageCapacity = () => {
    if (crowdData.length === 0) return 0;
    const totalCapacity = crowdData.reduce((total, zone) => total + zone.density, 0);
    return Math.round(totalCapacity / crowdData.length);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'normal': return 'outline';
      default: return 'outline';
    }
  };

  const getAlertSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const generateRecentEntries = () => {
    // Mock recent entries data
    return [
      { id: 1, time: '14:32', zone: 'Sangam Ghat', type: 'Entry', pilgrimId: 'P001234' },
      { id: 2, time: '14:31', zone: 'Akshaya Vat', type: 'Entry', pilgrimId: 'P001235' },
      { id: 3, time: '14:30', zone: 'Hanuman Temple', type: 'Exit', pilgrimId: 'P001233' },
      { id: 4, time: '14:29', zone: 'Sangam Ghat', type: 'Entry', pilgrimId: 'P001236' },
      { id: 5, time: '14:28', zone: 'Saraswati Koop', type: 'Exit', pilgrimId: 'P001232' },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/5 via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">
              {t('authorityWelcome')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {language === 'en' 
                ? 'Real-time crowd monitoring and management system'
                : 'रियल-टाइम भीड़ निगरानी और प्रबंधन प्रणाली'
              }
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm" onClick={loadDashboardData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalPilgrims')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{getTotalPilgrims().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +2.3% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('activeAlerts')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{getActiveAlerts()}</div>
              <p className="text-xs text-muted-foreground">
                {getCriticalZones()} critical zones
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('zoneCapacity')}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{getAverageCapacity()}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all zones
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Online</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Crowd Monitoring */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">{t('liveMonitoring')}</CardTitle>
                <CardDescription>
                  Real-time crowd density across sacred zones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crowdData.map((zone) => (
                    <div key={zone.zoneId} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-semibold">{zone.zoneName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {zone.currentCount.toLocaleString()} / {zone.maxCapacity.toLocaleString()} pilgrims
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-lg font-bold">{Math.round(zone.density)}%</div>
                          <div className="text-xs text-muted-foreground">capacity</div>
                        </div>
                        <Badge variant={getStatusColor(zone.status)}>
                          {zone.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">{t('recentEntries')}</CardTitle>
                <CardDescription>
                  Latest pilgrim entry/exit activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateRecentEntries().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{entry.time}</span>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span>{entry.zone}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={entry.type === 'Entry' ? 'secondary' : 'outline'}>
                          {entry.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{entry.pilgrimId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">System Alerts</CardTitle>
                <CardDescription>
                  AI-generated predictions and warnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 8).map((alert) => (
                    <div key={alert.id} className={`p-3 border rounded-lg ${alert.resolved ? 'bg-muted/30' : 'bg-background'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {alert.resolved ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <Badge variant={getAlertSeverityColor(alert.severity)} className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={`text-sm ${alert.resolved ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {alert.message}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.zoneName}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;