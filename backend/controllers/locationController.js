// backend/controllers/locationController.js
import fetch from "node-fetch";

// Reverse geocode: lat/lng -> human-readable address
export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng)
      return res.status(400).json({ error: "Missing lat/lng parameters" });

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=19&addressdetails=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": "MediChainApp/1.0" },
    });
    const data = await response.json();

    // Shape the payload to what the frontend expects: results[0].formatted_address
    const formatted = {
      results: [
        {
          formatted_address: data.display_name,
          address_components: data.address,
          geometry: {
            location: {
              lat: typeof data.lat === "string" ? parseFloat(data.lat) : data.lat,
              lng: typeof data.lon === "string" ? parseFloat(data.lon) : data.lon,
            },
          },
          source: "nominatim",
        },
      ],
    };

    res.json(formatted);
  } catch (err) {
    console.error("Reverse geocode error:", err);
    res.status(500).json({ error: "Reverse geocode failed", details: err.message });
  }
};

// Detect location via IP as a fallback and return same shape as reverseGeocode
export const detectLocation = async (req, res) => {
  try {
    // optional override with query ip; otherwise rely on external service auto-detect
    const ipParam = req.query.ip;
    const ipUrl = ipParam ? `https://ipapi.co/${encodeURIComponent(ipParam)}/json/` : "https://ipapi.co/json/";
    const ipRes = await fetch(ipUrl, { headers: { "User-Agent": "MediChainApp/1.0" } });
    if (!ipRes.ok) return res.status(502).json({ error: "IP lookup failed" });
    const ipData = await ipRes.json();
    const lat = parseFloat(ipData.latitude);
    const lng = parseFloat(ipData.longitude);
    if (!lat || !lng) return res.status(400).json({ error: "Could not determine location from IP" });

    // Reverse geocode to normalize payload
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=19&addressdetails=1`;
    const nomRes = await fetch(nomUrl, { headers: { "User-Agent": "MediChainApp/1.0" } });
    if (!nomRes.ok) return res.status(502).json({ error: "Reverse geocode failed" });
    const nomData = await nomRes.json();

    const formatted = {
      results: [
        {
          formatted_address: nomData.display_name,
          address_components: nomData.address,
          geometry: {
            location: {
              lat,
              lng,
            },
          },
          source: "ipapi+nominatim",
        },
      ],
    };

    res.json(formatted);
  } catch (err) {
    console.error("Detect location error:", err);
    res.status(500).json({ error: "Detect location failed", details: err.message });
  }
};
