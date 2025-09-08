import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Maximize2, Download, RefreshCw, TrendingUp, Users, AlertTriangle, MapPin, Clock, Camera, Zap } from 'lucide-react';
import { iotSensorManager, RealTimeData } from '@/services/iotSensorService';
import { aiPredictionEngine } from '@/services/aiPredictionService';
import { calculateCrowdFlow, generatePredictiveAlerts, CrowdFlowData, PredictiveAlert } from '@/services/crowdFlowAlgorithm';

const PowerBIDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [crowdFlow, setCrowdFlow] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real-time IoT data
      const rtData = await iotSensorManager.getRealTimeData();
      setRealTimeData(rtData);
      
      // Generate crowd flow analysis
      const flowData = await calculateCrowdFlow([]);
      setCrowdFlow(flowData);
      
      // Generate AI predictions
      const alerts = await generatePredictiveAlerts(flowData);
      setPredictions(alerts);
      
      // Generate heatmap data
      const heatmap = generateHeatmapData(rtData, flowData);
      setHeatmapData(heatmap);
      
      // Calculate analytics
      const analyticsData = calculateAnalytics(rtData, alerts);
      setAnalytics(analyticsData);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (rtData: RealTimeData[], flowData: CrowdFlowData[]): LiveHeatmapData[] => {
    return rtData.map((data, index) => ({
      zone: data.zoneId,
      density: data.currentCount,
      temperature: 25 + Math.random() * 15, // Mock temperature data
      riskLevel: data.currentCount > 150 ? 'critical' : 
                 data.currentCount > 120 ? 'high' :
                 data.currentCount > 80 ? 'medium' : 'low',
      coordinates: {
        x: 100 + (index % 3) * 200,
        y: 100 + Math.floor(index / 3) * 150
      }
    }));
  };

  const calculateAnalytics = (rtData: RealTimeData[], alerts: PredictiveAlert[]): PowerBIAnalytics => {
    const totalVisitors = rtData.reduce((sum, zone) => sum + zone.currentCount, 0);
    const peakCapacity = Math.max(...rtData.map(zone => zone.currentCount));
    const avgDwellTime = rtData.reduce((sum, zone) => sum + zone.avgDwellTime, 0) / rtData.length;
    
    const zoneUtilization = rtData.map(zone => ({
      zone: zone.zoneId,
      utilization: Math.round((zone.currentCount / 200) * 100), // Assuming 200 max capacity
      capacity: 200
    }));
    
    const hourlyFlow = Array.from({length: 24}, (_, hour) => ({
      hour,
      entries: Math.floor(Math.random() * 100) + 20,
      exits: Math.floor(Math.random() * 80) + 15
    }));
    
    return {
      totalVisitors,
      peakCapacity,
      avgDwellTime: Math.round(avgDwellTime),
      zoneUtilization,
      hourlyFlow,
      predictionAccuracy: 87.5,
      alertsGenerated: alerts.length,
      alertsResolved: alerts.filter(a => Math.random() > 0.7).length
    };
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Power BI Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pilgrims</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Zone Capacity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.peakCapacity}</div>
            <p className="text-xs text-muted-foreground">
              85% of max capacity
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Prediction Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.predictionAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              ML model performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.filter(p => !p.prediction.includes('resolved')).length}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.alertsResolved} resolved today
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="heatmap">Live Heatmap</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Zone Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Utilization</CardTitle>
                <CardDescription>Current capacity across all zones</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.zoneUtilization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zone" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Entry/Exit Flow</CardTitle>
                <CardDescription>24-hour pilgrim movement pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics?.hourlyFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="entries" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="exits" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Zone Status</CardTitle>
              <CardDescription>Live data from IoT sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realTimeData.map((zone) => (
                  <div key={zone.zoneId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{zone.zoneId}</p>
                        <p className="text-sm text-muted-foreground">
                          {zone.currentCount} pilgrims • {zone.sensorHealth}% sensors online
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={zone.alerts.length > 0 ? "destructive" : "secondary"}>
                        {zone.alerts.length > 0 ? `${zone.alerts.length} alerts` : "Normal"}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm">↑{zone.entryRate}/min</p>
                        <p className="text-sm">↓{zone.exitRate}/min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Crowd Density Heatmap</CardTitle>
              <CardDescription>Real-time visualization of crowd distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                {heatmapData.map((zone, index) => (
                  <div
                    key={zone.zone}
                    className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      zone.riskLevel === 'critical' ? 'bg-red-600' :
                      zone.riskLevel === 'high' ? 'bg-orange-500' :
                      zone.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{
                      left: `${zone.coordinates.x}px`,
                      top: `${zone.coordinates.y}px`,
                      opacity: 0.8
                    }}
                  >
                    {zone.density}
                  </div>
                ))}
                <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Low (0-50)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Medium (51-100)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>High (101-150)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span>Critical (150+)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* YOLO Camera Feed Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>YOLO v8n Camera Feed - Buffer Zone 1</CardTitle>
                <CardDescription>AI-powered people counting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                  <div className="absolute top-2 left-2 text-green-400 text-xs">
                    ● LIVE • {Math.floor(Math.random() * 25) + 15} people detected
                  </div>
                  <div className="absolute bottom-2 right-2 text-white text-xs">
                    Confidence: 94.2%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>YOLO v8n Camera Feed - Buffer Zone 2</CardTitle>
                <CardDescription>AI-powered people counting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                  <div className="absolute top-2 left-2 text-green-400 text-xs">
                    ● LIVE • {Math.floor(Math.random() * 30) + 10} people detected
                  </div>
                  <div className="absolute bottom-2 right-2 text-white text-xs">
                    Confidence: 91.8%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{prediction.type.replace('_', ' ').toUpperCase()}</CardTitle>
                    <Badge variant={
                      prediction.severity === 'critical' ? 'destructive' :
                      prediction.severity === 'high' ? 'destructive' :
                      prediction.severity === 'medium' ? 'secondary' : 'outline'
                    }>
                      {prediction.severity}
                    </Badge>
                  </div>
                  <CardDescription>
                    Zone: {prediction.zone} • Confidence: {Math.round(prediction.confidence * 100)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{prediction.prediction}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Suggested Actions:</p>
                    <ul className="text-xs space-y-1">
                      {prediction.suggestedActions.map((action, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    ETA: {prediction.timeToOccur} minutes
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Prediction Accuracy Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Model Performance</CardTitle>
                <CardDescription>Prediction accuracy over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={Array.from({length: 24}, (_, i) => ({
                    hour: i,
                    accuracy: 85 + Math.random() * 10
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alert Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Distribution</CardTitle>
                <CardDescription>By severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: 'Critical', value: 5, fill: '#dc2626' },
                        { name: 'High', value: 12, fill: '#ea580c' },
                        { name: 'Medium', value: 23, fill: '#ca8a04' },
                        { name: 'Low', value: 8, fill: '#16a34a' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PowerBIDashboard;