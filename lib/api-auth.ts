// ================================================================
// API AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ================================================================
// Server-side permission checking for API routes
// ================================================================

import { supabase } from '@/lib/supabase'
import { StaffPermissions } from '@/lib/permissions'
import { NextRequest } from 'next/server'

export interface AuthUser {
  id: string
  email: string
  role: string
  permissions: StaffPermissions | null
}

/**
 * Get authenticated user from request
 * Returns user info or null if not authenticated
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    // Get session from Supabase
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return null
    }

    // Get user profile with role and permissions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, staff_permissions')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      permissions: profile.staff_permissions as StaffPermissions | null,
    }
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

/**
 * Require admin role
 * Returns user or throws 403 error
 */
export async function requireAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req)

  if (!user) {
    throw new Error('Unauthorized - Please log in')
  }

  if (user.role !== 'admin') {
    throw new Error('Forbidden - Admin access required')
  }

  return user
}

/**
 * Require staff or admin role
 * Returns user or throws 403 error
 */
export async function requireStaff(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req)

  if (!user) {
    throw new Error('Unauthorized - Please log in')
  }

  if (user.role !== 'admin' && user.role !== 'staff') {
    throw new Error('Forbidden - Staff access required')
  }

  return user
}

/**
 * Require specific permission
 * Admins always pass, staff must have the specific permission
 */
export async function requirePermission(
  req: NextRequest,
  permissionKey: keyof StaffPermissions
): Promise<AuthUser> {
  const user = await requireStaff(req)

  // Admins have all permissions
  if (user.role === 'admin') {
    return user
  }

  // Check staff permission
  if (!user.permissions || !user.permissions[permissionKey]) {
    throw new Error(`Forbidden - Permission required: ${permissionKey}`)
  }

  return user
}

/**
 * Check if user owns resource
 * Used for user-specific endpoints
 */
export async function requireOwnership(
  req: NextRequest,
  resourceUserId: string
): Promise<AuthUser> {
  const user = await getAuthUser(req)

  if (!user) {
    throw new Error('Unauthorized - Please log in')
  }

  // Admins can access any resource
  if (user.role === 'admin') {
    return user
  }

  // Users can only access their own resources
  if (user.id !== resourceUserId) {
    throw new Error('Forbidden - You can only access your own resources')
  }

  return user
}

/**
 * Standard error response helper
 */
export function errorResponse(error: any, defaultStatus = 500) {
  const message = error instanceof Error ? error.message : 'Internal server error'

  let status = defaultStatus
  if (message.includes('Unauthorized')) {
    status = 401
  } else if (message.includes('Forbidden')) {
    status = 403
  }

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
