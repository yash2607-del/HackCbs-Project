import express from 'express';

const router = express.Router();

// Simple SSRF guard: allow only http/https and block localhost/loopback
function isAllowedUrl(u) {
  try {
    const url = new URL(u);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    return true;
  } catch (_) {
    return false;
  }
}

function extractFromJsonLd(html) {
  try {
    const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of scripts) {
      try {
        const json = JSON.parse(m[1]);
        const items = Array.isArray(json) ? json : [json];
        for (const it of items) {
          const type = Array.isArray(it['@type']) ? it['@type'][0] : it['@type'];
          if (!type || !String(type).toLowerCase().includes('product')) continue;
          const name = it.name || it.title;
          const brand = typeof it.brand === 'string' ? it.brand : (it.brand && it.brand.name);
          const manufacturer = it.manufacturer && (it.manufacturer.name || it.manufacturer);
          const offers = it.offers || {};
          const price = Number(offers.price || offers.priceAmount || offers.priceValue);
          const batch = it.batchNumber || it.batch || undefined;
          const expiry = it.expires || it.expiryDate || it.validThrough || undefined;
          return { name, manufacturer: manufacturer || brand, price: isNaN(price) ? undefined : price, batch, expiry };
        }
      } catch (_) { /* ignore */ }
    }
  } catch (_) {}
  return {};
}

function extractFromMeta(html) {
  const getMeta = (prop) => {
    const re = new RegExp(`<meta[^>]+(?:name|property)=\"${prop}\"[^>]+content=\"([^\"]+)\"`, 'i');
    const m = html.match(re);
    return m ? m[1] : undefined;
  };
  const title = getMeta('og:title') || getMeta('twitter:title');
  const price = getMeta('product:price:amount');
  const brand = getMeta('product:brand');
  return { name: title, manufacturer: brand, price: price ? Number(price) : undefined };
}

function deriveCodeFromUrl(u) {
  try {
    const url = new URL(u);
    const qpCode = url.searchParams.get('drugCode') || url.searchParams.get('code') || url.searchParams.get('id');
    if (qpCode) return qpCode;
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || undefined;
  } catch (_) {
    return undefined;
  }
}

router.get('/resolve', async (req, res) => {
  try {
    const u = req.query.u;
    if (!u || !isAllowedUrl(u)) return res.status(400).json({ error: 'Invalid URL' });

    const code = deriveCodeFromUrl(u);

    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0 MediChainBot' } });
    if (!r.ok) return res.status(502).json({ error: 'Failed to fetch target' });
    const html = await r.text();

    const fromJsonLd = extractFromJsonLd(html);
    const fromMeta = extractFromMeta(html);

    const item = {
      drugCode: code,
      name: fromJsonLd.name || fromMeta.name || 'Unknown',
      manufacturer: fromJsonLd.manufacturer || fromMeta.manufacturer || '',
      price: typeof fromJsonLd.price !== 'undefined' ? fromJsonLd.price : fromMeta.price,
      batch: fromJsonLd.batch,
      expiry: fromJsonLd.expiry,
    };

    return res.json(item);
  } catch (err) {
    console.error('scan resolve error', err);
    return res.status(500).json({ error: 'Resolver error' });
  }
});

export default router;
