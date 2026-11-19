import {
  SIMULATION_MODULES,
  STIMULATION_MISSIONS,
  type SimulationModuleMeta,
  type StimulationMission
} from '../data/stimulationData.ts';
import type { BabyCareData } from './babyCareStorage.ts';
import type { AgeBand, StimulationPillar } from './development.ts';
import type { JournalData } from './journalStorage.ts';
import type { ChildGender, DailyProgress } from './storage.ts';
import { evaluateChildGrowthWho, type WhoTone } from './whoGrowth.ts';

export interface InsightCard {
  id: string;
  tone: WhoTone;
  title: string;
  detail: string;
}

export interface ChildInsightsSummary {
  headline: string;
  cards: InsightCard[];
  recommendedSim: SimulationModuleMeta;
  recommendedMission: StimulationMission;
  priorityPillar?: StimulationPillar;
}

export function generateChildInsights(params: {
  childName: string;
  gender: ChildGender;
  months: number;
  ageBand: AgeBand;
  journal: JournalData;
  progress: DailyProgress;
  babyCare: BabyCareData;
}): ChildInsightsSummary {
  const { childName, gender, months, ageBand, journal, progress } = params;
  const cards: InsightCard[] = [];
  let priorityPillar: StimulationPillar | undefined;

  // 1. Analyze latest WHO Growth & weight trend
  const latestGrowth = journal.growthLogs[0];
  if (latestGrowth) {
    const evalWho = evaluateChildGrowthWho({
      gender,
      months,
      weightKg: latestGrowth.weightKg,
      heightCm: latestGrowth.heightCm,
      headCircumferenceCm: latestGrowth.headCircumferenceCm
    });

    if (evalWho.wfa) {
      cards.push({
        id: 'who-wfa',
        tone: evalWho.wfa.tone,
        title: `Berat ${latestGrowth.weightKg} kg · ${evalWho.wfa.status}`,
        detail: `Z-score BB/U ${evalWho.wfa.zScore > 0 ? '+' : ''}${evalWho.wfa.zScore} SD (acuan WHO).`
      });
    }
    if (evalWho.hfa && evalWho.hfa.tone !== 'ok') {
      cards.push({
        id: 'who-hfa',
        tone: evalWho.hfa.tone,
        title: `Tinggi ${latestGrowth.heightCm} cm · ${evalWho.hfa.status}`,
        detail: `Z-score TB/U ${evalWho.hfa.zScore} SD — pastikan protein & tidur cukup.`
      });
    }

    // Two consecutive stagnant/dropping weight entries check
    if (journal.growthLogs.length >= 2) {
      const curr = journal.growthLogs[0].weightKg;
      const prev = journal.growthLogs[1].weightKg;
      if (curr !== undefined && prev !== undefined && curr <= prev) {
        cards.push({
          id: 'weight-trend',
          tone: 'attention',
          title: 'Berat belum naik dari ukur sebelumnya',
          detail: 'Evaluasi nafsu makan/MPASI dan jadwalkan cek ke posyandu atau dokter.'
        });
      }
    }
  } else {
    cards.push({
      id: 'no-growth',
      tone: 'info',
      title: `Belum ada catatan berat ${childName}`,
      detail: 'Catat berat & tinggi terbaru untuk analisa otomatis kurva WHO.'
    });
  }

  // 2. Analyze KPSP screening result
  const latestKpsp = journal.kpspResults[0];
  if (latestKpsp) {
    if (latestKpsp.weakPillars.length > 0) {
      priorityPillar = latestKpsp.weakPillars[0];
    }
    cards.push({
      id: 'kpsp-latest',
      tone:
        latestKpsp.status === 'sesuai'
          ? 'ok'
          : latestKpsp.status === 'meragukan'
            ? 'info'
            : 'attention',
      title: `Skrining ${latestKpsp.checkpointMonths} Bln: ${
        latestKpsp.status === 'sesuai'
          ? 'Sesuai Usia'
          : latestKpsp.status === 'meragukan'
            ? 'Perlu Stimulasi Ulang'
            : 'Disarankan Konsultasi Dokter'
      }`,
      detail: `Skor ${latestKpsp.yesCount}/${latestKpsp.totalCount} jawaban Ya.`
    });
  } else {
    cards.push({
      id: 'kpsp-due',
      tone: 'info',
      title: 'Yuk cek skrining KPSP berkala',
      detail: '10 pertanyaan singkat Ya/Tidak untuk memetakan 4 aspek perkembangan.'
    });
  }

  // 3. Newborn tummy time reminder when under 6 months
  if ((ageBand === '0-3m' || ageBand === '3-6m') && progress.tummyTimeSeconds < 300) {
    cards.push({
      id: 'tummy-reminder',
      tone: 'info',
      title: `Tummy Time baru ${Math.round(progress.tummyTimeSeconds / 60)}/15 mnt`,
      detail: 'Cicil 1–3 menit saat bayi segar untuk menguatkan leher & bahu.'
    });
  }

  // Pick tailored mission & simulation module
  const ageMissions = STIMULATION_MISSIONS.filter((m) => m.ageBand === ageBand);
  const recommendedMission =
    (priorityPillar
      ? ageMissions.find((m) => m.pillar === priorityPillar && !progress.completedMissions.includes(m.id))
      : undefined) ??
    ageMissions.find((m) => !progress.completedMissions.includes(m.id)) ??
    ageMissions[0] ??
    STIMULATION_MISSIONS[0];

  const ageSims = SIMULATION_MODULES.filter((s) => s.ageBands.includes(ageBand));
  const recommendedSim =
    (priorityPillar ? ageSims.find((s) => s.pillar === priorityPillar) : undefined) ??
    (priorityPillar ? SIMULATION_MODULES.find((s) => s.pillar === priorityPillar) : undefined) ??
    ageSims[0] ??
    SIMULATION_MODULES[0];

  const hasAttention = cards.some((c) => c.tone === 'attention');
  const headline = hasAttention
    ? `Ada catatan penting untuk ${childName}`
    : cards[0]?.tone === 'ok'
      ? `Tumbuh kembang ${childName} terpantau baik`
      : `Siap pantau & stimulasi ${childName} hari ini`;

  return {
    headline,
    cards: cards.slice(0, 3),
    recommendedSim,
    recommendedMission,
    priorityPillar
  };
}
