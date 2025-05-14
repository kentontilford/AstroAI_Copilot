import { BirthProfile } from '@prisma/client';
import { AspectType, ZodiacSign } from './types';
import { SIGNS } from './ephemeris';

/**
 * Convert BirthProfile database model to the format needed for chart calculations
 */
export function formatBirthProfileForCalculation(profile: BirthProfile) {
  return {
    date_of_birth: profile.date_of_birth, // YYYY-MM-DD
    time_of_birth: profile.time_of_birth, // HH:MM:SS
    is_time_unknown: profile.is_time_unknown,
    latitude: parseFloat(profile.birth_latitude.toString()),
    longitude: parseFloat(profile.birth_longitude.toString()),
    timezone: profile.birth_timezone,
    location_name: profile.birth_place,
  };
}

/**
 * Calculate which house a degree falls in (1-12)
 */
export function calculateHousePosition(
  degree: number, 
  ascendantDegree: number
): number {
  // Get the sign of the Ascendant (0-11)
  const ascendantSign = Math.floor(ascendantDegree / 30) % 12;
  
  // Get the sign of the point (0-11)
  const pointSign = Math.floor(degree / 30) % 12;
  
  // Calculate the house (1-12) relative to the Ascendant sign
  return ((pointSign - ascendantSign + 12) % 12) + 1;
}

/**
 * Get zodiac sign for a degree (0-359.99)
 */
export function getZodiacSign(degree: number): ZodiacSign {
  const signs = [
    { id: 0, name: 'Aries', glyph: '♈', element: 'fire' as const, modality: 'cardinal' as const, ruler: 4 },
    { id: 1, name: 'Taurus', glyph: '♉', element: 'earth' as const, modality: 'fixed' as const, ruler: 3 },
    { id: 2, name: 'Gemini', glyph: '♊', element: 'air' as const, modality: 'mutable' as const, ruler: 2 },
    { id: 3, name: 'Cancer', glyph: '♋', element: 'water' as const, modality: 'cardinal' as const, ruler: 1 },
    { id: 4, name: 'Leo', glyph: '♌', element: 'fire' as const, modality: 'fixed' as const, ruler: 0 },
    { id: 5, name: 'Virgo', glyph: '♍', element: 'earth' as const, modality: 'mutable' as const, ruler: 2 },
    { id: 6, name: 'Libra', glyph: '♎', element: 'air' as const, modality: 'cardinal' as const, ruler: 3 },
    { id: 7, name: 'Scorpio', glyph: '♏', element: 'water' as const, modality: 'fixed' as const, ruler: 4 },
    { id: 8, name: 'Sagittarius', glyph: '♐', element: 'fire' as const, modality: 'mutable' as const, ruler: 5 },
    { id: 9, name: 'Capricorn', glyph: '♑', element: 'earth' as const, modality: 'cardinal' as const, ruler: 6 },
    { id: 10, name: 'Aquarius', glyph: '♒', element: 'air' as const, modality: 'fixed' as const, ruler: 7 },
    { id: 11, name: 'Pisces', glyph: '♓', element: 'water' as const, modality: 'mutable' as const, ruler: 8 },
  ];
  
  // Get the sign index (0-11)
  const signIndex = Math.floor(degree / 30) % 12;
  
  return signs[signIndex];
}

/**
 * Format longitude as a string (e.g. "♈ 15°30'")
 */
export function formatLongitude(longitude: number): string {
  const sign = getZodiacSign(longitude);
  const positionInSign = longitude % 30;
  const degrees = Math.floor(positionInSign);
  const minutes = Math.floor((positionInSign - degrees) * 60);
  
  return `${sign.glyph} ${degrees}°${minutes}'`;
}

/**
 * Get the opposite sign (e.g. Aries -> Libra)
 */
export function getOppositeSign(sign: string): string {
  const signIndex = SIGNS.findIndex(s => s.name === sign);
  if (signIndex === -1) return '';
  
  const oppositeIndex = (signIndex + 6) % 12;
  return SIGNS[oppositeIndex].name;
}

/**
 * Get element info for a sign
 */
export function getElementInfo(sign: string): { 
  element: 'fire' | 'earth' | 'air' | 'water',
  quality: string,
  compatibility: string[]
} {
  const elements = {
    fire: {
      signs: ['Aries', 'Leo', 'Sagittarius'],
      quality: 'active, enthusiastic, impulsive',
      compatibility: ['air']
    },
    earth: {
      signs: ['Taurus', 'Virgo', 'Capricorn'],
      quality: 'practical, stable, sensual',
      compatibility: ['water']
    },
    air: {
      signs: ['Gemini', 'Libra', 'Aquarius'],
      quality: 'intellectual, communicative, social',
      compatibility: ['fire']
    },
    water: {
      signs: ['Cancer', 'Scorpio', 'Pisces'],
      quality: 'emotional, intuitive, sensitive',
      compatibility: ['earth']
    }
  };
  
  // Find element for the sign
  for (const [element, info] of Object.entries(elements)) {
    if (info.signs.includes(sign)) {
      return {
        element: element as 'fire' | 'earth' | 'air' | 'water',
        quality: info.quality,
        compatibility: info.compatibility
      };
    }
  }
  
  // Default return if sign not found
  return {
    element: 'fire',
    quality: '',
    compatibility: []
  };
}

/**
 * Get modality info for a sign
 */
export function getModalityInfo(sign: string): {
  modality: 'cardinal' | 'fixed' | 'mutable',
  quality: string
} {
  const modalities = {
    cardinal: {
      signs: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
      quality: 'initiating, active, leadership-oriented'
    },
    fixed: {
      signs: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
      quality: 'stable, persistent, resistant to change'
    },
    mutable: {
      signs: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
      quality: 'adaptable, flexible, versatile'
    }
  };
  
  // Find modality for the sign
  for (const [modality, info] of Object.entries(modalities)) {
    if (info.signs.includes(sign)) {
      return {
        modality: modality as 'cardinal' | 'fixed' | 'mutable',
        quality: info.quality
      };
    }
  }
  
  // Default return if sign not found
  return {
    modality: 'cardinal',
    quality: ''
  };
}

/**
 * Get aspect description based on type
 */
export function getAspectDescription(aspectType: AspectType): {
  angle: number,
  influence: string,
  description: string
} {
  const aspectDescriptions = {
    [AspectType.CONJUNCTION]: {
      angle: 0,
      influence: 'Strong, blending energies',
      description: 'Planets merge their energies and operate together. Very powerful.'
    },
    [AspectType.OPPOSITION]: {
      angle: 180,
      influence: 'Challenging, polarizing',
      description: 'Creates tension and awareness between opposing forces that need integration.'
    },
    [AspectType.TRINE]: {
      angle: 120,
      influence: 'Harmonious, supportive',
      description: 'Planets work together easily, creating flow and opportunity.'
    },
    [AspectType.SQUARE]: {
      angle: 90,
      influence: 'Challenging, productive tension',
      description: 'Creates friction that demands action and resolution.'
    },
    [AspectType.SEXTILE]: {
      angle: 60,
      influence: 'Positive, supportive',
      description: 'Creates opportunities that require some effort to activate.'
    },
    [AspectType.SEMI_SEXTILE]: {
      angle: 30,
      influence: 'Mildly supportive',
      description: 'A subtle connection that can bring slight awareness between planets.'
    },
    [AspectType.QUINCUNX]: {
      angle: 150,
      influence: 'Awkward, requiring adjustment',
      description: 'Creates a sense of imbalance that requires adaptation.'
    },
    // Add others as needed
  };
  
  return aspectDescriptions[aspectType] || {
    angle: 0,
    influence: 'Unknown aspect type',
    description: 'No description available for this aspect type.'
  };
}

/**
 * Get the planetary ruler of a sign
 */
export function getRuler(sign: string): string {
  const rulers = {
    'Aries': 'Mars',
    'Taurus': 'Venus',
    'Gemini': 'Mercury',
    'Cancer': 'Moon',
    'Leo': 'Sun',
    'Virgo': 'Mercury',
    'Libra': 'Venus',
    'Scorpio': 'Pluto',
    'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn', 
    'Aquarius': 'Uranus',
    'Pisces': 'Neptune'
  };
  
  return rulers[sign as keyof typeof rulers] || 'Unknown';
}

/**
 * Determine if a planet is in dignity, detriment, exaltation, or fall
 */
export function getPlanetaryDignity(planet: string, sign: string): {
  status: 'dignity' | 'detriment' | 'exaltation' | 'fall' | 'neutral',
  description: string
} {
  const dignities = {
    'Sun': { dignity: 'Leo', detriment: 'Aquarius', exaltation: 'Aries', fall: 'Libra' },
    'Moon': { dignity: 'Cancer', detriment: 'Capricorn', exaltation: 'Taurus', fall: 'Scorpio' },
    'Mercury': { dignity: ['Gemini', 'Virgo'], detriment: ['Sagittarius', 'Pisces'], exaltation: 'Virgo', fall: 'Pisces' },
    'Venus': { dignity: ['Taurus', 'Libra'], detriment: ['Scorpio', 'Aries'], exaltation: 'Pisces', fall: 'Virgo' },
    'Mars': { dignity: ['Aries', 'Scorpio'], detriment: ['Libra', 'Taurus'], exaltation: 'Capricorn', fall: 'Cancer' },
    'Jupiter': { dignity: ['Sagittarius', 'Pisces'], detriment: ['Gemini', 'Virgo'], exaltation: 'Cancer', fall: 'Capricorn' },
    'Saturn': { dignity: ['Capricorn', 'Aquarius'], detriment: ['Cancer', 'Leo'], exaltation: 'Libra', fall: 'Aries' },
    'Uranus': { dignity: 'Aquarius', detriment: 'Leo', exaltation: 'Scorpio', fall: 'Taurus' },
    'Neptune': { dignity: 'Pisces', detriment: 'Virgo', exaltation: 'Cancer', fall: 'Capricorn' },
    'Pluto': { dignity: 'Scorpio', detriment: 'Taurus', exaltation: 'Aries', fall: 'Libra' },
  };
  
  const planetDignity = dignities[planet as keyof typeof dignities];
  if (!planetDignity) {
    return { status: 'neutral', description: 'Neutral placement with typical expression.' };
  }
  
  if (Array.isArray(planetDignity.dignity) ? planetDignity.dignity.includes(sign) : planetDignity.dignity === sign) {
    return { 
      status: 'dignity', 
      description: `${planet} is in its rulership in ${sign}, expressing its qualities clearly and strongly.` 
    };
  }
  
  if (Array.isArray(planetDignity.detriment) ? planetDignity.detriment.includes(sign) : planetDignity.detriment === sign) {
    return { 
      status: 'detriment', 
      description: `${planet} is in detriment in ${sign}, facing challenges expressing its natural qualities.` 
    };
  }
  
  if (planetDignity.exaltation === sign) {
    return { 
      status: 'exaltation', 
      description: `${planet} is exalted in ${sign}, expressing its qualities in an enhanced, elevated way.` 
    };
  }
  
  if (planetDignity.fall === sign) {
    return { 
      status: 'fall', 
      description: `${planet} is in fall in ${sign}, expressing its qualities in a subdued or difficult manner.` 
    };
  }
  
  return { status: 'neutral', description: 'Neutral placement with typical expression.' };
}