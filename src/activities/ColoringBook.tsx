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
  { id: 'fish', title: 'Ikan', parts: ['body', 'stripe', 'tail', 'finTop', 'finBottom', 'finSide', 'bubbles'] },
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
                  {/* Stem tucked firmly into apple cleft */}
                  <path
                    d="M153 102C153 72 156 48 164 31C169 27 175 30 176 37C169 54 167 74 167 102Z"
                    fill={fill('stem')}
                    stroke="#182421"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('stem', 329)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Teardrop leaf attached cleanly to stem */}
                  <path
                    d="M167 64C182 34 218 28 242 44C226 74 188 80 167 64Z"
                    fill={fill('leaf')}
                    stroke="#182421"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('leaf', 440)}
                    style={{ cursor: 'pointer' }}
                  />
                  <path
                    d="M174 61C194 52 212 48 228 46"
                    stroke="#182421"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    pointerEvents="none"
                  />
                  {/* Plump symmetric apple body with classic top cleft & bottom dimple */}
                  <path
                    d="M160 92C136 68 88 72 66 106C42 142 46 208 82 248C104 272 134 274 152 264C157 261 163 261 168 264C186 274 216 272 238 248C274 208 278 142 254 106C232 72 184 68 160 92Z"
                    fill={fill('body')}
                    stroke="#182421"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('body', 261)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Subtle top cleft crease & glossy highlight arc */}
                  <path
                    d="M144 96C154 105 166 105 176 96"
                    stroke="#182421"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    pointerEvents="none"
                  />
                  <path
                    d="M84 114C73 128 69 144 71 158"
                    stroke="#182421"
                    strokeOpacity="0.18"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    pointerEvents="none"
                  />
                  {/* Rosy cheeks (colorable ovals) */}
                  <ellipse
                    cx="98"
                    cy="182"
                    rx="16"
                    ry="10"
                    fill={fill('cheekLeft')}
                    stroke="#182421"
                    strokeWidth="3"
                    onClick={() => handlePartClick('cheekLeft', 523)}
                    style={{ cursor: 'pointer' }}
                  />
                  <ellipse
                    cx="222"
                    cy="182"
                    rx="16"
                    ry="10"
                    fill={fill('cheekRight')}
                    stroke="#182421"
                    strokeWidth="3"
                    onClick={() => handlePartClick('cheekRight', 587)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Friendly smiling face */}
                  <g pointerEvents="none">
                    <circle cx="124" cy="158" r="8.5" fill="#182421" />
                    <circle cx="121" cy="155" r="2.8" fill="#FFFFFF" />
                    <circle cx="196" cy="158" r="8.5" fill="#182421" />
                    <circle cx="193" cy="155" r="2.8" fill="#FFFFFF" />
                    <path d="M142 184C150 198 170 198 178 184" stroke="#182421" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  </g>
                </>
              )}
              {currentTemplate.id === 'fish' && (
                <>
                  <defs>
                    <clipPath id="coloring-fish-body-clip">
                      <path d="M96 156C116 108 164 88 214 96C248 102 272 128 278 152C271 156 263 158 256 158C263 160 271 163 276 169C268 195 244 214 210 218C162 224 116 204 96 156Z" />
                    </clipPath>
                  </defs>
                  {/* Rising bubble trio */}
                  <g onClick={() => handlePartClick('bubbles', 659)} style={{ cursor: 'pointer' }}>
                    <circle cx="288" cy="112" r="14" fill={fill('bubbles')} stroke="#182421" strokeWidth="3.5" />
                    <circle cx="272" cy="80" r="10" fill={fill('bubbles')} stroke="#182421" strokeWidth="3.5" />
                    <circle cx="290" cy="54" r="7" fill={fill('bubbles')} stroke="#182421" strokeWidth="3" />
                    <path d="M283 106C285 103 288 102 291 103" stroke="#182421" strokeOpacity="0.35" strokeWidth="2.2" strokeLinecap="round" fill="none" pointerEvents="none" />
                  </g>
                  {/* Flowing bi-lobed caudal tail fin */}
                  <path
                    d="M104 156C82 118 56 96 34 100C24 102 26 124 44 148C48 154 48 158 44 164C26 188 24 210 34 212C56 216 82 194 104 156Z"
                    fill={fill('tail')}
                    stroke="#182421"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('tail', 329)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Flowing top dorsal fin tucked smoothly behind body */}
                  <path
                    d="M134 112C142 62 178 52 214 74C222 80 220 98 210 108Z"
                    fill={fill('finTop')}
                    stroke="#182421"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('finTop', 440)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Bottom pelvic fin tucked smoothly behind belly */}
                  <path
                    d="M146 202C154 246 184 252 204 234C210 228 206 212 198 204Z"
                    fill={fill('finBottom')}
                    stroke="#182421"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('finBottom', 493)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Organic fish body with smiling mouth */}
                  <path
                    d="M96 156C116 108 164 88 214 96C248 102 272 128 278 152C271 156 263 158 256 158C263 160 271 163 276 169C268 195 244 214 210 218C162 224 116 204 96 156Z"
                    fill={fill('body')}
                    stroke="#182421"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('body', 261)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Curved tropical stripe cleanly clipped to fish body */}
                  <g clipPath="url(#coloring-fish-body-clip)">
                    <path
                      d="M150 86C136 132 136 180 150 226L186 226C172 180 172 132 186 86Z"
                      fill={fill('stripe')}
                      stroke="#182421"
                      strokeWidth="4"
                      onClick={() => handlePartClick('stripe', 392)}
                      style={{ cursor: 'pointer' }}
                    />
                  </g>
                  {/* Crisp re-stroke of body perimeter over clipped stripe */}
                  <path
                    d="M96 156C116 108 164 88 214 96C248 102 272 128 278 152C271 156 263 158 256 158C263 160 271 163 276 169C268 195 244 214 210 218C162 224 116 204 96 156Z"
                    fill="none"
                    stroke="#182421"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    pointerEvents="none"
                  />
                  {/* Colorable teardrop side pectoral fin */}
                  <path
                    d="M194 162C174 152 148 162 144 180C142 192 160 202 184 190C194 185 198 170 194 162Z"
                    fill={fill('finSide')}
                    stroke="#182421"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    onClick={() => handlePartClick('finSide', 587)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Gill arc & expressive cartoon eye */}
                  <g pointerEvents="none">
                    <path d="M210 124C200 144 200 168 210 188" stroke="#182421" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                    <circle cx="236" cy="138" r="13" fill="#FFFFFF" stroke="#182421" strokeWidth="3.5" />
                    <circle cx="239" cy="138" r="7" fill="#182421" />
                    <circle cx="242" cy="134" r="2.6" fill="#FFFFFF" />
                  </g>
                </>
              )}
              {currentTemplate.id === 'butterfly' && (
                <>
                  <path d="M148 134C116 74 52 62 42 108C34 146 76 170 144 160Z" fill={fill('wingTL')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('wingTL', 329)} style={{ cursor: 'pointer' }} />
                  <path d="M172 134C204 74 268 62 278 108C286 146 244 170 176 160Z" fill={fill('wingTR')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('wingTR', 392)} style={{ cursor: 'pointer' }} />
                  <path d="M146 162C96 158 58 188 74 226C88 258 136 248 150 202Z" fill={fill('wingBL')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('wingBL', 440)} style={{ cursor: 'pointer' }} />
                  <path d="M174 162C224 158 262 188 246 226C232 258 184 248 170 202Z" fill={fill('wingBR')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('wingBR', 523)} style={{ cursor: 'pointer' }} />
                  <rect x="142" y="76" width="36" height="158" rx="18" fill={fill('body')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <g pointerEvents="none">
                    <path d="M150 78C142 52 128 46 122 48M170 78C178 52 192 46 198 48" stroke="#182421" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <circle cx="120" cy="48" r="5" fill="#182421" />
                    <circle cx="200" cy="48" r="5" fill="#182421" />
                    <circle cx="152" cy="96" r="4" fill="#182421" />
                    <circle cx="168" cy="96" r="4" fill="#182421" />
                    <path d="M153 108C157 113 163 113 167 108" stroke="#182421" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </g>
                </>
              )}
              {currentTemplate.id === 'flower' && (
                <>
                  <rect x="150" y="164" width="20" height="118" rx="10" fill={fill('stem')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('stem', 293)} style={{ cursor: 'pointer' }} />
                  <path d="M150 236C124 214 90 218 82 238C104 256 134 252 150 236Z" fill={fill('leafLeft')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('leafLeft', 349)} style={{ cursor: 'pointer' }} />
                  <path d="M170 236C196 214 230 218 238 238C216 256 186 252 170 236Z" fill={fill('leafRight')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('leafRight', 392)} style={{ cursor: 'pointer' }} />
                  <g onClick={() => handlePartClick('petals', 440)} style={{ cursor: 'pointer' }}>
                    {[0, 60, 120, 180, 240, 300].map((a) => (
                      <circle key={a} cx={160 + Math.cos((a * Math.PI) / 180) * 54} cy={112 + Math.sin((a * Math.PI) / 180) * 54} r="32" fill={fill('petals')} stroke="#182421" strokeWidth="4.5" />
                    ))}
                  </g>
                  <circle cx="160" cy="112" r="38" fill={fill('center')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('center', 523)} style={{ cursor: 'pointer' }} />
                  <g pointerEvents="none">
                    <circle cx="148" cy="106" r="5.5" fill="#182421" />
                    <circle cx="146.5" cy="104.5" r="1.8" fill="#FFFFFF" />
                    <circle cx="172" cy="106" r="5.5" fill="#182421" />
                    <circle cx="170.5" cy="104.5" r="1.8" fill="#FFFFFF" />
                    <path d="M148 122C154 130 166 130 172 122" stroke="#182421" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  </g>
                </>
              )}
              {currentTemplate.id === 'car' && (
                <>
                  <path d="M84 142L114 84C118 78 124 76 132 76H192C200 76 206 78 210 84L240 142Z" fill={fill('roof')} stroke="#182421" strokeWidth="5" strokeLinejoin="round" onClick={() => handlePartClick('roof', 392)} style={{ cursor: 'pointer' }} />
                  <path d="M108 134L126 94H198L216 134Z" fill={fill('window')} stroke="#182421" strokeWidth="4" strokeLinejoin="round" onClick={() => handlePartClick('window', 493)} style={{ cursor: 'pointer' }} />
                  <rect x="40" y="138" width="240" height="72" rx="22" fill={fill('body')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <g pointerEvents="none">
                    <line x1="160" y1="94" x2="160" y2="134" stroke="#182421" strokeWidth="3.5" />
                    <rect x="256" y="156" width="16" height="12" rx="5" fill="#FFFFFF" stroke="#182421" strokeWidth="3" />
                    <rect x="48" y="156" width="14" height="12" rx="5" fill="#FFFFFF" stroke="#182421" strokeWidth="3" />
                  </g>
                  <circle cx="102" cy="212" r="32" fill={fill('wheelL')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('wheelL', 329)} style={{ cursor: 'pointer' }} />
                  <circle cx="220" cy="212" r="32" fill={fill('wheelR')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('wheelR', 349)} style={{ cursor: 'pointer' }} />
                  <g pointerEvents="none">
                    <circle cx="102" cy="212" r="12" fill="#FFFFFF" stroke="#182421" strokeWidth="3.5" />
                    <circle cx="220" cy="212" r="12" fill="#FFFFFF" stroke="#182421" strokeWidth="3.5" />
                  </g>
                </>
              )}
              {currentTemplate.id === 'rocket' && (
                <>
                  <path d="M132 232C132 264 150 278 160 284C170 278 188 264 188 232Z" fill={fill('flame')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('flame', 523)} style={{ cursor: 'pointer' }} />
                  <path d="M116 172C84 186 64 208 62 230L116 220Z" fill={fill('finL')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('finL', 329)} style={{ cursor: 'pointer' }} />
                  <path d="M204 172C236 186 256 208 258 230L204 220Z" fill={fill('finR')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('finR', 349)} style={{ cursor: 'pointer' }} />
                  <path d="M114 102H206V218C206 228 198 234 188 234H132C122 234 114 228 114 218Z" fill={fill('body')} stroke="#182421" strokeWidth="5" strokeLinejoin="round" onClick={() => handlePartClick('body', 261)} style={{ cursor: 'pointer' }} />
                  <path d="M114 102C122 50 152 24 160 20C168 24 198 50 206 102Z" fill={fill('nose')} stroke="#182421" strokeWidth="5" strokeLinejoin="round" onClick={() => handlePartClick('nose', 440)} style={{ cursor: 'pointer' }} />
                  <circle cx="160" cy="154" r="24" fill={fill('window')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('window', 587)} style={{ cursor: 'pointer' }} />
                  <circle cx="160" cy="154" r="30" fill="none" stroke="#182421" strokeWidth="3" strokeDasharray="6 6" pointerEvents="none" />
                </>
              )}
              {currentTemplate.id === 'house' && (
                <>
                  <polygon points="40,138 160,38 280,138" fill={fill('roof')} stroke="#182421" strokeWidth="5" strokeLinejoin="round" onClick={() => handlePartClick('roof', 392)} style={{ cursor: 'pointer' }} />
                  <rect x="68" y="138" width="184" height="134" rx="8" fill={fill('wall')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('wall', 261)} style={{ cursor: 'pointer' }} />
                  <rect x="136" y="192" width="48" height="80" rx="8" fill={fill('door')} stroke="#182421" strokeWidth="4.5" onClick={() => handlePartClick('door', 329)} style={{ cursor: 'pointer' }} />
                  <rect x="84" y="158" width="40" height="40" rx="6" fill={fill('winL')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('winL', 440)} style={{ cursor: 'pointer' }} />
                  <rect x="196" y="158" width="40" height="40" rx="6" fill={fill('winR')} stroke="#182421" strokeWidth="4" onClick={() => handlePartClick('winR', 493)} style={{ cursor: 'pointer' }} />
                  <g pointerEvents="none">
                    <circle cx="174" cy="234" r="4" fill="#182421" />
                    <line x1="104" y1="158" x2="104" y2="198" stroke="#182421" strokeWidth="3" />
                    <line x1="84" y1="178" x2="124" y2="178" stroke="#182421" strokeWidth="3" />
                    <line x1="216" y1="158" x2="216" y2="198" stroke="#182421" strokeWidth="3" />
                    <line x1="196" y1="178" x2="236" y2="178" stroke="#182421" strokeWidth="3" />
                  </g>
                </>
              )}
              {currentTemplate.id === 'elephant' && (
                <>
                  <ellipse cx="76" cy="148" rx="54" ry="62" fill={fill('earL')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('earL', 329)} style={{ cursor: 'pointer' }} />
                  <ellipse cx="244" cy="148" rx="54" ry="62" fill={fill('earR')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('earR', 392)} style={{ cursor: 'pointer' }} />
                  <circle cx="160" cy="142" r="76" fill={fill('head')} stroke="#182421" strokeWidth="5" onClick={() => handlePartClick('head', 261)} style={{ cursor: 'pointer' }} />
                  <path d="M142 162C142 196 142 246 164 264C182 276 206 266 204 246C202 234 188 234 182 242C176 242 174 226 176 162Z" fill={fill('trunk')} stroke="#182421" strokeWidth="4.5" strokeLinejoin="round" onClick={() => handlePartClick('trunk', 440)} style={{ cursor: 'pointer' }} />
                  <g pointerEvents="none">
                    <circle cx="128" cy="130" r="8.5" fill="#182421" />
                    <circle cx="125.5" cy="127.5" r="2.8" fill="#FFFFFF" />
                    <circle cx="192" cy="130" r="8.5" fill="#182421" />
                    <circle cx="189.5" cy="127.5" r="2.8" fill="#FFFFFF" />
                    <path d="M148 188H170M148 206H168" stroke="#182421" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
                  </g>
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
