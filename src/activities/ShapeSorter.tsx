import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconSpeaker, ShapeGlyph, type ShapeId } from '../components/Art';
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

const ROUND_SETS: number[][] = [
  [0, 1, 2, 3],
  [2, 4, 5, 0],
  [1, 3, 4, 5]
];

const SLOT_POSITIONS: Point[] = [
  { x: 110, y: 92 },
  { x: 250, y: 92 },
  { x: 390, y: 92 },
  { x: 530, y: 92 }
];

const TRAY_POSITIONS: Point[] = [
  { x: 110, y: 268 },
  { x: 250, y: 268 },
  { x: 390, y: 268 },
  { x: 530, y: 268 }
];

interface PieceState {
  id: string;
  shape: ShapeDef;
  home: Point;
  pos: Point;
  placedSlotId: string | null;
}

function buildRound(roundIdx: number): { slots: (SnapSlot & { shape: ShapeDef })[]; pieces: PieceState[] } {
  const indices = ROUND_SETS[roundIdx % ROUND_SETS.length];
  const chosen = indices.map((i) => ALL_SHAPES[i]);

  const slots = chosen.map((shape, idx) => ({
    id: `slot-${idx}`,
    kind: shape.kind,
    x: SLOT_POSITIONS[idx].x,
    y: SLOT_POSITIONS[idx].y,
    shape
  }));

  const shuffledOrder = [2, 0, 3, 1];
  const pieces = shuffledOrder.map((sourceIdx, trayIdx) => {
    const shape = chosen[sourceIdx];
    const home = TRAY_POSITIONS[trayIdx];
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
  const [roundIdx, setRoundIdx] = useState(0);
  const [board, setBoard] = useState(() => buildRound(0));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Geser keping bentuk ke lubang bayangan yang cocok.');
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
    playVoice('shapes-intro', 80);
    return () => stopVoice();
  }, []);

  function toSvgPoint(clientX: number, clientY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 640,
      y: ((clientY - rect.top) / rect.height) * 360
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
      const msg = `Hebat! ${slot.shape.label} ${slot.shape.colorName.toLowerCase()}.`;
      setPrompt(msg);

      if (placedCount === updated.length) {
        triggerHaptic('success');
        fireConfetti();
        setCurrentClip('shapes-done');
        playVoice(slot.shape.okVoice, 120);
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-shapes');
          setPrompt('Semua bentuk terpasang! Ketuk Papan Baru untuk lanjut.');
          playVoice('shapes-done', 380);
        }, 1250);
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
      // Safe fallback when pointer capture is unsupported or synthetic
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
    const hit = findSnapTarget(pt, board.slots, piece.shape.kind, occupied, 68);
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
      const hint = `Itu lubang ${slot.shape.label.toLowerCase()}. Cari bentuk yang sama ya.`;
      setPrompt(hint);
      setCurrentClip(slot.shape.hintVoice);
      playVoice(slot.shape.hintVoice);
    }
  }

  function nextRound(): void {
    const next = roundIdx + 1;
    setRoundIdx(next);
    setBoard(buildRound(next));
    setSelectedId(null);
    draggingIdRef.current = null;
    setDraggingId(null);
    setPrompt('Papan baru siap! Ayo pasang keempat bentuknya.');
    setCurrentClip('shapes-new-board');
    playVoice('shapes-new-board');
  }

  const allPlaced = board.pieces.every((p) => p.placedSlotId !== null);

  return (
    <section className="activity-stage" aria-labelledby="sorter-title">
      <div className="stage-header">
        <div>
          <h1 id="sorter-title" className="stage-title">Pasang Bentuk Kayu</h1>
          <p className="stage-subtitle">{prompt}</p>
        </div>
        <div className="stage-actions">
          <button type="button" className="voice-btn" onClick={() => playVoice(currentClip)}>
            <IconSpeaker size={22} />
            <span>Dengar</span>
          </button>
          <button type="button" className="secondary-btn" onClick={nextRound}>
            {allPlaced ? 'Papan Baru' : 'Acak Lagi'}
          </button>
        </div>
      </div>

      <div className="sorter-board-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 640 360"
          className="sorter-svg"
          role="application"
          aria-label="Papan pasang bentuk"
        >
          <rect
            x="24"
            y="20"
            width="592"
            height="146"
            rx="24"
            fill="#EFE8D8"
            stroke="#D5CBB4"
            strokeWidth="3"
            pointerEvents="none"
          />
          <rect
            x="24"
            y="190"
            width="592"
            height="150"
            rx="24"
            fill="#E4ECE0"
            pointerEvents="none"
          />

          {board.slots.map((slot) => (
            <g
              key={slot.id}
              transform={`translate(${slot.x - 42}, ${slot.y - 42})`}
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
              <ShapeGlyph shape={slot.shape.kind} fill={slot.shape.fill} size={84} cutout />
            </g>
          ))}

          {board.pieces.map((piece) => {
            const isSelected = selectedId === piece.id && !piece.placedSlotId;
            const isDragging = draggingId === piece.id;
            const scale = isDragging ? 1.12 : 1;
            return (
              <g
                key={piece.id}
                transform={`translate(${piece.pos.x}, ${piece.pos.y}) scale(${scale}) translate(-42, -42)`}
                onPointerDown={(e) => handlePointerDown(e, piece)}
                onPointerMove={(e) => handlePointerMove(e, piece)}
                onPointerUp={(e) => handlePointerUp(e, piece)}
                onPointerCancel={(e) => handlePointerUp(e, piece)}
                onClick={() => {
                  if (piece.placedSlotId) return;
                  playGentlePop();
                  setSelectedId(piece.id);
                  setPrompt(`Keping ${piece.shape.label} dipilih. Ketuk lubang yang cocok di atas!`);
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !piece.placedSlotId) {
                    e.preventDefault();
                    playGentlePop();
                    setSelectedId(piece.id);
                    setPrompt(`Keping ${piece.shape.label} dipilih. Ketuk lubang yang cocok di atas!`);
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
                  <circle cx="42" cy="42" r="46" fill="none" stroke="#1F7A5C" strokeWidth="3.5" strokeDasharray="6 4" />
                )}
                <ShapeGlyph shape={piece.shape.kind} fill={piece.shape.fill} size={84} />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="progress-strip" aria-live="polite">
        <span>Terpasang: {board.pieces.filter((p) => p.placedSlotId !== null).length} / {board.pieces.length} bentuk</span>
      </div>
    </section>
  );
}
