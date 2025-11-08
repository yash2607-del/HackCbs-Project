import React, { useState, useMemo, useEffect } from 'react';
import '../styles/doctor-dashboard.scss';
import PrescribeForm from './doctor/PrescribeForm.jsx';
import CalendarPane from './doctor/CalendarPane.jsx';
import AppointmentsPane from './doctor/AppointmentsPane.jsx';

export default function DoctorDashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [active, setActive] = useState('prescribe');
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(() => today.toISOString().slice(0,10));

  // Dummy appointment data keyed by ISO date (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => ({
    '2025-11-08': [
      { time: '09:00', patient: 'Alice Patel', reason: 'Follow-up' },
      { time: '09:30', patient: 'Rohit Sharma', reason: 'Flu symptoms' },
      { time: '10:15', patient: 'Meena Gupta', reason: 'Blood pressure check' },
      { time: '11:00', patient: 'Karan Verma', reason: 'Prescription renewal' }
    ],
    '2025-11-09': [
      { time: '08:45', patient: 'Divya Rao', reason: 'Annual physical' }
    ],
    '2025-11-10': [
      { time: '10:00', patient: 'John Doe', reason: 'Sprain follow-up' },
      { time: '10:30', patient: 'Jane Smith', reason: 'General consultation' },
      { time: '11:00', patient: 'Farhan Khan', reason: '' },
      { time: '11:30', patient: 'Priya Singh', reason: 'Lab results' },
      { time: '12:00', patient: 'Mohit Jain', reason: 'Diet advice' },
      { time: '12:30', patient: 'Sara Lee', reason: 'Vaccination' },
      { time: '13:00', patient: 'Carlos Perez', reason: 'Back pain' },
      { time: '13:30', patient: 'Emily Chen', reason: 'Headache' },
      { time: '14:00', patient: 'Ravi Desai', reason: 'Diabetes mgmt' },
      { time: '14:30', patient: 'Nina Das', reason: 'Allergy test' },
      { time: '15:00', patient: 'Omkar Kulkarni', reason: 'Routine check' }
    ]
  }), []);

  // Appointment requests and upcoming appointments (dummy data)
  const [appointmentRequests, setAppointmentRequests] = useState([
    { id: crypto.randomUUID(), date: '2025-11-11', time: '10:30', patient: 'Arjun Mehta', reason: 'Back pain' },
    { id: crypto.randomUUID(), date: '2025-11-11', time: '12:00', patient: 'Sanya Kapoor', reason: 'Fever' },
    { id: crypto.randomUUID(), date: '2025-11-12', time: '09:15', patient: 'Ishaan Rao', reason: 'Follow-up' }
  ]);
  const [upcoming, setUpcoming] = useState([
    { id: crypto.randomUUID(), date: '2025-11-10', time: '16:00', patient: 'Neha Iyer', reason: 'Allergy' },
    { id: crypto.randomUUID(), date: '2025-11-11', time: '09:00', patient: 'Kabir Khan', reason: 'Annual physical' }
  ]);

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
    { key: 'appointments', label: 'Appointments' }
  ];

  // Ensure page uses dashboard-specific body styling (no outer padding, bg color)
  useEffect(() => {
    document.body.classList.add('dashboard-mode');
    return () => document.body.classList.remove('dashboard-mode');
  }, []);

  return (
    <div className="doctor-dashboard">
      <nav className="topbar">
        <div className="brand">MedTrack</div>
        <div className="profile" onClick={() => setProfileOpen(o => !o)}>
          <div className="avatar" aria-label="Profile" />
          <span className="profile-name">Dr. Jane Doe ▾</span>
          {profileOpen && (
            <div className="dropdown" role="menu">
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
            {menuItems.map(item => (
              <li key={item.key}>
                <button
                  className={item.key === active ? 'active' : ''}
                  onClick={() => setActive(item.key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="content">
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
        </main>
      </div>
    </div>
  );
}

// Child components moved to ./doctor/* for clarity
