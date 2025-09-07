import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Download, Calendar, Users, Clock, IndianRupee, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { edgeFunctions, db } from '@/lib/supabase';
import { translations } from '@/utils/translations';

const GroupBookingForm = ({ 
  selectedZone, 
  onZoneChange, 
  zones, 
  isLoading, 
  language 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExtension, setShowExtension] = useState(false);
  const [extensionHours, setExtensionHours] = useState(4);
  const [tentBooking, setTentBooking] = useState(false);

  const t = (key) => translations[language][key] || key;

  const addFamilyMember = () => {
    if (familyMembers.length < 9) { // 9 + main user = 10 total
      setFamilyMembers([...familyMembers, {
        name: '',
        aadhaar: '',
        age: '',
        relation: 'Child'
      }]);
    }
  };

  const removeFamilyMember = (index) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index, field, value) => {
    const updated = familyMembers.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    setFamilyMembers(updated);
  };

  const formatAadhaar = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Morning, Afternoon, Evening slots
      const morningSlot = new Date(date);
      morningSlot.setHours(6, 0, 0, 0);
      
      const afternoonSlot = new Date(date);
      afternoonSlot.setHours(12, 0, 0, 0);
      
      const eveningSlot = new Date(date);
      eveningSlot.setHours(18, 0, 0, 0);
      
      slots.push(
        { time: morningSlot, label: `${date.toDateString()} - Morning (6:00 AM)` },
        { time: afternoonSlot, label: `${date.toDateString()} - Afternoon (12:00 PM)` },
        { time: eveningSlot, label: `${date.toDateString()} - Evening (6:00 PM)` }
      );
    }
    
    return slots;
  };

  const generatePass = async () => {
    if (familyMembers.length === 0) {
      toast({
        title: t('error'),
        description: t('addFamilyMembers'),
        variant: "destructive"
      });
      return;
    }

    if (!selectedSlot) {
      toast({
        title: t('error'),
        description: t('selectTimeSlot'),
        variant: "destructive"
      });
      return;
    }

    if (!selectedZone) {
      toast({
        title: t('error'),
        description: 'Please select a zone',
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare pass data
      const passData = {
        aadhaar_number: user.aadhaar,
        full_name: user.name,
        phone: user.mobile,
        family_members: familyMembers,
        slot_start: selectedSlot.toISOString(),
        slot_duration_hours: 24
      };

      // Generate pass using Supabase edge function
      const { data, error } = await edgeFunctions.generatePass(passData);
      
      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setGeneratedPass({
          passId: data.pass_id,
          qrCode: data.qr_code,
          slotTime: new Date(data.slot_start),
          exitDeadline: new Date(data.exit_deadline),
          groupSize: data.group_size,
          status: 'active'
        });

        toast({
          title: t('passGenerated'),
          description: `Pass ID: ${data.pass_id}`,
        });

        // Reset form
        setFamilyMembers([]);
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error('Pass generation failed:', error);
      toast({
        title: t('error'),
        description: error.message || 'Pass generation failed',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const extendPass = async () => {
    if (!generatedPass) return;

    try {
      const { data, error } = await edgeFunctions.extendPass(
        generatedPass.passId,
        extensionHours,
        tentBooking
      );
      
      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setGeneratedPass(prev => ({
          ...prev,
          exitDeadline: new Date(data.new_exit_deadline)
        }));

        toast({
          title: 'Extension Successful',
          description: `New deadline: ${new Date(data.new_exit_deadline).toLocaleString()} | Charged: ₹${data.amount_charged}`,
        });

        setShowExtension(false);
        setExtensionHours(4);
        setTentBooking(false);
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message || 'Extension failed',
        variant: "destructive"
      });
    }
  };

  const downloadPass = () => {
    if (!generatedPass) return;
    
    const passData = {
      passId: generatedPass.passId,
      holderName: user.name,
      aadhaar: user.aadhaar,
      groupSize: generatedPass.groupSize,
      slotTime: generatedPass.slotTime.toLocaleString(),
      exitDeadline: generatedPass.exitDeadline.toLocaleString(),
      qrCode: generatedPass.qrCode
    };

    const dataStr = JSON.stringify(passData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `simhastha_pass_${generatedPass.passId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const isValidForm = () => {
    return familyMembers.every(member => 
      member.aadhaar.replace(/\s/g, '').length === 12 && 
      member.name.trim().length > 0
    ) && selectedSlot && selectedZone;
  };

  return (
    <div className="space-y-6">
      {/* Zone Selection */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {language === 'en' ? 'Select Sacred Zone' : 'पवित्र क्षेत्र चुनें'}
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Choose your preferred pilgrimage zone' : 'अपना पसंदीदा तीर्थ क्षेत्र चुनें'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedZone} onValueChange={onZoneChange}>
            <SelectTrigger>
              <SelectValue placeholder={language === 'en' ? 'Choose a zone...' : 'एक क्षेत्र चुनें...'} />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone.zoneId} value={zone.zoneId}>
                  <div className="flex items-center justify-between w-full">
                    <span>{zone.zoneName}</span>
                    <Badge 
                      variant={zone.status === 'critical' ? 'destructive' : zone.status === 'warning' ? 'secondary' : 'outline'}
                      className="ml-2"
                    >
                      {Math.round(zone.density)}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedZone && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              {(() => {
                const zone = zones.find(z => z.zoneId === selectedZone);
                return zone ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold">{zone.zoneName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Capacity: {zone.currentCount.toLocaleString()}/{zone.maxCapacity.toLocaleString()}</span>
                      <span>Density: {Math.round(zone.density)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? '24-hour pass duration with automatic penalty for overstay'
                        : '24 घंटे की पास अवधि, अधिक रुकने पर स्वचालित जुर्माना'
                      }
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('selectTimeSlot')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {generateTimeSlots().map((slot, index) => (
              <Button
                key={index}
                variant={selectedSlot?.getTime() === slot.time.getTime() ? "default" : "outline"}
                className="p-4 h-auto text-left"
                onClick={() => setSelectedSlot(slot.time)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{slot.label}</span>
                  <span className="text-xs opacity-70">
                    {language === 'en' ? 'Available' : 'उपलब्ध'}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('familyMembers')} ({familyMembers.length}/9)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addFamilyMember}
              disabled={familyMembers.length >= 9}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('addMember')}
            </Button>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Add up to 9 family members (10 total including you)'
              : 'अधिकतम 9 परिवारजन जोड़ें (आपसहित कुल 10)'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Member Info */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{t('mainMember')}</h4>
              <Badge variant="secondary">{t('you')}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('name')}: </span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('aadhaar')}: </span>
                <span className="font-medium">{user?.aadhaar}</span>
              </div>
            </div>
          </div>

          {familyMembers.map((member, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {language === 'en' ? `Family Member ${index + 1}` : `परिवारजन ${index + 1}`}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFamilyMember(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('fullName')} *</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                    placeholder={language === 'en' ? 'Enter full name' : 'पूरा नाम दर्ज करें'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('aadhaar')} *</Label>
                  <Input
                    value={member.aadhaar}
                    onChange={(e) => updateFamilyMember(index, 'aadhaar', formatAadhaar(e.target.value))}
                    placeholder="1234 5678 9012"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('age')}</Label>
                  <Input
                    type="number"
                    value={member.age}
                    onChange={(e) => updateFamilyMember(index, 'age', e.target.value)}
                    placeholder="25"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('relation')}</Label>
                  <Select 
                    value={member.relation} 
                    onValueChange={(value) => updateFamilyMember(index, 'relation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">{language === 'en' ? 'Spouse' : 'पति/पत्नी'}</SelectItem>
                      <SelectItem value="Child">{language === 'en' ? 'Child' : 'बच्चा'}</SelectItem>
                      <SelectItem value="Parent">{language === 'en' ? 'Parent' : 'माता-पिता'}</SelectItem>
                      <SelectItem value="Sibling">{language === 'en' ? 'Sibling' : 'भाई-बहन'}</SelectItem>
                      <SelectItem value="Other">{language === 'en' ? 'Other' : 'अन्य'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generate Pass Button */}
      <Button
        onClick={generatePass}
        disabled={!isValidForm() || isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating 
          ? (language === 'en' ? 'Generating Pass...' : 'पास बना रहे हैं...')
          : (language === 'en' ? 'Generate Digital Pass' : 'डिजिटल पास बनाएं')
        }
      </Button>

      {/* Generated Pass Display */}
      {generatedPass && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Badge className="bg-green-100 text-green-800">
                {t('passGenerated')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">{t('passId')}: </span>
                  <span className="font-mono">{generatedPass.passId}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{t('groupSize')}: </span>
                  <span>{generatedPass.groupSize} {t('members')}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{t('slotTime')}: </span>
                  <span>{generatedPass.slotTime.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{t('exitDeadline')}: </span>
                  <span className="text-red-600 font-medium">
                    {generatedPass.exitDeadline.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {generatedPass.qrCode && (
                <div className="flex flex-col items-center">
                  <img 
                    src={generatedPass.qrCode} 
                    alt="QR Code" 
                    className="w-32 h-32 border border-gray-300 rounded"
                  />
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    {t('scanQRCode')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={downloadPass}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('downloadPass')}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => setShowExtension(true)}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                {t('extendPass')}
              </Button>
            </div>

            {showExtension && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">{t('extendPass')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('additionalHours')}</Label>
                      <Select 
                        value={extensionHours.toString()} 
                        onValueChange={(value) => setExtensionHours(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 {t('hours')} - ₹400</SelectItem>
                          <SelectItem value="8">8 {t('hours')} - ₹800</SelectItem>
                          <SelectItem value="12">12 {t('hours')} - ₹1200</SelectItem>
                          <SelectItem value="24">24 {t('hours')} - ₹2400</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={tentBooking}
                          onChange={(e) => setTentBooking(e.target.checked)}
                        />
                        {t('bookTent')} (+₹2000)
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={extendPass} className="flex-1">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      {t('payAndExtend')} ₹{extensionHours * 100 + (tentBooking ? 2000 : 0)}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowExtension(false)}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupBookingForm;