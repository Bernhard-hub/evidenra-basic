# EVIDENRA Professional v7.4 - Release Notes

**Release Date:** 22. November 2025
**Version:** 7.4.0

---

## 🎯 Major Fixes

### 1. **Extended & Basis Report Formatting - PERMANENT FIX**
- ✅ Fixed missing paragraph breaks after headers (# and ##) in Extended Reports
- ✅ Fixed missing paragraph breaks after headers (# and ##) in Basis Reports
- ✅ Fixed missing paragraph breaks after headers (# and ##) in Ultimate Reports
- **New Formatting:**
  - 3 blank lines BEFORE each header
  - 2 blank lines AFTER each header
  - Automatic cleanup of excessive line breaks
- **Why it's permanent:** Code marked with "⭐ PERMANENT FIX" comments in App.tsx

### 2. **Genesis Dashboard UI Crash Fixed**
- ✅ Fixed "Cannot read properties of undefined (reading 'toFixed')" error
- ✅ Added null-safety checks for all GAPES statistics
- ✅ Added `cost` alias in GenesisAPIWrapper for UI compatibility
- **Result:** Genesis popup window now displays correctly without blue error screen

---

## 📝 Technical Details

### Files Changed
1. **App.tsx** (Lines 9353, 9482)
   - Updated post-processing regex for header formatting
   - Applied to Extended, Ultimate, and Basis report modes

2. **GenesisDashboard.jsx** (Lines 210-211, 278-284, 360-364)
   - Added nullish coalescing (`??`) for safe property access
   - Fixed all three dashboard tabs (Overview, GAPES, Analytics)

3. **GenesisAPIWrapper.js** (Line 270)
   - Added `cost: this.stats.totalCost` alias for backward compatibility

4. **package.json**
   - Version bumped to 7.4.0
   - Artifact name updated to `EVIDENRA-Professional-v7.4-GENESIS.exe`

---

## 🚀 Build Information

- **Build Tool:** Webpack 5.101.3 (Production Mode)
- **Electron Version:** 37.4.0
- **Target Platform:** Windows x64 (Portable)
- **Output:** `release\EVIDENRA-Professional-v7.4-GENESIS.exe`

---

## 💡 Known Issues
None reported.

---

## 🔄 Upgrade Instructions

1. Close any running instance of EVIDENRA Professional
2. Run the new `EVIDENRA-Professional-v7.4-GENESIS.exe`
3. Your projects and settings will be preserved

---

## 📌 Credits

- **GENESIS Engine:** Genetic Evolution System for AI Optimization
- **GAPES:** Genesis-Augmented Performance Evolution System
- **Fixes by:** Claude Code + Genesis Intelligence

---

**Previous Version:** v7.3
**Next Expected Version:** v7.5
