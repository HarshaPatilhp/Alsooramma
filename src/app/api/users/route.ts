import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { verifyApiPermission } from '@/lib/server-rbac';

const DEFAULT_VOLUNTEER_PERMISSIONS = {
  dashboard: true,
  qr_checkin: true,
  devotees: true,
  activity_log: true,
};

const DEFAULT_SUPER_ADMIN_PERMISSIONS = {
  dashboard: true,
  qr_checkin: true,
  devotees: true,
  activity_log: true,
  seva_dashboard: true,
  donations: true,
  annadanam: true,
  reports: true,
  user_management: true,
};

export async function GET(request: NextRequest) {
  // Check identity from headers/cookies without blocking on strict 'user_management' permission just to view the table
  const authCheck = await verifyApiPermission(request, []);
  if (!authCheck.authorized) {
    const userId = request.headers.get('x-user-id') || request.cookies.get('temple_auth_user_id')?.value;
    const userEmail = request.headers.get('x-user-email') || request.cookies.get('temple_auth_user_email')?.value;
    if (!userId && !userEmail) {
      return authCheck.errorResponse!;
    }
  }

  try {
    const supabase = await createClient();

    // 1. Fetch current users from Supabase table
    let { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, permissions, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/users supabase error:', error.message);
    }

    // 2. Ensure Master Admin (admin@temple.com) exists in the database table
    let hasMasterAdmin = Array.isArray(users) && users.some((u) => u.email === 'admin@temple.com');

    if (!hasMasterAdmin) {
      const masterAdminUser = {
        id: '1',
        name: 'Master Admin',
        email: 'admin@temple.com',
        password: 'admin123',
        phone: '9876543210',
        role: 'super_admin',
        permissions: DEFAULT_SUPER_ADMIN_PERMISSIONS,
      };

      try {
        const { data: insertedAdmin, error: insErr } = await supabase
          .from('users')
          .upsert([masterAdminUser], { onConflict: 'email' })
          .select('id, name, email, phone, role, permissions, created_at')
          .single();

        if (!insErr && insertedAdmin) {
          if (!Array.isArray(users)) users = [];
          users.unshift(insertedAdmin);
          hasMasterAdmin = true;
        }
      } catch (seedErr) {
        console.warn('Failed to seed Master Admin to DB:', seedErr);
      }
    }

    // 3. If table was completely empty or failed to retrieve, re-query or provide fallback
    if (!users || users.length === 0) {
      const fallbackList: any[] = [];

      if (authCheck.user) {
        fallbackList.push(authCheck.user);
      }

      if (!fallbackList.some((u) => u.email === 'admin@temple.com')) {
        fallbackList.push({
          id: '1',
          name: 'Master Admin',
          email: 'admin@temple.com',
          phone: '9876543210',
          role: 'super_admin',
          permissions: DEFAULT_SUPER_ADMIN_PERMISSIONS,
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true, users: fallbackList, isFallback: true });
    }

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error('GET /api/users error:', err.message);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users', error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role, permissions } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required user fields' },
        { status: 400 }
      );
    }

    // Only Super Admin can create new admins or manage personnel
    const requireSuperAdmin = role === 'admin' || role === 'super_admin';
    const authCheck = await verifyApiPermission(request, 'user_management', requireSuperAdmin);
    if (!authCheck.authorized) return authCheck.errorResponse!;

    const supabase = await createClient();

    // Check if email already exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    // Assign default permissions based on role if missing
    let assignedPermissions = permissions || {};
    if (role === 'volunteer' && Object.keys(assignedPermissions).length === 0) {
      assignedPermissions = DEFAULT_VOLUNTEER_PERMISSIONS;
    } else if (role === 'super_admin') {
      assignedPermissions = DEFAULT_SUPER_ADMIN_PERMISSIONS;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      password,
      role,
      permissions: assignedPermissions,
    };

    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, user: data, message: 'User invited successfully' });
  } catch (err: any) {
    console.error('POST /api/users error:', err.message);
    return NextResponse.json(
      { success: false, message: 'Failed to create user', error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await verifyApiPermission(request, 'user_management');
  if (!authCheck.authorized) return authCheck.errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('id');

    if (!targetId) {
      return NextResponse.json({ success: false, message: 'Missing user id parameter' }, { status: 400 });
    }

    const supabase = await createClient();

    // Inspect target user
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', targetId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });
    }

    // Requirement: Super Admin account cannot be deleted or modified
    if (targetUser.role === 'super_admin' || targetUser.email === 'admin@temple.com') {
      return NextResponse.json(
        { success: false, message: 'Access Denied (403): The Super Admin account cannot be deleted or modified.' },
        { status: 403 }
      );
    }

    // Only Super Admin can delete regular admins
    if (targetUser.role === 'admin' && authCheck.user?.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: 'Access Denied (403): Only the Super Admin can revoke access for administrators.' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase.from('users').delete().eq('id', targetId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: 'User access revoked successfully' });
  } catch (err: any) {
    console.error('DELETE /api/users error:', err.message);
    return NextResponse.json(
      { success: false, message: 'Failed to revoke user access', error: err.message },
      { status: 500 }
    );
  }
}
