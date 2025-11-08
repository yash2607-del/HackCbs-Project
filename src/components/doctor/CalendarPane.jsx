import React from 'react';

export default function CalendarPane({ calendarDays, selectedDate, setSelectedDate, selectedAppointments, heatColor }) {
  return (
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
  );
}
