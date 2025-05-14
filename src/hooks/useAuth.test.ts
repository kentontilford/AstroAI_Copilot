import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { Permission, UserRole } from '@/lib/auth/roles';

// Mock global fetch
global.fetch = jest.fn();

// Mock Clerk's useUser and useAuth hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  useAuth: jest.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_123',
    getToken: jest.fn().mockResolvedValue('mock-token'),
  }),
}));

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle unauthenticated state', async () => {
    // Mock Clerk's hooks to return unauthenticated state
    require('@clerk/nextjs').useUser.mockReturnValueOnce({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    });

    require('@clerk/nextjs').useAuth.mockReturnValueOnce({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      getToken: jest.fn(),
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.userId).toBeNull();
    expect(result.current.userRole).toBe(UserRole.USER);
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.hasPermission(Permission.USE_CHAT)).toBe(false);
  });

  it('should fetch user data and set auth state', async () => {
    // Mock fetch to return user data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        role: UserRole.ADMIN,
        is_subscribed: true,
        subscription_status: 'ACTIVE',
        permissions: [Permission.USE_CHAT, Permission.VIEW_ANY_USER],
      }),
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    // Initially should be in loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for data fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for useEffect
    });

    // After data fetch, should have updated state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.userId).toBe('user_123');
    expect(result.current.userRole).toBe(UserRole.ADMIN);
    expect(result.current.isSubscribed).toBe(true);
    expect(result.current.hasPermission(Permission.USE_CHAT)).toBe(true);
    expect(result.current.hasPermission(Permission.VIEW_ANY_USER)).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    const { result } = renderHook(() => useAuth());

    // Wait for data fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for useEffect
    });

    // Should have default fallback values
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.userId).toBe('user_123');
    expect(result.current.userRole).toBe(UserRole.USER);
    expect(result.current.isSubscribed).toBe(false);
    expect(result.current.permissions).toEqual([]);
    expect(result.current.hasPermission(Permission.USE_CHAT)).toBe(false);
  });

  it('should correctly check subscription-specific permissions', async () => {
    // Mock fetch to return user data with active subscription
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        role: UserRole.USER,
        is_subscribed: true,
        subscription_status: 'ACTIVE',
        permissions: [Permission.USE_CHAT],
      }),
    });

    const { result } = renderHook(() => useAuth());

    // Wait for data fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for useEffect
    });

    // Should have permission for subscription features
    expect(result.current.hasPermission(Permission.USE_CHART_CONTEXT)).toBe(true);
    expect(result.current.hasPermission(Permission.VIEW_PERSONAL_DASHBOARD)).toBe(true);
    expect(result.current.hasPermission(Permission.VIEW_RELATIONSHIP_DASHBOARD)).toBe(true);
  });
});