// ─────────────────────────────────────────────
// interceptors.js
//
// WHY THIS FILE EXISTS:
// Without interceptors, every API call would need to:
//   1. Manually add Authorization header
//   2. Manually handle 401/403/500 errors
//
// That means 10 API functions × 2 = 20 places to maintain.
// Interceptors do it ONCE, automatically, for every request.
//
// An interceptor is middleware that sits between your code
// and the network:
//
//   Your code → [REQUEST INTERCEPTOR] → Network
//   Your code ← [RESPONSE INTERCEPTOR] ← Network
//
// Axios lets you attach functions that run at each step.
// ─────────────────────────────────────────────

import axios from 'axios'

// ─────────────────────────────────────────────
// Create the shared axios instance
// Every API call in the project uses this instance.
// Setting baseURL here means every call automatically
// prefixes the correct API URL.
// ─────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7000/api',
  headers: {
    'Content-Type': 'application/json',
    // ↑ Default content type for all requests.
    //   For FormData (file uploads) we override this
    //   per-request in gemstones.js because axios
    //   needs to set the boundary automatically.
  },
})

// ─────────────────────────────────────────────
// STORAGE KEY — must match AuthContext.jsx
// We read the token directly from localStorage here
// because interceptors run outside of React —
// they cannot use hooks or context.
// ─────────────────────────────────────────────

const STORAGE_KEY = 'gemvault_auth'

function getToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage can fail in some browsers (private mode)
    return null
  }
}

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs on EVERY outgoing request before it is sent.
//
// What it does:
//   If a token exists in localStorage, attach it to
//   the Authorization header automatically.
//
// This means:
//   gemstoneApi.getAll()         → no token (public)
//   gemstoneApi.create(formData) → token added automatically
//   gemstoneApi.delete(id)       → token added automatically
//
// Your .NET [Authorize] endpoints receive the token
// in the header and validate it.
// ─────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    // config = the full request configuration object:
    // { url, method, headers, data, params, ... }

    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // ↑ Attaches: Authorization: Bearer eyJhbGci...
      //   Your .NET API reads this header to verify identity.
      //   'Bearer' is the scheme — standard for JWT auth.
    }

    return config
    // ↑ MUST return config or the request is cancelled.
    //   Axios waits for this return before sending.
  },

  (error) => {
    // This branch handles errors that happen BEFORE
    // the request is even sent (e.g. network not available,
    // request config is invalid).
    // Very rare — but we must handle it.
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Runs on EVERY incoming response before your code sees it.
//
// What it does:
//   SUCCESS (2xx): pass response through unchanged
//   ERROR (4xx/5xx): extract a clean error message and
//                    handle special cases like 401
// ─────────────────────────────────────────────

apiClient.interceptors.response.use(

  // ── Success handler ──────────────────────────
  // Called for any response with status 2xx (200, 201, 204...)
  // We return the response unchanged — our API calls read .data
  (response) => {
    return response
  },

  // ── Error handler ────────────────────────────
  // Called for any response with status outside 2xx
  (error) => {
    // error.response = the server's response (if server replied)
    // error.request  = the request object (if no response received)
    // error.message  = generic axios error message

    const status   = error.response?.status
    const data     = error.response?.data

    // ── Extract a human-readable message ──────
    // Your .NET API can return errors in multiple shapes:
    //
    // Shape 1: { message: "Invalid credentials" }
    //   → from your custom exceptions / BadRequest(new { message })
    //
    // Shape 2: { title: "One or more validation errors occurred",
    //            errors: { Name: ["Name is required"] } }
    //   → from .NET ModelState validation
    //
    // Shape 3: No body (network error, timeout)
    //   → error.response is undefined
    //
    // We handle all three:

    let message = 'An unexpected error occurred. Please try again.'

    if (!error.response) {
      // No response at all — server unreachable or timeout
      message = 'Unable to connect. Please check your internet connection and try again.'
    } else if (data?.message) {
      // Shape 1: our custom error message
      message = data.message
    } else if (data?.title && data?.errors) {
      // Shape 2: .NET ModelState validation errors
      // errors = { Name: ["Name is required"], Price: ["Price must be > 0"] }
      // Flatten all messages into one string
      const allMessages = Object.values(data.errors)
        .flat()     // [ ["Name is required"], ["Price..."] ] → ["Name is required", "Price..."]
        .join(' ')  // "Name is required Price must be > 0"
      message = allMessages || data.title
    } else if (data?.title) {
      // Shape 3: title only, no errors object
      message = data.title
    }

    // ── Handle specific HTTP status codes ─────

    if (status === 401) {
      // 401 Unauthorized — token is missing, expired, or invalid
      //
      // What to do:
      // 1. Clear the stored token (it is no longer valid)
      // 2. Redirect to login page
      //
      // We cannot call useNavigate here (not a React component)
      // so we dispatch a custom browser event. AuthContext
      // listens for this event and handles the redirect.

      localStorage.removeItem(STORAGE_KEY)

      // Dispatch a custom event that App.jsx / AuthContext
      // can listen to and redirect to /login
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))

      message = 'Your session has ended. Please sign in to continue.'
    }

    if (status === 403) {
      // 403 Forbidden — token is valid but role is wrong
      // e.g. a regular User trying to DELETE a gemstone
      message = 'You are not authorised to perform this action.'
    }

    if (status === 404) {
      // 404 Not Found — resource does not exist
      message = data?.message || 'This item no longer exists or has been removed.'
    }

    if (status === 500) {
      // 500 Internal Server Error — bug in your .NET API
      message = 'Our server encountered a problem. Please try again in a moment.'
    }

    // ── Re-throw as a proper Error object ─────
    // All catch blocks in pages receive err.message
    // consistently regardless of what the server returned.
    return Promise.reject(new Error(message))
  }
)

// ─────────────────────────────────────────────
// Export the configured axios instance.
// gemstones.js imports this instead of creating
// its own axios instance.
// ─────────────────────────────────────────────

export default apiClient