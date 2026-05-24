import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let _id = 0

// ─────────────────────────────────────────────
// Single toast component
// ─────────────────────────────────────────────

function Toast({ toast, onDismiss }) {
  const styles = {
    success: {
      bg: '#eef6f2',
      border: '#5a9478',
      icon: '✓',
      iconBg: '#2e5040',
    },
    error: {
      bg: '#fef2f2',
      border: '#fca5a5',
      icon: '✕',
      iconBg: '#ef4444',
    },
    info: {
      bg: '#fdf8ec',
      border: '#e2c56e',
      icon: 'i',
      iconBg: '#c49a2e',
    },
  }

  const s = styles[toast.type] || styles.info

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        background: s.bg,
        border: `1px solid ${s.border}`,
        boxShadow: 'var(--shadow-md)',
        minWidth: '280px',
        maxWidth: '380px',
        animation: 'toastSlideIn 0.25s ease',
      }}
    >
      {/* Icon circle */}
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: s.iconBg,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        {s.icon}
      </span>

      {/* Message */}
      <span
        style={{
          fontSize: '14px',
          color: '#0f1e18',
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {toast.message}
      </span>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#7a9589',
          fontSize: '18px',
          lineHeight: 1,
          padding: '0 2px',
          marginTop: '-1px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Expose a simple toast.success / toast.error / toast.info API
  const toast = {
    success: (msg, duration) => add(msg, 'success', duration),
    error: (msg, duration) => add(msg, 'error', duration),
    info: (msg, duration) => add(msg, 'info', duration),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — bottom-right */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx.toast
}