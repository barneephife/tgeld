# Component Color Audit Template

## Purpose

This audit documents the current color usage in the ChangePinModal component of the Global Settings interface.

## Component Information

- **Component Name**: ChangePinModal
- **File Location**: components/global-settings/change-pin-modal.tsx
- **Type**: Modal Dialog
- **Has Theme Variants**: No
- **Uses Brand Colors**: No (uses security/system colors)

## Current Color Usage

### Direct Color Values

```tsx
// Background Colors
bg - white; // Modal background
bg - gray - 50; // PIN input background
bg - blue - 500; // Confirm button
bg - gray - 200; // Cancel button
bg - red - 50; // Error message background
bg - yellow - 50; // Verification step background

// Text Colors
text - gray - 900; // Primary text
text - gray - 600; // Secondary text
text - gray - 500; // Helper text
text - white; // Button text
text - red - 600; // Error message
text - green - 600; // Success message
text - yellow - 600; // Warning/verification text

// Border Colors
border - gray - 200; // Modal border
border - gray - 300; // Input borders
focus: border - blue - 500; // Input focus
border - red - 300; // Error state border
border - yellow - 300; // Verification state border

// Shadow Effects
shadow - lg; // Modal shadow
ring - offset - white; // Focus ring offset
```

### State Variations

- Default:
  - Inputs: bg-gray-50, border-gray-300
  - Buttons: bg-blue-500 (confirm), bg-gray-200 (cancel)
- Verification Step:
  - bg-yellow-50
  - border-yellow-300
  - text-yellow-600
- Hover:
  - Confirm: hover:bg-blue-600
  - Cancel: hover:bg-gray-300
- Focus:
  - focus:border-blue-500
  - focus:ring-2
- Error:
  - border-red-300
  - bg-red-50
  - text-red-600
- Success:
  - text-green-600
- Disabled: opacity-50

### Brand Color Usage

None (uses system security colors)

## Required Changes

### Semantic Token Mapping

```tsx
// Backgrounds
bg-white          → bg-background-primary
bg-gray-50        → bg-background-secondary
bg-blue-500       → bg-interactive-primary
bg-gray-200       → bg-interactive-secondary
bg-red-50         → bg-feedback-error-subtle
bg-yellow-50      → bg-feedback-warning-subtle

// Text
text-gray-900     → text-content-primary
text-gray-600     → text-content-secondary
text-gray-500     → text-content-tertiary
text-white        → text-content-inverse
text-red-600      → text-feedback-error
text-green-600    → text-feedback-success
text-yellow-600   → text-feedback-warning

// Borders
border-gray-200   → border-primary
border-gray-300   → border-secondary
border-red-300    → border-error-subtle
border-yellow-300 → border-warning-subtle
border-blue-500   → border-focus
```

### Theme Considerations

- Light theme adjustments:
  - Maintain security context clarity
  - Clear input visibility
  - Prominent verification states
- Dark theme adjustments:
  - Adjust input contrasts
  - Modify verification states
  - Ensure feedback visibility
- Brand color handling:
  - Use system security colors
  - Consider theme-specific security colors

### Accessibility Notes

- Contrast requirements:
  - PIN input: 4.5:1 minimum
  - Error messages: 4.5:1 minimum
  - Verification text: 4.5:1 minimum
- Focus indicators:
  - Clear focus states for inputs
  - High contrast focus rings
  - Support keyboard navigation
- Other considerations:
  - Clear step indication
  - Visual feedback for verification
  - Screen reader support for steps

## Implementation Checklist

- [ ] Replace background colors with semantic tokens
- [ ] Update text colors with semantic tokens
- [ ] Update border colors with semantic tokens
- [ ] Add proper focus states
- [ ] Implement verification states
- [ ] Update error states
- [ ] Test contrast in all themes
- [ ] Verify PIN visibility
- [ ] Add keyboard navigation
- [ ] Test screen reader support

## Additional Notes

- Consider adding step indicators
- Add clear visual feedback for each step
- Consider adding confirmation step
- May need loading states
- Consider adding PIN requirements display
- Add clear verification feedback