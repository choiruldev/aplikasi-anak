import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { IconSpeaker } from '../components/Art';
import {
  playSuccessChime,
  playVoice,
  playWoodClick,
  preloadVoices,
  stopVoice
} from '../lib/audio';
import { distance, type Point } from '../lib/geometry';

interface PuzzlePicture {
  id: string;
  title: string;
  renderSvg: () => JSX.Element;
}

const PICTURES: PuzzlePicture[] = [
  {
    id: 'cat',
    title: 'Kucing Oren Lucu',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#FCE9DF" />
        {/* Cat ears */}
        <polygon points="60,110 50,40 120,70" fill="#E06B34" stroke="#182421" strokeWidth="5" />
        <polygon points="220,110 230,40 160,70" fill="#E06B34" stroke="#182421" strokeWidth="5" />
        {/* Head */}
        <circle cx="140" cy="150" r="85" fill="#F08A4B" stroke="#182421" strokeWidth="6" />
        {/* Eyes */}
        <circle cx="105" cy="135" r="14" fill="#FFFFFF" stroke="#182421" strokeWidth="4" />
        <circle cx="105" cy="135" r="7" fill="#182421" />
        <circle cx="175" cy="135" r="14" fill="#FFFFFF" stroke="#182421" strokeWidth="4" />
        <circle cx="175" cy="135" r="7" fill="#182421" />
        {/* Nose & mouth */}
        <polygon points="134,160 146,160 140,170" fill="#D94848" />
        <path d="M140 170V182C130 190 118 186 112 180M140 182C150 190 162 186 168 180" stroke="#182421" strokeWidth="5" strokeLinecap="round" />
        {/* Whiskers */}
        <path d="M50 145H90M50 160H90M190 145H230M190 160H230" stroke="#182421" strokeWidth="5" strokeLinecap="round" />
      </g>
    )
  },
  {
    id: 'elephant',
    title: 'Gajah Biru',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#E2EEF6" />
        {/* Large ears */}
        <circle cx="68" cy="130" r="50" fill="#5D8AA8" stroke="#182421" strokeWidth="5" />
        <circle cx="212" cy="130" r="50" fill="#5D8AA8" stroke="#182421" strokeWidth="5" />
        {/* Head */}
        <circle cx="140" cy="140" r="72" fill="#76A5C4" stroke="#182421" strokeWidth="6" />
        {/* Eyes */}
        <circle cx="112" cy="120" r="10" fill="#182421" />
        <circle cx="168" cy="120" r="10" fill="#182421" />
        {/* Trunk */}
        <path d="M140 150V210C140 230 162 230 168 215" fill="none" stroke="#5D8AA8" strokeWidth="26" strokeLinecap="round" />
        {/* Tusks */}
        <path d="M116 190C110 205 100 205 95 195" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M164 190C170 205 180 205 185 195" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
      </g>
    )
  },
  {
    id: 'watermelon',
    title: 'Semangka Manis',
    renderSvg: () => (
      <g>
        <rect width="280" height="280" rx="16" fill="#EBF6EA" />
        {/* Green Outer Rind */}
        <path d="M30 140C30 220 90 250 140 250C190 250 250 220 250 140Z" fill="#2B9361" stroke="#182421" strokeWidth="6" />
        {/* White Inner Rind */}
        <path d="M42 140C42 210 95 236 140 236C185 236 238 210 238 140Z" fill="#F0F6EE" />
        {/* Red Flesh */}
        <path d="M52 140C52 200 100 224 140 224C180 224 228 200 228 140Z" fill="#E53935" stroke="#182421" strokeWidth="5" />
        {/* Seeds */}
        <circle cx="95" cy="165" r="5" fill="#182421" />
        <circle cx="140" cy="180" r="5" fill="#182421" />
        <circle cx="185" cy="165" r="5" fill="#182421" />
        <circle cx="120" cy="155" r="4.5" fill="#182421" />
        <circle cx="160" cy="155" r="4.5" fill="#182421" />
      </g>
    )
  }
];

// Board is placed at x: 170, y: 10, width: 300, height: 300
// 4 slots of 140x140 with 10px outer margin:
const SLOTS: { id: number; col: number; row: number; x: number; y: number }[] = [
  { id: 0, col: 0, row: 0, x: 180, y: 20 },
  { id: 1, col: 1, row: 0, x: 320, y: 20 },
  { id: 2, col: 0, row: 1, x: 180, y: 160 },
  { id: 3, col: 1, row: 1, x: 320, y: 160 }
];

// Tray positions (y: 334, height: 130)
const TRAY_POINTS: Point[] = [
  { x: 26, y: 334 },
  { x: 176, y: 334 },
  { x: 326, y: 334 },
  { x: 476, y: 334 }
];

interface PieceState {
  pieceId: number; // 0, 1, 2, 3 corresponding to matching slot
  pos: Point;
  home: Point;
  placedSlotId: number | null;
}

export function JigsawPuzzle({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [picIdx, setPicIdx] = useState(0);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('Susun empat keping gambar ke kotak yang cocok.');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const picture = PICTURES[picIdx];

  function initPieces(): PieceState[] {
    const scramble = [2, 0, 3, 1];
    return scramble.map((origId, traySlotIdx) => ({
      pieceId: origId,
      home: { ...TRAY_POINTS[traySlotIdx] },
      pos: { ...TRAY_POINTS[traySlotIdx] },
      placedSlotId: null
    }));
  }

  const [pieces, setPieces] = useState<PieceState[]>(() => initPieces());

  useEffect(() => {
    preloadVoices(['puzzle-intro', 'puzzle-snap', 'puzzle-done', 'puzzle-new']);
    playVoice('puzzle-intro', 80);
    return () => stopVoice();
  }, []);

  function toSvgCoords(clientX: number, clientY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 640,
      y: ((clientY - rect.top) / rect.height) * 480
    };
  }

  function snapPiece(pieceId: number, slotId: number): void {
    playWoodClick();
    setPieces((prev) => {
      const targetSlot = SLOTS[slotId];
      const boardPos: Point = { x: targetSlot.x, y: targetSlot.y };
      const next = prev.map((p) =>
        p.pieceId === pieceId ? { ...p, pos: boardPos, placedSlotId: slotId } : p
      );
      const placedCount = next.filter((p) => p.placedSlotId !== null).length;

      if (placedCount === 4) {
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-puzzle');
          setPrompt('Hore! Gambar berhasil tersusun rapi!');
          playVoice('puzzle-done', 350);
        }, 280);
      } else {
        setPrompt(`Keping ${placedCount} terpasang! Lanjut keping berikutnya.`);
        playVoice('puzzle-snap', 100);
      }
      return next;
    });
  }

  function onPointerDownPiece(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (piece.placedSlotId !== null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingId(piece.pieceId);
    setSelectedPieceId(piece.pieceId);
    const pt = toSvgCoords(e.clientX, e.clientY);
    setPieces((prev) =>
      prev.map((p) => (p.pieceId === piece.pieceId ? { ...p, pos: { x: pt.x - 70, y: pt.y - 70 } } : p))
    );
  }

  function onPointerMovePiece(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (draggingId !== piece.pieceId) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    setPieces((prev) =>
      prev.map((p) => (p.pieceId === piece.pieceId ? { ...p, pos: { x: pt.x - 70, y: pt.y - 70 } } : p))
    );
  }

  function onPointerUpPiece(e: ReactPointerEvent<SVGGElement>, piece: PieceState): void {
    if (draggingId !== piece.pieceId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDraggingId(null);

    const matchingSlot = SLOTS[piece.pieceId];
    const targetBoardPos: Point = { x: matchingSlot.x, y: matchingSlot.y };
    const dist = distance(piece.pos, targetBoardPos);

    if (dist <= 85) {
      setSelectedPieceId(null);
      snapPiece(piece.pieceId, matchingSlot.id);
    } else {
      setPieces((prev) =>
        prev.map((p) => (p.pieceId === piece.pieceId ? { ...p, pos: { ...p.home } } : p))
      );
    }
  }

  function handleSlotClick(slotId: number): void {
    if (selectedPieceId === null) return;
    const piece = pieces.find((p) => p.pieceId === selectedPieceId);
    if (!piece || piece.placedSlotId !== null) return;

    if (piece.pieceId === slotId) {
      setSelectedPieceId(null);
      snapPiece(piece.pieceId, slotId);
    } else {
      setPrompt('Keping ini belum pas di kotak ini, coba cari kotak yang cocok ya.');
    }
  }

  function handleNextPicture(): void {
    const nextIdx = (picIdx + 1) % PICTURES.length;
    setPicIdx(nextIdx);
    setPieces(initPieces());
    setSelectedPieceId(null);
    setDraggingId(null);
    setPrompt(`Gambar baru: ${PICTURES[nextIdx].title}. Ayo pasang kepingannya!`);
    playVoice('puzzle-new');
  }

  const allDone = pieces.every((p) => p.placedSlotId !== null);

  return (
    <section className="activity-stage" aria-labelledby="puzzle-title">
      <div className="stage-header">
        <div>
          <h1 id="puzzle-title" className="stage-title">Puzzle Keping: {picture.title}</h1>
          <p className="stage-subtitle">{prompt}</p>
        </div>
        <div className="stage-actions">
          <button
            type="button"
            className="voice-btn"
            onClick={() => playVoice(allDone ? 'puzzle-done' : 'puzzle-intro')}
            aria-label="Dengar suara panduan"
          >
            <IconSpeaker size={22} />
            <span>Dengar</span>
          </button>
          <button type="button" className="secondary-btn" onClick={handleNextPicture}>
            {allDone ? 'Gambar Berikutnya' : 'Ganti Gambar'}
          </button>
        </div>
      </div>

      <div className="puzzle-board-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 640 480"
          className="puzzle-svg"
          role="application"
          aria-label="Papan Puzzle Keping"
        >
          {/* Wooden Board Frame */}
          <rect x="168" y="8" width="304" height="304" rx="28" fill="#EFE8D8" stroke="#D5CBB4" strokeWidth="4" />

          {/* Guidelines and target slots on the board */}
          <g>
            {/* Ghost background outline for visual hint */}
            <g opacity="0.22" transform="translate(180, 20)">
              {picture.renderSvg()}
            </g>

            {/* 4 Quadrant Target Slots */}
            {SLOTS.map((slot) => {
              const isOccupied = pieces.some((p) => p.placedSlotId === slot.id);
              return (
                <rect
                  key={slot.id}
                  x={slot.x}
                  y={slot.y}
                  width="138"
                  height="138"
                  rx="10"
                  fill={isOccupied ? 'none' : 'rgba(255, 255, 255, 0.45)'}
                  stroke="#9EAFA5"
                  strokeWidth="2.5"
                  strokeDasharray={isOccupied ? 'none' : '6 5'}
                  onClick={() => handleSlotClick(slot.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Kotak nomor ${slot.id + 1}`}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </g>

          {/* Golden completed frame if all done */}
          {allDone && (
            <rect
              x="174"
              y="14"
              width="292"
              height="292"
              rx="24"
              fill="none"
              stroke="#E89F1C"
              strokeWidth="6"
            />
          )}

          {/* Lower Tray Shelf */}
          <rect x="14" y="322" width="612" height="150" rx="22" fill="#E6EDE3" />

          {/* Pieces */}
          {pieces.map((piece) => {
            const isSelected = selectedPieceId === piece.pieceId && piece.placedSlotId === null;
            const isDragging = draggingId === piece.pieceId;
            const isPlaced = piece.placedSlotId !== null;
            const scale = isDragging ? 1.08 : 1;

            const slot = SLOTS[piece.pieceId];

            return (
              <g
                key={piece.pieceId}
                transform={`translate(${piece.pos.x}, ${piece.pos.y}) scale(${scale})`}
                onPointerDown={(e) => onPointerDownPiece(e, piece)}
                onPointerMove={(e) => onPointerMovePiece(e, piece)}
                onPointerUp={(e) => onPointerUpPiece(e, piece)}
                onPointerCancel={(e) => onPointerUpPiece(e, piece)}
                tabIndex={isPlaced ? -1 : 0}
                role="button"
                aria-label={`Keping puzzle bagian ${piece.pieceId + 1}`}
                style={{
                  cursor: isPlaced ? 'default' : 'grab',
                  touchAction: 'none'
                }}
              >
                {/* Visual piece background */}
                <rect
                  x="0"
                  y="0"
                  width="138"
                  height="138"
                  rx="12"
                  fill="#FFFFFF"
                  stroke={isSelected ? '#1F7A5C' : '#182421'}
                  strokeWidth={isSelected ? '4' : '2.5'}
                />

                {/* Nested SVG cleanly showing the exact 140x140 quadrant! */}
                <svg
                  x="0"
                  y="0"
                  width="138"
                  height="138"
                  viewBox={`${slot.col * 140} ${slot.row * 140} 140 140`}
                >
                  {picture.renderSvg()}
                </svg>

                {/* Border overlay */}
                <rect
                  x="0"
                  y="0"
                  width="138"
                  height="138"
                  rx="12"
                  fill="none"
                  stroke={isSelected ? '#1F7A5C' : '#182421'}
                  strokeWidth={isSelected ? '4' : '2.5'}
                />

                {/* Selected highlight indicator */}
                {isSelected && (
                  <rect
                    x="2"
                    y="2"
                    width="134"
                    height="134"
                    rx="10"
                    fill="none"
                    stroke="#1F7A5C"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="progress-strip" aria-live="polite">
        <span>
          Terpasang: {pieces.filter((p) => p.placedSlotId !== null).length} / 4 keping{' '}
          {allDone ? 'Sempurna!' : ''}
        </span>
      </div>
    </section>
  );
}
