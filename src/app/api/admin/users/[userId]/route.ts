import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { withAdminAccess } from "@/lib/auth";
import { UserRole } from "@/lib/auth/roles";
import { logAdminAction } from "@/lib/auth/audit";
import { AuditEventType } from "@/lib/auth/audit";
import { ResourceNotFoundError } from "@/lib/errors/error-types";

// Validation schema for updating a user
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  role: z.enum(['user', 'admin', 'moderator', 'support']).optional(),
  subscription_status: z.enum(['TRIALING', 'ACTIVE', 'LAPSED', 'CANCELLED', 'FREE_TIER_POST_TRIAL']).optional(),
  trial_ends_at: z.string().datetime().optional().nullable(),
  current_subscription_period_end: z.string().datetime().optional().nullable(),
  is_verified: z.boolean().optional(),
});

// GET endpoint - Get user details (admin only)
export const GET = withAdminAccess(async (req: NextRequest, context: any) => {
  const userId = context.params.userId;
  
  // Fetch detailed user information
  const user = await prisma.user.findUnique({
    where: {
      clerk_user_id: userId,
      deleted_at: null,
    },
    include: {
      birth_profiles: {
        where: { deleted_at: null },
        orderBy: { created_at: 'desc' },
      },
      chat_threads: {
        where: { deleted_at: null },
        orderBy: { last_message_at: 'desc' },
        take: 10, // Limit the number of threads to avoid large payloads
      },
      permissions: {
        where: { deleted_at: null },
      },
      // Include audit logs related to this user
      audit_logs: {
        orderBy: { created_at: 'desc' },
        take: 20, // Limit to recent logs
      },
    },
  });
  
  if (!user) {
    throw new ResourceNotFoundError("User");
  }
  
  // Calculate subscription status
  const isSubscribed = user.subscription_status === 'ACTIVE' || (
    user.subscription_status === 'TRIALING' && 
    user.trial_ends_at && 
    new Date(user.trial_ends_at) > new Date()
  );
  
  // Fetch additional stats
  const stats = await prisma.$transaction([
    prisma.chatMessage.count({
      where: {
        thread: {
          user_clerk_id: userId,
          deleted_at: null,
        },
        deleted_at: null,
      },
    }),
    prisma.auditLog.count({
      where: {
        user_clerk_id: userId,
      },
    }),
  ]);
  
  // Format response with additional calculated fields
  const response = {
    ...user,
    message_count: stats[0],
    audit_log_count: stats[1],
    subscription: {
      status: user.subscription_status,
      is_subscribed: isSubscribed,
      trial_ends_at: user.trial_ends_at,
      current_period_end: user.current_subscription_period_end,
    },
  };
  
  // Log the admin access
  logAdminAction(
    AuditEventType.ADMIN_ACCESS,
    context.auth.userId,
    { action: 'view_user_details', target_user_id: userId },
    req
  );
  
  return NextResponse.json(response);
});

// PUT endpoint - Update user (admin only)
export const PUT = withAdminAccess(async (req: NextRequest, context: any) => {
  const userId = context.params.userId;
  const data = await req.json();
  
  // Validate input data
  const validatedData = updateUserSchema.parse(data);
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: {
      clerk_user_id: userId,
      deleted_at: null,
    },
    select: { clerk_user_id: true, role: true, subscription_status: true },
  });
  
  if (!user) {
    throw new ResourceNotFoundError("User");
  }
  
  // Prepare data for update
  const updateData: any = { ...validatedData };
  
  // Convert date strings to Date objects if they exist
  if (updateData.trial_ends_at) {
    updateData.trial_ends_at = new Date(updateData.trial_ends_at);
  }
  
  if (updateData.current_subscription_period_end) {
    updateData.current_subscription_period_end = new Date(updateData.current_subscription_period_end);
  }
  
  // Update the user
  const updatedUser = await prisma.user.update({
    where: {
      clerk_user_id: userId,
    },
    data: updateData,
    select: {
      clerk_user_id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      subscription_status: true,
      trial_ends_at: true,
      current_subscription_period_end: true,
      is_verified: true,
      created_at: true,
      updated_at: true,
    },
  });
  
  // Track significant changes for audit
  const significantChanges: Record<string, any> = {};
  
  if (validatedData.role && validatedData.role !== user.role) {
    significantChanges.role_changed = {
      from: user.role,
      to: validatedData.role,
    };
  }
  
  if (validatedData.subscription_status && validatedData.subscription_status !== user.subscription_status) {
    significantChanges.subscription_status_changed = {
      from: user.subscription_status,
      to: validatedData.subscription_status,
    };
  }
  
  // Log the update
  logAdminAction(
    AuditEventType.USER_UPDATED,
    context.auth.userId,
    { 
      action: 'update_user', 
      target_user_id: userId,
      changes: Object.keys(validatedData),
      significant_changes: Object.keys(significantChanges).length > 0 ? significantChanges : undefined,
    },
    req
  );
  
  return NextResponse.json(updatedUser);
});

// DELETE endpoint - Soft delete user (admin only)
export const DELETE = withAdminAccess(async (req: NextRequest, context: any) => {
  const userId = context.params.userId;
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: {
      clerk_user_id: userId,
      deleted_at: null,
    },
    select: { clerk_user_id: true, email: true },
  });
  
  if (!user) {
    throw new ResourceNotFoundError("User");
  }
  
  // Start a transaction to handle all soft deletes
  await prisma.$transaction(async (tx) => {
    // Soft delete the user
    await tx.user.update({
      where: {
        clerk_user_id: userId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
    
    // Soft delete all related birth profiles
    await tx.birthProfile.updateMany({
      where: {
        user_clerk_id: userId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
    
    // Soft delete all chat threads
    await tx.chatThread.updateMany({
      where: {
        user_clerk_id: userId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
    
    // Revoke all active sessions
    await tx.userSession.updateMany({
      where: {
        user_clerk_id: userId,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
        revoked_reason: 'User account deleted by admin',
      },
    });
  });
  
  // Log the deletion
  logAdminAction(
    AuditEventType.USER_DELETED,
    context.auth.userId,
    { 
      action: 'delete_user', 
      target_user_id: userId,
      target_user_email: user.email,
    },
    req
  );
  
  return NextResponse.json({ 
    success: true, 
    message: "User deleted successfully" 
  });
});