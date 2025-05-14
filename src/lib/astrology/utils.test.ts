import {
  formatBirthProfileForCalculation,
  calculateHousePosition,
  getZodiacSign,
  formatLongitude,
  getOppositeSign,
  getElementInfo,
  getModalityInfo,
  getRuler,
  getPlanetaryDignity
} from './utils';
import { AspectType } from './types';

// Mock birth profile data
const mockBirthProfile = {
  id: 1,
  user_clerk_id: 'user_123',
  profile_name: 'Test Profile',
  date_of_birth: '1990-01-01',
  time_of_birth: '12:00:00',
  is_time_unknown: false,
  birth_place: 'New York, NY',
  birth_latitude: 40.7128,
  birth_longitude: -74.0060,
  birth_timezone: 'America/New_York',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

describe('Astrology Utilities', () => {
  describe('formatBirthProfileForCalculation', () => {
    it('should properly format the birth profile for calculation', () => {
      const formatted = formatBirthProfileForCalculation(mockBirthProfile as any);
      
      expect(formatted).toEqual({
        date_of_birth: '1990-01-01',
        time_of_birth: '12:00:00',
        is_time_unknown: false,
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        location_name: 'New York, NY',
      });
    });
  });
  
  describe('calculateHousePosition', () => {
    it('should calculate house position correctly', () => {
      // Test with Aries ascendant (0°)
      expect(calculateHousePosition(45, 0)).toBe(2); // Taurus in 2nd house
      expect(calculateHousePosition(95, 0)).toBe(4); // Cancer in 4th house
      expect(calculateHousePosition(359, 0)).toBe(12); // Pisces in 12th house
      
      // Test with Libra ascendant (180°)
      expect(calculateHousePosition(45, 180)).toBe(8); // Taurus in 8th house with Libra rising
      expect(calculateHousePosition(185, 180)).toBe(1); // Libra in 1st house with Libra rising
      expect(calculateHousePosition(0, 180)).toBe(7); // Aries in 7th house with Libra rising
    });
  });
  
  describe('getZodiacSign', () => {
    it('should return the correct zodiac sign for a degree', () => {
      expect(getZodiacSign(5).name).toBe('Aries');
      expect(getZodiacSign(45).name).toBe('Taurus');
      expect(getZodiacSign(95).name).toBe('Cancer');
      expect(getZodiacSign(185).name).toBe('Libra');
      expect(getZodiacSign(359).name).toBe('Pisces');
    });
    
    it('should include element and modality information', () => {
      const leo = getZodiacSign(125);
      expect(leo.name).toBe('Leo');
      expect(leo.element).toBe('fire');
      expect(leo.modality).toBe('fixed');
    });
  });
  
  describe('formatLongitude', () => {
    it('should format longitude as a string with sign and degrees', () => {
      expect(formatLongitude(5)).toBe('♈ 5°0\'');
      expect(formatLongitude(45.5)).toBe('♉ 15°30\'');
      expect(formatLongitude(359.99)).toBe('♓ 29°59\'');
    });
  });
  
  describe('getOppositeSign', () => {
    it('should return the opposite sign', () => {
      expect(getOppositeSign('Aries')).toBe('Libra');
      expect(getOppositeSign('Taurus')).toBe('Scorpio');
      expect(getOppositeSign('Gemini')).toBe('Sagittarius');
      expect(getOppositeSign('Cancer')).toBe('Capricorn');
      expect(getOppositeSign('Leo')).toBe('Aquarius');
      expect(getOppositeSign('Virgo')).toBe('Pisces');
    });
  });
  
  describe('getElementInfo', () => {
    it('should return element information for a sign', () => {
      const fireInfo = getElementInfo('Aries');
      expect(fireInfo.element).toBe('fire');
      expect(fireInfo.quality).toBe('active, enthusiastic, impulsive');
      expect(fireInfo.compatibility).toContain('air');
      
      const waterInfo = getElementInfo('Cancer');
      expect(waterInfo.element).toBe('water');
      expect(waterInfo.compatibility).toContain('earth');
    });
  });
  
  describe('getModalityInfo', () => {
    it('should return modality information for a sign', () => {
      const cardinal = getModalityInfo('Aries');
      expect(cardinal.modality).toBe('cardinal');
      expect(cardinal.quality).toContain('initiating');
      
      const fixed = getModalityInfo('Taurus');
      expect(fixed.modality).toBe('fixed');
      expect(fixed.quality).toContain('stable');
      
      const mutable = getModalityInfo('Gemini');
      expect(mutable.modality).toBe('mutable');
      expect(mutable.quality).toContain('adaptable');
    });
  });
  
  describe('getRuler', () => {
    it('should return the ruler of a sign', () => {
      expect(getRuler('Aries')).toBe('Mars');
      expect(getRuler('Taurus')).toBe('Venus');
      expect(getRuler('Gemini')).toBe('Mercury');
      expect(getRuler('Cancer')).toBe('Moon');
      expect(getRuler('Leo')).toBe('Sun');
    });
  });
  
  describe('getPlanetaryDignity', () => {
    it('should detect when a planet is in dignity', () => {
      const sunInLeo = getPlanetaryDignity('Sun', 'Leo');
      expect(sunInLeo.status).toBe('dignity');
      expect(sunInLeo.description).toContain('rulership');
      
      const moonInCancer = getPlanetaryDignity('Moon', 'Cancer');
      expect(moonInCancer.status).toBe('dignity');
    });
    
    it('should detect when a planet is in detriment', () => {
      const sunInAquarius = getPlanetaryDignity('Sun', 'Aquarius');
      expect(sunInAquarius.status).toBe('detriment');
      expect(sunInAquarius.description).toContain('challenges');
      
      const marsInLibra = getPlanetaryDignity('Mars', 'Libra');
      expect(marsInLibra.status).toBe('detriment');
    });
    
    it('should detect when a planet is in exaltation', () => {
      const sunInAries = getPlanetaryDignity('Sun', 'Aries');
      expect(sunInAries.status).toBe('exaltation');
      expect(sunInAries.description).toContain('enhanced');
      
      const venusInPisces = getPlanetaryDignity('Venus', 'Pisces');
      expect(venusInPisces.status).toBe('exaltation');
    });
    
    it('should detect when a planet is in fall', () => {
      const sunInLibra = getPlanetaryDignity('Sun', 'Libra');
      expect(sunInLibra.status).toBe('fall');
      expect(sunInLibra.description).toContain('subdued');
      
      const mercuryInPisces = getPlanetaryDignity('Mercury', 'Pisces');
      expect(mercuryInPisces.status).toBe('fall');
    });
    
    it('should handle neutral placements', () => {
      const sunInGemini = getPlanetaryDignity('Sun', 'Gemini');
      expect(sunInGemini.status).toBe('neutral');
      expect(sunInGemini.description).toContain('typical expression');
    });
  });
});