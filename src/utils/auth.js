// Lightweight auth utilities for client-side guards
// We rely on localStorage 'token' and 'session' set by RoleAuth.jsx

export function getToken() {
  try { return localStorage.getItem('token') || null } catch { return null }
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem('session') || 'null') } catch { return null }
}

export function decodeJwt(token) {
  if (!token || typeof token !== 'string' || token.split('.').length < 2) return null
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch (e) {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token)
  if (!payload || !payload.exp) return false // if no exp, assume not expired
  const nowSec = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSec
}

export function isAuthenticated() {
  const t = getToken()
  if (!t) return false
  if (isTokenExpired(t)) return false
  const sess = getSession()
  return !!(sess && sess.user && (sess.role || sess.user.role))
}

export function getRole() {
  const sess = getSession()
  return sess?.role || sess?.user?.role || null
}

export function guessRoleFromPath(pathname) {
  if (!pathname) return null
  if (pathname.startsWith('/doctor') || pathname.startsWith('/profile/doctor')) return 'doctor'
  if (pathname.startsWith('/patient') || pathname.startsWith('/profile/patient')) return 'patient'
  if (pathname.startsWith('/pharmacy') || pathname.startsWith('/profile/pharmacy')) return 'pharmacy'
  return null
}

export function clearAuth() {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('session')
  } catch {}
}
