import { calculateAspects, filterAspectsByImportance, getAspectDescription } from './aspects';
import { AspectType } from './types';

describe('Astrological Aspects', () => {
  describe('calculateAspects', () => {
    const mockPoints = [
      // Sun and Moon in conjunction
      {
        name: 'SUN',
        full_degree: 120,
        longitudeSpeed: 1,
      },
      {
        name: 'MOON',
        full_degree: 123, // 3° orb
        longitudeSpeed: 13, // Moving faster
      },
      // Mars and Saturn in opposition
      {
        name: 'MARS',
        full_degree: 45,
        longitudeSpeed: 0.5,
      },
      {
        name: 'SATURN',
        full_degree: 227, // 2° off from exact opposition (180 + 45 = 225)
        longitudeSpeed: -0.3, // Retrograde
      },
      // Jupiter and Venus in trine
      {
        name: 'JUPITER',
        full_degree: 90,
        longitudeSpeed: 0.1,
      },
      {
        name: 'VENUS',
        full_degree: 210, // Exact trine (120° apart)
        longitudeSpeed: 1.2,
      },
      // Mercury and Pluto too far for any aspect
      {
        name: 'MERCURY',
        full_degree: 15,
        longitudeSpeed: 1.5,
      },
      {
        name: 'PLUTO',
        full_degree: 75, // 60° apart from Mercury, but not within the default orb
        longitudeSpeed: 0.01,
      },
    ];

    it('should detect conjunction aspects', () => {
      const aspects = calculateAspects(mockPoints, [AspectType.CONJUNCTION]);
      const sunMoonAspect = aspects.find(a => 
        (a.point1 === 'SUN' && a.point2 === 'MOON') || 
        (a.point1 === 'MOON' && a.point2 === 'SUN')
      );
      
      expect(sunMoonAspect).toBeDefined();
      expect(sunMoonAspect?.type).toBe(AspectType.CONJUNCTION);
      expect(sunMoonAspect?.orb).toBe(3);
      expect(sunMoonAspect?.applying).toBe(true);
    });
    
    it('should detect opposition aspects', () => {
      const aspects = calculateAspects(mockPoints, [AspectType.OPPOSITION]);
      const marsSaturnAspect = aspects.find(a => 
        (a.point1 === 'MARS' && a.point2 === 'SATURN') || 
        (a.point1 === 'SATURN' && a.point2 === 'MARS')
      );
      
      expect(marsSaturnAspect).toBeDefined();
      expect(marsSaturnAspect?.type).toBe(AspectType.OPPOSITION);
      expect(marsSaturnAspect?.orb).toBeCloseTo(2, 0);
    });
    
    it('should detect trine aspects', () => {
      const aspects = calculateAspects(mockPoints, [AspectType.TRINE]);
      const jupiterVenusAspect = aspects.find(a => 
        (a.point1 === 'JUPITER' && a.point2 === 'VENUS') || 
        (a.point1 === 'VENUS' && a.point2 === 'JUPITER')
      );
      
      expect(jupiterVenusAspect).toBeDefined();
      expect(jupiterVenusAspect?.type).toBe(AspectType.TRINE);
      expect(jupiterVenusAspect?.orb).toBe(0);
    });
    
    it('should respect custom orbs', () => {
      // Testing with a tight 1° orb for conjunction
      const customOrbs = {
        [AspectType.CONJUNCTION]: 1
      };
      
      const aspects = calculateAspects(mockPoints, [AspectType.CONJUNCTION], customOrbs);
      
      // Sun-Moon conjunction with 3° orb should not be detected with 1° maximum orb
      const sunMoonAspect = aspects.find(a => 
        (a.point1 === 'SUN' && a.point2 === 'MOON') || 
        (a.point1 === 'MOON' && a.point2 === 'SUN')
      );
      
      expect(sunMoonAspect).toBeUndefined();
    });
    
    it('should sort aspects by exactness', () => {
      const aspects = calculateAspects(mockPoints, [
        AspectType.CONJUNCTION, 
        AspectType.OPPOSITION, 
        AspectType.TRINE
      ]);
      
      // Jupiter-Venus exact trine should be first
      expect(aspects[0].orb).toBe(0);
      
      // Aspects should be sorted from most exact (smallest orb relative to max orb) to least exact
      const exactnessValues = aspects.map(a => a.exactness);
      expect(exactnessValues).toEqual([...exactnessValues].sort((a, b) => b - a));
    });
  });
  
  describe('filterAspectsByImportance', () => {
    it('should filter aspects by importance threshold', () => {
      const aspects = [
        // Very exact conjunction (high importance)
        {
          point1: 'SUN',
          point2: 'MOON',
          type: AspectType.CONJUNCTION,
          angle: 0,
          orb: 0.5,
          applying: true,
          exactness: 0.95,
        },
        // Loose square (medium importance)
        {
          point1: 'MARS',
          point2: 'JUPITER',
          type: AspectType.SQUARE,
          angle: 90,
          orb: 4,
          applying: false,
          exactness: 0.5,
        },
        // Very loose sextile (low importance)
        {
          point1: 'VENUS',
          point2: 'SATURN',
          type: AspectType.SEXTILE,
          angle: 60,
          orb: 3.5,
          applying: true,
          exactness: 0.2,
        },
      ];
      
      // High threshold should only include the conjunction
      const highImportanceAspects = filterAspectsByImportance(aspects, 0.7);
      expect(highImportanceAspects.length).toBe(1);
      expect(highImportanceAspects[0].point1).toBe('SUN');
      
      // Medium threshold should include conjunction and square
      const mediumImportanceAspects = filterAspectsByImportance(aspects, 0.4);
      expect(mediumImportanceAspects.length).toBe(2);
      
      // Low threshold should include all aspects
      const lowImportanceAspects = filterAspectsByImportance(aspects, 0.1);
      expect(lowImportanceAspects.length).toBe(3);
    });
  });
  
  describe('getAspectDescription', () => {
    it('should return a description for each aspect type', () => {
      const conjunctionDesc = getAspectDescription(AspectType.CONJUNCTION);
      expect(conjunctionDesc.angle).toBe(0);
      expect(conjunctionDesc.influence).toContain('Strong');
      expect(conjunctionDesc.description).toContain('merge');
      
      const squareDesc = getAspectDescription(AspectType.SQUARE);
      expect(squareDesc.angle).toBe(90);
      expect(squareDesc.influence).toContain('Challenging');
    });
    
    it('should provide a default description for unknown aspect types', () => {
      const unknownDesc = getAspectDescription('invalid_aspect' as AspectType);
      expect(unknownDesc.influence).toBe('Unknown aspect type');
    });
  });
});