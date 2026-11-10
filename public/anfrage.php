<?php
// Anfrageformular der Kontaktseite. Einzige PHP-Datei der Website, kommt ohne
// Zugangsdaten und Datenbank aus. Der Empfänger ist fest vorgegeben, damit das
// Skript nicht als offene Mail-Schleuder missbraucht werden kann.

declare(strict_types=1);

ini_set('display_errors', '0');

const RECIPIENT = 'office@alpenexpress.at';
const SENDER = 'website@alpenexpress.at';
const LIMIT_PER_IP = 5;    // pro Stunde
const LIMIT_TOTAL = 50;    // pro 24 Stunden, Schutz vor Mail-Flut aus vielen Quellen
const MIN_FILL_MS = 3000;  // schneller füllt kein Mensch das Formular aus

const OCCASIONS = ['Hochzeit', 'Geburtstag', 'Firmenfeier', 'Weihnachtsfeier', 'Vereinsfest / Zeltfest', 'Jubiläum', 'Anderer Anlass'];
const LINEUPS = ['Duo', 'Trio', 'Solo (auf Anfrage)', 'Noch offen – bitte beraten'];

function respond(int $status, string $error = ''): void
{
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if (strpos($accept, 'application/json') !== false) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $error === '', 'error' => $error]);
        exit;
    }

    // Ohne JavaScript: normale Weiterleitung, funktioniert auch unter /dev/
    $base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
    header('Location: ' . $base . ($error === '' ? '/kontakt/danke/' : '/kontakt/#fehler'), true, 303);
    exit;
}

function field(string $key, int $maxBytes, bool $multiline = false): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $maxBytes || preg_match('//u', $value) !== 1) {
        respond(422, 'invalid');
    }
    if ($multiline) {
        $value = str_replace(["\r\n", "\r"], "\n", $value);
        return trim((string) preg_replace('/[\x00-\x08\x0B-\x1F\x7F]/', '', $value));
    }
    return trim((string) preg_replace('/[\x00-\x1F\x7F]+/', ' ', $value));
}

// Zählt Sendungen in einer temporären Datei. Die IP wird nur als Hash abgelegt
// und nach spätestens 24 Stunden verworfen.
function rateLimited(): bool
{
    $now = time();
    $ip = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __DIR__);

    umask(0077);
    $handle = @fopen(sys_get_temp_dir() . '/alpenexpress-anfrage-' . md5(__DIR__) . '.json', 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        error_log('anfrage.php: Rate-Limit-Datei nicht verfügbar');
        return false;
    }

    $entries = json_decode((string) stream_get_contents($handle), true);
    $entries = array_values(array_filter(is_array($entries) ? $entries : [], function ($e) use ($now) {
        return is_array($e) && ($e['t'] ?? 0) > $now - 86400;
    }));

    $perIp = count(array_filter($entries, function ($e) use ($ip, $now) {
        return $e['ip'] === $ip && $e['t'] > $now - 3600;
    }));

    $limited = $perIp >= LIMIT_PER_IP || count($entries) >= LIMIT_TOTAL;
    if (!$limited) {
        $entries[] = ['ip' => $ip, 't' => $now];
    }

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string) json_encode($entries));
    flock($handle, LOCK_UN);
    fclose($handle);

    return $limited;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'method');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== $host) {
    respond(403, 'origin');
}

// Spam bekommt eine Erfolgsmeldung, damit Bots nicht nachbessern
$elapsed = $_POST['dauer'] ?? '';
if (($_POST['homepage'] ?? '') !== '' || (is_string($elapsed) && $elapsed !== '' && (int) $elapsed < MIN_FILL_MS)) {
    respond(200);
}

$name = field('name', 200);
$email = field('email', 254);
$phone = field('telefon', 50);
$occasion = field('anlass', 100);
$date = field('datum', 10);
$place = field('ort', 200);
$guests = field('gaeste', 50);
$lineup = field('besetzung', 100);
$message = field('nachricht', 5000, true);

$valid = $name !== ''
    && filter_var($email, FILTER_VALIDATE_EMAIL) !== false
    && in_array($occasion, OCCASIONS, true)
    && in_array($lineup, LINEUPS, true)
    && ($date === '' || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1);
if (!$valid) {
    respond(422, 'invalid');
}

if (rateLimited()) {
    respond(429, 'limit');
}

$dateText = $date === '' ? '' : implode('.', array_reverse(explode('-', $date)));

$lines = [
    'Neue Anfrage über www.alpenexpress.at',
    '',
    'Name: ' . $name,
    'E-Mail: ' . $email,
    'Telefon: ' . ($phone ?: '-'),
    'Anlass: ' . $occasion,
    'Datum: ' . ($dateText ?: '-'),
    'Ort: ' . ($place ?: '-'),
    'Gäste: ' . ($guests ?: '-'),
    'Besetzung: ' . $lineup,
    '',
    'Nachricht:',
    $message ?: '-',
    '',
    '--',
    'Mit „Antworten“ geht die Mail direkt an ' . $email,
];

// Nur geprüfte Werte in den Headern: Anlass aus fester Liste, Datum per Regex, E-Mail per filter_var
$subject = 'Anfrage: ' . $occasion . ($dateText === '' ? '' : ' am ' . $dateText);
$headers = [
    'From: "Website Alpen Express" <' . SENDER . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
];

// Envelope-Absender: Unzustellbarkeits-Meldungen landen im echten Postfach
$sent = mail(
    RECIPIENT,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    chunk_split(base64_encode(implode("\n", $lines))),
    implode("\r\n", $headers),
    '-f' . RECIPIENT
);

if (!$sent) {
    error_log('anfrage.php: mail() fehlgeschlagen');
    respond(500, 'send');
}

respond(200);
