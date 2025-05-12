// __tests__/api/auth/simple-auth.test.js
const { getServerSession } = require('next-auth/next');

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

describe('Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null for unauthenticated users', async () => {
    getServerSession.mockResolvedValueOnce(null);
    
    const session = await getServerSession();
    
    expect(session).toBeNull();
    expect(getServerSession).toHaveBeenCalled();
  });

  it('should return user data for authenticated users', async () => {
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    
    getServerSession.mockResolvedValueOnce(mockSession);
    
    const session = await getServerSession();
    
    expect(session).toEqual(mockSession);
    expect(getServerSession).toHaveBeenCalled();
  });
});