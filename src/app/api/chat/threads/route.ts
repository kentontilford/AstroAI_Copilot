import { getUserChatThreads } from "@/lib/openai/assistant";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's chat threads
    const threads = await getUserChatThreads(userId);

    // Return the threads
    return NextResponse.json(threads);
  } catch (error) {
    console.error("Error in get chat threads API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}