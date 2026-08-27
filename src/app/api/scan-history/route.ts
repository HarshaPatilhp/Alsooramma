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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    if (deleteAll) {
      const { error } = await supabase.from('scan_history').delete().neq('id', '0');
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'All scan records cleared' });
    }

    if (id) {
      const { error } = await supabase.from('scan_history').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `Record ${id} deleted` });
    }

    // Support JSON body for bulk deletion
    const body = await request.json().catch(() => ({}));
    if (body.ids && Array.isArray(body.ids)) {
      const { error } = await supabase.from('scan_history').delete().in('id', body.ids);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `${body.ids.length} records deleted` });
    }

    return NextResponse.json({ success: false, message: 'ID or IDs required' }, { status: 400 });
  } catch (err: any) {
    console.error('Delete scan history error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
