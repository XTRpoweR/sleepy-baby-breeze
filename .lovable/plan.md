
# Fix Sleep Session Complete Dialog on Mobile

## Problem

The "Sleep Session Complete" dialog appears at the bottom of the screen on iPhone with the action buttons cut off and unclickable. This happens immediately when the dialog opens, both in the Lovable preview and on the published site.

**Root Cause**: The CSS centering approach (`top-[50%] translate-y-[-50%]`) used by Radix Dialog is unreliable on iOS Safari because:
- iOS Safari's visual viewport height changes dynamically with the address bar
- The `vh` units don't account for iOS safe areas and browser chrome
- Transform-based centering can result in the dialog being positioned outside the visible area

## Solution

Replace the Dialog component with a **Drawer** on mobile devices. Drawers slide up from the bottom of the screen and are specifically designed to work reliably on mobile browsers, especially iOS Safari. This pattern is already used successfully elsewhere in the app (e.g., `DeleteConfirmationDialog.tsx`).

**On desktop**: Keep using the Dialog component (centered modal)
**On mobile**: Use the Drawer component (bottom sheet)

## Implementation Details

### File to Modify: `src/components/tracking/SleepTracker.tsx`

1. **Import Drawer components** alongside Dialog components:
   - Add imports for `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`

2. **Create responsive modal rendering**:
   - Use the existing `isMobile` hook to conditionally render either a Drawer (mobile) or Dialog (desktop)
   - Both will share the same content structure (duration display, sleep insights, action buttons)

3. **Drawer-specific adjustments**:
   - The Drawer naturally positions at the bottom with proper iOS safe area handling
   - Action buttons in DrawerFooter will always be visible and tappable
   - Users can swipe down to dismiss (native gesture)

### Code Changes Summary

```text
Current (broken on mobile):
  Dialog -> DialogContent (centered with CSS transforms)
    -> DialogHeader
    -> Content
    -> DialogFooter (buttons get cut off)

New (works on mobile):
  if (isMobile):
    Drawer -> DrawerContent (slides from bottom, safe area aware)
      -> DrawerHeader
      -> Content
      -> DrawerFooter (always visible)
  else:
    Dialog -> DialogContent (centered)
      -> DialogHeader
      -> Content
      -> DialogFooter
```

## Technical Notes

- The `vaul` library (already installed) provides the Drawer component with built-in iOS safe area support
- No changes needed to `dialog.tsx` or `drawer.tsx` - using existing components as-is
- The content inside the modal remains identical; only the container changes based on device
- This is the same pattern used by `DeleteConfirmationDialog.tsx` which works correctly on mobile

## Expected Outcome

- On iPhone/mobile: The sleep session summary will slide up from the bottom as a drawer, with the "Cancel Session" and "Save Session" buttons always visible and tappable
- On desktop: The centered dialog modal experience remains unchanged
- Users can swipe down to dismiss on mobile (natural gesture)
