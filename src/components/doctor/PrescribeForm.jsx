import React, { useState } from 'react';

export default function PrescribeForm() {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
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

  return (
    <form className="prescribe-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label>Patient Name *</label>
          <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. Jane Doe" required />
        </div>
        <div className="field">
          <label>Patient Email</label>
          <input type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} placeholder="e.g. jane.doe@email.com" />
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
      </div>

      {/* removed mock success banner - real success handled via `created` state */}
    </form>
  );
}
