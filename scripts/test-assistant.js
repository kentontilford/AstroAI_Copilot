require('dotenv').config({ path: '.env' });
const { OpenAI } = require("openai");

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAssistant() {
  try {
    // Get information about the assistant to verify it exists
    const assistant = await openai.beta.assistants.retrieve(
      process.env.OPENAI_ASSISTANT_ID
    );
    
    console.log("✅ Successfully connected to assistant:");
    console.log(`- Name: ${assistant.name}`);
    console.log(`- Model: ${assistant.model}`);
    console.log(`- Created: ${new Date(assistant.created_at * 1000).toLocaleString()}`);
    
    // Create a thread
    const thread = await openai.beta.threads.create();
    console.log(`\n✅ Created thread: ${thread.id}`);
    
    // Add a message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: "Explain what a natal chart is in astrology."
    });
    console.log("✅ Added message to thread");
    
    // Run the assistant on the thread
    console.log("\n🔄 Running assistant (this may take a moment)...");
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });
    
    // Poll for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
      console.log(`Current status: ${runStatus.status}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }
    
    // Retrieve messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    console.log("\n✅ Response from assistant:");
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    for (const msg of assistantMessages) {
      for (const content of msg.content) {
        if (content.type === 'text') {
          console.log(content.text.value);
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error testing assistant:", error);
  }
}

testAssistant();