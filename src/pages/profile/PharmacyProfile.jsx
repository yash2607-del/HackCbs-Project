import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Billing from '../../pages/Billing/Billing.jsx'
import ScanAddStock from '../../pages/Scan/ScanAddStock.jsx'
import Inventory from '../../pages/Inventory/Inventory.jsx'

export default function PharmacyProfile() {
  const session = JSON.parse(localStorage.getItem('session')||'null')
  const initial = session?.role === 'pharmacy' ? session.user : { role: 'pharmacy', shopName: 'Pharmacy Placeholder', contact: '', phone: '', email: '', address: '', license: '' }
  const [active, setActive] = useState('profile')
  const [form, setForm] = useState(initial)

  const menuItems = [
    { key: 'billing', label: 'Billing' },
    { key: 'scan', label: 'Scan & Stock' },
    { key: 'inventory', label: 'Inventory' }
  ]

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = () => {
    const sessionObj = { role: 'pharmacy', user: form }
    localStorage.setItem('session', JSON.stringify(sessionObj))
    alert('Profile saved')
  }

  return (
    <DashboardLayout brand="Pharmacy" menuItems={menuItems} active={active} setActive={setActive}>
      <section style={{ padding: 18, maxWidth: 980 }}>
        {active === 'billing' && (
          <>
            <h2 style={{ marginTop: 0 }}>Billing</h2>
            <Billing inventory={[]} updateStock={() => {}} />
          </>
        )}
        {active === 'scan' && (
          <>
            <h2 style={{ marginTop: 0 }}>Scan & Stock</h2>
            <ScanAddStock addMedicine={() => {}} />
          </>
        )}
        {active === 'inventory' && (
          <>
            <h2 style={{ marginTop: 0 }}>Inventory</h2>
            <Inventory inventory={[]} addMedicine={() => {}} />
          </>
        )}
        {active === 'profile' && (
          <>
            <h2 style={{ marginTop: 0 }}>Pharmacy profile</h2>
            <p style={{ color: '#475569' }}>Edit your store information and contact details.</p>

            <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e6eef8', padding: 16, borderRadius: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Shop name</label>
                  <input value={form.shopName} onChange={onChange('shopName')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Contact person</label>
                  <input value={form.contact} onChange={onChange('contact')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Phone</label>
                  <input value={form.phone} onChange={onChange('phone')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Email</label>
                  <input value={form.email} onChange={onChange('email')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Address</label>
                  <textarea value={form.address} onChange={onChange('address')} rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>License / Reg. number</label>
                  <input value={form.license} onChange={onChange('license')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={save} style={{ padding: '8px 14px', background: '#0ea5a4', color: '#fff', border: 'none', borderRadius: 8 }}>Save profile</button>
                <button onClick={() => { setForm(initial) }} style={{ padding: '8px 14px', borderRadius: 8 }}>Reset</button>
              </div>
            </div>
          </>
        )}
      </section>
    </DashboardLayout>
  )
}
