# Testing Strategy for Astrology AI Copilot

This document outlines the testing strategy for the Astrology AI Copilot application, including the types of tests, test organization, and best practices.

## Test Types

### 1. Unit Tests

Unit tests focus on testing individual functions, classes, and components in isolation. These tests should be fast and deterministic.

**Key Areas for Unit Testing:**
- Utility functions in `/src/lib/` directories
- React components in `/src/components/`
- Hooks in `/src/hooks/`
- Type checking and validation logic

**Example:**
```typescript
// Testing a utility function
describe('formatLongitude', () => {
  it('should format longitude as a string with sign and degrees', () => {
    expect(formatLongitude(5)).toBe('♈ 5°0\'');
    expect(formatLongitude(45.5)).toBe('♉ 15°30\'');
    expect(formatLongitude(359.99)).toBe('♓ 29°59\'');
  });
});
```

### 2. Integration Tests

Integration tests verify that multiple parts of the system work together correctly.

**Key Areas for Integration Testing:**
- API routes in `/src/app/api/`
- Database interactions
- Authentication and authorization flows
- Application workflows that span multiple components

**Example:**
```typescript
// Testing an API endpoint
describe('Dashboard API', () => {
  it('should return personal growth dashboard data', async () => {
    // Mock dependencies
    prismaMock.user.findUnique.mockResolvedValue({...});
    
    // Create request
    const request = createMockRequest({...});
    
    // Call API route handler
    const response = await GET(request);
    const data = await response.json();
    
    // Assert response structure and content
    expect(response.status).toBe(200);
    expect(data.dashboardType).toBe('personal_growth');
    expect(data.birthChartInsightCard).toBeDefined();
  });
});
```

### 3. Component Tests

Component tests focus on React components and their behavior, including rendering, user interactions, and state changes.

**Key Areas for Component Testing:**
- UI components in `/src/components/`
- Page components in `/src/app/`
- Interactive elements like forms, buttons, and navigation

**Example:**
```typescript
// Testing a React component
describe('Button component', () => {
  it('handles onClick events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Test Organization

### File Structure

Tests should be co-located with the code they're testing, using the naming convention `*.test.ts` or `*.test.tsx`. For example:

```
src/
  lib/
    validation/
      index.ts
      index.test.ts
  components/
    ui/
      button.tsx
      button.test.tsx
  app/
    api/
      dashboard/
        route.ts
        route.test.ts
```

### Test Utilities

Reusable test utilities, mocks, and helpers are located in:

```
src/
  lib/
    test/
      utils.tsx           # Test helpers like render utilities
      mocks/
        db.ts             # Database mocks
        openai.ts         # OpenAI mocks
        astrology.ts      # Astrology calculation mocks
```

## Best Practices

1. **Mock External Dependencies**:
   - Use `jest.mock()` to mock external libraries and APIs
   - Use the provided mocks in `src/lib/test/mocks/` for common dependencies

2. **Test Boundary Cases**:
   - Test edge cases and error conditions
   - Verify validation logic for invalid inputs
   - Test authorization boundaries

3. **Isolation**:
   - Reset mocks between tests with `jest.clearAllMocks()`
   - Avoid test interdependence

4. **Data Setup**:
   - Use factory functions or fixtures for test data
   - Prefer minimal realistic test data over exhaustive datasets

5. **Assertions**:
   - Make specific assertions about expected outputs
   - Test both the happy path and error scenarios

## Running Tests

- **Run all tests**: `npm test`
- **Run tests in watch mode**: `npm test -- --watch`
- **Run tests with coverage**: `npm test -- --coverage`
- **Run a specific test file**: `npm test -- src/lib/validation/index.test.ts`

## Mocking Strategy

### Database Mocking

The Prisma client is mocked using `jest-mock-extended`:

```typescript
import { prismaMock } from '@/lib/test/mocks/db';

// Mock database query results
prismaMock.user.findUnique.mockResolvedValue({
  id: 1,
  clerk_user_id: 'user_123',
  // ...other fields
});
```

### Authentication Mocking

Clerk authentication is mocked in `jest.setup.js` with default test users:

```typescript
// Override for specific tests
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn().mockReturnValue({ userId: 'custom_user_id' }),
}));
```

### External API Mocking

APIs like OpenAI and Swiss Ephemeris are mocked with predefined responses:

```typescript
import { mockNatalChart } from '@/lib/test/mocks/astrology';
import { mockDashboardInsight } from '@/lib/test/mocks/openai';

// Use mocks directly or override for specific tests
jest.mock('@/lib/astrology/ephemeris', () => ({
  calculateNatalChart: jest.fn().mockResolvedValue(customChart),
}));
```

## Code Coverage Goals

- **Unit Tests**: 80%+ coverage for utility functions and hooks
- **API Routes**: 70%+ coverage for core business logic
- **Components**: 70%+ coverage for interactive components

To check coverage, run: `npm test -- --coverage`