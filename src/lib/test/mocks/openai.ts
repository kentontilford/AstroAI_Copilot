import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import OpenAI from 'openai';

// Mock OpenAI client
export const openaiMock = mockDeep<OpenAI>() as unknown as DeepMockProxy<OpenAI>;

// Mock the OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => openaiMock);
});

// Function to reset all mocks before each test
export function resetOpenAIMocks() {
  mockReset(openaiMock);
}

/**
 * Mock dashboard insight response
 */
export const mockDashboardInsight = {
  title: 'Your Cosmic Potential',
  summary_text: 'Your Sun in Leo gives you natural leadership abilities and creative talents that are highlighted by the current Jupiter transit.',
  modal_interpretation: 'With your Sun in Leo, you have a natural charisma and creative drive. Currently, Jupiter is making a favorable trine aspect to your Sun, expanding your opportunities for self-expression and personal growth. This is an excellent time to pursue creative projects, take on leadership roles, or step into the spotlight in some way. Your confidence is enhanced now, and others are likely to respond positively to your authentic self-expression.',
};

/**
 * Mock favorability rating response
 */
export const mockFavorabilityRating = {
  area: 'love',
  rating: 7,
  explanation: 'Venus is currently in a favorable position relative to your natal chart, creating opportunities for connection and romance.',
};

/**
 * Mock chat message from OpenAI
 */
export const mockAIMessage = {
  id: 'msg_test123',
  object: 'thread.message',
  created_at: Math.floor(Date.now() / 1000),
  thread_id: 'thread_test123',
  role: 'assistant',
  content: [
    {
      type: 'text',
      text: {
        value: 'Based on your birth chart, your Sun in Leo suggests you have a natural flair for leadership and creativity. The current transit of Jupiter through Taurus is creating opportunities for financial growth and stability in your life.',
        annotations: [],
      },
    },
  ],
};

/**
 * Mock thread creation response
 */
export const mockThread = {
  id: 'thread_test123',
  object: 'thread',
  created_at: Math.floor(Date.now() / 1000),
  metadata: {},
};

/**
 * Configure standard OpenAI mock responses
 */
export function setupOpenAIMocks() {
  // Mock creating a thread
  openaiMock.beta.threads.create.mockResolvedValue(mockThread);
  
  // Mock creating a message in a thread
  openaiMock.beta.threads.messages.create.mockResolvedValue(mockAIMessage);
  
  // Mock listing messages in a thread
  openaiMock.beta.threads.messages.list.mockResolvedValue({
    object: 'list',
    data: [mockAIMessage],
    first_id: mockAIMessage.id,
    last_id: mockAIMessage.id,
    has_more: false,
  });
  
  // Mock creating a run
  openaiMock.beta.threads.runs.create.mockResolvedValue({
    id: 'run_test123',
    object: 'thread.run',
    created_at: Math.floor(Date.now() / 1000),
    thread_id: 'thread_test123',
    status: 'completed',
    started_at: Math.floor(Date.now() / 1000),
    completed_at: Math.floor(Date.now() / 1000),
    assistant_id: 'asst_test123',
    model: 'gpt-4',
    instructions: null,
    tools: [],
    metadata: {},
  });
  
  // Mock retrieving a run
  openaiMock.beta.threads.runs.retrieve.mockResolvedValue({
    id: 'run_test123',
    object: 'thread.run',
    created_at: Math.floor(Date.now() / 1000),
    thread_id: 'thread_test123',
    status: 'completed',
    started_at: Math.floor(Date.now() / 1000),
    completed_at: Math.floor(Date.now() / 1000),
    assistant_id: 'asst_test123',
    model: 'gpt-4',
    instructions: null,
    tools: [],
    metadata: {},
  });
}