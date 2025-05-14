/**
 * Audit logging system for security and compliance
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getUserId } from "./index";
import { errorLogger } from "@/lib/errors/logger";

/**
 * Event types for audit logging
 */
export enum AuditEventType {
  // Authentication events
  LOGIN = 'auth.login',
  LOGOUT = 'auth.logout',
  LOGIN_FAILED = 'auth.login_failed',
  PASSWORD_RESET = 'auth.password_reset',
  
  // User management events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  ROLE_ASSIGNED = 'user.role_assigned',
  PERMISSION_GRANTED = 'user.permission_granted',
  PERMISSION_REVOKED = 'user.permission_revoked',
  
  // Data access events
  PROFILE_CREATED = 'profile.created',
  PROFILE_UPDATED = 'profile.updated',
  PROFILE_DELETED = 'profile.deleted',
  PROFILE_ACCESSED = 'profile.accessed',
  
  // Chat-related events
  CHAT_STARTED = 'chat.started',
  CHAT_MESSAGE_SENT = 'chat.message_sent',
  CHART_CONTEXT_USED = 'chat.chart_context_used',
  
  // Subscription events
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  PAYMENT_SUCCEEDED = 'subscription.payment_succeeded',
  PAYMENT_FAILED = 'subscription.payment_failed',
  
  // Admin-specific events
  ADMIN_ACCESS = 'admin.access',
  SYSTEM_SETTING_CHANGED = 'admin.system_setting_changed',
  USER_IMPERSONATED = 'admin.user_impersonated',
  
  // Security events
  SUSPICIOUS_ACTIVITY = 'security.suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit_exceeded',
  API_KEY_GENERATED = 'security.api_key_generated',
  API_KEY_REVOKED = 'security.api_key_revoked',
}

/**
 * Audit log entry interface
 */
interface AuditLogEntry {
  user_clerk_id?: string;
  event_type: AuditEventType | string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
}

/**
 * Extract request metadata for audit logs
 */
function extractRequestMetadata(req?: NextRequest): {
  ip_address?: string;
  user_agent?: string;
} {
  if (!req) {
    return {};
  }
  
  return {
    ip_address: req.ip || req.headers.get('x-forwarded-for') || undefined,
    user_agent: req.headers.get('user-agent') || undefined,
  };
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  entry: AuditLogEntry,
  req?: NextRequest
): Promise<void> {
  try {
    // Get authenticated user if available and not already provided
    if (!entry.user_clerk_id) {
      try {
        entry.user_clerk_id = getUserId();
      } catch (e) {
        // Continue without user ID if not authenticated
      }
    }
    
    // Extract metadata from request if available
    const metadata = extractRequestMetadata(req);
    
    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        user_clerk_id: entry.user_clerk_id,
        event_type: entry.event_type,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        ip_address: metadata.ip_address || entry.ip_address,
        user_agent: metadata.user_agent || entry.user_agent,
        details: entry.details ? JSON.stringify(entry.details) : undefined,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not affect main operations
    errorLogger(error, { context: 'audit-logging', entry });
  }
}

/**
 * Log authentication events
 */
export function logAuthEvent(
  eventType: AuditEventType,
  details?: Record<string, any>,
  req?: NextRequest
): void {
  createAuditLog(
    {
      event_type: eventType,
      details,
    },
    req
  );
}

/**
 * Log data access events
 */
export function logDataAccess(
  eventType: AuditEventType,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>,
  req?: NextRequest
): void {
  createAuditLog(
    {
      event_type: eventType,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    },
    req
  );
}

/**
 * Log security events
 */
export function logSecurityEvent(
  eventType: AuditEventType,
  details: Record<string, any>,
  req?: NextRequest
): void {
  createAuditLog(
    {
      event_type: eventType,
      details,
    },
    req
  );
}

/**
 * Log admin actions
 */
export function logAdminAction(
  eventType: AuditEventType,
  adminUserId: string,
  details: Record<string, any>,
  req?: NextRequest
): void {
  createAuditLog(
    {
      user_clerk_id: adminUserId,
      event_type: eventType,
      details,
    },
    req
  );
}