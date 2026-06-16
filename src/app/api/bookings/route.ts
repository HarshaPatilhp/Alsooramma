import { NextRequest, NextResponse } from 'next/server';
import { getBookings, addBooking } from '@/lib/googleSheets';

export async function GET() {
  try {
    const data = await getBookings();
    return NextResponse.json({ success: true, bookings: data });
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

    await addBooking(booking);
    return NextResponse.json({ success: true, message: 'Booking saved to Google Sheets' });
  } catch (error: any) {
    console.error('API POST booking error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to save booking', error: error.message }, { status: 500 });
  }
}
