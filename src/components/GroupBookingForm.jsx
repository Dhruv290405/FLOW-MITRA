import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, CreditCard, Users } from 'lucide-react';
import { GroupMember } from '@/services/mockData';

interface GroupBookingFormProps {
  onBookPass: (groupMembers: GroupMember[], tentCityDays?: number) => Promise<void>;
  selectedZone: string;
  onZoneChange: (zoneId: string) => void;
  zones: Array<{
    zoneId: string;
    zoneName: string;
    density: number;
    status: string;
    currentCount: number;
    maxCapacity: number;
  }>;
  isLoading: boolean;
  language: 'en' | 'hi';
}

const GroupBookingForm: React.FC<GroupBookingFormProps> = ({
  onBookPass,
  selectedZone,
  onZoneChange,
  zones,
  isLoading,
  language
}) => {
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    { aadhaar: '', name: '', age: undefined, relation: 'Self' }
  ]);
  const [tentCityDays, setTentCityDays] = useState<number>(0);

  const addMember = () => {
    if (groupMembers.length < 10) {
      setGroupMembers([...groupMembers, { aadhaar: '', name: '', age: undefined, relation: '' }]);
    }
  };

  const removeMember = (index: number) => {
    if (groupMembers.length > 1) {
      setGroupMembers(groupMembers.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof GroupMember, value: string | number) => {
    const updated = groupMembers.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    setGroupMembers(updated);
  };

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const isValidGroup = () => {
    return groupMembers.every(member => 
      member.aadhaar.replace(/\s/g, '').length === 12 && 
      member.name.trim().length > 0
    ) && selectedZone;
  };

  const handleSubmit = async () => {
    if (isValidGroup()) {
      await onBookPass(groupMembers, tentCityDays > 0 ? tentCityDays : undefined);
    }
  };

  const totalCost = () => {
    const baseCost = 0; // Free entry
    const tentCost = tentCityDays * 500 * groupMembers.length;
    return baseCost + tentCost;
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
                        ? '72-hour pass duration with automatic penalty for overstay'
                        : '72 घंटे की पास अवधि, अधिक रुकने पर स्वचालित जुर्माना'
                      }
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Members */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {language === 'en' ? 'Group Members' : 'समूह के सदस्य'} ({groupMembers.length}/10)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMember}
              disabled={groupMembers.length >= 10}
            >
              <Plus className="w-4 h-4 mr-1" />
              {language === 'en' ? 'Add Member' : 'सदस्य जोड़ें'}
            </Button>
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Add up to 10 family members with their Aadhaar details'
              : 'अपने परिवार के 10 सदस्यों तक के आधार विवरण के साथ जोड़ें'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupMembers.map((member, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {language === 'en' ? `Member ${index + 1}` : `सदस्य ${index + 1}`}
                  {index === 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {language === 'en' ? 'Main' : 'मुख्य'}
                    </Badge>
                  )}
                </h4>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>
                    {language === 'en' ? 'Full Name' : 'पूरा नाम'} *
                  </Label>
                  <Input
                    id={`name-${index}`}
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    placeholder={language === 'en' ? 'Enter full name' : 'पूरा नाम दर्ज करें'}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`aadhaar-${index}`}>
                    {language === 'en' ? 'Aadhaar Number' : 'आधार संख्या'} *
                  </Label>
                  <Input
                    id={`aadhaar-${index}`}
                    value={member.aadhaar}
                    onChange={(e) => updateMember(index, 'aadhaar', formatAadhaar(e.target.value))}
                    placeholder="1234 5678 9012"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`age-${index}`}>
                    {language === 'en' ? 'Age' : 'आयु'}
                  </Label>
                  <Input
                    id={`age-${index}`}
                    type="number"
                    value={member.age || ''}
                    onChange={(e) => updateMember(index, 'age', parseInt(e.target.value))}
                    placeholder="25"
                    min="1"
                    max="120"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`relation-${index}`}>
                    {language === 'en' ? 'Relation' : 'रिश्ता'}
                  </Label>
                  <Select 
                    value={member.relation || ''} 
                    onValueChange={(value) => updateMember(index, 'relation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select relation' : 'रिश्ता चुनें'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self">{language === 'en' ? 'Self' : 'स्वयं'}</SelectItem>
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

      {/* Tent City Extension */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>
            {language === 'en' ? 'Tent City Extension (Optional)' : 'टेंट सिटी विस्तार (वैकल्पिक)'}
          </CardTitle>
          <CardDescription>
            {language === 'en' 
              ? 'Extend your stay in premium tent accommodations (₹500/person/day)'
              : 'प्रीमियम टेंट आवास में अपना प्रवास बढ़ाएं (₹500/व्यक्ति/दिन)'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="tent-days">
              {language === 'en' ? 'Additional Days' : 'अतिरिक्त दिन'} (0-7)
            </Label>
            <Input
              id="tent-days"
              type="number"
              value={tentCityDays}
              onChange={(e) => setTentCityDays(Math.max(0, Math.min(7, parseInt(e.target.value) || 0)))}
              min="0"
              max="7"
              placeholder="0"
            />
            {tentCityDays > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? `Additional cost: ₹${tentCityDays * 500 * groupMembers.length} for ${tentCityDays} days (${groupMembers.length} members)`
                    : `अतिरिक्त लागत: ₹${tentCityDays * 500 * groupMembers.length} ${tentCityDays} दिनों के लिए (${groupMembers.length} सदस्य)`
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary & Book Button */}
      <Card className="shadow-medium border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{language === 'en' ? 'Total Cost' : 'कुल लागत'}</span>
              <span className="text-primary">₹{totalCost()}</span>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Entry Pass' : 'प्रवेश पास'} ({groupMembers.length} {language === 'en' ? 'members' : 'सदस्य'})</span>
                <span>{language === 'en' ? 'FREE' : 'मुफ्त'}</span>
              </div>
              {tentCityDays > 0 && (
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Tent City Extension' : 'टेंट सिटी विस्तार'}</span>
                  <span>₹{tentCityDays * 500 * groupMembers.length}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              {totalCost() > 0 && (
                <p className="text-xs text-muted-foreground mb-3">
                  {language === 'en' 
                    ? 'Amount will be auto-deducted from Aadhaar-linked bank account'
                    : 'राशि आधार से जुड़े बैंक खाते से स्वचालित रूप से काट ली जाएगी'
                  }
                </p>
              )}

              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={!isValidGroup() || isLoading}
                className="w-full"
              >
                {isLoading 
                  ? (language === 'en' ? 'Booking...' : 'बुकिंग...')
                  : (language === 'en' ? 'Book Group Pass' : 'समूह पास बुक करें')
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupBookingForm;