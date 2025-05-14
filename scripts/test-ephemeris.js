require('dotenv').config({ path: '.env' });
const swisseph = require('swisseph');
const path = require('path');

// Set path to ephemeris files
const ephePath = path.join(process.cwd(), 'public/ephe');
swisseph.swe_set_ephe_path(ephePath);

// List of planets to calculate
const planets = [
  { id: swisseph.SE_SUN, name: 'Sun' },
  { id: swisseph.SE_MOON, name: 'Moon' },
  { id: swisseph.SE_MERCURY, name: 'Mercury' },
  { id: swisseph.SE_VENUS, name: 'Venus' },
  { id: swisseph.SE_MARS, name: 'Mars' },
  { id: swisseph.SE_JUPITER, name: 'Jupiter' },
  { id: swisseph.SE_SATURN, name: 'Saturn' },
  { id: swisseph.SE_URANUS, name: 'Uranus' },
  { id: swisseph.SE_NEPTUNE, name: 'Neptune' },
  { id: swisseph.SE_PLUTO, name: 'Pluto' },
  { id: swisseph.SE_CHIRON, name: 'Chiron' },
  { id: swisseph.SE_TRUE_NODE, name: 'North Node' },
];

// Zodiac signs
const signs = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 
  'Leo', 'Virgo', 'Libra', 'Scorpio', 
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert decimal degrees to sign and degree/minute within sign
function formatDegree(degree) {
  const normalizedDegree = degree % 360;
  const signIndex = Math.floor(normalizedDegree / 30);
  const degInSign = Math.floor(normalizedDegree % 30);
  const minInSign = Math.floor((normalizedDegree % 30 - degInSign) * 60);
  
  return `${signs[signIndex]} ${degInSign}°${minInSign}'`;
}

// Test function to calculate a birth chart
function calculateBirthChart(year, month, day, hour, minute, latitude, longitude) {
  console.log('====================================');
  console.log(`Chart for: ${year}-${month}-${day} ${hour}:${minute} at ${latitude}°N, ${longitude}°E`);
  console.log('====================================');
  
  // Convert to Julian day
  const julday = swisseph.swe_julday(
    year, month, day, hour + minute / 60, swisseph.SE_GREG_CAL
  );
  
  console.log(`Julian Day: ${julday}`);
  
  // Calculate houses using swe_houses_ex for more details
  try {
    // Calculate ascendant, midheaven etc.
    const houseData = swisseph.swe_houses_ex(
      julday, 0, latitude, longitude, 'W'  // 'W' for Whole Sign houses
    );
    
    if (houseData) {
      console.log('\nHouse data:');
      console.log(`Ascendant: ${formatDegree(houseData.ascendant)}`);
      console.log(`Midheaven: ${formatDegree(houseData.mc)}`);
      console.log(`ARMC: ${formatDegree(houseData.armc)}`);
      console.log(`Vertex: ${formatDegree(houseData.vertex)}`);
    } else {
      console.log('Error calculating house data');
    }
  } catch (error) {
    console.error('Error calculating houses:', error);
  }
  
  // Calculate planets
  console.log('\nPlanets:');
  planets.forEach(planet => {
    try {
      const result = swisseph.swe_calc_ut(julday, planet.id, swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH);
      if (result && !result.error) {
        console.log(`${planet.name}: ${formatDegree(result.longitude)}`);
      } else {
        console.log(`${planet.name}: Error - ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error calculating ${planet.name}:`, error);
    }
  });
}

// Test with a sample birth chart
calculateBirthChart(1990, 6, 15, 12, 30, 40.7128, -74.0060); // June 15, 1990, 12:30 PM in New York City

// Test current transits
console.log('\n\nCURRENT TRANSITS:');
const now = new Date();
calculateBirthChart(
  now.getUTCFullYear(), 
  now.getUTCMonth() + 1, 
  now.getUTCDate(), 
  now.getUTCHours(), 
  now.getUTCMinutes(), 
  0, 0  // At the prime meridian/equator
);