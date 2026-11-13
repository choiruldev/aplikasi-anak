# Platform Stimulasi Tumbuh Kembang Anak (0–5 Tahun) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform KecilMain from a 1–5y toddler game portal into a 0–5y Gen Z child-development companion featuring age-adaptive daily stimulations, 3 newborn tools (0–12m), 12 existing simulation games (1–5y), persistent milestone/growth journaling, and bite-sized parenting tips.

**Architecture:** Refactor `App.tsx` into a calm editorial 4-tab Parent-First shell (`Stimulasi`, `Simulasi`, `Catatan`, `Tips`) backed by offline-first `localStorage` persistence split between daily-resetting play state (`kecilmain.progress.v1`) and permanent child records (`kecilmain.journal.v1`). Launching any screen tool enters a distraction-free `ChildFocusShell` where daily screen-time limits apply strictly to 1–5y toddler games while keeping parent tabs and 0–12m tools unrestricted.

**Tech Stack:** React 19, TypeScript, Vite 6, `vite-plugin-pwa`, Web Audio API, CSS custom properties, `node --experimental-strip-types --test`.

**Spec:** `docs/superpowers/specs/2026-11-13-tumbuh-kembang-0-5-design.md`

## Global Constraints

- **Offline-first PWA, zero backend/login:** All settings, daily progress, milestones, growth logs, notes, and tips bookmarks persist locally in `localStorage` without network calls or accounts.
- **No continuous idle CSS animations:** All parent dashboard screens and 0–12m tools follow calm-by-default (`#FAFAF8` canvas, `#FFFFFF` cards, `1px solid #EAE6DD` borders, tactile response only on user tap). Existing 12 interactive games remain intact.
- **6 Age Bands (`AgeBand`):** `'0-3m' | '3-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y'`.
- **Screen-time isolation:** `dailyLimitMinutes` ticks and locks ONLY 1–5y simulation games; parent tabs (`Stimulasi`, `Simulasi` catalog, `Catatan`, `Tips`) and 0–12m baby tools (`HighContrastCards`, `TummyTimeGuide`, `BabySoother`) remain accessible after game time expires.
- **Medical disclaimer:** Milestone checklists and tips present educational guidance with a clear note that they do not replace pediatricians/posyandu evaluations.
- **GitHub Pages compatibility:** Keep `base` subpath config in `vite.config.ts` working cleanly (`npm test` and `npm run build` must pass with 0 errors).

## Review Focus

- **Malformed or future `birthDate` inputs:** `computeAgeInfo('2099-01-01')` or `computeAgeInfo('')` must never produce `NaN` or negative months; fall back safely to `null` / manual `ageBand` (pinned in Task 1).
- **Legacy `kecilmain.settings.v1` migration:** Stored settings using old `ageFilter` (`'1-2.5' | '2.5-4' | '4-5' | 'all'`) must automatically map to the new `AgeBand` without losing `childName` or `dailyLimitMinutes` (pinned in Task 1).
- **Midnight calendar rollover isolation:** Crossing calendar days resets `playedSeconds`, `completedCounts`, and `completedMissions` in `DailyProgress`, while `kecilmain.journal.v1` milestones, growth logs, and notes stay intact permanently (pinned in Task 1 & Task 2).
- **Invalid anthropometric entries:** Negative, zero, or `NaN` weight/height inputs in Growth Log must be ignored/rejected rather than saved as corrupted history entries (pinned in Task 2).
- **Screen-time rule enforcement:** Pure helper `shouldCountScreenTime(module, isGameTimeUp, drawerOpen)` and `isModuleLockedByLimit(module, isGameTimeUp)` must prove 0–12m baby tools neither increment toddler screen-time nor get locked out when `isGameTimeUp === true` (pinned in Task 1 & verified in Task 5).

---

### Task 1: Age Bands, Development Helpers & Storage Migration

**Files:**
- Create: `src/lib/development.ts`
- Modify: `src/lib/storage.ts:1-109`
- Create: `src/lib/development.test.ts`

**Interfaces:**
- Produces in `src/lib/development.ts`:
  - `export type AgeBand = '0-3m' | '3-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y'`
  - `export type StimulationPillar = 'motor-kasar' | 'motor-halus' | 'bahasa' | 'kognitif'`
  - `export interface AgeInfo { months: number; label: string; band: AgeBand }`
  - `export function computeAgeInfo(birthDate?: string, now?: Date): AgeInfo | null`
  - `export function mapMonthsToAgeBand(months: number): AgeBand`
  - `export function shouldCountScreenTime(isBabyTool: boolean, isLimitReached: boolean, modalOpen: boolean): boolean`
  - `export function isModuleLockedByLimit(isBabyTool: boolean, isLimitReached: boolean): boolean`
- Produces in `src/lib/storage.ts`:
  - Updated `AppSettings` (`childName`, `birthDate?: string`, `ageBand: AgeBand`, `childLockExit: boolean`, `soundEnabled`, `voiceEnabled`, `bgmEnabled`, `dailyLimitMinutes`)
  - Updated `DailyProgress` adding `completedMissions: string[]`
  - `migrateLegacyAgeFilter(legacy?: string): AgeBand`

- [ ] **Step 1: Write failing tests in `src/lib/development.test.ts`**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeAgeInfo,
  isModuleLockedByLimit,
  mapMonthsToAgeBand,
  shouldCountScreenTime
} from './development.ts';
import { migrateLegacyAgeFilter } from './storage.ts';

test('mapMonthsToAgeBand maps 0-60+ months accurately', () => {
  assert.equal(mapMonthsToAgeBand(0), '0-3m');
  assert.equal(mapMonthsToAgeBand(2), '0-3m');
  assert.equal(mapMonthsToAgeBand(3), '3-6m');
  assert.equal(mapMonthsToAgeBand(6), '6-12m');
  assert.equal(mapMonthsToAgeBand(12), '1-2y');
  assert.equal(mapMonthsToAgeBand(24), '2-3y');
  assert.equal(mapMonthsToAgeBand(36), '3-5y');
  assert.equal(mapMonthsToAgeBand(65), '3-5y');
});

test('computeAgeInfo handles valid, future, and invalid birthDates', () => {
  const ref = new Date('2026-11-13T12:00:00Z');
  const infant = computeAgeInfo('2026-07-10', ref);
  assert.equal(infant?.months, 4);
  assert.equal(infant?.band, '3-6m');
  assert.equal(infant?.label, '4 bln');

  const toddler = computeAgeInfo('2024-05-01', ref);
  assert.equal(toddler?.months, 30);
  assert.equal(toddler?.band, '2-3y');
  assert.equal(toddler?.label, '2 thn 6 bln');

  assert.equal(computeAgeInfo('', ref), null);
  assert.equal(computeAgeInfo('not-a-date', ref), null);
  assert.equal(computeAgeInfo('2099-01-01', ref), null);
});

test('migrateLegacyAgeFilter converts v1 filters to AgeBand', () => {
  assert.equal(migrateLegacyAgeFilter('1-2.5'), '1-2y');
  assert.equal(migrateLegacyAgeFilter('2.5-4'), '2-3y');
  assert.equal(migrateLegacyAgeFilter('4-5'), '3-5y');
  assert.equal(migrateLegacyAgeFilter('all'), '1-2y');
  assert.equal(migrateLegacyAgeFilter(undefined), '1-2y');
});

test('screen-time limit rules exempt baby tools and modal pauses', () => {
  assert.equal(shouldCountScreenTime(false, false, false), true);
  assert.equal(shouldCountScreenTime(true, false, false), false);
  assert.equal(shouldCountScreenTime(false, true, false), false);
  assert.equal(shouldCountScreenTime(false, false, true), false);

  assert.equal(isModuleLockedByLimit(false, true), true);
  assert.equal(isModuleLockedByLimit(true, true), false);
  assert.equal(isModuleLockedByLimit(false, false), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/lib/development.test.ts`
Expected: FAIL with module not found `'./development.ts'`.

- [ ] **Step 3: Implement `src/lib/development.ts` and update `src/lib/storage.ts`**

- Implement `computeAgeInfo`: parse `YYYY-MM-DD`, reject invalid or future dates, compute whole months using year/month/day comparison (adjust -1 month if `now.getUTCDate() < birth.getUTCDate()` clamped >= 0), format `< 24` months as `"N bln"` (and `0` as `"Baru lahir"`), `>= 24` months as `"Y thn"` or `"Y thn M bln"`.
- Update `src/lib/storage.ts`: keep `kecilmain.settings.v1` and `kecilmain.progress.v1`, add `migrateLegacyAgeFilter`, validate `ageBand`, preserve existing fields if present, sanitize `completedMissions: string[]`, and keep daily rollover reset isolated to `DailyProgress`. Keep legacy `AgeFilter` exported briefly only if needed during transition or replace cleanly across consumers in Task 6.

- [ ] **Step 4: Run tests and verify pass**

Run: `npm test`
Expected: PASS (14 existing tests + new tests in `development.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add src/lib/development.ts src/lib/storage.ts src/lib/development.test.ts
git commit -m "feat(core): add 0-5y age bands, birthDate calculation, and settings migration"
```

---

### Task 2: Persistent Child Journal, Milestones, Growth Log & Summary Export

**Files:**
- Create: `src/lib/journalStorage.ts`
- Create: `src/lib/journalStorage.test.ts`

**Interfaces:**
- Produces in `src/lib/journalStorage.ts`:
  - `export type NoteMood = 'happy' | 'calm' | 'fussy'`
  - `export interface MilestoneRecord { checked: boolean; achievedAt?: string }`
  - `export interface GrowthEntry { id: string; date: string; weightKg?: number; heightCm?: number; note?: string }`
  - `export interface DailyNote { id: string; date: string; mood: NoteMood; text: string }`
  - `export interface JournalData { milestoneStatus: Record<string, MilestoneRecord>; growthLogs: GrowthEntry[]; dailyNotes: DailyNote[]; savedTipIds: string[] }`
  - `export function createEmptyJournal(): JournalData`
  - `export function parseJournalRaw(raw: string | null): JournalData`
  - `export function loadJournal(): JournalData`
  - `export function saveJournal(data: JournalData): void`
  - `export function toggleMilestone(data: JournalData, milestoneId: string, dateKey?: string): JournalData`
  - `export function addGrowthLog(data: JournalData, input: { date: string; weightKg?: number; heightCm?: number; note?: string }): JournalData`
  - `export function deleteGrowthLog(data: JournalData, id: string): JournalData`
  - `export function addDailyNote(data: JournalData, input: { date: string; mood: NoteMood; text: string }): JournalData`
  - `export function deleteDailyNote(data: JournalData, id: string): JournalData`
  - `export function toggleSavedTip(data: JournalData, tipId: string): JournalData`
  - `export function formatJournalSummary(params: { childName: string; ageLabel: string; phaseLabel: string; achievedCount: number; totalPhaseMilestones: number; latestGrowth?: GrowthEntry; recentNotes: DailyNote[] }): string`

- [ ] **Step 1: Write failing tests in `src/lib/journalStorage.test.ts`**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addDailyNote,
  addGrowthLog,
  createEmptyJournal,
  formatJournalSummary,
  parseJournalRaw,
  toggleMilestone,
  toggleSavedTip
} from './journalStorage.ts';

test('toggleMilestone records and clears achievement date', () => {
  const j0 = createEmptyJournal();
  const j1 = toggleMilestone(j0, 'm-03-1', '2026-11-13');
  assert.deepEqual(j1.milestoneStatus['m-03-1'], { checked: true, achievedAt: '2026-11-13' });
  const j2 = toggleMilestone(j1, 'm-03-1', '2026-11-13');
  assert.deepEqual(j2.milestoneStatus['m-03-1'], { checked: false });
});

test('addGrowthLog validates measurements and sorts newest date first', () => {
  let j = createEmptyJournal();
  j = addGrowthLog(j, { date: '2026-10-01', weightKg: 6.2, heightCm: 61.5 });
  j = addGrowthLog(j, { date: '2026-11-01', weightKg: 6.8, heightCm: 63.0 });
  // Invalid measurements ignored
  const beforeLen = j.growthLogs.length;
  j = addGrowthLog(j, { date: '2026-11-05', weightKg: -2, heightCm: 0 });
  assert.equal(j.growthLogs.length, beforeLen);
  assert.equal(j.growthLogs[0].date, '2026-11-01');
  assert.equal(j.growthLogs[0].weightKg, 6.8);
});

test('addDailyNote rejects blank text and toggleSavedTip deduplicates', () => {
  let j = createEmptyJournal();
  j = addDailyNote(j, { date: '2026-11-13', mood: 'happy', text: '   ' });
  assert.equal(j.dailyNotes.length, 0);
  j = addDailyNote(j, { date: '2026-11-13', mood: 'happy', text: 'Pertama kali tengkurap!' });
  assert.equal(j.dailyNotes.length, 1);

  j = toggleSavedTip(j, 'tip-1');
  j = toggleSavedTip(j, 'tip-1');
  assert.deepEqual(j.savedTipIds, []);
});

test('parseJournalRaw safely recovers from corrupt JSON and formatJournalSummary builds text', () => {
  assert.deepEqual(parseJournalRaw('{broken'), createEmptyJournal());
  const summary = formatJournalSummary({
    childName: 'Kenzo',
    ageLabel: '4 bln',
    phaseLabel: 'Bayi Awal (3–6 Bulan)',
    achievedCount: 3,
    totalPhaseMilestones: 5,
    latestGrowth: { id: 'g1', date: '2026-11-01', weightKg: 6.8, heightCm: 63 },
    recentNotes: [{ id: 'n1', date: '2026-11-13', mood: 'happy', text: 'Tertawa keras' }]
  });
  assert.match(summary, /Kenzo/);
  assert.match(summary, /6\.8 kg/);
  assert.match(summary, /3\/5/);
  assert.match(summary, /Tertawa keras/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/lib/journalStorage.test.ts`
Expected: FAIL with module not found `'./journalStorage.ts'`.

- [ ] **Step 3: Implement `src/lib/journalStorage.ts`**

- Persist under key `kecilmain.journal.v1`. Pure immutable state helper functions so both React components and unit tests work identically. Reject `addGrowthLog` when both `weightKg` and `heightCm` are missing or non-positive (`<= 0` or `!Number.isFinite`). Generate unique IDs using timestamp + random suffix.

- [ ] **Step 4: Run tests and verify pass**

Run: `npm test`
Expected: PASS across all suites.

- [ ] **Step 5: Commit**

```bash
git add src/lib/journalStorage.ts src/lib/journalStorage.test.ts
git commit -m "feat(journal): add persistent child milestone, growth log, and note storage"
```

---

### Task 3: Curated 0–5y Stimulation Content, Milestones, Simulation Catalog & Gen Z Tips

**Files:**
- Create: `src/data/stimulationData.ts`
- Create: `src/data/tipsData.ts`
- Create: `src/data/catalog.test.ts`

**Interfaces:**
- Produces in `src/data/stimulationData.ts`:
  - `export type SimulationKey = 'high-contrast' | 'tummy-time' | 'baby-soother' | 'peekaboo' | 'bubblepopper' | 'colors' | 'sensory' | 'numbers' | 'alphabet' | 'shapes' | 'trace' | 'motor' | 'coloring' | 'puzzle' | 'balloon'`
  - `export interface AgePhaseMeta { id: AgeBand; shortLabel: string; label: string; rangeLabel: string; focusSummary: string }`
  - `export interface StimulationMission { id: string; ageBand: AgeBand; pillar: StimulationPillar; title: string; durationLabel: string; summary: string; steps: string[]; linkedSimulation?: SimulationKey }`
  - `export interface MilestoneItem { id: string; ageBand: AgeBand; pillar: StimulationPillar; text: string }`
  - `export interface SimulationModuleMeta { key: SimulationKey; title: string; subtitle: string; goalLabel: string; pillar: StimulationPillar; ageBands: AgeBand[]; ageTag: string; isBabyTool: boolean; stickerId?: string; surfaceTint: string }`
  - Exports: `AGE_PHASES`, `STIMULATION_MISSIONS`, `MILESTONES`, `SIMULATION_MODULES`
- Produces in `src/data/tipsData.ts`:
  - `export type TipCategory = 'Newborn' | 'Nutrisi & MPASI' | 'Screen Time' | 'Emosi & Tantrum' | 'Tanda Waspada'`
  - `export interface ParentingTip { id: string; category: TipCategory; ageBands: AgeBand[]; title: string; hook: string; actionPoints: [string, string, string]; reminder: string }`
  - Exports: `TIP_CATEGORIES`, `TIPS_DATA`

- [ ] **Step 1: Write failing integrity tests in `src/data/catalog.test.ts`**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AGE_PHASES,
  MILESTONES,
  SIMULATION_MODULES,
  STIMULATION_MISSIONS
} from './stimulationData.ts';
import { TIPS_DATA } from './tipsData.ts';

test('all 6 age phases have missions and milestones', () => {
  assert.equal(AGE_PHASES.length, 6);
  for (const phase of AGE_PHASES) {
    const missions = STIMULATION_MISSIONS.filter((m) => m.ageBand === phase.id);
    const milestones = MILESTONES.filter((m) => m.ageBand === phase.id);
    assert.ok(missions.length >= 3, `Phase ${phase.id} needs >= 3 missions`);
    assert.ok(milestones.length >= 5, `Phase ${phase.id} needs >= 5 milestones`);
  }
});

test('mission linkedSimulation keys exist in SIMULATION_MODULES and IDs are unique', () => {
  const moduleKeys = new Set(SIMULATION_MODULES.map((s) => s.key));
  assert.equal(moduleKeys.size, 15);
  assert.equal(SIMULATION_MODULES.filter((s) => s.isBabyTool).length, 3);
  assert.equal(SIMULATION_MODULES.filter((s) => !s.isBabyTool).length, 12);

  for (const m of STIMULATION_MISSIONS) {
    if (m.linkedSimulation) {
      assert.ok(moduleKeys.has(m.linkedSimulation), `Unknown sim ${m.linkedSimulation}`);
    }
  }

  const allIds = [
    ...STIMULATION_MISSIONS.map((m) => m.id),
    ...MILESTONES.map((m) => m.id),
    ...TIPS_DATA.map((t) => t.id)
  ];
  assert.equal(new Set(allIds).size, allIds.length);
  assert.ok(TIPS_DATA.length >= 15);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/data/catalog.test.ts`
Expected: FAIL with missing modules.

- [ ] **Step 3: Author `src/data/stimulationData.ts` and `src/data/tipsData.ts`**

- Author concise, natural Indonesian Gen Z copy across all 6 phases (`0-3m` through `3-5y`), 20–24 missions, 30 milestones (based on general KPSP/IDAI-aligned developmental expectations with supportive tone), 15 simulation metadata items, and 18–20 punchy `TIPS_DATA` cards covering Newborn, MPASI, Screen Time (WHO/AAP-aligned), Emosi & Tantrum, and Red Flags (when to check in with pediatrician).
- Add `src/data/*.test.ts` to `package.json` `"test"` script (`node --experimental-strip-types --test "src/**/*.test.ts"`).

- [ ] **Step 4: Run tests and verify pass**

Run: `npm test`
Expected: PASS all unit and catalog tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/stimulationData.ts src/data/tipsData.ts src/data/catalog.test.ts package.json
git commit -m "feat(content): add 0-5y stimulation missions, milestones, 15 simulations, and parenting tips"
```

---

### Task 4: 3 Newborn & Baby Interactive Tools (0–12 Bulan)

**Files:**
- Create: `src/activities/HighContrastCards.tsx`
- Create: `src/activities/TummyTimeGuide.tsx`
- Create: `src/activities/BabySoother.tsx`
- Modify: `src/lib/bgm.ts` (optional helper if sharing noise/chime or implement cleanly inside Web Audio module)

**Interfaces:**
- Produces:
  - `export function HighContrastCards(): JSX.Element`
  - `export function TummyTimeGuide(): JSX.Element`
  - `export function BabySoother(): JSX.Element`

- [ ] **Step 1: Implement `src/activities/HighContrastCards.tsx`**

- 6 static high-contrast SVG cards (`Lingkaran Fokus`, `Papan Catur`, `Garis Kontras`, `Spiral Tenang`, `Wajah Senyum`, `Bulan & Bintang`) in crisp `#111111`, `#FFFFFF`, and minimal `#E53935` red accent on toggleable dark/light ground.
- Tap card or Next/Prev buttons to switch smoothly; display non-intrusive top guidance badge (`"Jarak ideal 20–30 cm · Maks 2–5 mnt"`). Zero idle animations.

- [ ] **Step 2: Implement `src/activities/TummyTimeGuide.tsx`**

- Preset duration selector (`1 mnt`, `3 mnt`, `5 mnt`) with large tabular-numerals countdown timer, Start/Pause/Reset buttons, gentle end chime (`playSuccessChime()` from `src/lib/audio.ts`), and 3 swipe/tab parent prompts (*"Panggil dari sisi kanan-kiri"*, *"Tunjukkan mainan kontras"*, *"Nyanyi pelan sejajar mata"*). Clean up interval on unmount.

- [ ] **Step 3: Implement `src/activities/BabySoother.tsx`**

- Web Audio API engine generating:
  - **White Noise Lembut** (`AudioBuffer` noise + `BiquadFilterNode` lowpass `900Hz`, soft fade-in/fade-out gain)
  - **Rintik Hujan** (bandpass/lowpass filtered noise)
  - **Lullaby Kotak Musik** (reusing `startLullabyBgm` / `stopLullabyBgm` from `src/lib/bgm.ts`)
- Auto-off countdown (`10 mnt`, `20 mnt`, `30 mnt`).
- Dedicated **Kerincingan (Rattle)** tap pad at bottom playing a soft two-tone wooden shaker burst for left/right auditory tracking exercises. Stop all audio nodes cleanly on unmount.

- [ ] **Step 4: Typecheck and build verification**

Run: `npx tsc -b && npm run build`
Expected: Build succeeds with 0 TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/activities/HighContrastCards.tsx src/activities/TummyTimeGuide.tsx src/activities/BabySoother.tsx
git commit -m "feat(newborn): add high-contrast cards, tummy time timer, and baby soother modules"
```

---

### Task 5: 4-Tab Gen Z Companion Views & Child Focus Shell

**Files:**
- Create: `src/tabs/StimulasiTab.tsx`
- Create: `src/tabs/SimulasiTab.tsx`
- Create: `src/tabs/CatatanTab.tsx`
- Create: `src/tabs/TipsTab.tsx`
- Create: `src/components/ChildFocusShell.tsx`

**Interfaces:**
- Consumes: `AgeBand`, `computeAgeInfo`, `isModuleLockedByLimit`, `shouldCountScreenTime` (`src/lib/development.ts`), `JournalData` helpers (`src/lib/journalStorage.ts`), catalogs (`src/data/stimulationData.ts`, `src/data/tipsData.ts`).
- Produces:
  - `StimulasiTab({ childName, ageInfo, activeBand, onSelectBand, completedMissions, onToggleMission, journal, onOpenSimulation, onOpenProfile, onOpenTabCatatan })`
  - `SimulasiTab({ activeBand, isGameTimeUp, stickersCount, onOpenStickerAlbum, onLaunchSimulation, onOpenTimeLimitReset })`
  - `CatatanTab({ childName, ageLabel, activeBand, journal, onToggleMilestone, onAddGrowth, onDeleteGrowth, onAddNote, onDeleteNote })`
  - `TipsTab({ savedTipIds, onToggleSaveTip })`
  - `ChildFocusShell({ moduleMeta, isTimeUp, remainingSec, bgmEnabled, childLockExit, onToggleBgm, onExit, onRequestResetTimer, children })`

- [ ] **Step 1: Build `src/tabs/StimulasiTab.tsx`**

- Editorial greeting (`"Halo, Bunda & Ayah [nama anak]"` / age badge + prompt to set birthDate if missing, plus quick 6-phase pill bar).
- Daily Mission card: shows `X/Y misi hari ini` linear progress bar, list of 3–4 missions for `activeBand` with expandable steps (`Detail langkah`), checkbox button (`Selesai`), and direct `"Buka Simulasi →"` button for missions with `linkedSimulation`.
- Milestone snapshot card linking straight to `Catatan`.

- [ ] **Step 2: Build `src/tabs/SimulasiTab.tsx`**

- Clear distinction: Section 1 **"Alat Bantu Bayi (0–12 Bulan)"** (3 baby tools, always unlocked) and Section 2 **"Simulasi & Game Tumbuh Kembang (1–5 Tahun)"** (12 games with pillar tags & age badges).
- Filter pills (`Sesuai Usia` / `Semua` + pillar filter) and `"⭐ X / 10 Stiker"` pill opening `StickerAlbumModal`.
- If `isGameTimeUp`, renders a calm inline notice on Section 2 ("Waktu main layar hari ini selesai — tab Orang Tua & Alat Bantu Bayi tetap aktif") with a link to reset via Parent Gate, rather than locking out the whole site.

- [ ] **Step 3: Build `src/tabs/CatatanTab.tsx` and `src/tabs/TipsTab.tsx`**

- `CatatanTab`: Phase switcher for Milestones with one-tap check-off & `Tercapai · tanggal` pill; Growth Log compact form (`Berat kg`, `Tinggi cm`, `Tanggal`) + sorted history list; Moment Note quick form + mood chips; `"Salin Ringkasan"` button with `"Tersalin!"` feedback; calm educational disclaimer footer.
- `TipsTab`: Category pills (`Semua`, `Disimpan`, + 5 categories), clean flat tip cards showing category pill, hook, 3 bullet action steps, reminder line, and bookmark button.

- [ ] **Step 4: Build `src/components/ChildFocusShell.tsx`**

- Wraps running simulation fullscreen cleanly. Displays minimal top bar (`Kembali` + BGM toggle + remaining toddler timer pill when `!moduleMeta.isBabyTool`).
- If `childLockExit && !moduleMeta.isBabyTool`, tapping `Kembali` opens an inline arithmetic Parent Gate (`a + b = ?`) before exiting back to the Parent 4-tab shell; otherwise exits immediately. Also displays the Rest Screen inside `ChildFocusShell` if toddler timer hits 0 mid-game (with gated timer reset button or Exit to Parent Mode).

- [ ] **Step 5: Typecheck & Commit**

Run: `npx tsc -b`
Expected: 0 TypeScript errors.
```bash
git add src/tabs/ src/components/ChildFocusShell.tsx
git commit -m "feat(ui): build 4-tab Gen Z companion views and ChildFocusShell"
```

---

### Task 6: App Shell Refactor, Editorial CSS Design System, Profile Drawer & End-to-End Verification

**Files:**
- Modify: `src/App.tsx:1-726`
- Modify: `src/components/ParentDrawer.tsx:1-326`
- Modify: `src/styles.css`
- Modify: `index.html:1-31`
- Modify: `vite.config.ts:20-41`
- Modify: `package.json:1-15`

**Interfaces:**
- Refactors `ParentDrawer` into frictionless **Profile & Settings Drawer** (opens directly without math gate; holds `childName`, `birthDate` input, fallback `ageBand` selector, `dailyLimitMinutes`, `childLockExit` toggle, sound/voice/BGM toggles, today's simulation minutes + gated reset if expired, and PWA install card).

- [ ] **Step 1: Update `src/components/ParentDrawer.tsx`**

- Remove initial math gate lock screen when opened from the header Profile Chip so parents edit child name/birthDate/settings in 1 tap. Keep gated arithmetic challenge only if clicking `"Ulangi Timer Hari Ini"` when expired, or clear directly in parent drawer.

- [ ] **Step 2: Wire `src/App.tsx` to 4-Tab Shell + `ChildFocusShell` + All 15 Simulations**

- Manage state: `settings`, `progress`, `journal` (`loadJournal()` / `saveJournal()`), `activeTab` (`'stimulasi' | 'simulasi' | 'catatan' | 'tips'`), `activeSimulation` (`SimulationKey | null`).
- Compute `ageInfo = computeAgeInfo(settings.birthDate)` and `activeBand = ageInfo?.band ?? settings.ageBand`.
- Screen-time `useEffect`: tick `playedSeconds` ONLY when `activeSimulation !== null` AND `shouldCountScreenTime(activeSimMeta.isBabyTool, isGameTimeUp, parentOpen)`.
- When an activity calls `onComplete(stickerId)`: record sticker/count AND automatically mark any matching mission (`linkedSimulation === activeSimulation`) completed in `progress.completedMissions`.
- Clean minimalist header (Logo + Child Profile Chip `"Nama · Usia"` or `"Pilih Usia"`) + responsive Bottom Navigation Bar (4 tabs on mobile) / Horizontal Nav (desktop). Remove `toddler-zone-banner` and `MascotGuide` from root shell.

- [ ] **Step 3: Implement Clean Editorial Styles in `src/styles.css` & Update Metadata**

- Add CSS custom properties for Gen Z editorial aesthetic (`--canvas-bg: #FAFAF8`, `--surface-card: #FFFFFF`, `--border-hairline: #EAE6DD`, `--accent-sage: #2B6E4F`, `--text-ink: #182421`, `--text-muted: #5E6A65`, `font-variant-numeric: tabular-nums`), bottom mobile navigation bar, flat cards, mission checkboxes, high-contrast card stage, tummy timer, soother controls, and milestone/growth layouts — ensuring ZERO idle looping animations and clean mobile 390px + desktop responsiveness.
- Update `index.html`, `vite.config.ts`, and `package.json` descriptions to `"0–5 tahun · Stimulasi & Tumbuh Kembang Anak"`.

- [ ] **Step 4: Run tests, TypeScript check, Production Build, & Real-Browser Screenshot Audit**

- Run `npm test` -> verify all unit & catalog tests pass 100%.
- Run `npm run build` -> verify 0 TypeScript/Vite errors and PWA precache succeeds.
- Capture headless Chrome screenshots on built bundle (`vite preview`) across mobile (390x844) and desktop (1280x800) for all 4 tabs + newborn tools (`HighContrastCards`, `TummyTimeGuide`, `BabySoother`) + `ParentDrawer`, and inspect screenshots directly to verify 0 console errors, 0 horizontal overflow, legible typography, and flat Gen Z aesthetics.

- [ ] **Step 5: Commit & Verify Clean Tree**

```bash
git add src/ index.html vite.config.ts package.json
git commit -m "feat(platform): launch 0-5y Gen Z child development & stimulation companion"
```
