import React, { useState } from 'react';

export default function PrescribeForm() {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailFound, setEmailFound] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [conditions, setConditions] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  // Renamed conceptually to Diagnosis in UI; keeping variable name notes for backend compatibility
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([
    { 
      id: crypto.randomUUID(), 
      name: '', 
      dosageValue: '', 
      dosageUnit: 'tablets', 
      timesPerDay: '', 
      totalDays: '' 
    }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Patient history & detail state (fetched from backend)
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  function updateMedicine(id, field, value) {
    setMedicines(meds => meds.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  function addMedicine() {
    setMedicines(meds => [...meds, { 
      id: crypto.randomUUID(), 
      name: '', 
      dosageValue: '', 
      dosageUnit: 'tablets', 
      timesPerDay: '', 
      totalDays: '' 
    }]);
  }

  function removeMedicine(id) {
    setMedicines(meds => meds.filter(m => m.id !== id));
  }

  function resetForm() {
    setPatientName('');
    setPatientEmail('');
    setAge('');
    setSex('');
    setPhone('');
    setWeight('');
    setHeight('');
    setConditions([]);
  setNotes('');
    setMedicines([{ 
      id: crypto.randomUUID(), 
      name: '', 
      dosageValue: '', 
      dosageUnit: 'tablets', 
      timesPerDay: '', 
      totalDays: '' 
    }]);
    setSubmitted(false);
  }

  function openHistoryModalAndFetch() {
    setShowHistoryModal(true);
    setHistoryError(null);
    setHistoryItems([]);
    const email = (patientEmail || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setHistoryError('Enter a valid patient email to fetch history');
      return;
    }
    setHistoryLoading(true);
    (async () => {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || '/';
        const url = new URL(`api/prescriptions?email=${encodeURIComponent(email)}`, base).toString();
        const res = await fetch(url, { method: 'GET' });
        const text = await res.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (_) { data = {}; }
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        setHistoryItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        console.error('Fetch history failed', e);
        setHistoryError(e.message || 'Failed to fetch patient history');
      } finally {
        setHistoryLoading(false);
      }
    })();
  }

  async function openDetailAndFetch(id) {
    setDetailError(null);
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL(`api/prescriptions/${encodeURIComponent(id)}`, base).toString();
      const res = await fetch(url, { method: 'GET' });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (_) { data = {}; }
      // Even if status is 409 (tampered), we still want to display details from the payload
      if (!res.ok && res.status !== 409) throw new Error(data.error || `HTTP ${res.status}`);

      // Shape expected: { ok, verified, reason?, id, storedHash, computedHash, onChainVerified, canonical, doc }
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
    } catch (e) {
      console.error('Fetch detail failed', e);
      setDetailError(e.message || 'Failed to fetch prescription detail');
      setSelectedPrescription(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name');
      return;
    }
    setError(null);
    setLoading(true);

    const payload = {
      patientName,
      patientEmail,
      age: age ? parseInt(age,10) : null,
      sex,
      medicines: medicines.filter(m => m.name && String(m.name).trim()),
      // Sending as notes to backend; conceptually 'diagnosis'
      notes
    };

    const base = import.meta.env.VITE_API_BASE_URL || '/';
    const url = new URL('api/prescriptions', base).toString();

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        setLoading(false);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setSubmitted(true);
        setCreated(data);
        console.log('Prescription saved', data);
      })
      .catch(err => {
        console.error('Failed to save prescription', err);
        setError(err.message || 'Failed to save prescription');
      })
      .finally(() => setLoading(false));
  }

  async function handleFetchByEmail() {
    const email = (patientEmail || '').trim();
    setEmailError(null);
    setEmailFound(false);
    if (!email) {
      setEmailError('Please enter an email to search');
      return;
    }
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL(`api/auth/user/${encodeURIComponent(email)}/profile`, base).toString();
      const res = await fetch(url, { method: 'GET' });
      if (res.status === 404) {
        // Not found - allow creating patient
        setEmailFound(false);
        setEmailError('No patient found with this email. You can create one.');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // API returns { id, role, email, profile, createdAt }
  const profile = data.profile || {};
  // Prefill fields where available
  if (profile.name) setPatientName(profile.name);
  if (profile.email) setPatientEmail(profile.email);
  if (profile.phone) setPhone(profile.phone);
  if (typeof profile.age !== 'undefined') setAge(String(profile.age));
  if (profile.sex) setSex(profile.sex);
  if (profile.weight) setWeight(String(profile.weight));
  if (profile.height) setHeight(String(profile.height));
  if (Array.isArray(profile.conditions)) setConditions(profile.conditions);
  else if (typeof profile.conditions === 'string' && profile.conditions.length) setConditions([profile.conditions]);
  setEmailFound(true);
  setEmailError(null);
  setModalMessage('Existing patient found — fields prefilled.');
  setShowSuccessModal(true);
    } catch (err) {
      console.error('Error fetching user by email', err);
      setEmailError(err.message || 'Failed to fetch');
      setEmailFound(false);
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleCreatePatient() {
    // create a patient user with default password
    const email = (patientEmail || '').trim();
    setEmailError(null);
    if (!email || !email.includes('@')) {
      setEmailError('Enter a valid email to create a patient');
      return;
    }
    if (!patientName.trim()) {
      setEmailError('Please enter patient name before creating');
      return;
    }

    setCreatingPatient(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL('api/auth/register', base).toString();
      const payload = {
        role: 'patient',
        email,
        password: 'Patient123',
        profile: {
          name: patientName,
          age: age ? parseInt(age,10) : undefined,
          sex,
          phone: phone || undefined,
          weight: weight ? Number(weight) : undefined,
          height: height ? Number(height) : undefined,
          conditions: Array.isArray(conditions) ? conditions : (conditions ? String(conditions).split(',').map(s => s.trim()).filter(Boolean) : undefined)
        }
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // register returns { token, user }
      // Prefill and mark found
      const user = data.user || {};
      const profile = user.profile || {};
      if (profile.name) setPatientName(profile.name);
  if (profile.email) setPatientEmail(profile.email);
  if (profile.phone) setPhone(profile.phone);
  if (typeof profile.age !== 'undefined') setAge(String(profile.age));
  if (profile.sex) setSex(profile.sex);
  if (profile.weight) setWeight(String(profile.weight));
  if (profile.height) setHeight(String(profile.height));
  if (Array.isArray(profile.conditions)) setConditions(profile.conditions);
  else if (typeof profile.conditions === 'string' && profile.conditions.length) setConditions([profile.conditions]);
      setEmailFound(true);
      setEmailError(null);
  setModalMessage('Patient created successfully.');
  setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to create patient', err);
      setEmailError(err.message || 'Failed to create patient');
    } finally {
      setCreatingPatient(false);
    }
  }

  return (
    <form className="prescribe-form" onSubmit={handleSubmit}>
      {/* Patient meta two-row grid (show most profile fields except sensitive ones) */}
      <div className="patient-meta">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ marginBottom: 8 }}>Patient Information</h4>
          <div>
            <button
              type="button"
              onClick={openHistoryModalAndFetch}
              className="add-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M21 12.5A8.5 8.5 0 1 1 12.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Patient History
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div className="field">
            <label>Name</label>
            <input value={patientName} onChange={e => setPatientName(e.target.value)} />
          </div>
            <div className="field" style={{ position: 'relative' }}>
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={e => { setPatientEmail(e.target.value); setEmailFound(false); setEmailError(null); }}
                  style={{ width: '100%', paddingRight: 44 }}
                />

                <button
                  type="button"
                  onClick={handleFetchByEmail}
                  disabled={emailLoading || !patientEmail}
                  aria-label="Lookup patient by email"
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    padding: 6,
                    cursor: emailLoading || !patientEmail ? 'not-allowed' : 'pointer'
                  }}
                >
                  {emailLoading ? (
                    <span style={{ width: 18, height: 18, display: 'inline-block', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', animation: 'prescribe-spin 0.8s linear infinite' }} />
                  ) : (
                    // simple send icon (paper plane)
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ marginTop: 6, minHeight: 18 }}>
                {emailError && <span style={{ color: 'var(--danger, #c0392b)' }}>{emailError}</span>}
              </div>
            </div>
          <div className="field">
            <label>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 7042273876" />
          </div>
          <div className="field">
            <label>Age</label>
            <input type="number" min="0" max="130" value={age} onChange={e => setAge(e.target.value)} />
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div className="field">
            <label>Sex</label>
            <select value={sex} onChange={e => setSex(e.target.value)}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Weight (kg)</label>
            <input type="number" min="0" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div className="field">
            <label>Height (cm)</label>
            <input type="number" min="0" value={height} onChange={e => setHeight(e.target.value)} />
          </div>
          <div className="field">
            <label>Conditions (comma separated)</label>
            <input value={Array.isArray(conditions) ? conditions.join(', ') : conditions} onChange={e => setConditions(String(e.target.value).split(',').map(s => s.trim()).filter(Boolean))} />
          </div>
        </div>
      </div>

      <div className="medicines-section">
        <div className="section-head">
          <h3>Medicines</h3>
          <button type="button" className="add-btn" onClick={addMedicine}>+ Add Medicine</button>
        </div>
        {medicines.map(m => (
          <div key={m.id} className="medicine-row">
            <div className="field">
              <label>Medicine Name</label>
              <input value={m.name} onChange={e => updateMedicine(m.id,'name', e.target.value)} placeholder="e.g. Paracetamol" />
            </div>
            <div className="field">
              <label>Dosage Value</label>
              <input type="number" min="0" step="0.1" value={m.dosageValue} onChange={e => updateMedicine(m.id,'dosageValue', e.target.value)} placeholder="e.g. 500" />
            </div>
            <div className="field">
              <label>Units</label>
              <select value={m.dosageUnit} onChange={e => updateMedicine(m.id,'dosageUnit', e.target.value)}>
                <option value="tablets">Tablets</option>
                <option value="ml">ML</option>
                <option value="mg">MG</option>
                <option value="g">G</option>
                <option value="capsules">Capsules</option>
                <option value="drops">Drops</option>
                <option value="teaspoons">Teaspoons</option>
                <option value="tablespoons">Tablespoons</option>
              </select>
            </div>
            <div className="field">
              <label>Times per Day</label>
              <input type="number" min="1" max="10" value={m.timesPerDay} onChange={e => updateMedicine(m.id,'timesPerDay', e.target.value)} placeholder="e.g. 3" />
            </div>
            <div className="field">
              <label>Total Days</label>
              <input type="number" min="1" max="365" value={m.totalDays} onChange={e => updateMedicine(m.id,'totalDays', e.target.value)} placeholder="e.g. 7" />
            </div>
            {medicines.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeMedicine(m.id)} aria-label="Remove medicine">✕</button>
            )}
          </div>
        ))}
      </div>

      <div className="field">
        <label>Diagnosis</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Primary diagnosis, clinical notes, plan..." />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
          style={{ position: 'relative', opacity: loading ? 0.7 : 1 }}
        >
          {loading && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'inline-flex'
              }}
            >
              <span className="btn-spinner" style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.6)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'prescribe-spin 0.8s linear infinite'
              }} />
            </span>
          )}
          <span style={{ marginLeft: loading ? '12px' : 0 }}>
            {loading ? 'Saving...' : 'Submit Prescription'}
          </span>
        </button>
        <button type="button" className="secondary-btn" onClick={resetForm} disabled={loading}>Reset</button>
        {/* If email lookup didn't find a patient, allow creating one quickly */}
        {!emailFound && patientEmail.trim() && (
          <button
            type="button"
            className="create-patient-btn"
            onClick={handleCreatePatient}
            disabled={creatingPatient || emailLoading}
            style={{ marginLeft: 8 }}
          >
            {creatingPatient ? 'Creating...' : 'Create Patient'}
          </button>
        )}
      </div>

      {/* Success modal for lookup/create actions */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', padding: 20, borderRadius: 8, minWidth: 300, maxWidth: '90%' }}
          >
            <div style={{ marginBottom: 12, fontWeight: 600 }}>{modalMessage}</div>
            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={() => setShowSuccessModal(false)} className="secondary-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Patient History Modal (list) */}
      {showHistoryModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: 16, borderRadius: 8, width: '90%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Patient History</h4>
              <button onClick={() => setShowHistoryModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ minHeight: 40, marginBottom: 8 }}>
              {historyLoading && <span>Loading...</span>}
              {historyError && <span style={{ color: '#b91c1c' }}>{historyError}</span>}
            </div>
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px' }}>Date</th>
                    <th style={{ padding: '8px' }}>Medicines</th>
                    <th style={{ padding: '8px' }}>Diagnosis</th>
                    <th style={{ padding: '8px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px' }}>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</td>
                      <td style={{ padding: '8px' }}>{Array.isArray(p.medicines) ? p.medicines.length : 0}</td>
                      <td style={{ padding: '8px' }}>{p.notes ? (p.notes.length > 60 ? p.notes.slice(0, 57) + '...' : p.notes) : ''}</td>
                      <td style={{ padding: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openDetailAndFetch(p._id)}
                          style={{ padding: '6px 10px', cursor: 'pointer' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!historyLoading && !historyError && historyItems.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>No prescriptions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Patient History Detail Modal */}
      {showDetailModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}
          onClick={() => { setShowDetailModal(false); setSelectedPrescription(null); }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: 18, borderRadius: 8, width: '92%', maxWidth: 720, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Prescription Details</h4>
              <button onClick={() => { setShowDetailModal(false); setSelectedPrescription(null); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ minHeight: 28, marginTop: 8 }}>
              {detailLoading && <span>Loading...</span>}
              {detailError && <span style={{ color: '#b91c1c' }}>{detailError}</span>}
            </div>
            {selectedPrescription && selectedPrescription.doc && !detailLoading && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  {selectedPrescription.verified ? (
                    <span style={{ background: '#def7ec', color: '#03543f', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>Verified</span>
                  ) : (
                    <span style={{ background: '#fde8e8', color: '#9b1c1c', padding: '2px 8px', borderRadius: 999, fontSize: 12 }}>Tampered</span>
                  )}
                  {typeof selectedPrescription.onChainVerified === 'boolean' && (
                    <span style={{ fontSize: 12, color: '#4b5563' }}>
                      On-chain: {selectedPrescription.onChainVerified ? 'present' : 'not found'}
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 8 }}><strong>Date:</strong> {selectedPrescription.doc.createdAt ? new Date(selectedPrescription.doc.createdAt).toLocaleString() : ''}</div>
                <div style={{ marginBottom: 8 }}><strong>Patient:</strong> {selectedPrescription.doc.patientName} &lt;{selectedPrescription.doc.patientEmail || '—'}&gt;</div>
                <div style={{ marginTop: 8 }}>
                  <strong>Medicines</strong>
                  <ul>
                    {Array.isArray(selectedPrescription.doc.medicines) && selectedPrescription.doc.medicines.map((m, idx) => (
                      <li key={idx}>{m.name} — {m.dosageValue}{m.dosageUnit ? ' ' + m.dosageUnit : ''} — {m.timesPerDay}x/day for {m.totalDays} days</li>
                    ))}
                  </ul>
                </div>
                {selectedPrescription.doc.notes && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Diagnosis</strong>
                    <div style={{ marginTop: 4 }}>{selectedPrescription.doc.notes}</div>
                  </div>
                )}
                <div style={{ marginTop: 12, fontSize: 12, color: '#4b5563' }}>
                  <div><strong>Stored Hash:</strong> {selectedPrescription.storedHash || '—'}</div>
                  <div><strong>Computed Hash:</strong> {selectedPrescription.computedHash || '—'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* removed mock success banner - real success handled via `created` state */}
    </form>
  );
}
