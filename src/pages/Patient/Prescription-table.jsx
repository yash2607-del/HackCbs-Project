import { useEffect, useMemo, useState } from 'react';
import { FaDownload, FaEye, FaTimes } from 'react-icons/fa';
import './Prescription-table.css';

export default function PrescriptionTable() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const session = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('session') || 'null') } catch { return null }
  }, []);
  const userEmail = session?.user?.profile?.email || session?.user?.email || '';

  useEffect(() => {
    const e = (userEmail || '').trim().toLowerCase();
    if (!e || !e.includes('@')) {
      setError('Your profile does not have a valid email. Please update your profile.');
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const url = `${base}/api/prescriptions?email=${encodeURIComponent(e)}`;
        const res = await fetch(url);
        const text = await res.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        setError(err.message || 'Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userEmail]);

  const handleView = async (prescription) => {
    setDetailError('');
    setDetailLoading(true);
    setShowModal(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const url = `${base}/api/prescriptions/${encodeURIComponent(prescription._id)}`;
      const res = await fetch(url);
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
      if (!res.ok && res.status !== 409) throw new Error(data.error || `HTTP ${res.status}`);
      const merged = {
        ok: !!data.ok,
        verified: data.verified === true,
        reason: data.reason || null,
        id: data.id,
        storedHash: data.storedHash,
        computedHash: data.computedHash,
        onChainVerified: typeof data.onChainVerified === 'boolean' ? data.onChainVerified : null,
        canonical: data.canonical,
        doc: data.doc || null
      };
      setSelectedPrescription(merged);
    } catch (err) {
      setDetailError(err.message || 'Failed to load prescription details');
      setSelectedPrescription(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = (prescription) => {
    // Simulate download functionality
    const id = prescription?.id || prescription?._id || 'unknown';
    alert(`Downloading prescription ${id}...`);
    console.log('Download prescription:', prescription);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="prescription-table-container">
      <div className="table-header">
        <h1>My Prescriptions</h1>
        <p>View and download your prescription history</p>
      </div>

      <div className="table-wrapper">
        <table className="prescription-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Doctor Name</th>
              <th>Prescription ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5}>
                  <div className="loading-row">Loading prescriptions...</div>
                </td>
              </tr>
            )}

            {!!error && !loading && (
              <tr>
                <td colSpan={5}>
                  <div className="error-row">{error}</div>
                </td>
              </tr>
            )}

            {!loading && !error && items.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-row">No prescriptions found.</div>
                </td>
              </tr>
            )}

            {!loading && !error && items.map((p, index) => (
              <tr key={p._id}>
                <td>{index + 1}</td>
                <td>
                  <div className="doctor-cell">
                    <span className="doctor-name">{p.doctorName || p.doctor?.name || '—'}</span>
                  </div>
                </td>
                <td>
                  <span className="prescription-id">{p._id}</span>
                </td>
                <td>
                  <span className="date">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  }) : '—'}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleView(p)}
                      title="View Details"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="btn-download"
                      onClick={() => handleDownload(p)}
                      title="Download Prescription"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Prescription Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {detailLoading && (
                <div className="loading-row">Loading details...</div>
              )}

              {detailError && !detailLoading && (
                <div className="error-row">{detailError}</div>
              )}

              {selectedPrescription && selectedPrescription.doc && !detailLoading && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Verification:</span>
                    <span className="detail-value">
                      {selectedPrescription.verified ? 'Verified ✓' : 'Tampered ⚠'}
                      {typeof selectedPrescription.onChainVerified === 'boolean' && (
                        <> — Blockchain: {selectedPrescription.onChainVerified ? 'present' : 'not found'}</>
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Prescription ID:</span>
                    <span className="detail-value">{selectedPrescription.id || selectedPrescription.doc._id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Doctor:</span>
                    <span className="detail-value">{selectedPrescription.doc.doctorName || selectedPrescription.doc.doctor?.name || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{selectedPrescription.doc.createdAt ? new Date(selectedPrescription.doc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
                  </div>
                  {selectedPrescription.doc.notes && (
                    <div className="detail-row">
                      <span className="detail-label">Diagnosis:</span>
                      <span className="detail-value">{selectedPrescription.doc.notes}</span>
                    </div>
                  )}
                  <div className="detail-section">
                    <h3>Prescribed Medicines</h3>
                    <ul className="medicines-list">
                      {(selectedPrescription.doc.medicines || []).map((m, idx) => (
                        <li key={idx}>
                          {m.name}
                          {m.dosageValue ? ` — ${m.dosageValue}${m.dosageUnit ? ' ' + m.dosageUnit : ''}` : ''}
                          {typeof m.timesPerDay === 'number' ? ` — ${m.timesPerDay}x/day` : ''}
                          {typeof m.totalDays === 'number' ? ` for ${m.totalDays} days` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="detail-section">
                    <h3>Technical Details</h3>
                    <p><strong>Stored Hash:</strong> {selectedPrescription.storedHash || '—'}</p>
                    <p><strong>Computed Hash:</strong> {selectedPrescription.computedHash || '—'}</p>
                    {selectedPrescription.reason && (
                      <p><strong>Reason:</strong> {selectedPrescription.reason}</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-download"
                onClick={() => handleDownload(selectedPrescription || {})}
              >
                <FaDownload /> Download Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}