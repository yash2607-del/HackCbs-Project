import React, { useEffect } from 'react';

export default function DashboardLayout({
  brand = 'MedTrack',
  sidebarItems = [],
  activeKey,
  onChange,
  children,
}) {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    document.body.classList.add('dashboard-mode');
    return () => document.body.classList.remove('dashboard-mode');
  }, []);

  return (
    <div className="doctor-dashboard">
      <nav className="topbar">
        <div className="brand">{brand}</div>
        <div className="profile" onClick={() => setOpen(o => !o)}>
          <div className="avatar" aria-label="Profile" />
          <span className="profile-name">Dr. Jane Doe ▾</span>
          {open && (
            <div className="dropdown" role="menu" onClick={e => e.stopPropagation()}>
              <button>Profile</button>
              <button>Settings</button>
              <button>Logout</button>
            </div>
          )}
        </div>
      </nav>

      <div className="layout">
        <aside className="sidebar">
          <ul>
            {sidebarItems.map(item => (
              <li key={item.key}>
                <button
                  className={activeKey === item.key ? 'active' : ''}
                  onClick={() => onChange?.(item.key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
