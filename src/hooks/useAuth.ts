import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Permission, UserRole } from "@/lib/auth/roles";

export interface AuthState {
  isLoading: boolean;
  isSignedIn: boolean;
  userId: string | null;
  userRole: UserRole;
  isSubscribed: boolean;
  subscriptionStatus: string | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
}

/**
 * Custom hook for authentication state and permissions
 */
export function useAuth(): AuthState {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useClerkAuth();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isSignedIn: false,
    userId: null,
    userRole: UserRole.USER,
    isSubscribed: false,
    subscriptionStatus: null,
    permissions: [],
    hasPermission: () => false,
  });

  useEffect(() => {
    // If Clerk hasn't loaded yet, keep waiting
    if (!isLoaded) return;

    // If user is not signed in, update state accordingly
    if (!isSignedIn || !user) {
      setAuthState({
        isLoading: false,
        isSignedIn: false,
        userId: null,
        userRole: UserRole.USER,
        isSubscribed: false,
        subscriptionStatus: null,
        permissions: [],
        hasPermission: () => false,
      });
      return;
    }

    // Fetch user data with permissions from our API
    const fetchUserData = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        
        // Extract permissions from user data
        const permissions = userData.permissions || [];
        const userRole = userData.role || UserRole.USER;
        const isSubscribed = userData.is_subscribed || false;
        const subscriptionStatus = userData.subscription_status || null;
        
        // Function to check if user has a specific permission
        const hasPermission = (permission: Permission): boolean => {
          // Check explicit permissions
          if (permissions.includes(permission)) {
            return true;
          }
          
          // Admin always has all permissions
          if (userRole === UserRole.USER) {
            return false;
          }
          
          // For subscription-specific permissions, check subscription status
          if (
            [
              Permission.USE_CHART_CONTEXT,
              Permission.VIEW_PERSONAL_DASHBOARD,
              Permission.VIEW_RELATIONSHIP_DASHBOARD,
            ].includes(permission)
          ) {
            return isSubscribed;
          }
          
          return false;
        };

        setAuthState({
          isLoading: false,
          isSignedIn: true,
          userId: user.id,
          userRole: userRole as UserRole,
          isSubscribed,
          subscriptionStatus,
          permissions: permissions as Permission[],
          hasPermission,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Fallback to basic auth state if API fails
        setAuthState({
          isLoading: false,
          isSignedIn: true,
          userId: user.id,
          userRole: UserRole.USER,
          isSubscribed: false,
          subscriptionStatus: null,
          permissions: [],
          hasPermission: () => false,
        });
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, user, getToken]);

  return authState;
}