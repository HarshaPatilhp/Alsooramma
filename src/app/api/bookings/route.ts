import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { verifyApiPermission } from '@/lib/server-rbac';

export async function GET(request: NextRequest) {
  // Allow authorized admins/volunteers to fetch bookings
  const authCheck = await verifyApiPermission(request, ['qr_checkin', 'seva_dashboard', 'reports', 'dashboard', 'devotees']);
  if (!authCheck.authorized) {
    // If not authorized via cookies/headers, return 403
    return authCheck.errorResponse!;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map snake_case from DB back to camelCase for the frontend
    const mappedBookings = (data || [])
      .filter((row) => (row.status || '').toLowerCase() !== 'deleted')
      .map((row) => ({
        id: row.id,
        devoteeName: row.devotee_name || '',
        email: row.email || '',
        phone: row.phone || '',
        sevaName: row.seva_name || '',
        date: row.date || '',
        time: row.time || '',
        numberOfPeople: row.number_of_people || '1',
        gotra: row.gotra || '',
        nakshatra: row.nakshatra || '',
        hall: row.hall || '',
        tirthaPrasadaRequired: !!row.tirtha_prasada_required,
        tirthaPrasadaCount: row.tirtha_prasada_count || 0,
        lunchRequired: !!row.lunch_required,
        lunchCount: row.lunch_count || 0,
        lunchHall: row.lunch_hall || '',
        specialRequests: row.special_requests || '',
        status: row.status || 'confirmed',
        sevaCost: row.seva_cost || '',
        lunchCost: row.lunch_cost || 0,
        totalCost: row.total_cost || 0,
        qrCode: row.qr_code || String(row.id || ''),
        createdAt: row.created_at || new Date().toISOString(),
      }));

    return NextResponse.json({ success: true, bookings: mappedBookings });
  } catch (error: any) {
    console.error('API GET bookings error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to fetch bookings', error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Public devotee bookings must NOT be blocked by admin permissions!
  try {
    const body = await request.json();
    const { booking } = body;

    if (!booking || !booking.id) {
      return NextResponse.json({ success: false, message: 'Invalid booking data payload' }, { status: 400 });
    }

    const supabase = await createClient();
    const bookingIdStr = String(booking.id);
    
    // Map camelCase from frontend to snake_case for DB
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          id: bookingIdStr,
          devotee_name: booking.devoteeName || booking.fullName || 'Devotee',
          email: booking.email || '',
          phone: booking.phone || '',
          seva_name: booking.sevaName || 'Seva Booking',
          date: booking.date || new Date().toISOString().split('T')[0],
          time: booking.time || '',
          number_of_people: String(booking.numberOfPeople || '1'),
          gotra: booking.gotra || '',
          nakshatra: booking.nakshatra || '',
          hall: booking.hall || '',
          tirtha_prasada_required: !!booking.tirthaPrasadaRequired,
          tirtha_prasada_count: Number(booking.tirthaPrasadaCount) || 0,
          lunch_required: !!booking.lunchRequired,
          lunch_count: Number(booking.lunchCount) || 0,
          lunch_hall: booking.lunchHall || '',
          special_requests: booking.specialRequests || '',
          status: booking.status || 'confirmed',
          seva_cost: String(booking.sevaCost || ''),
          lunch_cost: Number(booking.lunchCost) || 0,
          total_cost: Number(booking.totalCost) || 0,
          qr_code: String(booking.qrCode || bookingIdStr),
          created_at: booking.createdAt || new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Supabase booking insert error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Booking saved to Supabase' });
  } catch (error: any) {
    console.error('API POST booking error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to save booking', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Allow authorized admins/volunteers to delete bookings
  const authCheck = await verifyApiPermission(request, ['devotees', 'dashboard', 'reports', 'qr_checkin', 'seva_dashboard']);
  if (!authCheck.authorized) {
    return authCheck.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Booking ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', String(id));

    if (error) {
      console.error('Supabase DELETE booking error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Booking deleted successfully from database' });
  } catch (error: any) {
    console.error('API DELETE booking error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to delete booking', error: error.message }, { status: 500 });
  }
}
