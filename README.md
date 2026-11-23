# alpenexpress.at – statische Website

Gebaut mit [Astro](https://astro.build). Ergebnis ist reines HTML/CSS mit ein paar Zeilen JavaScript – keine Datenbank, keine Plugins. Einzige serverseitige Datei ist `public/anfrage.php` für das Anfrageformular; sie braucht keine Zugangsdaten, alle anderen `.php`-Aufrufe sperrt die `.htaccess`.

## Lokal ansehen

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:4321
npm run build      # erzeugt die fertige Website im Ordner dist/
```

## Inhalte pflegen

Änderungen laufen über Pull Requests: Branch, Pull Request, Auto-Merge, sobald die Checks `content-guard` und `build` grün sind. `main` ist geschützt. Die Anleitung für den Webmaster-Bot steht in [AGENTS.md](AGENTS.md).

| Was | Wo |
| --- | --- |
| Telefon, E-Mail, Adresse, Navigation | `src/data/site.ts` |
| Repertoire (Songlisten) | `src/data/repertoire.ts` |
| Hörproben und YouTube-Videos | `src/data/media.ts` (MP3s liegen nur auf dem Server, siehe unten) |
| Empfänger und Felder des Anfrageformulars | `public/anfrage.php` und `src/pages/kontakt.astro` |
| Rückblick-Beiträge | `src/content/rueckblick/*.md` – neue Datei anlegen, Bild in `src/assets/rueckblick/` |
| Seitentexte | `src/pages/*.astro` |

## Veröffentlichen

Jeder Push auf `main` geht automatisch live (`.github/workflows/deploy.yml`): bauen, per rsync hochladen, danach prüft `scripts/smoke-test.sh` die Live-Seite. Schlägt etwas fehl, schickt GitHub eine Mail. Rückgängig machen: `git revert` und pushen.

- **Pull Requests** werden nur gebaut, ohne Zugriff auf Secrets.
- **Trockenlauf:** unter Actions → Build & Deploy → Run workflow; zeigt, was sich ändern würde.
- **Zugang:** `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_PORT`, `SSH_USER` und `SSH_KNOWN_HOSTS` liegen als Secrets im GitHub-Environment `production` (nur Branch `main`). Keine Variablen verwenden: Die Actions-Logs dieses Repos sind öffentlich, und nur Secrets werden darin maskiert. Auf dem Server ist er per `rrsync` in `~/.ssh/authorized_keys` auf den Webroot beschränkt: nur schreiben, kein Shell-Zugang, keine anderen Ordner.
- **Achtung:** rsync läuft mit `--delete`. Was nicht im Build liegt, wird im Webroot gelöscht (ausser `.well-known` und `audio/`).
- **Hörproben:** Sie liegen nur im Ordner `audio/` im Webroot, der Deploy lässt ihn unberührt. Neue Dateien per SFTP dorthin hochladen und in `src/data/media.ts` eintragen. Für den lokalen Entwicklungsserver kann eine Kopie in `public/audio/` liegen, der Ordner ist von Git ausgeschlossen.

Von Hand geht es weiterhin per SFTP, dafür `.deploy.env.example` nach `.deploy.env` kopieren:

```bash
scripts/deploy.sh test     # Verbindung prüfen, Webroot auflisten
scripts/deploy.sh upload   # bauen und hochladen, fragt vorher nach
```

Der Varnish-Cache von easyname ist deaktiviert, Änderungen sind also sofort sichtbar. Wird er wieder eingeschaltet: Er ignoriert sämtliche `Cache-Control`-Header (getestet: `no-store`, `private`, `s-maxage=0`), nur `Set-Cookie` umgeht ihn. Änderungen erscheinen dann erst, wenn der Cache im Controlpanel geleert wird oder abläuft: Webhosting → Webserver Einstellungen → Varnish → Verwalten.

Die `.htaccess` leitet alle alten WordPress-URLs per 301 auf die neuen Seiten um (wichtig für Google), sperrt `wp-admin`/`xmlrpc.php` und alle `.php`-Dateien ausser `anfrage.php` mit 410, erzwingt HTTPS + www und setzt Sicherheits- und Cache-Header. Redirect-Ziele stehen absolut drin, weil der Webserver hinter dem Proxy des Hosters Schema und Port nicht kennt. Sie setzt einen Apache-Server mit `mod_rewrite` voraus.
