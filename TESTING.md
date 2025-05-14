# Testing Documentation

This document provides guidance on the testing infrastructure and best practices for the Astrology AI Copilot project.

## Overview

The project uses Jest as the primary testing framework along with React Testing Library for component testing. The testing setup is designed to cover:

- Unit tests for utility functions
- Integration tests for API routes
- Component tests for UI elements
- End-to-end workflows

## Test Structure

Tests are co-located with the code they test using the `.test.ts` or `.test.tsx` naming convention:

```
src/
  lib/
    astrology/
      utils.ts
      utils.test.ts
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

## Running Tests

The following npm scripts are available for running tests:

- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode (useful during development)
- `npm run test:ci`: Run tests with coverage in CI mode
- `npm run test:update`: Update snapshots

To run specific tests, you can use the Jest CLI:

```bash
# Run tests from a specific file
npm test src/lib/validation/index.test.ts

# Run tests that match a pattern
npm test -- -t "should calculate house position correctly"
```

## Test Utilities

### Mock Data

Mock data is located in `src/lib/test/mocks/`:

- `db.ts`: Prisma client mocks and database fixtures
- `openai.ts`: OpenAI client mocks and response fixtures
- `astrology.ts`: Astrology calculation mocks and chart fixtures

### Testing Helpers

Common testing utilities are available in `src/lib/test/utils.tsx`:

- `render`: Custom render function with test providers
- `createMockRequest`: Helper to create test NextRequest objects
- `createMockResponse`: Helper to create test NextResponse objects
- `mockFetch`: Helper to mock fetch responses

## Writing Tests

### Unit Tests

Unit tests should focus on isolated functionality:

```typescript
import { formatLongitude } from './utils';

describe('formatLongitude', () => {
  it('should format longitude as a string with sign and degrees', () => {
    expect(formatLongitude(5)).toBe('♈ 5°0\'');
    expect(formatLongitude(45.5)).toBe('♉ 15°30\'');
  });
});
```

### Component Tests

Component tests should verify rendering and interactions:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

it('handles onClick events', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByRole('button', { name: /click me/i }));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### API Tests

API tests should verify request handling and responses:

```typescript
import { NextRequest } from 'next/server';
import { GET } from './route';
import { createMockRequest } from '@/lib/test/utils';
import { prismaMock } from '@/lib/test/mocks/db';

it('should return dashboard data', async () => {
  // Mock dependencies
  prismaMock.user.findUnique.mockResolvedValue({...});
  
  // Create request
  const request = createMockRequest({...}) as NextRequest;
  
  // Call API handler
  const response = await GET(request);
  const data = await response.json();
  
  // Assert response
  expect(response.status).toBe(200);
  expect(data.dashboardType).toBe('personal_growth');
});
```

## Mocking

### Prisma Mocking

Database operations are mocked using `jest-mock-extended`:

```typescript
import { prismaMock } from '@/lib/test/mocks/db';

// Mock database query
prismaMock.user.findUnique.mockResolvedValue({
  id: 1,
  clerk_user_id: 'user_123',
  // ... other fields
});
```

### External APIs

External APIs like OpenAI are mocked:

```typescript
import { openaiMock, setupOpenAIMocks } from '@/lib/test/mocks/openai';

// Set up standard OpenAI mocks
setupOpenAIMocks();

// Or customize specific responses
openaiMock.beta.threads.create.mockResolvedValue({
  id: 'custom_thread_id',
  // ... other fields
});
```

### Authentication

Authentication with Clerk is mocked in `jest.setup.js`:

```typescript
// Override for specific tests
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn().mockReturnValue({ userId: 'custom_user_id' }),
}));
```

## Best Practices

1. **Test Isolation**:
   - Reset mocks between tests with `jest.clearAllMocks()`
   - Use `beforeEach` to set up common test state
   - Avoid dependencies between tests

2. **Realistic Test Data**:
   - Use realistic but minimal test data
   - Leverage mock factories for common entities

3. **Error Cases**:
   - Test both success and error scenarios
   - Verify error handling for each function/component

4. **Asynchronous Testing**:
   - Use `async/await` for asynchronous tests
   - Properly wait for state updates with `act()`

5. **Snapshot Testing**:
   - Use sparingly and only for stable UI elements
   - Review snapshot diffs carefully during code reviews

## Code Coverage

The project aims for the following coverage targets:

- 80%+ for critical utility functions
- 70%+ for API routes
- 70%+ for UI components

To check coverage, run:

```bash
npm run test:ci
```

Coverage reports will be generated in the `coverage/` directory.

## Continuous Integration

Tests are automatically run in CI pipelines on:

- Pull request creation and updates
- Merges to main branch

The CI pipeline enforces:

- All tests passing
- Minimum code coverage thresholds
- TypeScript type checking
- Linting rules