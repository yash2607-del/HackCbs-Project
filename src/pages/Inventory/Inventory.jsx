import React, { useState } from 'react';

const styles = {
  container: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 18, alignItems: 'start' },
  panel: { background: '#fff', border: '1px solid #e6eef8', padding: 14, borderRadius: 10, boxShadow: '0 6px 18px rgba(2,6,23,.04)' },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: 10, borderRadius: 8, border: '1px solid #eef2ff', marginBottom: 10, alignItems: 'center' },
  label: { fontSize: 13, color: '#334155', fontWeight: 700 },
  input: { padding: '8px 10px', border: '1px solid #dbe7f5', borderRadius: 8 }
};

export default function Inventory({ inventory = [], addMedicine }) {
  const [query, setQuery] = useState('');

  const q = (s = '') => String(s || '').toLowerCase();
  const filtered = inventory.filter(it => {
    if (!query) return true;
    const term = q(query);
    return (
      q(it.name).includes(term) ||
      q(it.drugCode).includes(term) ||
      q(it.batch).includes(term) ||
      q(it.manufacturer).includes(term) ||
      q(it.expiry).includes(term) ||
      String(it.quantity).includes(term) ||
      String(it.price).includes(term)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h3 style={{ marginBottom: 8 }}>Inventory</h3>
          <p style={{ marginTop: 0, color: '#64748b' }}>View and search the current stock.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search by name, code, batch, manufacturer, expiry..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #dbe7f5', borderRadius: 8, width: 360 }} />
        </div>
      </div>

      <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e6eef8', borderRadius: 8, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead style={{ background: '#cbd5e1' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #a8b3bf', color: '#0f172a' }}>Name</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #a8b3bf', color: '#0f172a' }}>Code</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #a8b3bf', color: '#0f172a' }}>Batch</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #a8b3bf', color: '#0f172a' }}>Manufacturer</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #a8b3bf', color: '#0f172a' }}>Expiry</th>
              <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #a8b3bf', color: '#0f172a' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: 12, borderBottom: '1px solid #a8b3bf', color: '#0f172a' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>No items match your search.</td>
              </tr>
            )}
            {filtered.map((it, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#f1f5f9' : '#e6eef8' }}>
                <td style={{ padding: 12 }}>{it.name}</td>
                <td style={{ padding: 12 }}>{it.drugCode}</td>
                <td style={{ padding: 12 }}>{it.batch || '—'}</td>
                <td style={{ padding: 12 }}>{it.manufacturer || '—'}</td>
                <td style={{ padding: 12 }}>{it.expiry || '—'}</td>
                <td style={{ padding: 12, textAlign: 'right' }}>{it.quantity}</td>
                <td style={{ padding: 12, textAlign: 'right' }}>₹{it.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
