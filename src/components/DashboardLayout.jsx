import React, { useState, useMemo } from 'react'
import '../styles/doctor-dashboard.scss'
import { FaPills, FaCalendarAlt, FaClipboardList } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'

export default function DashboardLayout({ brand = 'MediChain', menuItems = [], active, setActive, children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('dashboardCollapsed') === 'true'
    } catch (e) { return false }
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get user info from session
  const session = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('session') || 'null') } catch { return null }
  }, [])
  
  const getUserDisplayName = () => {
    if (!session?.user) return 'User'
    
    const user = session.user
    const profile = user.profile || user
    
    // Try to get name from profile first, then fallback to user object
    const name = profile?.name || user?.name
    const email = profile?.email || user?.email
    const role = session?.role || user?.role
    
    if (name) {
      // Add appropriate prefix based on role
      if (role === 'doctor' && !name.toLowerCase().startsWith('dr')) {
        return `Dr. ${name}`
      }
      return name
    }
    
    // Fallback to email if no name
    if (email) return email
    
    // Final fallback
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'User'
  }

  const goToProfile = () => {
    // Decide profile route from current location (dashboard context)
    const p = location.pathname || ''
    if (p.startsWith('/doctor')) return navigate('/profile/doctor')
    if (p.startsWith('/pharmacy')) return navigate('/profile/pharmacy')
    if (p.startsWith('/patient')) return navigate('/profile/patient')
    // fallback
    return navigate('/profile')
  }

  const doLogout = () => navigate('/logout')

  return (
    <div className={`dashboard-shell ${collapsed ? 'collapsed' : ''}`}>
      <nav className="topbar">
        <div className="left-group">
          <button
            aria-label={collapsed ? 'Open menu' : 'Close menu'}
            aria-expanded={!collapsed}
            aria-controls="dashboard-sidebar"
            className="hamburger"
            onClick={() => {
              setCollapsed(c => {
                const next = !c
                try { localStorage.setItem('dashboardCollapsed', next ? 'true' : 'false') } catch (e) {}
                return next
              })
            }}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="brand">{brand}</div>
        </div>

        <div className="profile" onClick={() => setProfileOpen(o => !o)}>
          <div className="avatar" aria-hidden />
          {!collapsed && <span className="profile-name">{getUserDisplayName()} ▾</span>}
          {profileOpen && (
            <div className="dropdown" role="menu">
              <button onClick={() => { setProfileOpen(false); doLogout(); }}>Logout</button>
            </div>
          )}
        </div>
      </nav>

      <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
        <aside id="dashboard-sidebar" className={`sidebar joint ${collapsed ? 'collapsed' : ''}`}>
          <ul>
            {menuItems.map(item => (
              <li key={item.key}>
                    <button
                      className={item.key === active ? 'active' : ''}
                      onClick={() => setActive?.(item.key)}
                      title={item.label}
                      aria-label={item.label}
                    >
                      <span className="short">
                        {item.icon ? item.icon : (() => {
                          switch (item.key) {
                            case 'prescribe': return <FaPills />
                            case 'calendar': return <FaCalendarAlt />
                            case 'appointments': return <FaClipboardList />
                            default: return item.label.charAt(0)
                          }
                        })()}
                      </span>
                      <span className="label">{item.label}</span>
                    </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
