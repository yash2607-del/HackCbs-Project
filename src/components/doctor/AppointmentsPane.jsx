import React from 'react';

export default function AppointmentsPane({
  appointmentRequests,
  upcoming,
  inquiryOpenId,
  inquiryDrafts,
  formatDate,
  compareDateTime,
  rejectRequest,
  acceptRequest,
  toggleInquiry,
  sendInquiry,
  onInquiryDraftChange
}) {
  return (
    <section className="appointments-pane">
      <h2>Appointments</h2>
      <div className="appt-header">
        <div className="stat-card pending">
          <div className="stat-value">{appointmentRequests.length}</div>
          <div className="stat-label">Pending requests</div>
        </div>
        <div className="stat-card upcoming">
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
      </div>
      <div className="appointments-sections">
        <div className="requests-section">
          <h3>Appointment Requests</h3>
          {appointmentRequests.length === 0 ? (
            <p className="empty">No pending requests.</p>
          ) : (
            <ul className="request-list">
              {appointmentRequests.sort(compareDateTime).map(req => (
                <li key={req.id} className="request-row">
                  <div className="info">
                    <div className="who">{req.patient}</div>
                    <div className="meta">
                      <span className="when">{formatDate(req.date)} • {req.time}</span>
                      {req.reason && <span className="dot">•</span>}
                      {req.reason && <span className="reason">{req.reason}</span>}
                    </div>
                  </div>
                  <div className="actions">
                    <button className="btn reject" onClick={() => rejectRequest(req.id)}>Reject</button>
                    <button className="btn inquire" onClick={() => toggleInquiry(req.id)}>
                      {inquiryOpenId === req.id ? 'Close' : 'Inquire'}
                    </button>
                    <button className="btn accept" onClick={() => acceptRequest(req.id)}>Accept</button>
                  </div>
                  {inquiryOpenId === req.id && (
                    <div className="inquiry-box">
                      <textarea
                        rows={3}
                        placeholder="Type your inquiry to the patient..."
                        value={inquiryDrafts[req.id] || ''}
                        onChange={e => onInquiryDraftChange(req.id, e.target.value)}
                      />
                      <div className="inquiry-actions">
                        <button className="btn secondary" onClick={() => toggleInquiry(req.id)}>Cancel</button>
                        <button className="btn primary" onClick={() => sendInquiry(req.id)}>Send</button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="upcoming-section">
          <h3>Upcoming Appointments</h3>
          {upcoming.length === 0 ? (
            <p className="empty">No upcoming appointments.</p>
          ) : (
            <ul className="upcoming-list">
              {upcoming.sort(compareDateTime).map(appt => (
                <li key={appt.id} className="appt-card">
                  <div className="left">
                    <div className="date">{formatDate(appt.date)}</div>
                    <div className="time">{appt.time}</div>
                  </div>
                  <div className="right">
                    <div className="patient">{appt.patient}</div>
                    {appt.reason && <div className="reason">{appt.reason}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );

  // no footer helpers
}
