import React, { useState } from 'react'
import ProfileLayout from '../../components/layouts/ProfileLayout.jsx'
import MapPicker from '../../components/MapPicker.jsx'

export default function PharmacyProfile() {
  const session = JSON.parse(localStorage.getItem('session')||'null')
  const user = session?.role === 'pharmacy' ? session.user : { role: 'pharmacy', shopName: 'Pharmacy Placeholder' }
  const [active, setActive] = useState('overview')
  const [pharmLocation, setPharmLocation] = useState(user?.profile?.location || null)
  const [msg, setMsg] = useState('')

  const sidebar = [
    { key: 'overview', label: 'Overview' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'orders', label: 'Orders' },
    { key: 'location', label: 'Location' },
    { key: 'settings', label: 'Settings' }
  ]

  return (
    <ProfileLayout title="Pharmacy Profile" user={user} sidebarItems={sidebar} activeKey={active} onChange={setActive}>
      {active === 'overview' && (
        <section className="profile-section">
          <h2>Store Summary</h2>
          <div className="profile-grid">
            <div className="stat-card"><span className="label">Stock Items</span><span className="value">860</span></div>
            <div className="stat-card"><span className="label">Pending Orders</span><span className="value">6</span></div>
            <div className="stat-card"><span className="label">Fulfilled</span><span className="value">124</span></div>
            <div className="stat-card"><span className="label">Alerts</span><span className="value">2</span></div>
          </div>
        </section>
      )}
      {active === 'inventory' && (
        <section className="profile-section">
          <h2>Inventory</h2>
          <p>Inventory table placeholder.</p>
        </section>
      )}
      {active === 'orders' && (
        <section className="profile-section">
          <h2>Orders</h2>
          <p>Orders list placeholder.</p>
        </section>
      )}
      {active === 'location' && (
        <section className="profile-section">
          <h2>Store Location</h2>
          {msg && <div className="auth-message" style={{marginBottom:8}}>{msg}</div>}
          <MapPicker label="Location" value={pharmLocation} onChange={setPharmLocation} height={260} />
          {pharmLocation?.address && <div style={{marginTop:8}}><strong>Address:</strong> {pharmLocation.address}</div>}
          <div style={{marginTop:12}}>
            <button
              className="btn primary"
              onClick={async () => {
                setMsg('')
                if (!pharmLocation?.lat || !pharmLocation?.lng || !pharmLocation?.address) { setMsg('Pick a location first'); return }
                try {
                  const token = localStorage.getItem('token')
                  const res = await fetch('http://localhost:5000/api/auth/location', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ lat: pharmLocation.lat, lng: pharmLocation.lng, address: pharmLocation.address })
                  })
                  const data = await res.json()
                  if (!res.ok) { setMsg(data.error || 'Failed to save location'); return }
                  const sess = JSON.parse(localStorage.getItem('session')||'null')
                  if (sess?.user) { sess.user.profile = data.profile; localStorage.setItem('session', JSON.stringify(sess)) }
                  setMsg('Location saved')
                } catch (e) {
                  setMsg('Network error while saving')
                }
              }}
            >Save Location</button>
          </div>
        </section>
      )}
      {active === 'settings' && (
        <section className="profile-section">
          <h2>Settings</h2>
          <p>Store settings form placeholder.</p>
        </section>
      )}
    </ProfileLayout>
  )
}
