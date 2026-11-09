# Mobile UI/UX Kid-Friendly Overhaul Implementation Plan

**Goal:** Transform the mobile interface into a polished, clutter-free, tactile kids game experience inspired by leading apps (Sago Mini, Toca Boca, Khan Academy Kids).

**Target Breakpoint:** Mobile screens (320px – 480px, including iPhone SE, iPhone 14/15, and Android smartphones) as well as tablets.

## Key Changes:
1. **Header (App Shell Top Bar):**
   - Single fixed/sticky 56px row on mobile. Zero multi-line wrapping.
   - Left: Compact logo + "KecilMain".
   - Right: Sleek row of tactile circular/pill buttons (🎵 Music, ⭐ Stickers, 🔒 Parent Lock).
   - In-game view: Only `[⬅ Menu]` on the left and 🎵 + timer on the right.

2. **Welcome Band & Filter Chips:**
   - Compact greeting without text overflow.
   - Horizontal swipeable pill filter (`overflow-x: auto`) for age categories without vertical wrapping.

3. **Zona Batita (Toddler Hero Section):**
   - 2-column bubbly tactile cards (Cilukba 🙈 and Gelembung 🫧) that fit naturally above the fold.
   - Responsive text and container without horizontal clipping.

4. **Activity Catalog Grid:**
   - 2-column playful tactile toy tiles on mobile (`grid-template-columns: repeat(2, 1fr)`).
   - Centered large artwork/illustration + bold display title + age badge.
   - 3D tactile button push feel (`border-bottom: 5px solid ...`, `transform: translateY(3px)`).
   - Hide paragraph descriptions on mobile for a clean, game-like dashboard.

5. **In-Game Responsive Fixes:**
   - Ensure all activities (`PeekabooAnimals`, `BubblePopper`, `AlphabetGarden`, `NumberGarden`, `SensoryPlay`, `ShapeSorter`, etc.) fit 100% of mobile width with zero overflow and touch-friendly targets.
   - Position the Mascot guide gracefully so it never covers buttons.

6. **Verification via Headless Chrome Screenshot:**
   - Take mobile screenshots at 390x844 before and after to visually confirm the fix.
   - Run unit tests and build check.
