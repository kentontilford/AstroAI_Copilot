import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { 
  withErrorHandling, 
  ResourceNotFoundError 
} from "@/lib/errors";
import { 
  withPermission, 
  withResourceOwnership 
} from "@/lib/auth";
import { Permission } from "@/lib/auth/roles";
import { logDataAccess } from "@/lib/auth/audit";
import { AuditEventType } from "@/lib/auth/audit";

// Validation schema for update request
const updateBirthProfileSchema = z.object({
  profile_name: z.string().min(1).max(100).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time_of_birth: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  place_of_birth: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

// Helper function to fetch a birth profile
const fetchBirthProfile = async (profileId: string) => {
  const id = parseInt(profileId);
  if (isNaN(id)) {
    throw new ResourceNotFoundError("Birth Profile");
  }
  
  return prisma.birthProfile.findUnique({
    where: {
      id,
      deleted_at: null,
    },
  });
};

// GET endpoint - Get a specific birth profile
export const GET = withResourceOwnership(
  async (req: NextRequest, context: any) => {
    const profileId = context.params.profileId;
    // Resource is already fetched by withResourceOwnership
    const profile = context.resource;
    
    // Log access to the profile
    logDataAccess(
      AuditEventType.PROFILE_ACCESSED,
      "BirthProfile",
      profileId,
      undefined,
      req
    );
    
    return NextResponse.json(profile);
  },
  (context: any) => fetchBirthProfile(context.params.profileId),
  { allowAdmin: true }
);

// PUT endpoint - Update a birth profile
export const PUT = withResourceOwnership(
  async (req: NextRequest, context: any) => {
    const profileId = parseInt(context.params.profileId);
    if (isNaN(profileId)) {
      throw new ResourceNotFoundError("Birth Profile");
    }
    
    const data = await req.json();
    const validated = updateBirthProfileSchema.parse(data);
    
    // Update the profile
    const updatedProfile = await prisma.birthProfile.update({
      where: {
        id: profileId,
        deleted_at: null,
      },
      data: validated,
    });
    
    // Log the update
    logDataAccess(
      AuditEventType.PROFILE_UPDATED,
      "BirthProfile",
      profileId.toString(),
      { fields: Object.keys(validated) },
      req
    );
    
    return NextResponse.json(updatedProfile);
  },
  (context: any) => fetchBirthProfile(context.params.profileId),
  { allowAdmin: true }
);

// DELETE endpoint - Soft delete a birth profile
export const DELETE = withResourceOwnership(
  async (req: NextRequest, context: any) => {
    const profileId = parseInt(context.params.profileId);
    if (isNaN(profileId)) {
      throw new ResourceNotFoundError("Birth Profile");
    }
    
    // Check if this profile is used as a default profile
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { default_solo_profile_id: profileId },
          { default_relationship_profile_a_id: profileId },
          { default_relationship_profile_b_id: profileId },
        ],
        deleted_at: null,
      },
      select: {
        clerk_user_id: true,
        default_solo_profile_id: true,
        default_relationship_profile_a_id: true,
        default_relationship_profile_b_id: true,
      },
    });
    
    // Start a transaction to handle default profile updates and deletion
    const result = await prisma.$transaction(async (tx) => {
      // If this profile is used as a default, reset those references
      if (user) {
        const updates: any = {};
        
        if (user.default_solo_profile_id === profileId) {
          updates.default_solo_profile_id = null;
        }
        
        if (user.default_relationship_profile_a_id === profileId) {
          updates.default_relationship_profile_a_id = null;
        }
        
        if (user.default_relationship_profile_b_id === profileId) {
          updates.default_relationship_profile_b_id = null;
        }
        
        // Update the user to remove default profile references
        await tx.user.update({
          where: { clerk_user_id: user.clerk_user_id },
          data: updates,
        });
      }
      
      // Soft delete the profile
      return tx.birthProfile.update({
        where: {
          id: profileId,
          deleted_at: null,
        },
        data: {
          deleted_at: new Date(),
        },
      });
    });
    
    // Log the deletion
    logDataAccess(
      AuditEventType.PROFILE_DELETED,
      "BirthProfile",
      profileId.toString(),
      { wasDefault: !!user },
      req
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Birth profile deleted successfully" 
    });
  },
  (context: any) => fetchBirthProfile(context.params.profileId),
  { allowAdmin: true }
);