import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: {
        clerk_user_id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: "User has no Stripe customer ID" },
        { status: 404 }
      );
    }

    // Get the app URL from environment variables
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create a customer portal session with Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    // Return the Stripe customer portal URL
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}