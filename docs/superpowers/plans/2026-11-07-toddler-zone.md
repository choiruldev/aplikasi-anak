# Toddler Zone (Cilukba Hewan & Pesta Gelembung Sabun) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an engaging, frustration-free Toddler Zone for 1–2.5 year olds featuring "Cilukba Hewan" (Peek-a-boo animal surprises) and "Pesta Gelembung Sabun" (endless musical multi-touch bubble popping).

**Architecture:** Pure client-side React 19 + TypeScript PWA using Web Audio synthesized soundscapes (marimba, pops, boing, rustle) + human voice pronunciation + CSS hardware-accelerated spring animations and multi-touch pointer event listeners.

**Tech Stack:** React 19, TypeScript, Vite, Web Audio API, Canvas/SVG, Canvas Confetti.

**Spec:** Designed specifically for toddler sensory-motor play (instant cause-and-effect, slap/multi-tap tolerance, zero reading requirements, no game-over gates).

## Global Constraints
- Node 22 native tests with `--experimental-strip-types`.
- Must run cleanly with zero build errors (`npm run build`).
- Must pass all unit tests (`npm test`).
- Zero AI synthetic voice; preserve authentic human voices and warm Web Audio synthesis.
- Base path dynamic compatibility (`/` locally and `/aplikasi-anak/` on GitHub Pages).

---

### Task 1: Sound Engine Enhancements & Logic Helpers with Unit Tests

- [ ] Add sound effects `playRustleSound` and `playBoingSound` in `src/lib/audio.ts`.
- [ ] Create `src/lib/toddler.ts` containing pure helper functions:
  - `isPointerInsideBubble(px, py, bx, by, radius)`
  - `getBubblePopFrequency(index)`
  - `getNextAnimalIndex(current, total)`
- [ ] Create unit tests in `src/lib/toddler.test.ts`.
- [ ] Update `package.json` test script to run all `*.test.ts` files or run both test files.
- [ ] Run `npm test` to verify all tests pass.

### Task 2: Build "Cilukba Hewan" (Peek-a-boo Animals) Component

- [ ] Create `src/activities/PeekabooAnimals.tsx`:
  - 3-stage interactive cycle: Hidden -> Wiggle/Peeking -> Boing/Surprise pop-out!
  - Animal roster: Cat, Cow, Duck, Elephant, Frog, Bird with authentic voice & audio motifs.
  - Large tap target (central bush/gift box + full-screen tap fallback).
  - Floating confetti/stars burst on reveal.
  - Automatic progress reward and cheerful mascot reaction.
- [ ] Add CSS keyframe animations (`@keyframes wiggle-bush`, `@keyframes boing-pop`) in `src/styles.css`.

### Task 3: Build "Pesta Gelembung Sabun" (Multi-Touch Bubble Popper) Component

- [ ] Create `src/activities/BubblePopper.tsx`:
  - Continually drifting shimmering bubbles of varying pastel colors and sizes.
  - Multi-touch pointer support (`onPointerDown`, pointer tracking) for slapping or multi-finger popping.
  - Every pop triggers `playBubblePop` with sequential scale notes (melodic popping).
  - Surprise emoji (stars, musical notes, hearts, flowers) float up on pop.
  - Tapping empty space spawns new bubbles immediately.
  - Milestone celebrations without interrupting flow (endless play).
- [ ] Add bubble styling and float animations in `src/styles.css`.

### Task 4: Integrate Toddler Zone into `App.tsx` & Home Screen

- [ ] Add `'peekaboo'` and `'bubblepopper'` activity keys and metadata in `src/App.tsx`.
- [ ] Add prominent "👶 Zona Batita (1 – 2,5 Thn)" quick-launch banner at the top of the Home screen.
- [ ] Add routing/render switches for `<PeekabooAnimals />` and `<BubblePopper />`.
- [ ] Ensure seamless Back/Kembali navigation for parents.

### Task 5: Verification, Build & Deployment Push

- [ ] Run `npm test` to verify all unit tests pass.
- [ ] Run `npm run build` to verify clean TypeScript compilation and asset bundling.
- [ ] Commit and push to `main` to trigger automatic GitHub Pages deployment.
- [ ] Verify live site on GitHub Pages.
