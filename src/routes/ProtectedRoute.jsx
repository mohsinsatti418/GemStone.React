import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─────────────────────────────────────────────
// ProtectedRoute
//
// Wraps any route that only admins can visit.
// If the user is not logged in → send to /login
// If the user is logged in but not admin → send to /
// If the user is admin → render the page normally
//
// Usage in AppRoutes.jsx:
//
//   <Route
//     path="/gemstones/create"
//     element={
//       <ProtectedRoute>
//         <GemStoneCreate />
//       </ProtectedRoute>
//     }
//   />
// ─────────────────────────────────────────────

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const location = useLocation()

  // Not logged in at all → go to login page
  // We save the page they tried to visit in state.
  // After login succeeds, Login.jsx will redirect them
  // back to where they were trying to go.
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // Logged in but not an admin → go to home
  // This handles the case where a regular User account
  // somehow has a valid token but is not an Admin.
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  // All checks passed — render the protected page
  return children
}