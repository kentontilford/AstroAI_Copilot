import OpenAI from 'openai';
import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env/server';
import { openaiCache } from '@/lib/cache';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

/**
 * Creates a chat message and gets a response from the OpenAI Assistant
 */
export async function createChatMessage({
  threadId,
  userMessage,
  userClerkId,
  chartContext,
}: {
  threadId?: string;
  userMessage: string;
  userClerkId: string;
  chartContext?: string;
}) {
  try {
    // Create a new thread if not provided
    let openaiThreadId = threadId;
    let isNewThread = false;
    
    if (!openaiThreadId) {
      isNewThread = true;
      const thread = await openai.beta.threads.create();
      openaiThreadId = thread.id;
      
      // Save the thread in the database
      await prisma.chatThread.create({
        data: {
          openai_thread_id: thread.id,
          user_clerk_id: userClerkId,
          title: `New Chat ${new Date().toLocaleDateString()}`,
          last_message_at: new Date(),
        },
      });
    }
    
    // Prepare the message content
    let messageContent = userMessage;
    if (chartContext) {
      messageContent = `CONTEXT_START\n${chartContext}\nCONTEXT_END\n\n${userMessage}`;
    }
    
    // Add message to the thread
    await openai.beta.threads.messages.create(openaiThreadId, {
      role: 'user',
      content: messageContent,
    });
    
    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(openaiThreadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID!,
    });
    
    // Poll for the run to complete (with timeout)
    const maxPollTime = 30000; // 30 seconds max
    const startTime = Date.now();
    let runStatus = await openai.beta.threads.runs.retrieve(openaiThreadId, run.id);
    
    while (!['completed', 'failed', 'cancelled', 'expired'].includes(runStatus.status)) {
      // Check if we've exceeded the maximum poll time
      if (Date.now() - startTime > maxPollTime) {
        return {
          threadId: openaiThreadId,
          isNewThread,
          assistantResponses: [
            { type: 'text', content: "I'm still thinking about this question. Please check back in a moment." }
          ],
        };
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(openaiThreadId, run.id);
    }
    
    // Check if the run completed successfully
    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }
    
    // Retrieve messages, filtering for just the assistant's responses after our user message
    const messages = await openai.beta.threads.messages.list(openaiThreadId, {
      order: 'asc',
    });
    
    // Find the index of our latest user message
    const userMessageIndex = messages.data.findIndex(
      msg => msg.role === 'user' && msg.content[0].type === 'text' && 
      (chartContext 
        ? msg.content[0].text.value.includes(messageContent) 
        : msg.content[0].text.value === messageContent)
    );
    
    // Get all assistant messages that came after our user message
    const assistantResponses = messages.data
      .slice(userMessageIndex + 1)
      .filter(msg => msg.role === 'assistant')
      .flatMap(msg => 
        msg.content
          .filter(content => content.type === 'text')
          .map(content => ({
            type: 'text',
            content: content.text.value,
          }))
      );
    
    // Update the last_message_at timestamp for the thread
    await prisma.chatThread.updateMany({
      where: {
        openai_thread_id: openaiThreadId,
        user_clerk_id: userClerkId,
      },
      data: {
        last_message_at: new Date(),
      },
    });
    
    return {
      threadId: openaiThreadId,
      isNewThread,
      assistantResponses,
    };
  } catch (error) {
    console.error('Error in createChatMessage:', error);
    throw error;
  }
}

/**
 * Retrieves all chat threads for a user
 */
export async function getUserChatThreads(userClerkId: string) {
  try {
    const threads = await prisma.chatThread.findMany({
      where: {
        user_clerk_id: userClerkId,
      },
      orderBy: {
        last_message_at: 'desc',
      },
    });
    
    return threads;
  } catch (error) {
    console.error('Error in getUserChatThreads:', error);
    throw error;
  }
}

/**
 * Updates the title of a chat thread
 */
export async function updateChatThreadTitle({
  threadId,
  userClerkId,
  title,
}: {
  threadId: string;
  userClerkId: string;
  title: string;
}) {
  try {
    const updatedThread = await prisma.chatThread.updateMany({
      where: {
        id: threadId,
        user_clerk_id: userClerkId,
      },
      data: {
        title,
      },
    });
    
    return updatedThread;
  } catch (error) {
    console.error('Error in updateChatThreadTitle:', error);
    throw error;
  }
}

/**
 * Deletes a chat thread
 */
export async function deleteChatThread({
  threadId,
  userClerkId,
}: {
  threadId: string;
  userClerkId: string;
}) {
  try {
    // Find the thread first to get the OpenAI thread ID
    const thread = await prisma.chatThread.findFirst({
      where: {
        id: threadId,
        user_clerk_id: userClerkId,
      },
    });
    
    if (!thread) {
      throw new Error('Thread not found');
    }
    
    // Delete the thread from our database
    await prisma.chatThread.delete({
      where: {
        id: threadId,
      },
    });
    
    // Attempt to delete from OpenAI as well (this might fail if it's already deleted)
    try {
      await openai.beta.threads.del(thread.openai_thread_id);
    } catch (error) {
      console.warn('Could not delete OpenAI thread, it may already be deleted:', error);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteChatThread:', error);
    throw error;
  }
}

/**
 * Generates dashboard insights based on astrological data
 */
export async function generateDashboardInsight({
  insightType,
  chartData,
  transitsData,
  compositeData,
}: {
  insightType: 'birth_chart' | 'transit_opportunity' | 'composite_synergy' | 'relational_transit';
  chartData: any;
  transitsData?: any;
  compositeData?: any;
}) {
  try {
    // For transit insights, we need to include the current date in the cache key
    // to ensure we get fresh insights when transits change
    const currentDate = new Date();
    const dateString = insightType.includes('transit') 
      ? currentDate.toISOString().split('T')[0]  // Just the date part for transits
      : '';
    
    // Create a cache key based on chart data and insight type
    // We hash the chart data by using specific identifiable parts rather than the full JSON
    let chartHash = '';
    if (chartData?.points?.length > 0) {
      // Use sun, moon, and ascendant positions as a unique signature
      const sun = chartData.points.find((p: any) => p.name === 'SUN')?.full_degree || 0;
      const moon = chartData.points.find((p: any) => p.name === 'MOON')?.full_degree || 0;
      const asc = chartData.ascendant?.full_degree || 0;
      chartHash = `${sun.toFixed(2)}-${moon.toFixed(2)}-${asc.toFixed(2)}`;
    }
    
    let transitHash = '';
    if (transitsData?.points?.length > 0) {
      // Use just the date for transits, since we already include that in the cache key
      transitHash = dateString;
    }
    
    let compositeHash = '';
    if (compositeData?.points?.length > 0) {
      // Similar approach for composite chart
      const sun = compositeData.points.find((p: any) => p.name === 'SUN')?.full_degree || 0;
      const moon = compositeData.points.find((p: any) => p.name === 'MOON')?.full_degree || 0;
      const asc = compositeData.ascendant?.full_degree || 0;
      compositeHash = `${sun.toFixed(2)}-${moon.toFixed(2)}-${asc.toFixed(2)}`;
    }
    
    const cacheKey = `insight:${insightType}:${chartHash}:${transitHash}:${compositeHash}:${dateString}`;
    
    // Set TTL based on insight type
    // Birth chart and composite synergy insights can be cached longer
    // Transit insights need to be refreshed more frequently
    const ttl = insightType.includes('transit') ? 43200 : 604800; // 12 hours or 1 week
    
    return openaiCache.getOrCompute(
      cacheKey,
      async () => {
        // Create a one-time thread for this insight
        const thread = await openai.beta.threads.create();
        
        // Prepare the prompt based on insight type
        let prompt = '';
        let context = '';
        
        // Format chart data as context
        if (chartData) {
          context += `Natal Chart: ${JSON.stringify(chartData)}\n`;
        }
        if (transitsData) {
          context += `Current Transits: ${JSON.stringify(transitsData)}\n`;
        }
        if (compositeData) {
          context += `Composite Chart: ${JSON.stringify(compositeData)}\n`;
        }
        
        // Create specific prompts for each insight type
        switch (insightType) {
          case 'birth_chart':
            prompt = `Analyze this natal chart data and identify the single most defining astrological feature or pattern. Provide a 25-word summary for a dashboard card, and a 150-word detailed interpretation for a modal. Format your response as JSON with keys "title", "summary_text", and "modal_interpretation".`;
            break;
            
          case 'transit_opportunity':
            prompt = `Given this natal chart and current transits, identify one significant positive transit opportunity happening now or very soon. Provide a 25-word summary for a dashboard card and a 150-word interpretation for a modal, explaining its potential. Format your response as JSON with keys "title", "summary_text", and "modal_interpretation".`;
            break;
            
          case 'composite_synergy':
            prompt = `Analyze this composite chart data and identify its core synergistic theme or pattern. Provide a 25-word summary for a dashboard card and a 150-word interpretation for a modal. Format your response as JSON with keys "title", "summary_text", and "modal_interpretation".`;
            break;
            
          case 'relational_transit':
            prompt = `Given this composite chart and current transits, identify one significant transit currently impacting the relationship. Provide a 25-word summary for a dashboard card and a 150-word interpretation for a modal. Format your response as JSON with keys "title", "summary_text", and "modal_interpretation".`;
            break;
        }
        
        // Add message to the thread
        await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: `CONTEXT_START\n${context}\nCONTEXT_END\n\n${prompt}`,
        });
        
        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: env.OPENAI_ASSISTANT_ID,
        });
        
        // Poll for the run to complete
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (!['completed', 'failed', 'cancelled', 'expired'].includes(runStatus.status)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }
        
        // Check if the run completed successfully
        if (runStatus.status !== 'completed') {
          throw new Error(`Run failed with status: ${runStatus.status}`);
        }
        
        // Retrieve the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id, {
          order: 'desc',
          limit: 1,
        });
        
        // Get the text content from the message
        const response = messages.data[0].content
          .filter(content => content.type === 'text')
          .map(content => content.text.value)
          .join('\n');
        
        // Try to parse the response as JSON
        try {
          return JSON.parse(response);
        } catch (error) {
          // If we can't parse as JSON, return as plain text (fallback)
          return {
            title: `${insightType.split('_').join(' ')} Insight`,
            summary_text: response.slice(0, 50) + '...',
            modal_interpretation: response,
          };
        }
      },
      { ttl }
    );
  } catch (error) {
    console.error(`Error generating ${insightType} insight:`, error);
    // Return fallback content if there's an error
    return {
      title: `${insightType.split('_').join(' ')} Insight`,
      summary_text: "We're preparing your astrological insights...",
      modal_interpretation: "We're calculating your unique astrological patterns. Check back soon for personalized insights based on your chart data.",
    };
  }
}

/**
 * Generates a favorability rating and explanation for a specific area
 */
export async function generateFavorabilityRating({
  area,
  chartData,
  transitsData,
  compositeData,
}: {
  area: 'love' | 'career' | 'finance' | 'health' | 'personal_growth' | 'creativity' | 
         'harmony' | 'communication' | 'passion' | 'shared_growth' | 'challenges' | 'support';
  chartData: any;
  transitsData: any;
  compositeData?: any;
}) {
  try {
    // For transit-dependent favorability, we need to include the current date in the cache key
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0];  // Just the date part
    
    // Create chart hash like we did for insights
    let chartHash = '';
    if (chartData?.points?.length > 0) {
      // Use sun, moon, and ascendant positions as a unique signature
      const sun = chartData.points.find((p: any) => p.name === 'SUN')?.full_degree || 0;
      const moon = chartData.points.find((p: any) => p.name === 'MOON')?.full_degree || 0;
      const asc = chartData.ascendant?.full_degree || 0;
      chartHash = `${sun.toFixed(2)}-${moon.toFixed(2)}-${asc.toFixed(2)}`;
    }
    
    let compositeHash = '';
    if (compositeData?.points?.length > 0) {
      // Similar approach for composite chart
      const sun = compositeData.points.find((p: any) => p.name === 'SUN')?.full_degree || 0;
      const moon = compositeData.points.find((p: any) => p.name === 'MOON')?.full_degree || 0;
      const asc = compositeData.ascendant?.full_degree || 0;
      compositeHash = `${sun.toFixed(2)}-${moon.toFixed(2)}-${asc.toFixed(2)}`;
    }
    
    // Create a cache key based on area, chart data and current date
    const cacheKey = `favorability:${area}:${chartHash}:${compositeHash}:${dateString}`;
    
    // Cache favorability ratings for 12 hours (43200 seconds)
    return openaiCache.getOrCompute(
      cacheKey,
      async () => {
        // Create a one-time thread for this rating
        const thread = await openai.beta.threads.create();
        
        // Prepare the context
        let context = '';
        if (chartData) {
          context += `Natal Chart: ${JSON.stringify(chartData)}\n`;
        }
        if (transitsData) {
          context += `Current Transits: ${JSON.stringify(transitsData)}\n`;
        }
        if (compositeData) {
          context += `Composite Chart: ${JSON.stringify(compositeData)}\n`;
        }
        
        // Create the prompt
        const prompt = `Based on the provided astrological data, generate a favorability rating (1-5) for the area of "${area}". Consider current transits to relevant planets for this area. Provide the numeric rating and a 100-word explanation justifying it. Format your response as JSON with keys "rating" (number 1-5) and "explanation" (string).`;
        
        // Add message to the thread
        await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: `CONTEXT_START\n${context}\nCONTEXT_END\n\n${prompt}`,
        });
        
        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: env.OPENAI_ASSISTANT_ID,
        });
        
        // Poll for the run to complete
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (!['completed', 'failed', 'cancelled', 'expired'].includes(runStatus.status)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }
        
        // Check if the run completed successfully
        if (runStatus.status !== 'completed') {
          throw new Error(`Run failed with status: ${runStatus.status}`);
        }
        
        // Retrieve the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id, {
          order: 'desc',
          limit: 1,
        });
        
        // Get the text content from the message
        const response = messages.data[0].content
          .filter(content => content.type === 'text')
          .map(content => content.text.value)
          .join('\n');
        
        // Try to parse the response as JSON
        try {
          return JSON.parse(response);
        } catch (error) {
          // If we can't parse as JSON, return as plain text with default rating (fallback)
          return {
            rating: 3,
            explanation: response,
          };
        }
      },
      { ttl: 43200 } // Cache for 12 hours
    );
  } catch (error) {
    console.error(`Error generating ${area} favorability rating:`, error);
    // Return fallback content if there's an error
    return {
      rating: 3,
      explanation: `We're still calculating your favorability rating for ${area}. Check back soon for personalized insights based on your chart data.`,
    };
  }
}
}