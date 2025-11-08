import React, { useState, useMemo, useEffect } from 'react';
import '../styles/doctor-dashboard.scss';

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
            <section className="calendar-pane">
              <div className="calendar-header">
                <h2>Calendar</h2>
                <p>Appointments heatmap for this month</p>
              </div>
              <div className="calendar-and-list">
                <div className="mini-calendar">
                  <div className="week-labels">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w => <div key={w}>{w}</div>)}
                  </div>
                  <div className="calendar-grid">
                    {calendarDays.map((entry, idx) => entry ? (
                      <button
                        key={entry.iso}
                        className={"day-cell" + (entry.iso === selectedDate ? ' selected' : '')}
                        style={{ background: heatColor(entry.count) }}
                        onClick={() => setSelectedDate(entry.iso)}
                        title={entry.count ? `${entry.count} appointment${entry.count>1?'s':''}` : 'No appointments'}
                      >
                        <span className="day-number">{entry.day}</span>
                        {entry.count > 0 && <span className="count">{entry.count}</span>}
                      </button>
                    ) : (
                      <div key={idx} className="day-cell blank" />
                    ))}
                  </div>
                </div>
                <div className="day-appointments">
                  <h3>{selectedDate}</h3>
                  {selectedAppointments.length === 0 && <p className="empty">No appointments scheduled.</p>}
                  <ul className="appointments-list">
                    {selectedAppointments.map((a,i) => (
                      <li key={i} className="appt-row">
                        <div className="time">{a.time}</div>
                        <div className="details">
                          <div className="patient">{a.patient}</div>
                          {a.reason && <div className="reason">{a.reason}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
          {active === 'appointments' && (
            <section>
              <h2>Appointments</h2>
              <p>Manage patient appointments and statuses.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// =============================
// Prescribe Form Component
// =============================
function PrescribeForm() {
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { id: crypto.randomUUID(), name: '', instructions: '' }
  ]);
  const [submitted, setSubmitted] = useState(false);

  function updateMedicine(id, field, value) {
    setMedicines(meds => meds.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  function addMedicine() {
    setMedicines(meds => [...meds, { id: crypto.randomUUID(), name: '', instructions: '' }]);
  }

  function removeMedicine(id) {
    setMedicines(meds => meds.filter(m => m.id !== id));
  }

  function resetForm() {
    setPatientName('');
    setAge('');
    setSex('');
    setNotes('');
    setMedicines([{ id: crypto.randomUUID(), name: '', instructions: '' }]);
    setSubmitted(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    // lightweight validation
    if (!patientName.trim()) {
      alert('Please enter patient name');
      return;
    }
    setSubmitted(true);
    const payload = {
      patientName,
      age: age ? parseInt(age,10) : null,
      sex,
      medicines: medicines.filter(m => m.name.trim()),
      notes
    };
    console.log('Prescription submitted', payload);
  }

  return (
    <form className="prescribe-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label>Patient Name *</label>
          <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. Jane Doe" required />
        </div>
        <div className="field">
          <label>Age</label>
          <input type="number" min="0" max="130" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 42" />
        </div>
        <div className="field">
          <label>Sex</label>
          <select value={sex} onChange={e => setSex(e.target.value)}>
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="medicines-section">
        <div className="section-head">
          <h3>Medicines</h3>
          <button type="button" className="add-btn" onClick={addMedicine}>+ Add Medicine</button>
        </div>
        {medicines.map((m, idx) => (
          <div key={m.id} className="medicine-row">
            <div className="field">
              <label>Name</label>
              <input value={m.name} onChange={e => updateMedicine(m.id,'name', e.target.value)} placeholder="Medicine name" />
            </div>
            <div className="field">
              <label>Instructions</label>
              <input value={m.instructions} onChange={e => updateMedicine(m.id,'instructions', e.target.value)} placeholder="Dosage / frequency" />
            </div>
            {medicines.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeMedicine(m.id)} aria-label="Remove">✕</button>
            )}
          </div>
        ))}
      </div>

      <div className="field">
        <label>Other Actions / Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Diet changes, tests to schedule, follow-up timeframe..." />
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">Submit Prescription</button>
        <button type="button" className="secondary-btn" onClick={resetForm}>Reset</button>
      </div>

      {submitted && (
        <div className="success-banner" role="status">
          <strong>Prescription saved (mock)</strong>. Check console for payload.
        </div>
      )}
    </form>
  );
}
