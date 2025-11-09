import React, { useState } from 'react';

export default function PatientHistory() {
  const [email, setEmail] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [items, setItems] = useState([]);

  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [selected, setSelected] = useState(null);

  async function fetchHistory() {
    setHistoryError(null);
    setItems([]);
    const e = (email || '').trim().toLowerCase();
    if (!e || !e.includes('@')) {
      setHistoryError('Enter a valid patient email');
      return;
    }
    setHistoryLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL(`api/prescriptions?email=${encodeURIComponent(e)}`, base).toString();
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (_) { data = {}; }
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('history fetch failed', err);
      setHistoryError(err.message || 'Failed to fetch history');
    } finally {
      setHistoryLoading(false);
    }
  }

  async function viewDetails(id) {
    setDetailError(null);
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL(`api/prescriptions/${encodeURIComponent(id)}`, base).toString();
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (_) { data = {}; }
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
      setSelected(merged);
    } catch (err) {
      console.error('detail fetch failed', err);
      setDetailError(err.message || 'Failed to fetch details');
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="prescribe-pane">
      <div className="prescribe-form">
        <h2 style={{ margin: 0, color: '#012' }}>Patient History</h2>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="field" style={{ margin: 0, flex: '0 1 320px' }}>
            <label>Patient Email</label>
            <input
              type="email"
              placeholder="Enter patient email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button 
            type="button" 
            className="add-btn" 
            onClick={fetchHistory} 
            disabled={historyLoading}
            style={{ marginTop: '1.5rem' }}
          >
            {historyLoading ? 'Fetching...' : 'Fetch History'}
          </button>
        </div>
        
        {historyError && (
          <div style={{ 
            background: '#fde8e8', 
            color: '#9b1c1c', 
            padding: '0.6rem 0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            border: '1px solid #fecaca'
          }}>
            {historyError}
          </div>
        )}

        <div className="medicines-section">
          <div className="section-head">
            <h4 style={{ margin: 0 }}>Prescription History</h4>
          </div>
          
          <div style={{ 
            marginTop: '0.75rem',
            background: '#fff', 
            border: '1px solid var(--color-border)', 
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 6px var(--shadow-light)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: 'var(--color-bg-light)',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <th style={{ 
                    padding: '0.75rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: 'var(--color-text-dark)',
                    fontSize: '0.85rem'
                  }}>Date</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: 'var(--color-text-dark)',
                    fontSize: '0.85rem'
                  }}>Medicines</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: 'var(--color-text-dark)',
                    fontSize: '0.85rem'
                  }}>Diagnosis</th>
                  <th style={{ 
                    padding: '0.75rem', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: 'var(--color-text-dark)',
                    fontSize: '0.85rem'
                  }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {Array.isArray(p.medicines) ? p.medicines.length : 0} items
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {p.notes ? (p.notes.length > 60 ? p.notes.slice(0, 57) + '...' : p.notes) : '—'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button 
                        type="button" 
                        className="add-btn" 
                        onClick={() => viewDetails(p._id)}
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.875rem' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {(!historyLoading && !historyError && items.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ 
                      padding: '2rem', 
                      textAlign: 'center', 
                      color: 'rgba(1, 18, 34, 0.6)',
                      fontSize: '0.875rem'
                    }}>
                      No prescriptions found for this email.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10001 
          }}
          onClick={() => { setShowDetail(false); setSelected(null); }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              width: '92%', 
              maxWidth: '720px', 
              maxHeight: '80vh', 
              overflow: 'auto',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 24px var(--shadow-medium)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: 0, color: '#012' }}>Prescription Details</h3>
              <button 
                onClick={() => { setShowDetail(false); setSelected(null); }} 
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: 'var(--color-text-dark)',
                  padding: '0.25rem'
                }}
              >
                ✕
              </button>
            </div>
            
            {detailLoading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: 'var(--color-text-dark)'
              }}>
                Loading prescription details...
              </div>
            )}
            
            {detailError && (
              <div style={{ 
                background: '#fde8e8', 
                color: '#9b1c1c', 
                padding: '0.75rem', 
                borderRadius: '8px',
                border: '1px solid #fecaca',
                marginBottom: '1rem'
              }}>
                {detailError}
              </div>
            )}
            
            {selected && selected.doc && !detailLoading && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'var(--color-bg-light)',
                  borderRadius: '8px'
                }}>
                  {selected.verified ? (
                    <span style={{ 
                      background: '#def7ec', 
                      color: '#03543f', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      ✓ Verified
                    </span>
                  ) : (
                    <span style={{ 
                      background: '#fde8e8', 
                      color: '#9b1c1c', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      ⚠ Tampered
                    </span>
                  )}
                  {typeof selected.onChainVerified === 'boolean' && (
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: 'rgba(1, 18, 34, 0.7)',
                      background: '#fff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--color-border)'
                    }}>
                      Blockchain: {selected.onChainVerified ? 'verified' : 'not found'}
                    </span>
                  )}
                </div>

                <div className="medicines-section">
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div className="field" style={{ margin: 0 }}>
                      <label>Date</label>
                      <div style={{ 
                        padding: '0.6rem 0.75rem',
                        background: 'var(--color-bg-light)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)'
                      }}>
                        {selected.doc.createdAt ? new Date(selected.doc.createdAt).toLocaleString() : '—'}
                      </div>
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <label>Patient</label>
                      <div style={{ 
                        padding: '0.6rem 0.75rem',
                        background: 'var(--color-bg-light)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)'
                      }}>
                        {selected.doc.patientName} &lt;{selected.doc.patientEmail || '—'}&gt;
                      </div>
                    </div>
                  </div>

                  <div className="field" style={{ margin: '1rem 0' }}>
                    <label>Medicines ({Array.isArray(selected.doc.medicines) ? selected.doc.medicines.length : 0} items)</label>
                    <div style={{ 
                      background: 'var(--color-bg-light)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '0.75rem'
                    }}>
                      {Array.isArray(selected.doc.medicines) && selected.doc.medicines.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                          {selected.doc.medicines.map((m, idx) => (
                            <li key={idx} style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                              <strong>{m.name}</strong> — {m.dosageValue}{m.dosageUnit ? ' ' + m.dosageUnit : ''} — {m.timesPerDay}x/day for {m.totalDays} days
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: 'rgba(1, 18, 34, 0.6)', fontSize: '0.875rem' }}>No medicines listed</span>
                      )}
                    </div>
                  </div>

                  {selected.doc.notes && (
                    <div className="field" style={{ margin: '1rem 0' }}>
                      <label>Diagnosis</label>
                      <div style={{ 
                        padding: '0.75rem',
                        background: 'var(--color-bg-light)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                      }}>
                        {selected.doc.notes}
                      </div>
                    </div>
                  )}

                  <details style={{ marginTop: '1rem' }}>
                    <summary style={{ 
                      cursor: 'pointer', 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'rgba(1, 18, 34, 0.7)',
                      marginBottom: '0.5rem'
                    }}>
                      Technical Details
                    </summary>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'rgba(1, 18, 34, 0.7)',
                      background: 'var(--color-bg-light)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'monospace'
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Stored Hash:</strong><br />
                        <span style={{ wordBreak: 'break-all' }}>{selected.storedHash || '—'}</span>
                      </div>
                      <div>
                        <strong>Computed Hash:</strong><br />
                        <span style={{ wordBreak: 'break-all' }}>{selected.computedHash || '—'}</span>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
