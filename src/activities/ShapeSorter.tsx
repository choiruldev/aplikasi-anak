import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconSpeaker, ShapeGlyph, VisualStarMeter, type ShapeId } from '../components/Art';
import {
  playGentlePop,
  playStepNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { findSnapTarget, type Point, type SnapSlot } from '../lib/geometry';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

interface ShapeDef {
  kind: ShapeId;
  label: string;
  colorName: string;
  fill: string;
  okVoice: VoiceClipId;
  hintVoice: VoiceClipId;
}

const ALL_SHAPES: ShapeDef[] = [
  { kind: 'circle', label: 'Lingkaran', colorName: 'Merah', fill: '#D94848', okVoice: 'shape-ok-circle', hintVoice: 'shape-hint-circle' },
  { kind: 'square', label: 'Persegi', colorName: 'Biru', fill: '#2978B5', okVoice: 'shape-ok-square', hintVoice: 'shape-hint-square' },
  { kind: 'triangle', label: 'Segitiga', colorName: 'Kuning', fill: '#E89F1C', okVoice: 'shape-ok-triangle', hintVoice: 'shape-hint-triangle' },
  { kind: 'star', label: 'Bintang', colorName: 'Hijau', fill: '#2B9361', okVoice: 'shape-ok-star', hintVoice: 'shape-hint-star' },
  { kind: 'diamond', label: 'Belah Ketupat', colorName: 'Jingga', fill: '#E06B34', okVoice: 'shape-ok-diamond', hintVoice: 'shape-hint-diamond' },
  { kind: 'heart', label: 'Hati', colorName: 'Toska', fill: '#1D9A9E', okVoice: 'shape-ok-heart', hintVoice: 'shape-hint-heart' }
];

const ROUND_SETS_4: number[][] = [
  [0, 1, 2, 3],
  [2, 4, 5, 0],
  [1, 3, 4, 5]
];

const SLOT_POS_4: Point[] = [
  { x: 130, y: 74 },
  { x: 290, y: 74 },
  { x: 130, y: 158 },
  { x: 290, y: 158 }
];

const TRAY_POS_4: Point[] = [
  { x: 130, y: 274 },
  { x: 290, y: 274 },
  { x: 130, y: 358 },
  { x: 290, y: 358 }
];

const SLOT_POS_6: Point[] = [
  { x: 96, y: 74 },
  { x: 210, y: 74 },
  { x: 324, y: 74 },
  { x: 96, y: 158 },
  { x: 210, y: 158 },
  { x: 324, y: 158 }
];

const TRAY_POS_6: Point[] = [
  { x: 96, y: 274 },
  { x: 210, y: 274 },
  { x: 324, y: 274 },
  { x: 96, y: 358 },
  { x: 210, y: 358 },
  { x: 324, y: 358 }
];

type LevelMode = 'easy4' | 'mix6';

interface PieceState {
  id: string;
  shape: ShapeDef;
  home: Point;
  pos: Point;
  placedSlotId: string | null;
}

function buildRound(
  roundIdx: number,
  level: LevelMode
): { slots: (SnapSlot & { shape: ShapeDef })[]; pieces: PieceState[] } {
  const isSix = level === 'mix6';
  const indices = isSix ? [0, 1, 2, 3, 4, 5] : ROUND_SETS_4[roundIdx % ROUND_SETS_4.length];
  const chosen = indices.map((i) => ALL_SHAPES[i]);
  const slotPos = isSix ? SLOT_POS_6 : SLOT_POS_4;
  const trayPos = isSix ? TRAY_POS_6 : TRAY_POS_4;

  const slots = chosen.map((shape, idx) => ({
    id: `slot-${idx}`,
    kind: shape.kind,
    x: slotPos[idx].x,
    y: slotPos[idx].y,
    shape
  }));

  const order = isSix
    ? [(roundIdx + 3) % 6, (roundIdx + 1) % 6, (roundIdx + 5) % 6, (roundIdx + 0) % 6, (roundIdx + 4) % 6, (roundIdx + 2) % 6]
    : [2, 0, 3, 1];

  const pieces = order.map((sourceIdx, trayIdx) => {
    const shape = chosen[sourceIdx];
    const home = trayPos[trayIdx];
    return {
      id: `piece-${sourceIdx}`,
      shape,
      home,
      pos: { ...home },
      placedSlotId: null
    };
  });

  return { slots, pieces };
}

export function ShapeSorter({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [level, setLevel] = useState<LevelMode>('easy4');
  const [roundIdx, setRoundIdx] = useState(0);
  const [board, setBoard] = useState(() => buildRound(0, 'easy4'));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Seret atau ketuk bentuk ke bayangan yang pas!');
  const [currentClip, setCurrentClip] = useState<VoiceClipId>('shapes-intro');
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    preloadVoices([
      'shapes-intro',
      'shapes-new-board',
      'shapes-done',
      ...ALL_SHAPES.map((s) => s.okVoice),
      ...ALL_SHAPES.map((s) => s.hintVoice)
    ]);
    return () => stopVoice();
  }, []);

  function toSvgPoint(clientX: number, clientY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 420,
      y: ((clientY - rect.top) / rect.height) * 420
    };
  }

  function finishPlacement(pieceId: string, slot: SnapSlot & { shape: ShapeDef }): void {
    triggerHaptic('snap');
    setBoard((prev) => {
      const updated = prev.pieces.map((p) =>
        p.id === pieceId ? { ...p, pos: { x: slot.x, y: slot.y }, placedSlotId: slot.id } : p
      );
      const placedCount = updated.filter((p) => p.placedSlotId !== null).length;
      playStepNote(placedCount + 1);
      setPrompt(`Hebat! ${slot.shape.label} pas!`);

      if (placedCount === updated.length) {
        triggerHaptic('success');
        fireConfetti();
        setCurrentClip('shapes-done');
        playVoice(slot.shape.okVoice, 120);
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-shapes');
          setPrompt('Yeaaay! Semua bentuk terpasang rapi!');
          playVoice('shapes-done', 360);
        }, 1100);
      } else {
        setCurrentClip(slot.shape.okVoice);
        playVoice(slot.shape.okVoice, 140);
      }
      return { ...prev, pieces: updated };
    });
  }

  function handlePointerDown(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (piece.placedSlotId) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
    playGentlePop();
    draggingIdRef.current = piece.id;
    setDraggingId(piece.id);
    setSelectedId(piece.id);
    const pt = toSvgPoint(e.clientX, e.clientY);
    setBoard((prev) => ({
      ...prev,
      pieces: prev.pieces.map((p) => (p.id === piece.id ? { ...p, pos: pt } : p))
    }));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (draggingIdRef.current !== piece.id) return;
    const pt = toSvgPoint(e.clientX, e.clientY);
    setBoard((prev) => ({
      ...prev,
      pieces: prev.pieces.map((p) => (p.id === piece.id ? { ...p, pos: pt } : p))
    }));
  }

  function handlePointerUp(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (draggingIdRef.current !== piece.id) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release capture errors
    }
    draggingIdRef.current = null;
    setDraggingId(null);

    const pt = toSvgPoint(e.clientX, e.clientY);
    const occupied = new Set(
      board.pieces.map((p) => p.placedSlotId).filter((id): id is string => id !== null)
    );
    const hit = findSnapTarget(pt, board.slots, piece.shape.kind, occupied, 58);
    if (hit) {
      const fullSlot = board.slots.find((s) => s.id === hit.id)!;
      setSelectedId(null);
      finishPlacement(piece.id, fullSlot);
    } else {
      setBoard((prev) => ({
        ...prev,
        pieces: prev.pieces.map((p) => (p.id === piece.id ? { ...p, pos: { ...p.home } } : p))
      }));
    }
  }

  function handleSlotClick(slot: SnapSlot & { shape: ShapeDef }): void {
    if (!selectedId) return;
    const piece = board.pieces.find((p) => p.id === selectedId && !p.placedSlotId);
    if (!piece) return;
    const occupied = new Set(
      board.pieces.map((p) => p.placedSlotId).filter((id): id is string => id !== null)
    );
    if (occupied.has(slot.id)) return;
    if (piece.shape.kind === slot.kind) {
      setSelectedId(null);
      finishPlacement(piece.id, slot);
    } else {
      setPrompt(`Ini lubang ${slot.shape.label}. Cari bentuk yang sama ya!`);
      setCurrentClip(slot.shape.hintVoice);
      playVoice(slot.shape.hintVoice);
    }
  }

  function switchLevel(nextLevel: LevelMode): void {
    setLevel(nextLevel);
    setRoundIdx(0);
    setBoard(buildRound(0, nextLevel));
    setSelectedId(null);
    draggingIdRef.current = null;
    setDraggingId(null);
    setPrompt(nextLevel === 'mix6' ? 'Tantangan 6 bentuk! Pasang semuanya!' : 'Pasang keempat bentuk ke bayangannya!');
    setCurrentClip('shapes-new-board');
    playVoice('shapes-new-board');
  }

  function nextRound(): void {
    const next = roundIdx + 1;
    setRoundIdx(next);
    setBoard(buildRound(next, level));
    setSelectedId(null);
    draggingIdRef.current = null;
    setDraggingId(null);
    setPrompt('Papan baru siap! Ayo cocokkan lagi!');
    setCurrentClip('shapes-new-board');
    playVoice('shapes-new-board');
  }

  const placedCount = board.pieces.filter((p) => p.placedSlotId !== null).length;
  const allPlaced = placedCount === board.pieces.length;
  const glyphSize = level === 'mix6' ? 68 : 76;
  const half = glyphSize / 2;

  return (
    <section className="game-clean-stage" aria-label="Kotak Bentuk">
      <div className="game-top-bar">
        <div className="segmented-tabs" role="tablist" aria-label="Level bentuk">
          <button
            type="button"
            role="tab"
            aria-selected={level === 'easy4'}
            className={`seg-tab touch-safe ${level === 'easy4' ? 'is-active' : ''}`}
            onClick={() => switchLevel('easy4')}
          >
            4 Bentuk
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={level === 'mix6'}
            className={`seg-tab touch-safe ${level === 'mix6' ? 'is-active' : ''}`}
            onClick={() => switchLevel('mix6')}
          >
            6 Campur
          </button>
        </div>

        <div className="game-top-tools">
          <VisualStarMeter count={placedCount} total={board.pieces.length} />
          <button
            type="button"
            className="icon-tool-btn touch-safe"
            onClick={() => playVoice(currentClip)}
            aria-label="Dengar suara"
          >
            <IconSpeaker size={20} />
          </button>
          <button type="button" className="secondary-btn touch-safe" onClick={nextRound}>
            {allPlaced ? 'Lagi 🔄' : 'Acak'}
          </button>
        </div>
      </div>

      <p className="game-mini-status">{prompt}</p>

      <div className="sorter-board-wrap portrait-board">
        <svg
          ref={svgRef}
          viewBox="0 0 420 420"
          className="sorter-svg portrait-svg"
          role="application"
          aria-label="Papan pasang bentuk"
        >
          {/* Upper wooden slots board */}
          <rect
            x="14"
            y="14"
            width="392"
            height="196"
            rx="24"
            fill="#EFE8D8"
            stroke="#D5CBB4"
            strokeWidth="3"
            pointerEvents="none"
          />
          {/* Lower tray */}
          <rect
            x="14"
            y="222"
            width="392"
            height="186"
            rx="24"
            fill="#E4ECE0"
            pointerEvents="none"
          />

          {board.slots.map((slot) => (
            <g
              key={slot.id}
              transform={`translate(${slot.x - half}, ${slot.y - half})`}
              onClick={() => handleSlotClick(slot)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSlotClick(slot);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Lubang ${slot.shape.label}`}
              style={{ cursor: 'pointer' }}
            >
              <ShapeGlyph shape={slot.shape.kind} fill={slot.shape.fill} size={glyphSize} cutout />
            </g>
          ))}

          {board.pieces.map((piece) => {
            const isSelected = selectedId === piece.id && !piece.placedSlotId;
            const isDragging = draggingId === piece.id;
            const scale = isDragging ? 1.12 : 1;
            return (
              <g
                key={piece.id}
                transform={`translate(${piece.pos.x}, ${piece.pos.y}) scale(${scale}) translate(${-half}, ${-half})`}
                onPointerDown={(e) => handlePointerDown(e, piece)}
                onPointerMove={(e) => handlePointerMove(e, piece)}
                onPointerUp={(e) => handlePointerUp(e, piece)}
                onPointerCancel={(e) => handlePointerUp(e, piece)}
                onClick={() => {
                  if (piece.placedSlotId) return;
                  playGentlePop();
                  setSelectedId(piece.id);
                  setPrompt(`${piece.shape.label} dipilih. Ketuk lubang yang cocok di atas!`);
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !piece.placedSlotId) {
                    e.preventDefault();
                    playGentlePop();
                    setSelectedId(piece.id);
                    setPrompt(`${piece.shape.label} dipilih. Ketuk lubang yang cocok di atas!`);
                  }
                }}
                tabIndex={piece.placedSlotId ? -1 : 0}
                role="button"
                aria-label={`Keping ${piece.shape.label} ${piece.shape.colorName}`}
                style={{
                  cursor: piece.placedSlotId ? 'default' : 'grab',
                  touchAction: 'none'
                }}
              >
                {isSelected && (
                  <circle
                    cx={half}
                    cy={half}
                    r={half + 5}
                    fill="none"
                    stroke="#1F7A5C"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                  />
                )}
                <ShapeGlyph shape={piece.shape.kind} fill={piece.shape.fill} size={glyphSize} />
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
