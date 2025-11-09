import React, { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

const scannerId = "html5qr-scanner";

export default function ScanAddStock({ addMedicine, pharmacyId }) {
  const [scanning, setScanning] = useState(false);
  const html5QrcodeRef = useRef(null);
  const [status, setStatus] = useState("");
  const [lastDecoded, setLastDecoded] = useState("");
  const [showManualForm, setShowManualForm] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [form, setForm] = useState({
    drugCode: "",
    name: "",
    batch: "",
    expiry: "",
    manufacturer: "",
    price: "",
    quantity: 1,
  });
  const [saving, setSaving] = useState(false);

  const parseQr = (decodedText) => {
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed && (parsed.drugCode || parsed.code || parsed.id)) {
        return {
          drugCode: parsed.drugCode || parsed.code || parsed.id,
          name: parsed.name || "Unknown",
          batch: parsed.batch || "",
          expiry: parsed.expiry || "",
          manufacturer: parsed.manufacturer || "",
          price: parsed.price ?? 20,
        };
      }
    } catch (_) {}
    try {
      const url = new URL(decodedText);
      const qp = url.searchParams;
      const code = qp.get('drugCode') || qp.get('code') || qp.get('id');
      if (code) {
        return {
          drugCode: code,
          name: qp.get('name') || "Unknown",
          batch: qp.get('batch') || "",
          expiry: qp.get('expiry') || "",
          manufacturer: qp.get('manufacturer') || "",
          price: qp.get('price') ? Number(qp.get('price')) : 20,
        };
      }
    } catch (_) {}
    const raw = String(decodedText || '').trim();
    if (raw) return { drugCode: raw, name: "Unknown" };
    return null;
  };

  const addToInventory = async (item) => {
    if (!item.drugCode) return;
    const newItem = { ...item, quantity: 1, pharmacyId };
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL('api/inventory', base).toString();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch (_) {}
      if (!res.ok) throw new Error(data.error || text || "Failed to add inventory");
      addMedicine(data);
      setStatus(`Added ${data.name} to inventory`);
    } catch (e) {
      console.error(e);
      setStatus(e.message || "Failed to add inventory");
    }
  };

  const prefillFormFromInfo = (info) => {
    setForm(f => ({
      ...f,
      drugCode: info.drugCode || f.drugCode,
      name: info.name || f.name || "",
      manufacturer: info.manufacturer || f.manufacturer || "",
      batch: info.batch || f.batch || "",
      expiry: info.expiry || f.expiry || "",
      price: typeof info.price !== 'undefined' && info.price !== null ? String(info.price) : f.price,
      quantity: info.quantity ? Number(info.quantity) : f.quantity || 1,
    }));
    // keep manual form visible
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.drugCode || !String(form.drugCode).trim()) return 'Code is required';
    if (!form.name || !String(form.name).trim()) return 'Medicine name is required';
    if (form.quantity == null || Number(form.quantity) <= 0) return 'Quantity must be greater than 0';
    // expiry optional, but if present basic format check (YYYY-MM or YYYY-MM-DD)
    if (form.expiry && !/^\d{4}-\d{2}(-\d{2})?$/.test(form.expiry)) return 'Expiry must be YYYY-MM or YYYY-MM-DD';
    return null;
  };

  const submitManual = async () => {
    const err = validateForm();
    if (err) { setStatus(err); return; }
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        drugCode: form.drugCode,
        name: form.name,
        batch: form.batch || undefined,
        expiry: form.expiry || undefined,
        manufacturer: form.manufacturer || undefined,
        price: form.price ? Number(form.price) : undefined,
        quantity: Number(form.quantity) || 1,
      };
      await addToInventory(payload);
      setForm({ drugCode: '', name: '', batch: '', expiry: '', manufacturer: '', price: '', quantity: 1 });
    } finally {
      setSaving(false);
    }
  };

  const startScanner = async () => {
    if (scanning) return;
    try {
      setStatus("");
      html5QrcodeRef.current = new Html5Qrcode(scannerId);
      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 200 },
        async (decodedText) => {
          setLastDecoded(decodedText);
          let info = parseQr(decodedText);
          // If parsing produced only a raw URL or minimal data, attempt server-side resolve
          const looksLikeUrl = /^https?:\/\//.test(decodedText);
          if (info && info.drugCode && info.name === 'Unknown' && looksLikeUrl) {
            setResolving(true);
            try {
              const base = import.meta.env.VITE_API_BASE_URL || '/';
              const resolveUrl = new URL(`api/scan/resolve?u=${encodeURIComponent(decodedText)}`, base).toString();
              const r = await fetch(resolveUrl);
              if (r.ok) {
                let resolved = {};
                const t = await r.text();
                try { resolved = t ? JSON.parse(t) : {}; } catch (_) { resolved = {}; }
                // merge resolved into info
                info = { ...info, ...resolved };
              }
            } catch (e) {
              console.warn('Resolve failed', e);
            } finally {
              setResolving(false);
            }
          }
          stopScanner();
          // Decide whether to auto-add or ask for manual fill
          const enriched = info && (
            (info.name && info.name !== 'Unknown') || info.manufacturer || info.batch || info.expiry || (typeof info.price !== 'undefined')
          );
          if (info && enriched) {
            addToInventory(info);
          } else if (info) {
            // Prefill manual form with what we have
            prefillFormFromInfo(info);
            setStatus('Scan recognized but details unavailable. Please complete the fields and add to inventory.');
          } else {
            setShowManualForm(true);
            setStatus("Unrecognized QR content. Please enter details manually.");
          }
        },
        (errorMessage) => {}
      );
      // Ensure the video feed stays inside the scanner box and covers it
      const container = document.getElementById(scannerId);
      if (container) {
        // Make sure container clips overflow
        container.style.overflow = 'hidden';
        container.style.position = 'relative';
        container.style.display = 'block';
        // After a short delay the video element is injected by the lib
        setTimeout(() => {
          try {
            const video = container.querySelector('video');
            if (video) {
              // Cover the container while keeping aspect ratio
              video.style.objectFit = 'cover';
              video.style.width = '100%';
              video.style.height = '100%';
              video.style.position = 'absolute';
              video.style.top = '0';
              video.style.left = '0';
            }
            // also try to style the canvas if present
            const canvas = container.querySelector('canvas');
            if (canvas) {
              canvas.style.width = '100%';
              canvas.style.height = '100%';
              canvas.style.objectFit = 'cover';
            }
          } catch (e) {
            // non-fatal
          }
        }, 200);
      }
      setScanning(true);
    } catch (e) {
      console.error(e);
      setStatus('Failed to start scanner. Check camera permissions or use a manual entry.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try { await html5QrcodeRef.current.stop(); } catch (_) {}
      try { html5QrcodeRef.current.clear(); } catch (_) {}
      html5QrcodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => () => stopScanner(), []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
      <div style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <button onClick={startScanner} disabled={scanning} style={{ marginRight: 8 }}>
            Start Scanner
          </button>
          <button onClick={stopScanner} disabled={!scanning}>Stop</button>
        </div>
        <div id={scannerId} style={{ width: '100%', height: 300, border: '1px dashed #aaa', borderRadius: 8 }} />
  {resolving && <div style={{ marginTop: 6, color: '#0369a1' }}>Resolving...</div>}
  {status && <div style={{ marginTop: 6, color: '#b91c1c' }}>{status}</div>}
  {lastDecoded && <div style={{ marginTop: 4, fontSize: 12 }}>Last decoded: {lastDecoded}</div>}
        
      </div>
      <div style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <strong>Manual Entry</strong>
  <div style={{ marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Code *</label>
              <input value={form.drugCode} onChange={e => handleFormChange('drugCode', e.target.value)} style={{ width: '100%', padding: 6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Name *</label>
              <input value={form.name} onChange={e => handleFormChange('name', e.target.value)} style={{ width: '100%', padding: 6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Manufacturer</label>
              <input value={form.manufacturer} onChange={e => handleFormChange('manufacturer', e.target.value)} style={{ width: '100%', padding: 6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Batch</label>
              <input value={form.batch} onChange={e => handleFormChange('batch', e.target.value)} style={{ width: '100%', padding: 6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Expiry (YYYY-MM or YYYY-MM-DD)</label>
              <input value={form.expiry} onChange={e => handleFormChange('expiry', e.target.value)} placeholder="2026-05" style={{ width: '100%', padding: 6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Price</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => handleFormChange('price', e.target.value)} style={{ width: '100%', padding: 6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12 }}>Quantity *</label>
              <input type="number" min="1" value={form.quantity} onChange={e => handleFormChange('quantity', e.target.value)} style={{ width: '100%', padding: 6 }} />
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button onClick={submitManual} disabled={saving}>
              {saving ? 'Adding...' : 'Add to Inventory'}
            </button>
            <button onClick={() => { setForm({ drugCode:'', name:'', batch:'', expiry:'', manufacturer:'', price:'', quantity:1 }); }}>Clear</button>
          </div>
        </div>

        
      </div>
    </div>
  );
}
