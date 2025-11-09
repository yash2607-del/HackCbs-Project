import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../../styles/search-medicine.scss';

export default function SearchMedicine() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 }); // Default: Delhi

  // Try detecting user location to center map
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000 }
    );
  }, []);

  const markerIcon = useMemo(() => L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }), []);

  const search = async () => {
    const term = q.trim();
    setError('');
    if (!term) { setResults([]); return; }
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE_URL || '/';
      const url = new URL(`/api/inventory/search?name=${encodeURIComponent(term)}`, base).toString();
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      setError(e.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Center map on first result with location when results update
  useEffect(() => {
    const firstWithLoc = results.find(r => r.location?.lat && r.location?.lng);
    if (firstWithLoc) {
      setCenter({ lat: firstWithLoc.location.lat, lng: firstWithLoc.location.lng });
    }
  }, [results]);

  const handleKey = (e) => {
    if (e.key === 'Enter') search();
  };

  return (
    <div className="search-medicine">
      <div className="search-bar">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search medicine name e.g. Paracetamol"
          aria-label="Medicine name"
        />
        <button className="btn primary" onClick={search} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="results">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Shop</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>
                    {loading ? 'Loading…' : 'No results yet'}
                  </td>
                </tr>
              )}
              {results.map(r => (
                <tr key={r.id}>
                  <td>{r.medicineName || '-'}</td>
                  <td>{r.quantity ?? '-'}</td>
                  <td>{typeof r.price !== 'undefined' ? r.price : '-'}</td>
                  <td>{r.shopName || '-'}</td>
                  <td>{r.location?.address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="map-wrap">
          <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {results.filter(r => r.location?.lat && r.location?.lng).map(r => (
              <Marker key={r.id} position={[r.location.lat, r.location.lng]} icon={markerIcon}>
                <Popup>
                  <div>
                    <div><strong>{r.shopName || 'Pharmacy'}</strong></div>
                    <div>{r.location?.address}</div>
                    <div style={{ marginTop: 6 }}>
                      <em>{r.medicineName}</em> — Qty: {r.quantity}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
