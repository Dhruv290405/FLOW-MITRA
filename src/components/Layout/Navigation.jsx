import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/utils/translations';
import { Globe, LogOut, User } from 'lucide-react';

const Navigation = () => {
  const { user, logout, language, toggleLanguage } = useAuth();
  const location = useLocation();
  const t = useTranslation(language);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-spiritual rounded-lg flex items-center justify-center text-white font-bold">
              कुंभ
            </div>
            <span className="font-bold text-lg text-gradient">
              {language === 'en' ? 'Mahakumbh 2028' : 'महाकुंभ 2028'}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                isActive('/') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {t('home')}
            </Link>
            
            {user?.role === 'pilgrim' && (
              <Link
                to="/pilgrim"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActive('/pilgrim') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {t('pilgrimPortal')}
              </Link>
            )}
            
            {user?.role === 'authority' && (
              <Link
                to="/authority"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActive('/authority') 
                    ? 'text-secondary bg-secondary/10' 
                    : 'text-muted-foreground hover:text-secondary'
                }`}
              >
                {t('authorityDashboard')}
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-1"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">
                {language === 'en' ? 'हि' : 'EN'}
              </span>
            </Button>

            {/* User actions */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="hero" size="sm">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;