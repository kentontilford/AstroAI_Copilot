import { auth, currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/birth-profiles - Create a new birth profile
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const {
      profile_name,
      date_of_birth,
      time_of_birth,
      is_time_unknown,
      birth_latitude,
      birth_longitude,
      birth_city_name,
      birth_timezone,
    } = body;

    // Validate the required fields
    if (
      !profile_name ||
      !date_of_birth ||
      birth_latitude === undefined ||
      birth_longitude === undefined ||
      !birth_city_name ||
      !birth_timezone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the birth profile
    const newProfile = await prisma.birthProfile.create({
      data: {
        user_clerk_id: userId,
        profile_name,
        date_of_birth: new Date(date_of_birth),
        time_of_birth: time_of_birth ? new Date(`1970-01-01T${time_of_birth}Z`) : null,
        is_time_unknown: is_time_unknown ?? false,
        birth_latitude,
        birth_longitude,
        birth_city_name,
        birth_timezone,
      },
    });

    // Check if this is the user's first profile
    const profileCount = await prisma.birthProfile.count({
      where: {
        user_clerk_id: userId,
      },
    });

    // If it's the first profile, set it as the default
    if (profileCount === 1) {
      await prisma.user.update({
        where: {
          clerk_user_id: userId,
        },
        data: {
          default_solo_profile_id: newProfile.id,
        },
      });
    }

    // Return the new profile
    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating birth profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/birth-profiles - Get all birth profiles for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all birth profiles for the user
    const profiles = await prisma.birthProfile.findMany({
      where: {
        user_clerk_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Return the profiles
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching birth profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}