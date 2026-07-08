import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { hasPermission, PermissionKey, RBACUser } from '@/lib/rbac';

export interface VerifyPermissionResult {
  authorized: boolean;
  user?: RBACUser;
  errorResponse?: NextResponse;
}

/**
 * Server-side verification middleware helper for API routes.
 * Ensures the requesting user has the required permission(s) or Super Admin role.
 * Queries the `users` table directly in Supabase to verify fresh server-side authorization.
 */
export async function verifyApiPermission(
  request: NextRequest,
  requiredPermissions: PermissionKey | PermissionKey[] = [],
  requireSuperAdmin = false
): Promise<VerifyPermissionResult> {
  try {
    // 1. Extract identity from request headers (sent by fetch wrappers) or cookies
    const userId = request.headers.get('x-user-id') || request.cookies.get('temple_auth_user_id')?.value;
    const userEmail = request.headers.get('x-user-email') || request.cookies.get('temple_auth_user_email')?.value;

    if (!userId && !userEmail) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, message: 'Access Denied (401): Authentication identity missing' },
          { status: 401 }
        ),
      };
    }

    // 2. Fetch user details directly from Supabase `users` table
    const supabase = await createClient();
    let query = supabase.from('users').select('*');
    if (userId) {
      query = query.eq('id', userId);
    } else if (userEmail) {
      query = query.eq('email', userEmail);
    }

    const { data: userData, error } = await query.single();

    let user: RBACUser | null = null;

    if (userData && !error) {
      user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions || {},
      };
    } else if (userEmail === 'admin@temple.com') {
      // Fallback for master admin if DB row is not yet initialized/seeded
      user = {
        id: '1',
        name: 'Master Admin',
        email: 'admin@temple.com',
        role: 'super_admin',
        permissions: {},
      };
    }

    if (!user) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, message: 'Access Denied (401): User account not found or inactive' },
          { status: 401 }
        ),
      };
    }

    // Ensure Master Admin (`admin@temple.com`) is always `super_admin`
    if (user.email === 'admin@temple.com' && user.role !== 'super_admin') {
      user.role = 'super_admin';
    }

    // 3. Verify Super Admin restriction if required
    if (requireSuperAdmin) {
      if (user.role !== 'super_admin') {
        return {
          authorized: false,
          errorResponse: NextResponse.json(
            {
              success: false,
              message: 'Access Denied (403): Only the Super Admin can perform this action or modify permissions.',
            },
            { status: 403 }
          ),
        };
      }
      return { authorized: true, user };
    }

    // 4. Verify specific permission requirement
    const permsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    if (permsToCheck.length === 0) {
      return { authorized: true, user };
    }

    const hasAnyRequired = permsToCheck.some((permKey) => hasPermission(user, permKey));

    if (!hasAnyRequired && user.role !== 'super_admin') {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          {
            success: false,
            message: `Access Denied (403): You do not have permission to access [${permsToCheck.join(' or ')}].`,
          },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, user };
  } catch (err: any) {
    console.error('API Permission Middleware Error:', err);
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, message: 'Access Denied (500): Server error verifying access permissions' },
        { status: 500 }
      ),
    };
  }
}
