import swisseph from 'swisseph';
import path from 'path';
import { astrologyCache } from '@/lib/cache';
import { 
  HouseSystem, 
  PointPosition, 
  FormattedPoint, 
  HouseCusp, 
  ChartAngles,
  NatalChart,
  TransitChart,
  CompositeChart,
  Aspect,
  AspectType,
  ChartCalculationOptions
} from './types';
import { localDateTimeToJulianDay } from './timezone';
import { calculateAspects, filterAspectsByImportance } from './aspects';

// Set path to ephemeris files
const ephePath = path.join(process.cwd(), 'public/ephe');
swisseph.swe_set_ephe_path(ephePath);

// Planet and point constants
export const POINTS = {
  SUN: swisseph.SE_SUN,
  MOON: swisseph.SE_MOON,
  MERCURY: swisseph.SE_MERCURY,
  VENUS: swisseph.SE_VENUS,
  MARS: swisseph.SE_MARS,
  JUPITER: swisseph.SE_JUPITER,
  SATURN: swisseph.SE_SATURN,
  URANUS: swisseph.SE_URANUS,
  NEPTUNE: swisseph.SE_NEPTUNE,
  PLUTO: swisseph.SE_PLUTO,
  CHIRON: swisseph.SE_CHIRON,
  NORTH_NODE: swisseph.SE_TRUE_NODE,  // Or could use SE_MEAN_NODE
};

// Zodiac signs
export const SIGNS = [
  { name: 'Aries', glyph: '♈' },
  { name: 'Taurus', glyph: '♉' },
  { name: 'Gemini', glyph: '♊' },
  { name: 'Cancer', glyph: '♋' },
  { name: 'Leo', glyph: '♌' },
  { name: 'Virgo', glyph: '♍' },
  { name: 'Libra', glyph: '♎' },
  { name: 'Scorpio', glyph: '♏' },
  { name: 'Sagittarius', glyph: '♐' },
  { name: 'Capricorn', glyph: '♑' },
  { name: 'Aquarius', glyph: '♒' },
  { name: 'Pisces', glyph: '♓' },
];

// Default calculation flag
const DEFAULT_CALC_FLAG = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH;

// Convert Julian day to UTC date
function jdToDate(jd: number): Date {
  // Julian day starts at noon
  return new Date((jd - 2440587.5) * 86400000);
}

// Convert UTC date to Julian day
function dateToJd(date: Date): number {
  // Julian day starts at noon
  return date.getTime() / 86400000 + 2440587.5;
}

// Convert decimal degrees to sign index (0-11)
function getSignIndex(degree: number): number {
  const normalizedDegree = degree % 360;
  return Math.floor(normalizedDegree / 30);
}

// Convert decimal degrees to degrees/minutes within sign (0-29°59')
function getDegreeInSign(degree: number): { degree: number; minute: number } {
  const normalizedDegree = degree % 30;
  const d = Math.floor(normalizedDegree);
  const m = Math.floor((normalizedDegree - d) * 60);
  return { degree: d, minute: m };
}

// Convert degrees to Degrees:Minutes:Seconds format
export function degreesToDMS(degrees: number): { degrees: number; minutes: number; seconds: number } {
  const d = Math.floor(degrees);
  const minutesWithFraction = (degrees - d) * 60;
  const m = Math.floor(minutesWithFraction);
  const s = Math.floor((minutesWithFraction - m) * 60);
  return { degrees: d, minutes: m, seconds: s };
}

// Format DMS as a string
export function formatDMS(dms: { degrees: number; minutes: number; seconds: number }): string {
  return `${dms.degrees}° ${dms.minutes}' ${dms.seconds}"`;
}

// Get point position (planet, asteroid, etc.)
export function calculatePointPosition(
  jd: number,
  pointId: number,
  flag: number = DEFAULT_CALC_FLAG
): PointPosition {
  const result = swisseph.swe_calc_ut(jd, pointId, flag);
  
  if (result.error) {
    console.error(`Error calculating point ${pointId}:`, result.error);
    throw new Error(`Failed to calculate planet position: ${result.error}`);
  }
  
  return {
    longitude: result.longitude,
    latitude: result.latitude,
    distance: result.distance,
    longitudeSpeed: result.longitudeSpeed,
    latitudeSpeed: result.latitudeSpeed,
    distanceSpeed: result.distanceSpeed,
  };
}

// Calculate Ascendant and Midheaven
export function calculateAscMc(
  jd: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = HouseSystem.WHOLE_SIGN
): {
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  coAscendantKoch: number;
  coAscendantMunkasey: number;
  polarAscendant: number;
} {
  const result = swisseph.swe_houses_ex(
    jd,
    swisseph.SEFLG_SIDEREAL,
    latitude,
    longitude,
    houseSystem
  );
  
  if (!result || result.error) {
    console.error('Error calculating houses:', result?.error);
    throw new Error('Failed to calculate Ascendant and MC');
  }
  
  return {
    ascendant: result.ascendant,
    mc: result.mc,
    armc: result.armc,
    vertex: result.vertex,
    equatorialAscendant: result.equatorialAscendant,
    coAscendantKoch: result.coAscendantKoch,
    coAscendantMunkasey: result.coAscendantMunkasey,
    polarAscendant: result.polarAscendant,
  };
}

// Calculate houses
export function calculateHouses(
  jd: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem = HouseSystem.WHOLE_SIGN
): {
  houses: number[];
  ascendant: number;
  mc: number;
} {
  const result = swisseph.swe_houses(
    jd,
    latitude,
    longitude,
    houseSystem
  );
  
  if (!result || result.error) {
    console.error('Error calculating houses:', result?.error);
    throw new Error('Failed to calculate houses');
  }
  
  return {
    houses: result.houses,
    ascendant: result.ascendant,
    mc: result.mc,
  };
}

// Convert zodiacal longitude to formatted point data
function formatPointData(
  name: string, 
  position: PointPosition, 
  houseNumber?: number
): FormattedPoint {
  const signIndex = getSignIndex(position.longitude);
  const { degree, minute } = getDegreeInSign(position.longitude);
  const isRetrograde = position.longitudeSpeed < 0;
  
  return {
    name,
    sign: SIGNS[signIndex].name,
    sign_glyph: SIGNS[signIndex].glyph,
    degree,
    minute,
    full_degree: parseFloat(position.longitude.toFixed(2)),
    ...(houseNumber !== undefined ? { house: houseNumber } : {}),
    retrograde: isRetrograde,
    longitudeSpeed: position.longitudeSpeed // Add speed for aspect calculations
  };
}

// Determine house for a point
function getHouseForPoint(
  pointLongitude: number, 
  ascendantLongitude: number,
  houseSystem: HouseSystem
): number {
  if (houseSystem === HouseSystem.WHOLE_SIGN) {
    // For Whole Sign houses, the house is determined by counting from the sign of the Ascendant
    const ascendantSign = getSignIndex(ascendantLongitude);
    const pointSign = getSignIndex(pointLongitude);
    
    // Count from Ascendant sign (1st house) to the point's sign
    return 1 + ((pointSign - ascendantSign + 12) % 12);
  } else {
    // For other house systems, we would need the house cusps to determine the house
    // This would require additional calculation
    throw new Error(`House system ${houseSystem} not implemented for house determination`);
  }
}

// Format house data
function formatHouseData(
  houseNumber: number, 
  cusp: number,
  houseSystem: HouseSystem
): HouseCusp {
  const signIndex = getSignIndex(cusp);
  
  return {
    house_number: houseNumber,
    sign: SIGNS[signIndex].name,
    sign_glyph: SIGNS[signIndex].glyph,
    start_degree_in_sign: houseSystem === HouseSystem.WHOLE_SIGN ? 0 : getDegreeInSign(cusp).degree,
    absolute_degree: cusp,
  };
}

// Calculate natal chart
export async function calculateNatalChart(
  birthData: {
    date_of_birth: string; // YYYY-MM-DD
    time_of_birth?: string; // HH:MM:SS in local time, optional
    is_time_unknown: boolean;
    latitude: number;
    longitude: number;
    timezone: string; // IANA timezone (e.g., 'America/New_York')
  },
  options: ChartCalculationOptions = {}
): Promise<NatalChart> {
  // Set defaults
  const houseSystem = options.house_system || HouseSystem.WHOLE_SIGN;
  const withAspects = options.with_aspects !== false;
  
  // Create a unique cache key based on birth data and options
  const cacheKey = `natal:${birthData.date_of_birth}:${birthData.time_of_birth || 'unknown'}:${birthData.latitude}:${birthData.longitude}:${birthData.timezone}:${houseSystem}:${withAspects}`;

  // Use cache with long TTL for birth charts (1 week = 604800 seconds)
  return astrologyCache.getOrCompute(
    cacheKey,
    async () => {
      try {
        // Default to noon if time is unknown
        let birthTime = '12:00:00';
        let timeUnknownApplied = false;
        
        if (birthData.is_time_unknown) {
          timeUnknownApplied = true;
        } else if (birthData.time_of_birth) {
          birthTime = birthData.time_of_birth;
        } else {
          timeUnknownApplied = true;
        }
        
        // Convert local time to Julian day, properly accounting for timezone
        const jd = localDateTimeToJulianDay(
          birthData.date_of_birth, 
          birthTime, 
          birthData.timezone
        );
        
        // Calculate houses and angles (Ascendant, MC)
        const housesData = calculateHouses(jd, birthData.latitude, birthData.longitude, houseSystem);
        const angles = calculateAscMc(jd, birthData.latitude, birthData.longitude, houseSystem);
        
        // Calculate planetary positions
        const pointsPromises = Object.entries(POINTS).map(async ([name, id]) => {
          const position = calculatePointPosition(jd, id);
          const houseNumber = getHouseForPoint(position.longitude, angles.ascendant, houseSystem);
          return formatPointData(name, position, houseNumber);
        });
        
        const points = await Promise.all(pointsPromises);
        
        // Format houses data
        const houses: HouseCusp[] = [];
        
        if (houseSystem === HouseSystem.WHOLE_SIGN) {
          // For Whole Sign houses, house cusps are at 0° of each sign starting from Ascendant sign
          const ascendantSign = getSignIndex(angles.ascendant);
          
          for (let i = 1; i <= 12; i++) {
            const houseSign = (ascendantSign + i - 1) % 12;
            const houseCusp = houseSign * 30; // Start of the sign
            
            houses.push(formatHouseData(i, houseCusp, houseSystem));
          }
        } else {
          // For other house systems, use the calculated house cusps
          for (let i = 1; i <= 12; i++) {
            houses.push(formatHouseData(i, housesData.houses[i - 1], houseSystem));
          }
        }
        
        // Format Ascendant and Midheaven
        const ascendantData = formatPointData('Ascendant', {
          longitude: angles.ascendant,
          latitude: 0,
          distance: 0,
          longitudeSpeed: 0,
          latitudeSpeed: 0,
          distanceSpeed: 0
        });
        
        const midheavenData = formatPointData('Midheaven', {
          longitude: angles.mc,
          latitude: 0,
          distance: 0,
          longitudeSpeed: 0,
          latitudeSpeed: 0,
          distanceSpeed: 0
        });
        
        // Calculate aspects if requested
        let aspects: Aspect[] | undefined;
        
        if (withAspects) {
          const aspectTypesToInclude = options.aspects_to_include || Object.values(AspectType);
          aspects = calculateAspects(points, aspectTypesToInclude, options.custom_orbs);
          
          // Filter aspects by importance if there are too many
          if (aspects.length > 50) {
            aspects = filterAspectsByImportance(aspects, 0.3);
          }
        }
        
        return {
          calculation_type: 'natal',
          points,
          houses,
          ascendant: {
            sign: ascendantData.sign,
            sign_glyph: ascendantData.sign_glyph,
            full_degree: ascendantData.full_degree,
          },
          midheaven: {
            sign: midheavenData.sign,
            sign_glyph: midheavenData.sign_glyph,
            full_degree: midheavenData.full_degree,
          },
          time_unknown_applied: timeUnknownApplied,
          aspects,
        };
      } catch (error) {
        console.error('Error calculating natal chart:', error);
        throw error;
      }
    },
    { ttl: 604800 } // Cache for 1 week
  );
}

// Calculate current transits
export async function calculateTransits(
  targetDateUtc: Date = new Date(),
  natalChart?: NatalChart,
  options: ChartCalculationOptions = {}
): Promise<TransitChart> {
  // Create cache key based on date, rounded to nearest hour to reduce excessive calculations
  // Transits don't change significantly in minutes, so hourly calculation is sufficient
  const roundedDate = new Date(targetDateUtc);
  roundedDate.setMinutes(0, 0, 0); // Zero out minutes and seconds
  const withAspects = options.with_aspects !== false && !!natalChart;
  const cacheKey = `transits:${roundedDate.toISOString()}:${withAspects}`;

  // Use cache with 1-hour TTL for transit calculations
  return astrologyCache.getOrCompute(
    cacheKey,
    async () => {
      try {
        // Convert target date to Julian day
        const jd = dateToJd(targetDateUtc);
        
        // Calculate planetary positions
        const pointsPromises = Object.entries(POINTS).map(async ([name, id]) => {
          const position = calculatePointPosition(jd, id);
          return formatPointData(name, position);
        });
        
        const points = await Promise.all(pointsPromises);
        
        // Calculate aspects to natal chart if provided
        let aspects: Aspect[] | undefined;
        
        if (withAspects && natalChart) {
          const aspectTypesToInclude = options.aspects_to_include || Object.values(AspectType);
          
          // Calculate transit-to-natal aspects
          const transitToNatalPoints = [];
          
          // Label transit points to distinguish them
          for (const point of points) {
            transitToNatalPoints.push({
              ...point,
              name: `Transit ${point.name}`
            });
          }
          
          // Combine natal and transit points for aspect calculation
          const combinedPoints = [...natalChart.points, ...transitToNatalPoints];
          
          aspects = calculateAspects(combinedPoints, aspectTypesToInclude, options.custom_orbs);
          
          // Filter to only include transit-to-natal aspects
          aspects = aspects.filter(aspect => 
            (aspect.point1.startsWith('Transit') && !aspect.point2.startsWith('Transit')) || 
            (!aspect.point1.startsWith('Transit') && aspect.point2.startsWith('Transit'))
          );
          
          // Filter aspects by importance if there are too many
          if (aspects.length > 30) {
            aspects = filterAspectsByImportance(aspects, 0.4);
          }
        }
        
        return {
          calculation_type: 'transits',
          points,
          date: targetDateUtc.toISOString(),
          aspects,
        };
      } catch (error) {
        console.error('Error calculating transits:', error);
        throw error;
      }
    },
    { ttl: 3600 } // Cache for 1 hour
  );
}

// Calculate composite chart (midpoint method)
export async function calculateCompositeChart(
  birthDataA: {
    date_of_birth: string;
    time_of_birth?: string;
    is_time_unknown: boolean;
    latitude: number;
    longitude: number;
    timezone: string;
  },
  birthDataB: {
    date_of_birth: string;
    time_of_birth?: string;
    is_time_unknown: boolean;
    latitude: number;
    longitude: number;
    timezone: string;
  },
  options: ChartCalculationOptions = {}
): Promise<CompositeChart> {
  // Set defaults
  const houseSystem = options.house_system || HouseSystem.WHOLE_SIGN;
  const withAspects = options.with_aspects !== false;
  
  // Create a cache key for the composite chart
  // Construct a consistent cache key regardless of the order of birth data
  // by sorting the birth dates to ensure A is always before B
  const shouldSwap = birthDataA.date_of_birth > birthDataB.date_of_birth;
  const dataA = shouldSwap ? birthDataB : birthDataA;
  const dataB = shouldSwap ? birthDataA : birthDataB;
  
  const cacheKey = `composite:${dataA.date_of_birth}:${dataA.time_of_birth || 'unknown'}:${dataA.latitude}:${dataA.longitude}:${dataA.timezone}:${dataB.date_of_birth}:${dataB.time_of_birth || 'unknown'}:${dataB.latitude}:${dataB.longitude}:${dataB.timezone}:${houseSystem}:${withAspects}`;

  // Use cache with long TTL for composite charts (1 week = 604800 seconds)
  return astrologyCache.getOrCompute(
    cacheKey,
    async () => {
      try {
        // Calculate natal charts for both individuals
        const chartA = await calculateNatalChart(birthDataA, { 
          house_system: houseSystem,
          with_aspects: false 
        });
        const chartB = await calculateNatalChart(birthDataB, { 
          house_system: houseSystem,
          with_aspects: false 
        });
        
        // Function to find midpoint between two degrees
        const calculateMidpoint = (deg1: number, deg2: number): number => {
          // Ensure proper handling of the 0/360 boundary
          let diff = Math.abs(deg1 - deg2);
          if (diff > 180) {
            diff = 360 - diff;
            // Get the midpoint on the shorter arc
            const midpoint = Math.min(deg1, deg2) - diff / 2;
            return midpoint < 0 ? midpoint + 360 : midpoint;
          } else {
            // Regular midpoint calculation
            return (deg1 + deg2) / 2;
          }
        };
        
        // Calculate midpoints for all planets and points
        const compositeMidpoints = new Map<string, PointPosition>();
        
        // Process main planets
        for (const pointA of chartA.points) {
          const pointB = chartB.points.find(p => p.name === pointA.name);
          if (pointB) {
            // Find matching point data
            const pointAData = pointA as FormattedPoint & { longitudeSpeed?: number };
            const pointBData = pointB as FormattedPoint & { longitudeSpeed?: number };
            
            // Calculate midpoint longitude
            const midpointLongitude = calculateMidpoint(pointA.full_degree, pointB.full_degree);
            
            // Calculate average speed (simplified)
            const avgSpeed = ((pointAData.longitudeSpeed || 0) + (pointBData.longitudeSpeed || 0)) / 2;
            
            compositeMidpoints.set(pointA.name, {
              longitude: midpointLongitude,
              latitude: 0, // Simplified - would average latitudes in production
              distance: 0, // Not using distance for composite charts
              longitudeSpeed: avgSpeed,
              latitudeSpeed: 0,
              distanceSpeed: 0
            });
          }
        }
        
        // Calculate midpoint for Ascendant and Midheaven
        const ascMidpoint = calculateMidpoint(chartA.ascendant.full_degree, chartB.ascendant.full_degree);
        const mcMidpoint = calculateMidpoint(chartA.midheaven.full_degree, chartB.midheaven.full_degree);
        
        // Format composite Ascendant and Midheaven
        const compositeAscendant = formatPointData('Ascendant', {
          longitude: ascMidpoint,
          latitude: 0,
          distance: 0,
          longitudeSpeed: 0,
          latitudeSpeed: 0,
          distanceSpeed: 0
        });
        
        const compositeMidheaven = formatPointData('Midheaven', {
          longitude: mcMidpoint,
          latitude: 0,
          distance: 0,
          longitudeSpeed: 0,
          latitudeSpeed: 0,
          distanceSpeed: 0
        });
        
        // Generate composite houses based on composite Ascendant
        const compositeHouses: HouseCusp[] = [];
        
        if (houseSystem === HouseSystem.WHOLE_SIGN) {
          // For Whole Sign houses, house cusps are at 0° of each sign starting from Ascendant sign
          const ascendantSign = getSignIndex(ascMidpoint);
          
          for (let i = 1; i <= 12; i++) {
            const houseSign = (ascendantSign + i - 1) % 12;
            const houseCusp = houseSign * 30; // Start of the sign
            
            compositeHouses.push(formatHouseData(i, houseCusp, houseSystem));
          }
        } else {
          // For other house systems, we would need additional calculations
          // This is a simplified approach
          throw new Error(`House system ${houseSystem} not implemented for composite charts`);
        }
        
        // Format composite points with house placements
        const compositePoints = Array.from(compositeMidpoints.entries()).map(([name, position]) => {
          const houseNumber = getHouseForPoint(position.longitude, ascMidpoint, houseSystem);
          return formatPointData(name, position, houseNumber);
        });
        
        // Calculate aspects if requested
        let aspects: Aspect[] | undefined;
        
        if (withAspects) {
          const aspectTypesToInclude = options.aspects_to_include || Object.values(AspectType);
          aspects = calculateAspects(compositePoints, aspectTypesToInclude, options.custom_orbs);
          
          // Filter aspects by importance if there are too many
          if (aspects.length > 50) {
            aspects = filterAspectsByImportance(aspects, 0.3);
          }
        }
        
        return {
          calculation_type: 'composite',
          points: compositePoints,
          houses: compositeHouses,
          ascendant: {
            sign: compositeAscendant.sign,
            sign_glyph: compositeAscendant.sign_glyph,
            full_degree: compositeAscendant.full_degree,
          },
          midheaven: {
            sign: compositeMidheaven.sign,
            sign_glyph: compositeMidheaven.sign_glyph,
            full_degree: compositeMidheaven.full_degree,
          },
          aspects,
        };
      } catch (error) {
        console.error('Error calculating composite chart:', error);
        throw error;
      }
    },
    { ttl: 604800 } // Cache for 1 week
  );
}