# alpenexpress.at – statische Website

Gebaut mit [Astro](https://astro.build). Ergebnis ist reines HTML/CSS mit ein paar Zeilen JavaScript – keine Datenbank, keine Plugins. Einzige serverseitige Datei ist `public/anfrage.php` für das Anfrageformular; sie braucht keine Zugangsdaten, alle anderen `.php`-Aufrufe sperrt die `.htaccess`.

## Lokal ansehen

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:4321
npm run build      # erzeugt die fertige Website im Ordner dist/
```

## Inhalte pflegen

| Was | Wo |
| --- | --- |
| Telefon, E-Mail, Adresse, Navigation | `src/data/site.ts` |
| Repertoire (Songlisten) | `src/data/repertoire.ts` |
| Hörproben und YouTube-Videos | `src/data/media.ts` (MP3s liegen in `public/audio/`) |
| Empfänger und Felder des Anfrageformulars | `public/anfrage.php` und `src/pages/kontakt.astro` |
| Rückblick-Beiträge | `src/content/rueckblick/*.md` – neue Datei anlegen, Bild in `src/assets/rueckblick/` |
| Seitentexte | `src/pages/*.astro` |

## Veröffentlichen

Jeder Push auf `main` geht automatisch live (`.github/workflows/deploy.yml`): bauen, per rsync hochladen, danach prüft `scripts/smoke-test.sh` die Live-Seite. Schlägt etwas fehl, schickt GitHub eine Mail. Rückgängig machen: `git revert` und pushen.

- **Pull Requests** werden nur gebaut, ohne Zugriff auf Secrets.
- **Trockenlauf:** unter Actions → Build & Deploy → Run workflow; zeigt, was sich ändern würde.
- **Zugang:** Der SSH-Schlüssel liegt als Secret `SSH_PRIVATE_KEY` im GitHub-Environment `production` (nur Branch `main`), `SSH_HOST`, `SSH_PORT`, `SSH_USER` und `SSH_KNOWN_HOSTS` als Variablen. Auf dem Server ist er auf den Webroot beschränkt: nur schreiben, kein Shell-Zugang, keine anderen Ordner.
- **Achtung:** rsync läuft mit `--delete`. Was nicht im Build liegt, wird im Webroot gelöscht (ausser `.well-known`).

Von Hand geht es weiterhin per SFTP, dafür `.deploy.env.example` nach `.deploy.env` kopieren:

```bash
scripts/deploy.sh test     # Verbindung prüfen, Webroot auflisten
scripts/deploy.sh upload   # bauen und hochladen, fragt vorher nach
```

Vor dem Webserver liegt der Varnish-Cache von des Hosters. Er ignoriert sämtliche `Cache-Control`-Header (getestet: `no-store`, `private`, `s-maxage=0`), nur `Set-Cookie` umgeht ihn. Änderungen werden deshalb erst sichtbar, wenn der Cache im Controlpanel geleert wird oder abläuft: Webhosting → Webserver Einstellungen → Varnish → Verwalten.

Die `.htaccess` leitet alle alten WordPress-URLs per 301 auf die neuen Seiten um (wichtig für Google), sperrt `wp-admin`/`xmlrpc.php` und alle `.php`-Dateien ausser `anfrage.php` mit 410, erzwingt HTTPS + www und setzt Sicherheits- und Cache-Header. Redirect-Ziele stehen absolut drin, weil der Webserver hinter dem Proxy des Hosters Schema und Port nicht kennt. Sie setzt einen Apache-Server mit `mod_rewrite` voraus.
