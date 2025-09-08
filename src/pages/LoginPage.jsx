import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/utils/translations';
import { CreditCard, Shield, Users } from 'lucide-react';

const LoginPage = () => {
  const [aadhaar, setAadhaar] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('pilgrim');
  const [isLoading, setIsLoading] = useState(false);
  const { login, language } = useAuth();
  const navigate = useNavigate();
  const t = useTranslation(language);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanAadhaar = aadhaar.replace(/\s/g, '');
    if (!cleanAadhaar || cleanAadhaar.length !== 12 || !name.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with Aadhaar validation
    setTimeout(() => {
      login(cleanAadhaar, name.trim(), role);
      setIsLoading(false);
      
      // Redirect based on role
      if (role === 'pilgrim') {
        navigate('/pilgrim');
      } else {
        navigate('/authority');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-large border-0">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 gradient-spiritual rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gradient">
              {t('welcomeBack')}
            </CardTitle>
            <CardDescription className="text-base">
              {language === 'en' ? 'Enter your Aadhaar card details to proceed' : 'आगे बढ़ने के लिए अपना आधार कार्ड विवरण दर्ज करें'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {language === 'en' ? 'Full Name' : 'पूरा नाम'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={language === 'en' ? 'Enter your full name' : 'अपना पूरा नाम दर्ज करें'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Aadhaar Number Input */}
              <div className="space-y-2">
                <Label htmlFor="aadhaar" className="text-sm font-medium">
                  {language === 'en' ? 'Aadhaar Number' : 'आधार संख्या'}
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="aadhaar"
                    type="text"
                    placeholder="1234 5678 9012"
                    value={aadhaar}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setAadhaar(formatted);
                    }}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? '12-digit Aadhaar number' : '12 अंकों की आधार संख्या'}
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t('selectRole')}</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value)}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                    <RadioGroupItem value="pilgrim" id="pilgrim" />
                    <div className="flex items-center space-x-3 flex-1">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <Label htmlFor="pilgrim" className="font-medium cursor-pointer">
                          {t('pilgrim')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? 'For pilgrims visiting Mahakumbh' : 'महाकुंभ में आने वाले यात्रियों के लिए'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                    <RadioGroupItem value="authority" id="authority" />
                    <div className="flex items-center space-x-3 flex-1">
                      <Shield className="w-5 h-5 text-secondary" />
                      <div>
                        <Label htmlFor="authority" className="font-medium cursor-pointer">
                          {t('authority')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {language === 'en' ? 'For authorized personnel and administrators' : 'अधिकृत कर्मचारियों और प्रशासकों के लिए'}
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant={role === 'pilgrim' ? 'hero' : 'authority'}
                className="w-full"
                disabled={!aadhaar || aadhaar.replace(/\s/g, '').length !== 12 || !name.trim() || isLoading}
              >
                {isLoading ? t('loading') : t('signIn')}
              </Button>
            </form>

            {/* Demo Instructions */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                {language === 'en' 
                  ? 'Demo: Enter any 12-digit Aadhaar number and name to proceed'
                  : 'डेमो: आगे बढ़ने के लिए कोई भी 12 अंकों का आधार नंबर और नाम दर्ज करें'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;