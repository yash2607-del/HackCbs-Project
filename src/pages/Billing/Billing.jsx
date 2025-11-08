
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Realistic Pharmacy Billing UI
// - Type-ahead search to add medicines
// - Quantity controls with stock validation
// - Customer & payment details
// - Tax/discount and final totals
// - Print receipt

export default function Billing({ inventory = [], updateStock = () => {} }) {
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [billItems, setBillItems] = useState([]); // {drugCode,name,price,qty}
  const [customer, setCustomer] = useState({ name: "", phone: "", doctor: "" });
  const [billNo, setBillNo] = useState(() => `INV-${Date.now().toString().slice(-6)}`);
  const [payment, setPayment] = useState("Cash");
  const [discount, setDiscount] = useState(0); // flat discount
  const TAX_RATE = 0.12; // 12% GST for demo
  const inputRef = useRef(null);
  const [selected, setSelected] = useState(null); // selected suggestion for availability view
  const [idInput, setIdInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const html5QrcodeRef = useRef(null);
  const scannerRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return inventory
      .filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.drugCode && m.drugCode.toLowerCase().includes(q)) ||
          (m.manufacturer && m.manufacturer.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, inventory]);

  const totals = useMemo(() => {
    const subtotal = billItems.reduce((sum, it) => sum + it.price * it.qty, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    const grand = Math.max(0, subtotal + tax - (Number(discount) || 0));
    return { subtotal, tax, grand };
  }, [billItems, discount]);

  const inventoryByCode = useMemo(() => {
    const map = new Map();
    for (const m of inventory) map.set(m.drugCode, m);
    return map;
  }, [inventory]);

  function addItem(med) {
    if (!med) return;
    setBillItems((prev) => {
      const idx = prev.findIndex((p) => p.drugCode === med.drugCode);
      if (idx >= 0) {
        const current = prev[idx];
        const available = inventoryByCode.get(med.drugCode)?.quantity ?? 0;
        const newQty = Math.min(current.qty + 1, available || 1);
        const updated = [...prev];
        updated[idx] = { ...current, qty: newQty };
        return updated;
      }
      return [...prev, { drugCode: med.drugCode, name: med.name, price: med.price, qty: 1 }];
    });
    setIdInput("");
    inputRef.current?.focus();
  }

  function addById() {
    const code = (idInput || "").trim();
    if (!code) return;
    const med = inventory.find(m => (m.drugCode || "").toString().toLowerCase() === code.toLowerCase());
    if (!med) return alert("Medicine ID not found in inventory.");
    if (!med.quantity) return alert("Selected medicine is out of stock.");
    addItem(med);
  }

  function setQty(drugCode, qty) {
    setBillItems((prev) => {
      const n = Math.max(1, Math.floor(Number(qty) || 0));
      const available = inventoryByCode.get(drugCode)?.quantity ?? Infinity;
      return prev.map((p) => (p.drugCode === drugCode ? { ...p, qty: Math.min(n, available) } : p));
    });
  }

  function inc(drugCode, delta) {
    setBillItems((prev) => {
      return prev.map((p) => {
        if (p.drugCode !== drugCode) return p;
        const available = inventoryByCode.get(drugCode)?.quantity ?? Infinity;
        const next = Math.max(1, Math.min(p.qty + delta, available));
        return { ...p, qty: next };
      });
    });
  }

  function removeItem(drugCode) {
    setBillItems((prev) => prev.filter((p) => p.drugCode !== drugCode));
  }

  function clearBill() {
    setBillItems([]);
    setDiscount(0);
    setBillNo(`INV-${Date.now().toString().slice(-6)}`);
  }

  function completeSale() {
    if (billItems.length === 0) return alert("No items in bill.");
    billItems.forEach((it) => updateStock(it.drugCode, it.qty));
    printReceipt();
    // Clear after a short delay so the receipt renders with items
    setTimeout(() => {
      clearBill();
      alert(`Bill Generated! Total: ₹${totals.grand}`);
    }, 300);
  }

  function printReceipt() {
    window.print();
  }

  function onKeyDown(e) {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestOpen(true);
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Enter selects for availability only; adding requires scan or ID entry
      setSelected(suggestions[highlightIdx]);
      setSuggestOpen(false);
    }
  }

  // Scanner integration to add to bill by scanning a code
  async function startScanner() {
    // Ensure running in browser
    if (typeof window === 'undefined') return alert('Camera scanner unavailable in this environment');
    try {
      // avoid duplicate instances
      if (html5QrcodeRef.current) {
        try { await html5QrcodeRef.current.stop(); } catch (_) {}
        try { html5QrcodeRef.current.clear(); } catch (_) {}
        html5QrcodeRef.current = null;
      }

      // Use same start pattern as ScanAddStock: attach to element id and use facingMode
      html5QrcodeRef.current = new Html5Qrcode("billing-qr-scanner");
      setScanning(true);
      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 200 },
        (decodedText) => {
          onScan(decodedText);
        }
      );
    } catch (e) {
      console.error('startScanner error', e);
      setScanning(false);
      // give a helpful message for permission issues
      if (e && /NotAllowedError|PermissionDeniedError/i.test(String(e))) {
        alert('Camera permission denied. Please allow camera access in your browser and retry.');
      } else if (e && /NotFoundError/i.test(String(e))) {
        alert('No suitable camera found.');
      } else {
        alert('Failed to start camera scanner: ' + (e?.message || e));
      }
    }
  }

  async function stopScanner() {
    try {
      if (html5QrcodeRef.current) {
        await html5QrcodeRef.current.stop();
        try { html5QrcodeRef.current.clear(); } catch (_) {}
        html5QrcodeRef.current = null;
      }
    } catch (e) {
      console.warn('stopScanner error', e);
    } finally {
      setScanning(false);
    }
  }

  function onScan(decodedText) {
    // Accept raw code or JSON with { drugCode }
    let code = decodedText;
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed && parsed.drugCode) code = parsed.drugCode;
    } catch {}
    const med = inventory.find(m => (m.drugCode || "").toString().toLowerCase() === String(code).toLowerCase());
    if (!med) {
      alert("Scanned code not found in inventory");
      return;
    }
    if (!med.quantity) {
      alert("Scanned medicine is out of stock");
      return;
    }
    addItem(med);
    stopScanner();
  }

  useEffect(() => {
    return () => { if (scanning) stopScanner(); };
  }, [scanning]);

  const styles = {
    row: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    input: { padding: '10px 12px', border: '1px solid #ccc', borderRadius: 8 },
    table: { width: '100%', borderCollapse: 'collapse' },
    thtd: { borderBottom: '1px solid #eee', padding: '10px 8px', textAlign: 'left' },
    smallBtn: { width: 28, height: 28, borderRadius: 6, border: '1px solid #ccc', background: '#fff' },
    primary: { background: '#0b84fe', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, fontWeight: 700 },
    secondary: { background: '#fff', color: '#012', border: '1px solid #ccc', padding: '10px 14px', borderRadius: 8, fontWeight: 700 },
    danger: { background: '#e53935', color: '#fff', border: 'none', padding: '8px 10px', borderRadius: 8, fontWeight: 700 },
    tag: { fontSize: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: 6, color: '#334155' },
    muted: { color: '#64748b', fontSize: 12 }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Print-only CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
        }
      `}</style>

      {/* Header: Customer & Bill meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...styles.input, flex: 1 }} placeholder="Customer name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          <input style={{ ...styles.input, width: 160 }} placeholder="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
        </div>
        <input style={styles.input} placeholder="Prescribing doctor" value={customer.doctor} onChange={(e) => setCustomer({ ...customer, doctor: e.target.value })} />
        <input style={styles.input} value={billNo} onChange={(e) => setBillNo(e.target.value)} />
        <input style={styles.input} value={new Date().toLocaleString()} readOnly />
        <select style={styles.input} value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option>Cash</option>
          <option>Card</option>
          <option>UPI</option>
        </select>
      </div>

      {/* Search bar (availability only) */}
      <div>
        <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Add medicine</label>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            style={{ ...styles.input, width: '100%' }}
            placeholder="Type name / code / manufacturer"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSuggestOpen(true); setHighlightIdx(0); }}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
            onFocus={() => query && setSuggestOpen(true)}
          />
          {suggestOpen && suggestions.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 5, background: '#fff', border: '1px solid #e2e8f0', width: '100%', borderRadius: 8, marginTop: 6, boxShadow: '0 8px 24px rgba(2,6,23,.08)' }}>
              {suggestions.map((s, i) => {
                const disabled = !s.quantity;
                return (
                  <div
                    key={s.drugCode}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setSelected(s); setSuggestOpen(false); }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, padding: '10px 12px', cursor: 'pointer', background: i === highlightIdx ? '#f1f5f9' : 'transparent', color: disabled ? '#94a3b8' : '#0f172a' }}
                  >
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div style={styles.muted}>₹{s.price}</div>
                    <div style={styles.muted}>Stock: {s.quantity}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {selected && (
          <div style={{ marginTop: 8, padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>{selected.name}</div>
                <div style={styles.muted}>Code: {selected.drugCode} • Price: ₹{selected.price} • Stock: {selected.quantity}</div>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>To add, scan the code or enter ID below</div>
            </div>
          </div>
        )}
      </div>

      {/* Add by ID or Scan */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          placeholder="Enter Medicine ID (drug code)"
          style={{ ...styles.input, width: 280 }}
        />
        <button style={styles.primary} onClick={addById}>Add by ID</button>
        {!scanning && <button style={styles.secondary} onClick={startScanner}>Scan to Add</button>}
        {scanning && <button style={styles.secondary} onClick={stopScanner}>Stop Scan</button>}
      </div>
      <div style={{ marginTop: 8 }}>
        <div
          ref={scannerRef}
          id="billing-qr-scanner"
          style={{ display: scanning ? 'block' : 'none', width: 320, height: 240, border: '1px solid #e2e8f0', borderRadius: 8 }}
        />
        {scanning && <div style={{ ...styles.muted, marginTop: 6 }}>Point the camera at the medicine code</div>}
      </div>

      {/* Bill items table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
        <table style={styles.table}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={styles.thtd}>Item</th>
              <th style={styles.thtd}>Price</th>
              <th style={styles.thtd}>Qty</th>
              <th style={styles.thtd}>In Stock</th>
              <th style={styles.thtd}>Subtotal</th>
              <th style={styles.thtd}>Action</th>
            </tr>
          </thead>
          <tbody>
            {billItems.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>No items yet. Search above to add.</td></tr>
            )}
            {billItems.map((it) => {
              const available = inventoryByCode.get(it.drugCode)?.quantity ?? 0;
              const subtotal = it.price * it.qty;
              const outOfStock = available === 0;
              const exceeded = it.qty > available;
              return (
                <tr key={it.drugCode}>
                  <td style={{ ...styles.thtd, fontWeight: 700 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{it.name}</span>
                      <span style={styles.muted}>Code: {it.drugCode}</span>
                    </div>
                  </td>
                  <td style={styles.thtd}>₹{it.price}</td>
                  <td style={styles.thtd}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button style={styles.smallBtn} onClick={() => inc(it.drugCode, -1)} disabled={it.qty <= 1}>-</button>
                      <input
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => setQty(it.drugCode, e.target.value)}
                        style={{ ...styles.input, width: 72, textAlign: 'center' }}
                      />
                      <button style={styles.smallBtn} onClick={() => inc(it.drugCode, +1)} disabled={it.qty >= available}>+</button>
                    </div>
                    {(outOfStock || exceeded) && (
                      <div style={{ color: '#b91c1c', fontSize: 12, marginTop: 6 }}>
                        {outOfStock ? 'Out of stock' : `Only ${available} available`}
                      </div>
                    )}
                  </td>
                  <td style={styles.thtd}><span style={styles.tag}>{available}</span></td>
                  <td style={styles.thtd}>₹{subtotal}</td>
                  <td style={styles.thtd}>
                    <button style={styles.danger} onClick={() => removeItem(it.drugCode)}>Remove</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>
        <div />
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#fff', boxShadow: '0 4px 16px rgba(2,6,23,.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
            <div>Subtotal</div>
            <div>₹{totals.subtotal}</div>
            <div>Tax (12% GST)</div>
            <div>₹{totals.tax}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Discount
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ ...styles.input, width: 100 }} />
            </div>
            <div>–₹{Number(discount) || 0}</div>
            <div style={{ fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 10 }}>Grand Total</div>
            <div style={{ fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 10 }}>₹{totals.grand}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button style={styles.primary} onClick={completeSale} disabled={billItems.length === 0}>Complete Sale & Print</button>
            <button style={styles.secondary} onClick={printReceipt}>Print</button>
            <button style={styles.secondary} onClick={clearBill}>Clear</button>
          </div>
        </div>
      </div>

      {/* Receipt (print-only) */}
      <div id="receipt" style={{ background: '#fff', padding: 24, border: '1px solid #e5e7eb', borderRadius: 10 }}>
        <h3 style={{ margin: 0 }}>Pharmacy Invoice</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: '#475569' }}>
          <div>
            <div>Bill No: {billNo}</div>
            <div>Date: {new Date().toLocaleString()}</div>
          </div>
          <div>
            <div>Customer: {customer.name || '—'}</div>
            <div>Phone: {customer.phone || '—'}</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb', padding: '6px 4px' }}>Item</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #e5e7eb', padding: '6px 4px' }}>Price</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #e5e7eb', padding: '6px 4px' }}>Qty</th>
              <th style={{ textAlign: 'right', borderBottom: '1px solid #e5e7eb', padding: '6px 4px' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((it) => (
              <tr key={it.drugCode}>
                <td style={{ padding: '6px 4px' }}>{it.name}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{it.price}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>{it.qty}</td>
                <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{it.price * it.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, marginTop: 10 }}>
          <div>Subtotal</div>
          <div>₹{totals.subtotal}</div>
          <div>Tax (12%)</div>
          <div>₹{totals.tax}</div>
          <div>Discount</div>
          <div>₹{Number(discount) || 0}</div>
          <div style={{ fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>Grand Total</div>
          <div style={{ fontWeight: 800, borderTop: '1px dashed #cbd5e1', paddingTop: 6 }}>₹{totals.grand}</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#64748b' }}>Thank you for choosing our pharmacy.</div>
      </div>
    </div>
  );
}
