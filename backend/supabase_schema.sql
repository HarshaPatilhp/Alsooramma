-- Drop the existing table if it exists to recreate it cleanly
DROP TABLE IF EXISTS public.bookings;

CREATE TABLE public.bookings (
    id BIGINT PRIMARY KEY,
    devotee_name TEXT,
    email TEXT,
    phone TEXT,
    seva_name TEXT,
    date TEXT,
    time TEXT,
    number_of_people TEXT,
    gotra TEXT,
    nakshatra TEXT,
    hall TEXT,
    tirtha_prasada_required BOOLEAN,
    tirtha_prasada_count INTEGER,
    lunch_required BOOLEAN,
    lunch_count INTEGER,
    lunch_hall TEXT,
    special_requests TEXT,
    status TEXT,
    seva_cost TEXT,
    lunch_cost NUMERIC,
    total_cost NUMERIC,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow the API to interact with the table
CREATE POLICY "Allow all operations" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------
-- NEW TABLES: DONATIONS, ANNADANAM, USERS, SCAN HISTORY --
-- --------------------------------------------------------

-- DONATIONS TABLE
DROP TABLE IF EXISTS public.donations;
CREATE TABLE public.donations (
    id TEXT PRIMARY KEY,
    donor_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    purpose TEXT NOT NULL,
    receipt_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on donations" ON public.donations FOR ALL USING (true) WITH CHECK (true);

-- ANNADANAM TABLE
DROP TABLE IF EXISTS public.annadanam;
CREATE TABLE public.annadanam (
    id TEXT PRIMARY KEY,
    sponsor_name TEXT NOT NULL,
    contact TEXT NOT NULL,
    date TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.annadanam ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on annadanam" ON public.annadanam FOR ALL USING (true) WITH CHECK (true);

-- USERS TABLE (Supports super_admin, admin, volunteer roles and JSONB permissions)
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- ADMIN PERMISSIONS TABLE (Alternative / Relational structure for RBAC compliance)
DROP TABLE IF EXISTS public.admin_permissions CASCADE;
CREATE TABLE public.admin_permissions (
    id TEXT PRIMARY KEY,
    admin_id TEXT UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    dashboard BOOLEAN DEFAULT false,
    qr_checkin BOOLEAN DEFAULT false,
    devotees BOOLEAN DEFAULT false,
    activity_log BOOLEAN DEFAULT false,
    seva_dashboard BOOLEAN DEFAULT false,
    donations BOOLEAN DEFAULT false,
    annadanam BOOLEAN DEFAULT false,
    reports BOOLEAN DEFAULT false,
    user_management BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on admin_permissions" ON public.admin_permissions FOR ALL USING (true) WITH CHECK (true);

-- Insert / Seed Demo Users (Master Admin as Super Admin)
INSERT INTO public.users (id, name, email, password, phone, role, permissions) VALUES 
('1', 'Master Admin', 'admin@temple.com', 'admin123', '9876543210', 'super_admin', '{"dashboard":true,"qr_checkin":true,"devotees":true,"activity_log":true,"seva_dashboard":true,"donations":true,"annadanam":true,"reports":true,"user_management":true}'::jsonb),
('2', 'Scanner Vol 01', 'scanner1@vidyaranyapura-mutt.com', 'volunteer123', '9000000001', 'volunteer', '{"dashboard":true,"qr_checkin":true,"devotees":true,"activity_log":true}'::jsonb)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions;

-- SCAN HISTORY TABLE
DROP TABLE IF EXISTS public.scan_history;
CREATE TABLE public.scan_history (
    id TEXT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    scanned_at TEXT NOT NULL,
    status TEXT NOT NULL,
    scanned_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on scan_history" ON public.scan_history FOR ALL USING (true) WITH CHECK (true);
