export type AgeBand = '0-3m' | '3-6m' | '6-12m' | '1-2y' | '2-3y' | '3-5y';

export type StimulationPillar = 'motor-kasar' | 'motor-halus' | 'bahasa' | 'kognitif';

export interface AgeInfo {
  months: number;
  label: string;
  band: AgeBand;
}

export const AGE_BANDS: AgeBand[] = ['0-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3-5y'];

export function isValidAgeBand(value: unknown): value is AgeBand {
  return typeof value === 'string' && (AGE_BANDS as string[]).includes(value);
}

export function mapMonthsToAgeBand(months: number): AgeBand {
  if (!Number.isFinite(months) || months < 3) return '0-3m';
  if (months < 6) return '3-6m';
  if (months < 12) return '6-12m';
  if (months < 24) return '1-2y';
  if (months < 36) return '2-3y';
  return '3-5y';
}

export function isValidIsoDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function formatAgeLabel(months: number): string {
  if (months <= 0) return 'Baru lahir';
  if (months < 24) return `${months} bln`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years} thn` : `${years} thn ${rem} bln`;
}

export function computeAgeInfo(birthDate?: string, now: Date = new Date()): AgeInfo | null {
  if (!birthDate || !isValidIsoDate(birthDate)) return null;

  const [yStr, mStr, dStr] = birthDate.split('-');
  const birthYear = Number(yStr);
  const birthMonth = Number(mStr);
  const birthDay = Number(dStr);

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth() + 1;
  const nowDay = now.getUTCDate();

  const isFuture =
    birthYear > nowYear ||
    (birthYear === nowYear && birthMonth > nowMonth) ||
    (birthYear === nowYear && birthMonth === nowMonth && birthDay > nowDay);

  if (isFuture) return null;

  const rawMonths =
    (nowYear - birthYear) * 12 +
    (nowMonth - birthMonth) -
    (nowDay < birthDay ? 1 : 0);

  const months = Math.max(0, rawMonths);
  return {
    months,
    label: formatAgeLabel(months),
    band: mapMonthsToAgeBand(months)
  };
}

export function shouldCountScreenTime(
  isBabyTool: boolean,
  isLimitReached: boolean,
  modalOpen: boolean
): boolean {
  return !isBabyTool && !isLimitReached && !modalOpen;
}

export function isModuleLockedByLimit(
  isBabyTool: boolean,
  isLimitReached: boolean
): boolean {
  return !isBabyTool && isLimitReached;
}
