# User Experience (UX) Design System

This document outlines the user experience components, patterns, and best practices for the Astrology AI Copilot application.

## Core UI Components

### Layout Components

- **ResponsiveContainer**: Provides consistent max-width containers with appropriate padding across different device sizes.
  - Usage: Wrap page content to ensure consistent margins and maximum widths.
  - Props: `maxWidth` ('mobile', 'tablet', 'desktop', 'wide', 'full'), `padded`, `centered`

- **ResponsiveGrid**: Creates a responsive grid layout that adjusts columns based on screen size.
  - Props: `cols` (object with breakpoint-specific column counts), `gap` (spacing between grid items)

- **ResponsiveStack**: Vertical stack on small screens, horizontal layout on larger screens.
  - Props: `breakpoint` (when to switch to horizontal), `spacing`, `alignment`

### Form Components

- **FormField**: Accessible form input with consistent styling, labels, and error handling.
  - Props: `id`, `label`, `type`, `error`, `description`, and standard input attributes.
  - Types: text, email, password, number, textarea, select, etc.

- **FormCheckbox**: Accessible checkbox input with label and error handling.
  - Props: `id`, `label`, `checked`, `error`, `description` and standard checkbox attributes.

### Feedback Components

- **LoadingSpinner**: Consistent loading indicator with accessibility support.
  - Props: `size`, `color`, `label`, `centered`

- **Skeleton**: Content loading placeholder system for consistent loading states.
  - Variants: `TextLineSkeleton`, `AvatarSkeleton`, `CardSkeleton`, `ProfileSkeleton`, `DashboardSkeleton`, `ChatSkeleton`

- **Toast**: Notification system for providing user feedback.
  - Methods: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`
  - Usage: Import `{ toast }` from '@/components/ui/toast'

### Navigation Components

- **PageTransition**: Smooth transitions between pages with loading states.
  - Props: `enableTransition`, `loadingDelay`, `minLoadingTime`

- **AccessibleNav**: Accessible, responsive navigation with keyboard support.
  - Variants: horizontal, vertical, sidebar, mobile
  - Props: `items`, `variant`, `isUserAuthenticated`

- **AppNav**: Pre-configured main application navigation with common routes.

- **DashboardNav**: Pre-configured dashboard navigation with sidebar style.

### Guidance Components

- **Tooltip**: Provides additional information on hover/focus.
  - Variants: `InfoTooltip` (for form fields), `GuidanceTooltip` (for tutorial highlights)

- **UserGuide**: Step-by-step onboarding tutorials.
  - Props: `steps`, `onComplete`, `onSkip`, `autoStart`

- **KeyboardShortcuts**: Component to display available keyboard shortcuts.
  - Pre-configured with `useAppShortcuts()` for common app shortcuts.

### Modal Components

- **FocusTrap**: Traps focus within a container for accessibility.
  - Ensures keyboard navigation is trapped within modals for accessibility.

- **ModalContainer**: Accessible modal dialog with focus management and keyboard support.
  - Props: `isOpen`, `onClose`, `title`, `closeOnEsc`, `closeOnOutsideClick`

## Responsive Hooks

- **useBreakpoint()**: Gets the current screen size breakpoint.
- **useResponsive(query)**: Checks if current screen matches a breakpoint query.
- **useIsMobile()**: Shorthand to check if screen is mobile-sized.
- **useIsDesktop()**: Shorthand to check if screen is desktop-sized.
- **useWindowSize()**: Gets current window dimensions.

## Keyboard Accessibility

- **useKeyboard(actions)**: Manages keyboard shortcuts across the application.
- **useKeyCombo(keyCombo)**: Detects specific keyboard combinations.
- **useShortcuts(shortcuts)**: Sets up component-specific keyboard shortcuts.
- **useInputKeyboard(inputRef, handlers)**: Keyboard handlers for input elements.

## Accessibility Best Practices

1. **Semantic HTML**: Always use the appropriate HTML element for its intended purpose.
2. **Focus Management**: Ensure keyboard focus is properly managed, especially in modals.
3. **ARIA Attributes**: Use appropriate ARIA attributes for dynamic content.
4. **Color Contrast**: Maintain a minimum 4.5:1 contrast ratio for text.
5. **Error Messages**: Make error messages clear and associate them with form fields.
6. **Skip Links**: Include skip links for keyboard navigation.
7. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible.
8. **Screen Reader Text**: Provide text alternatives for visual elements.
9. **Form Labels**: Always use labels with form controls.
10. **Responsive Design**: Ensure the UI works across different device sizes and orientations.

## Implementation Examples

### Basic Page Layout

```tsx
import { ResponsiveContainer } from '@/components/layout/responsive-container';

export default function MyPage() {
  return (
    <ResponsiveContainer maxWidth="desktop">
      <h1>Page Title</h1>
      <p>Page content...</p>
    </ResponsiveContainer>
  );
}
```

### Form with Validation

```tsx
import { FormField } from '@/components/ui/form-field';

function ProfileForm() {
  const [errors, setErrors] = useState({});
  
  return (
    <form>
      <FormField
        id="name"
        label="Full Name"
        required
        error={errors.name}
        description="Enter your full name as it appears on official documents."
      />
      
      <FormField
        id="birthdate"
        label="Date of Birth"
        type="date"
        required
        error={errors.birthdate}
      />
      
      {/* Submit button */}
    </form>
  );
}
```

### Loading States

```tsx
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CardSkeleton } from '@/components/ui/skeleton';

function DataLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  return (
    <div>
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div>Content goes here...</div>
      )}
      
      {isLoadingDetails && (
        <LoadingSpinner label="Loading details..." centered />
      )}
    </div>
  );
}
```

### Toast Notifications

```tsx
import { toast } from '@/components/ui/toast';

function handleAction() {
  try {
    // Perform action
    toast.success('Your birth chart has been saved successfully');
  } catch (error) {
    toast.error('Failed to save birth chart. Please try again.');
  }
}
```

### User Guide

```tsx
import { UserGuide } from '@/components/onboarding/user-guide';

const dashboardGuideSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard',
    description: 'This is your personalized astrology dashboard',
  },
  {
    id: 'chart',
    title: 'Your Birth Chart',
    description: 'This shows your natal chart with all planetary positions',
    targetElement: '#birth-chart',
  },
  // More steps...
];

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div id="birth-chart">Chart goes here...</div>
      
      <UserGuide steps={dashboardGuideSteps} autoStart />
    </div>
  );
}
```

## Error Pages

The application includes customized error pages for a better user experience:

- **404 Not Found**: A cosmic-themed error page for invalid URLs.
- **Error Boundary**: A custom error page that captures and logs runtime errors.

## Color Theme

The application uses a cosmic-themed color palette:

- **dark-void**: Primary background color (#0d0d1a)
- **dark-space**: Secondary background color (#171730)
- **starlight-white**: Primary text color (#f8f8ff)
- **stardust-silver**: Secondary text color (#a0a0c0)
- **nebula-veil**: Tertiary text/border color (#6e6e9c)
- **cosmic-purple**: Primary accent color (#7d4cdb)
- **supernova-teal**: Secondary accent color (#00d9c5)