#!/usr/bin/env bash
# Prüft die Live-Seite nach einem Deploy. "no-cache" sorgt dafür, dass der Test den
# Stand auf dem Server sieht, auch falls der Varnish des Hosters wieder aktiv wird.

set -uo pipefail

BASE="${1:-https://www.alpenexpress.at}"
failed=0

# check <pfad> <status> [ziel]
check() {
  local result expected="$2${3:+ $BASE$3}"
  result=$(curl -s -o /dev/null -H 'Cache-Control: no-cache' --retry 2 --max-time 20 \
    -w '%{http_code} %{redirect_url}' "$BASE$1")
  result="${result% }"
  if [[ "$result" == "$expected" ]]; then
    echo "ok      $1"
  else
    echo "FEHLER  $1: erwartet '$expected', erhalten '$result'"
    failed=1
  fi
}

check / 200
check /kontakt/ 200
check /audio/auf-uns.mp3 200
check /sitemap-index.xml 200

# Alte URLs zeigen auf die neuen Seiten, und zwar absolut per https (siehe .htaccess)
check /band-2/ 301 /didie/
check /kontakt 301 /kontakt/

# WordPress bleibt gesperrt
check /wp-login.php 410
check /xmlrpc.php 410

# Formular erreichbar: PHP läuft und lehnt GET ab
code=$(curl -s -o /dev/null -H 'Accept: application/json' -H 'Cache-Control: no-cache' --max-time 20 \
  -w '%{http_code}' "$BASE/anfrage.php")
if [[ "$code" == 405 ]]; then
  echo "ok      /anfrage.php"
else
  echo "FEHLER  /anfrage.php: erwartet 405, erhalten $code"
  failed=1
fi

exit "$failed"
