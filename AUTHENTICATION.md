# Authentication & Authorization System

This document outlines the authentication and authorization system implemented in the Astrology AI Copilot application. The system provides a comprehensive approach to user authentication, role-based access control, and audit logging.

## Core Components

1. **Authentication Provider**: Clerk is used as the primary authentication provider, handling user sign-up, sign-in, and session management.

2. **Role-Based Access Control (RBAC)**: A custom role and permission system to control access to resources and features.

3. **Resource Ownership**: A system to ensure users can only access their own data.

4. **Subscription-Based Access**: Certain features are restricted based on user subscription status.

5. **Audit Logging**: Comprehensive logging of security-related events for compliance and debugging.

## Authentication Flow

1. **User Authentication**: Users authenticate via Clerk's authentication system.

2. **Session Management**: Clerk provides JWT tokens used to authenticate API requests.

3. **Middleware Protection**: The Next.js middleware protects routes based on authentication status and role.

4. **Permission Verification**: API routes verify permissions before allowing access to resources.

## User Roles

The application defines four primary user roles:

1. **User (`user`)**: Standard users with access to their own data and basic features.

2. **Admin (`admin`)**: Administrators with full system access, including user management and system settings.

3. **Moderator (`moderator`)**: Content moderators with access to review user content and audit logs.

4. **Support (`support`)**: Customer support representatives with limited access to help users.

## Permissions System

Permissions are defined as fine-grained access controls for specific actions:

```typescript
export enum Permission {
  // User profile permissions
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',
  
  // Birth profile permissions
  READ_OWN_BIRTH_PROFILES = 'read:own_birth_profiles',
  CREATE_BIRTH_PROFILE = 'create:birth_profile',
  
  // Feature permissions
  USE_CHAT = 'use:chat',
  USE_CHART_CONTEXT = 'use:chart_context',
  VIEW_PERSONAL_DASHBOARD = 'view:personal_dashboard',
  
  // Admin permissions
  VIEW_ANY_USER = 'view:any_user',
  UPDATE_ANY_USER = 'update:any_user',
  
  // And more...
}
```

## Middleware & Route Protection

### API Route Protection

API routes are protected using specialized middleware:

1. **`withErrorHandling`**: Provides consistent error handling and formatting.

2. **`withPermission`**: Verifies that the user has the required permission.

3. **`withSubscription`**: Checks that the user has an active subscription.

4. **`withAdminAccess`**: Restricts access to admin users only.

5. **`withResourceOwnership`**: Ensures the requested resource belongs to the user.

Example usage:

```typescript
export const GET = withResourceOwnership(
  async (req: NextRequest, context: any) => {
    // Handler implementation
    return NextResponse.json(data);
  },
  (context: any) => fetchResource(context.params.id),
  { allowAdmin: true }
);
```

### Page Protection

Client-side pages use a combination of:

1. **Next.js Middleware**: For initial route protection.

2. **`useAuth` Hook**: For component-level access control.

Example usage:

```typescript
function ProtectedFeature() {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(Permission.USE_PREMIUM_FEATURE)) {
    return <UpgradePrompt />;
  }
  
  return <PremiumFeature />;
}
```

## Subscription Integration

Subscription status affects available permissions:

```typescript
export const SUBSCRIPTION_PERMISSIONS: Record<string, Permission[]> = {
  // Free tier users
  FREE_TIER_POST_TRIAL: [
    Permission.USE_CHAT,
  ],
  
  // Paid subscribers
  ACTIVE: [
    Permission.USE_CHAT,
    Permission.USE_CHART_CONTEXT,
    Permission.VIEW_PERSONAL_DASHBOARD,
  ],
};
```

## Audit Logging

The system logs security events for monitoring and compliance:

```typescript
// Log a security event
logSecurityEvent(
  AuditEventType.SUSPICIOUS_ACTIVITY,
  { ip_address: '123.456.789.0', details: 'Multiple failed login attempts' },
  req
);

// Log admin actions
logAdminAction(
  AuditEventType.USER_UPDATED,
  adminUserId,
  { action: 'update_user', target_user_id: userId },
  req
);
```

## Database Schema

The auth system relies on these database models:

1. **User**: Core user data including role and subscription status.

2. **UserPermission**: Custom permissions granted to specific users.

3. **UserSession**: Active user sessions for tracking and management.

4. **AuditLog**: Security and access events for auditing.

## Session Management

Sessions are tracked for security and auditing:

1. **Creation**: Sessions are created on login.

2. **Tracking**: Sessions track last activity, IP address, and user agent.

3. **Revocation**: Sessions can be revoked for security reasons.

4. **Expiration**: Sessions automatically expire based on configured timeouts.

## Security Considerations

1. **Role Assignment**: Only admins can assign roles to users.

2. **Admin Actions**: All admin actions are strictly logged.

3. **Resource Access**: All resource access checks both authentication and resource ownership.

4. **Permission Checks**: API routes perform server-side permission checks, not relying on client claims.

5. **Sensitive Operations**: Critical operations require additional verification.

## Usage Examples

### Checking Permissions in API Routes

```typescript
// Check if user has permission to access a resource
if (!await checkPermission(Permission.VIEW_PERSONAL_DASHBOARD)) {
  throw new AuthError("Insufficient permissions");
}
```

### Resource Ownership Protection

```typescript
export const PUT = withResourceOwnership(
  async (req: NextRequest, context: any) => {
    // Resource is guaranteed to belong to the user
    const resource = context.resource;
    
    // Handle the update
    const updatedResource = await updateResource(resource.id, data);
    return NextResponse.json(updatedResource);
  },
  (context: any) => fetchResourceById(context.params.id)
);
```

### Admin-Only Endpoints

```typescript
export const GET = withAdminAccess(async (req: NextRequest, context: any) => {
  // This endpoint is only accessible to admins
  const users = await getAllUsers();
  return NextResponse.json(users);
});
```

### Client-Side Permission Checks

```tsx
function DashboardPage() {
  const { hasPermission, isSubscribed } = useAuth();
  
  if (!isSubscribed) {
    return <SubscriptionRequired />;
  }
  
  if (!hasPermission(Permission.VIEW_PERSONAL_DASHBOARD)) {
    return <AccessDenied />;
  }
  
  return <Dashboard />;
}
```