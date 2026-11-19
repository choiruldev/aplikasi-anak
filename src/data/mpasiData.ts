export type MpasiCategory =
  | 'Karbohidrat'
  | 'Protein Hewani'
  | 'Protein Nabati'
  | 'Sayur'
  | 'Buah'
  | 'Lemak & Bumbu';

export interface MpasiStageGuide {
  id: string;
  ageLabel: string;
  texture: string;
  freq: string;
}

export interface MpasiFoodItem {
  id: string;
  name: string;
  category: MpasiCategory;
  isAllergen?: boolean;
}

export const MPASI_STAGES: MpasiStageGuide[] = [
  { id: 'st-6', ageLabel: '6–8 Bulan', texture: 'Bubur kental saring/lumat', freq: '2–3x makan + ASI' },
  { id: 'st-8', ageLabel: '8–9 Bulan', texture: 'Bubur kasar / cincang halus', freq: '3x makan + 1 selingan' },
  { id: 'st-9', ageLabel: '9–11 Bulan', texture: 'Nasi tim / cincang kasar + finger food', freq: '3–4x makan + 1–2 selingan' },
  { id: 'st-12', ageLabel: '12+ Bulan', texture: 'Makanan keluarga dipotong kecil', freq: '3–4x makan + 2 selingan' }
];

const RAW_FOODS: Array<[string, MpasiCategory, boolean?]> = [
  // Karbohidrat (10)
  ['Beras Putih', 'Karbohidrat'], ['Beras Merah', 'Karbohidrat'], ['Kentang', 'Karbohidrat'],
  ['Ubi Ungu', 'Karbohidrat'], ['Ubi Cilembu', 'Karbohidrat'], ['Singkong', 'Karbohidrat'],
  ['Jagung Manis', 'Karbohidrat'], ['Oatmeal', 'Karbohidrat'], ['Makaroni/Pasta', 'Karbohidrat'],
  ['Roti Gandum', 'Karbohidrat', true],
  // Protein Hewani (14)
  ['Telur Ayam', 'Protein Hewani', true], ['Telur Puyuh', 'Protein Hewani', true], ['Daging Ayam', 'Protein Hewani'],
  ['Hati Ayam', 'Protein Hewani'], ['Daging Sapi', 'Protein Hewani'], ['Ikan Kembung', 'Protein Hewani', true],
  ['Ikan Lele', 'Protein Hewani', true], ['Ikan Salmon', 'Protein Hewani', true], ['Ikan Patin', 'Protein Hewani', true],
  ['Teri Nasi', 'Protein Hewani', true], ['Udang', 'Protein Hewani', true], ['Cumi', 'Protein Hewani', true],
  ['Keju Tanpa Garam', 'Protein Hewani', true], ['Yogurt Plain', 'Protein Hewani', true],
  // Protein Nabati (8)
  ['Tahu Putih', 'Protein Nabati', true], ['Tempe', 'Protein Nabati', true], ['Edamame', 'Protein Nabati', true],
  ['Kacang Hijau', 'Protein Nabati'], ['Kacang Merah', 'Protein Nabati'], ['Kacang Polong', 'Protein Nabati'],
  ['Selai Kacang', 'Protein Nabati', true], ['Wijen', 'Protein Nabati', true],
  // Sayur (14)
  ['Wortel', 'Sayur'], ['Bayam', 'Sayur'], ['Brokoli', 'Sayur'], ['Kembang Kol', 'Sayur'],
  ['Labu Kuning', 'Sayur'], ['Labu Siam', 'Sayur'], ['Tomat', 'Sayur'], ['Zukini', 'Sayur'],
  ['Buncis', 'Sayur'], ['Pakcoy', 'Sayur'], ['Kangkung', 'Sayur'], ['Daun Kelor', 'Sayur'],
  ['Timun', 'Sayur'], ['Bit Merah', 'Sayur'],
  // Buah (12)
  ['Pisang Ambon', 'Buah'], ['Alpukat', 'Buah'], ['Pepaya', 'Buah'], ['Mangga Manis', 'Buah'],
  ['Buah Naga', 'Buah'], ['Pir Kukus', 'Buah'], ['Apel Kukus', 'Buah'], ['Semangka', 'Buah'],
  ['Melon', 'Buah'], ['Jeruk Manis', 'Buah'], ['Stroberi', 'Buah'], ['Anggur Cincang', 'Buah'],
  // Lemak & Bumbu (7)
  ['Unsalted Butter', 'Lemak & Bumbu', true], ['Minyak Zaitun (EVOO)', 'Lemak & Bumbu'],
  ['Santan Segar', 'Lemak & Bumbu'], ['Minyak Kelapa', 'Lemak & Bumbu'],
  ['Bawang Putih', 'Lemak & Bumbu'], ['Bawang Merah', 'Lemak & Bumbu'], ['Daun Salam', 'Lemak & Bumbu']
];

export const MPASI_FOODS: MpasiFoodItem[] = RAW_FOODS.map(([name, category, isAllergen], idx) => ({
  id: `mpasi-${idx + 1}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name,
  category,
  ...(isAllergen ? { isAllergen: true } : {})
}));
