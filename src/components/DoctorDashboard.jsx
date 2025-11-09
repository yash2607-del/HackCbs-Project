import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from './DashboardLayout.jsx'
import '../styles/doctor-dashboard.scss';
import PrescribeForm from './doctor/PrescribeForm.jsx';
import CalendarPane from './doctor/CalendarPane.jsx';
import AppointmentsPane from './doctor/AppointmentsPane.jsx';
import data from '../data/appointments.json';
import MapPicker from './MapPicker.jsx';

export default function DoctorDashboard() {
  // Helper to build API URLs from env
  const apiUrl = (path) => new URL(path, import.meta.env.VITE_API_BASE_URL || '/').toString()
  const [active, setActive] = useState('prescribe');
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(() => today.toISOString().slice(0,10));

  // Location state for doctor
  const session = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('session')||'null') } catch { return null }
  }, [])
  const initialLoc = session?.user?.profile?.location || null
  const [docLocation, setDocLocation] = useState(initialLoc)
  const [locMsg, setLocMsg] = useState('')

  // Externalized dummy data
  const appointmentsByDate = data.calendarAppointmentsByDate;
  const [appointmentRequests, setAppointmentRequests] = useState(() => data.appointmentRequests);
  const [upcoming, setUpcoming] = useState(() => data.upcoming);

  const [inquiryOpenId, setInquiryOpenId] = useState(null);
  const [inquiryDrafts, setInquiryDrafts] = useState({});

  function compareDateTime(a, b) {
    return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
  }
  function formatDate(d) {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function acceptRequest(id) {
    setAppointmentRequests(reqs => {
      const idx = reqs.findIndex(r => r.id === id);
      if (idx === -1) return reqs;
      const req = reqs[idx];
      setUpcoming(prev => [...prev, req].sort(compareDateTime));
      return [...reqs.slice(0, idx), ...reqs.slice(idx + 1)];
    });
  }
  function rejectRequest(id) {
    setAppointmentRequests(reqs => reqs.filter(r => r.id !== id));
  }
  function toggleInquiry(id) {
    setInquiryOpenId(curr => (curr === id ? null : id));
  }
  function sendInquiry(id) {
    const message = inquiryDrafts[id]?.trim();
    console.log('Inquiry to patient', { requestId: id, message });
    setInquiryOpenId(null);
    setInquiryDrafts(d => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
  }

  // Build calendar days for current month
  const calendarDays = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-index
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const days = [];
    // Leading blanks (weekday: 0 Sunday .. 6)
    for (let i = 0; i < first.getDay(); i++) {
      days.push(null);
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const iso = dateObj.toISOString().slice(0,10);
      const appts = appointmentsByDate[iso] || [];
      days.push({ day: d, iso, count: appts.length });
    }
    return days;
  }, [appointmentsByDate, today]);

  const selectedAppointments = appointmentsByDate[selectedDate] || [];

  function heatColor(count) {
    if (!count) return 'transparent';
    if (count >= 10) return 'linear-gradient(135deg,#1e5f34,#2ECC71)';
    // scale lightness based on count (1..9)
    const lightness = 85 - count * 4; // from ~81 to ~49
    return `hsl(145deg 60% ${lightness}%)`;
  }

  const menuItems = [
    { key: 'prescribe', label: 'Prescribe' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'location', label: 'Location' }
  ];

  return (
    <div className="doctor-dashboard">
      <DashboardLayout
        brand="MediChain"
        menuItems={menuItems}
        active={active}
        setActive={setActive}
      >
        {active === 'prescribe' && (
          <section className="prescribe-pane">
            <h2>Prescribe</h2>
            <p>Create a prescription for a patient. All fields optional, but patient name recommended.</p>
            <PrescribeForm />
          </section>
        )}
        {active === 'calendar' && (
          <CalendarPane
            calendarDays={calendarDays}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedAppointments={selectedAppointments}
            heatColor={heatColor}
          />
        )}
        {active === 'appointments' && (
          <AppointmentsPane
            appointmentRequests={appointmentRequests}
            upcoming={upcoming}
            inquiryOpenId={inquiryOpenId}
            inquiryDrafts={inquiryDrafts}
            formatDate={formatDate}
            compareDateTime={compareDateTime}
            rejectRequest={rejectRequest}
            acceptRequest={acceptRequest}
            toggleInquiry={toggleInquiry}
            sendInquiry={sendInquiry}
            onInquiryDraftChange={(id, value) => setInquiryDrafts(d => ({ ...d, [id]: value }))}
          />
        )}
        {active === 'location' && (
          <section className="profile-section">
            <h2>Practice Location</h2>
            {locMsg && <div className="auth-message" style={{marginBottom:8}}>{locMsg}</div>}
            <MapPicker label="Location" value={docLocation} onChange={setDocLocation} height={260} />
            {docLocation?.address && <div style={{marginTop:8}}><strong>Address:</strong> {docLocation.address}</div>}
            <div style={{marginTop:12}}>
              <button
                className="btn primary"
                onClick={async () => {
                  setLocMsg('')
                  if (!docLocation?.lat || !docLocation?.lng || !docLocation?.address) { setLocMsg('Pick a location first'); return }
                  try {
                    const token = localStorage.getItem('token')
                    const res = await fetch(apiUrl('api/auth/location'), {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ lat: docLocation.lat, lng: docLocation.lng, address: docLocation.address })
                    })
                    const data = await res.json()
                    if (!res.ok) { setLocMsg(data.error || 'Failed to save location'); return }
                    // update session cache
                    const sess = JSON.parse(localStorage.getItem('session')||'null')
                    if (sess?.user) { sess.user.profile = data.profile; localStorage.setItem('session', JSON.stringify(sess)) }
                    setLocMsg('Location saved')
                  } catch (e) {
                    setLocMsg('Network error while saving')
                  }
                }}
              >Save Location</button>
            </div>
          </section>
        )}
      </DashboardLayout>
    </div>
  );
}

// Child components moved to ./doctor/* for clarity
