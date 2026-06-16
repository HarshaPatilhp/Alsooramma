import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing booking ID or status' }, { status: 400 });
    }

    await updateBookingStatus(id, status);
    return NextResponse.json({ success: true, message: 'Booking status updated in Google Sheets' });
  } catch (error: any) {
    console.error('API update booking error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to update booking status', error: error.message }, { status: 500 });
  }
}
