import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ThreadSidebar from './ThreadSidebar';
import { handleApiResponse, handleApiError } from '@/lib/errors/client';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Thread = {
  id: string;
  openai_thread_id: string;
  title: string;
  last_message_at: string;
  active_dashboard_context?: string;
};

export default function ChatInterface({
  chartContextEnabled = false,
  activeDashboardType = 'personal_growth',
  onToggleChartContext,
}: {
  chartContextEnabled?: boolean;
  activeDashboardType?: 'personal_growth' | 'relationships';
  onToggleChartContext?: (enabled: boolean) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch threads on component mount
  useEffect(() => {
    fetchThreads();
  }, []);

  // Fetch chat threads
  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/chat/threads');
      const data = await handleApiResponse<Thread[]>(response);
      setThreads(data);
    } catch (error) {
      handleApiError(error);
      setError('Failed to load chat threads');
    }
  };

  // Create or continue a chat thread
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to the UI immediately
    const tempId = Date.now().toString();
    const userMessage = {
      id: tempId,
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: activeThreadId,
          user_message: message,
          chart_context_enabled: chartContextEnabled,
          active_dashboard_type: activeDashboardType,
        }),
      });
      
      const data = await handleApiResponse<{
        new_thread_id?: string;
        assistant_responses: Array<{ content: string }>;
      }>(response);
      
      // If this is a new thread, set it as active and refresh threads
      if (data.new_thread_id) {
        setActiveThreadId(data.new_thread_id);
        fetchThreads();
      }
      
      // Add assistant responses to the UI
      const assistantMessages = data.assistant_responses.map((resp, index) => ({
        id: `${tempId}-response-${index}`,
        role: 'assistant' as const,
        content: resp.content,
        timestamp: new Date(),
      }));
      
      setMessages((prevMessages) => [...prevMessages, ...assistantMessages]);
    } catch (error) {
      handleApiError(error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new chat thread
  const createNewThread = () => {
    setActiveThreadId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  // Select an existing thread
  const selectThread = async (threadId: string) => {
    // In a full implementation, you would fetch the thread's messages here
    setActiveThreadId(threadId);
    setMessages([]); // Clear messages until we implement message history fetching
    setIsSidebarOpen(false);
  };

  // Rename a thread
  const renameThread = async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });
      
      await handleApiResponse(response);
      
      // Update threads in the UI
      setThreads(
        threads.map((thread) =>
          thread.id === threadId ? { ...thread, title: newTitle } : thread
        )
      );
    } catch (error) {
      handleApiError(error);
      setError('Failed to rename thread');
    }
  };

  // Delete a thread
  const deleteThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}`, {
        method: 'DELETE',
      });
      
      await handleApiResponse(response);
      
      // Update threads in the UI
      setThreads(threads.filter((thread) => thread.id !== threadId));
      
      // If the active thread was deleted, create a new one
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
    } catch (error) {
      handleApiError(error);
      setError('Failed to delete thread');
    }
  };

  // Toggle chart context
  const toggleChartContext = (enabled: boolean) => {
    if (onToggleChartContext) {
      onToggleChartContext(enabled);
    }
  };

  return (
    <div className="flex h-[500px] bg-nebula-veil border border-stardust-silver border-opacity-20 rounded-lg overflow-hidden">
      {/* Thread Sidebar */}
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateNewThread={createNewThread}
        onSelectThread={selectThread}
        onRenameThread={renameThread}
        onDeleteThread={deleteThread}
      />
      
      {/* Main Chat Area */}
      <div className="flex flex-col w-full">
        {/* Chat Header */}
        <div className="p-3 border-b border-stardust-silver border-opacity-20 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-stardust-silver hover:text-starlight-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h2 className="text-lg font-medium">AI Copilot Chat</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stardust-silver">Chart Context</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={chartContextEnabled}
                onChange={(e) => toggleChartContext(e.target.checked)}
              />
              <div className="w-11 h-6 bg-dark-space peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-supernova-teal"></div>
            </label>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4">
          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 border-opacity-40 p-3 rounded-md text-red-300 mb-4">
              {error}
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stardust-silver">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h8"></path>
                <path d="M12 16V8"></path>
              </svg>
              <p className="text-center max-w-md">
                Start a new conversation with your Astrology AI Copilot.
                {chartContextEnabled
                  ? " Your birth chart data will be included for personalized insights."
                  : " Toggle Chart Context for personalized insights based on your birth data."}
              </p>
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
          
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-supernova-teal rounded-full"></div>
                <div className="h-2 w-2 bg-supernova-teal rounded-full"></div>
                <div className="h-2 w-2 bg-supernova-teal rounded-full"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t border-stardust-silver border-opacity-20 p-3">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}