import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map snake_case from DB back to camelCase for the frontend
    const mappedBookings = (data || []).map((row) => ({
      id: row.id,
      devoteeName: row.devotee_name,
      email: row.email,
      phone: row.phone,
      sevaName: row.seva_name,
      date: row.date,
      time: row.time,
      numberOfPeople: row.number_of_people,
      gotra: row.gotra,
      nakshatra: row.nakshatra,
      hall: row.hall,
      tirthaPrasadaRequired: row.tirtha_prasada_required,
      tirthaPrasadaCount: row.tirtha_prasada_count,
      lunchRequired: row.lunch_required,
      lunchCount: row.lunch_count,
      lunchHall: row.lunch_hall,
      specialRequests: row.special_requests,
      status: row.status,
      sevaCost: row.seva_cost,
      lunchCost: row.lunch_cost,
      totalCost: row.total_cost,
      qrCode: row.qr_code,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, bookings: mappedBookings });
  } catch (error: any) {
    console.error('API GET bookings error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to fetch bookings', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking } = body;

    if (!booking || !booking.id) {
      return NextResponse.json({ success: false, message: 'Invalid booking data payload' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Map camelCase from frontend to snake_case for DB
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          id: booking.id,
          devotee_name: booking.devoteeName || booking.fullName || '',
          email: booking.email || '',
          phone: booking.phone || '',
          seva_name: booking.sevaName || '',
          date: booking.date || '',
          time: booking.time || '',
          number_of_people: String(booking.numberOfPeople || '1'),
          gotra: booking.gotra || '',
          nakshatra: booking.nakshatra || '',
          hall: booking.hall || '',
          tirtha_prasada_required: !!booking.tirthaPrasadaRequired,
          tirtha_prasada_count: booking.tirthaPrasadaCount || 0,
          lunch_required: !!booking.lunchRequired,
          lunch_count: booking.lunchCount || 0,
          lunch_hall: booking.lunchHall || '',
          special_requests: booking.specialRequests || '',
          status: booking.status || 'confirmed',
          seva_cost: String(booking.sevaCost || ''),
          lunch_cost: booking.lunchCost || 0,
          total_cost: booking.totalCost || 0,
          qr_code: String(booking.qrCode || booking.id || ''),
          created_at: booking.createdAt || new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Booking saved to Supabase' });
  } catch (error: any) {
    console.error('API POST booking error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to save booking', error: error.message }, { status: 500 });
  }
}
