import { createContext, useContext, useState, useCallback } from 'react'

// ─────────────────────────────────────────────
// Your .NET API uses ClaimTypes constants which
// expand to long URLs inside the JWT payload.
// These are the exact keys from your jwt.io output:
//
// ClaimTypes.NameIdentifier →
//   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
//
// ClaimTypes.Name →
//   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
//
// ClaimTypes.Email →
//   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
//
// ClaimTypes.Role →
//   "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
//
// We define them as constants so if they ever change
// we fix it in one place.
// ─────────────────────────────────────────────

const CLAIM_ID    = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const CLAIM_NAME  = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
const CLAIM_ROLE  = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

const AuthContext = createContext(null)
const STORAGE_KEY = 'gemvault_auth'

// ─────────────────────────────────────────────
// Decode JWT payload
// A JWT is three Base64url strings joined by dots.
// The middle one is the payload — we decode it to
// read the claims your API embedded.
// ─────────────────────────────────────────────

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    // Base64url uses - and _ instead of + and /
    const base64  = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json    = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// Check expiry
// JWT exp claim is Unix seconds, Date.now() is ms
// ─────────────────────────────────────────────

function isExpired(decoded) {
  if (!decoded?.exp) return false
  return decoded.exp * 1000 < Date.now()
}

// ─────────────────────────────────────────────
// Build a clean user object from decoded claims
// ─────────────────────────────────────────────

function buildUser(decoded) {
  if (!decoded) return null
  return {
    id:       decoded[CLAIM_ID]    || null,
    username: decoded[CLAIM_NAME]  || 'Admin',
    email:    decoded[CLAIM_EMAIL] || null,
    role:     decoded[CLAIM_ROLE]  || 'User',
    exp:      decoded.exp          || null,
  }
}

// ─────────────────────────────────────────────
// Read saved token from localStorage on startup
// ─────────────────────────────────────────────

function getStoredToken() {
  try {
    const token = localStorage.getItem(STORAGE_KEY)
    if (!token) return null

    const decoded = decodeToken(token)
    if (!decoded || isExpired(decoded)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return token
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())

  // Decode once — re-derives whenever token changes
  const decoded = token ? decodeToken(token) : null
  const user    = buildUser(decoded)
  const isAdmin = user?.role === 'Admin'

  // ── login ──────────────────────────────────
  // Your API returns AuthResponseVM.
  // We only need to store the token — everything
  // else (username, role, email) is inside it.
  // Usage:  login(data.token)
  const login = useCallback((newToken) => {
    const dec = decodeToken(newToken)
    if (!dec || isExpired(dec)) {
      console.error('AuthContext: invalid or expired token')
      return
    }
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }, [])

  // ── logout ─────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [])

  // ── getAuthHeader ──────────────────────────
  // Returns { Authorization: 'Bearer eyJ...' }
  // Pass this to any protected API call:
  //   gemstoneApi.create(fd, { headers: getAuthHeader() })
  const getAuthHeader = useCallback(() => {
    if (!token) return {}
    return { Authorization: `Bearer ${token}` }
  }, [token])

  const value = {
    token,
    user,           // { id, username, email, role, exp }
    isLoggedIn: !!token,
    isAdmin,        // true only when role === 'Admin'
    login,          // call with token string from API response
    logout,
    getAuthHeader,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}