import { createChatMessage } from "@/lib/openai/assistant";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { thread_id, user_message, chart_context_enabled, active_dashboard_type } = body;

    if (!user_message) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Get chart context if enabled
    let chartContext = "";
    if (chart_context_enabled) {
      // Check if user is subscribed or in trial period
      const user = await prisma.user.findUnique({
        where: { clerk_user_id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const isSubscribed = 
        user.subscription_status === "active" || 
        (user.subscription_status === "trialing" && 
         user.trial_ends_at && 
         new Date(user.trial_ends_at) > new Date());

      if (!isSubscribed) {
        return NextResponse.json(
          { error: "Subscription required for personalized insights", code: "subscription_required" },
          { status: 402 }
        );
      }

      // If user is subscribed or in trial, fetch chart data based on dashboard type
      if (active_dashboard_type === "personal_growth") {
        // Fetch personal growth chart data
        if (user.default_solo_profile_id) {
          const profile = await prisma.birthProfile.findUnique({
            where: { id: user.default_solo_profile_id },
          });

          if (profile) {
            chartContext = `Birth Profile: ${profile.profile_name}
Date of Birth: ${profile.date_of_birth.toISOString().split("T")[0]}
Time of Birth: ${profile.is_time_unknown ? "Unknown" : profile.time_of_birth?.toISOString().split("T")[1]}
Location: ${profile.birth_city_name} (${profile.birth_latitude}, ${profile.birth_longitude})
Timezone: ${profile.birth_timezone}`;
          }
        }
      } else if (active_dashboard_type === "relationships") {
        // Fetch relationship chart data
        if (user.default_relationship_profile_a_id && user.default_relationship_profile_b_id) {
          const [profileA, profileB] = await Promise.all([
            prisma.birthProfile.findUnique({
              where: { id: user.default_relationship_profile_a_id },
            }),
            prisma.birthProfile.findUnique({
              where: { id: user.default_relationship_profile_b_id },
            }),
          ]);

          if (profileA && profileB) {
            chartContext = `Relationship Profiles:
Person A: ${profileA.profile_name} (${profileA.date_of_birth.toISOString().split("T")[0]})
Person B: ${profileB.profile_name} (${profileB.date_of_birth.toISOString().split("T")[0]})`;
          }
        }
      }
    }

    // Find the thread in our database if an ID was provided
    let dbThreadId: string | undefined;
    if (thread_id) {
      const thread = await prisma.chatThread.findFirst({
        where: {
          openai_thread_id: thread_id,
          user_clerk_id: userId,
        },
      });
      dbThreadId = thread?.id;
    }

    // Create the chat message
    const response = await createChatMessage({
      threadId: thread_id,
      userMessage: user_message,
      userClerkId: userId,
      chartContext: chartContext || undefined,
    });

    // Update active_dashboard_context if needed
    if (response.isNewThread && active_dashboard_type) {
      await prisma.chatThread.updateMany({
        where: {
          openai_thread_id: response.threadId,
          user_clerk_id: userId,
        },
        data: {
          active_dashboard_context: active_dashboard_type,
        },
      });
    }

    // Return the response
    return NextResponse.json({
      new_thread_id: response.isNewThread ? response.threadId : undefined,
      assistant_responses: response.assistantResponses,
    });
  } catch (error) {
    console.error("Error in chat message API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}