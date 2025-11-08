const url = 'http://127.0.0.1:5000/api/inventory';
try {
  const res = await fetch(url);
  const text = await res.text();
  console.log('STATUS', res.status);
  console.log('BODY', text);
} catch (err) {
  console.error('FETCH ERR', err.message);
}
