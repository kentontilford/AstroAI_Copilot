import { AspectType, AspectDefinition, Aspect, FormattedPoint } from './types';

// Standard aspect definitions with appropriate orbs
export const ASPECT_DEFINITIONS: Record<AspectType, AspectDefinition> = {
  [AspectType.CONJUNCTION]: {
    type: AspectType.CONJUNCTION,
    angle: 0,
    orb: 8,
    harmony: 'neutral',
    power: 10
  },
  [AspectType.OPPOSITION]: {
    type: AspectType.OPPOSITION,
    angle: 180,
    orb: 8,
    harmony: 'disharmonious',
    power: 10
  },
  [AspectType.TRINE]: {
    type: AspectType.TRINE,
    angle: 120,
    orb: 6,
    harmony: 'harmonious',
    power: 8
  },
  [AspectType.SQUARE]: {
    type: AspectType.SQUARE,
    angle: 90,
    orb: 6,
    harmony: 'disharmonious',
    power: 8
  },
  [AspectType.SEXTILE]: {
    type: AspectType.SEXTILE,
    angle: 60,
    orb: 4,
    harmony: 'harmonious',
    power: 5
  },
  [AspectType.SEMI_SEXTILE]: {
    type: AspectType.SEMI_SEXTILE,
    angle: 30,
    orb: 2,
    harmony: 'neutral',
    power: 2
  },
  [AspectType.SEMI_SQUARE]: {
    type: AspectType.SEMI_SQUARE,
    angle: 45,
    orb: 2,
    harmony: 'disharmonious',
    power: 3
  },
  [AspectType.SESQUI_SQUARE]: {
    type: AspectType.SESQUI_SQUARE,
    angle: 135,
    orb: 2,
    harmony: 'disharmonious',
    power: 3
  },
  [AspectType.QUINTILE]: {
    type: AspectType.QUINTILE,
    angle: 72,
    orb: 2,
    harmony: 'harmonious',
    power: 3
  },
  [AspectType.BI_QUINTILE]: {
    type: AspectType.BI_QUINTILE,
    angle: 144,
    orb: 2,
    harmony: 'harmonious',
    power: 3
  },
  [AspectType.QUINCUNX]: {
    type: AspectType.QUINCUNX,
    angle: 150,
    orb: 3,
    harmony: 'disharmonious',
    power: 4
  },
  [AspectType.PARALLEL]: {
    type: AspectType.PARALLEL,
    angle: 0, // For declination
    orb: 1,
    harmony: 'neutral',
    power: 5
  },
  [AspectType.CONTRA_PARALLEL]: {
    type: AspectType.CONTRA_PARALLEL,
    angle: 0, // For declination
    orb: 1,
    harmony: 'neutral',
    power: 5
  }
};

// Custom orb adjustments for specific planet pairs
const PLANET_PAIR_ORBS: Record<string, Record<string, number>> = {
  'SUN': {
    'MOON': 10, // Sun-Moon aspects get wider orbs
    'MERCURY': 9, // Sun-Mercury aspects get wider orbs
    'VENUS': 9,
    'MARS': 8
  },
  'MOON': {
    'MERCURY': 8,
    'VENUS': 8,
    'MARS': 8
  }
};

/**
 * Calculate the angular separation between two points considering wrap-around at 360°
 */
function calculateAngularSeparation(longitude1: number, longitude2: number): number {
  const diff = Math.abs(longitude1 - longitude2) % 360;
  return Math.min(diff, 360 - diff);
}

/**
 * Determine if an aspect is applying or separating based on speeds
 */
function isApplying(
  longitude1: number, 
  longitude2: number, 
  speed1: number, 
  speed2: number, 
  aspectAngle: number
): boolean {
  // For opposition (180°), if both planets are moving in the same direction,
  // they are separating; if moving in opposite directions, check relative speeds
  if (Math.abs(aspectAngle - 180) < 1) {
    return (speed1 > 0 && speed2 < 0) || (speed1 < 0 && speed2 > 0);
  }
  
  // For conjunction (0°), if both planets are moving in the same direction,
  // the faster one determines applying/separating
  if (Math.abs(aspectAngle) < 1 || Math.abs(aspectAngle - 360) < 1) {
    if ((speed1 > 0 && speed2 > 0) || (speed1 < 0 && speed2 < 0)) {
      return Math.abs(speed1) < Math.abs(speed2);
    } else {
      return speed1 > 0; // If moving in opposite directions, the one moving forward is applying
    }
  }
  
  // For other aspects, calculate if the angular distance is decreasing
  // This is a simplified approach; real astrology software calculates this more precisely
  const relativeSpeed = speed1 - speed2;
  return relativeSpeed < 0;
}

/**
 * Calculate all aspects between the given points
 */
export function calculateAspects(
  points: Array<FormattedPoint & { longitudeSpeed?: number }>,
  aspectTypesToInclude: AspectType[] = Object.values(AspectType),
  customOrbs?: Record<AspectType, number>
): Aspect[] {
  const aspects: Aspect[] = [];
  
  // Function to get the orb for a pair of planets
  const getOrb = (aspect: AspectType, point1: string, point2: string): number => {
    // Check for custom orb for this aspect type
    const baseOrb = customOrbs?.[aspect] ?? ASPECT_DEFINITIONS[aspect].orb;
    
    // Check for custom orb for this planet pair
    const planet1 = point1.toUpperCase();
    const planet2 = point2.toUpperCase();
    const pairOrb = PLANET_PAIR_ORBS[planet1]?.[planet2] ?? PLANET_PAIR_ORBS[planet2]?.[planet1];
    
    // Adjust the orb if there's a planet pair override
    return pairOrb ? (baseOrb * pairOrb / 8) : baseOrb;
  };
  
  // Process each point pair
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const point1 = points[i];
      const point2 = points[j];
      
      // Calculate the angular separation
      const angularSeparation = calculateAngularSeparation(
        point1.full_degree, 
        point2.full_degree
      );
      
      // Check each aspect type
      for (const aspectType of aspectTypesToInclude) {
        const aspectDef = ASPECT_DEFINITIONS[aspectType];
        
        // Skip latitude-based aspects if we're just looking at longitudes
        if (aspectType === AspectType.PARALLEL || aspectType === AspectType.CONTRA_PARALLEL) {
          continue;
        }
        
        // Calculate the orb for this planet pair and aspect type
        const maxOrb = getOrb(aspectType, point1.name, point2.name);
        
        // Check if the planets form this aspect
        const orb = Math.abs(angularSeparation - aspectDef.angle);
        
        if (orb <= maxOrb) {
          // Determine if the aspect is applying or separating
          const applying = point1.longitudeSpeed !== undefined && point2.longitudeSpeed !== undefined
            ? isApplying(
                point1.full_degree, 
                point2.full_degree, 
                point1.longitudeSpeed,
                point2.longitudeSpeed,
                aspectDef.angle
              )
            : false;
          
          // Calculate exactness (1 = exact, 0 = at the edge of orb)
          const exactness = 1 - (orb / maxOrb);
          
          aspects.push({
            point1: point1.name,
            point2: point2.name,
            type: aspectType,
            angle: aspectDef.angle,
            orb,
            applying,
            exactness
          });
        }
      }
    }
  }
  
  // Sort aspects by exactness (most exact first)
  return aspects.sort((a, b) => b.exactness - a.exactness);
}

/**
 * Filter aspects by importance
 */
export function filterAspectsByImportance(
  aspects: Aspect[],
  importanceThreshold: number = 0.5
): Aspect[] {
  return aspects.filter(aspect => {
    // Get the base power of this aspect type
    const power = ASPECT_DEFINITIONS[aspect.type].power;
    
    // Adjust power by exactness
    const adjustedPower = power * aspect.exactness;
    
    // Keep only aspects above the importance threshold
    return adjustedPower / 10 >= importanceThreshold;
  });
}

/**
 * Get a human-readable description of an aspect
 */
export function getAspectDescription(aspect: Aspect): string {
  const aspectDef = ASPECT_DEFINITIONS[aspect.type];
  const exactness = aspect.exactness >= 0.9 ? 'exact' :
                    aspect.exactness >= 0.7 ? 'close' :
                    'loose';
  
  const applyingSeparating = aspect.applying ? 'applying' : 'separating';
  
  return `${aspect.point1} ${aspect.type} ${aspect.point2} (${exactness}, ${applyingSeparating}, orb: ${aspect.orb.toFixed(2)}°)`;
}