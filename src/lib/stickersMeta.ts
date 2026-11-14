export interface StickerMeta {
  id: string;
  label: string;
  accent: string;
  bg: string;
}

export const STICKER_META: StickerMeta[] = [
  { id: 'sticker-sensory', label: 'Sensorik', accent: '#2D6CDF', bg: '#EAF2FF' },
  { id: 'sticker-shapes', label: 'Bentuk', accent: '#12894E', bg: '#E7F8EE' },
  { id: 'sticker-trace', label: 'Garis', accent: '#E07A18', bg: '#FFF2E3' },
  { id: 'sticker-motor', label: 'Gerak', accent: '#D8435E', bg: '#FFEAEE' },
  { id: 'sticker-coloring', label: 'Lukis', accent: '#8045D9', bg: '#F2EBFF' },
  { id: 'sticker-puzzle', label: 'Puzzle', accent: '#12899C', bg: '#E6F8FB' },
  { id: 'sticker-balloon', label: 'Balon', accent: '#D95E32', bg: '#FFEDE6' },
  { id: 'sticker-numbers', label: 'Angka', accent: '#C68500', bg: '#FFF6DE' },
  { id: 'sticker-alphabet', label: 'Huruf', accent: '#247D8F', bg: '#E6F6F9' },
  { id: 'sticker-colors', label: 'Warna', accent: '#2F8A4E', bg: '#E9F8EE' },
  { id: 'sticker-peekaboo', label: 'Cilukba', accent: '#2B6E4F', bg: '#E5F5ED' },
  { id: 'sticker-bubblepopper', label: 'Gelembung', accent: '#1982C4', bg: '#E7F4FC' },
  { id: 'sticker-newborn', label: 'Bayi Tenang', accent: '#5A4FB8', bg: '#EEECFF' },
  { id: 'sticker-streak', label: 'Rajin 3 Hari', accent: '#B86E00', bg: '#FFF3DC' }
];
