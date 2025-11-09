import { useState, useEffect } from 'react';
import { FaPhoneAlt, FaTimes } from 'react-icons/fa';
import './PatientAppointments.css';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch appointments from backend
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get patient ID from session
      const session = JSON.parse(localStorage.getItem('session') || '{}');
      const patientId = session?.user?.id || session?.user?._id || session?.user?.email;
      
      if (!patientId) {
        setError('Please login to view appointments');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/appointments?patientId=${patientId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments');
      }

      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Separate appointments by status
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');

  const handleCallClinic = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleCancel = async (appointment) => {
    if (!confirm(`Are you sure you want to cancel your appointment with ${appointment.doctorName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointment._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel appointment');
      }

      alert(`Appointment with ${appointment.doctorName} has been cancelled.`);
      // Refresh appointments list
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert(`Failed to cancel appointment: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="patient-appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.1rem', color: '#64748b' }}>
          Loading appointments...
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.1rem', color: '#dc2626', background: '#fee2e2', borderRadius: '8px', margin: '1rem 0' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
      <div className="appointments-stats">
        <div className="stat-box pending">
          <div className="stat-number">{pendingAppointments.length}</div>
          <div className="stat-label">PENDING</div>
        </div>
        <div className="stat-box confirmed">
          <div className="stat-number">{confirmedAppointments.length}</div>
          <div className="stat-label">CONFIRMED</div>
        </div>
      </div>

      <div className="appointments-sections">
        {/* Pending Appointments Section */}
        <div className="pending-section">
          <h2>Pending Appointments</h2>
          {pendingAppointments.length === 0 ? (
            <p className="empty-message">No pending appointments.</p>
          ) : (
            <div className="appointments-list">
              {pendingAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card pending">
                  <div className="appointment-info">
                    <div className="doctor-details">
                      <div className="doctor-name">{appointment.doctorName}</div>
                      <div className="doctor-speciality">{appointment.specialty || 'General'}</div>
                    </div>
                    <div className="appointment-meta">
                      <div className="meta-item">
                        <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
                      </div>
                      <div className="meta-item">
                        <strong>Time:</strong> {formatTime(appointment.appointmentTime)}
                      </div>
                      <div className="meta-item">
                        <strong>Reason:</strong> {appointment.reasonForVisit || 'Not specified'}
                      </div>
                      {appointment.additionalNotes && (
                        <div className="meta-item">
                          <strong>Notes:</strong> {appointment.additionalNotes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <button 
                      className="btn-call"
                      onClick={() => handleCallClinic(appointment.phone || '')}
                      disabled={!appointment.phone}
                    >
                      <FaPhoneAlt />
                      <span>Call</span>
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancel(appointment)}
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Appointments Section */}
        <div className="confirmed-section">
          <h2>Confirmed Appointments</h2>
          {confirmedAppointments.length === 0 ? (
            <p className="empty-message">No confirmed appointments.</p>
          ) : (
            <div className="appointments-list">
              {confirmedAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card confirmed">
                  <div className="appointment-info">
                    <div className="doctor-details">
                      <div className="doctor-name">{appointment.doctorName}</div>
                      <div className="doctor-speciality">{appointment.specialty || 'General'}</div>
                    </div>
                    <div className="appointment-meta">
                      <div className="meta-item">
                        <strong>Date:</strong> {formatDate(appointment.appointmentDate)}
                      </div>
                      <div className="meta-item">
                        <strong>Time:</strong> {formatTime(appointment.appointmentTime)}
                      </div>
                      <div className="meta-item">
                        <strong>Reason:</strong> {appointment.reasonForVisit || 'Not specified'}
                      </div>
                      {appointment.additionalNotes && (
                        <div className="meta-item">
                          <strong>Notes:</strong> {appointment.additionalNotes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <button 
                      className="btn-call"
                      onClick={() => handleCallClinic(appointment.phone || '')}
                      disabled={!appointment.phone}
                    >
                      <FaPhoneAlt />
                      <span>Call</span>
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancel(appointment)}
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
