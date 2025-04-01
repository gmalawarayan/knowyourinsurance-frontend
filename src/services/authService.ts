
// Simple user information service

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isAuthenticated: boolean;
  createdAt: string;
}

let currentUser: User | null = null;

// Initialize user state from localStorage on load
const initUserFromStorage = () => {
  const storedUser = localStorage.getItem('insurance-policy-user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
};

// Call initialization when the module is first imported
initUserFromStorage();

// Set user information
export const setUserInfo = (name: string, email: string): User => {
  try {
    // Create a user with a random ID and timestamp
    const user: User = {
      id: `user-${Math.random().toString(36).substring(2, 15)}`,
      name,
      email,
      profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      isAuthenticated: true,
      createdAt: new Date().toISOString(),
    };
    
    // Save to localStorage
    localStorage.setItem('insurance-policy-user', JSON.stringify(user));
    currentUser = user;
    
    // Track this user in the analytics system
    import('@/services/analyticsService').then(analytics => {
      analytics.trackUniqueUser(user.id);
      console.log(`User tracked in analytics: ${user.name} (${user.email})`);
    });
    
    // Track user with Vercel Analytics
    // This will show up in your Vercel Analytics dashboard
    try {
      const trackEvent = new CustomEvent('vercel-analytics', { 
        detail: { 
          type: 'user-login',
          properties: {
            userId: user.id,
            userEmail: user.email,
            userName: user.name
          }
        } 
      });
      document.dispatchEvent(trackEvent);
    } catch (error) {
      console.error("Failed to track user with Vercel Analytics:", error);
    }
    
    return user;
  } catch (error) {
    console.error("Error setting user info:", error);
    throw new Error("Failed to save user information");
  }
};

// Clear user info
export const clearUserInfo = (): void => {
  localStorage.removeItem('insurance-policy-user');
  currentUser = null;
};

// Get current user
export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return currentUser !== null && currentUser.isAuthenticated;
};
