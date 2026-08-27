import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vazubvimmrqyofjlbzds.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1P6fPpaeHSUnCIMEI-mwDA_r0sDE3VP';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: dbRows, error } = await supabase
      .from('scan_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(dbRows)) {
      return NextResponse.json({ success: true, scans: dbRows });
    }

    return NextResponse.json({ success: true, scans: [] });
  } catch (e: any) {
    console.error('Error fetching scan history from Supabase:', e);
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const numericId = Date.now();

    const formattedStatus = body.formattedStatus || `VOLUNTEER_BADGE:${body.badge || '🎖️ Active Swayamsevak'} | ${body.name || body.volunteer_name || body.devotee_name || 'Swayamsevak'} | ${body.duty || body.seva_name || 'Temple Operations'} | Verified`;

    const record = {
      id: String(numericId),
      booking_id: numericId,
      status: formattedStatus,
      scanned_at: body.scanned_at || new Date().toLocaleString('en-IN'),
      scanned_by: body.scanned_by || 'Master Admin Scanner',
    };

    const { data, error } = await supabase.from('scan_history').insert([record]).select().single();

    if (error) {
      console.warn('Supabase scan_history insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, record: data });
  } catch (err: any) {
    console.error('Failed to record scan in database:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
