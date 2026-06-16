CREATE TABLE public.bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    seva_type TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add Row Level Security (RLS) policies if needed
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public inserts" ON public.bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public read" ON public.bookings FOR SELECT USING (true);
