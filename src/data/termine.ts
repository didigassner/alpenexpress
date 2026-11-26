import type { ImageMetadata } from 'astro';
import flyerSternen2026 from '../assets/img/flyer-sternen-kriessern-2026.webp';

export type Termin = {
  title: string;
  date: string; // ISO, Ortszeit
  time: string;
  besetzung?: string;
  location: string;
  place: string;
  text?: string;
  flyer?: ImageMetadata;
  flyerAlt?: string;
};

// Öffentliche Auftritte. Vergangene Termine werden beim Build automatisch ausgeblendet.
export const termine: Termin[] = [
  {
    title: 'Tanz- und Stimmungsabend',
    date: '2026-12-05T20:00',
    time: 'ab 20 Uhr',
    besetzung: 'im Duo',
    location: 'Gasthaus Sternen',
    place: 'Kriessern (CH)',
    text: 'Tanzmusik, gute Laune und beste Stimmung – wir freuen uns auf euch!',
    flyer: flyerSternen2026,
    flyerAlt: 'Flyer: Tanz- und Stimmungsabend mit der Alpenexpress Partyband im Duo, Samstag, 5. Dezember 2026, ab 20 Uhr, Gasthaus Sternen, Kriessern (CH)',
  },
];

export const kommendeTermine = () => {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return termine
    .filter((t) => new Date(t.date) >= heute)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const formatDatum = (iso: string) =>
  new Intl.DateTimeFormat('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
