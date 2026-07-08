import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { verifyApiPermission } from '@/lib/server-rbac';

export async function GET(request: NextRequest) {
  const authCheck = await verifyApiPermission(request, 'user_management');
  if (!authCheck.authorized) return authCheck.errorResponse!;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, permissions, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users: data || [] });
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

    // Requirement 1 & 5: Only Super Admin can create new admins
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

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      password,
      role,
      permissions: permissions || {},
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

    // Requirement 1: Super Admin cannot have their own permissions/role modified or deleted
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
