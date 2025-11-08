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
        <h4 style={{ marginBottom: 8 }}>Patient Information</h4>
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
        <label>Other Actions / Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Diet changes, tests to schedule, follow-up timeframe..." />
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

      {/* removed mock success banner - real success handled via `created` state */}
    </form>
  );
}
