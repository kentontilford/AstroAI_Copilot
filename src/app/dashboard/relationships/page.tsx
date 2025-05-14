'use client';

import Link from "next/link";
import ChatSection from "@/components/dashboard/ChatSection";
import InsightCard from "@/components/dashboard/InsightCard";
import FavorabilityButton from "@/components/dashboard/FavorabilityButton";
import useDashboardData from "@/hooks/useDashboardData";

export default function RelationshipsDashboardPage() {
  const { data, status, error } = useDashboardData('relationships');
  
  const isLoading = status === 'loading';
  const needsProfiles = status === 'no_relationship_profiles';
  const needsSubscription = status === 'subscription_required';

  return (
    <div>
      {/* Dashboard Toggle */}
      <div className="flex mb-8 border-b border-stardust-silver border-opacity-20">
        <Link 
          href="/dashboard/personal"
          className="px-6 py-3 font-medium text-stardust-silver hover:text-starlight-white"
        >
          Personal Growth
        </Link>
        <Link 
          href="/dashboard/relationships"
          className="px-6 py-3 font-medium text-supernova-teal border-b-2 border-supernova-teal"
        >
          Relationships
        </Link>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Row */}
        <div className="card">
          {needsProfiles ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Relationship Insights</h2>
              <p className="text-stardust-silver">Please set up two birth profiles and select them as your relationship pair to see personalized insights.</p>
              <Link href="/settings" className="btn-primary mt-4 inline-block">
                Set Up Profiles
              </Link>
            </>
          ) : needsSubscription ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Subscription Required</h2>
              <p className="text-stardust-silver">Upgrade your subscription to unlock personalized relationship insights.</p>
              <Link href="/subscription" className="btn-primary mt-4 inline-block">
                Upgrade Subscription
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {isLoading ? 'Loading...' : data?.welcomeMessage || 'Relationship Dashboard'}
              </h2>
              <p className="text-stardust-silver">Your personalized relationship insights for today.</p>
              {data?.compositePlacements && (
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
          title={data?.compositeSynergyCard?.title || "Composite Chart Synergy"}
          summary={data?.compositeSynergyCard?.summary_text || "Set up relationship profiles to unlock insights."}
          iconName="synergy"
          fullInterpretation={data?.compositeSynergyCard?.modal_interpretation}
          isLoading={isLoading}
        />
        
        <InsightCard
          title={data?.relationalTransitCard?.title || "Current Relational Transit"}
          summary={data?.relationalTransitCard?.summary_text || "Set up relationship profiles to unlock insights."}
          iconName="transit"
          fullInterpretation={data?.relationalTransitCard?.modal_interpretation}
          isLoading={isLoading}
        />

        {/* Bottom Row */}
        <InsightCard
          title="Composite Placements"
          summary={data?.compositePlacements ? 
            `Composite Sun in ${data.compositePlacements.find(p => p.id === 'sun')?.sign || '...'}, Moon in ${data.compositePlacements.find(p => p.id === 'moon')?.sign || '...'}.` : 
            "Set up relationship profiles to see placements."}
          iconName="planet"
          isLoading={isLoading}
        />
        
        <InsightCard
          title="Composite Houses"
          summary={data?.houses ? 
            `Composite Ascendant in ${data.houses[0]?.sign || '...'}, with ${data.houses[9]?.sign || '...'} on the Midheaven.` : 
            "Set up relationship profiles to see houses."}
          iconName="synergy"
          isLoading={isLoading}
        />
        
        <InsightCard
          title="Transits to Composite"
          summary={data?.transitPlacements ? 
            `Current transits affecting your relationship: ${data.transitPlacements.find(p => p.id === 'moon')?.sign || '...'} Moon.` : 
            "Set up relationship profiles to see transits."}
          iconName="relationship"
          isLoading={isLoading}
        />
      </div>

      {/* Favorability Buttons */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Relationship Favorability</h3>
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
            ["Harmony", "Communication", "Passion", "Shared Growth", "Challenges", "Support"].map((area) => (
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
      <ChatSection dashboardType="relationships" />
    </div>
  );
}