import React, { useState } from 'react';

export default function PrescribeForm() {
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
        {medicines.map(m => (
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
