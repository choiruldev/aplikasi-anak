import { lazy, Suspense, useCallback, useEffect, useState, type JSX } from 'react';
import { BookOpen, Gamepad2, Home, LineChart, Moon, Sun } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { BrandMark } from './components/Art.tsx';
import { ChildFocusShell } from './components/ChildFocusShell.tsx';
import { InstallModal } from './components/InstallModal.tsx';
import { LegalPrivacyModal } from './components/LegalPrivacyModal.tsx';
import { AvatarIcon } from './components/ModuleIcons.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import {
  ParentDrawer,
  type BeforeInstallPromptEvent
} from './components/ParentDrawer.tsx';
import { StickerAlbumModal } from './components/StickerAlbumModal.tsx';
import {
  AGE_PHASES,
  SIMULATION_MODULES,
  STIMULATION_MISSIONS,
  type SimulationKey
} from './data/stimulationData.ts';
import { setAudioPreferences, stopVoice, unlockAudio } from './lib/audio.ts';
import { addBabyCareEntry, deleteBabyCareEntry, type BabyCareType } from './lib/babyCareStorage.ts';
import {
  createBackupJson,
  getLastBackupDate,
  parseAndValidateBackup,
  recordBackupTimestamp
} from './lib/backup.ts';
import { isLullabyPlaying, startBgm, stopLullabyBgm } from './lib/bgm.ts';
import {
  computeAgeInfo,
  isModuleLockedByLimit,
  shouldCountScreenTime,
  type AgeBand
} from './lib/development.ts';
import {
  addDailyNote,
  addGrowthLog,
  addKpspResult,
  deleteDailyNote,
  deleteGrowthLog,
  toggleImmunization,
  toggleMilestone,
  toggleMpasiFood,
  toggleRoutineItem,
  toggleSavedTip
} from './lib/journalStorage.ts';
import {
  addProfile,
  clearAllCilukbaStorage,
  createInitialProfilesState,
  deleteProfile,
  getActiveProfile,
  loadProfilesState,
  rolloverProfilesIfNeeded,
  saveProfilesState,
  switchProfile,
  updateActiveProfile,
  updateActiveProfileSettings,
  type ProfileAvatarId,
  type ProfilesState
} from './lib/profilesStorage.ts';
import { computeStreakInfo } from './lib/stats.ts';
import { STICKER_META } from './lib/stickersMeta.ts';
import {
  recordActiveDate,
  rolloverIfNeeded,
  todayKey,
  toggleFavoriteModule,
  type AppSettings
} from './lib/storage.ts';
import { CatatanTab } from './tabs/CatatanTab.tsx';
import { SimulasiTab } from './tabs/SimulasiTab.tsx';
import { StimulasiTab } from './tabs/StimulasiTab.tsx';
import { TipsTab } from './tabs/TipsTab.tsx';

// Code-split 21 interactive modules for fast initial load (< 150 KB gzip)
const AlphabetGarden = lazy(() => import('./activities/AlphabetGarden.tsx').then((m) => ({ default: m.AlphabetGarden })));
const BabySoother = lazy(() => import('./activities/BabySoother.tsx').then((m) => ({ default: m.BabySoother })));
const BalloonCatch = lazy(() => import('./activities/BalloonCatch.tsx').then((m) => ({ default: m.BalloonCatch })));
const BodyEmotions = lazy(() => import('./activities/BodyEmotions.tsx').then((m) => ({ default: m.BodyEmotions })));
const BubblePopper = lazy(() => import('./activities/BubblePopper.tsx').then((m) => ({ default: m.BubblePopper })));
const ColorGarden = lazy(() => import('./activities/ColorGarden.tsx').then((m) => ({ default: m.ColorGarden })));
const ColoringBook = lazy(() => import('./activities/ColoringBook.tsx').then((m) => ({ default: m.ColoringBook })));
const FirstWords = lazy(() => import('./activities/FirstWords.tsx').then((m) => ({ default: m.FirstWords })));
const GoodHabits = lazy(() => import('./activities/GoodHabits.tsx').then((m) => ({ default: m.GoodHabits })));
const GrossMotorPlay = lazy(() => import('./activities/GrossMotorPlay.tsx').then((m) => ({ default: m.GrossMotorPlay })));
const HighContrastCards = lazy(() => import('./activities/HighContrastCards.tsx').then((m) => ({ default: m.HighContrastCards })));
const JigsawPuzzle = lazy(() => import('./activities/JigsawPuzzle.tsx').then((m) => ({ default: m.JigsawPuzzle })));
const MathPatterns = lazy(() => import('./activities/MathPatterns.tsx').then((m) => ({ default: m.MathPatterns })));
const NumberGarden = lazy(() => import('./activities/NumberGarden.tsx').then((m) => ({ default: m.NumberGarden })));
const PeekabooAnimals = lazy(() => import('./activities/PeekabooAnimals.tsx').then((m) => ({ default: m.PeekabooAnimals })));
const SensoryPlay = lazy(() => import('./activities/SensoryPlay.tsx').then((m) => ({ default: m.SensoryPlay })));
const ShapeSorter = lazy(() => import('./activities/ShapeSorter.tsx').then((m) => ({ default: m.ShapeSorter })));
const SizeSorter = lazy(() => import('./activities/SizeSorter.tsx').then((m) => ({ default: m.SizeSorter })));
const SyllableBuilder = lazy(() => import('./activities/SyllableBuilder.tsx').then((m) => ({ default: m.SyllableBuilder })));
const TraceCanvas = lazy(() => import('./activities/TraceCanvas.tsx').then((m) => ({ default: m.TraceCanvas })));
const TummyTimeGuide = lazy(() => import('./activities/TummyTimeGuide.tsx').then((m) => ({ default: m.TummyTimeGuide })));

type MainTab = 'stimulasi' | 'simulasi' | 'catatan' | 'tips';

const TAB_ITEMS: Array<{ id: MainTab; label: string }> = [
  { id: 'stimulasi', label: 'Beranda' },
  { id: 'simulasi', label: 'Belajar' },
  { id: 'catatan', label: 'Analisa' },
  { id: 'tips', label: 'Tips' }
];

function renderNavIcon(id: MainTab): JSX.Element {
  switch (id) {
    case 'stimulasi':
      return <Home size={20} strokeWidth={2.1} aria-hidden="true" />;
    case 'simulasi':
      return <Gamepad2 size={20} strokeWidth={2.1} aria-hidden="true" />;
    case 'catatan':
      return <LineChart size={20} strokeWidth={2.1} aria-hidden="true" />;
    case 'tips':
      return <BookOpen size={20} strokeWidth={2.1} aria-hidden="true" />;
  }
}

export function App(): JSX.Element {
  const [profilesState, setProfilesState] = useState<ProfilesState>(() => loadProfilesState());

  const [activeTab, setActiveTab] = useState<MainTab>('stimulasi');
  const [activeSimulation, setActiveSimulation] = useState<SimulationKey | null>(null);
  const [manualBandOverride, setManualBandOverride] = useState<AgeBand | null>(null);

  const [parentOpen, setParentOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => getLastBackupDate());

  const activeProfile = getActiveProfile(profilesState);
  const { settings, progress, journal, babyCare, avatarId } = activeProfile;

  const ageInfo = computeAgeInfo(settings.birthDate);
  const activeBand: AgeBand = manualBandOverride ?? ageInfo?.band ?? settings.ageBand;
  const activePhase = AGE_PHASES.find((p) => p.id === activeBand) ?? AGE_PHASES[3];
  const streakInfo = computeStreakInfo(progress.activeDates, todayKey());

  const isGameTimeUp =
    settings.dailyLimitMinutes > 0 &&
    progress.playedSeconds >= settings.dailyLimitMinutes * 60;
  const remainingSeconds =
    settings.dailyLimitMinutes > 0
      ? Math.max(0, settings.dailyLimitMinutes * 60 - progress.playedSeconds)
      : 0;

  const activeSimMeta = activeSimulation
    ? SIMULATION_MODULES.find((m) => m.key === activeSimulation) ?? null
    : null;

  useEffect(() => {
    saveProfilesState(profilesState);
  }, [profilesState]);

  useEffect(() => {
    setAudioPreferences(settings.soundEnabled, settings.voiceEnabled);
    document.documentElement.setAttribute('data-theme', settings.nightMode ? 'night' : 'light');
  }, [settings.soundEnabled, settings.voiceEnabled, settings.nightMode]);

  useEffect(() => {
    if (activeSimulation === 'baby-soother' || activeSimulation === 'motor') {
      return;
    }
    if (settings.bgmEnabled && activeSimulation !== null) {
      const mood = activeSimMeta?.isBabyTool ? 'lullaby' : 'playful';
      startBgm(mood);
    } else if (isLullabyPlaying()) {
      stopLullabyBgm();
    }
  }, [settings.bgmEnabled, activeSimulation, activeSimMeta]);

  useEffect(() => {
    const checkRollover = () => {
      setProfilesState((prev) => rolloverProfilesIfNeeded(prev, todayKey()));
    };
    const onVisChange = () => {
      if (document.visibilityState === 'visible') checkRollover();
    };
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('focus', checkRollover);
    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('focus', checkRollover);
    };
  }, []);

  useEffect(() => {
    if (!activeSimMeta) return;
    const modalOpen = parentOpen || installModalOpen || albumOpen || legalOpen;
    if (!shouldCountScreenTime(activeSimMeta.isBabyTool, isGameTimeUp, modalOpen)) {
      return;
    }

    const timerId = window.setInterval(() => {
      setProfilesState((prev) =>
        updateActiveProfile(prev, (p) => {
          const rolled = rolloverIfNeeded(p.progress, todayKey());
          return {
            ...p,
            progress: { ...rolled, playedSeconds: rolled.playedSeconds + 1 }
          };
        })
      );
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [activeSimMeta, isGameTimeUp, parentOpen, installModalOpen, albumOpen, legalOpen]);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsIos(isIosDevice && !isStandalone);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Ask browser to protect offline child data from automatic storage eviction
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      void navigator.storage.persist().catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const showRewardIfNewSticker = (prevStickers: string[], nextStickers: string[]) => {
    const newlyUnlocked = nextStickers.find((id) => !prevStickers.includes(id));
    if (newlyUnlocked) {
      const label = STICKER_META.find((s) => s.id === newlyUnlocked)?.label ?? 'Stiker Baru';
      toast.success(`Stiker terbuka: ${label}!`, {
        description: 'Lihat koleksi di Album Stiker.'
      });
    }
  };

  const handleUpdateSettings = (next: AppSettings, nextAvatarId?: ProfileAvatarId) => {
    setProfilesState((prev) => updateActiveProfileSettings(prev, next, nextAvatarId));
    if (next.birthDate !== settings.birthDate || next.ageBand !== settings.ageBand) {
      setManualBandOverride(null);
    }
  };

  const handleSelectBand = (band: AgeBand) => {
    setManualBandOverride(band);
    if (!settings.birthDate) {
      setProfilesState((prev) =>
        updateActiveProfile(prev, (p) => ({
          ...p,
          settings: { ...p.settings, ageBand: band }
        }))
      );
    }
  };

  const handleToggleMission = (missionId: string) => {
    const today = todayKey();
    setProfilesState((prev) =>
      updateActiveProfile(prev, (p) => {
        const rolled = rolloverIfNeeded(p.progress, today);
        const exists = rolled.completedMissions.includes(missionId);
        const nextMissions = exists
          ? rolled.completedMissions.filter((id) => id !== missionId)
          : [...rolled.completedMissions, missionId];
        const nextDates = !exists ? recordActiveDate(rolled.activeDates, today) : rolled.activeDates;
        const streakAfter = computeStreakInfo(nextDates, today).streakDays;
        let nextStickers = rolled.stickers;
        if (streakAfter >= 3 && !nextStickers.includes('sticker-streak')) {
          nextStickers = [...nextStickers, 'sticker-streak'];
        }
        return {
          ...p,
          progress: {
            ...rolled,
            completedMissions: nextMissions,
            activeDates: nextDates,
            stickers: nextStickers
          }
        };
      })
    );
  };

  const handleLaunchSimulation = (key: SimulationKey) => {
    const mod = SIMULATION_MODULES.find((m) => m.key === key);
    if (!mod) return;
    unlockAudio();
    if (isModuleLockedByLimit(mod.isBabyTool, isGameTimeUp)) {
      setParentOpen(true);
      return;
    }
    setActiveSimulation(key);
  };

  const handleExitSimulation = () => {
    stopVoice();
    if (isLullabyPlaying()) stopLullabyBgm();
    setActiveSimulation(null);
  };

  const handleActivityComplete = useCallback((key: SimulationKey, explicitStickerId?: string) => {
    const today = todayKey();
    const modSticker = SIMULATION_MODULES.find((m) => m.key === key)?.stickerId;
    const stickerId = explicitStickerId ?? modSticker;

    setProfilesState((prev) => {
      const current = getActiveProfile(prev);
      const prevStickers = current.progress.stickers;
      return updateActiveProfile(prev, (p) => {
        const rolled = rolloverIfNeeded(p.progress, today);
        const nextDates = recordActiveDate(rolled.activeDates, today);
        const streakDaysAfter = computeStreakInfo(nextDates, today).streakDays;

        let nextStickers =
          stickerId && !rolled.stickers.includes(stickerId)
            ? [...rolled.stickers, stickerId]
            : [...rolled.stickers];

        if (streakDaysAfter >= 3 && !nextStickers.includes('sticker-streak')) {
          nextStickers = [...nextStickers, 'sticker-streak'];
        }

        const linkedMissionIds = STIMULATION_MISSIONS.filter(
          (m) => m.linkedSimulation === key
        ).map((m) => m.id);

        showRewardIfNewSticker(prevStickers, nextStickers);

        return {
          ...p,
          progress: {
            ...rolled,
            stickers: nextStickers,
            activeDates: nextDates,
            completedCounts: {
              ...rolled.completedCounts,
              [key]: (rolled.completedCounts[key] ?? 0) + 1
            },
            playCounts: {
              ...rolled.playCounts,
              [key]: (rolled.playCounts[key] ?? 0) + 1
            },
            completedMissions: Array.from(new Set([...rolled.completedMissions, ...linkedMissionIds]))
          }
        };
      });
    });
  }, []);

  const handleAddTummySeconds = useCallback((secs: number) => {
    const today = todayKey();
    setProfilesState((prev) =>
      updateActiveProfile(prev, (p) => {
        const rolled = rolloverIfNeeded(p.progress, today);
        return {
          ...p,
          progress: {
            ...rolled,
            tummyTimeSeconds: rolled.tummyTimeSeconds + Math.max(0, Math.round(secs))
          }
        };
      })
    );
  }, []);

  const handleToggleFavorite = (key: SimulationKey) => {
    setProfilesState((prev) =>
      updateActiveProfile(prev, (p) => ({
        ...p,
        progress: toggleFavoriteModule(p.progress, key)
      }))
    );
  };

  const handleResetTimer = () => {
    setProfilesState((prev) =>
      updateActiveProfile(prev, (p) => ({
        ...p,
        progress: {
          ...rolloverIfNeeded(p.progress, todayKey()),
          playedSeconds: 0
        }
      }))
    );
  };

  const handleExportBackup = () => {
    const json = createBackupJson(profilesState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = todayKey();
    a.download = `cilukba-cadangan-${dateStr}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    recordBackupTimestamp(dateStr);
    setLastBackupDate(dateStr);
    toast.success('Cadangan JSON berhasil diunduh.');
  };

  const handleImportBackup = (rawJson: string): { ok: boolean; error?: string } => {
    const parsed = parseAndValidateBackup(rawJson, todayKey());
    if (!parsed.ok) return { ok: false, error: parsed.error };
    setProfilesState(parsed.state);
    setManualBandOverride(null);
    return { ok: true };
  };

  const handleDeleteAllData = () => {
    clearAllCilukbaStorage();
    setProfilesState(createInitialProfilesState(todayKey()));
    setLegalOpen(false);
    setParentOpen(false);
  };

  const renderSimulationModule = (key: SimulationKey): JSX.Element => {
    switch (key) {
      case 'high-contrast':
        return <HighContrastCards onComplete={() => handleActivityComplete('high-contrast')} />;
      case 'tummy-time':
        return (
          <TummyTimeGuide
            dailySeconds={progress.tummyTimeSeconds}
            onAddSeconds={handleAddTummySeconds}
            onComplete={() => handleActivityComplete('tummy-time')}
          />
        );
      case 'baby-soother':
        return <BabySoother onComplete={() => handleActivityComplete('baby-soother')} />;
      case 'peekaboo':
        return <PeekabooAnimals onComplete={(s) => handleActivityComplete('peekaboo', s)} />;
      case 'bubblepopper':
        return <BubblePopper onComplete={(s) => handleActivityComplete('bubblepopper', s)} />;
      case 'colors':
        return <ColorGarden onComplete={(s) => handleActivityComplete('colors', s)} />;
      case 'sensory':
        return <SensoryPlay onComplete={(s) => handleActivityComplete('sensory', s)} />;
      case 'numbers':
        return <NumberGarden onComplete={(s) => handleActivityComplete('numbers', s)} />;
      case 'alphabet':
        return <AlphabetGarden onComplete={(s) => handleActivityComplete('alphabet', s)} />;
      case 'shapes':
        return <ShapeSorter onComplete={(s) => handleActivityComplete('shapes', s)} />;
      case 'motor':
        return <GrossMotorPlay onComplete={(s) => handleActivityComplete('motor', s)} />;
      case 'trace':
        return <TraceCanvas onComplete={(s) => handleActivityComplete('trace', s)} />;
      case 'coloring':
        return <ColoringBook onComplete={(s) => handleActivityComplete('coloring', s)} />;
      case 'puzzle':
        return <JigsawPuzzle onComplete={(s) => handleActivityComplete('puzzle', s)} />;
      case 'balloon':
        return <BalloonCatch onComplete={(s) => handleActivityComplete('balloon', s)} />;
      case 'words':
        return <FirstWords onComplete={(s) => handleActivityComplete('words', s)} />;
      case 'body-emotions':
        return <BodyEmotions onComplete={(s) => handleActivityComplete('body-emotions', s)} />;
      case 'size-sort':
        return <SizeSorter onComplete={(s) => handleActivityComplete('size-sort', s)} />;
      case 'good-habits':
        return <GoodHabits onComplete={(s) => handleActivityComplete('good-habits', s)} />;
      case 'syllables':
        return <SyllableBuilder onComplete={(s) => handleActivityComplete('syllables', s)} />;
      case 'math-patterns':
        return <MathPatterns onComplete={(s) => handleActivityComplete('math-patterns', s)} />;
    }
  };

  const toasterEl = (
    <Toaster
      position="top-center"
      theme={settings.nightMode ? 'dark' : 'light'}
      richColors
      closeButton
      duration={3000}
      toastOptions={{
        style: {
          borderRadius: '18px',
          fontFamily: 'var(--font-body)'
        }
      }}
    />
  );

  if (activeSimulation && activeSimMeta) {
    return (
      <MotionConfig reducedMotion="user">
        {toasterEl}
        <ChildFocusShell
          moduleMeta={activeSimMeta}
          isTimeUp={isGameTimeUp}
          remainingSec={remainingSeconds}
          dailyLimitMinutes={settings.dailyLimitMinutes}
          bgmEnabled={settings.bgmEnabled}
          childLockExit={settings.childLockExit}
          toastMessage={null}
          onToggleBgm={() =>
            handleUpdateSettings({ ...settings, bgmEnabled: !settings.bgmEnabled })
          }
          onExit={handleExitSimulation}
          onRequestResetTimer={handleResetTimer}
        >
          <Suspense fallback={<div className="module-loading-fallback">Memuat modul...</div>}>
            {renderSimulationModule(activeSimulation)}
          </Suspense>
        </ChildFocusShell>
      </MotionConfig>
    );
  }

  const displayChildName = settings.childName.trim() || 'Adik';
  const profileChipLabel = ageInfo
    ? `${displayChildName} · ${ageInfo.label}`
    : `${displayChildName} · ${activePhase.shortLabel}`;

  return (
    <MotionConfig reducedMotion="user">
      {toasterEl}
      <div className="companion-shell">
        <header className="companion-topbar">
          <div className="brand-title-wrap">
            <BrandMark size={36} />
            <div className="brand-text-block">
              <span className="brand-name">Cilukba</span>
            </div>
          </div>

          <nav className="desktop-nav" aria-label="Navigasi utama">
            {TAB_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`desktop-nav-btn ${active ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-active-pill"
                      className="nav-active-pill-bg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="nav-btn-content">
                    {renderNavIcon(item.id)}
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="topbar-right-group">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              className={`icon-circle-btn ${settings.nightMode ? 'is-active' : ''}`}
              onClick={() => handleUpdateSettings({ ...settings, nightMode: !settings.nightMode })}
              aria-label={settings.nightMode ? 'Matikan mode malam' : 'Nyalakan mode malam'}
              title={settings.nightMode ? 'Mode Terang' : 'Mode Malam'}
            >
              {settings.nightMode ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              className="profile-chip"
              onClick={() => setParentOpen(true)}
              aria-label="Buka profil anak dan pengaturan"
            >
              <AvatarIcon avatarId={avatarId} size={22} />
              <span>{profileChipLabel}</span>
            </motion.button>
          </div>
        </header>

        <main className="companion-main">
          {isOffline && (
            <div className="offline-status-bar" role="status">
              Mode Offline aktif — seluruh catatan &amp; 21 permainan tetap berjalan lancar.
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {activeTab === 'stimulasi' && (
                <StimulasiTab
                  childName={displayChildName}
                  gender={settings.gender}
                  avatarId={avatarId}
                  ageInfo={ageInfo}
                  activeBand={activeBand}
                  streakDays={streakInfo.streakDays}
                  nightMode={settings.nightMode}
                  onSelectBand={handleSelectBand}
                  progress={progress}
                  babyCare={babyCare}
                  onToggleMission={handleToggleMission}
                  onToggleRoutine={(routineId) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: toggleRoutineItem(p.journal, todayKey(), routineId)
                      }))
                    )
                  }
                  journal={journal}
                  onOpenSimulation={handleLaunchSimulation}
                  onOpenProfile={() => setParentOpen(true)}
                  onOpenTabCatatan={() => setActiveTab('catatan')}
                />
              )}

              {activeTab === 'simulasi' && (
                <SimulasiTab
                  activeBand={activeBand}
                  isGameTimeUp={isGameTimeUp}
                  stickersCount={progress.stickers.length}
                  favoriteModules={progress.favoriteModules}
                  playCounts={progress.playCounts}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenStickerAlbum={() => setAlbumOpen(true)}
                  onLaunchSimulation={handleLaunchSimulation}
                  onOpenTimeLimitReset={() => setParentOpen(true)}
                />
              )}

              {activeTab === 'catatan' && (
                <CatatanTab
                  childName={displayChildName}
                  gender={settings.gender}
                  birthDate={settings.birthDate}
                  ageLabel={ageInfo?.label ?? activePhase.rangeLabel}
                  ageInfo={ageInfo}
                  activeBand={activeBand}
                  progress={progress}
                  stickersCount={progress.stickers.length}
                  streakDays={streakInfo.streakDays}
                  journal={journal}
                  babyCare={babyCare}
                  onToggleMilestone={(id) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({ ...p, journal: toggleMilestone(p.journal, id) }))
                    )
                  }
                  onToggleImmunization={(id) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: toggleImmunization(p.journal, id)
                      }))
                    )
                  }
                  onAddGrowth={(input) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: addGrowthLog(p.journal, input)
                      }))
                    )
                  }
                  onDeleteGrowth={(id) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: deleteGrowthLog(p.journal, id)
                      }))
                    )
                  }
                  onAddKpspResult={(input) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: addKpspResult(p.journal, input)
                      }))
                    )
                  }
                  onAddNote={(input) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: addDailyNote(p.journal, input)
                      }))
                    )
                  }
                  onDeleteNote={(id) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: deleteDailyNote(p.journal, id)
                      }))
                    )
                  }
                  onAddBabyCare={(type: BabyCareType) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        babyCare: addBabyCareEntry(p.babyCare, { type })
                      }))
                    )
                  }
                  onDeleteBabyCare={(id) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        babyCare: deleteBabyCareEntry(p.babyCare, id)
                      }))
                    )
                  }
                  onOpenSimulation={handleLaunchSimulation}
                  lastBackupDate={lastBackupDate}
                  onExportBackup={handleExportBackup}
                />
              )}

              {activeTab === 'tips' && (
                <TipsTab
                  activeBand={activeBand}
                  savedTipIds={journal.savedTipIds}
                  triedMpasiFoods={journal.triedMpasiFoods}
                  onToggleSaveTip={(tipId) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: toggleSavedTip(p.journal, tipId)
                      }))
                    )
                  }
                  onToggleMpasiFood={(foodId) =>
                    setProfilesState((prev) =>
                      updateActiveProfile(prev, (p) => ({
                        ...p,
                        journal: toggleMpasiFood(p.journal, foodId)
                      }))
                    )
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="public-trust-footer" aria-label="Informasi privasi dan pemasangan">
            <span>Cilukba · 100% Lokal &amp; Bebas Iklan</span>
            <div className="public-trust-links">
              <button type="button" className="text-action-btn" onClick={() => setLegalOpen(true)}>
                Privasi &amp; Rujukan WHO/KIA
              </button>
              <button type="button" className="text-action-btn" onClick={() => setInstallModalOpen(true)}>
                Pasang di HP
              </button>
            </div>
          </footer>
        </main>

        <nav className="mobile-bottom-nav" aria-label="Navigasi seluler">
          {TAB_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`bottom-nav-btn ${active ? 'is-active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active-pill"
                    className="mobile-nav-active-pill-bg"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <span className="mobile-nav-btn-content">
                  {renderNavIcon(item.id)}
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <OnboardingModal
          open={!settings.onboardingCompleted}
          initialSettings={settings}
          initialAvatarId={avatarId}
          onFinish={(nextSettings, nextAvatar) => {
            handleUpdateSettings(nextSettings, nextAvatar);
          }}
          onSkip={() => {
            handleUpdateSettings({ ...settings, onboardingCompleted: true });
          }}
        />

        <ParentDrawer
          open={parentOpen}
          onClose={() => setParentOpen(false)}
          profiles={profilesState.profiles}
          activeProfileId={profilesState.activeProfileId}
          activeAvatarId={avatarId}
          settings={settings}
          onSwitchProfile={(id) => {
            setProfilesState((prev) => switchProfile(prev, id));
            setManualBandOverride(null);
            const targetName = profilesState.profiles.find((p) => p.id === id)?.settings.childName;
            if (targetName) toast.success(`Beralih ke profil ${targetName}`);
          }}
          onAddProfile={(input) => {
            setProfilesState((prev) => addProfile(prev, input, todayKey()));
            setManualBandOverride(null);
            toast.success(`Profil ${input.childName} ditambahkan!`);
          }}
          onDeleteProfile={(id) => {
            setProfilesState((prev) => deleteProfile(prev, id));
            setManualBandOverride(null);
          }}
          onUpdateSettings={handleUpdateSettings}
          playedSeconds={progress.playedSeconds}
          isGameTimeUp={isGameTimeUp}
          onResetTimer={handleResetTimer}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onOpenLegalPrivacy={() => {
            setParentOpen(false);
            setLegalOpen(true);
          }}
          installEvent={installEvent}
          isIos={isIos}
          onOpenInstallGuide={() => setInstallModalOpen(true)}
        />

        <LegalPrivacyModal
          open={legalOpen}
          onClose={() => setLegalOpen(false)}
          onDeleteAllData={handleDeleteAllData}
        />

        <InstallModal
          isOpen={installModalOpen}
          onClose={() => setInstallModalOpen(false)}
          installEvent={installEvent}
          onTriggerInstall={() => {
            if (installEvent) {
              void installEvent.prompt();
              void installEvent.userChoice.then(() => setInstallEvent(null));
            }
            setInstallModalOpen(false);
          }}
          isIos={isIos}
        />

        {albumOpen && (
          <StickerAlbumModal
            unlockedStickers={progress.stickers}
            onClose={() => setAlbumOpen(false)}
          />
        )}
      </div>
    </MotionConfig>
  );
}

export default App;
