const request = require('supertest');
const app = require('./server');

// Using 'mock' prefix for the variable to allow its use in jest.mock
const mockConfig = {
  shouldFail: false
};

// Mocking @google/generative-ai
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          // Use late evaluation to check mockConfig.shouldFail
          if (require('./server.test.js').mockConfig.shouldFail) {
            throw new Error('Test error');
          }
          return {
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: () => 'Mocked AI response'
              }
            })
          };
        })
      };
    })
  };
});

// Export mockConfig so it can be required in the mock
module.exports.mockConfig = mockConfig;

describe('POST /api/generate', () => {
  beforeEach(() => {
    mockConfig.shouldFail = false;
  });

  it('should return mocked AI response', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send({ prompt: 'Hello Gemini' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('text', 'Mocked AI response');
  });

  it('should return 500 on error', async () => {
    mockConfig.shouldFail = true;
    const res = await request(app)
      .post('/api/generate')
      .send({ prompt: 'Fail me' });
    
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Failed to generate content');
  });
});
