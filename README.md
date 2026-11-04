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

## Veröffentlichen (bisheriger Hoster)

Einmalig: `.deploy.env.example` nach `.deploy.env` kopieren und Server, Benutzer und Webroot eintragen (kein Passwort – das fragt `sftp` im Terminal ab, oder SSH-Schlüssel beim Hoster hinterlegen).

```bash
scripts/deploy.sh test     # Verbindung prüfen, Webroot auflisten
scripts/deploy.sh backup   # alten Webroot nach backup/ sichern (vor dem ersten Upload!)
scripts/deploy.sh dev      # Vorschau nach https://www.alpenexpress.at/dev/ (alte Seite bleibt)
scripts/deploy.sh upload   # finale Version in den Webroot (ersetzt die alte Seite, fragt nach)
```

Die Vorschau (`npm run build:dev`) läuft unter `/dev/`, ist per `noindex` von Suchmaschinen ausgeschlossen und bringt eine eigene `.htaccess` mit (`deploy/htaccess-dev`), damit die WordPress-Regeln im Hauptverzeichnis unberührt bleiben. Nach dem Umstieg den Ordner `dev/` beim Hoster wieder löschen.

Die WordPress-Datenbank sichert `backup` nicht – die bitte im Hoster-Panel (phpMyAdmin) exportieren. Nach erfolgreichem Umstieg die alten WordPress-Dateien und die Datenbank beim Hoster löschen; bis dahin blockiert die `.htaccess` jede `.php`-Datei ausser `anfrage.php`.

Die `.htaccess` leitet alle alten WordPress-URLs per 301 auf die neuen Seiten um (wichtig für Google), sperrt `wp-admin`/`xmlrpc.php` mit 410, erzwingt HTTPS + www und setzt Sicherheits- und Cache-Header. Sie setzt einen Apache-Server mit `mod_rewrite` voraus.
