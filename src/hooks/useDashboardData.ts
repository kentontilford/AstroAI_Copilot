'use client';

import { useState, useEffect } from 'react';

export type DashboardType = 'personal_growth' | 'relationships';

export type InsightCard = {
  title: string;
  summary_text: string;
  modal_interpretation: string;
};

export type FavorabilityRating = {
  label: string;
  rating: number;
  explanation: string;
};

export type NatalPlacement = {
  id: string;
  name: string;
  longitude: number;
  sign: string;
  house: number;
};

export type DashboardData = {
  dashboardType: DashboardType;
  welcomeMessage: string;
  natalPlacements?: NatalPlacement[];
  compositePlacements?: NatalPlacement[];
  houses?: any[];
  transitPlacements?: NatalPlacement[];
  birthChartInsightCard?: InsightCard;
  transitOpportunityCard?: InsightCard;
  compositeSynergyCard?: InsightCard;
  relationalTransitCard?: InsightCard;
  favorabilityRatings: FavorabilityRating[];
};

type FetchStatus = 
  | 'idle' 
  | 'loading' 
  | 'success' 
  | 'error' 
  | 'no_profile' 
  | 'no_relationship_profiles' 
  | 'subscription_required';

export default function useDashboardData(type: DashboardType) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch(`/api/dashboard?type=${type}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle specific error codes
          if (errorData.code === 'no_default_profile') {
            setStatus('no_profile');
          } else if (errorData.code === 'no_default_relationship_profiles') {
            setStatus('no_relationship_profiles');
          } else if (errorData.code === 'subscription_required') {
            setStatus('subscription_required');
          } else {
            setStatus('error');
            setError(errorData.error || 'Failed to fetch dashboard data');
          }
          
          return;
        }

        const dashboardData = await response.json();
        setData(dashboardData);
        setStatus('success');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setStatus('error');
        setError('Failed to load dashboard data. Please try again later.');
      }
    };

    fetchDashboardData();
  }, [type]);

  return { data, status, error };
}