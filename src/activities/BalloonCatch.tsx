import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconCamera, IconSpeaker } from '../components/Art';
import {
  playBubblePop,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice
} from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

interface Balloon {
  id: number;
  x: number; // percentage 10% .. 85%
  y: number; // percentage 105% down to -15%
  speed: number;
  color: string;
  size: number;
  popped: boolean;
  scaleNote: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number; // 1 to 0
}

const BALLOON_COLORS = [
  { hex: '#E53935', note: 261.63 }, // Red - Do
  { hex: '#FB8C00', note: 293.66 }, // Orange - Re
  { hex: '#FDD835', note: 329.63 }, // Yellow - Mi
  { hex: '#43A047', note: 349.23 }, // Green - Fa
  { hex: '#1E88E5', note: 392.0 },  // Blue - Sol
  { hex: '#8E24AA', note: 440.0 }   // Purple - La
];

const TARGET_POPS = 10;

export function BalloonCatch({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [popCount, setPopCount] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [prompt, setPrompt] = useState('Sentuh atau lambaikan tangan untuk pecahkan balon!');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrameData = useRef<Uint8ClampedArray | null>(null);
  const animFrameId = useRef<number | null>(null);
  const balloonIdCounter = useRef(0);

  useEffect(() => {
    preloadVoices([
      'balloon-intro',
      'balloon-camera-on',
      'balloon-touch-mode',
      'balloon-pop-great',
      'balloon-done'
    ]);
    playVoice('balloon-intro', 80);
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

  async function startCamera(): Promise<void> {
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
      setPrompt('Kamera aktif! Lambaikan tanganmu untuk pecahkan balon.');
      playVoice('balloon-camera-on');
    } catch {
      setCameraError('Kamera tidak dapat diakses. Tetap bisa bermain dengan mode sentuh!');
      setUseCamera(false);
      playVoice('balloon-touch-mode');
    }
  }

  function toggleCamera(): void {
    if (useCamera) {
      stopCamera();
      setUseCamera(false);
      setPrompt('Mode sentuh aktif! Ketuk balon untuk memecahkannya.');
      playVoice('balloon-touch-mode');
    } else {
      void startCamera();
    }
  }

  const balloonsRef = useRef<Balloon[]>([]);

  // Spawn initial balloons
  useEffect(() => {
    const initial: Balloon[] = [];
    for (let i = 0; i < 5; i++) {
      const c = BALLOON_COLORS[i % BALLOON_COLORS.length];
      initial.push({
        id: ++balloonIdCounter.current,
        x: 12 + i * 17 + Math.random() * 5,
        y: 60 + i * 14 + Math.random() * 8,
        speed: 0.16 + Math.random() * 0.1,
        color: c.hex,
        size: 58 + Math.random() * 14,
        popped: false,
        scaleNote: c.note
      });
    }
    balloonsRef.current = initial;
    setBalloons(initial);
  }, []);

  function popBalloon(balloon: Balloon): void {
    if (balloon.popped || isDone) return;
    triggerHaptic('tap');
    playBubblePop(balloon.scaleNote * 1.4);
    playNote(balloon.scaleNote, 0.35, 0.22);

    // Create burst particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7;
      const speed = 1.8 + Math.random() * 2.2;
      newParticles.push({
        id: Math.random(),
        x: balloon.x,
        y: balloon.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: balloon.color,
        life: 1
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    setBalloons((prev) => {
      const next = prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b));
      balloonsRef.current = next;
      return next;
    });

    setPopCount((prev) => {
      const next = prev + 1;
      if (next >= TARGET_POPS) {
        setIsDone(true);
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-balloon');
          setPrompt('Luar biasa! Semua balon berhasil kamu tangkap!');
          playVoice('balloon-done', 350);
        }, 320);
      }
      return next;
    });
  }

  // Motion Detection + Balloon Floating Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    function loop(now: number): void {
      const delta = Math.min(32, now - lastTime);
      lastTime = now;

      // 1. Check Camera Motion if active
      if (useCamera && videoRef.current && motionCanvasRef.current) {
        const video = videoRef.current;
        const canvas = motionCanvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, 48, 36);
          const frame = ctx.getImageData(0, 0, 48, 36);
          const data = frame.data;

          if (prevFrameData.current) {
            const prev = prevFrameData.current;
            const toPop: Balloon[] = [];

            for (const b of balloonsRef.current) {
              if (b.popped) continue;
              // Mirrored coordinates because video is mirrored
              const bxNorm = (100 - b.x) / 100;
              const byNorm = b.y / 100;
              const pxX = Math.floor(bxNorm * 48);
              const pxY = Math.floor(byNorm * 36);

              let motionScore = 0;
              for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                  const cx = pxX + dx;
                  const cy = pxY + dy;
                  if (cx >= 0 && cx < 48 && cy >= 0 && cy < 36) {
                    const idx = (cy * 48 + cx) * 4;
                    const diff =
                      Math.abs(data[idx] - prev[idx]) +
                      Math.abs(data[idx + 1] - prev[idx + 1]) +
                      Math.abs(data[idx + 2] - prev[idx + 2]);
                    if (diff > 75) motionScore++;
                  }
                }
              }

              if (motionScore >= 6) {
                toPop.push(b);
              }
            }

            for (const b of toPop) {
              popBalloon(b);
            }
          }
          prevFrameData.current = new Uint8ClampedArray(data);
        }
      }

      // 2. Float balloons upwards
      setBalloons((prev) => {
        const next = prev.map((b) => {
          if (b.popped) {
            // Respawn popped balloon from bottom
            const c = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
            return {
              id: ++balloonIdCounter.current,
              x: 10 + Math.random() * 80,
              y: 105,
              speed: 0.16 + Math.random() * 0.12,
              color: c.hex,
              size: 56 + Math.random() * 16,
              popped: false,
              scaleNote: c.note
            };
          }

          let newY = b.y - b.speed * (delta / 16);
          if (newY < -15) {
            newY = 105;
          }
          return { ...b, y: newY };
        });
        balloonsRef.current = next;
        return next;
      });

      // 3. Update particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.1,
            y: p.y + p.vy * 0.1,
            life: p.life - 0.04
          }))
          .filter((p) => p.life > 0)
      );

      animFrameId.current = requestAnimationFrame(loop);
    }

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [useCamera, isDone]);

  function handleTouchBalloon(e: ReactPointerEvent<HTMLDivElement>, balloon: Balloon): void {
    e.stopPropagation();
    popBalloon(balloon);
  }

  function handlePlayAgain(): void {
    setPopCount(0);
    setIsDone(false);
    setParticles([]);
    const initial: Balloon[] = [];
    for (let i = 0; i < 5; i++) {
      const c = BALLOON_COLORS[i % BALLOON_COLORS.length];
      initial.push({
        id: ++balloonIdCounter.current,
        x: 12 + i * 17 + Math.random() * 5,
        y: 60 + i * 14 + Math.random() * 8,
        speed: 0.16 + Math.random() * 0.1,
        color: c.hex,
        size: 58 + Math.random() * 14,
        popped: false,
        scaleNote: c.note
      });
    }
    balloonsRef.current = initial;
    setBalloons(initial);
    setPrompt('Sentuh atau lambaikan tangan untuk pecahkan balon!');
    playVoice('balloon-intro');
  }

  return (
    <section className="activity-stage" aria-labelledby="balloon-title">
      <div className="stage-header">
        <div>
          <h1 id="balloon-title" className="stage-title">Tangkap Balon Ceria</h1>
          <p className="stage-subtitle">{prompt}</p>
        </div>
        <div className="stage-actions">
          <button
            type="button"
            className="voice-btn"
            onClick={() => playVoice(isDone ? 'balloon-done' : 'balloon-intro')}
            aria-label="Dengar panduan suara"
          >
            <IconSpeaker size={22} />
            <span>Dengar</span>
          </button>
          <button
            type="button"
            className={`secondary-btn ${useCamera ? 'is-active' : ''}`}
            onClick={toggleCamera}
          >
            <IconCamera size={18} />
            <span>{useCamera ? 'Matikan Kamera' : 'Nyalakan Kamera'}</span>
          </button>
          {isDone && (
            <button type="button" className="primary-action-btn" onClick={handlePlayAgain}>
              Main Lagi
            </button>
          )}
        </div>
      </div>

      {cameraError && <p className="gate-hint">{cameraError}</p>}

      <div className="balloon-arena-frame">
        {/* Hidden downscaled canvas for motion analysis */}
        <canvas ref={motionCanvasRef} width={48} height={36} style={{ display: 'none' }} />

        {/* Mirrored webcam background video */}
        {useCamera && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="balloon-camera-feed"
            aria-label="Tampilan kamera cermin"
          />
        )}

        {/* Floating Balloons */}
        {balloons.map((b) => {
          if (b.popped) return null;
          return (
            <div
              key={b.id}
              className="floating-balloon"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size * 1.25}px`,
                backgroundColor: b.color
              }}
              onPointerDown={(e) => handleTouchBalloon(e, b)}
              role="button"
              aria-label="Balon warna ceria"
            >
              <div className="balloon-reflection" />
              <div className="balloon-string" />
            </div>
          );
        })}

        {/* Burst Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="balloon-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              opacity: p.life,
              transform: `scale(${p.life * 1.5})`
            }}
          />
        ))}

        {/* Onscreen Counter Badge */}
        <div className="balloon-counter-badge" aria-live="polite">
          <span className="balloon-counter-num">{popCount}</span>
          <span className="balloon-counter-lbl">/ {TARGET_POPS} Balon</span>
        </div>
      </div>

      <div className="progress-strip" aria-live="polite">
        <span>
          Balon tertangkap: {popCount} / {TARGET_POPS}{' '}
          {useCamera ? '(Mode Kamera Aktif — Lambaikan tanganmu!)' : '(Mode Sentuh — Ketuk balonnya!)'}
        </span>
      </div>
    </section>
  );
}
