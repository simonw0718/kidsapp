# Release Notes - v1.2.0
**Release Date**: December 2, 2024  
**Period**: November 29 - December 2, 2024

---

## 🎮 Animal Commands Game

### New Features
- **Challenge Mode Celebration Screen** 🎉
  - Added special celebration visuals when completing Daily Challenge or Normal Adventure modes
  - Different celebration images for Rabbit (`celebration_rabbit.jpg`) and Dinosaur (`celebration_dino.jpg`)
  - Celebration screen appears after completing all 3 levels (Easy → Medium → Hard)

### UI Improvements
- **Mode Switcher Enhancement**
  - Replaced dropdown menu with a "Switch Mode" button in game header
  - Button navigates back to entry page for easier mode selection
  - Cleaner, more intuitive interface

- **Progress Display**
  - Added progress indicator for challenge modes
  - Shows current level and difficulty (e.g., "第 2 關 / 3 (Medium)")
  - Better visibility of game progression

### Bug Fixes
- **Character Image Background Issue**
  - Fixed white/gray edges on character images (rabbit and dinosaur)
  - Implemented Python script to remove anti-aliasing artifacts
  - All character images now display with perfect transparency
  - Script: `scripts/remove_white_bg.py`

- **Audio Loop Prevention**
  - Fixed continuous audio playback issue
  - Audio now stops properly when game state changes
  - Implemented `stopAllAudio()` function in game lifecycle

- **Win Modal Display**
  - Fixed "Next Level" button not displaying correctly
  - Added complete CSS styles for win modal and buttons
  - Proper button functionality for all game modes

### Game Balance
- **Easy Difficulty Adjustment**
  - Changed obstacle count from 2-3 to 1-3 for Easy mode
  - More beginner-friendly gameplay

### Technical Improvements
- **Entry Page Redesign**
  - Unified selection flow for all game modes
  - Integrated mode, difficulty, and character selection
  - Single "Start Game" button for better UX
  - Conditional difficulty selection (only for Free Practice mode)

---

## 🎨 Color Garden (Free Coloring)

### New Features
- **Expanded Color Palette** 🌈
  - Increased from 15 to 20 colors
  - Layout changed to 4 columns × 5 rows
  - Added skin tone color (`#FFECEA`)
  - Better color variety with distinct, non-similar colors

- **Brush Color Indicator Enhancement**
  - Added glowing effect around brush icon when active
  - Glow color matches selected color
  - Dual-layer drop-shadow for better visibility
  - Retained color indicator dot in bottom-right corner

### UI Improvements
- **Sync Button Fix**
  - Changed "Sync" button behavior to avoid page reload
  - No longer navigates away from coloring page
  - Stays in current session when syncing image list

- **Glow Effect Optimization**
  - Fixed glow clipping issue on iPad landscape mode
  - Added padding to prevent edge cutoff
  - Smooth, complete glow around entire button

### Bug Fixes
- **Save Image Functionality** 💾
  - Fixed critical bug where saved images only contained drawing strokes
  - Now correctly saves both background image and drawing strokes
  - Proper layer composition: white background → coloring sheet → strokes
  - Maintains `object-fit: contain` dimensions

### Color Palette Details
**New 20-Color Layout:**
- **Column 1 (Reds & Pinks)**: Bright Red, Pink, Skin Tone, Dark Orange, Orange
- **Column 2 (Yellows & Greens)**: Bright Yellow, Lime, Light Green, Green, Teal
- **Column 3 (Blues & Purples)**: Cyan, Blue, Dark Blue, Purple, Dark Purple
- **Column 4 (Browns & Neutrals)**: Brown, Dark Brown, Blue Grey, Dark Grey, Black

---

## 🧮 Abacus Game

### New Features
- **Question Round System** 📊
  - Implemented 5-question rounds (similar to Picture Match)
  - Progress bar showing current question and results
  - Color-coded circles: Green (correct), Red (incorrect), Blue (current)
  
- **End Screen Celebration** 🎊
  - Displays score and congratulatory message
  - Dynamic emoji based on performance:
    - 🎉 100% - "太棒了！全部答對！"
    - ⭐ 80%+ - "很棒！"
    - 👍 60%+ - "不錯喔！"
    - 💪 <60% - "繼續加油！"
  - "再玩一次" restart button

- **History Tracking** 📜
  - Game history stored in localStorage
  - Displays past game results in modal
  - Shows: date, score, mode, difficulty
  - "清除紀錄" button to clear history
  - Keeps last 50 records

### UI Components
**New Components Created:**
- `AbacusProgressBar.tsx` - 5-circle progress indicator
- `AbacusEndScreen.tsx` - Celebration screen with score
- `AbacusHistoryModal.tsx` - History viewing modal
- `useAbacusHistory.ts` - History management hook

### Game Logic
- **Scoring System**
  - Only first attempt per question counts toward score
  - Can retry incorrect answers to progress
  - Final score: X/5 format

- **Game Flow**
  - 5 questions per round
  - Auto-advance on correct answer
  - Retry allowed on incorrect answer
  - End screen after completing all questions

### Technical Details
- All new CSS uses `abacus-` prefix to avoid conflicts
- Modified `useAbacusGame` hook with round management
- Integrated into both Abacus and Pure Math modes
- History button (📜) added to header

---

## 📝 Documentation

### New Files
- `scripts/remove_white_bg.py` - Image background removal script
- `docs/remove-white-background-guide.md` - Guide for image processing

### Updated Files
- Multiple component and hook files across all three games
- CSS files with new styles and improvements

---

## 🔧 Technical Summary

### Files Created (11)
1. `src/features/abacus/hooks/useAbacusHistory.ts`
2. `src/features/abacus/components/AbacusProgressBar.tsx`
3. `src/features/abacus/components/AbacusEndScreen.tsx`
4. `src/features/abacus/components/AbacusHistoryModal.tsx`
5. `scripts/remove_white_bg.py`
6. `docs/remove-white-background-guide.md`
7. `public/images/animals-game/celebration_rabbit.jpg`
8. `public/images/animals-game/celebration_dino.jpg`

### Files Modified (10+)
- `src/features/animal-commands/AnimalGame.tsx`
- `src/features/animal-commands/AnimalEntry.tsx`
- `src/features/animal-commands/animal-commands.css`
- `src/features/animal-commands/hooks/useAnimalGame.ts`
- `src/features/animal-commands/data/levelTemplates.ts`
- `src/features/animal-commands/components/grid-map.css`
- `src/features/color-garden/ColorGardenGame.tsx`
- `src/features/color-garden/components/ImageSelector.tsx`
- `src/features/abacus/AbacusPlayPage.tsx`
- `src/features/abacus/hooks/useAbacusGame.ts`
- `src/features/abacus/abacus.css`

### Lines of Code Added
- TypeScript/TSX: ~800 lines
- CSS: ~400 lines
- Python: ~90 lines
- **Total**: ~1,290 lines

---

## 🎯 Impact Summary

### User Experience
- ✅ More engaging game completion with celebration screens
- ✅ Better progress tracking across all games
- ✅ Improved color selection with 20 distinct colors
- ✅ Fixed critical save functionality in Color Garden
- ✅ Cleaner, more intuitive navigation

### Visual Quality
- ✅ Perfect transparency on character images
- ✅ Beautiful glow effects on active tools
- ✅ Professional celebration visuals

### Game Mechanics
- ✅ Structured rounds with clear progression
- ✅ Historical performance tracking
- ✅ Balanced difficulty for beginners

---

## 🐛 Known Issues
None reported.

---

## 📌 Notes
- All changes are backward compatible
- No breaking changes to existing functionality
- Enhanced features maintain original game mechanics
- CSS changes use unique prefixes to avoid conflicts
