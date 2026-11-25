import { useEffect, useMemo, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconSpeaker } from '../components/Art';
import {
  playSuccessChime,
  playVoice,
  playWoodClick,
  preloadVoices,
  stopVoice
} from '../lib/audio';
import { distance, type Point } from '../lib/geometry';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

interface PuzzlePicture {
  id: string;
  title: string;
  chipLabel: string;
  renderSvg: () => JSX.Element;
}

const PICTURES: PuzzlePicture[] = [
  {
    id: 'cat',
    title: 'Kucing Oren',
    chipLabel: '🐱 Kucing',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#FCE9DF" />
        <polygon points="60,110 50,40 120,70" fill="#E06B34" stroke="#182421" strokeWidth="5" />
        <polygon points="220,110 230,40 160,70" fill="#E06B34" stroke="#182421" strokeWidth="5" />
        <circle cx="140" cy="150" r="85" fill="#F08A4B" stroke="#182421" strokeWidth="6" />
        <circle cx="105" cy="135" r="14" fill="#FFFFFF" stroke="#182421" strokeWidth="4" />
        <circle cx="105" cy="135" r="7" fill="#182421" />
        <circle cx="175" cy="135" r="14" fill="#FFFFFF" stroke="#182421" strokeWidth="4" />
        <circle cx="175" cy="135" r="7" fill="#182421" />
        <polygon points="134,160 146,160 140,170" fill="#D94848" />
        <path d="M140 170V182C130 190 118 186 112 180M140 182C150 190 162 186 168 180" stroke="#182421" strokeWidth="5" strokeLinecap="round" />
        <path d="M50 145H90M50 160H90M190 145H230M190 160H230" stroke="#182421" strokeWidth="5" strokeLinecap="round" />
      </g>
    )
  },
  {
    id: 'elephant',
    title: 'Gajah Biru',
    chipLabel: '🐘 Gajah',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#E2EEF6" />
        <circle cx="68" cy="130" r="50" fill="#5D8AA8" stroke="#182421" strokeWidth="5" />
        <circle cx="212" cy="130" r="50" fill="#5D8AA8" stroke="#182421" strokeWidth="5" />
        <circle cx="140" cy="140" r="72" fill="#76A5C4" stroke="#182421" strokeWidth="6" />
        <circle cx="112" cy="120" r="10" fill="#182421" />
        <circle cx="168" cy="120" r="10" fill="#182421" />
        <path d="M140 150V210C140 230 162 230 168 215" fill="none" stroke="#5D8AA8" strokeWidth="26" strokeLinecap="round" />
        <path d="M116 190C110 205 100 205 95 195" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M164 190C170 205 180 205 185 195" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
      </g>
    )
  },
  {
    id: 'watermelon',
    title: 'Semangka',
    chipLabel: '🍉 Semangka',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#EBF6EA" />
        <path d="M30 140C30 220 90 250 140 250C190 250 250 220 250 140Z" fill="#2B9361" stroke="#182421" strokeWidth="6" />
        <path d="M42 140C42 210 95 236 140 236C185 236 238 210 238 140Z" fill="#F0F6EE" />
        <path d="M52 140C52 200 100 224 140 224C180 224 228 200 228 140Z" fill="#E53935" stroke="#182421" strokeWidth="5" />
        <circle cx="95" cy="165" r="5" fill="#182421" />
        <circle cx="140" cy="180" r="5" fill="#182421" />
        <circle cx="185" cy="165" r="5" fill="#182421" />
        <circle cx="120" cy="155" r="4.5" fill="#182421" />
        <circle cx="160" cy="155" r="4.5" fill="#182421" />
      </g>
    )
  },
  {
    id: 'sun',
    title: 'Matahari',
    chipLabel: '☀️ Matahari',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#FFF9E6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="140"
            y1="140"
            x2={140 + Math.cos((angle * Math.PI) / 180) * 115}
            y2={140 + Math.sin((angle * Math.PI) / 180) * 115}
            stroke="#FFA931"
            strokeWidth="12"
            strokeLinecap="round"
          />
        ))}
        <circle cx="140" cy="140" r="72" fill="#FFD166" stroke="#FFA931" strokeWidth="6" />
        <circle cx="112" cy="125" r="9" fill="#182421" />
        <circle cx="168" cy="125" r="9" fill="#182421" />
        <circle cx="95" cy="142" r="8" fill="#FF8A80" opacity="0.6" />
        <circle cx="185" cy="142" r="8" fill="#FF8A80" opacity="0.6" />
        <path d="M115 155C125 175 155 175 165 155" stroke="#182421" strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>
    )
  },
  {
    id: 'boat',
    title: 'Perahu Layar',
    chipLabel: '⛵ Perahu',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#EAF4FC" />
        <path d="M0 200C50 185 90 215 140 200C190 185 230 215 280 200V280H0Z" fill="#2978B5" />
        <path d="M0 225C60 210 100 240 160 225C220 210 250 235 280 225V280H0Z" fill="#1B5685" opacity="0.7" />
        <polygon points="50,175 230,175 200,215 80,215" fill="#E89F1C" stroke="#182421" strokeWidth="5" />
        <line x1="140" y1="50" x2="140" y2="175" stroke="#182421" strokeWidth="6" strokeLinecap="round" />
        <polygon points="140,55 65,160 140,160" fill="#FF5E7E" stroke="#182421" strokeWidth="4" />
        <polygon points="148,70 215,160 148,160" fill="#FFD166" stroke="#182421" strokeWidth="4" />
        <polygon points="140,46 165,54 140,62" fill="#28C76F" />
      </g>
    )
  }
];

type GridMode = '2x2' | '3x2';

interface PuzzleSlot {
  id: number;
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  srcX: number;
  srcY: number;
  srcW: number;
  srcH: number;
}

interface PieceState {
  pieceId: number;
  pos: Point;
  home: Point;
  placedSlotId: number | null;
}

const BOARD_X = 70;
const BOARD_Y = 14;
const BOARD_SIZE = 280;

function buildSlots(grid: GridMode): PuzzleSlot[] {
  const cols = grid === '3x2' ? 3 : 2;
  const rows = 2;
  const cellW = BOARD_SIZE / cols;
  const cellH = BOARD_SIZE / rows;
  const slots: PuzzleSlot[] = [];
  let id = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      slots.push({
        id,
        col,
        row,
        x: BOARD_X + col * cellW,
        y: BOARD_Y + row * cellH,
        w: cellW,
        h: cellH,
        srcX: col * (280 / cols),
        srcY: row * (280 / rows),
        srcW: 280 / cols,
        srcH: 280 / rows
      });
      id++;
    }
  }
  return slots;
}

function buildInitialPieces(grid: GridMode): PieceState[] {
  const isSix = grid === '3x2';
  const scramble = isSix ? [4, 1, 5, 0, 3, 2] : [2, 0, 3, 1];
  const trayPoints: Point[] = isSix
    ? [
        { x: 34, y: 318 },
        { x: 164, y: 318 },
        { x: 294, y: 318 },
        { x: 34, y: 416 },
        { x: 164, y: 416 },
        { x: 294, y: 416 }
      ]
    : [
        { x: 18, y: 332 },
        { x: 118, y: 332 },
        { x: 218, y: 332 },
        { x: 318, y: 332 }
      ];

  return scramble.map((origId, trayIdx) => ({
    pieceId: origId,
    home: { ...trayPoints[trayIdx] },
    pos: { ...trayPoints[trayIdx] },
    placedSlotId: null
  }));
}

export function JigsawPuzzle({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [picIdx, setPicIdx] = useState(0);
  const [grid, setGrid] = useState<GridMode>('2x2');
  const [peekGhost, setPeekGhost] = useState(true);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const draggingIdRef = useRef<number | null>(null);
  const [prompt, setPrompt] = useState('Seret atau ketuk keping ke kotak yang pas!');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const picture = PICTURES[picIdx];
  const slots = useMemo(() => buildSlots(grid), [grid]);
  const [pieces, setPieces] = useState<PieceState[]>(() => buildInitialPieces('2x2'));

  useEffect(() => {
    preloadVoices(['puzzle-intro', 'puzzle-snap', 'puzzle-done', 'puzzle-new']);
    return () => stopVoice();
  }, []);

  const svgHeight = grid === '3x2' ? 516 : 464;
  const trayThumbW = grid === '3x2' ? 90 : 88;
  const trayThumbH = grid === '3x2' ? 88 : 88;

  function toSvgCoords(clientX: number, clientY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 420,
      y: ((clientY - rect.top) / rect.height) * svgHeight
    };
  }

  function snapPiece(pieceId: number, slotId: number): void {
    playWoodClick();
    triggerHaptic('snap');
    setPieces((prev) => {
      const targetSlot = slots[slotId];
      const next = prev.map((p) =>
        p.pieceId === pieceId ? { ...p, pos: { x: targetSlot.x, y: targetSlot.y }, placedSlotId: slotId } : p
      );
      const placedCount = next.filter((p) => p.placedSlotId !== null).length;

      if (placedCount === slots.length) {
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-puzzle');
          setPrompt(`Yeaaay! Puzzle ${picture.title} selesai!`);
          playVoice('puzzle-done', 300);
        }, 240);
      } else {
        setPrompt(`Klek! ${placedCount}/${slots.length} keping pas!`);
        playVoice('puzzle-snap', 100);
      }
      return next;
    });
  }

  function onPointerDownPiece(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (piece.placedSlotId !== null) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
    draggingIdRef.current = piece.pieceId;
    setDraggingId(piece.pieceId);
    setSelectedPieceId(piece.pieceId);
    const slot = slots[piece.pieceId];
    const pt = toSvgCoords(e.clientX, e.clientY);
    setPieces((prev) =>
      prev.map((p) => (p.pieceId === piece.pieceId ? { ...p, pos: { x: pt.x - slot.w / 2, y: pt.y - slot.h / 2 } } : p))
    );
  }

  function onPointerMovePiece(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (draggingIdRef.current !== piece.pieceId) return;
    const slot = slots[piece.pieceId];
    const pt = toSvgCoords(e.clientX, e.clientY);
    setPieces((prev) =>
      prev.map((p) => (p.pieceId === piece.pieceId ? { ...p, pos: { x: pt.x - slot.w / 2, y: pt.y - slot.h / 2 } } : p))
    );
  }

  function onPointerUpPiece(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (draggingIdRef.current !== piece.pieceId) return;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release capture errors
    }
    draggingIdRef.current = null;
    setDraggingId(null);

    const dropPt = toSvgCoords(e.clientX, e.clientY);
    const matchingSlot = slots[piece.pieceId];
    const slotCenter: Point = {
      x: matchingSlot.x + matchingSlot.w / 2,
      y: matchingSlot.y + matchingSlot.h / 2
    };
    const dist = distance(dropPt, slotCenter);

    if (dist <= 76) {
      setSelectedPieceId(null);
      snapPiece(piece.pieceId, matchingSlot.id);
    } else {
      setPieces((prev) =>
        prev.map((p) => (p.pieceId === piece.pieceId ? { ...p, pos: { ...p.home } } : p))
      );
    }
  }

  function handleSlotClick(slotId: number): void {
    if (selectedPieceId === null) {
      setPrompt('Pilih dulu salah satu keping di bawah ya!');
      return;
    }
    const piece = pieces.find((p) => p.pieceId === selectedPieceId);
    if (!piece || piece.placedSlotId !== null) return;

    if (piece.pieceId === slotId) {
      setSelectedPieceId(null);
      snapPiece(piece.pieceId, slotId);
    } else {
      setPrompt('Belum pas di kotak ini, coba kotak sebelahnya ya!');
    }
  }

  function resetPuzzle(nextPicIdx: number, nextGrid: GridMode): void {
    setPicIdx(nextPicIdx);
    setGrid(nextGrid);
    setPieces(buildInitialPieces(nextGrid));
    setSelectedPieceId(null);
    draggingIdRef.current = null;
    setDraggingId(null);
    setPrompt(`Susun gambar ${PICTURES[nextPicIdx].title}!`);
    playVoice('puzzle-new');
  }

  const placedCount = pieces.filter((p) => p.placedSlotId !== null).length;
  const allDone = placedCount === slots.length;

  return (
    <section className="game-clean-stage" aria-label="Puzzle Gambar">
      <div className="game-top-bar">
        <div className="segmented-tabs" role="tablist" aria-label="Jumlah keping puzzle">
          <button
            type="button"
            role="tab"
            aria-selected={grid === '2x2'}
            className={`seg-tab touch-safe ${grid === '2x2' ? 'is-active' : ''}`}
            onClick={() => resetPuzzle(picIdx, '2x2')}
          >
            2×2 Mudah
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={grid === '3x2'}
            className={`seg-tab touch-safe ${grid === '3x2' ? 'is-active' : ''}`}
            onClick={() => resetPuzzle(picIdx, '3x2')}
          >
            3×2 Seru
          </button>
        </div>

        <div className="game-top-tools">
          <button
            type="button"
            className={`secondary-btn touch-safe ${peekGhost ? 'is-active-chip' : ''}`}
            onClick={() => setPeekGhost((v) => !v)}
            aria-pressed={peekGhost}
          >
            {peekGhost ? '👁️ Intip' : '🙈 Tanpa Intip'}
          </button>
          <button
            type="button"
            className="icon-tool-btn touch-safe"
            onClick={() => playVoice(allDone ? 'puzzle-done' : 'puzzle-intro')}
            aria-label="Dengar panduan"
          >
            <IconSpeaker size={20} />
          </button>
        </div>
      </div>

      <div className="game-chip-scroll" role="tablist" aria-label="Pilih gambar puzzle">
        {PICTURES.map((pic, idx) => (
          <button
            key={pic.id}
            type="button"
            role="tab"
            aria-selected={idx === picIdx}
            className={`mode-tab touch-safe ${idx === picIdx ? 'is-active' : ''}`}
            onClick={() => idx !== picIdx && resetPuzzle(idx, grid)}
          >
            {pic.chipLabel}
          </button>
        ))}
      </div>

      <p className="game-mini-status">
        {prompt} ({placedCount}/{slots.length})
      </p>

      <div className="puzzle-board-wrap portrait-board">
        <svg
          ref={svgRef}
          viewBox={`0 0 420 ${svgHeight}`}
          className="puzzle-svg portrait-svg"
          role="application"
          aria-label="Papan Puzzle Keping"
        >
          {/* Wooden Board Frame */}
          <rect
            x={BOARD_X - 10}
            y={BOARD_Y - 8}
            width={BOARD_SIZE + 20}
            height={BOARD_SIZE + 16}
            rx="24"
            fill="#EFE8D8"
            stroke="#D5CBB4"
            strokeWidth="4"
            pointerEvents="none"
          />

          {/* Ghost Preview */}
          {peekGhost && (
            <g opacity="0.24" transform={`translate(${BOARD_X}, ${BOARD_Y})`} pointerEvents="none">
              {picture.renderSvg()}
            </g>
          )}

          {/* Target Slots */}
          {slots.map((slot) => {
            const isOccupied = pieces.some((p) => p.placedSlotId === slot.id);
            return (
              <rect
                key={slot.id}
                x={slot.x + 1}
                y={slot.y + 1}
                width={slot.w - 2}
                height={slot.h - 2}
                rx="8"
                fill={isOccupied ? 'none' : 'rgba(255, 255, 255, 0.42)'}
                stroke="#9EAFA5"
                strokeWidth="2.5"
                strokeDasharray={isOccupied ? 'none' : '6 5'}
                pointerEvents="all"
                onClick={() => handleSlotClick(slot.id)}
                tabIndex={0}
                role="button"
                aria-label={`Kotak nomor ${slot.id + 1}`}
                style={{ cursor: 'pointer' }}
              />
            );
          })}

          {allDone && (
            <rect
              x={BOARD_X - 4}
              y={BOARD_Y - 4}
              width={BOARD_SIZE + 8}
              height={BOARD_SIZE + 8}
              rx="18"
              fill="none"
              stroke="#E89F1C"
              strokeWidth="6"
              pointerEvents="none"
            />
          )}

          {/* Lower Tray */}
          <rect
            x="10"
            y="306"
            width="400"
            height={svgHeight - 314}
            rx="22"
            fill="#E6EDE3"
            pointerEvents="none"
          />

          {/* Pieces */}
          {pieces.map((piece) => {
            const isSelected = selectedPieceId === piece.pieceId && piece.placedSlotId === null;
            const isDragging = draggingId === piece.pieceId;
            const isPlaced = piece.placedSlotId !== null;
            const slot = slots[piece.pieceId];
            if (!slot) return null;

            const drawW = isPlaced || isDragging ? slot.w - 2 : trayThumbW;
            const drawH = isPlaced || isDragging ? slot.h - 2 : trayThumbH;

            return (
              <g
                key={piece.pieceId}
                transform={`translate(${piece.pos.x}, ${piece.pos.y})`}
                onPointerDown={(e) => onPointerDownPiece(e, piece)}
                onPointerMove={(e) => onPointerMovePiece(e, piece)}
                onPointerUp={(e) => onPointerUpPiece(e, piece)}
                onPointerCancel={(e) => onPointerUpPiece(e, piece)}
                onClick={() => {
                  if (isPlaced) return;
                  playWoodClick();
                  setSelectedPieceId(piece.pieceId);
                  setPrompt(`Keping dipilih! Ketuk kotak yang cocok di papan atas.`);
                }}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isPlaced) {
                    e.preventDefault();
                    playWoodClick();
                    setSelectedPieceId(piece.pieceId);
                    setPrompt(`Keping dipilih! Ketuk kotak yang cocok di papan atas.`);
                  }
                }}
                tabIndex={isPlaced ? -1 : 0}
                role="button"
                aria-label={`Keping puzzle bagian ${piece.pieceId + 1}`}
                style={{
                  cursor: isPlaced ? 'default' : 'grab',
                  touchAction: 'none',
                  pointerEvents: 'all'
                }}
              >
                <rect
                  x="0"
                  y="0"
                  width={drawW}
                  height={drawH}
                  rx="10"
                  fill="#FFFFFF"
                  stroke={isSelected ? '#1F7A5C' : '#182421'}
                  strokeWidth={isSelected ? '4' : '2.2'}
                  pointerEvents="all"
                />
                <svg
                  x="0"
                  y="0"
                  width={drawW}
                  height={drawH}
                  viewBox={`${slot.srcX} ${slot.srcY} ${slot.srcW} ${slot.srcH}`}
                  preserveAspectRatio="none"
                  pointerEvents="none"
                >
                  {picture.renderSvg()}
                </svg>
                <rect
                  x="0"
                  y="0"
                  width={drawW}
                  height={drawH}
                  rx="10"
                  fill="none"
                  stroke={isSelected ? '#1F7A5C' : '#182421'}
                  strokeWidth={isSelected ? '4' : '2.2'}
                  pointerEvents="none"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {allDone && (
        <div className="motor-finish-actions">
          <button
            type="button"
            className="primary-btn touch-safe"
            onClick={() => resetPuzzle((picIdx + 1) % PICTURES.length, grid)}
          >
            Gambar Berikutnya ➡
          </button>
        </div>
      )}
    </section>
  );
}
