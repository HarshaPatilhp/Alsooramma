require('dotenv').config();
global.WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// ─── Init ─────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Supabase Client ──────────────────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role bypasses RLS

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',           // Allow all origins (frontend can be any device/domain)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a unique booking ID like "SEVA4F2K9A"
 */
function generateBookingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SEVA${suffix}`;
}

/**
 * Validate date string is YYYY-MM-DD format
 */
function isValidDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d.getTime());
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Seva Booking API',
    version: '1.0.0',
    endpoints: {
      create: 'POST /api/bookings',
      get: 'GET /api/bookings/:id',
    },
  });
});

// ─── POST /api/bookings ───────────────────────────────────────────────────────
// Create a new seva booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, phone, seva_type, date } = req.body;

    // ── Input Validation ──
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('name is required and must be at least 2 characters.');
    }
    if (!phone || typeof phone !== 'string' || !/^\d{10,15}$/.test(phone.replace(/[\s\-+]/g, ''))) {
      errors.push('phone is required and must be a valid 10–15 digit number.');
    }
    if (!seva_type || typeof seva_type !== 'string' || seva_type.trim().length < 2) {
      errors.push('seva_type is required.');
    }
    if (!date || !isValidDate(date)) {
      errors.push('date is required and must be in YYYY-MM-DD format.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // ── Generate unique booking ID ──
    let booking_id;
    let attempts = 0;
    do {
      booking_id = generateBookingId();
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', booking_id)
        .single();
      if (!existing) break;
      attempts++;
    } while (attempts < 5);

    // ── Insert into Supabase ──
    const { error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          id:        booking_id,
          name:      name.trim(),
          phone:     phone.trim(),
          seva_type: seva_type.trim(),
          date:      date,
        },
      ]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Database error while creating booking.',
        detail: insertError.message,
      });
    }

    console.log(`✅ Booking created: ${booking_id} | ${name} | ${seva_type} | ${date}`);

    return res.status(201).json({
      success: true,
      booking_id,
    });

  } catch (err) {
    console.error('Unexpected error in POST /api/bookings:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /api/bookings/:id ────────────────────────────────────────────────────
// Retrieve a booking by its ID (used by QR scanner / verify page)
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id.trim().toUpperCase())
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    console.log(`🔍 Booking fetched: ${id}`);

    return res.status(200).json({
      success: true,
      booking: {
        id:        data.id,
        name:      data.name,
        phone:     data.phone,
        seva_type: data.seva_type,
        date:      data.date,
        created_at: data.created_at,
      },
    });

  } catch (err) {
    console.error('Unexpected error in GET /api/bookings/:id:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Seva Booking API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`   POST   http://localhost:${PORT}/api/bookings`);
  console.log(`   GET    http://localhost:${PORT}/api/bookings/:id\n`);
});
