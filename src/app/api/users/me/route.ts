import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users/me - Get current user profile & subscription status
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: {
        clerk_user_id: userId,
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}