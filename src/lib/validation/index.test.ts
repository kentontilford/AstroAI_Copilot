import { birthDataSchema, validateRequest } from './index';

describe('Validation utilities', () => {
  describe('birthDataSchema', () => {
    it('should validate valid birth data', () => {
      const validData = {
        profile_name: 'Test Profile',
        date_of_birth: '1990-01-01',
        time_of_birth: '12:00',
        place_of_birth: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      };
      
      const result = birthDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should fail on invalid date format', () => {
      const invalidData = {
        profile_name: 'Test Profile',
        date_of_birth: '01/01/1990',  // Invalid format, should be YYYY-MM-DD
        time_of_birth: '12:00',
        place_of_birth: 'New York, NY',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
      };
      
      const result = birthDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
    
    it('should accept null for optional fields', () => {
      const validData = {
        profile_name: 'Test Profile',
        date_of_birth: '1990-01-01',
        time_of_birth: null,
        place_of_birth: null,
        latitude: null,
        longitude: null,
        timezone: 'America/New_York',
      };
      
      const result = birthDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should validate latitude and longitude limits', () => {
      const invalidData = {
        profile_name: 'Test Profile',
        date_of_birth: '1990-01-01',
        time_of_birth: '12:00',
        place_of_birth: 'New York, NY',
        latitude: 95,  // Invalid: must be between -90 and 90
        longitude: -74.0060,
        timezone: 'America/New_York',
      };
      
      const result = birthDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
  
  describe('validateRequest', () => {
    it('should validate a valid request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          profile_name: 'Test Profile',
          date_of_birth: '1990-01-01',
        }),
      } as unknown as Request;
      
      const result = await validateRequest(mockRequest, birthDataSchema);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.profile_name).toBe('Test Profile');
      }
    });
    
    it('should return an error for an invalid request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          profile_name: '',  // Invalid: must be at least 1 character
          date_of_birth: '1990-01-01',
        }),
      } as unknown as Request;
      
      const result = await validateRequest(mockRequest, birthDataSchema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation error');
      }
    });
    
    it('should handle JSON parsing errors', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Request;
      
      const result = await validateRequest(mockRequest, birthDataSchema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed to parse request body');
      }
    });
  });
});