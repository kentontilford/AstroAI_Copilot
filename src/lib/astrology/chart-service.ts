import { BirthProfile } from '@prisma/client';
import { formatBirthProfileForCalculation } from './utils';

// Fetch natal chart data for a profile
export async function fetchNatalChart(profile: BirthProfile) {
  const birthData = formatBirthProfileForCalculation(profile);
  
  const response = await fetch('/api/astrology/calculate-chart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      birth_data: birthData,
      calculation_type: 'natal',
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch natal chart');
  }
  
  return response.json();
}

// Fetch transit data
export async function fetchTransits(targetDate?: Date) {
  const response = await fetch('/api/astrology/calculate-chart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      birth_data: {
        // Birth data is required by the API, but not used for transit calculations
        date_of_birth: '2000-01-01',
        is_time_unknown: true,
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
      calculation_type: 'transits',
      target_date_utc: targetDate?.toISOString(),
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch transits');
  }
  
  return response.json();
}

// Fetch composite chart data for two profiles
export async function fetchCompositeChart(profileA: BirthProfile, profileB: BirthProfile) {
  const birthDataA = formatBirthProfileForCalculation(profileA);
  const birthDataB = formatBirthProfileForCalculation(profileB);
  
  const response = await fetch('/api/astrology/calculate-chart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      birth_data: birthDataA,
      birth_data_profile_b: birthDataB,
      calculation_type: 'composite',
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch composite chart');
  }
  
  return response.json();
}

// Fetch dashboard data
export async function fetchDashboardData(dashboardType: 'personal_growth' | 'relationships', 
  profiles: {
    defaultSoloProfile?: BirthProfile | null;
    defaultRelationshipProfileA?: BirthProfile | null;
    defaultRelationshipProfileB?: BirthProfile | null;
  }
) {
  if (dashboardType === 'personal_growth') {
    // For personal growth dashboard
    if (!profiles.defaultSoloProfile) {
      throw new Error('No default solo profile set');
    }
    
    // Fetch natal chart and transits
    const [natalChart, transits] = await Promise.all([
      fetchNatalChart(profiles.defaultSoloProfile),
      fetchTransits(),
    ]);
    
    return {
      natalChart,
      transits,
    };
  } else {
    // For relationships dashboard
    if (!profiles.defaultRelationshipProfileA || !profiles.defaultRelationshipProfileB) {
      throw new Error('Default relationship profiles not set');
    }
    
    // Fetch composite chart and transits
    const [compositeChart, transits] = await Promise.all([
      fetchCompositeChart(
        profiles.defaultRelationshipProfileA,
        profiles.defaultRelationshipProfileB
      ),
      fetchTransits(),
    ]);
    
    return {
      compositeChart,
      transits,
    };
  }
}