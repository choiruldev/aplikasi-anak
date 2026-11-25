import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconDownload, IconSpeaker } from '../components/Art.tsx';
import {
  playBubblePop,
  playHarmonicGlide,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  voiceId: VoiceClipId;
}

const PALETTE: PaletteColor[] = [
  { id: 'red', name: 'Merah', hex: '#E53935', voiceId: 'color-palette-merah' },
  { id: 'orange', name: 'Jingga', hex: '#FB8C00', voiceId: 'color-palette-jingga' },
  { id: 'yellow', name: 'Kuning', hex: '#FDD835', voiceId: 'color-palette-kuning' },
  { id: 'green', name: 'Hijau', hex: '#43A047', voiceId: 'color-palette-hijau' },
  { id: 'blue', name: 'Biru', hex: '#1E88E5', voiceId: 'color-palette-biru' },
  { id: 'purple', name: 'Ungu', hex: '#8E24AA', voiceId: 'color-palette-ungu' },
  { id: 'pink', name: 'Pink', hex: '#EC407A', voiceId: 'color-palette-pink' },
  { id: 'brown', name: 'Cokelat', hex: '#795548', voiceId: 'color-palette-cokelat' }
];

interface TemplateDef {
  id: string;
  title: string;
  parts: string[];
}

const TEMPLATES: TemplateDef[] = [
  { id: 'apple', title: 'Apel', parts: ['body', 'leaf', 'stem', 'cheekLeft', 'cheekRight'] },
  { id: 'fish', title: 'Ikan', parts: ['body', 'tail', 'finTop', 'finBottom', 'bubble1'] },
  { id: 'butterfly', title: 'Kupu', parts: ['wingTL', 'wingBL', 'wingTR', 'wingBR', 'body'] },
  { id: 'flower', title: 'Bunga', parts: ['center', 'petals', 'stem', 'leafLeft', 'leafRight'] },
  { id: 'car', title: 'Mobil', parts: ['roof', 'body', 'window', 'wheelL', 'wheelR'] },
  { id: 'rocket', title: 'Roket', parts: ['nose', 'body', 'window', 'finL', 'finR', 'flame'] },
  { id: 'house', title: 'Rumah', parts: ['roof', 'wall', 'door', 'winL', 'winR'] },
  { id: 'elephant', title: 'Gajah', parts: ['earL', 'earR', 'head', 'trunk'] }
];

const LOGICAL_W = 480;
const LOGICAL_H = 340;

interface DoodleStroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export function ColoringBook({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [tab, setTab] = useState<'book' | 'music'>('book');
  const [templateIdx, setTemplateIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<PaletteColor>(PALETTE[0]);
  const [filledParts, setFilledParts] = useState<Record<string, string>>({});
  const [brushSize, setBrushSize] = useState<number>(18);
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [currentVoice, setCurrentVoice] = useState<VoiceClipId>('coloring-intro');
  const [statusLabel, setStatusLabel] = useState('Pilih warna lalu ketuk gambar!');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isPainting = useRef(false);
  const activeStrokeRef = useRef<DoodleStroke | null>(null);
  const rewardedRef = useRef(false);

  const currentTemplate = TEMPLATES[templateIdx];

  useEffect(() => {
    preloadVoices([
      'coloring-intro',
      'coloring-tab-book',
      'coloring-tab-music',
      'coloring-done',
      ...PALETTE.map((c) => c.voiceId)
    ]);
    playVoice('coloring-intro', 80);
    return () => stopVoice();
  }, []);

  function redrawCanvas(strokeList: DoodleStroke[]): void {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(LOGICAL_W * dpr)) {
      canvas.width = Math.round(LOGICAL_W * dpr);
      canvas.height = Math.round(LOGICAL_H * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokeList) {
      if (s.points.length === 0) continue;
      if (s.points.length === 1) {
        ctx.beginPath();
        ctx.arc(s.points[0].x, s.points[0].y, s.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.stroke();
    }
  }

  useEffect(() => {
    if (tab === 'music') {
      redrawCanvas(strokes);
    }
  }, [tab, strokes]);

  function handleSelectColor(color: PaletteColor): void {
    setSelectedColor(color);
    setStatusLabel(color.name);
    setCurrentVoice(color.voiceId);
    playVoice(color.voiceId);
  }

  function handlePartClick(partKey: string, freq = 392): void {
    triggerHaptic('tap');
    playBubblePop(freq);
    playNote(freq, 0.35, 0.22);
    setFilledParts((prev) => {
      const next = { ...prev, [partKey]: selectedColor.hex };
      const filledCount = currentTemplate.parts.filter((k) => Boolean(next[k])).length;
      if (filledCount >= currentTemplate.parts.length) {
        triggerHaptic('success');
        fireConfetti();
        setStatusLabel(`Hore! ${currentTemplate.title} selesai!`);
        if (!rewardedRef.current) {
          rewardedRef.current = true;
          window.setTimeout(() => {
            playSuccessChime();
            onComplete('sticker-coloring');
            playVoice('coloring-done', 300);
          }, 220);
        }
      }
      return next;
    });
  }

  // FIXED Retina DPR coordinate conversion -> maps cleanly into LOGICAL_W x LOGICAL_H (480x340)
  function getLogicalPoint(e: ReactPointerEvent<HTMLCanvasElement>): { x: number; y: number; normY: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, normY: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height)));
    return { x: normX * LOGICAL_W, y: normY * LOGICAL_H, normY };
  }

  function onPointerDownCanvas(e: ReactPointerEvent<HTMLCanvasElement>): void {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic events
    }
    isPainting.current = true;
    const { x, y, normY } = getLogicalPoint(e);
    const stroke: DoodleStroke = { color: selectedColor.hex, width: brushSize, points: [{ x, y }] };
    activeStrokeRef.current = stroke;
    const nextList = [...strokes, stroke];
    setStrokes(nextList);
    redrawCanvas(nextList);
    playHarmonicGlide(normY);
  }

  function onPointerMoveCanvas(e: ReactPointerEvent<HTMLCanvasElement>): void {
    if (!isPainting.current || !activeStrokeRef.current) return;
    const { x, y, normY } = getLogicalPoint(e);
    activeStrokeRef.current.points.push({ x, y });
    redrawCanvas([...strokes.slice(0, -1), activeStrokeRef.current]);
    playHarmonicGlide(normY);
  }

  function onPointerUpCanvas(e: ReactPointerEvent<HTMLCanvasElement>): void {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    if (isPainting.current && activeStrokeRef.current) {
      const committed = activeStrokeRef.current;
      setStrokes((prev) => [...prev.slice(0, -1), { ...committed, points: [...committed.points] }]);
      if (!rewardedRef.current && strokes.length >= 3) {
        rewardedRef.current = true;
        onComplete('sticker-coloring');
      }
    }
    isPainting.current = false;
    activeStrokeRef.current = null;
  }

  function handleSaveArtwork(): void {
    if (tab === 'music' && canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cilukba-lukisan.png';
      a.click();
      return;
    }
    if (tab === 'book' && svgRef.current) {
      const xml = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cilukba-warna-${currentTemplate.id}.svg`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  const fill = (k: string) => filledParts[k] || '#FFFFFF';

  return (
    <section className="game-clean-stage" aria-label="Kanvas Warna">
      <div className="game-top-bar">
        <div className="mode-switcher compact" role="tablist" aria-label="Mode melukis">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'book'}
            className={`pill-btn touch-safe ${tab === 'book' ? 'is-active' : ''}`}
            onClick={() => {
              setTab('book');
              setCurrentVoice('coloring-tab-book');
              playVoice('coloring-tab-book');
            }}
          >
            Mewarnai
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'music'}
            className={`pill-btn touch-safe ${tab === 'music' ? 'is-active' : ''}`}
            onClick={() => {
              setTab('music');
              setCurrentVoice('coloring-tab-music');
              playVoice('coloring-tab-music');
            }}
          >
            Lukis Musik
          </button>
        </div>

        <div className="game-top-tools">
          <button type="button" className="icon-tool-btn" onClick={() => playVoice(currentVoice)} aria-label="Dengar suara">
            <IconSpeaker size={18} />
          </button>
          <button type="button" className="icon-tool-btn" onClick={handleSaveArtwork} aria-label="Simpan karya">
            <IconDownload size={18} />
          </button>
        </div>
      </div>

      {tab === 'book' ? (
        <>
          <div className="game-chip-scroll" role="tablist" aria-label="Pilih gambar mewarnai">
            {TEMPLATES.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={idx === templateIdx}
                className={`pill-btn touch-safe ${idx === templateIdx ? 'is-active' : ''}`}
                onClick={() => {
                  setTemplateIdx(idx);
                  setFilledParts({});
                  setStatusLabel(t.title);
                }}
              >
                {t.title}
              </button>
            ))}
          </div>

          <div className="coloring-svg-canvas">
            <svg ref={svgRef} viewBox="0 0 320 300" className="coloring-svg" role="img" aria-label={currentTemplate.title}>
              {currentTemplate.id === 'apple' && (
                <>
                  <path d="M152 36C155 20 165 10 174 8C172 22 164 32 156 42Z" fill={fill('stem')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('stem', 329)} style={{ cursor: 'pointer' }} />
                  <path d="M165 26C195 16 220 31 224 52C194 61 175 44 165 26Z" fill={fill('leaf')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('leaf', 440)} style={{ cursor: 'pointer' }} />
                  <path d="M160 64C110 28 46 76 46 154C46 236 116 270 160 276C204 270 274 236 274 154C274 76 210 28 160 64Z" fill={fill('body')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <circle cx="120" cy="144" r="7" fill="#182421" />
                  <circle cx="200" cy="144" r="7" fill="#182421" />
                  <path d="M142 172C152 186 168 186 178 172" stroke="#182421" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  <circle cx="102" cy="166" r="16" fill={fill('cheekLeft')} stroke="#182421" strokeWidth="3.5" onClick={() => handlePartClick('cheekLeft', 523)} style={{ cursor: 'pointer' }} />
                  <circle cx="218" cy="166" r="16" fill={fill('cheekRight')} stroke="#182421" strokeWidth="3.5" onClick={() => handlePartClick('cheekRight', 587)} style={{ cursor: 'pointer' }} />
                </>
              )}
              {currentTemplate.id === 'fish' && (
                <>
                  <circle cx="268" cy="64" r="18" fill={fill('bubble1')} stroke="#182421" strokeWidth="3.5" onClick={() => handlePartClick('bubble1', 659)} style={{ cursor: 'pointer' }} />
                  <path d="M104 156L34 104C44 148 44 164 34 208L104 156Z" fill={fill('tail')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('tail', 329)} style={{ cursor: 'pointer' }} />
                  <path d="M146 96C166 56 206 58 214 96Z" fill={fill('finTop')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('finTop', 440)} style={{ cursor: 'pointer' }} />
                  <path d="M150 212C168 250 202 250 210 212Z" fill={fill('finBottom')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('finBottom', 493)} style={{ cursor: 'pointer' }} />
                  <ellipse cx="182" cy="156" rx="92" ry="62" fill={fill('body')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <circle cx="228" cy="140" r="8" fill="#182421" />
                  <path d="M236 168C246 174 256 172 262 164" stroke="#182421" strokeWidth="4" strokeLinecap="round" fill="none" />
                </>
              )}
              {currentTemplate.id === 'butterfly' && (
                <>
                  <ellipse cx="102" cy="112" rx="60" ry="52" fill={fill('wingTL')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('wingTL', 329)} style={{ cursor: 'pointer' }} />
                  <ellipse cx="218" cy="112" rx="60" ry="52" fill={fill('wingTR')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('wingTR', 392)} style={{ cursor: 'pointer' }} />
                  <ellipse cx="110" cy="204" rx="46" ry="44" fill={fill('wingBL')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('wingBL', 440)} style={{ cursor: 'pointer' }} />
                  <ellipse cx="210" cy="204" rx="46" ry="44" fill={fill('wingBR')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('wingBR', 523)} style={{ cursor: 'pointer' }} />
                  <rect x="142" y="76" width="36" height="156" rx="18" fill={fill('body')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <path d="M150 76C142 52 128 46 124 48M170 76C178 52 192 46 196 48" stroke="#182421" strokeWidth="4" strokeLinecap="round" fill="none" />
                </>
              )}
              {currentTemplate.id === 'flower' && (
                <>
                  <rect x="150" y="168" width="20" height="114" rx="10" fill={fill('stem')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('stem', 293)} style={{ cursor: 'pointer' }} />
                  <ellipse cx="116" cy="232" rx="34" ry="18" fill={fill('leafLeft')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('leafLeft', 349)} style={{ cursor: 'pointer' }} />
                  <ellipse cx="204" cy="232" rx="34" ry="18" fill={fill('leafRight')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('leafRight', 392)} style={{ cursor: 'pointer' }} />
                  <g onClick={() => handlePartClick('petals', 440)} style={{ cursor: 'pointer' }}>
                    {[0, 60, 120, 180, 240, 300].map((a) => (
                      <circle key={a} cx={160 + Math.cos((a * Math.PI) / 180) * 54} cy={112 + Math.sin((a * Math.PI) / 180) * 54} r="32" fill={fill('petals')} stroke="#182421" strokeWidth="4" />
                    ))}
                  </g>
                  <circle cx="160" cy="112" r="38" fill={fill('center')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('center', 523)} style={{ cursor: 'pointer' }} />
                  <circle cx="148" cy="106" r="5" fill="#182421" />
                  <circle cx="172" cy="106" r="5" fill="#182421" />
                  <path d="M148 122C154 130 166 130 172 122" stroke="#182421" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </>
              )}
              {currentTemplate.id === 'car' && (
                <>
                  <path d="M88 140L116 84H208L238 140Z" fill={fill('roof')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('roof', 392)} style={{ cursor: 'pointer' }} />
                  <rect x="126" y="96" width="72" height="36" rx="6" fill={fill('window')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('window', 493)} style={{ cursor: 'pointer' }} />
                  <rect x="44" y="138" width="232" height="72" rx="20" fill={fill('body')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <circle cx="102" cy="214" r="32" fill={fill('wheelL')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('wheelL', 329)} style={{ cursor: 'pointer' }} />
                  <circle cx="220" cy="214" r="32" fill={fill('wheelR')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('wheelR', 349)} style={{ cursor: 'pointer' }} />
                </>
              )}
              {currentTemplate.id === 'rocket' && (
                <>
                  <path d="M126 236C142 280 178 280 194 236Z" fill={fill('flame')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('flame', 523)} style={{ cursor: 'pointer' }} />
                  <polygon points="114,174 62,226 114,226" fill={fill('finL')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('finL', 329)} style={{ cursor: 'pointer' }} />
                  <polygon points="206,174 258,226 206,226" fill={fill('finR')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('finR', 349)} style={{ cursor: 'pointer' }} />
                  <rect x="114" y="100" width="92" height="134" rx="18" fill={fill('body')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <path d="M114 104C126 42 160 22 160 22C160 22 194 42 206 104Z" fill={fill('nose')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('nose', 440)} style={{ cursor: 'pointer' }} />
                  <circle cx="160" cy="154" r="24" fill={fill('window')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('window', 587)} style={{ cursor: 'pointer' }} />
                </>
              )}
              {currentTemplate.id === 'house' && (
                <>
                  <polygon points="44,136 160,40 276,136" fill={fill('roof')} stroke="#182421" strokeWidth="5" strokeLinejoin="round" onClick={() => handlePartClick('roof', 392)} style={{ cursor: 'pointer' }} />
                  <rect x="68" y="136" width="184" height="136" rx="8" fill={fill('wall')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('wall', 261)} style={{ cursor: 'pointer' }} />
                  <rect x="136" y="192" width="48" height="80" rx="8" fill={fill('door')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('door', 329)} style={{ cursor: 'pointer' }} />
                  <rect x="86" y="160" width="38" height="38" rx="6" fill={fill('winL')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('winL', 440)} style={{ cursor: 'pointer' }} />
                  <rect x="196" y="160" width="38" height="38" rx="6" fill={fill('winR')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('winR', 493)} style={{ cursor: 'pointer' }} />
                </>
              )}
              {currentTemplate.id === 'elephant' && (
                <>
                  <circle cx="76" cy="144" r="56" fill={fill('earL')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('earL', 329)} style={{ cursor: 'pointer' }} />
                  <circle cx="244" cy="144" r="56" fill={fill('earR')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('earR', 392)} style={{ cursor: 'pointer' }} />
                  <circle cx="160" cy="148" r="76" fill={fill('head')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('head', 261)} style={{ cursor: 'pointer' }} />
                  <path d="M144 172V244C144 268 186 268 192 246C174 246 172 232 172 220V172Z" fill={fill('trunk')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('trunk', 440)} style={{ cursor: 'pointer' }} />
                  <circle cx="130" cy="134" r="8" fill="#182421" />
                  <circle cx="190" cy="134" r="8" fill="#182421" />
                </>
              )}
            </svg>
          </div>
        </>
      ) : (
        <>
          <div className="doodle-toolbar">
            <div className="chip-row">
              {[
                { label: 'Kecil', size: 10 },
                { label: 'Sedang', size: 20 },
                { label: 'Besar', size: 34 }
              ].map((b) => (
                <button
                  key={b.size}
                  type="button"
                  className={`pill-btn touch-safe ${brushSize === b.size ? 'is-active' : ''}`}
                  onClick={() => setBrushSize(b.size)}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <div className="chip-row">
              <button
                type="button"
                className="btn-outline touch-safe"
                disabled={strokes.length === 0}
                onClick={() => setStrokes((prev) => prev.slice(0, -1))}
              >
                Undo
              </button>
              <button
                type="button"
                className="btn-outline touch-safe"
                onClick={() => {
                  setStrokes([]);
                  playVoice('trace-clear');
                }}
              >
                Hapus
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="doodle-music-canvas"
            style={{ touchAction: 'none' }}
            onPointerDown={onPointerDownCanvas}
            onPointerMove={onPointerMoveCanvas}
            onPointerUp={onPointerUpCanvas}
            onPointerCancel={onPointerUpCanvas}
          />
        </>
      )}

      <div className="color-palette-bar" role="radiogroup" aria-label="Pilih warna kuas">
        {PALETTE.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selectedColor.id === c.id}
            aria-label={c.name}
            className={`palette-swatch-btn ${selectedColor.id === c.id ? 'is-active' : ''}`}
            style={{ backgroundColor: c.hex }}
            onClick={() => handleSelectColor(c)}
          />
        ))}
      </div>
      <p className="game-mini-status">{statusLabel}</p>
    </section>
  );
}
