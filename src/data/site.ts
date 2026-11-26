import { u } from '../lib/url';

export const site = {
  name: 'Alpenexpress Partyband',
  claim: 'Partyband aus Vorarlberg – im Duo oder Trio',
  url: 'https://www.alpenexpress.at',
  person: 'Didie Martin',
  phone: '+43 664 197 55 15',
  phoneHref: 'tel:+436641975515',
  whatsappHref: 'https://wa.me/436641975515?text=' + encodeURIComponent('Hallo Didie, ich interessiere mich für einen Auftritt.'),
  email: 'office@alpenexpress.at',
  street: 'Bieleweg 13',
  zip: '6713',
  city: 'Ludesch',
  region: 'Vorarlberg',
  country: 'Österreich',
  facebook: 'https://www.facebook.com/Stimmungsmusik/',
  youtube: 'https://www.youtube.com/@alpenexpress-didie2015',
};

export const nav = [
  { href: u('/'), label: 'Start' },
  { href: u('/didie/'), label: 'Über Didie' },
  { href: u('/duo/'), label: 'Duo & Trio' },
  { href: u('/hochzeit/'), label: 'Hochzeit' },
  { href: u('/repertoire/'), label: 'Repertoire' },
  { href: u('/mediathek/'), label: 'Hörproben & Videos' },
  { href: u('/rueckblick/'), label: 'Rückblick' },
];
