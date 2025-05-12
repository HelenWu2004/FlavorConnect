// useAuth.test.js
const { useSession, signOut } = require('next-auth/react');

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

const useAuth = () => {
  const { data: session, status } = useSession();
  
  return {
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user || null,
    logout: signOut
  };
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state when session is loading', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    const result = useAuth();
    
    expect(result.isLoading).toBe(true);
    expect(result.isAuthenticated).toBe(false);
    expect(result.user).toBe(null);
  });

  it('returns authenticated state for logged in users', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
    };
    
    useSession.mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated',
    });

    const result = useAuth();
    
    expect(result.isLoading).toBe(false);
    expect(result.isAuthenticated).toBe(true);
    expect(result.user).toEqual(mockUser);
  });

  it('returns unauthenticated state for logged out users', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const result = useAuth();
    
    expect(result.isLoading).toBe(false);
    expect(result.isAuthenticated).toBe(false);
    expect(result.user).toBe(null);
  });

  it('calls signOut when logout is triggered', () => {
    useSession.mockReturnValue({
      data: { user: {} },
      status: 'authenticated',
    });

    const result = useAuth();
    
    result.logout();
    
    expect(signOut).toHaveBeenCalled();
  });
});