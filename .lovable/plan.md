
# Fix Sleep Session Complete Dialog Positioning on Mobile

## Problem
When ending a sleep session on the `/track` page, the "Sleep Session Complete" dialog appears at the bottom of the screen with the "Cancel Session" and "Save Session" buttons cut off and unclickable. This happens because:

1. The dialog is positioned at `top-[50%]` with a vertical translation to center it
2. On mobile devices (especially within the Lovable preview which has a toolbar), this positioning causes the dialog's bottom portion to extend below the visible area
3. The action buttons are placed at the bottom of the dialog content, making them the first elements to be cut off

## Solution

### Two-part fix:

**Part 1: Update the `dialog.tsx` component** to improve mobile positioning:
- Add `max-h-[85vh]` instead of `max-h-[90vh]` to provide more margin for mobile toolbars
- Add safe area inset handling with `pb-safe` for iOS devices with home indicators

**Part 2: Restructure the Sleep Session Complete dialog** in `SleepTracker.tsx`:
- Use proper `DialogFooter` component for the action buttons (this ensures buttons are always visible)
- Reduce vertical padding to make the content more compact on mobile
- Add explicit max-height and make the content area scrollable while keeping buttons fixed

## Files to Modify

### 1. `src/components/ui/dialog.tsx`
- Change `max-h-[90vh]` to `max-h-[85vh]` to account for mobile toolbars
- This provides more breathing room on mobile devices

### 2. `src/components/tracking/SleepTracker.tsx`
- Import `DialogFooter` from the dialog component
- Move the action buttons into a `DialogFooter` component
- Reduce the `text-5xl` duration display to `text-4xl` on mobile for compactness
- Reduce the `py-4` padding to `py-2` to save vertical space
- Reduce the `p-4` padding on the Sleep Insights card to `p-3`
- Reduce the `space-y-6` gap to `space-y-4`

## Technical Details

**Current structure:**
```
DialogContent (centered, max-h-90vh)
  └── DialogHeader
  └── div.space-y-6.py-4
       └── Duration Display (text-5xl)
       └── Sleep Insights Card (p-4)
       └── Action Buttons (inside scrollable area)
```

**New structure:**
```
DialogContent (centered, max-h-85vh)
  └── DialogHeader
  └── div.space-y-4.py-2 (more compact)
       └── Duration Display (text-4xl sm:text-5xl)
       └── Sleep Insights Card (p-3)
  └── DialogFooter (always visible at bottom)
       └── Action Buttons
```

This ensures:
- The dialog doesn't extend past 85% of viewport height
- The action buttons are always visible and clickable
- The content is more compact on mobile while maintaining readability on larger screens
