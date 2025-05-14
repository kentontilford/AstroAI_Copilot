import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Create mock Prisma client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Mock the Prisma client module
jest.mock('@/lib/db/prisma', () => ({
  prisma: prismaMock,
}));

// Function to reset all mocks before each test
export function resetPrismaMocks() {
  mockReset(prismaMock);
}

/**
 * Mock birth profile data for testing
 */
export const mockBirthProfile = {
  id: 1,
  user_clerk_id: 'user_test123',
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
};

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 1,
  clerk_user_id: 'user_test123',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  profile_image_url: 'https://example.com/avatar.jpg',
  subscription_status: 'ACTIVE',
  trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  stripe_customer_id: 'cus_test123',
  stripe_subscription_id: 'sub_test123',
  current_subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  role: 'user',
  is_verified: true,
  default_solo_profile_id: 1,
  default_relationship_profile_a_id: null,
  default_relationship_profile_b_id: null,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

/**
 * Mock chat thread data for testing
 */
export const mockChatThread = {
  id: 1,
  user_clerk_id: 'user_test123',
  openai_thread_id: 'thread_test123',
  title: 'Test Chat Thread',
  active_dashboard_context: 'PERSONAL_GROWTH',
  created_at: new Date(),
  updated_at: new Date(),
  last_message_at: new Date(),
  deleted_at: null,
};

/**
 * Mock chat message data for testing
 */
export const mockChatMessage = {
  id: 1,
  thread_id: 1,
  role: 'user',
  content: 'This is a test message',
  created_at: new Date(),
  deleted_at: null,
};