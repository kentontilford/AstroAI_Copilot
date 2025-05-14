import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { 
  calculateNatalChart, 
  calculateTransits, 
  calculateCompositeChart 
} from "@/lib/astrology/ephemeris";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { 
      birth_data, 
      calculation_type, 
      target_date_utc, 
      birth_data_profile_b 
    } = body;

    // Validate required data
    if (!birth_data) {
      return NextResponse.json(
        { error: "Birth data is required" },
        { status: 400 }
      );
    }

    if (!calculation_type || !["natal", "transits", "composite"].includes(calculation_type)) {
      return NextResponse.json(
        { error: "Valid calculation type is required (natal, transits, or composite)" },
        { status: 400 }
      );
    }

    // For composite chart, validate birth_data_profile_b
    if (calculation_type === "composite" && !birth_data_profile_b) {
      return NextResponse.json(
        { error: "Second birth profile data is required for composite chart" },
        { status: 400 }
      );
    }

    // Check if user has an active subscription or is in trial period
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isSubscribed = 
      user.subscription_status === "active" || 
      (user.subscription_status === "trialing" && 
       user.trial_ends_at && 
       new Date(user.trial_ends_at) > new Date());

    if (!isSubscribed) {
      return NextResponse.json(
        { error: "Subscription required for chart calculations", code: "subscription_required" },
        { status: 402 }
      );
    }

    // Perform the requested calculation
    let result;
    switch (calculation_type) {
      case "natal":
        result = await calculateNatalChart(birth_data);
        break;
      
      case "transits":
        // If target_date_utc is provided, parse it; otherwise use current date
        const targetDate = target_date_utc ? new Date(target_date_utc) : new Date();
        result = await calculateTransits(targetDate);
        break;
      
      case "composite":
        result = await calculateCompositeChart(birth_data, birth_data_profile_b);
        break;
    }

    // Return the calculation result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating chart:", error);
    return NextResponse.json(
      { error: "Error calculating chart" },
      { status: 500 }
    );
  }
}