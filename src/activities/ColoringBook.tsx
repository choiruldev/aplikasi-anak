import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconSpeaker } from '../components/Art';
import {
  playBubblePop,
  playHarmonicGlide,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

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
  { id: 'pink', name: 'Merah Muda', hex: '#EC407A', voiceId: 'color-palette-pink' },
  { id: 'brown', name: 'Cokelat', hex: '#795548', voiceId: 'color-palette-cokelat' }
];

interface TemplateDef {
  id: string;
  title: string;
  parts: string[];
}

const TEMPLATES: TemplateDef[] = [
  { id: 'apple', title: 'Apel Ceria', parts: ['body', 'leaf', 'stem', 'cheekLeft', 'cheekRight'] },
  { id: 'fish', title: 'Ikan Berenang', parts: ['body', 'tail', 'finTop', 'finBottom', 'bubble1', 'bubble2'] },
  { id: 'butterfly', title: 'Kupu-kupu', parts: ['wingTL', 'wingBL', 'wingTR', 'wingBR', 'body'] },
  { id: 'flower', title: 'Bunga Matahari', parts: ['center', 'petals', 'stem', 'leafLeft', 'leafRight'] }
];

export function ColoringBook({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [tab, setTab] = useState<'book' | 'music'>('book');
  const [templateIdx, setTemplateIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<PaletteColor>(PALETTE[0]);
  const [filledParts, setFilledParts] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState('Pilih warna di bawah, lalu sentuh bagian gambar.');
  const [currentVoice, setCurrentVoice] = useState<VoiceClipId>('coloring-intro');

  // Doodle canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPainting = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

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

  function handleSelectColor(color: PaletteColor): void {
    setSelectedColor(color);
    setPrompt(`Warna ${color.name} dipilih. Sentuh gambar untuk mewarnai!`);
    setCurrentVoice(color.voiceId);
    playVoice(color.voiceId);
  }

  function handlePartClick(partKey: string, freq = 392): void {
    triggerHaptic('tap');
    playBubblePop(freq);
    playNote(freq, 0.35, 0.22);
    setFilledParts((prev) => {
      const next = { ...prev, [partKey]: selectedColor.hex };
      const totalParts = currentTemplate.parts.length;
      const filledCount = Object.keys(next).filter((k) => currentTemplate.parts.includes(k)).length;

      if (filledCount >= totalParts) {
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-coloring');
          setPrompt('Wah, gambarmu sudah selesai diwarnai! Indah sekali.');
          playVoice('coloring-done', 350);
        }, 320);
      }
      return next;
    });
  }

  function handleSwitchTemplate(idx: number): void {
    setTemplateIdx(idx);
    setFilledParts({});
    const msg = `Gambar ${TEMPLATES[idx].title}. Ayo warnai setiap bagiannya!`;
    setPrompt(msg);
    playVoice('coloring-tab-book');
  }

  // Kandinsky doodle canvas interaction
  function getCanvasCoords(e: ReactPointerEvent<HTMLCanvasElement>): { x: number; y: number; normY: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, normY: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y, normY };
  }

  function onPointerDownCanvas(e: ReactPointerEvent<HTMLCanvasElement>): void {
    e.currentTarget.setPointerCapture(e.pointerId);
    isPainting.current = true;
    const { x, y, normY } = getCanvasCoords(e);
    lastPos.current = { x, y };

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = selectedColor.hex;
      ctx.fill();
    }
    playHarmonicGlide(normY);
  }

  function onPointerMoveCanvas(e: ReactPointerEvent<HTMLCanvasElement>): void {
    if (!isPainting.current) return;
    const { x, y, normY } = getCanvasCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = selectedColor.hex;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    lastPos.current = { x, y };
    playHarmonicGlide(normY);
  }

  function onPointerUpCanvas(e: ReactPointerEvent<HTMLCanvasElement>): void {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    isPainting.current = false;
    lastPos.current = null;
  }

  function handleClearCanvas(): void {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    playVoice('trace-clear');
  }

  // Pre-fill white canvas on mount of music tab
  useEffect(() => {
    if (tab === 'music' && canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = 480 * dpr;
      canvas.height = 360 * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 480, 360);
      }
    }
  }, [tab]);

  const allColored =
    currentTemplate.parts.filter((k) => filledParts[k]).length >= currentTemplate.parts.length;

  return (
    <section className="activity-stage" aria-labelledby="coloring-title">
      <div className="stage-header">
        <div>
          <h1 id="coloring-title" className="stage-title">Buku Warna &amp; Gambar Musik</h1>
          <p className="stage-subtitle">{prompt}</p>
        </div>
        <div className="stage-actions">
          <button
            type="button"
            className="voice-btn"
            onClick={() => playVoice(currentVoice)}
            aria-label="Dengar petunjuk suara"
          >
            <IconSpeaker size={22} />
            <span>Dengar</span>
          </button>
          {tab === 'book' ? (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => handleSwitchTemplate((templateIdx + 1) % TEMPLATES.length)}
            >
              Ganti Gambar
            </button>
          ) : (
            <button type="button" className="secondary-btn" onClick={handleClearCanvas}>
              Hapus Kanvas
            </button>
          )}
        </div>
      </div>

      <div className="mode-switcher" role="tablist" aria-label="Pilih mode melukis">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'book'}
          className={`mode-tab ${tab === 'book' ? 'is-active' : ''}`}
          onClick={() => {
            setTab('book');
            setPrompt('Pilih warna di bawah, lalu sentuh bagian gambar.');
            setCurrentVoice('coloring-tab-book');
            playVoice('coloring-tab-book');
          }}
        >
          Buku Mewarnai
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'music'}
          className={`mode-tab ${tab === 'music' ? 'is-active' : ''}`}
          onClick={() => {
            setTab('music');
            setPrompt('Goreskan jarimu untuk melukis dan mendengar alunan nada musik.');
            setCurrentVoice('coloring-tab-music');
            playVoice('coloring-tab-music');
          }}
        >
          Lukis Musik (Doodle)
        </button>
      </div>

      {tab === 'book' ? (
        <div className="coloring-content-wrap">
          <div className="coloring-svg-canvas">
            {currentTemplate.id === 'apple' && (
              <svg viewBox="0 0 320 320" className="coloring-svg" role="img" aria-label="Gambar Apel Ceria">
                {/* Stem */}
                <path
                  d="M152 40C155 24 165 14 174 12C172 26 164 36 156 46Z"
                  fill={filledParts['stem'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('stem', 329)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Leaf */}
                <path
                  d="M165 30C195 20 220 35 224 56C194 65 175 48 165 30Z"
                  fill={filledParts['leaf'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('leaf', 440)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Apple Body */}
                <path
                  d="M160 68C110 32 46 80 46 160C46 244 116 280 160 286C204 280 274 244 274 160C274 80 210 32 160 68Z"
                  fill={filledParts['body'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('body', 261)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Cute Eyes & Smile (fixed line-art) */}
                <circle cx="120" cy="148" r="7" fill="#182421" />
                <circle cx="200" cy="148" r="7" fill="#182421" />
                <path d="M142 178C152 192 168 192 178 178" stroke="#182421" strokeWidth="4.5" strokeLinecap="round" />
                {/* Cheeks */}
                <circle
                  cx="102"
                  cy="172"
                  r="14"
                  fill={filledParts['cheekLeft'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="3.5"
                  onClick={() => handlePartClick('cheekLeft', 523)}
                  style={{ cursor: 'pointer' }}
                />
                <circle
                  cx="218"
                  cy="172"
                  r="14"
                  fill={filledParts['cheekRight'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="3.5"
                  onClick={() => handlePartClick('cheekRight', 587)}
                  style={{ cursor: 'pointer' }}
                />
              </svg>
            )}

            {currentTemplate.id === 'fish' && (
              <svg viewBox="0 0 320 320" className="coloring-svg" role="img" aria-label="Gambar Ikan">
                {/* Bubble 1 */}
                <circle
                  cx="264"
                  cy="72"
                  r="18"
                  fill={filledParts['bubble1'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="3.5"
                  onClick={() => handlePartClick('bubble1', 659)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Bubble 2 */}
                <circle
                  cx="288"
                  cy="124"
                  r="12"
                  fill={filledParts['bubble2'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="3"
                  onClick={() => handlePartClick('bubble2', 783)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Tail */}
                <path
                  d="M102 160L32 108C42 152 42 168 32 212L102 160Z"
                  fill={filledParts['tail'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4.5"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('tail', 293)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Top fin */}
                <path
                  d="M136 102C158 64 200 68 214 98"
                  fill={filledParts['finTop'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('finTop', 392)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Bottom fin */}
                <path
                  d="M152 218C172 254 204 252 214 222"
                  fill={filledParts['finBottom'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('finBottom', 349)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Body */}
                <path
                  d="M88 160C88 96 172 82 250 160C172 238 88 224 88 160Z"
                  fill={filledParts['body'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('body', 329)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Fish eye & smile */}
                <circle cx="214" cy="144" r="6" fill="#182421" />
                <path d="M236 166C232 174 224 176 220 174" stroke="#182421" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}

            {currentTemplate.id === 'butterfly' && (
              <svg viewBox="0 0 320 320" className="coloring-svg" role="img" aria-label="Gambar Kupu-kupu">
                {/* Top-Left Wing */}
                <path
                  d="M154 136C122 72 48 54 38 108C28 152 98 178 154 158Z"
                  fill={filledParts['wingTL'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4.5"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('wingTL', 392)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Bottom-Left Wing */}
                <path
                  d="M154 168C108 178 58 206 72 254C88 290 142 248 154 198Z"
                  fill={filledParts['wingBL'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('wingBL', 261)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Top-Right Wing */}
                <path
                  d="M166 136C198 72 272 54 282 108C292 152 222 178 166 158Z"
                  fill={filledParts['wingTR'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4.5"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('wingTR', 523)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Bottom-Right Wing */}
                <path
                  d="M166 168C212 178 262 206 248 254C232 290 178 248 166 198Z"
                  fill={filledParts['wingBR'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('wingBR', 329)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Butterfly Body */}
                <rect
                  x="150"
                  y="108"
                  width="20"
                  height="104"
                  rx="10"
                  fill={filledParts['body'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4.5"
                  onClick={() => handlePartClick('body', 440)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Antennae */}
                <path d="M154 108C142 86 126 84 122 92" stroke="#182421" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M166 108C178 86 194 84 198 92" stroke="#182421" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            )}

            {currentTemplate.id === 'flower' && (
              <svg viewBox="0 0 320 320" className="coloring-svg" role="img" aria-label="Gambar Bunga Matahari">
                {/* Stem */}
                <path
                  d="M155 180V286H165V180"
                  fill={filledParts['stem'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4"
                  onClick={() => handlePartClick('stem', 261)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Left Leaf */}
                <path
                  d="M155 230C116 230 92 208 86 220C82 242 124 256 155 244Z"
                  fill={filledParts['leafLeft'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="3.5"
                  onClick={() => handlePartClick('leafLeft', 329)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Right Leaf */}
                <path
                  d="M165 242C204 242 228 220 234 232C238 254 196 268 165 256Z"
                  fill={filledParts['leafRight'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="3.5"
                  onClick={() => handlePartClick('leafRight', 349)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Petals */}
                <path
                  d="M160 50C170 30 190 30 196 52C216 42 232 58 228 78C248 88 248 108 234 122C248 136 238 158 218 162C222 182 204 196 186 188C174 204 150 200 144 184C126 194 106 180 110 160C92 152 86 130 102 116C90 98 104 78 122 80C122 60 144 48 160 50Z"
                  fill={filledParts['petals'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  onClick={() => handlePartClick('petals', 440)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Flower Center */}
                <circle
                  cx="160"
                  cy="120"
                  r="34"
                  fill={filledParts['center'] || '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="4.5"
                  onClick={() => handlePartClick('center', 523)}
                  style={{ cursor: 'pointer' }}
                />
              </svg>
            )}
          </div>

          {/* Palette selector */}
          <div className="palette-tray" role="radiogroup" aria-label="Pilih warna kuas">
            {PALETTE.map((c) => {
              const isSelected = selectedColor.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`palette-swatch ${isSelected ? 'is-selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => handleSelectColor(c)}
                  aria-label={c.name}
                >
                  {isSelected && <span className="swatch-check" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="music-paint-wrap">
          <canvas
            ref={canvasRef}
            className="music-paint-canvas"
            onPointerDown={onPointerDownCanvas}
            onPointerMove={onPointerMoveCanvas}
            onPointerUp={onPointerUpCanvas}
            onPointerCancel={onPointerUpCanvas}
            aria-label="Kanvas melukis bunyi"
          />

          <div className="palette-tray" role="radiogroup" aria-label="Pilih warna cat">
            {PALETTE.map((c) => {
              const isSelected = selectedColor.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`palette-swatch ${isSelected ? 'is-selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => handleSelectColor(c)}
                  aria-label={c.name}
                >
                  {isSelected && <span className="swatch-check" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="progress-strip" aria-live="polite">
        <span>
          {tab === 'book'
            ? `Bagian terwarnai: ${
                Object.keys(filledParts).filter((k) => currentTemplate.parts.includes(k)).length
              } / ${currentTemplate.parts.length} bagian ${allColored ? 'Selesai!' : ''}`
            : 'Lukis Musik: Gerakkan jarimu ke atas (nada tinggi) atau ke bawah (nada rendah)'}
        </span>
      </div>
    </section>
  );
}
