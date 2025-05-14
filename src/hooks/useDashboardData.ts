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
  name?: string;
  longitude?: number;
  sign: string;
  house?: number;
  degree?: number;
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

// Mock data for personal growth dashboard
const MOCK_PERSONAL_DATA: DashboardData = {
  dashboardType: 'personal_growth',
  welcomeMessage: "Welcome, Stargazer",
  natalPlacements: [
    { id: 'sun', sign: 'Leo', degree: 15, house: 10 },
    { id: 'moon', sign: 'Cancer', degree: 22, house: 9 },
    { id: 'mercury', sign: 'Leo', degree: 5, house: 10 },
    { id: 'venus', sign: 'Virgo', degree: 2, house: 11 },
    { id: 'mars', sign: 'Gemini', degree: 27, house: 8 },
  ],
  transitPlacements: [
    { id: 'sun', sign: 'Taurus', degree: 20, house: 7 },
    { id: 'moon', sign: 'Libra', degree: 12, house: 12 },
    { id: 'mercury', sign: 'Aries', degree: 29, house: 6 },
    { id: 'venus', sign: 'Gemini', degree: 5, house: 8 },
    { id: 'mars', sign: 'Cancer', degree: 10, house: 9 },
  ],
  houses: [
    { number: 1, sign: 'Scorpio', degree: 5 },
    { number: 2, sign: 'Sagittarius', degree: 2 },
    { number: 3, sign: 'Capricorn', degree: 1 },
    { number: 4, sign: 'Aquarius', degree: 3 },
    { number: 5, sign: 'Pisces', degree: 5 },
    { number: 6, sign: 'Aries', degree: 8 },
    { number: 7, sign: 'Taurus', degree: 5 },
    { number: 8, sign: 'Gemini', degree: 2 },
    { number: 9, sign: 'Cancer', degree: 1 },
    { number: 10, sign: 'Leo', degree: 3 },
    { number: 11, sign: 'Virgo', degree: 5 },
    { number: 12, sign: 'Libra', degree: 8 },
  ],
  birthChartInsightCard: {
    title: "Sun in Leo in 10th House",
    summary_text: "Your Leo Sun in the 10th house indicates leadership potential and a natural ability to shine in your career.",
    modal_interpretation: "With your Sun in Leo in the 10th house, you have a natural flair for leadership and self-expression in your professional life. You're likely to seek recognition and may be drawn to careers that put you in the spotlight or in positions of authority.\n\nStrengths:\n- Natural leadership abilities\n- Charismatic presence that draws others to you\n- Strong drive for achievement and recognition\n- Creative approach to career matters\n\nChallenges:\n- May struggle with pride or ego in professional settings\n- Could be overly concerned with status and recognition\n- Might find it difficult to work behind the scenes\n\nThis placement suggests you're here to develop your authentic self-expression through your career and public role. Your life path involves learning to balance your need for recognition with genuine service to others.",
  },
  transitOpportunityCard: {
    title: "Jupiter Trine Natal Sun",
    summary_text: "Jupiter is forming a favorable trine to your natal Sun, bringing opportunities for growth and success.",
    modal_interpretation: "Jupiter is currently forming a trine (120° aspect) to your natal Sun, creating a period of expansion, optimism, and opportunity that will last about two weeks.\n\nDuring this transit:\n- Your confidence and optimism are heightened\n- Opportunities for growth and advancement are more likely to appear\n- Your vitality and health should be stronger than usual\n- Social connections can bring beneficial opportunities\n- It's an excellent time to start new projects or expand existing ones\n\nThis is one of the most favorable transits for taking risks, expanding your horizons, and pursuing goals that seem ambitious. The universe is supporting your growth now, so use this energy proactively!\n\nBest areas to focus on during this transit:\n- Career advancement\n- Educational pursuits\n- Travel or exploration\n- Spiritual development\n- Publishing or sharing your ideas",
  },
  favorabilityRatings: [
    { 
      label: "Love", 
      rating: 7,
      explanation: "Venus in Gemini is bringing playful, flirtatious energy to your romantic life. Communication with partners will be easier than usual."
    },
    { 
      label: "Pro Success", 
      rating: 9,
      explanation: "Jupiter trine your natal Sun and Mars sextile your Midheaven create excellent conditions for career advancement and professional recognition."
    },
    { 
      label: "Finance", 
      rating: 6,
      explanation: "Stable financial energy with a slight positive trend. Good for planning but not ideal for major investments."
    },
    { 
      label: "Health", 
      rating: 8,
      explanation: "Strong vitality with the Sun well-aspected. Good time for starting new health routines or physical activities."
    },
    { 
      label: "Personal Growth", 
      rating: 9,
      explanation: "Exceptional period for personal development with several supportive transits to your natal Jupiter and Mercury."
    },
    { 
      label: "Creativity", 
      rating: 7,
      explanation: "Above average creative flow, especially for writing, speaking, and intellectual pursuits with Mercury well-positioned."
    }
  ]
};

// Mock data for relationships dashboard
const MOCK_RELATIONSHIP_DATA: DashboardData = {
  dashboardType: 'relationships',
  welcomeMessage: "Relationship Insights",
  compositePlacements: [
    { id: 'sun', sign: 'Libra', degree: 10, house: 5 },
    { id: 'moon', sign: 'Taurus', degree: 18, house: 12 },
    { id: 'mercury', sign: 'Scorpio', degree: 3, house: 6 },
    { id: 'venus', sign: 'Libra', degree: 25, house: 5 },
    { id: 'mars', sign: 'Capricorn', degree: 8, house: 8 },
  ],
  transitPlacements: [
    { id: 'sun', sign: 'Taurus', degree: 20, house: 12 },
    { id: 'moon', sign: 'Libra', degree: 12, house: 5 },
    { id: 'mercury', sign: 'Aries', degree: 29, house: 11 },
    { id: 'venus', sign: 'Gemini', degree: 5, house: 1 },
    { id: 'mars', sign: 'Cancer', degree: 10, house: 2 },
  ],
  houses: [
    { number: 1, sign: 'Gemini', degree: 15 },
    { number: 2, sign: 'Cancer', degree: 10 },
    { number: 3, sign: 'Leo', degree: 8 },
    { number: 4, sign: 'Virgo', degree: 5 },
    { number: 5, sign: 'Libra', degree: 5 },
    { number: 6, sign: 'Scorpio', degree: 8 },
    { number: 7, sign: 'Sagittarius', degree: 15 },
    { number: 8, sign: 'Capricorn', degree: 10 },
    { number: 9, sign: 'Aquarius', degree: 8 },
    { number: 10, sign: 'Pisces', degree: 5 },
    { number: 11, sign: 'Aries', degree: 5 },
    { number: 12, sign: 'Taurus', degree: 8 },
  ],
  compositeSynergyCard: {
    title: "Venus Conjunct Sun in Libra",
    summary_text: "Your composite Venus conjunct Sun in Libra indicates a relationship built on harmony, balance, and mutual appreciation.",
    modal_interpretation: "Your composite chart features Venus conjunct the Sun in Libra, which is one of the most harmonious placements for relationship compatibility. This indicates that at the core of your relationship is a mutual appreciation for beauty, harmony, and balance.\n\nStrengths of this placement:\n- Strong natural affinity and attraction between you\n- Shared aesthetic values and appreciation for beauty\n- Mutual respect and diplomacy in handling conflicts\n- Ability to see each other's perspective\n- Foundation of friendship within your romantic connection\n\nChallenges to be aware of:\n- Potential avoidance of necessary conflicts to maintain peace\n- May sometimes prioritize harmony over authenticity\n- Could lead to indecision as a couple when facing important choices\n\nThis placement suggests your relationship serves as a balancing force in both your lives. You're likely to bring out each other's more refined, diplomatic qualities and help each other develop greater appreciation for relationships and partnerships in general.",
  },
  relationalTransitCard: {
    title: "Transiting Saturn square Composite Venus",
    summary_text: "Saturn is challenging your composite Venus, bringing a period of relationship testing that can ultimately strengthen your bond.",
    modal_interpretation: "Transiting Saturn is currently forming a square (90° aspect) to your composite Venus, creating a period of testing and potential growth in your relationship. This transit typically lasts about 2-3 months and asks you to examine the foundations of your connection.\n\nDuring this transit:\n- The relationship may feel more serious or constrained than usual\n- Practical matters and responsibilities may overshadow romance\n- Issues around commitment, values, or finances might surface\n- There could be a feeling of emotional distance or cooling\n\nThis transit serves an important purpose: to strengthen and mature your relationship. By working through challenges now, you establish a more solid foundation for the future.\n\nHow to work with this energy:\n- Have honest conversations about expectations and commitments\n- Address any practical issues in the relationship, particularly around shared resources\n- Be patient with each other during this more serious period\n- Focus on building lasting structures in your relationship\n- Demonstrate your commitment through actions, not just words\n\nRemember that Saturn transits ultimately strengthen what's meant to last, by revealing what needs work.",
  },
  favorabilityRatings: [
    { 
      label: "Harmony", 
      rating: 6,
      explanation: "Saturn transits are creating some tension, but the strong Libra placements in your composite chart help maintain underlying harmony."
    },
    { 
      label: "Communication", 
      rating: 8,
      explanation: "Mercury in your composite chart is well-aspected, supporting clear and productive conversations even during challenging periods."
    },
    { 
      label: "Passion", 
      rating: 5,
      explanation: "Current Saturn influences may temporarily dampen romantic passion, though your composite Mars in Capricorn provides enduring physical attraction."
    },
    { 
      label: "Shared Growth", 
      rating: 9,
      explanation: "Excellent conditions for mutual growth and learning. Current challenges are creating opportunities for deeper understanding."
    },
    { 
      label: "Challenges", 
      rating: 4,
      explanation: "Some significant tests are present with Saturn square Venus, requiring patience and commitment to work through together."
    },
    { 
      label: "Support", 
      rating: 7,
      explanation: "Above average mutual support. Your composite Moon in Taurus creates emotional stability even during externally challenging times."
    }
  ]
};

export default function useDashboardData(type: DashboardType) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For development/testing, use mock data instead of real API
    const useMockData = true;

    if (useMockData) {
      // Simulate API delay
      const timer = setTimeout(() => {
        if (type === 'personal_growth') {
          setData(MOCK_PERSONAL_DATA);
        } else {
          setData(MOCK_RELATIONSHIP_DATA);
        }
        setStatus('success');
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Original API fetch implementation
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
    }
  }, [type]);

  return { data, status, error };
}