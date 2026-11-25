import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconCamera, IconSpeaker, VisualStarMeter } from '../components/Art.tsx';
import {
  playBubblePop,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  speakPhrase,
  stopVoice
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface BalloonColorDef {
  id: string;
  name: string;
  hex: string;
  note: number;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  speed: number;
  colorDef: BalloonColorDef;
  size: number;
  popped: boolean;
}

const BALLOON_COLORS: BalloonColorDef[] = [
  { id: 'merah', name: 'Merah', hex: '#E53935', note: 261.63 },
  { id: 'kuning', name: 'Kuning', hex: '#F7B731', note: 329.63 },
  { id: 'hijau', name: 'Hijau', hex: '#2B9361', note: 349.23 },
  { id: 'biru', name: 'Biru', hex: '#1E88E5', note: 392.0 }
];

const TARGET_HITS = 6;

export function BalloonCatch({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [missionColorIdx, setMissionColorIdx] = useState(0);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hitCount, setHitCount] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [status, setStatus] = useState('Tangkap balon sesuai warna target!');

  const targetColor = BALLOON_COLORS[missionColorIdx % BALLOON_COLORS.length];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameData = useRef<Uint8ClampedArray | null>(null);
  const animFrameId = useRef<number | null>(null);
  const balloonIdCounter = useRef(0);
  const balloonsRef = useRef<Balloon[]>([]);

  useEffect(() => {
    preloadVoices(['balloon-intro', 'balloon-camera-on', 'balloon-touch-mode', 'balloon-done']);
    return () => {
      stopVoice();
      stopCamera();
    };
  }, []);

  function stopCamera(): void {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function toggleCamera(): Promise<void> {
    if (useCamera) {
      stopCamera();
      setUseCamera(false);
      playVoice('balloon-touch-mode');
      return;
    }
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setUseCamera(true);
      playVoice('balloon-camera-on');
    } catch {
      setCameraError('Kamera tidak aktif — main dengan sentuhan jari ya!');
      setUseCamera(false);
    }
  }

  function spawnInitial(): Balloon[] {
    const initial: Balloon[] = [];
    for (let i = 0; i < 6; i++) {
      const c = i < 2 ? targetColor : BALLOON_COLORS[i % BALLOON_COLORS.length];
      initial.push({
        id: ++balloonIdCounter.current,
        x: 12 + i * 14 + Math.random() * 4,
        y: 55 + i * 12,
        speed: 0.14 + Math.random() * 0.08,
        colorDef: c,
        size: 62,
        popped: false
      });
    }
    return initial;
  }

  useEffect(() => {
    const list = spawnInitial();
    balloonsRef.current = list;
    setBalloons(list);
    setStatus(`Misi: Tangkap balon ${targetColor.name.toUpperCase()}!`);
  }, [missionColorIdx]);

  function popBalloon(balloon: Balloon): void {
    if (balloon.popped || isDone) return;
    if (balloon.colorDef.id !== targetColor.id) {
      playBubblePop(220);
      setStatus(`Itu ${balloon.colorDef.name}. Cari yang ${targetColor.name}!`);
      return;
    }

    triggerHaptic('tap');
    playNote(balloon.colorDef.note, 0.35, 0.25);

    setBalloons((prev) => {
      const next = prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b));
      balloonsRef.current = next;
      return next;
    });

    setHitCount((prev) => {
      const next = prev + 1;
      if (next >= TARGET_HITS) {
        setIsDone(true);
        triggerHaptic('success');
        fireConfetti();
        setStatus(`Hore! Semua balon ${targetColor.name} tertangkap!`);
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-balloon');
          playVoice('balloon-done', 300);
        }, 250);
      } else {
        setStatus(`Tepat! ${next}/${TARGET_HITS} balon ${targetColor.name}`);
      }
      return next;
    });
  }

  useEffect(() => {
    let lastTime = performance.now();
    function loop(now: number): void {
      const delta = Math.min(32, now - lastTime);
      lastTime = now;

      if (useCamera && videoRef.current && motionCanvasRef.current) {
        const video = videoRef.current;
        const canvas = motionCanvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, 48, 36);
          const data = ctx.getImageData(0, 0, 48, 36).data;
          if (prevFrameData.current) {
            const prev = prevFrameData.current;
            for (const b of balloonsRef.current) {
              if (b.popped || b.colorDef.id !== targetColor.id) continue;
              const pxX = Math.floor(((100 - b.x) / 100) * 48);
              const pxY = Math.floor((b.y / 100) * 36);
              let score = 0;
              for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                  const cx = pxX + dx;
                  const cy = pxY + dy;
                  if (cx >= 0 && cx < 48 && cy >= 0 && cy < 36) {
                    const idx = (cy * 48 + cx) * 4;
                    if (Math.abs(data[idx] - prev[idx]) + Math.abs(data[idx + 1] - prev[idx + 1]) > 65) {
                      score++;
                    }
                  }
                }
              }
              if (score >= 6) popBalloon(b);
            }
          }
          prevFrameData.current = new Uint8ClampedArray(data);
        }
      }

      setBalloons((prev) => {
        const next = prev.map((b) => {
          if (b.popped) {
            const useTarget = Math.random() < 0.48;
            const c = useTarget
              ? targetColor
              : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
            return {
              id: ++balloonIdCounter.current,
              x: 10 + Math.random() * 78,
              y: 104,
              speed: 0.14 + Math.random() * 0.09,
              colorDef: c,
              size: 62,
              popped: false
            };
          }
          const ny = b.y - b.speed * (delta / 16);
          return { ...b, y: ny < -14 ? 104 : ny };
        });
        balloonsRef.current = next;
        return next;
      });
      animFrameId.current = requestAnimationFrame(loop);
    }
    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [useCamera, isDone, targetColor]);

  function nextMission(): void {
    setHitCount(0);
    setIsDone(false);
    setMissionColorIdx((i) => (i + 1) % BALLOON_COLORS.length);
  }

  return (
    <section className="game-clean-stage" aria-label="Tangkap Balon Target">
      <div className="game-top-bar">
        <div className="balloon-target-pill" style={{ borderColor: targetColor.hex }}>
          <span className="balloon-target-dot" style={{ backgroundColor: targetColor.hex }} aria-hidden="true" />
          Tangkap: <strong>{targetColor.name}</strong> ({hitCount}/{TARGET_HITS})
        </div>

        <div className="game-top-tools">
          <button
            type="button"
            className="icon-tool-btn"
            onClick={() => speakPhrase(`Tangkap balon warna ${targetColor.name}`)}
            aria-label="Dengar misi"
          >
            <IconSpeaker size={18} />
          </button>
          <button
            type="button"
            className={`pill-btn touch-safe ${useCamera ? 'is-active' : ''}`}
            onClick={() => void toggleCamera()}
          >
            <IconCamera size={16} /> {useCamera ? 'AR On' : 'Kamera'}
          </button>
        </div>
      </div>

      {cameraError && <p className="game-mini-status">{cameraError}</p>}

      <div className="balloon-sky-arena">
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            display: useCamera ? 'block' : 'none',
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            opacity: 0.4
          }}
        />
        <canvas ref={motionCanvasRef} width={48} height={36} hidden />

        {balloons.map((b) =>
          b.popped ? null : (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              aria-label={`Balon ${b.colorDef.name}`}
              onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
                e.stopPropagation();
                popBalloon(b);
              }}
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${Math.round(b.size * 1.2)}px`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
              }}
            >
              <svg viewBox="0 0 60 76" width="100%" height="100%" aria-hidden="true">
                <ellipse cx="30" cy="28" rx="24" ry="26" fill={b.colorDef.hex} stroke="#FFFFFF" strokeWidth="2.5" />
                <ellipse cx="22" cy="18" rx="6" ry="10" fill="#FFFFFF" fillOpacity="0.35" />
                <path d="M30 54 Q34 64 28 74" stroke="#6E7A74" strokeWidth="2" fill="none" />
              </svg>
            </div>
          )
        )}

        {isDone && (
          <div className="balloon-done-overlay">
            <VisualStarMeter count={5} total={5} />
            <strong>{status}</strong>
            <button type="button" className="btn-primary-calm" onClick={nextMission}>
              Misi Warna Berikutnya →
            </button>
          </div>
        )}
      </div>
      <p className="game-mini-status">{status}</p>
    </section>
  );
}
