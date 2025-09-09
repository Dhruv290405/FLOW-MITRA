-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL UNIQUE,
  mobile_phone TEXT,
  role TEXT NOT NULL DEFAULT 'pilgrim' CHECK (role IN ('pilgrim', 'authority')),
  bank_account TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create zones table for sacred locations
CREATE TABLE public.zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id TEXT NOT NULL UNIQUE,
  zone_name TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 10000,
  current_count INTEGER NOT NULL DEFAULT 0,
  density DECIMAL(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create passes table for pilgrim passes
CREATE TABLE public.passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pass_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exit_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_exit_time TIMESTAMP WITH TIME ZONE,
  group_size INTEGER NOT NULL DEFAULT 1,
  group_members JSONB NOT NULL DEFAULT '[]',
  tent_city_days INTEGER DEFAULT 0,
  extra_charges DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crowd_data table for AI predictions
CREATE TABLE public.crowd_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id TEXT NOT NULL,
  predicted_density DECIMAL(5,2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  recommendations JSONB NOT NULL DEFAULT '[]',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sensor_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create iot_logs table for sensor data
CREATE TABLE public.iot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  sensor_id TEXT NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table for system notifications
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id TEXT,
  zone_name TEXT,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create penalties table for violations
CREATE TABLE public.penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'auto_deducted')),
  overstay_hours INTEGER DEFAULT 0,
  sms_alert_sent BOOLEAN NOT NULL DEFAULT false,
  date_issued TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_paid TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create extensions table for pass extensions
CREATE TABLE public.extensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pass_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  additional_hours INTEGER NOT NULL,
  tent_booking BOOLEAN NOT NULL DEFAULT false,
  charges DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorities can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Create RLS policies for zones
CREATE POLICY "Anyone can view zones" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Authorities can update zones" ON public.zones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Create RLS policies for passes
CREATE POLICY "Users can view their own passes" ON public.passes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own passes" ON public.passes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own passes" ON public.passes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authorities can view all passes" ON public.passes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);
CREATE POLICY "Authorities can update all passes" ON public.passes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Create RLS policies for crowd_data
CREATE POLICY "Authorities can view crowd data" ON public.crowd_data FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);
CREATE POLICY "System can insert crowd data" ON public.crowd_data FOR INSERT WITH CHECK (true);

-- Create RLS policies for iot_logs
CREATE POLICY "Authorities can view iot logs" ON public.iot_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);
CREATE POLICY "System can insert iot logs" ON public.iot_logs FOR INSERT WITH CHECK (true);

-- Create RLS policies for alerts
CREATE POLICY "Authorities can view alerts" ON public.alerts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);
CREATE POLICY "System can insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorities can update alerts" ON public.alerts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Create RLS policies for penalties
CREATE POLICY "Users can view their own penalties" ON public.penalties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create penalties" ON public.penalties FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorities can view all penalties" ON public.penalties FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);
CREATE POLICY "Authorities can update penalties" ON public.penalties FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Create RLS policies for extensions
CREATE POLICY "Users can view their own extensions" ON public.extensions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create extensions" ON public.extensions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorities can view all extensions" ON public.extensions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_passes_updated_at BEFORE UPDATE ON public.passes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, aadhaar_number, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'aadhaar_number',
    COALESCE(new.raw_user_meta_data ->> 'role', 'pilgrim')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample zones
INSERT INTO public.zones (zone_id, zone_name, max_capacity, current_count, density, status) VALUES
('zone_1', 'Sangam Ghat', 15000, 12500, 83.33, 'warning'),
('zone_2', 'Akshaya Vat', 10000, 8200, 82.00, 'warning'),
('zone_3', 'Hanuman Temple', 8000, 5600, 70.00, 'normal'),
('zone_4', 'Patalpuri Temple', 5000, 2800, 56.00, 'normal'),
('zone_5', 'Saraswati Koop', 10000, 9400, 94.00, 'critical');

-- Insert sample crowd data
INSERT INTO public.crowd_data (zone_id, predicted_density, risk_level, recommendations) VALUES
('zone_1', 85.5, 'high', '["Redirect pilgrims to alternate routes", "Increase security personnel"]'),
('zone_2', 82.0, 'high', '["Monitor closely", "Prepare for crowd control"]'),
('zone_3', 70.0, 'medium', '["Normal operations", "Monitor entry flow"]'),
('zone_4', 56.0, 'low', '["Normal operations"]'),
('zone_5', 94.0, 'critical', '["Immediate crowd control required", "Consider temporary closure", "Emergency protocols activated"]);

-- Insert sample alerts
INSERT INTO public.alerts (zone_id, zone_name, alert_type, message, severity, resolved) VALUES
('zone_5', 'Saraswati Koop', 'capacity', 'Zone nearing maximum capacity - immediate action required', 'critical', false),
('zone_1', 'Sangam Ghat', 'crowd_pattern', 'Unusual crowd pattern detected - monitoring situation', 'high', false),
('zone_3', 'Hanuman Temple', 'maintenance', 'Emergency exit blocked - maintenance team dispatched', 'medium', true),
('zone_2', 'Akshaya Vat', 'weather', 'Strong winds expected in 2 hours - prepare safety measures', 'medium', false),
('zone_1', 'Sangam Ghat', 'security', 'Multiple failed QR scans detected - possible fraud attempt', 'high', false);