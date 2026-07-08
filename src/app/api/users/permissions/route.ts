import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { verifyApiPermission } from '@/lib/server-rbac';

export async function PUT(request: NextRequest) {
  // Requirement 1: Only the Super Admin can assign, edit, or revoke permissions for other admins.
  const authCheck = await verifyApiPermission(request, [], true);
  if (!authCheck.authorized) return authCheck.errorResponse!;

  try {
    const body = await request.json();
    const { userId, permissions } = body;

    if (!userId || !permissions || typeof permissions !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload: userId and permissions object required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check target user role to ensure Super Admin is protected
    const { data: targetUser, error: queryError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .single();

    if (queryError || !targetUser) {
      return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });
    }

    // Requirement 1: The Super Admin cannot have their own permissions modified.
    if (targetUser.role === 'super_admin' || targetUser.email === 'admin@temple.com') {
      return NextResponse.json(
        {
          success: false,
          message: 'Access Denied (403): The Super Admin has unrestricted access and cannot have permissions modified.',
        },
        { status: 403 }
      );
    }

    // Update JSONB permissions in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Optional sync to public.admin_permissions for relational reporting
    try {
      await supabase.from('admin_permissions').upsert({
        id: `perm_${userId}`,
        admin_id: userId,
        dashboard: !!permissions.dashboard,
        qr_checkin: !!permissions.qr_checkin,
        devotees: !!permissions.devotees,
        activity_log: !!permissions.activity_log,
        seva_dashboard: !!permissions.seva_dashboard,
        donations: !!permissions.donations,
        annadanam: !!permissions.annadanam,
        reports: !!permissions.reports,
        user_management: !!permissions.user_management,
        permissions,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'admin_id' });
    } catch (syncErr) {
      console.warn('Optional admin_permissions sync failed, ignored:', syncErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin permissions updated successfully',
      permissions,
    });
  } catch (err: any) {
    console.error('PUT /api/users/permissions error:', err.message);
    return NextResponse.json(
      { success: false, message: 'Failed to update admin permissions', error: err.message },
      { status: 500 }
    );
  }
}
