

## Fix Reports Page Mobile Layout

### Problem
Charts, grids, and statistics on the Reports page are not responsive on mobile. The pie chart overflows its container, grids force too many columns on small screens, and text/numbers get cut off.

### Changes

**1. Fix FeedingAnalytics.tsx**
- Change `grid grid-cols-2` to `grid grid-cols-1 lg:grid-cols-2` so charts stack vertically on mobile
- Reduce PieChart `outerRadius` from 90 to 60 on mobile using the existing `isMobile` hook
- Disable pie chart labels on mobile (they cause overflow) and show a legend below instead

**2. Fix ActivitySummary.tsx**
- Change `grid grid-cols-4` to `grid grid-cols-2 lg:grid-cols-4` for the summary stats
- Change `grid grid-cols-2` to `grid grid-cols-1 sm:grid-cols-2` for the bottom insight cards
- Reduce font sizes and icon sizes on mobile
- Use the existing `isMobile` hook (already imported but unused)

**3. General improvements**
- Ensure all chart containers have proper `overflow-hidden` to prevent any remaining overflow
- Add `min-w-0` to grid children to prevent content from forcing grid wider than viewport

### Technical Details

Files to modify:
- `src/components/reports/FeedingAnalytics.tsx` -- responsive grid, smaller pie chart on mobile, disable labels on mobile
- `src/components/reports/ActivitySummary.tsx` -- responsive grid (2 cols on mobile, 4 on desktop), responsive font sizes
