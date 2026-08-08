const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.resolve(__dirname);
const FILE = path.join(ROOT, 'data_bank.txt'); // nama file sesuai permintaan
const MAX_BODY = 1024 * 1024; // batas ukuran body POST (1 MB)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

// File sensitif TIDAK boleh diakses lewat HTTP
// Disimpan lowercase karena filesystem Windows tidak membedakan huruf besar/kecil
const BLOCKED = new Set([
  path.resolve(FILE),                    // data lokasi
  path.join(ROOT, 'server.js'),          // source code server
  path.join(ROOT, 'test_uji.sh'),        // script uji
].map((p) => p.toLowerCase()));

function send(res, code, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Header keamanan dasar
  res.setHeader('X-Content-Type-Options', 'nosniff');

  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    send(res, 400, '400 Bad Request');
    return;
  }

  // ===== Endpoint untuk menyimpan data lokasi =====
  if (url.pathname === '/simpan') {
    if (req.method !== 'POST') {
      send(res, 405, JSON.stringify({ status: 'error', message: 'Method not allowed' }), 'application/json');
      return;
    }

    let body = '';
    let tooBig = false;

    req.on('data', (chunk) => {
      body += chunk;
      if (!tooBig && Buffer.byteLength(body) > MAX_BODY) {
        tooBig = true;
        if (!res.headersSent) {
          send(res, 413, JSON.stringify({ status: 'error', message: 'Payload too large' }), 'application/json');
        }
        req.destroy(); // hentikan kiriman yang terlalu besar
      }
    });

    req.on('end', () => {
      if (tooBig) return;
      try {
        const data = JSON.parse(body);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid payload');
        if (
          typeof data.id !== 'string' ||
          typeof data.latitude !== 'number' ||
          typeof data.longitude !== 'number'
        ) {
          throw new Error('Field wajib tidak lengkap: id, latitude, longitude');
        }
        const line = JSON.stringify(data) + '\n'; // 1 baris = 1 data
        fs.appendFile(FILE, line, (err) => {
          if (err) {
            console.error('Gagal menyimpan:', err);
            send(res, 500, JSON.stringify({ status: 'error', message: err.message }), 'application/json');
            return;
          }
          console.log('Data tersimpan:', data);
          send(res, 200, JSON.stringify({ status: 'ok' }), 'application/json');
        });
      } catch {
        send(res, 400, JSON.stringify({ status: 'error', message: 'Invalid JSON' }), 'application/json');
      }
    });

    req.on('error', () => {
      if (!res.headersSent) res.destroy();
    });
    return;
  }

  // ===== Sajikan file statis (html, gambar, dll) =====
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, '405 Method Not Allowed');
    return;
  }

  let filePath = path.join(ROOT, url.pathname === '/' ? 'konfirmasi.html' : url.pathname);

  // Cegah akses ke luar folder proyek (path traversal)
  if (!filePath.startsWith(ROOT)) {
    send(res, 403, '403 Forbidden');
    return;
  }

  // Cegah akses ke file sensitif (data lokasi, source code, script uji)
  // Bandingkan lowercase agar huruf besar/kecil tidak bisa mem-bypass blokir
  if (BLOCKED.has(path.resolve(filePath).toLowerCase())) {
    send(res, 403, '403 Forbidden');
    return;
  }

  // Cegah akses ke file tersembunyi (mis. .git, .env)
  if (path.basename(filePath).startsWith('.')) {
    send(res, 403, '403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      send(res, 404, '404 Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    if (req.method === 'HEAD') res.end();
    else res.end(content);
  });
});

// Tangani error umum agar tidak crash dengan pesan mentah
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} sudah dipakai. Matikan proses lain atau ganti nilai PORT di server.js.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`✅ Server jalan: http://localhost:${PORT}`);
  console.log(`📁 Data tersimpan di: ${FILE}`);
});
