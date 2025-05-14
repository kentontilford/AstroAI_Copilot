import { useState } from 'react';
import ChatInterface from '../chat/ChatInterface';

export default function ChatSection({
  dashboardType = 'personal_growth',
}: {
  dashboardType?: 'personal_growth' | 'relationships';
}) {
  const [chartContextEnabled, setChartContextEnabled] = useState(true);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">AI Copilot Chat</h3>
      </div>
      
      <ChatInterface
        chartContextEnabled={chartContextEnabled}
        activeDashboardType={dashboardType}
        onToggleChartContext={setChartContextEnabled}
      />
      
      {!chartContextEnabled && (
        <div className="mt-2 text-sm text-stardust-silver">
          <strong>Tip:</strong> Enable Chart Context for personalized insights based on your birth data.
        </div>
      )}
    </div>
  );
}