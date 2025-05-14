import { deleteChatThread, updateChatThreadTitle } from "@/lib/openai/assistant";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

// Update a chat thread (rename)
export async function PUT(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = params;
    
    // Parse the request body
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Update the thread title
    await updateChatThreadTitle({
      threadId,
      userClerkId: userId,
      title,
    });

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update chat thread API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a chat thread
export async function DELETE(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = params;

    // Delete the thread
    await deleteChatThread({
      threadId,
      userClerkId: userId,
    });

    // Return success with no content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error in delete chat thread API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}