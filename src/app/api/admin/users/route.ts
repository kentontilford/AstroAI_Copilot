import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { withAdminAccess } from "@/lib/auth";
import { UserRole } from "@/lib/auth/roles";
import { logAdminAction } from "@/lib/auth/audit";
import { AuditEventType } from "@/lib/auth/audit";

// Validation schema for user search
const searchUsersSchema = z.object({
  query: z.string().optional(),
  role: z.enum(['user', 'admin', 'moderator', 'support']).optional(),
  subscription_status: z.enum(['TRIALING', 'ACTIVE', 'LAPSED', 'CANCELLED', 'FREE_TIER_POST_TRIAL']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// GET endpoint - Search and list users (admin only)
export const GET = withAdminAccess(async (req: NextRequest, context: any) => {
  // Parse search parameters from URL
  const url = new URL(req.url);
  const queryParams = {
    query: url.searchParams.get('query') || undefined,
    role: url.searchParams.get('role') as UserRole | undefined,
    subscription_status: url.searchParams.get('subscription_status') || undefined,
    page: parseInt(url.searchParams.get('page') || '1'),
    limit: parseInt(url.searchParams.get('limit') || '20'),
  };
  
  // Validate query parameters
  const { query, role, subscription_status, page, limit } = searchUsersSchema.parse(queryParams);
  
  // Build where clause for filtering
  const where: any = {
    deleted_at: null,
  };
  
  if (query) {
    where.OR = [
      { email: { contains: query, mode: 'insensitive' } },
      { first_name: { contains: query, mode: 'insensitive' } },
      { last_name: { contains: query, mode: 'insensitive' } },
    ];
  }
  
  if (role) {
    where.role = role;
  }
  
  if (subscription_status) {
    where.subscription_status = subscription_status;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Fetch users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        clerk_user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        profile_image_url: true,
        role: true,
        subscription_status: true,
        trial_ends_at: true,
        current_subscription_period_end: true,
        created_at: true,
        is_verified: true,
        _count: {
          select: {
            birth_profiles: true,
            chat_threads: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  
  // Format response with pagination metadata
  const response = {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
  
  // Log the admin action
  logAdminAction(
    AuditEventType.ADMIN_ACCESS,
    context.auth.userId,
    { action: 'list_users', filters: { query, role, subscription_status } },
    req
  );
  
  return NextResponse.json(response);
});

// Validation schema for creating a user
const createUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50).optional(),
  role: z.enum(['user', 'admin', 'moderator', 'support']).default('user'),
  subscription_status: z.enum(['TRIALING', 'ACTIVE', 'LAPSED', 'CANCELLED', 'FREE_TIER_POST_TRIAL']).default('TRIALING'),
  trial_ends_at: z.string().datetime().optional(),
});

// POST endpoint - Create a new user (admin only)
export const POST = withAdminAccess(async (req: NextRequest, context: any) => {
  const data = await req.json();
  const validatedData = createUserSchema.parse(data);
  
  // Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
    select: { clerk_user_id: true, deleted_at: true },
  });
  
  // If the user exists but is soft-deleted, reactivate them
  if (existingUser && existingUser.deleted_at) {
    const reactivatedUser = await prisma.user.update({
      where: { clerk_user_id: existingUser.clerk_user_id },
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        role: validatedData.role as UserRole,
        subscription_status: validatedData.subscription_status,
        trial_ends_at: validatedData.trial_ends_at ? new Date(validatedData.trial_ends_at) : null,
        deleted_at: null,
      },
      select: {
        clerk_user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        subscription_status: true,
        created_at: true,
      },
    });
    
    // Log the reactivation
    logAdminAction(
      AuditEventType.USER_UPDATED,
      context.auth.userId,
      { action: 'reactivate_user', user_id: existingUser.clerk_user_id },
      req
    );
    
    return NextResponse.json(reactivatedUser, { status: 200 });
  }
  
  // If the user already exists and is not deleted, return an error
  if (existingUser) {
    return NextResponse.json(
      { error: 'A user with this email already exists' },
      { status: 409 }
    );
  }
  
  // Create the user in Clerk
  // NOTE: This is just a stub. In a real implementation, you would use Clerk's API
  // to create the user and get back a clerk_user_id.
  // For this example, we'll generate a mock ID
  const mockClerkUserId = `user_${Date.now()}`;
  
  // Create the user in our database
  const newUser = await prisma.user.create({
    data: {
      clerk_user_id: mockClerkUserId,
      email: validatedData.email,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      role: validatedData.role as UserRole,
      subscription_status: validatedData.subscription_status,
      trial_ends_at: validatedData.trial_ends_at ? new Date(validatedData.trial_ends_at) : null,
    },
    select: {
      clerk_user_id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      subscription_status: true,
      created_at: true,
    },
  });
  
  // Log the creation
  logAdminAction(
    AuditEventType.USER_CREATED,
    context.auth.userId,
    { action: 'create_user', user_id: newUser.clerk_user_id },
    req
  );
  
  return NextResponse.json(newUser, { status: 201 });
});