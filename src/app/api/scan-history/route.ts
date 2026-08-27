import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vazubvimmrqyofjlbzds.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1P6fPpaeHSUnCIMEI-mwDA_r0sDE3VP';

const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory fallback cache
let inMemoryScanHistory: any[] = [];

export async function GET() {
  try {
    const { data: dbRows, error } = await supabase
      .from('scan_history')
      .select('*')
      .order('scanned_at', { ascending: false });

    if (!error && Array.isArray(dbRows) && dbRows.length > 0) {
      // Merge with in-memory
      const combined = [...dbRows];
      inMemoryScanHistory.forEach(mem => {
        if (!combined.some(db => db.id === mem.id || (db.booking_id === mem.booking_id && db.scanned_at === mem.scanned_at))) {
          combined.push(mem);
        }
      });
      return NextResponse.json({ success: true, scans: combined });
    }

    return NextResponse.json({ success: true, scans: inMemoryScanHistory });
  } catch (e: any) {
    console.error('Error fetching scan history:', e);
    return NextResponse.json({ success: true, scans: inMemoryScanHistory });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const record = {
      id: body.id || `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      booking_id: body.booking_id || `VOL-${Date.now()}`,
      devotee_name: body.devotee_name || body.volunteer_name || 'Swayamsevak',
      seva_name: body.seva_name || '[Volunteer Badge: 🎖️ Active Swayamsevak] General Seva',
      status: body.status || 'Badge Awarded',
      scanned_at: body.scanned_at || new Date().toISOString(),
      scanned_by: body.scanned_by || 'Gate Scanner',
    };

    inMemoryScanHistory.unshift(record);

    try {
      await supabase.from('scan_history').insert([record]);
    } catch (dbErr) {
      console.warn('Supabase scan_history insert fallback:', dbErr);
    }

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    console.error('Failed to record scan:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
