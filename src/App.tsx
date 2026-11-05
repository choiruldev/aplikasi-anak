import { useEffect, useState, type JSX } from 'react';
import { BalloonCatch } from './activities/BalloonCatch';
import { ColoringBook } from './activities/ColoringBook';
import { GrossMotorPlay } from './activities/GrossMotorPlay';
import { JigsawPuzzle } from './activities/JigsawPuzzle';
import { SensoryPlay } from './activities/SensoryPlay';
import { ShapeSorter } from './activities/ShapeSorter';
import { TraceCanvas } from './activities/TraceCanvas';
import {
  ActionPoseIllustration,
  AnimalIllustration,
  BrandMark,
  IconBalloon,
  IconDownload,
  IconHome,
  IconLock,
  IconPalette,
  IconPuzzle,
  IconStar,
  ShapeGlyph
} from './components/Art';
import { InstallModal } from './components/InstallModal';
import { ParentDrawer, type BeforeInstallPromptEvent } from './components/ParentDrawer';
import { playGentlePop, setAudioPreferences, stopVoice, unlockAudio } from './lib/audio';
import { formatRemainingSeconds } from './lib/geometry';
import {
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
  type AgeFilter,
  type AppSettings,
  type DailyProgress
} from './lib/storage';

type ActivityKey = 'sensory' | 'shapes' | 'trace' | 'motor' | 'coloring' | 'puzzle' | 'balloon';

interface ActivityMeta {
  key: ActivityKey;
  title: string;
  subtitle: string;
  ageTag: string;
  ageGroup: Exclude<AgeFilter, 'all'>[];
  skillTag: string;
  stickerId: string;
  surfaceTint: string;
}

const ACTIVITIES: ActivityMeta[] = [
  {
    key: 'sensory',
    title: 'Kenal Suara & Warna',
    subtitle: 'Sentuh hewan lucu dan mainkan gambang warna Do-Re-Mi.',
    ageTag: '1 – 2,5 thn',
    ageGroup: ['1-2.5'],
    skillTag: 'Bahasa & Sensori',
    stickerId: 'sticker-sensory',
    surfaceTint: '#FCEEE6'
  },
  {
    key: 'shapes',
    title: 'Pasang Bentuk Kayu',
    subtitle: 'Geser kepingan bentuk ke lubang bayangan yang cocok.',
    ageTag: '2,5 – 4 thn',
    ageGroup: ['2.5-4'],
    skillTag: 'Motorik Halus',
    stickerId: 'sticker-shapes',
    surfaceTint: '#E6F0EC'
  },
  {
    key: 'trace',
    title: 'Jejak Jari & Huruf',
    subtitle: 'Tebalkan garis, huruf A-I-U, dan angka 1-2-3 dengan telunjuk.',
    ageTag: '3,5 – 5 thn',
    ageGroup: ['2.5-4', '4-5'],
    skillTag: 'Pra-Tulis & Presisi',
    stickerId: 'sticker-trace',
    surfaceTint: '#FBF1D8'
  },
  {
    key: 'motor',
    title: 'Ayo Gerak Aktif!',
    subtitle: 'Lompat kelinci, pesawat seimbang, dan main patung musik.',
    ageTag: '2 – 5 thn',
    ageGroup: ['1-2.5', '2.5-4', '4-5'],
    skillTag: 'Motorik Kasar',
    stickerId: 'sticker-motor',
    surfaceTint: '#E3EEF7'
  },
  {
    key: 'coloring',
    title: 'Buku Warna & Gambar Musik',
    subtitle: 'Warnai apel dan kupu-kupu lucu atau goreskan lukisan bunyi.',
    ageTag: '2 – 4,5 thn',
    ageGroup: ['1-2.5', '2.5-4'],
    skillTag: 'Kreativitas & Nada',
    stickerId: 'sticker-coloring',
    surfaceTint: '#FBF0E4'
  },
  {
    key: 'puzzle',
    title: 'Puzzle Keping Bergambar',
    subtitle: 'Pasang 4 keping gambar kucing, gajah, dan semangka manis.',
    ageTag: '2,5 – 5 thn',
    ageGroup: ['2.5-4', '4-5'],
    skillTag: 'Visual & Spasial',
    stickerId: 'sticker-puzzle',
    surfaceTint: '#E8F3EB'
  },
  {
    key: 'balloon',
    title: 'Tangkap Balon Ceria',
    subtitle: 'Lambaikan tangan di depan kamera atau ketuk layar untuk pecahkan balon.',
    ageTag: '1,5 – 5 thn',
    ageGroup: ['1-2.5', '2.5-4', '4-5'],
    skillTag: 'Motorik Kasar & Kamera',
    stickerId: 'sticker-balloon',
    surfaceTint: '#EAEBFA'
  }
];

const AGE_FILTERS: { id: AgeFilter; label: string }[] = [
  { id: 'all', label: 'Semua Usia (1–5 thn)' },
  { id: '1-2.5', label: '1 – 2,5 thn' },
  { id: '2.5-4', label: '2,5 – 4 thn' },
  { id: '4-5', label: '4 – 5 thn' }
];

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMedia = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const isIosStandalone = (window.navigator as unknown as { standalone?: boolean })?.standalone === true;
  return Boolean(isStandaloneMedia || isIosStandalone);
}

export function App(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [progress, setProgress] = useState<DailyProgress>(() => loadProgress());
  const [activeGame, setActiveGame] = useState<ActivityKey | null>(null);
  const [parentOpen, setParentOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [bannerSticker, setBannerSticker] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => checkIsStandalone());
  const [isIos, setIsIos] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  useEffect(() => {
    setAudioPreferences(settings.soundEnabled, settings.voiceEnabled);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Detect standalone / PWA mode and iOS device
  useEffect(() => {
    setIsStandalone(checkIsStandalone());

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice =
      /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(iosDevice);

    try {
      if (sessionStorage.getItem('pwa_banner_dismissed') === '1') {
        setBannerDismissed(true);
      }
    } catch {}

    const mql = window.matchMedia('(display-mode: standalone)');
    const onChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Capture Android/Desktop PWA install prompt
  useEffect(() => {
    function onBeforeInstall(e: Event): void {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function handleTriggerInstall(): void {
    if (installEvent) {
      void installEvent.prompt().then(() => {
        return installEvent.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            setInstallEvent(null);
          }
        });
      });
    } else {
      setInstallModalOpen(true);
    }
  }

  // Screen-time ticker when page is visible and parent modal isn't open
  const isTimeUp =
    settings.dailyLimitMinutes > 0 && progress.playedSeconds >= settings.dailyLimitMinutes * 60;

  useEffect(() => {
    if (isTimeUp || parentOpen) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setProgress((prev) => ({ ...prev, playedSeconds: prev.playedSeconds + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isTimeUp, parentOpen]);

  function handleActivityComplete(activityKey: ActivityKey, stickerId: string): void {
    setProgress((prev) => {
      const hasSticker = prev.stickers.includes(stickerId);
      const nextStickers = hasSticker ? prev.stickers : [...prev.stickers, stickerId];
      if (!hasSticker) {
        setBannerSticker(stickerId);
        window.setTimeout(() => setBannerSticker(null), 3200);
      }
      return {
        ...prev,
        stickers: nextStickers,
        completedCounts: {
          ...prev.completedCounts,
          [activityKey]: (prev.completedCounts[activityKey] ?? 0) + 1
        }
      };
    });
  }

  const remainingSec =
    settings.dailyLimitMinutes > 0
      ? Math.max(0, settings.dailyLimitMinutes * 60 - progress.playedSeconds)
      : null;

  const visibleActivities =
    settings.ageFilter === 'all'
      ? ACTIVITIES
      : ACTIVITIES.filter((a) => a.ageGroup.includes(settings.ageFilter as Exclude<AgeFilter, 'all'>));

  return (
    <div
      className="app-shell"
      onPointerDown={() => unlockAudio()}
      onClick={() => unlockAudio()}
    >
      <header className="topbar">
        <div className="brand-cluster">
          {activeGame ? (
            <button
              type="button"
              className="home-pill-btn"
              onClick={() => {
                stopVoice();
                playGentlePop();
                setActiveGame(null);
              }}
            >
              <IconHome size={22} />
              <span>Beranda</span>
            </button>
          ) : (
            <div className="brand-title-wrap">
              <BrandMark size={40} />
              <div>
                <span className="brand-name">KecilMain</span>
                <span className="brand-tagline">Belajar &amp; Gerak Balita</span>
              </div>
            </div>
          )}
        </div>

        <div className="topbar-right">
          <div className="sticker-pill" aria-label={`${progress.stickers.length} dari 7 bintang stiker terkumpul`}>
            <IconStar size={20} filled />
            <span>{progress.stickers.length} / 7</span>
          </div>

          {remainingSec !== null && (
            <div className="timer-pill" title="Sisa waktu bermain hari ini">
              <span>{formatRemainingSeconds(remainingSec)}</span>
            </div>
          )}

          {!isStandalone && (
            <button
              type="button"
              className="install-pill-btn"
              onClick={handleTriggerInstall}
              aria-label="Pasang Aplikasi ke Layar Utama"
            >
              <IconDownload size={16} />
              <span>Pasang</span>
            </button>
          )}

          <button
            type="button"
            className="parent-btn"
            onClick={() => setParentOpen(true)}
            aria-label="Pengaturan Orang Tua"
          >
            <IconLock size={18} />
            <span>Orang Tua</span>
          </button>
        </div>
      </header>

      {bannerSticker && (
        <div className="reward-toast" role="status">
          <IconStar size={24} filled />
          <span>Bintang Stiker Baru Terkumpul! Hebat, {settings.childName}!</span>
        </div>
      )}

      {isTimeUp ? (
        <main className="rest-screen">
          <div className="rest-card">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
              <circle cx="48" cy="48" r="42" fill="#233732" />
              <path
                d="M58 24C44 26 34 38 36 52C38 66 50 74 64 70C53 76 38 72 31 60C24 48 28 32 40 25C46 22 52 22 58 24Z"
                fill="#E89F1C"
              />
              <circle cx="64" cy="34" r="3" fill="#F5F7F2" />
              <circle cx="72" cy="48" r="2.2" fill="#F5F7F2" />
            </svg>
            <h1 className="rest-title">Waktunya Istirahat Mata, {settings.childName}</h1>
            <p className="rest-body">
              Waktu bermain layar hari ini ({settings.dailyLimitMinutes} menit) sudah selesai. Ayo minum air putih dan bermain di luar bersama Ayah atau Ibu!
            </p>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setParentOpen(true)}
            >
              Pengaturan Orang Tua
            </button>
          </div>
        </main>
      ) : activeGame === null ? (
        <main className="home-main">
          {!isStandalone && !bannerDismissed && (
            <section className="pwa-install-banner" aria-label="Saran Pasang Aplikasi">
              <div className="pwa-banner-left">
                <span className="pwa-banner-emoji" aria-hidden="true">📲</span>
                <div className="pwa-banner-text">
                  <strong className="pwa-banner-title">Pasang KecilMain di Layar Utama HP</strong>
                  <span className="pwa-banner-desc">
                    Main lancar offline tanpa kuota &amp; layar penuh tanpa gangguan bilah browser.
                  </span>
                </div>
              </div>
              <div className="pwa-banner-actions">
                <button
                  type="button"
                  className="pwa-banner-install-btn"
                  onClick={handleTriggerInstall}
                >
                  <IconDownload size={16} />
                  <span>{installEvent ? 'Pasang Sekarang' : 'Cara Pasang'}</span>
                </button>
                <button
                  type="button"
                  className="pwa-banner-dismiss-btn"
                  aria-label="Tutup saran pemasangan"
                  onClick={() => {
                    setBannerDismissed(true);
                    try {
                      sessionStorage.setItem('pwa_banner_dismissed', '1');
                    } catch {}
                  }}
                >
                  ✕
                </button>
              </div>
            </section>
          )}

          <section className="welcome-band" aria-labelledby="home-heading">
            <div>
              <h1 id="home-heading" className="home-heading">
                Halo, {settings.childName}! Mau main apa hari ini?
              </h1>
              <p className="home-lead">
                Pilih permainan suara, bentuk kayu, jejak huruf, atau tantangan gerak tubuh.
              </p>
            </div>

            <div className="age-filter-bar" role="tablist" aria-label="Saring berdasarkan usia balita">
              {AGE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={settings.ageFilter === f.id}
                  className={`age-pill ${settings.ageFilter === f.id ? 'is-active' : ''}`}
                  onClick={() => {
                    playGentlePop();
                    setSettings((prev) => ({ ...prev, ageFilter: f.id }));
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="activity-grid" aria-label="Daftar aktivitas belajar dan motorik">
            {visibleActivities.map((act) => {
              const earned = progress.stickers.includes(act.stickerId);
              return (
                <button
                  key={act.key}
                  type="button"
                  className="activity-card"
                  style={{ backgroundColor: act.surfaceTint }}
                  onClick={() => {
                    playGentlePop();
                    setActiveGame(act.key);
                  }}
                >
                  <div className="activity-card-art">
                    {act.key === 'sensory' && <AnimalIllustration id="duck" size={96} />}
                    {act.key === 'shapes' && <ShapeGlyph shape="star" fill="#2B9361" size={88} />}
                    {act.key === 'trace' && (
                      <div className="trace-preview-glyph" aria-hidden="true">Aa</div>
                    )}
                    {act.key === 'motor' && <ActionPoseIllustration pose="bunny" active={false} />}
                    {act.key === 'coloring' && <IconPalette size={84} />}
                    {act.key === 'puzzle' && <IconPuzzle size={84} />}
                    {act.key === 'balloon' && <IconBalloon size={84} />}
                  </div>

                  <div className="activity-card-body">
                    <div className="activity-meta-row">
                      <span className="meta-pill">{act.ageTag}</span>
                      <span className="meta-skill">{act.skillTag}</span>
                      {earned && <IconStar size={20} filled />}
                    </div>
                    <h2 className="activity-card-title">{act.title}</h2>
                    <p className="activity-card-desc">{act.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </section>
        </main>
      ) : (
        <main className="game-main">
          {activeGame === 'sensory' && (
            <SensoryPlay onComplete={(s) => handleActivityComplete('sensory', s)} />
          )}
          {activeGame === 'shapes' && (
            <ShapeSorter onComplete={(s) => handleActivityComplete('shapes', s)} />
          )}
          {activeGame === 'trace' && (
            <TraceCanvas onComplete={(s) => handleActivityComplete('trace', s)} />
          )}
          {activeGame === 'motor' && (
            <GrossMotorPlay onComplete={(s) => handleActivityComplete('motor', s)} />
          )}
          {activeGame === 'coloring' && (
            <ColoringBook onComplete={(s) => handleActivityComplete('coloring', s)} />
          )}
          {activeGame === 'puzzle' && (
            <JigsawPuzzle onComplete={(s) => handleActivityComplete('puzzle', s)} />
          )}
          {activeGame === 'balloon' && (
            <BalloonCatch onComplete={(s) => handleActivityComplete('balloon', s)} />
          )}
        </main>
      )}

      {parentOpen && (
        <ParentDrawer
          settings={settings}
          progress={progress}
          installEvent={installEvent}
          isStandalone={isStandalone}
          isIos={isIos}
          onUpdateSettings={setSettings}
          onResetTodayTimer={() => setProgress((prev) => ({ ...prev, playedSeconds: 0 }))}
          onTriggerInstall={() => {
            if (!installEvent) return;
            void installEvent.prompt().then(() => setInstallEvent(null));
          }}
          onOpenInstallGuide={() => setInstallModalOpen(true)}
          onClose={() => setParentOpen(false)}
        />
      )}

      <InstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        installEvent={installEvent}
        onTriggerInstall={() => {
          if (!installEvent) return;
          void installEvent.prompt().then(() => setInstallEvent(null));
        }}
        isIos={isIos}
      />
    </div>
  );
}
