import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/utils/translations';
import { generatePass, getUserPasses, getUserPenalties, mockZones, type Pass, type Penalty, type GroupMember } from '@/services/mockData';
import { QrCode, CreditCard, Download, Clock, MapPin, AlertTriangle, CheckCircle, Plus, Users } from 'lucide-react';
import GroupBookingForm from '@/components/GroupBookingForm';
import { toast } from '@/hooks/use-toast';

const PilgrimPortal = () => {
  const { user, language } = useAuth();
  const t = useTranslation(language);
  const [passes, setPasses] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('passes');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userPasses, userPenalties] = await Promise.all([
        getUserPasses(user.id),
        getUserPenalties(user.id)
      ]);
      setPasses(userPasses);
      setPenalties(userPenalties);
    } catch (error) {
      toast({
        title: t('error'),
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookPass = async (groupMembers, tentCityDays) => {
    if (!user || !selectedZone) return;
    
    setBookingLoading(true);
    const zone = mockZones.find(z => z.zoneId === selectedZone);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (zone) {
        const newPass = generatePass(user.id, zone.zoneId, zone.zoneName, groupMembers, tentCityDays);
        setPasses(prev => [...prev, newPass]);
        
        toast({
          title: t('success'),
          description: `${t('passBooked')} - Group of ${groupMembers.length} members`,
          variant: 'default',
        });
        
        setSelectedZone('');
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: 'Failed to book pass',
        variant: 'destructive',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>;
      case 'used':
        return <Badge variant="outline">Used</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const generateQRCode = (passId) => {
    // In a real app, this would generate an actual QR code
    return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23000'/><rect x='20' y='20' width='160' height='160' fill='%23fff'/><text x='100' y='110' text-anchor='middle' fill='%23000' font-size='12'>QR: ${passId}</text></svg>`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            {t('welcomePilgrim')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'en' 
              ? 'Manage your digital passes and stay updated on your pilgrimage journey'
              : 'अपने डिजिटल पास प्रबंधित करें और अपनी तीर्थयात्रा की जानकारी रखें'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="passes">{t('myPasses')}</TabsTrigger>
            <TabsTrigger value="book">{t('bookPass')}</TabsTrigger>
            <TabsTrigger value="penalties">{t('penalties')}</TabsTrigger>
          </TabsList>

          {/* My Passes Tab */}
          <TabsContent value="passes" className="space-y-6">
            {passes.length === 0 ? (
              <Card className="shadow-medium">
                <CardContent className="p-8 text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'en' ? 'No Passes Yet' : 'अभी तक कोई पास नहीं'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'en' 
                      ? 'Book your first digital pass to begin your sacred journey'
                      : 'अपनी पवित्र यात्रा शुरू करने के लिए अपना पहला डिजिटल पास बुक करें'
                    }
                  </p>
                  <Button variant="hero" onClick={() => setActiveTab('book')}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('bookPass')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {passes.map((pass) => (
                  <Card key={pass.id} className="shadow-medium hover:shadow-large transition-smooth">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{pass.zoneName}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            Zone {pass.zoneId.split('_')[1]}
                          </CardDescription>
                        </div>
                        {getStatusBadge(pass.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Entry:' : 'प्रवेश:'} {pass.entryTime.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Exit Deadline:' : 'निकासी समय सीमा:'} {pass.exitDeadline.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Group Size:' : 'समूह का आकार:'} {pass.groupSize} {language === 'en' ? 'members' : 'सदस्य'}
                          </div>
                          {pass.extraCharges && pass.extraCharges > 0 && (
                            <div className="flex items-center text-sm text-warning">
                              <CreditCard className="w-4 h-4 mr-2" />
                              {language === 'en' ? 'Tent City:' : 'टेंट सिटी:'} ₹{pass.extraCharges} {language === 'en' ? 'charged' : 'शुल्क'}
                            </div>
                          )}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <QrCode className="w-4 h-4 mr-2" />
                              {t('viewPass')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{pass.zoneName} - Digital Group Pass</DialogTitle>
                              <DialogDescription>
                                Group of {pass.groupSize} members • Scan at entry point
                              </DialogDescription>
                            </DialogHeader>
                            <div className="text-center space-y-4">
                              <img
                                src={generateQRCode(pass.id)}
                                alt="QR Code"
                                className="mx-auto border rounded-lg"
                              />
                              <div className="space-y-2 text-sm">
                                <div className="font-medium">Pass ID: {pass.id}</div>
                                <div className="text-muted-foreground">
                                  Valid until: {pass.exitDeadline.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground">
                                  Members: {pass.groupMembers.map(m => m.name).join(', ')}
                                </div>
                              </div>
                              <Button variant="outline" className="w-full">
                                <Download className="w-4 h-4 mr-2" />
                                {t('downloadPass')}
                              </Button>
                            </div>
                          </DialogContent>
                         </Dialog>
                     </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Book Pass Tab */}
          <TabsContent value="book" className="space-y-6">
            <GroupBookingForm
              onBookPass={handleBookPass}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
              zones={mockZones}
              isLoading={bookingLoading}
              language={language}
            />
          </TabsContent>

          {/* Penalties Tab */}
          <TabsContent value="penalties" className="space-y-6">
            {penalties.length === 0 ? (
              <Card className="shadow-medium">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'en' ? 'No Penalties' : 'कोई जुर्माना नहीं'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'You have no outstanding penalties. Keep following the guidelines!'
                      : 'आपके पास कोई बकाया जुर्माना नहीं है। दिशानिर्देशों का पालन करते रहें!'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {penalties.map((penalty) => (
                  <Card key={penalty.id} className="shadow-medium">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-warning" />
                          <div>
                            <h4 className="font-semibold">{penalty.reason}</h4>
                            <p className="text-sm text-muted-foreground">
                              Issued: {penalty.dateIssued.toLocaleDateString()} • Pass: {penalty.passId}
                            </p>
                            {penalty.overstayHours > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Overstay: {penalty.overstayHours} hours
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">₹{penalty.amount}</div>
                          <Badge variant={
                            penalty.status === 'paid' ? 'secondary' : 
                            penalty.status === 'auto_deducted' ? 'outline' : 
                            'destructive'
                          }>
                            {penalty.status === 'paid' ? 'Paid' : 
                             penalty.status === 'auto_deducted' ? 'Auto Deducted' : 
                             'Pending'}
                          </Badge>
                          {penalty.smsAlertSent && (
                            <p className="text-xs text-muted-foreground mt-1">SMS Sent</p>
                          )}
                        </div>
                      </div>
                      {penalty.status === 'pending' && (
                        <div className="mt-4">
                          <Button variant="warning" size="sm">
                            Pay Now
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PilgrimPortal;