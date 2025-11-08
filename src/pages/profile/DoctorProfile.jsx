import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import PrescribeForm from '../../components/doctor/PrescribeForm.jsx'
import CalendarPane from '../../components/doctor/CalendarPane.jsx'
import AppointmentsPane from '../../components/doctor/AppointmentsPane.jsx'

export default function DoctorProfile() {
  const session = JSON.parse(localStorage.getItem('session')||'null')
  const initial = session?.role === 'doctor' ? session.user : { role: 'doctor', name: 'Dr. Placeholder', email: '', phone: '', specialization: '', clinicAddress: '', qualifications: '', bio: '' }
  const [active, setActive] = useState('profile')
  const [form, setForm] = useState(initial)

  const menuItems = [
    { key: 'prescribe', label: 'Prescribe' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'appointments', label: 'Appointments' }
  ]

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = () => {
    // Simple client-side save to localStorage session
    const sessionObj = { role: 'doctor', user: form }
    localStorage.setItem('session', JSON.stringify(sessionObj))
    alert('Profile saved')
  }

  return (
    <DashboardLayout brand="MedTrack" menuItems={menuItems} active={active} setActive={setActive}>
      <section style={{ padding: 18, maxWidth: 980 }}>
        {active === 'prescribe' && (
          <>
            <h2 style={{ marginTop: 0 }}>Prescribe</h2>
            <PrescribeForm />
          </>
        )}
        {active === 'calendar' && (
          <>
            <h2 style={{ marginTop: 0 }}>Calendar</h2>
            <CalendarPane calendarDays={[]} selectedDate={new Date().toISOString().slice(0,10)} setSelectedDate={() => {}} selectedAppointments={[]} heatColor={() => 'transparent'} />
          </>
        )}
        {active === 'appointments' && (
          <>
            <h2 style={{ marginTop: 0 }}>Appointments</h2>
            <AppointmentsPane appointmentRequests={[]} upcoming={[]} inquiryOpenId={null} inquiryDrafts={{}} formatDate={(d)=>d} compareDateTime={() => 0} rejectRequest={()=>{}} acceptRequest={()=>{}} toggleInquiry={()=>{}} sendInquiry={()=>{}} onInquiryDraftChange={()=>{}} />
          </>
        )}
        {active === 'profile' && (
          <>
            <h2 style={{ marginTop: 0 }}>Doctor profile</h2>
            <p style={{ color: '#475569' }}>Update your professional details — these will be visible to patients where applicable.</p>

            <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e6eef8', padding: 16, borderRadius: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Full name</label>
                  <input value={form.name} onChange={onChange('name')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Specialization</label>
                  <input value={form.specialization} onChange={onChange('specialization')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Email</label>
                  <input value={form.email} onChange={onChange('email')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Phone</label>
                  <input value={form.phone} onChange={onChange('phone')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Clinic address</label>
                  <textarea value={form.clinicAddress} onChange={onChange('clinicAddress')} rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Qualifications</label>
                  <input value={form.qualifications} onChange={onChange('qualifications')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Short bio</label>
                  <textarea value={form.bio} onChange={onChange('bio')} rows={4} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #dbe7f5' }} />
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
