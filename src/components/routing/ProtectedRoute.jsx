import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, getRole, guessRoleFromPath } from '../../utils/auth'

/**
 * ProtectedRoute wraps a route element and enforces authentication.
 * - If not authenticated: redirect to role-specific login if path hints a role, otherwise to landing.
 * - If allowedRole is provided and user's role mismatches: redirect to user's own dashboard.
 */
export default function ProtectedRoute({ allowedRole, children }) {
  const location = useLocation()
  const authed = isAuthenticated()

  if (!authed) {
    const roleFromPath = guessRoleFromPath(location.pathname)
    // Send to role-based login if path suggests it, else landing
    const loginPath = roleFromPath ? `/auth/${roleFromPath}` : '/'
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (allowedRole) {
    const userRole = getRole()
    if (userRole !== allowedRole) {
      // User is logged in but trying to access another role's route
      return <Navigate to={`/${userRole}`} replace />
    }
  }

  return children
}
