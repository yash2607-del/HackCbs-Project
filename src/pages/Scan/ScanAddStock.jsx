import React, { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

const scannerId = "html5qr-scanner";

export default function ScanAddStock({ addMedicine, pharmacyId }) {
  const [scanning, setScanning] = useState(false);
  const [recent, setRecent] = useState([]);
  const html5QrcodeRef = useRef(null);
  const [manual, setManual] = useState("");
  const [status, setStatus] = useState("");
  const [lastDecoded, setLastDecoded] = useState("");

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
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add inventory");
      addMedicine(data);
      setRecent(r => [data, ...r].slice(0, 6));
      setStatus(`Added ${data.name} to inventory`);
    } catch (e) {
      console.error(e);
      setStatus(e.message || "Failed to add inventory");
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
        (decodedText) => {
          setLastDecoded(decodedText);
          const info = parseQr(decodedText);
          stopScanner();
          if (info) addToInventory(info);
          else setStatus("Unrecognized QR content");
        },
        (errorMessage) => {}
      );
      setScanning(true);
    } catch (e) {
      console.error(e);
      setStatus('Failed to start scanner. Check camera permissions or use simulate scan.');
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
      <div style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <button onClick={startScanner} disabled={scanning} style={{ marginRight: 8 }}>
            Start Scanner
          </button>
          <button onClick={stopScanner} disabled={!scanning}>Stop</button>
        </div>
        <div id={scannerId} style={{ width: '100%', height: 300, border: '1px dashed #aaa', borderRadius: 8 }} />
        {status && <div style={{ marginTop: 6, color: '#b91c1c' }}>{status}</div>}
        {lastDecoded && <div style={{ marginTop: 4, fontSize: 12 }}>Last decoded: {lastDecoded}</div>}
        <div style={{ marginTop: 8 }}>
          <input
            value={manual}
            placeholder="Paste code/JSON/URL"
            onChange={(e) => setManual(e.target.value)}
            style={{ width: '70%', padding: 6, marginRight: 6 }}
          />
          <button onClick={() => {
            const info = parseQr(manual);
            if (info) addToInventory(info);
            else setStatus('Could not parse the text');
          }}>Simulate Scan</button>
        </div>
      </div>
      <div style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
        <strong>Recently Added</strong>
        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
          {recent.length === 0 ? <li>No items yet</li> : recent.map((r, i) => <li key={i}>{r.name} (Code: {r.drugCode})</li>)}
        </ul>
      </div>
    </div>
  );
}
