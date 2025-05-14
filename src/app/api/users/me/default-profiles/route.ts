import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/users/me/default-profiles - Set default profiles
export async function PUT(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const {
      default_solo_profile_id,
      default_relationship_profile_a_id,
      default_relationship_profile_b_id,
    } = body;

    // Check if the profiles exist and belong to the user
    const profileIds = [
      default_solo_profile_id,
      default_relationship_profile_a_id,
      default_relationship_profile_b_id,
    ].filter(Boolean); // Filter out null or undefined values

    if (profileIds.length > 0) {
      const profiles = await prisma.birthProfile.findMany({
        where: {
          id: {
            in: profileIds,
          },
        },
      });

      // Check if all profiles belong to the user
      const foundIds = profiles.map((profile) => profile.id);
      const validIds = profiles
        .filter((profile) => profile.user_clerk_id === userId)
        .map((profile) => profile.id);

      const invalidIds = profileIds.filter(
        (id) => foundIds.includes(id) && !validIds.includes(id)
      );

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: "One or more profiles do not belong to the user" },
          { status: 403 }
        );
      }
    }

    // Check if both relationship profiles are different
    if (
      default_relationship_profile_a_id &&
      default_relationship_profile_b_id &&
      default_relationship_profile_a_id === default_relationship_profile_b_id
    ) {
      return NextResponse.json(
        { error: "Relationship profiles must be different" },
        { status: 400 }
      );
    }

    // Update the user's default profiles
    const updatedUser = await prisma.user.update({
      where: {
        clerk_user_id: userId,
      },
      data: {
        default_solo_profile_id: default_solo_profile_id || null,
        default_relationship_profile_a_id: default_relationship_profile_a_id || null,
        default_relationship_profile_b_id: default_relationship_profile_b_id || null,
      },
      select: {
        clerk_user_id: true,
        email: true,
        subscription_status: true,
        trial_ends_at: true,
        current_subscription_period_end: true,
        default_solo_profile_id: true,
        default_relationship_profile_a_id: true,
        default_relationship_profile_b_id: true,
      },
    });

    // Return the updated user
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error setting default profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}