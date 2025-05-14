/**
 * Authentication and authorization utilities
 */
import { auth as clerkAuth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/errors";
import { AuthError, ResourceNotFoundError } from "@/lib/errors/error-types";
import { 
  UserRole, 
  Permission, 
  hasPermission 
} from "./roles";
import { z } from "zod";

/**
 * Extended auth context with user role and subscription information
 */
export interface AuthContext {
  userId: string | null;
  userRole: UserRole;
  subscriptionStatus: string | null;
  permissions: Permission[];
  isSubscribed: boolean;
}

/**
 * Get authenticated user ID from Clerk
 */
export function getUserId(): string {
  const { userId } = clerkAuth();
  
  if (!userId) {
    throw new AuthError("Unauthorized: User not authenticated");
  }
  
  return userId;
}

/**
 * Get full auth context including role and subscription info
 */
export async function getAuthContext(): Promise<AuthContext> {
  const { userId } = clerkAuth();
  
  if (!userId) {
    return {
      userId: null,
      userRole: UserRole.USER, // Default role
      subscriptionStatus: null,
      permissions: [],
      isSubscribed: false,
    };
  }
  
  // Get user with role and subscription information
  const user = await prisma.user.findUnique({
    where: {
      clerk_user_id: userId,
      deleted_at: null,
    },
    select: {
      role: true,
      subscription_status: true,
      trial_ends_at: true,
    },
  });
  
  if (!user) {
    throw new ResourceNotFoundError("User");
  }
  
  // Determine user role
  const userRole = user.role as UserRole || UserRole.USER;
  
  // Get base permissions from role
  const permissions = [...(userRole ? 
    (userRole === UserRole.ADMIN ? 
      Object.values(Permission) : 
      []) :
    [])];
  
  // Add subscription-specific permissions
  let isSubscribed = false;
  if (user.subscription_status === 'ACTIVE') {
    isSubscribed = true;
  } else if (user.subscription_status === 'TRIALING' && user.trial_ends_at) {
    isSubscribed = new Date(user.trial_ends_at) > new Date();
  }
  
  return {
    userId,
    userRole,
    subscriptionStatus: user.subscription_status,
    permissions,
    isSubscribed,
  };
}

/**
 * Check if authenticated user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const authContext = await getAuthContext();
  
  if (!authContext.userId) {
    return false;
  }
  
  return hasPermission(
    permission,
    authContext.userRole,
    authContext.subscriptionStatus || undefined
  );
}

/**
 * Middleware to verify a user has specific permissions
 */
export function withPermission(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  requiredPermission: Permission
) {
  return withErrorHandling(async (req: NextRequest, context: any) => {
    const authContext = await getAuthContext();
    
    if (!authContext.userId) {
      throw new AuthError("Unauthorized: User not authenticated");
    }
    
    const hasRequiredPermission = hasPermission(
      requiredPermission,
      authContext.userRole,
      authContext.subscriptionStatus || undefined
    );
    
    if (!hasRequiredPermission) {
      throw new AuthError(
        "Forbidden: Insufficient permissions", 
        "insufficient_permissions"
      );
    }
    
    return handler(req, {
      ...context,
      auth: authContext,
    });
  });
}

/**
 * Middleware to verify a user has an active subscription
 */
export function withSubscription(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest, context: any) => {
    const authContext = await getAuthContext();
    
    if (!authContext.userId) {
      throw new AuthError("Unauthorized: User not authenticated");
    }
    
    if (!authContext.isSubscribed) {
      throw new AuthError(
        "Subscription required for this feature", 
        "subscription_required"
      );
    }
    
    return handler(req, {
      ...context,
      auth: authContext,
    });
  });
}

/**
 * Middleware to verify a user is an admin
 */
export function withAdminAccess(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return withErrorHandling(async (req: NextRequest, context: any) => {
    const authContext = await getAuthContext();
    
    if (!authContext.userId) {
      throw new AuthError("Unauthorized: User not authenticated");
    }
    
    if (authContext.userRole !== UserRole.ADMIN) {
      throw new AuthError(
        "Forbidden: Admin access required", 
        "admin_access_required"
      );
    }
    
    return handler(req, {
      ...context,
      auth: authContext,
    });
  });
}

/**
 * Middleware to verify resource ownership
 */
export function withResourceOwnership<T extends { user_clerk_id?: string }>(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  resourceFetcher: (context: any) => Promise<T | null>,
  options: {
    allowAdmin?: boolean;
    allowModerator?: boolean;
  } = {}
) {
  return withErrorHandling(async (req: NextRequest, context: any) => {
    const authContext = await getAuthContext();
    
    if (!authContext.userId) {
      throw new AuthError("Unauthorized: User not authenticated");
    }
    
    // Admins can access any resource if allowed
    if (options.allowAdmin && authContext.userRole === UserRole.ADMIN) {
      return handler(req, {
        ...context,
        auth: authContext,
      });
    }
    
    // Moderators can access resources if allowed
    if (options.allowModerator && authContext.userRole === UserRole.MODERATOR) {
      return handler(req, {
        ...context,
        auth: authContext,
      });
    }
    
    // Fetch the resource
    const resource = await resourceFetcher(context);
    
    if (!resource) {
      throw new ResourceNotFoundError("Resource");
    }
    
    // Check if user owns the resource
    if (resource.user_clerk_id !== authContext.userId) {
      throw new AuthError(
        "Forbidden: You don't have access to this resource", 
        "resource_access_denied"
      );
    }
    
    return handler(req, {
      ...context,
      auth: authContext,
      resource,
    });
  });
}