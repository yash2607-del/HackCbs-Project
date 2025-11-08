import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

export default function MapPicker({ label = "Location", value, onChange, height = 260, showDetect = true }) {
  const [internal, setInternal] = useState(value || { lat: 28.6139, lng: 77.209 });
  const [address, setAddress] = useState(value?.address || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setInternal({ lat: value.lat, lng: value.lng });
      if (value.address) setAddress(value.address);
    }
  }, [value?.lat, value?.lng, value?.address]);

  const updateAddress = async (lat, lng) => {
    try {
      const res = await fetch(`/api/places/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        const addr = data?.results?.[0]?.formatted_address || "";
        setAddress(addr);
        onChange?.({ lat, lng, address: addr });
        return;
      }
    } catch {}
    setAddress("");
    onChange?.({ lat, lng });
  };

  const setPos = async (pos) => {
    setInternal(pos);
    await updateAddress(pos.lat, pos.lng);
  };

  function ClickHandler() {
    useMapEvents({
      click(e) {
        setPos({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  }

  const detectLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      fetch(`/api/places/detect`)
        .then((r) => r.json())
        .then((d) => {
          const loc = d?.results?.[0]?.geometry?.location;
          if (loc?.lat && loc?.lng) setPos({ lat: loc.lat, lng: loc.lng });
        })
        .finally(() => setLoading(false));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPos(loc);
        setLoading(false);
      },
      async () => {
        try {
          const r = await fetch(`/api/places/detect`);
          const d = await r.json();
          const loc = d?.results?.[0]?.geometry?.location;
          if (loc?.lat && loc?.lng) await setPos({ lat: loc.lat, lng: loc.lng });
        } finally {
          setLoading(false);
        }
      },
      { timeout: 8000 }
    );
  };

  const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="form-field">
      <label>{label}</label>
      {showDetect && (
        <div style={{ marginBottom: 8 }}>
          <button type="button" className="btn" onClick={detectLocation} disabled={loading}>
            {loading ? "Detecting..." : "Detect Location"}
          </button>
        </div>
      )}
      <div style={{ height: height, borderRadius: 8, overflow: "hidden" }}>
        <MapContainer center={[internal.lat, internal.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[internal.lat, internal.lng]} draggable={true} eventHandlers={{ dragend: (e) => {
            const ll = e.target.getLatLng();
            setPos({ lat: ll.lat, lng: ll.lng });
          } }} icon={markerIcon} />
          <ClickHandler />
        </MapContainer>
      </div>
      {address && (
        <div style={{ marginTop: 8 }}>
          <strong>Address:</strong> {address}
        </div>
      )}
    </div>
  );
}
