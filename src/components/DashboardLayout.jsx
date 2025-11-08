import React, { useState } from 'react'
import '../styles/doctor-dashboard.scss'

export default function DashboardLayout({ brand = 'MedTrack', menuItems = [], active, setActive, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className={`dashboard-shell ${collapsed ? 'collapsed' : ''}`}>
      <nav className="topbar">
        <div className="left-group">
          <button
            aria-label={collapsed ? 'Open menu' : 'Close menu'}
            aria-expanded={!collapsed}
            aria-controls="dashboard-sidebar"
            className="hamburger"
            onClick={() => setCollapsed(c => !c)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="brand">{brand}</div>
        </div>

        <div className="profile" onClick={() => setProfileOpen(o => !o)}>
          <div className="avatar" aria-hidden />
          {!collapsed && <span className="profile-name">Dr. Jane Doe ▾</span>}
          {profileOpen && (
            <div className="dropdown" role="menu">
              <button>Profile</button>
              <button>Settings</button>
              <button>Logout</button>
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
                      <span className="short">{item.label.charAt(0)}</span>
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
