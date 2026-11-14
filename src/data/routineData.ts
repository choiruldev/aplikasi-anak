import type { AgeBand, StimulationPillar } from '../lib/development.ts';

export type RoutineSlot = 'pagi' | 'siang' | 'sore' | 'malam';

export interface DailyRoutineItem {
  id: string;
  slot: RoutineSlot;
  title: string;
  ageBands: AgeBand[];
}

export interface HomePlayIdea {
  id: string;
  title: string;
  materials: string;
  pillar: StimulationPillar;
  ageBands: AgeBand[];
}

export const ROUTINE_SLOT_LABELS: Record<RoutineSlot, string> = {
  pagi: 'Pagi',
  siang: 'Siang',
  sore: 'Sore',
  malam: 'Malam'
};

export const DAILY_ROUTINES: DailyRoutineItem[] = [
  { id: 'rt-pagi-sun', slot: 'pagi', title: 'Jemur & Sapa Wajah', ageBands: ['0-3m', '3-6m'] },
  { id: 'rt-pagi-active', slot: 'pagi', title: 'Gerak Bebas Pagi', ageBands: ['6-12m', '1-2y', '2-3y', '3-5y'] },
  { id: 'rt-siang-tummy', slot: 'siang', title: 'Tummy Time Singkat', ageBands: ['0-3m', '3-6m'] },
  { id: 'rt-siang-play', slot: 'siang', title: 'Main Mandiri Terawasi', ageBands: ['6-12m', '1-2y', '2-3y', '3-5y'] },
  { id: 'rt-sore-talk', slot: 'sore', title: 'Ngobrol & Jalan Sore', ageBands: ['0-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3-5y'] },
  { id: 'rt-malam-story', slot: 'malam', title: 'Redup Lampu & Cerita', ageBands: ['0-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3-5y'] }
];

export const HOME_PLAY_IDEAS: HomePlayIdea[] = [
  {
    id: 'home-spoon',
    title: 'Ketuk Sendok Kayu & Panci',
    materials: 'Sendok kayu, panci plastik',
    pillar: 'kognitif',
    ageBands: ['6-12m', '1-2y']
  },
  {
    id: 'home-scarf',
    title: 'Tarik Kain dari Kotak Tisu',
    materials: 'Kain tipis, kotak tisu kosong',
    pillar: 'motor-halus',
    ageBands: ['3-6m', '6-12m', '1-2y']
  },
  {
    id: 'home-mirror',
    title: 'Ekspresi Wajah Depan Cermin',
    materials: 'Cermin aman',
    pillar: 'bahasa',
    ageBands: ['0-3m', '3-6m', '6-12m']
  },
  {
    id: 'home-pillow',
    title: 'Bukit Bantal Merangkak',
    materials: '2–3 bantal sofa',
    pillar: 'motor-kasar',
    ageBands: ['0-3m', '3-6m', '6-12m', '1-2y']
  },
  {
    id: 'home-sort',
    title: 'Pilah Tutup Botol Warna',
    materials: 'Tutup botol besar, mangkuk',
    pillar: 'kognitif',
    ageBands: ['1-2y', '2-3y', '3-5y']
  },
  {
    id: 'home-tape',
    title: 'Jalur Lakban Lurus Lantai',
    materials: 'Lakban kertas lantai',
    pillar: 'motor-kasar',
    ageBands: ['2-3y', '3-5y']
  }
];
