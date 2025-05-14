/**
 * Role definitions and permission system for the application
 */

/**
 * Available user roles in the system
 */
export enum UserRole {
  USER = 'user',       // Standard user with default permissions
  ADMIN = 'admin',     // Administrator with full system access
  MODERATOR = 'moderator', // Moderator with partial admin access
  SUPPORT = 'support', // Customer support with limited account access
}

/**
 * Available permissions in the system
 */
export enum Permission {
  // User profile permissions
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',
  DELETE_OWN_PROFILE = 'delete:own_profile',
  
  // Birth profile permissions
  READ_OWN_BIRTH_PROFILES = 'read:own_birth_profiles',
  CREATE_BIRTH_PROFILE = 'create:birth_profile',
  UPDATE_OWN_BIRTH_PROFILE = 'update:own_birth_profile',
  DELETE_OWN_BIRTH_PROFILE = 'delete:own_birth_profile',
  
  // Chat and AI permissions
  USE_CHAT = 'use:chat',
  VIEW_OWN_CHAT_HISTORY = 'view:own_chat_history',
  USE_CHART_CONTEXT = 'use:chart_context',
  
  // Dashboard permissions
  VIEW_PERSONAL_DASHBOARD = 'view:personal_dashboard',
  VIEW_RELATIONSHIP_DASHBOARD = 'view:relationship_dashboard',
  
  // Subscription permissions
  MANAGE_OWN_SUBSCRIPTION = 'manage:own_subscription',
  
  // Admin permissions
  VIEW_ANY_USER = 'view:any_user',
  UPDATE_ANY_USER = 'update:any_user',
  DELETE_ANY_USER = 'delete:any_user',
  VIEW_ANY_BIRTH_PROFILE = 'view:any_birth_profile',
  UPDATE_ANY_BIRTH_PROFILE = 'update:any_birth_profile',
  DELETE_ANY_BIRTH_PROFILE = 'delete:any_birth_profile',
  VIEW_SYSTEM_METRICS = 'view:system_metrics',
  MANAGE_SYSTEM_SETTINGS = 'manage:system_settings',
  
  // Moderator permissions
  VIEW_CHAT_LOGS = 'view:chat_logs',
  MANAGE_CONTENT = 'manage:content',
  
  // Support permissions
  HELP_USER_ISSUES = 'help:user_issues',
}

/**
 * Role-permission mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.DELETE_OWN_PROFILE,
    Permission.READ_OWN_BIRTH_PROFILES,
    Permission.CREATE_BIRTH_PROFILE,
    Permission.UPDATE_OWN_BIRTH_PROFILE,
    Permission.DELETE_OWN_BIRTH_PROFILE,
    Permission.USE_CHAT,
    Permission.VIEW_OWN_CHAT_HISTORY,
    Permission.MANAGE_OWN_SUBSCRIPTION,
    // Note: Premium permissions like USE_CHART_CONTEXT are granted based on subscription status,
    // not role, and are checked separately
  ],
  
  [UserRole.ADMIN]: [
    // Admins have all permissions
    ...Object.values(Permission),
  ],
  
  [UserRole.MODERATOR]: [
    // Moderators have user permissions plus moderation permissions
    ...ROLE_PERMISSIONS[UserRole.USER],
    Permission.VIEW_ANY_USER,
    Permission.VIEW_ANY_BIRTH_PROFILE,
    Permission.VIEW_CHAT_LOGS,
    Permission.MANAGE_CONTENT,
    Permission.VIEW_SYSTEM_METRICS,
  ],
  
  [UserRole.SUPPORT]: [
    // Support has limited user data access for helping users
    Permission.VIEW_ANY_USER,
    Permission.HELP_USER_ISSUES,
    Permission.VIEW_CHAT_LOGS,
  ],
};

/**
 * Subscription-specific permissions that override or add to role-based permissions
 */
export const SUBSCRIPTION_PERMISSIONS: Record<string, Permission[]> = {
  // Users on the free tier (after trial)
  FREE_TIER_POST_TRIAL: [
    // Limited chat access
    Permission.USE_CHAT,
    // No dashboard or chart context access
  ],
  
  // Users on active trial
  TRIALING: [
    // Full access during trial
    Permission.USE_CHAT,
    Permission.USE_CHART_CONTEXT,
    Permission.VIEW_PERSONAL_DASHBOARD,
    Permission.VIEW_RELATIONSHIP_DASHBOARD,
  ],
  
  // Paid subscribers
  ACTIVE: [
    // Full premium access
    Permission.USE_CHAT,
    Permission.USE_CHART_CONTEXT,
    Permission.VIEW_PERSONAL_DASHBOARD,
    Permission.VIEW_RELATIONSHIP_DASHBOARD,
  ],
};

/**
 * Check if a user has a specific permission based on their role and subscription status
 */
export function hasPermission(
  permission: Permission,
  userRole: UserRole,
  subscriptionStatus?: string,
): boolean {
  // Check if the role has the permission
  const hasRolePermission = ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
  
  // Admin role always gets all permissions regardless of subscription
  if (userRole === UserRole.ADMIN) {
    return true;
  }
  
  // For regular users, check if the permission requires subscription
  const isPremiumPermission = [
    Permission.USE_CHART_CONTEXT,
    Permission.VIEW_PERSONAL_DASHBOARD,
    Permission.VIEW_RELATIONSHIP_DASHBOARD,
  ].includes(permission);
  
  // If it's a premium permission, check subscription status
  if (isPremiumPermission) {
    if (!subscriptionStatus) {
      return false;
    }
    
    const subscriptionPermissions = SUBSCRIPTION_PERMISSIONS[subscriptionStatus] || [];
    return subscriptionPermissions.includes(permission);
  }
  
  // For non-premium permissions, just check role
  return hasRolePermission;
}