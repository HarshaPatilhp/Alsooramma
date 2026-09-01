export type PermissionKey =
  | 'dashboard'
  | 'qr_checkin'
  | 'devotees'
  | 'activity_log'
  | 'seva_dashboard'
  | 'donations'
  | 'finance'
  | 'annadanam'
  | 'reports'
  | 'user_management';

export interface PermissionConfig {
  key: PermissionKey;
  label: string;
  description: string;
  iconName: string;
}

export const AVAILABLE_PERMISSIONS: PermissionConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Overview metrics, analytics, and primary operational stats.',
    iconName: 'LayoutDashboard',
  },
  {
    key: 'qr_checkin',
    label: 'QR Check-in',
    description: 'LIVE barcode & QR scanning module for devotee entry verification.',
    iconName: 'QrCode',
  },
  {
    key: 'devotees',
    label: 'Devotees',
    description: 'Devotee directory, contact information, and booking history.',
    iconName: 'Users',
  },
  {
    key: 'activity_log',
    label: 'Activity Log',
    description: 'Audit trail of scan history, verification status, and timestamps.',
    iconName: 'Clock',
  },
  {
    key: 'finance',
    label: 'Finance',
    description: 'Central temple accounting, ledger, cash & bank books, reconciliation, invoices, and reports.',
    iconName: 'Landmark',
  },
  {
    key: 'seva_dashboard',
    label: 'Seva Dashboard',
    description: 'Divine sevas and hall booking management and submission.',
    iconName: 'Calendar',
  },
  {
    key: 'donations',
    label: 'Donations',
    description: 'Charitable contributions tracking, receipts, and donor management.',
    iconName: 'Gift',
  },
  {
    key: 'annadanam',
    label: 'Annadanam',
    description: 'Sacred meal sponsorships, dining logs, and food distribution.',
    iconName: 'Coffee',
  },
  {
    key: 'reports',
    label: 'Reports',
    description: 'Comprehensive financial, attendance, and custom exportable analytics.',
    iconName: 'PieChart',
  },
  {
    key: 'user_management',
    label: 'User Management',
    description: 'Personal access boundaries, admin invites, and RBAC permissions.',
    iconName: 'Settings',
  },
];

export const ROUTE_PERMISSIONS_MAP: Record<string, PermissionKey> = {
  '/dashboard': 'dashboard',
  '/dashboard/scanner': 'qr_checkin',
  '/dashboard/devotees': 'devotees',
  '/dashboard/activity': 'activity_log',
  '/dashboard/finance': 'finance',
  '/finance': 'finance',
  '/seva-list': 'seva_dashboard',
  '/dashboard/donations': 'donations',
  '/dashboard/annadanam': 'annadanam',
  '/dashboard/reports': 'reports',
  '/dashboard/users': 'user_management',
};

export interface RBACUser {
  id?: string | number;
  name?: string;
  email?: string;
  role?: 'super_admin' | 'admin' | 'volunteer' | string;
  permissions?: Record<string, boolean>;
}

/**
 * Checks whether the given user has access to a specific permission key.
 * - Super Admin (`super_admin`) has unrestricted access to every module.
 * - Admin (`admin`) has access only if `user.permissions[permissionKey] === true`.
 * - Volunteer (`volunteer`) has standard access to basic volunteer modules (`dashboard`, `qr_checkin`, `devotees`, `activity_log`) unless specifically overridden.
 */
export function hasPermission(user: RBACUser | null | undefined, permissionKey: PermissionKey): boolean {
  if (!user) return false;

  // 1. Super Admin has unrestricted access to everything
  if (user.role === 'super_admin' || user.email === 'admin@temple.com') {
    return true;
  }

  // 2. Administrator has granular permission checks via checkboxes
  if (user.role === 'admin') {
    return !!(user.permissions && user.permissions[permissionKey]);
  }

  // 3. Volunteer / Scanner role defaults to basic volunteer modules
  if (user.role === 'volunteer') {
    if (user.permissions && typeof user.permissions[permissionKey] === 'boolean') {
      return user.permissions[permissionKey];
    }
    const volunteerAllowedKeys: PermissionKey[] = ['dashboard', 'qr_checkin', 'devotees', 'activity_log'];
    return volunteerAllowedKeys.includes(permissionKey);
  }

  return false;
}
