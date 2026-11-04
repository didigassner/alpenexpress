#!/usr/bin/env bash
# Upload der statischen Website per SFTP.
#
#   scripts/deploy.sh test     Verbindung prüfen und Webroot auflisten
#   scripts/deploy.sh backup   Kompletten Webroot (alte WordPress-Dateien) nach backup/ herunterladen
#   scripts/deploy.sh dev      Vorschau bauen und nach <Webroot>/dev/ hochladen – die alte Seite bleibt unberührt
#   scripts/deploy.sh upload   Finale Version bauen und in den Webroot hochladen (ersetzt die Startseite!)
#
# Zugangsdaten (ohne Passwort) stehen in .deploy.env – siehe .deploy.env.example.
# Das Passwort fragt sftp im Terminal ab; mit hinterlegtem SSH-Schlüssel entfällt es.

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .deploy.env ]]; then
  echo "Fehlt: .deploy.env (Vorlage: .deploy.env.example)" >&2
  exit 1
fi
# shellcheck disable=SC1091
source .deploy.env
: "${SFTP_HOST:?SFTP_HOST fehlt}" "${SFTP_USER:?SFTP_USER fehlt}" "${SFTP_PATH:?SFTP_PATH fehlt}"
SFTP_PORT="${SFTP_PORT:-22}"

SFTP_OPTS=(-P "$SFTP_PORT" -o ConnectTimeout=20)

# Mit SSH-Schlüssel läuft sftp im Batch-Modus und bricht beim ersten Fehler ab
# (Befehle mit führendem "-" dürfen fehlschlagen). Ohne Schlüssel werden die Befehle
# über stdin gereicht, damit sftp das Passwort im Terminal abfragen kann.
if sftp "${SFTP_OPTS[@]}" -o BatchMode=yes -b /dev/null "$SFTP_USER@$SFTP_HOST" >/dev/null 2>&1; then
  run_sftp() { sftp "${SFTP_OPTS[@]}" -b - "$SFTP_USER@$SFTP_HOST" <<<"$1"; }
else
  echo "Kein SSH-Schlüssel hinterlegt – sftp fragt gleich nach dem Passwort."
  run_sftp() { sftp "${SFTP_OPTS[@]}" "$SFTP_USER@$SFTP_HOST" <<<"$1"; }
fi

case "${1:-}" in
  test)
    run_sftp "cd $SFTP_PATH
pwd
ls -la"
    ;;

  backup)
    dest="backup/webroot-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$dest"
    echo "Lade $SFTP_PATH nach $dest herunter …"
    run_sftp "lcd $dest
get -r $SFTP_PATH/. ."
    echo "Backup fertig: $dest ($(du -sh "$dest" | cut -f1))"
    echo "Hinweis: Die WordPress-Datenbank ist darin NICHT enthalten – bitte im Hoster-Panel (phpMyAdmin) exportieren."
    ;;

  dev | upload)
    if [[ "$1" == dev ]]; then
      npm run build:dev
      target="$SFTP_PATH/dev"
      url="https://www.alpenexpress.at/dev/"
    else
      read -r -p "Das ersetzt die Live-Seite unter $SFTP_PATH. Wirklich fortfahren? [ja/N] " answer
      [[ "$answer" == ja ]] || { echo "Abgebrochen."; exit 1; }
      npm run build
      target="$SFTP_PATH"
      url="https://www.alpenexpress.at/"
    fi
    [[ -f dist/index.html && -f dist/.htaccess ]] || { echo "Build unvollständig, Abbruch." >&2; exit 1; }

    # Verzeichnisse vorab anlegen ("-" = Fehler ignorieren, falls schon vorhanden), dann Dateien hochladen.
    batch="-mkdir $target"$'\n'"cd $target"$'\n'
    while IFS= read -r d; do batch+="-mkdir ${d#dist/}"$'\n'; done < <(find dist -mindepth 1 -type d | sort)
    while IFS= read -r f; do batch+="put \"$f\" \"${f#dist/}\""$'\n'; done < <(find dist -type f ! -name .htaccess | sort)
    # .htaccess zuletzt: erst wenn alle neuen Dateien da sind, greifen die Weiterleitungen
    batch+="put dist/.htaccess .htaccess"$'\n'

    echo "Lade $(find dist -type f | wc -l | tr -d ' ') Dateien nach $SFTP_USER@$SFTP_HOST:$target hoch …"
    # "mkdir: Failure" heisst hier nur, dass der Ordner schon existiert – alle anderen Fehler bleiben sichtbar
    run_sftp "$batch" 2> >(grep -v '^remote mkdir .*: Failure$' >&2) >/dev/null
    echo "Fertig. Bitte $url im Browser prüfen."
    ;;

  *)
    sed -n '2,11p' "$0"
    exit 1
    ;;
esac
