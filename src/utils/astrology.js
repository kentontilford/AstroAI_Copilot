// Astrology utilities with fallback for environments without swisseph
let swisseph = null;

// Try to load swisseph, but don't crash if it's not available
try {
  swisseph = require('swisseph');
} catch (error) {
  console.warn('Swisseph module not available, using fallback calculations');
}

// Constants for planetary calculations
const SUN = 0;
const MOON = 1;
const MERCURY = 2;
const VENUS = 3;
const MARS = 4;
const JUPITER = 5;
const SATURN = 6;

// Zodiac signs
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio', 
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Calculate planet positions - falls back to simplified calculations if swisseph is not available
 * @param {Date} date - Birth date
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Planetary positions
 */
function calculatePlanetPositions(date, lat, lng) {
  if (swisseph) {
    return calculateWithSwisseph(date, lat, lng);
  } else {
    return calculateWithFallback(date);
  }
}

/**
 * Calculate using swisseph (accurate)
 */
function calculateWithSwisseph(date, lat, lng) {
  // Convert date to Julian day
  const julday = swisseph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60,
    swisseph.SE_GREG_CAL
  );

  const planets = {};
  const bodies = [SUN, MOON, MERCURY, VENUS, MARS, JUPITER, SATURN];
  
  bodies.forEach(body => {
    // Calculate planet position
    const result = swisseph.swe_calc_ut(julday, body, swisseph.SEFLG_SPEED);
    
    // Get longitude and convert to zodiac sign
    const longitude = result.longitude;
    const sign = Math.floor(longitude / 30);
    const degree = longitude % 30;
    
    planets[getBodyName(body)] = {
      sign: SIGNS[sign],
      degree: Math.round(degree * 100) / 100,
      longitude
    };
  });
  
  return planets;
}

/**
 * Calculate using simplified fallback (less accurate)
 */
function calculateWithFallback(date) {
  // Very simplified calculations based on average motion
  const planets = {};
  
  // Days since J2000.0 (January 1, 2000, 12:00 TT)
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const daysSince = (date.getTime() - j2000.getTime()) / (24 * 60 * 60 * 1000);
  
  // Simplified orbital periods and starting positions (very approximate)
  const orbitalData = {
    Sun: { period: 365.25, j2000Position: 280 },
    Moon: { period: 27.32, j2000Position: 318 },
    Mercury: { period: 87.97, j2000Position: 252 },
    Venus: { period: 224.7, j2000Position: 181 },
    Mars: { period: 686.98, j2000Position: 355 },
    Jupiter: { period: 4332.59, j2000Position: 34 },
    Saturn: { period: 10759.22, j2000Position: 50 }
  };
  
  // Calculate for each planet
  Object.entries(orbitalData).forEach(([planet, data]) => {
    // Calculate approximate longitude
    let longitude = (data.j2000Position + (daysSince * 360 / data.period)) % 360;
    if (longitude < 0) longitude += 360;
    
    const sign = Math.floor(longitude / 30);
    const degree = longitude % 30;
    
    planets[planet] = {
      sign: SIGNS[sign],
      degree: Math.round(degree * 100) / 100,
      longitude
    };
  });
  
  return planets;
}

/**
 * Get planet name from swisseph constant
 */
function getBodyName(body) {
  const bodies = {
    [SUN]: 'Sun',
    [MOON]: 'Moon',
    [MERCURY]: 'Mercury',
    [VENUS]: 'Venus',
    [MARS]: 'Mars',
    [JUPITER]: 'Jupiter',
    [SATURN]: 'Saturn'
  };
  
  return bodies[body] || `Body-${body}`;
}

/**
 * Calculate sun sign from date
 * @param {Date} date - Birth date
 * @returns {string} Sun sign
 */
function getSunSign(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simple sun sign calculation
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

/**
 * Calculate moon sign from date (approximate)
 * @param {Date} date - Birth date
 * @returns {string} Moon sign
 */
function getMoonSign(date) {
  if (swisseph) {
    const positions = calculateWithSwisseph(date, 0, 0);
    return positions.Moon.sign;
  } else {
    const positions = calculateWithFallback(date);
    return positions.Moon.sign;
  }
}

/**
 * Determine compatibility between two sun signs
 * @param {string} sign1 - First sun sign
 * @param {string} sign2 - Second sun sign
 * @returns {number} Compatibility score (0-10)
 */
function getCompatibilityScore(sign1, sign2) {
  // Element compatibility
  const elements = {
    'Fire': ['Aries', 'Leo', 'Sagittarius'],
    'Earth': ['Taurus', 'Virgo', 'Capricorn'],
    'Air': ['Gemini', 'Libra', 'Aquarius'],
    'Water': ['Cancer', 'Scorpio', 'Pisces']
  };
  
  // Get elements for the signs
  let element1 = Object.entries(elements).find(([_, signs]) => signs.includes(sign1))?.[0];
  let element2 = Object.entries(elements).find(([_, signs]) => signs.includes(sign2))?.[0];
  
  // Base score
  let score = 5;
  
  // Element compatibility
  if (element1 === element2) {
    // Same element, high compatibility
    score += 2;
  } else if (
    (element1 === 'Fire' && element2 === 'Air') ||
    (element1 === 'Air' && element2 === 'Fire') ||
    (element1 === 'Earth' && element2 === 'Water') ||
    (element1 === 'Water' && element2 === 'Earth')
  ) {
    // Complementary elements
    score += 1.5;
  } else if (
    (element1 === 'Fire' && element2 === 'Earth') ||
    (element1 === 'Earth' && element2 === 'Fire') ||
    (element1 === 'Air' && element2 === 'Water') ||
    (element1 === 'Water' && element2 === 'Air')
  ) {
    // Challenging elements
    score -= 1;
  }
  
  // Adjust for specific sign relationships
  const opposition = {
    'Aries': 'Libra',
    'Taurus': 'Scorpio',
    'Gemini': 'Sagittarius',
    'Cancer': 'Capricorn',
    'Leo': 'Aquarius',
    'Virgo': 'Pisces',
    'Libra': 'Aries',
    'Scorpio': 'Taurus',
    'Sagittarius': 'Gemini',
    'Capricorn': 'Cancer',
    'Aquarius': 'Leo',
    'Pisces': 'Virgo'
  };
  
  // Signs that are opposite create tension but also attraction
  if (opposition[sign1] === sign2) {
    score += 0.5; // Attraction but challenging
  }
  
  // Index of sign in zodiac
  const signIndex = (sign) => SIGNS.indexOf(sign);
  
  // Trine - signs of same element (120° apart)
  if (Math.abs(signIndex(sign1) - signIndex(sign2)) % 4 === 0) {
    score += 2;
  }
  
  // Sextile - signs that are 60° apart
  if (Math.abs(signIndex(sign1) - signIndex(sign2)) % 2 === 0) {
    score += 1;
  }
  
  // Ensure score is between 0 and 10
  return Math.max(0, Math.min(10, Math.round(score)));
}

module.exports = {
  calculatePlanetPositions,
  getSunSign,
  getMoonSign,
  getCompatibilityScore,
  SIGNS
};