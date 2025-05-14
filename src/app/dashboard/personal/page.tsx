'use client';

import Link from "next/link";
import ChatSection from "@/components/dashboard/ChatSection";
import InsightCard from "@/components/dashboard/InsightCard";
import FavorabilityButton from "@/components/dashboard/FavorabilityButton";
import useDashboardData from "@/hooks/useDashboardData";

export default function PersonalDashboardPage() {
  const { data, status, error } = useDashboardData('personal_growth');
  
  const isLoading = status === 'loading';
  const needsProfile = status === 'no_profile';
  const needsSubscription = status === 'subscription_required';

  return (
    <div>
      {/* Dashboard Toggle */}
      <div className="flex mb-8 border-b border-stardust-silver border-opacity-20">
        <Link 
          href="/dashboard/personal"
          className="px-6 py-3 font-medium text-supernova-teal border-b-2 border-supernova-teal"
        >
          Personal Growth
        </Link>
        <Link 
          href="/dashboard/relationships"
          className="px-6 py-3 font-medium text-stardust-silver hover:text-starlight-white"
        >
          Relationships
        </Link>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Row */}
        <div className="card">
          {needsProfile ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Welcome</h2>
              <p className="text-stardust-silver">Please set up your birth profile to see personalized insights.</p>
              <Link href="/settings" className="btn-primary mt-4 inline-block">
                Add Birth Profile
              </Link>
            </>
          ) : needsSubscription ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Subscription Required</h2>
              <p className="text-stardust-silver">Upgrade your subscription to unlock personalized astrological insights.</p>
              <Link href="/subscription" className="btn-primary mt-4 inline-block">
                Upgrade Subscription
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {isLoading ? 'Loading...' : data?.welcomeMessage || 'Personal Dashboard'}
              </h2>
              <p className="text-stardust-silver">Your personalized astrological insights for today.</p>
              {data?.natalPlacements && (
                <p className="text-sm text-supernova-teal mt-2">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </>
          )}
        </div>
        
        <InsightCard
          title={data?.birthChartInsightCard?.title || "Birth Chart Insight"}
          summary={data?.birthChartInsightCard?.summary_text || "Set up your birth profile to unlock insights."}
          iconName="star"
          fullInterpretation={data?.birthChartInsightCard?.modal_interpretation}
          isLoading={isLoading}
        />
        
        <InsightCard
          title={data?.transitOpportunityCard?.title || "Transit Opportunity"}
          summary={data?.transitOpportunityCard?.summary_text || "Set up your birth profile to unlock insights."}
          iconName="transit"
          fullInterpretation={data?.transitOpportunityCard?.modal_interpretation}
          isLoading={isLoading}
        />

        {/* Bottom Row */}
        <InsightCard
          title="Natal Planet Placements"
          summary={data?.natalPlacements ? 
            `Sun in ${data.natalPlacements.find(p => p.id === 'sun')?.sign || '...'}, Moon in ${data.natalPlacements.find(p => p.id === 'moon')?.sign || '...'}, and more.` : 
            "Set up your birth profile to see placements."}
          iconName="planet"
          isLoading={isLoading}
        />
        
        <InsightCard
          title="Whole Sign Houses"
          summary={data?.houses ? 
            `Ascendant in ${data.houses[0]?.sign || '...'}, with ${data.houses[9]?.sign || '...'} on the Midheaven.` : 
            "Set up your birth profile to see houses."}
          iconName="synergy"
          isLoading={isLoading}
        />
        
        <InsightCard
          title="Transit Planet Placements"
          summary={data?.transitPlacements ? 
            `Current transits including ${data.transitPlacements.find(p => p.id === 'moon')?.sign || '...'} Moon.` : 
            "Set up your birth profile to see transits."}
          iconName="transit"
          isLoading={isLoading}
        />
      </div>

      {/* Favorability Buttons */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Favorability Ratings</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {isLoading ? (
            // Loading state for favorability buttons
            Array(6).fill(0).map((_, index) => (
              <FavorabilityButton
                key={index}
                label="Loading..."
                rating={0}
                isLoading={true}
              />
            ))
          ) : data?.favorabilityRatings ? (
            // Actual favorability ratings
            data.favorabilityRatings.map((rating) => (
              <FavorabilityButton
                key={rating.label}
                label={rating.label}
                rating={rating.rating}
                explanation={rating.explanation}
              />
            ))
          ) : (
            // Placeholder buttons
            ["Love", "Pro Success", "Finance", "Health", "Personal Growth", "Creativity"].map((area) => (
              <button 
                key={area}
                className="btn-secondary opacity-50 cursor-not-allowed"
                disabled
              >
                {area}
              </button>
            ))
          )}
        </div>
      </div>

      {/* AI Chat Section */}
      <ChatSection dashboardType="personal_growth" />
    </div>
  );
}