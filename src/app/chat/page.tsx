import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

export default async function ChatPage() {
  const { userId } = auth();
  
  // If not authenticated, redirect to login
  if (!userId) {
    redirect('/login');
  }
  
  return (
    <div className="min-h-screen bg-dark-space py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">AI Copilot Chat</h1>
        
        <div className="bg-nebula-veil rounded-lg shadow-lg overflow-hidden h-[600px]">
          <ChatInterface
            chartContextEnabled={true}
            activeDashboardType="personal_growth"
          />
        </div>
        
        <div className="mt-4 text-stardust-silver text-sm">
          <p>
            Your AI Copilot is trained on astrological concepts and can provide insights based on your birth chart data.
            Toggle the "Chart Context" switch to enable or disable personalized insights.
          </p>
        </div>
      </div>
    </div>
  );
}