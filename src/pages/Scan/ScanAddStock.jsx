import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const scannerId = "html5qr-scanner";

export default function ScanAddStock({ addMedicine, pharmacyId }) {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [batch, setBatch] = useState("");
  const [expiry, setExpiry] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [recent, setRecent] = useState([]);
  const html5QrcodeRef = useRef(null);

  const startScanner = async () => {
    try {
      setScanning(true);
      html5QrcodeRef.current = new Html5Qrcode(scannerId);
      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 200 },
        (decodedText) => {
          stopScanner();
          let parsed = null;
          try { parsed = JSON.parse(decodedText); } catch (_) { parsed = null; }
          if (parsed && parsed.drugCode) {
            setScannedData(parsed);
            setBatch(parsed.batch || "");
            setExpiry(parsed.expiry || "");
            setManufacturer(parsed.manufacturer || "");
            setPrice(parsed.price ?? "");
          } else {
            // simple fallback: assume decodedText is drugCode, populate name placeholder
            setScannedData({ drugCode: decodedText, name: "Unknown medicine" });
            setBatch("");
            setExpiry("");
            setManufacturer("");
            setPrice("");
          }
        }
      );
      // give the library a moment to inject video/canvas then clamp styles
      setTimeout(() => adjustScannerStyles(), 180);
    } catch (e) {
      console.error('scanner start error', e);
      setScanning(false);
      alert('Failed to start scanner. Check camera permissions and try again.');
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrcodeRef.current) {
        await html5QrcodeRef.current.stop();
        try { html5QrcodeRef.current.clear(); } catch (_) {}
        html5QrcodeRef.current = null;
      }
    } catch (e) {
      console.warn('stop scanner error', e);
    } finally {
      setScanning(false);
    }
  };

  const addToInventory = () => {
    if (!scannedData) return alert("No scanned medicine to add");
    const qty = Number(quantity) || 0;
    if (!qty || qty <= 0) return alert("Enter a valid quantity");
    const newMed = {
      drugCode: scannedData.drugCode || String(Date.now()),
      name: scannedData.name || "Unnamed",
      batch: batch || scannedData.batch || "",
      expiry: expiry || scannedData.expiry || "",
      manufacturer: manufacturer || scannedData.manufacturer || "",
      quantity: qty,
      price: Number(price) || Math.floor(Math.random() * 50) + 10,
    };
    addMedicine(newMed);
    setRecent(r => [newMed, ...r].slice(0,6));
    // reset form
    setScannedData(null);
    setQuantity(""); setPrice(""); setBatch(""); setExpiry(""); setManufacturer("");
    alert("Added to inventory");
  };

  const styles = {
      container: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 18, alignItems: 'start' },
      panel: { background: '#fff', border: '1px solid #e6eef8', padding: 14, borderRadius: 10, boxShadow: '0 6px 18px rgba(2,6,23,.04)' },
      // ensure the scanner viewport clamps any injected video/canvas elements
      scannerBox: { width: '100%', maxWidth: 520, height: 320, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cfd8e3', overflow: 'hidden', position: 'relative' },
    field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 },
    label: { fontSize: 13, color: '#334155', fontWeight: 700 },
    input: { padding: '8px 10px', border: '1px solid #dbe7f5', borderRadius: 8 }
  };
  // Some browsers / html5-qrcode inject a video or canvas which may not be constrained by default.
  // Adjust the injected elements after the scanner starts so the camera fits the box.
  const adjustScannerStyles = () => {
    try {
      const el = document.getElementById(scannerId);
      if (!el) return;
      const video = el.querySelector('video');
      if (video) {
        video.style.maxWidth = '100%';
        video.style.maxHeight = '100%';
        video.style.objectFit = 'cover';
        video.style.width = '100%';
        video.style.height = '100%';
        // center and ensure it doesn't overflow
        video.style.position = 'absolute';
        video.style.left = '50%';
        video.style.top = '50%';
        video.style.transform = 'translate(-50%, -50%)';
      }
      const canvas = el.querySelector('canvas');
      if (canvas) {
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.objectFit = 'cover';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      }
    } catch (e) {
      // no-op
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Scan & Add Medicine</h3>
      <p style={{ marginTop: 0, color: '#64748b' }}>Use the scanner to quickly add medicines to your inventory. You can edit details before adding.</p>

      <div style={styles.container}>
        <div style={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Scanner</div>
            <div>
              {!scanning && <button onClick={startScanner} style={{ marginRight: 8 }}>Start Scanner</button>}
              {scanning && <button onClick={stopScanner}>Stop</button>}
            </div>
          </div>

          <div style={styles.scannerBox}>
            <div id={scannerId} style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>

          {scannedData ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 800 }}>{scannedData.name || 'Scanned item'}</div>
              <div style={{ color: '#64748b', marginTop: 6 }}>Code: {scannedData.drugCode}</div>
            </div>
          ) : (
            <div style={{ marginTop: 12, color: '#94a3b8' }}>No item scanned yet. Scan a code to populate fields.</div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Item details</div>
          <div style={styles.field}>
            <label style={styles.label}>Drug Code</label>
            <input style={styles.input} value={scannedData?.drugCode || ''} readOnly />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input style={styles.input} value={scannedData?.name || ''} onChange={(e)=> setScannedData(d => ({ ...(d||{}), name: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Batch</label>
              <input style={styles.input} value={batch} onChange={(e)=> setBatch(e.target.value)} />
            </div>
            <div style={{ width: 140 }}>
              <label style={styles.label}>Expiry</label>
              <input type="date" style={styles.input} value={expiry} onChange={(e)=> setExpiry(e.target.value)} />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Manufacturer</label>
            <input style={styles.input} value={manufacturer} onChange={(e)=> setManufacturer(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Quantity</label>
              <input type="number" min={1} style={styles.input} value={quantity} onChange={(e)=> setQuantity(e.target.value)} />
            </div>
            <div style={{ width: 140 }}>
              <label style={styles.label}>Price</label>
              <input type="number" style={styles.input} value={price} onChange={(e)=> setPrice(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={addToInventory} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', borderRadius: 8, border: 'none' }}>Add to Inventory</button>
            <button onClick={() => { setScannedData(null); setQuantity(''); setPrice(''); setBatch(''); setExpiry(''); setManufacturer(''); }} style={{ padding: '8px 12px', borderRadius: 8 }}>Reset</button>
          </div>

          {recent.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Recently added</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recent.map((r, idx) => (
                  <li key={idx} style={{ padding: 8, border: '1px solid #eef2ff', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.name}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>Code: {r.drugCode} • Qty: {r.quantity}</div>
                    </div>
                    <div style={{ color: '#10b981', fontWeight: 700 }}>Added</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
