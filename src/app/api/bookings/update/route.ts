import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { verifyApiPermission } from '@/lib/server-rbac';

export async function POST(request: NextRequest) {
  const authCheck = await verifyApiPermission(request, ['qr_checkin', 'devotees', 'seva_dashboard', 'dashboard', 'reports']);
  if (!authCheck.authorized) return authCheck.errorResponse!;

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing booking ID or status' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('bookings')
      .update({ status: String(status) })
      .eq('id', String(id));

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Booking status updated in Supabase' });
  } catch (error: any) {
    console.error('API update booking error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to update booking status', error: error.message }, { status: 500 });
  }
}
