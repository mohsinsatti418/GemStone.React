import { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import AppRoutes from './routes/AppRoutes'

export default function App() {

  // Theme state
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  )

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    // Save theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // Toggle function
  const toggleTheme = () => {
    setTheme(prev =>
      prev === 'dark' ? 'light' : 'dark'
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-1)',
        color: 'var(--text-primary)',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main  className="container py-8">
        <AppRoutes />
      </main>
    </div>
  )
}