import type { AgeBand } from '../lib/development.ts';

export interface ImmunizationItem {
  id: string;
  name: string;
  ageLabel: string;
  ageBand: AgeBand;
  note: string;
}

export const IMMUNIZATION_SCHEDULE: ImmunizationItem[] = [
  { id: 'imm-hb0', name: 'Hepatitis B-0', ageLabel: 'Lahir <24 jam', ageBand: '0-3m', note: 'Diberikan segera setelah lahir' },
  { id: 'imm-bcg-pol0', name: 'BCG + Polio 0', ageLabel: '0–1 bln', ageBand: '0-3m', note: 'Perlindungan TBC & polio awal' },
  { id: 'imm-dpt1', name: 'DPT-HB-Hib 1 + Polio 1 + PCV 1', ageLabel: '2 bln', ageBand: '0-3m', note: 'Dosis dasar pertama' },
  { id: 'imm-dpt2', name: 'DPT-HB-Hib 2 + Polio 2 + RV 2', ageLabel: '3–4 bln', ageBand: '3-6m', note: 'Lanjutan dasar & rotavirus' },
  { id: 'imm-dpt3', name: 'DPT-HB-Hib 3 + Polio 3 + PCV 2', ageLabel: '4–6 bln', ageBand: '3-6m', note: 'Lengkapi seri dasar' },
  { id: 'imm-flu', name: 'Influenza & Vit A Biru', ageLabel: '6–11 bln', ageBand: '6-12m', note: 'Kapsul Vitamin A biru di posyandu' },
  { id: 'imm-mr1', name: 'Campak Rubela (MR 1)', ageLabel: '9 bln', ageBand: '6-12m', note: 'Wajib sebelum ulang tahun pertama' },
  { id: 'imm-pcv3', name: 'PCV 3 & Varisela', ageLabel: '12–15 bln', ageBand: '1-2y', note: 'Booster kekebalan balita' },
  { id: 'imm-dpt-b', name: 'Booster DPT + MR 2', ageLabel: '18 bln', ageBand: '1-2y', note: 'Ulangan penting usia batita' },
  { id: 'imm-vit-a', name: 'Vitamin A Merah Rutin', ageLabel: '2–5 thn', ageBand: '2-3y', note: 'Setiap Februari & Agustus' },
  { id: 'imm-dtap-preschool', name: 'Booster DTaP & Tifoid', ageLabel: '3–5 thn', ageBand: '3-5y', note: 'Siap masuk pra-sekolah' }
];
