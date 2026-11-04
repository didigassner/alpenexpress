import type { ImageMetadata } from 'astro';

export type Track = { title: string; artist?: string; file: string };

export const audio: { genre: string; tracks: Track[] }[] = [
  {
    genre: 'Party',
    tracks: [
      { title: 'Auf uns', artist: 'Andreas Bourani', file: 'auf-uns.mp3' },
      { title: 'Auf das, was da noch kommt', artist: 'Lotte & Max Giesinger', file: 'auf-das-was-da-noch-kommt.mp3' },
    ],
  },
  {
    genre: 'Austropop',
    tracks: [
      { title: 'Weit, weit weg', artist: 'Hubert von Goisern', file: 'weit-weit-weg.mp3' },
      { title: 'Segel im Wind', file: 'segel-im-wind.mp3' },
    ],
  },
  {
    genre: '70er – 90er',
    tracks: [
      { title: "What You're Proposing", artist: 'Status Quo', file: 'what-youre-proposing.mp3' },
      { title: "Baby, I'd Love You to Want Me", artist: 'Lobo', file: 'baby-id-love-you-to-want-me.mp3' },
    ],
  },
  {
    genre: 'Balladen',
    tracks: [
      { title: "Somethin' Stupid", artist: 'Frank & Nancy Sinatra', file: 'somethin-stupid.mp3' },
      { title: "I Don't Want to Talk About It", artist: 'Rod Stewart', file: 'i-dont-want-to-talk-about-it.mp3' },
      { title: 'In the Ghetto', artist: 'Elvis Presley', file: 'in-the-ghetto.mp3' },
    ],
  },
  {
    genre: 'Schlager & Volkstümliches',
    tracks: [
      { title: 'Warum hast du nicht nein gesagt', artist: 'Roland Kaiser & Maite Kelly', file: 'warum-hast-du-nicht-nein-gesagt.mp3' },
      { title: 'Fremde Erde', file: 'fremde-erde.mp3' },
      { title: 'Tanz mit mir, Corinna', artist: 'Die Paldauer', file: 'tanz-mit-mir-corinna.mp3' },
      { title: 'Der Jodelautomat', file: 'der-jodelautomat.mp3' },
      { title: 'Dem Land Tirol die Treue', file: 'dem-land-tirol-die-treue.mp3' },
    ],
  },
  {
    genre: 'Italo',
    tracks: [{ title: 'Ti amo (deutsch/italienisch)', file: 'ti-amo.mp3' }],
  },
  {
    genre: 'Hochzeit',
    tracks: [
      { title: 'Auf das, was da noch kommt', artist: 'Lotte & Max Giesinger', file: 'auf-das-was-da-noch-kommt.mp3' },
      { title: 'So soll es bleiben', artist: 'Ich + Ich', file: 'so-soll-es-bleiben.mp3' },
    ],
  },
  {
    genre: 'Weihnachten',
    tracks: [
      { title: 'Winter Wonderland', file: 'winter-wonderland.mp3' },
      { title: 'White Christmas', file: 'white-christmas.m4a' },
    ],
  },
];

const thumbs = import.meta.glob<{ default: ImageMetadata }>('../assets/videos/*.jpg', { eager: true });
const thumb = (id: string) => thumbs[`../assets/videos/${id}.jpg`].default;

export const videos = [
  { id: 'sYjQiiSS4tQ', title: 'Saisonabschluss beim FC Alberschwende 2019' },
  { id: 'E99iDxwBtpg', title: 'ORF-2-Bericht: Faschingsball in Marul' },
  { id: 'YQJfq_TQ73A', title: "Rockin' All Over the World" },
  { id: 'F94a59je3LI', title: 'Hulapalu – live in Sarmenstorf' },
  { id: 'xk2A2gi0Rm0', title: 'Pure Lust am Leben' },
  { id: 'cNX84YvBHPk', title: 'Die immer lacht' },
  { id: '2riXWLYOjRg', title: 'Vogulisi' },
  { id: 'TnsJxV0hoOQ', title: 'Über sieben Brücken' },
  { id: '3WN0CXKZunk', title: "I Don't Want to Talk About It" },
  { id: 'LOQyUITwBoQ', title: 'Schwarzer Sand' },
  { id: '5N-JKV_HunI', title: 'Live 2016' },
  { id: 'FiHQO6JSEMc', title: 'Stimmung pur' },
  { id: 'OAvr4hZYFSY', title: 'Party' },
  { id: '8F3sNiFDKtc', title: 'Fasching' },
  { id: 'NHR1kmSdOQs', title: 'Hulapalu (Didie & Reny)' },
].map((v) => ({ ...v, thumb: thumb(v.id) }));
