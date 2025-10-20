// ================================================================
// STAFF PERMISSIONS UTILITY
// ================================================================
// Helper functions to check staff permissions throughout the app
// ================================================================

export interface StaffPermissions {
  can_view_today: boolean
  can_check_in: boolean
  can_check_out: boolean
  can_approve_assessments: boolean
  can_manage_playgroups: boolean
  can_view_medications: boolean
  can_feed_dogs: boolean
  can_view_schedule: boolean
  can_view_reports: boolean
  can_manage_staff: boolean
}

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  can_view_today: true,
  can_check_in: true,
  can_check_out: true,
  can_approve_assessments: false,
  can_manage_playgroups: false,
  can_view_medications: true,
  can_feed_dogs: true,
  can_view_schedule: true,
  can_view_reports: false,
  can_manage_staff: false,
}

export const ADMIN_PERMISSIONS: StaffPermissions = {
  can_view_today: true,
  can_check_in: true,
  can_check_out: true,
  can_approve_assessments: true,
  can_manage_playgroups: true,
  can_view_medications: true,
  can_feed_dogs: true,
  can_view_schedule: true,
  can_view_reports: true,
  can_manage_staff: true,
}

/**
 * Check if user has a specific permission
 * Admins always have all permissions
 */
export function hasPermission(
  role: string,
  permissions: StaffPermissions | null,
  permissionKey: keyof StaffPermissions
): boolean {
  // Admins have all permissions
  if (role === 'admin') {
    return true
  }

  // Staff members need to check their specific permissions
  if (role === 'staff') {
    // If permissions not loaded yet or null, deny access
    if (!permissions) {
      return false
    }
    return permissions[permissionKey] === true
  }

  // Regular users have no staff permissions
  return false
}

/**
 * Get user permissions from profile
 * Returns ADMIN_PERMISSIONS for admins, actual permissions for staff
 */
export function getUserPermissions(
  role: string,
  staffPermissions: StaffPermissions | null
): StaffPermissions {
  if (role === 'admin') {
    return ADMIN_PERMISSIONS
  }

  if (role === 'staff') {
    return staffPermissions || DEFAULT_STAFF_PERMISSIONS
  }

  // Regular users get no permissions
  return {
    can_view_today: false,
    can_check_in: false,
    can_check_out: false,
    can_approve_assessments: false,
    can_manage_playgroups: false,
    can_view_medications: false,
    can_feed_dogs: false,
    can_view_schedule: false,
    can_view_reports: false,
    can_manage_staff: false,
  }
}

/**
 * Check if user can access staff dashboard at all
 */
export function canAccessStaffDashboard(role: string): boolean {
  return role === 'admin' || role === 'staff'
}

/**
 * Check if user can access admin dashboard
 */
export function canAccessAdminDashboard(role: string): boolean {
  return role === 'admin'
}

/**
 * Permission descriptions for UI display
 */
export const PERMISSION_DESCRIPTIONS: Record<keyof StaffPermissions, string> = {
  can_view_today: "View Today's Dogs",
  can_check_in: 'Check In Dogs',
  can_check_out: 'Check Out Dogs',
  can_approve_assessments: 'Approve/Deny Assessments',
  can_manage_playgroups: 'Manage Playgroups',
  can_view_medications: 'View Medications',
  can_feed_dogs: 'Mark Dogs as Fed',
  can_view_schedule: 'View Full Schedule',
  can_view_reports: 'View Reports & Analytics',
  can_manage_staff: 'Manage Other Staff',
}
