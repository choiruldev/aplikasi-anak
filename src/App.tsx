import { useCallback, useEffect, useState, type JSX } from 'react';
import { AlphabetGarden } from './activities/AlphabetGarden.tsx';
import { BabySoother } from './activities/BabySoother.tsx';
import { BalloonCatch } from './activities/BalloonCatch.tsx';
import { BubblePopper } from './activities/BubblePopper.tsx';
import { ColorGarden } from './activities/ColorGarden.tsx';
import { ColoringBook } from './activities/ColoringBook.tsx';
import { GrossMotorPlay } from './activities/GrossMotorPlay.tsx';
import { HighContrastCards } from './activities/HighContrastCards.tsx';
import { JigsawPuzzle } from './activities/JigsawPuzzle.tsx';
import { NumberGarden } from './activities/NumberGarden.tsx';
import { PeekabooAnimals } from './activities/PeekabooAnimals.tsx';
import { SensoryPlay } from './activities/SensoryPlay.tsx';
import { ShapeSorter } from './activities/ShapeSorter.tsx';
import { TraceCanvas } from './activities/TraceCanvas.tsx';
import { TummyTimeGuide } from './activities/TummyTimeGuide.tsx';
import { BrandMark } from './components/Art.tsx';
import { ChildFocusShell } from './components/ChildFocusShell.tsx';
import { InstallModal } from './components/InstallModal.tsx';
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
import { isLullabyPlaying, startLullabyBgm, stopLullabyBgm } from './lib/bgm.ts';
import {
  computeAgeInfo,
  isModuleLockedByLimit,
  shouldCountScreenTime,
  type AgeBand
} from './lib/development.ts';
import {
  addDailyNote,
  addGrowthLog,
  deleteDailyNote,
  deleteGrowthLog,
  loadJournal,
  saveJournal,
  toggleMilestone,
  toggleSavedTip,
  type JournalData,
  type NoteMood
} from './lib/journalStorage.ts';
import {
  loadProgress,
  loadSettings,
  rolloverIfNeeded,
  saveProgress,
  saveSettings,
  todayKey,
  type AppSettings,
  type DailyProgress
} from './lib/storage.ts';
import { CatatanTab } from './tabs/CatatanTab.tsx';
import { SimulasiTab } from './tabs/SimulasiTab.tsx';
import { StimulasiTab } from './tabs/StimulasiTab.tsx';
import { TipsTab } from './tabs/TipsTab.tsx';

type MainTab = 'stimulasi' | 'simulasi' | 'catatan' | 'tips';

const TAB_ITEMS: Array<{ id: MainTab; label: string; shortDesc: string }> = [
  { id: 'stimulasi', label: 'Stimulasi', shortDesc: 'Misi harian' },
  { id: 'simulasi', label: 'Simulasi', shortDesc: '15 modul' },
  { id: 'catatan', label: 'Catatan', shortDesc: 'Jurnal anak' },
  { id: 'tips', label: 'Tips', shortDesc: 'Info Gen Z' }
];

function renderNavIcon(id: MainTab): JSX.Element {
  switch (id) {
    case 'stimulasi':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20V10" />
          <path d="M12 14c-3.5 0-6-2.2-6-6 3.5 0 6 2.2 6 6Z" />
          <path d="M12 11c3.5 0 6-2.2 6-6-3.5 0-6 2.2-6 6Z" />
        </svg>
      );
    case 'simulasi':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      );
    case 'catatan':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'tips':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      );
  }
}

export function App(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [progress, setProgress] = useState<DailyProgress>(() => loadProgress());
  const [journal, setJournal] = useState<JournalData>(() => loadJournal());

  const [activeTab, setActiveTab] = useState<MainTab>('stimulasi');
  const [activeSimulation, setActiveSimulation] = useState<SimulationKey | null>(null);
  const [manualBandOverride, setManualBandOverride] = useState<AgeBand | null>(null);

  const [parentOpen, setParentOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

  const ageInfo = computeAgeInfo(settings.birthDate);
  const activeBand: AgeBand = manualBandOverride ?? ageInfo?.band ?? settings.ageBand;
  const activePhase = AGE_PHASES.find((p) => p.id === activeBand) ?? AGE_PHASES[3];

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
    saveSettings(settings);
    setAudioPreferences(settings.soundEnabled, settings.voiceEnabled);
  }, [settings]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveJournal(journal);
  }, [journal]);

  // Ambient BGM plays only when enabled and inside a non-soother simulation
  useEffect(() => {
    if (
      settings.bgmEnabled &&
      activeSimulation !== null &&
      activeSimulation !== 'baby-soother'
    ) {
      if (!isLullabyPlaying()) startLullabyBgm();
    } else if (activeSimulation !== 'baby-soother') {
      if (isLullabyPlaying()) stopLullabyBgm();
    }
  }, [settings.bgmEnabled, activeSimulation]);

  // Live calendar rollover check when app regains focus/visibility
  useEffect(() => {
    const checkRollover = () => {
      setProgress((prev) => rolloverIfNeeded(prev, todayKey()));
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

  // Screen-time counter ticks strictly for 1-5y toddler simulation games
  useEffect(() => {
    if (!activeSimMeta) return;
    const modalOpen = parentOpen || installModalOpen || albumOpen;
    if (!shouldCountScreenTime(activeSimMeta.isBabyTool, isGameTimeUp, modalOpen)) {
      return;
    }

    const timerId = window.setInterval(() => {
      setProgress((prev) => {
        const rolled = rolloverIfNeeded(prev, todayKey());
        return {
          ...rolled,
          playedSeconds: rolled.playedSeconds + 1
        };
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [activeSimMeta, isGameTimeUp, parentOpen, installModalOpen, albumOpen]);

  // PWA install event detection
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
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleUpdateSettings = (next: AppSettings) => {
    setSettings(next);
    // Reset preview phase override if user explicitly changed birthDate or manual band
    if (next.birthDate !== settings.birthDate || next.ageBand !== settings.ageBand) {
      setManualBandOverride(null);
    }
  };

  const handleSelectBand = (band: AgeBand) => {
    setManualBandOverride(band);
    if (!settings.birthDate) {
      setSettings((prev) => ({ ...prev, ageBand: band }));
    }
  };

  const handleToggleMission = (missionId: string) => {
    setProgress((prev) => {
      const rolled = rolloverIfNeeded(prev, todayKey());
      const exists = rolled.completedMissions.includes(missionId);
      return {
        ...rolled,
        completedMissions: exists
          ? rolled.completedMissions.filter((id) => id !== missionId)
          : [...rolled.completedMissions, missionId]
      };
    });
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

  const handleActivityComplete = useCallback((key: SimulationKey, stickerId?: string) => {
    setProgress((prev) => {
      const rolled = rolloverIfNeeded(prev, todayKey());
      const nextStickers =
        stickerId && !rolled.stickers.includes(stickerId)
          ? [...rolled.stickers, stickerId]
          : rolled.stickers;

      const linkedMissionIds = STIMULATION_MISSIONS.filter(
        (m) => m.linkedSimulation === key
      ).map((m) => m.id);
      const nextMissions = Array.from(new Set([...rolled.completedMissions, ...linkedMissionIds]));

      return {
        ...rolled,
        stickers: nextStickers,
        completedCounts: {
          ...rolled.completedCounts,
          [key]: (rolled.completedCounts[key] ?? 0) + 1
        },
        completedMissions: nextMissions
      };
    });
  }, []);

  const handleResetTimer = () => {
    setProgress((prev) => {
      const rolled = rolloverIfNeeded(prev, todayKey());
      return { ...rolled, playedSeconds: 0 };
    });
  };

  const handleToggleMilestone = (milestoneId: string) => {
    setJournal((prev) => toggleMilestone(prev, milestoneId));
  };

  const handleAddGrowth = (input: {
    date: string;
    weightKg?: number;
    heightCm?: number;
    note?: string;
  }) => {
    setJournal((prev) => addGrowthLog(prev, input));
  };

  const handleDeleteGrowth = (id: string) => {
    setJournal((prev) => deleteGrowthLog(prev, id));
  };

  const handleAddNote = (input: { date: string; mood: NoteMood; text: string }) => {
    setJournal((prev) => addDailyNote(prev, input));
  };

  const handleDeleteNote = (id: string) => {
    setJournal((prev) => deleteDailyNote(prev, id));
  };

  const handleToggleSaveTip = (tipId: string) => {
    setJournal((prev) => toggleSavedTip(prev, tipId));
  };

  const renderSimulationModule = (key: SimulationKey): JSX.Element => {
    switch (key) {
      case 'high-contrast':
        return <HighContrastCards onComplete={() => handleActivityComplete('high-contrast')} />;
      case 'tummy-time':
        return <TummyTimeGuide onComplete={() => handleActivityComplete('tummy-time')} />;
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
    }
  };

  if (activeSimulation && activeSimMeta) {
    return (
      <ChildFocusShell
        moduleMeta={activeSimMeta}
        isTimeUp={isGameTimeUp}
        remainingSec={remainingSeconds}
        dailyLimitMinutes={settings.dailyLimitMinutes}
        bgmEnabled={settings.bgmEnabled}
        childLockExit={settings.childLockExit}
        onToggleBgm={() =>
          setSettings((prev) => ({ ...prev, bgmEnabled: !prev.bgmEnabled }))
        }
        onExit={handleExitSimulation}
        onRequestResetTimer={handleResetTimer}
      >
        {renderSimulationModule(activeSimulation)}
      </ChildFocusShell>
    );
  }

  const displayChildName = settings.childName.trim() || 'Adik';
  const profileChipLabel = ageInfo
    ? `${displayChildName} · ${ageInfo.label}`
    : `${displayChildName} · ${activePhase.shortLabel}`;

  return (
    <div className="companion-shell">
      <header className="companion-topbar">
        <div className="brand-title-wrap">
          <BrandMark size={38} />
          <div className="brand-text-block">
            <span className="brand-name">Cilukba</span>
            <span className="brand-tagline">Tumbuh Kembang & Simulasi 0–5 Thn</span>
          </div>
        </div>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`desktop-nav-btn ${activeTab === item.id ? 'is-active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              {renderNavIcon(item.id)}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="profile-chip"
          onClick={() => setParentOpen(true)}
          aria-label="Buka profil anak dan pengaturan"
        >
          <span>{profileChipLabel}</span>
          <span className="chip-caret" aria-hidden="true">⚙</span>
        </button>
      </header>

      <main className="companion-main">
        {activeTab === 'stimulasi' && (
          <StimulasiTab
            childName={displayChildName}
            ageInfo={ageInfo}
            activeBand={activeBand}
            onSelectBand={handleSelectBand}
            completedMissions={progress.completedMissions}
            onToggleMission={handleToggleMission}
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
            onOpenStickerAlbum={() => setAlbumOpen(true)}
            onLaunchSimulation={handleLaunchSimulation}
            onOpenTimeLimitReset={() => setParentOpen(true)}
          />
        )}

        {activeTab === 'catatan' && (
          <CatatanTab
            childName={displayChildName}
            ageLabel={ageInfo?.label ?? activePhase.rangeLabel}
            activeBand={activeBand}
            journal={journal}
            onToggleMilestone={handleToggleMilestone}
            onAddGrowth={handleAddGrowth}
            onDeleteGrowth={handleDeleteGrowth}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeTab === 'tips' && (
          <TipsTab
            savedTipIds={journal.savedTipIds}
            onToggleSaveTip={handleToggleSaveTip}
          />
        )}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navigasi seluler">
        {TAB_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-btn ${activeTab === item.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {renderNavIcon(item.id)}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ParentDrawer
        open={parentOpen}
        onClose={() => setParentOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        playedSeconds={progress.playedSeconds}
        isGameTimeUp={isGameTimeUp}
        onResetTimer={handleResetTimer}
        installEvent={installEvent}
        isIos={isIos}
        onOpenInstallGuide={() => setInstallModalOpen(true)}
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
  );
}

export default App;
