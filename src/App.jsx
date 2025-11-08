import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Example from './components/Example.jsx';
import DoctorDashboard from './components/DoctorDashboard.jsx';
import Billing from './pages/Billing/Billing.jsx';
import ScanAddStock from './pages/Scan/ScanAddStock.jsx';

function AddInventoryForm({ onAdd }) {
  const [form, setForm] = useState({
    name: '', batch: '', expiry: '', quantity: '', price: '', drugCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          price: Number(form.price),
          pharmacyId: 'P001',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onAdd(data);
        setForm({ name: '', batch: '', expiry: '', quantity: '', price: '', drugCode: '' });
      } else {
        setError(data.error || 'Error adding inventory');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
      <h4>Add Inventory Item</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="batch" value={form.batch} onChange={handleChange} placeholder="Batch" required />
        <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="Expiry (YYYY-MM-DD)" required />
        <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" type="number" required />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" required />
        <input name="drugCode" value={form.drugCode} onChange={handleChange} placeholder="Drug Code" required />
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 8 }}>Add</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}

function HomeLayout() {
  const [inventory, setInventory] = useState([]);
  const pharmacyId = "P001"; // Static for now

  useEffect(() => {
    fetch('http://localhost:5000/api/inventory')
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(err => console.error('Inventory fetch error:', err));
  }, []);

  const handleAddInventory = (newItem) => {
    setInventory(prev => [...prev, newItem]);
  };

  const handleScanAddMedicine = (newMed) => {
    fetch('http://localhost:5000/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newMed, pharmacyId }),
    })
      .then(res => res.json())
      .then(data => setInventory(prev => [...prev, data]))
      .catch(() => alert('Error adding scanned medicine'));
  };

  const updateStock = (drugCode, qtySold) => {
    fetch('http://localhost:5000/api/inventory/update-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugCode, qty: qtySold, pharmacyId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInventory(prev =>
            prev.map(m => m.drugCode === drugCode ? { ...m, quantity: m.quantity - qtySold } : m)
          );
        } else {
          alert(data.error || 'Stock update failed');
        }
      })
      .catch(() => alert('Stock update error'));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>HackCBS Project — Pharmacy Management</h1>
        <nav style={{ marginTop: '1rem' }}>
          <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
          <Link to="/inventory" style={{ marginRight: '1rem' }}>Inventory</Link>
          <Link to="/billing" style={{ marginRight: '1rem' }}>Billing</Link>
          <Link to="/doctor">Doctor</Link>
        </nav>
      </header>

      <main style={{ marginTop: '2rem' }}>
        <AddInventoryForm onAdd={handleAddInventory} />
        <Routes>
          <Route path="/billing" element={<Billing inventory={inventory} updateStock={updateStock} />} />
          <Route path="/inventory" element={<ScanAddStock addMedicine={handleScanAddMedicine} pharmacyId={pharmacyId} />} />
          <Route path="/" element={<Example />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/*" element={<HomeLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
