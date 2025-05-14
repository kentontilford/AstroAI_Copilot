import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import * as ephemeris from '@/lib/astrology/ephemeris';
import { mockNatalChart, mockTransitChart, mockCompositeChart } from '@/lib/test/mocks/astrology';
import { prismaMock } from '@/lib/test/mocks/db';
import { createMockRequest } from '@/lib/test/utils';
import { HouseSystem } from '@/lib/astrology/types';

// Mock the auth function
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn().mockReturnValue({ userId: 'user_123' }),
}));

// Mock the ephemeris functions
jest.mock('@/lib/astrology/ephemeris', () => ({
  calculateNatalChart: jest.fn().mockResolvedValue(mockNatalChart),
  calculateTransits: jest.fn().mockResolvedValue(mockTransitChart),
  calculateCompositeChart: jest.fn().mockResolvedValue(mockCompositeChart),
}));

describe('Astrology Chart API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET handler', () => {
    it('should return transits when no chart type is specified', async () => {
      // Create a request with no query parameters
      const request = createMockRequest({ 
        method: 'GET',
        url: 'http://localhost:3000/api/astrology/calculate-chart' 
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.calculation_type).toBe('transits');
      expect(ephemeris.calculateTransits).toHaveBeenCalled();
    });

    it('should return natal chart with appropriate parameters', async () => {
      // Mock the birth profile lookup
      prismaMock.birthProfile.findUnique.mockResolvedValue({
        id: 1,
        user_clerk_id: 'user_123',
        profile_name: 'Test Profile',
        date_of_birth: new Date('1990-01-01'),
        time_of_birth: new Date('1990-01-01T12:00:00Z'),
        is_time_unknown: false,
        birth_place: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      });
      
      // Create a request for a natal chart
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/astrology/calculate-chart?type=natal&profileId=1'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.calculation_type).toBe('natal');
      expect(ephemeris.calculateNatalChart).toHaveBeenCalled();
      expect(prismaMock.birthProfile.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
          user_clerk_id: 'user_123',
          deleted_at: null
        }
      });
    });

    it('should return 400 for invalid chart type', async () => {
      // Create a request with an invalid chart type
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/astrology/calculate-chart?type=invalid'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });

    it('should return 404 when profile is not found', async () => {
      // Mock the birth profile lookup to return null
      prismaMock.birthProfile.findUnique.mockResolvedValue(null);
      
      // Create a request for a natal chart with a non-existent profile
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/astrology/calculate-chart?type=natal&profileId=999'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST handler', () => {
    it('should calculate a chart with custom parameters', async () => {
      // Create a request body with custom chart parameters
      const requestBody = {
        type: 'natal',
        birthData: {
          date_of_birth: '1990-01-01',
          time_of_birth: '12:00:00',
          is_time_unknown: false,
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
        },
        options: {
          house_system: HouseSystem.PLACIDUS,
          with_aspects: true,
        },
      };
      
      const request = createMockRequest({
        method: 'POST',
        body: requestBody
      }) as unknown as NextRequest;
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.calculation_type).toBe('natal');
      expect(ephemeris.calculateNatalChart).toHaveBeenCalledWith(
        requestBody.birthData,
        requestBody.options
      );
    });

    it('should calculate composite chart with two birth datasets', async () => {
      // Create a request body for a composite chart
      const requestBody = {
        type: 'composite',
        birthDataA: {
          date_of_birth: '1990-01-01',
          time_of_birth: '12:00:00',
          is_time_unknown: false,
          latitude: 40.7128,
          longitude: -74.0060,
          timezone: 'America/New_York',
        },
        birthDataB: {
          date_of_birth: '1992-05-15',
          time_of_birth: '15:30:00',
          is_time_unknown: false,
          latitude: 34.0522,
          longitude: -118.2437,
          timezone: 'America/Los_Angeles',
        },
      };
      
      const request = createMockRequest({
        method: 'POST',
        body: requestBody
      }) as unknown as NextRequest;
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.calculation_type).toBe('composite');
      expect(ephemeris.calculateCompositeChart).toHaveBeenCalledWith(
        requestBody.birthDataA,
        requestBody.birthDataB,
        undefined // options
      );
    });

    it('should return 400 for invalid input data', async () => {
      // Create a request with invalid data (missing required fields)
      const requestBody = {
        type: 'natal',
        // Missing birthData
      };
      
      const request = createMockRequest({
        method: 'POST',
        body: requestBody
      }) as unknown as NextRequest;
      
      const response = await POST(request);
      
      expect(response.status).toBe(400);
    });
  });
});