import React, { useState } from 'react';
import './AddMedicineForm.scss';

export default function AddMedicineForm({ addMedicine, pharmacyId }) {
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    drugCode: '',
    batch: '',
    expiry: '',
    manufacturer: '',
    price: '',
    quantity: 1,
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!form.name || !String(form.name).trim()) return 'Medicine name is required';
    if (form.quantity == null || Number(form.quantity) <= 0) return 'Quantity must be greater than 0';
    if (form.expiry && !/^\d{4}-\d{2}(-\d{2})?$/.test(form.expiry)) return 'Expiry must be YYYY-MM or YYYY-MM-DD';
    if (!pharmacyId) return 'Missing pharmacy id';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setStatus(err); return; }
    setSaving(true);
    setStatus('');
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL('api/inventory', base).toString();
      const payload = {
        pharmacyId,
        name: form.name,
        drugCode: form.drugCode || undefined,
        batch: form.batch || undefined,
        expiry: form.expiry || undefined,
        manufacturer: form.manufacturer || undefined,
        price: form.price ? Number(form.price) : undefined,
        quantity: Number(form.quantity) || 1,
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      addMedicine(data);
      setStatus(`Saved ${data.name} (qty ${data.quantity})`);
      setForm({ name: '', drugCode: '', batch: '', expiry: '', manufacturer: '', price: '', quantity: 1 });
    } catch (e) {
      setStatus(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-medicine-form">
      <div className="form-header">
        <h2>Add Medicine</h2>
        <p>If the name already exists for this pharmacy, its quantity will be incremented.</p>
      </div>
      
      {status && (
        <div className={`status-message ${status.startsWith('Saved') ? 'success' : 'error'}`}>
          {status}
        </div>
      )}
      
      <div className="form-grid">
        <div className="field">
          <label>Medicine Name *</label>
          <input 
            value={form.name} 
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Enter medicine name"
          />
        </div>
        
        <div className="field">
          <label>Drug Code</label>
          <input 
            value={form.drugCode} 
            onChange={e => handleChange('drugCode', e.target.value)}
            placeholder="Optional code"
          />
        </div>
        
        <div className="field">
          <label>Manufacturer</label>
          <input 
            value={form.manufacturer} 
            onChange={e => handleChange('manufacturer', e.target.value)}
            placeholder="Company name"
          />
        </div>
        
        <div className="field">
          <label>Batch Number</label>
          <input 
            value={form.batch} 
            onChange={e => handleChange('batch', e.target.value)}
            placeholder="Batch ID"
          />
        </div>
        
        <div className="field">
          <label>Expiry Date</label>
          <input 
            value={form.expiry} 
            onChange={e => handleChange('expiry', e.target.value)} 
            placeholder="YYYY-MM or YYYY-MM-DD"
          />
        </div>
        
        <div className="field">
          <label>Price (₹)</label>
          <input 
            type="number" 
            min="0" 
            step="0.01" 
            value={form.price} 
            onChange={e => handleChange('price', e.target.value)}
            placeholder="0.00"
          />
        </div>
        
        <div className="field">
          <label>Quantity *</label>
          <input 
            type="number" 
            min="1" 
            value={form.quantity} 
            onChange={e => handleChange('quantity', e.target.value)}
            placeholder="1"
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          className="submit-btn" 
          onClick={submit} 
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              <span style={{ marginLeft: 8 }}>Saving...</span>
            </>
          ) : (
            'Add Medicine'
          )}
        </button>
        <button 
          className="secondary-btn" 
          onClick={() => { 
            setForm({ name:'', drugCode:'', batch:'', expiry:'', manufacturer:'', price:'', quantity:1 }); 
            setStatus(''); 
          }}
        >
          Clear Form
        </button>
      </div>
    </div>
  );
}
