import { NextRequest } from 'next/server';
import { GET } from './route';
import { createMockRequest } from '@/lib/test/utils';
import { prismaMock } from '@/lib/test/mocks/db';
import * as ephemeris from '@/lib/astrology/ephemeris';
import * as assistant from '@/lib/openai/assistant';
import { mockNatalChart, mockTransitChart, mockCompositeChart } from '@/lib/test/mocks/astrology';
import { mockDashboardInsight, mockFavorabilityRating } from '@/lib/test/mocks/openai';

// Mock the auth function
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn().mockReturnValue({ userId: 'user_123' }),
}));

// Mock the astrology functions
jest.mock('@/lib/astrology/ephemeris', () => ({
  calculateNatalChart: jest.fn().mockResolvedValue(mockNatalChart),
  calculateTransits: jest.fn().mockResolvedValue(mockTransitChart),
  calculateCompositeChart: jest.fn().mockResolvedValue(mockCompositeChart),
}));

// Mock the OpenAI assistant functions
jest.mock('@/lib/openai/assistant', () => ({
  generateDashboardInsight: jest.fn().mockResolvedValue({
    title: 'Your Cosmic Potential',
    summary_text: 'Summary of cosmic potential',
    modal_interpretation: 'Detailed interpretation goes here',
  }),
  generateFavorabilityRating: jest.fn().mockResolvedValue({
    rating: 7,
    explanation: 'Explanation of the rating',
  }),
}));

// Mock the subscription check
jest.mock('@/lib/subscription/check-subscription', () => ({
  checkUserSubscription: jest.fn().mockResolvedValue({
    isSubscribed: true,
    status: 'ACTIVE',
    trialEndsAt: null,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }),
}));

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Personal Growth Dashboard', () => {
    it('should return personal growth dashboard data', async () => {
      // Mock user with default solo profile
      prismaMock.user.findUnique.mockResolvedValue({
        clerk_user_id: 'user_123',
        default_solo_profile_id: 1,
        default_solo_profile: {
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
        }
      });
      
      // Create request for personal growth dashboard
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=personal_growth'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.dashboardType).toBe('personal_growth');
      expect(data.welcomeMessage).toContain('Test Profile');
      expect(data.natalPlacements).toBeDefined();
      expect(data.transitPlacements).toBeDefined();
      expect(data.birthChartInsightCard).toBeDefined();
      expect(data.transitOpportunityCard).toBeDefined();
      expect(data.favorabilityRatings).toHaveLength(6); // Should have 6 areas
      
      // Verify correct astrology calculations were called
      expect(ephemeris.calculateNatalChart).toHaveBeenCalled();
      expect(ephemeris.calculateTransits).toHaveBeenCalled();
      expect(ephemeris.calculateCompositeChart).not.toHaveBeenCalled();
      
      // Verify AI generation functions were called
      expect(assistant.generateDashboardInsight).toHaveBeenCalledTimes(2);
      expect(assistant.generateFavorabilityRating).toHaveBeenCalledTimes(6);
    });

    it('should return 404 if user has no default solo profile', async () => {
      // Mock user with no default solo profile
      prismaMock.user.findUnique.mockResolvedValue({
        clerk_user_id: 'user_123',
        default_solo_profile_id: null,
        default_solo_profile: null
      });
      
      // Create request for personal growth dashboard
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=personal_growth'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(404);
    });
  });

  describe('Relationships Dashboard', () => {
    it('should return relationships dashboard data', async () => {
      // Mock user with default relationship profiles
      prismaMock.user.findUnique.mockResolvedValue({
        clerk_user_id: 'user_123',
        default_relationship_profile_a_id: 1,
        default_relationship_profile_b_id: 2,
        default_relationship_profile_a: {
          id: 1,
          user_clerk_id: 'user_123',
          profile_name: 'Profile A',
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
        },
        default_relationship_profile_b: {
          id: 2,
          user_clerk_id: 'user_123',
          profile_name: 'Profile B',
          date_of_birth: new Date('1992-05-15'),
          time_of_birth: new Date('1992-05-15T15:30:00Z'),
          is_time_unknown: false,
          birth_place: 'Los Angeles, CA',
          birth_latitude: 34.0522,
          birth_longitude: -118.2437,
          birth_timezone: 'America/Los_Angeles',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        }
      });
      
      // Create request for relationships dashboard
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=relationships'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.dashboardType).toBe('relationships');
      expect(data.welcomeMessage).toContain('Profile A & Profile B');
      expect(data.compositePlacements).toBeDefined();
      expect(data.transitPlacements).toBeDefined();
      expect(data.compositeSynergyCard).toBeDefined();
      expect(data.relationalTransitCard).toBeDefined();
      expect(data.favorabilityRatings).toHaveLength(6); // Should have 6 areas
      
      // Verify correct astrology calculations were called
      expect(ephemeris.calculateCompositeChart).toHaveBeenCalled();
      expect(ephemeris.calculateTransits).toHaveBeenCalled();
      expect(ephemeris.calculateNatalChart).not.toHaveBeenCalled();
      
      // Verify AI generation functions were called
      expect(assistant.generateDashboardInsight).toHaveBeenCalledTimes(2);
      expect(assistant.generateFavorabilityRating).toHaveBeenCalledTimes(6);
    });

    it('should return 404 if user has no default relationship profiles', async () => {
      // Mock user with missing relationship profiles
      prismaMock.user.findUnique.mockResolvedValue({
        clerk_user_id: 'user_123',
        default_relationship_profile_a_id: 1,
        default_relationship_profile_b_id: null,
        default_relationship_profile_a: {
          id: 1,
          user_clerk_id: 'user_123',
          profile_name: 'Profile A',
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
        },
        default_relationship_profile_b: null
      });
      
      // Create request for relationships dashboard
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=relationships'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid dashboard type', async () => {
      // Create request with invalid dashboard type
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=invalid'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });

    it('should return 401 for unauthenticated requests', async () => {
      // Mock unauthenticated user
      require('@clerk/nextjs').auth.mockReturnValueOnce({ userId: null });
      
      // Create request
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=personal_growth'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return 402 for users without subscription', async () => {
      // Mock subscription check to return not subscribed
      require('@/lib/subscription/check-subscription').checkUserSubscription.mockResolvedValueOnce({
        isSubscribed: false,
        status: 'LAPSED',
      });
      
      // Create request
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=personal_growth'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(402);
    });

    it('should handle astrology calculation errors', async () => {
      // Mock user with default solo profile
      prismaMock.user.findUnique.mockResolvedValue({
        clerk_user_id: 'user_123',
        default_solo_profile_id: 1,
        default_solo_profile: {
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
        }
      });
      
      // Mock calculation error
      ephemeris.calculateNatalChart.mockRejectedValueOnce(new Error('Calculation error'));
      
      // Create request
      const request = createMockRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/dashboard?type=personal_growth'
      }) as unknown as NextRequest;
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
    });
  });
});