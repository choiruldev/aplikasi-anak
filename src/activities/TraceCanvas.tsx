import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type PointerEvent as ReactPointerEvent
} from 'react';
import { IconSpeaker } from '../components/Art.tsx';
import {
  playStepNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { advanceCheckpoint, sampleStrokes, type Point } from '../lib/geometry.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface TraceGlyph {
  id: string;
  symbol: string;
  title: string;
  voiceId: VoiceClipId;
  strokes: Point[][];
}

const GLYPHS: TraceGlyph[] = [
  { id: 'line', symbol: '|', title: 'Garis Tegak', voiceId: 'trace-line', strokes: [[{ x: 160, y: 56 }, { x: 160, y: 264 }]] },
  {
    id: 'wave',
    symbol: '~',
    title: 'Ombak',
    voiceId: 'trace-zigzag',
    strokes: [[{ x: 56, y: 170 }, { x: 108, y: 108 }, { x: 160, y: 170 }, { x: 212, y: 230 }, { x: 264, y: 170 }]]
  },
  { id: 'zigzag', symbol: 'Z', title: 'Zig-Zag', voiceId: 'trace-zigzag', strokes: [[{ x: 84, y: 68 }, { x: 236, y: 68 }, { x: 84, y: 252 }, { x: 236, y: 252 }]] },
  {
    id: 'circle',
    symbol: 'O',
    title: 'Lingkaran',
    voiceId: 'trace-circle',
    strokes: [[{ x: 160, y: 56 }, { x: 96, y: 84 }, { x: 70, y: 160 }, { x: 96, y: 236 }, { x: 160, y: 264 }, { x: 224, y: 236 }, { x: 250, y: 160 }, { x: 224, y: 84 }, { x: 160, y: 56 }]]
  },
  {
    id: 'A',
    symbol: 'A',
    title: 'Huruf A',
    voiceId: 'trace-A',
    strokes: [[{ x: 160, y: 58 }, { x: 86, y: 258 }], [{ x: 160, y: 58 }, { x: 234, y: 258 }], [{ x: 112, y: 188 }, { x: 208, y: 188 }]]
  },
  {
    id: 'I',
    symbol: 'I',
    title: 'Huruf I',
    voiceId: 'trace-I',
    strokes: [[{ x: 118, y: 62 }, { x: 202, y: 62 }], [{ x: 160, y: 62 }, { x: 160, y: 258 }], [{ x: 118, y: 258 }, { x: 202, y: 258 }]]
  },
  {
    id: 'U',
    symbol: 'U',
    title: 'Huruf U',
    voiceId: 'trace-U',
    strokes: [[{ x: 92, y: 64 }, { x: 92, y: 198 }, { x: 118, y: 248 }, { x: 160, y: 260 }, { x: 202, y: 248 }, { x: 228, y: 198 }, { x: 228, y: 64 }]]
  },
  { id: '1', symbol: '1', title: 'Angka 1', voiceId: 'trace-1', strokes: [[{ x: 122, y: 96 }, { x: 166, y: 58 }, { x: 166, y: 260 }]] },
  {
    id: '2',
    symbol: '2',
    title: 'Angka 2',
    voiceId: 'trace-2',
    strokes: [[{ x: 96, y: 104 }, { x: 132, y: 62 }, { x: 194, y: 62 }, { x: 224, y: 102 }, { x: 206, y: 154 }, { x: 94, y: 256 }, { x: 230, y: 256 }]]
  },
  {
    id: '3',
    symbol: '3',
    title: 'Angka 3',
    voiceId: 'trace-3',
    strokes: [[{ x: 102, y: 78 }, { x: 164, y: 58 }, { x: 214, y: 90 }, { x: 196, y: 142 }, { x: 148, y: 158 }, { x: 208, y: 178 }, { x: 220, y: 228 }, { x: 162, y: 260 }, { x: 100, y: 238 }]]
  }
];

const CRAYON_COLORS = ['#1F7A5C', '#E07A18', '#2D6CDF', '#D8435E', '#8045D9'];

export function TraceCanvas({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [glyphIdx, setGlyphIdx] = useState(0);
  const [crayonColor, setCrayonColor] = useState(CRAYON_COLORS[0]);
  const glyph = GLYPHS[glyphIdx];
  const checkpoints = useMemo(() => sampleStrokes(glyph.strokes, 28), [glyph]);

  const [progressIdx, setProgressIdx] = useState(0);
  const [trails, setTrails] = useState<Point[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    preloadVoices(['trace-clear', 'trace-done', ...GLYPHS.map((g) => g.voiceId)]);
    return () => stopVoice();
  }, []);

  useEffect(() => {
    setProgressIdx(0);
    setTrails([]);
    setGuideStep(0);
    completedRef.current = false;
    playVoice(glyph.voiceId, 80);
  }, [glyph]);

  // Gentle guiding bead animation when child hasn't started tracing yet
  useEffect(() => {
    if (progressIdx > 0 || checkpoints.length === 0) return;
    const id = window.setInterval(() => {
      setGuideStep((prev) => (prev + 1) % checkpoints.length);
    }, 180);
    return () => window.clearInterval(id);
  }, [progressIdx, checkpoints.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 320 * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 320, 320);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of glyph.strokes) {
      ctx.beginPath();
      stroke.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = '#E2EAE0';
      ctx.lineWidth = 40;
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([7, 9]);
      stroke.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = '#92A69D';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const stroke of trails) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      stroke.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.strokeStyle = crayonColor;
      ctx.lineWidth = 26;
      ctx.stroke();
    }

    checkpoints.forEach((pt, idx) => {
      const done = idx < progressIdx;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, done ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = done ? '#2B9361' : '#B7C6BE';
      ctx.fill();
    });

    // Show soft guiding bead along stroke before child starts
    if (progressIdx === 0 && checkpoints[guideStep]) {
      const g = checkpoints[guideStep];
      ctx.beginPath();
      ctx.arc(g.x, g.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(247, 183, 49, 0.45)';
      ctx.fill();
    }

    if (progressIdx < checkpoints.length) {
      const target = checkpoints[progressIdx];
      ctx.beginPath();
      ctx.arc(target.x, target.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#F7B731';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#182421';
      ctx.stroke();
    }
  }, [glyph, checkpoints, progressIdx, trails, guideStep, crayonColor]);

  function toCanvasPoint(clientX: number, clientY: number): Point {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / Math.max(1, rect.width)) * 320,
      y: ((clientY - rect.top) / Math.max(1, rect.height)) * 320
    };
  }

  function checkProgress(pt: Point): void {
    setProgressIdx((prev) => {
      const next = advanceCheckpoint(pt, checkpoints, prev, 40);
      if (next > prev) {
        triggerHaptic('tap');
        playStepNote(next);
        if (next >= checkpoints.length && !completedRef.current) {
          completedRef.current = true;
          triggerHaptic('success');
          fireConfetti();
          window.setTimeout(() => {
            playSuccessChime();
            onComplete('sticker-trace');
            playVoice('trace-done', 400);
          }, 220);
        }
      }
      return next;
    });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>): void {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic events
    }
    const pt = toCanvasPoint(e.clientX, e.clientY);
    setIsDrawing(true);
    setTrails((prev) => [...prev, [pt]]);
    checkProgress(pt);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>): void {
    if (!isDrawing) return;
    const pt = toCanvasPoint(e.clientX, e.clientY);
    setTrails((prev) => {
      if (prev.length === 0) return [[pt]];
      const copy = [...prev];
      copy[copy.length - 1] = [...copy[copy.length - 1], pt];
      return copy;
    });
    checkProgress(pt);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLCanvasElement>): void {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    setIsDrawing(false);
  }

  const isDone = progressIdx >= checkpoints.length;

  return (
    <section className="game-clean-stage" aria-label="Tebalkan Garis">
      <div className="game-top-bar">
        <span className="pill-badge">{glyph.title}</span>
        <div className="game-top-tools">
          <button type="button" className="icon-tool-btn" onClick={() => playVoice(glyph.voiceId)} aria-label="Dengar panduan">
            <IconSpeaker size={18} />
          </button>
          <button
            type="button"
            className="btn-outline touch-safe"
            onClick={() => {
              setProgressIdx(0);
              setTrails([]);
              completedRef.current = false;
              playVoice('trace-clear');
            }}
          >
            Ulang
          </button>
        </div>
      </div>

      <div className="game-chip-scroll" role="tablist" aria-label="Pilih pola garis">
        {GLYPHS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={idx === glyphIdx}
            className={`trace-big-chip ${idx === glyphIdx ? 'is-active' : ''}`}
            onClick={() => setGlyphIdx(idx)}
          >
            {item.symbol}
          </button>
        ))}
      </div>

      <div className="trace-board-layout">
        <canvas
          ref={canvasRef}
          className="trace-canvas"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      <div className="color-palette-bar" aria-label="Pilih warna krayon">
        {CRAYON_COLORS.map((hex) => (
          <button
            key={hex}
            type="button"
            className={`palette-swatch-btn ${crayonColor === hex ? 'is-active' : ''}`}
            style={{ backgroundColor: hex }}
            onClick={() => setCrayonColor(hex)}
            aria-label={`Warna ${hex}`}
          />
        ))}
      </div>

      {isDone && (
        <button
          type="button"
          className="btn-primary-calm"
          onClick={() => setGlyphIdx((prev) => (prev + 1) % GLYPHS.length)}
        >
          Pola Berikutnya →
        </button>
      )}
    </section>
  );
}
