import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/utils/translations';
import { QrCode, Users, Globe, Shield, Zap, BarChart3 } from 'lucide-react';
import heroImage from '@/assets/mahakumbh-hero.jpg';

const LandingPage = () => {
  const { language } = useAuth();
  const t = useTranslation(language);

  const features = [
    {
      icon: QrCode,
      title: t('digitalPass'),
      description: t('digitalPassDesc'),
    },
    {
      icon: BarChart3,
      title: t('crowdMonitoring'),
      description: t('crowdMonitoringDesc'),
    },
    {
      icon: Globe,
      title: t('multiLanguage'),
      description: t('multiLanguageDesc'),
    },
  ];

  const stats = [
    { label: language === 'en' ? 'Expected Pilgrims' : 'अपेक्षित यात्री', value: '40 Crore', icon: Users },
    { label: language === 'en' ? 'Sacred Zones' : 'पवित्र क्षेत्र', value: '12+', icon: Shield },
    { label: language === 'en' ? 'Digital Passes' : 'डिजिटल पास', value: '100%', icon: QrCode },
    { label: language === 'en' ? 'Real-time Updates' : 'रियल-टाइम अपडेट', value: '24/7', icon: Zap },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Mahakumbh 2028"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero opacity-80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {t('heroTitle')}
            <br />
            <span className="text-accent text-3xl md:text-5xl lg:text-6xl">
              {t('heroSubtitle')}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            {t('heroDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="hero" size="lg" className="min-w-48">
                {t('getStarted')}
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="min-w-48 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
              {t('learnMore')}
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="animate-bounce">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 gradient-spiritual rounded-full">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              {language === 'en' ? 'Smart Features for Sacred Journey' : 'पवित्र यात्रा के लिए स्मार्ट सुविधाएं'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Advanced technology ensuring safe, organized, and spiritual experience for millions of pilgrims'
                : 'करोड़ों तीर्थयात्रियों के लिए सुरक्षित, व्यवस्थित और आध्यात्मिक अनुभव सुनिश्चित करने वाली उन्नत तकनीक'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-medium hover:shadow-large transition-smooth border-0">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 gradient-spiritual rounded-full mx-auto">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {language === 'en' 
              ? 'Ready to Experience the Future of Pilgrimage?' 
              : 'तीर्थयात्रा के भविष्य का अनुभव करने के लिए तैयार हैं?'
            }
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {language === 'en'
              ? 'Join millions of pilgrims in the most organized and safe Mahakumbh experience ever.'
              : 'सबसे व्यवस्थित और सुरक्षित महाकुंभ अनुभव में करोड़ों तीर्थयात्रियों के साथ जुड़ें।'
            }
          </p>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/20 text-white">
              {t('getStarted')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;