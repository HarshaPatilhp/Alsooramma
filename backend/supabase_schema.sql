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

-- USERS TABLE
DROP TABLE IF EXISTS public.users;
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Insert Demo Users
INSERT INTO public.users (id, name, email, password, phone, role) VALUES 
('1', 'Master Admin', 'admin@temple.com', 'admin123', '9876543210', 'admin'),
('2', 'Scanner Vol 01', 'scanner1@vidyaranyapura-mutt.com', 'volunteer123', '9000000001', 'volunteer')
ON CONFLICT (email) DO NOTHING;

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
