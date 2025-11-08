const http = require('http');
http.get('http://127.0.0.1:5000/api/inventory', res => {
  let d='';
  res.on('data', c=> d+=c);
  res.on('end', ()=> console.log('RESPONSE:', d));
}).on('error', e => console.error('ERR', e.message));
