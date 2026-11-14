import { MILESTONES, STIMULATION_MISSIONS } from '../data/stimulationData.ts';
import { type AgeBand, isValidIsoDate, type StimulationPillar } from './development.ts';
import type { JournalData } from './journalStorage.ts';
import { type DailyProgress, todayKey } from './storage.ts';

export interface StreakInfo {
  streakDays: number;
  completedToday: boolean;
}

export interface PillarBalanceItem {
  pillar: StimulationPillar;
  done: number;
  total: number;
  percent: number;
}

function shiftIsoDate(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function computeStreakInfo(
  activeDates: string[],
  today: string = todayKey()
): StreakInfo {
  const validSet = new Set(activeDates.filter(isValidIsoDate));
  const completedToday = validSet.has(today);
  let cursor = completedToday ? today : shiftIsoDate(today, -1);
  let streakDays = 0;

  while (validSet.has(cursor)) {
    streakDays += 1;
    cursor = shiftIsoDate(cursor, -1);
  }

  return { streakDays, completedToday };
}

const ALL_PILLARS: StimulationPillar[] = ['motor-kasar', 'motor-halus', 'bahasa', 'kognitif'];

export function computePillarBalance(
  progress: DailyProgress,
  journal: JournalData,
  ageBand: AgeBand
): PillarBalanceItem[] {
  const bandMissions = STIMULATION_MISSIONS.filter((m) => m.ageBand === ageBand);
  const bandMilestones = MILESTONES.filter((m) => m.ageBand === ageBand);

  return ALL_PILLARS.map((pillar) => {
    const pillarMissions = bandMissions.filter((m) => m.pillar === pillar);
    const pillarMilestones = bandMilestones.filter((m) => m.pillar === pillar);
    const doneMissions = pillarMissions.filter((m) =>
      progress.completedMissions.includes(m.id)
    ).length;
    const doneMilestones = pillarMilestones.filter(
      (m) => Boolean(journal.milestoneStatus[m.id]?.checked)
    ).length;

    const total = pillarMissions.length + pillarMilestones.length;
    const done = doneMissions + doneMilestones;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { pillar, done, total, percent };
  });
}
