#!/usr/bin/env bash
# Script uji cepat — menjalankan server, mengetes semua endpoint, lalu mematikan server.
cd "$(dirname "$0")" || exit 1

node server.js > /tmp/melacak_server.log 2>&1 &
SRV=$!
sleep 1.5

pass=0
fail=0

check() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "PASS | $desc (HTTP $actual)"
    pass=$((pass + 1))
  else
    echo "FAIL | $desc (harus $expected, dapat $actual)"
    fail=$((fail + 1))
  fi
}

echo "===== TEST ENDPOINT ====="

check "GET / (halaman utama)" 200 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"
check "GET /?id=562312345678" 200 "$(curl -s -o /dev/null -w '%{http_code}' 'http://localhost:3000/?id=562312345678')"
check "GET /sukses.html?id=562312345678" 200 "$(curl -s -o /dev/null -w '%{http_code}' 'http://localhost:3000/sukses.html?id=562312345678')"
check "GET /tolak.html" 200 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/tolak.html)"
check "GET /config.js" 200 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/config.js)"
check "GET /images.png" 200 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/images.png)"
check "GET /tidak-ada.html (404)" 404 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/tidak-ada.html)"
check "GET /data_bank.txt (harus DIBLOKIR)" 403 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/data_bank.txt)"
check "POST /simpan valid (harus 200)" 200 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/simpan -H 'Content-Type: application/json' -d '{"id":"TEST","waktu":"2026-08-08T00:00:00.000Z","nama":"Orang Uji","rekening":"0000 0000 0000","nominal":"Rp 1","latitude":-6.2,"longitude":106.8,"akurasi_meter":5}')"
check "POST /simpan JSON rusak (harus 400)" 400 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/simpan -H 'Content-Type: application/json' -d 'bukan-json')"
check "POST /simpan field kurang (harus 400)" 400 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/simpan -H 'Content-Type: application/json' -d '{"id":"TEST2"}')"
check "GET /DATA_BANK.TXT (huruf besar, harus 403)" 403 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/DATA_BANK.TXT)"
check "GET /Server.JS (huruf besar, harus 403)" 403 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/Server.JS)"
check "DELETE / (harus 405)" 405 "$(curl -s -o /dev/null -w '%{http_code}' -X DELETE http://localhost:3000/)"
check "GET /server.js (harus DIBLOKIR)" 403 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/server.js)"
check "GET /test_uji.sh (harus DIBLOKIR)" 403 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/test_uji.sh)"
check "GET /%2e%2e/etc/passwd (traversal terkode, 404)" 404 "$(curl -s -o /dev/null -w '%{http_code}' 'http://localhost:3000/%2e%2e/etc/passwd')"

echo ""
echo "===== HASIL RESPONSE ====="
echo "--- POST /simpan body ---"
curl -s -X POST http://localhost:3000/simpan -H 'Content-Type: application/json' -d '{"id":"TEST2"}'
echo ""
echo "--- Isi data_bank.txt (harus berisi data uji) ---"
cat data_bank.txt 2>/dev/null
echo ""
echo "--- Log server ---"
cat /tmp/melacak_server.log

echo ""
echo "===== RINGKASAN: $pass PASS, $fail FAIL ====="

kill $SRV 2>/dev/null
pkill -f "node server.js" 2>/dev/null
exit $fail
