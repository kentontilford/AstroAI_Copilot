'use client';

import { useState } from 'react';

interface ChatSectionProps {
  dashboardType: 'personal_growth' | 'relationships';
}

export default function ChatSection({ dashboardType }: ChatSectionProps) {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { 
      role: 'assistant', 
      content: dashboardType === 'personal_growth' 
        ? 'Ask me anything about your birth chart, current transits, or personal growth opportunities.' 
        : 'Ask me anything about your relationship dynamics, compatibility, or current transits affecting your relationship.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    // Add user message to conversation
    const userMessage = message;
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);
    
    // In a real implementation, you would send this to an API endpoint
    // For now, we'll just simulate a response
    setTimeout(() => {
      const mockResponse = dashboardType === 'personal_growth'
        ? "I'm analyzing your birth chart and current transits. Based on your Sun in Leo and the current Neptune transit, this is a great time for creative expression and spiritual growth. Would you like more specific insights about a particular area of your life?"
        : "Looking at your relationship composite chart, I notice a strong Venus-Jupiter aspect which indicates natural harmony and generosity between you two. The current transits are supportive for deepening your emotional connection. Is there a specific aspect of your relationship you'd like to explore?";
      
      setConversation(prev => [...prev, { role: 'assistant', content: mockResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="mt-10 p-4 bg-cosmic-black rounded-lg border border-stardust-silver border-opacity-20">
      <h3 className="text-lg font-medium mb-4">
        {dashboardType === 'personal_growth' ? 'Personal Astrology Assistant' : 'Relationship Astrology Assistant'}
      </h3>
      
      {/* Chat Messages */}
      <div className="space-y-4 mb-4 max-h-72 overflow-y-auto">
        {conversation.map((msg, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-lg ${
              msg.role === 'assistant' 
                ? 'bg-cosmic-black border border-supernova-teal border-opacity-30' 
                : 'bg-cosmic-ink'
            }`}
          >
            {msg.content}
          </div>
        ))}
        
        {isLoading && (
          <div className="p-3 rounded-lg bg-cosmic-black border border-supernova-teal border-opacity-30 animate-pulse">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-supernova-teal rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-supernova-teal rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-supernova-teal rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={dashboardType === 'personal_growth' 
            ? "Ask about your chart, transits, or growth opportunities..." 
            : "Ask about your relationship dynamics or compatibility..."}
          className="w-full p-3 bg-cosmic-ink rounded-lg focus:ring-1 focus:ring-supernova-teal focus:outline-none"
        />
        <button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          className={`px-4 py-3 rounded-lg bg-supernova-teal text-starlight-white font-medium ${
            isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
}