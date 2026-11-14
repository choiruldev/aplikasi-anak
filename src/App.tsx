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
import { AvatarIcon, MoonIcon } from './components/ModuleIcons.tsx';
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
import { createBackupJson, parseAndValidateBackup } from './lib/backup.ts';
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
  toggleImmunization,
  toggleMilestone,
  toggleRoutineItem,
  toggleSavedTip
} from './lib/journalStorage.ts';
import {
  addProfile,
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

type MainTab = 'stimulasi' | 'simulasi' | 'catatan' | 'tips';

const TAB_ITEMS: Array<{ id: MainTab; label: string }> = [
  { id: 'stimulasi', label: 'Stimulasi' },
  { id: 'simulasi', label: 'Simulasi' },
  { id: 'catatan', label: 'Catatan' },
  { id: 'tips', label: 'Tips' }
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
  const [profilesState, setProfilesState] = useState<ProfilesState>(() => loadProfilesState());

  const [activeTab, setActiveTab] = useState<MainTab>('stimulasi');
  const [activeSimulation, setActiveSimulation] = useState<SimulationKey | null>(null);
  const [manualBandOverride, setManualBandOverride] = useState<AgeBand | null>(null);

  const [parentOpen, setParentOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

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
    if (!toastMessage) return;
    const id = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(id);
  }, [toastMessage]);

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

  // Screen-time counter ticks strictly for 1-5y toddler simulation games
  useEffect(() => {
    if (!activeSimMeta) return;
    const modalOpen = parentOpen || installModalOpen || albumOpen;
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

  const showRewardIfNewSticker = (prevStickers: string[], nextStickers: string[]) => {
    const newlyUnlocked = nextStickers.find((id) => !prevStickers.includes(id));
    if (newlyUnlocked) {
      const label = STICKER_META.find((s) => s.id === newlyUnlocked)?.label ?? 'Stiker Baru';
      setToastMessage(`Stiker terbuka: ${label}!`);
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
      const updatedState = updateActiveProfile(prev, (p) => {
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
      return updatedState;
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
    a.download = `cilukba-cadangan-${todayKey()}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportBackup = (rawJson: string): { ok: boolean; error?: string } => {
    const parsed = parseAndValidateBackup(rawJson, todayKey());
    if (!parsed.ok) return { ok: false, error: parsed.error };
    setProfilesState(parsed.state);
    setManualBandOverride(null);
    return { ok: true };
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
        toastMessage={toastMessage}
        onToggleBgm={() =>
          handleUpdateSettings({ ...settings, bgmEnabled: !settings.bgmEnabled })
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
          <BrandMark size={36} />
          <div className="brand-text-block">
            <span className="brand-name">Cilukba</span>
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

        <div className="topbar-right-group">
          <button
            type="button"
            className={`icon-circle-btn ${settings.nightMode ? 'is-active' : ''}`}
            onClick={() => handleUpdateSettings({ ...settings, nightMode: !settings.nightMode })}
            aria-label={settings.nightMode ? 'Matikan mode malam' : 'Nyalakan mode malam'}
            title="Mode Malam"
          >
            <MoonIcon size={16} />
          </button>

          <button
            type="button"
            className="profile-chip"
            onClick={() => setParentOpen(true)}
            aria-label="Buka profil anak dan pengaturan"
          >
            <AvatarIcon avatarId={avatarId} size={22} />
            <span>{profileChipLabel}</span>
          </button>
        </div>
      </header>

      <main className="companion-main">
        {activeTab === 'stimulasi' && (
          <StimulasiTab
            childName={displayChildName}
            avatarId={avatarId}
            ageInfo={ageInfo}
            activeBand={activeBand}
            streakDays={streakInfo.streakDays}
            onSelectBand={handleSelectBand}
            progress={progress}
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
            ageLabel={ageInfo?.label ?? activePhase.rangeLabel}
            ageInfo={ageInfo}
            activeBand={activeBand}
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
          />
        )}

        {activeTab === 'tips' && (
          <TipsTab
            activeBand={activeBand}
            savedTipIds={journal.savedTipIds}
            onToggleSaveTip={(tipId) =>
              setProfilesState((prev) =>
                updateActiveProfile(prev, (p) => ({
                  ...p,
                  journal: toggleSavedTip(p.journal, tipId)
                }))
              )
            }
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
        profiles={profilesState.profiles}
        activeProfileId={profilesState.activeProfileId}
        activeAvatarId={avatarId}
        settings={settings}
        onSwitchProfile={(id) => {
          setProfilesState((prev) => switchProfile(prev, id));
          setManualBandOverride(null);
        }}
        onAddProfile={(input) => {
          setProfilesState((prev) => addProfile(prev, input, todayKey()));
          setManualBandOverride(null);
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
