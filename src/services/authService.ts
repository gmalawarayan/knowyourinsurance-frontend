
// Simple authentication service

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isAuthenticated: boolean;
}

let currentUser: User | null = null;

// Initialize auth state from localStorage on load
const initAuthFromStorage = () => {
  const storedUser = localStorage.getItem('chatpdf-user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
};

// Call initialization when the module is first imported
initAuthFromStorage();

// Sign in with Google (mock implementation)
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // This is a mock implementation - in a real app, you would use Firebase Auth, Auth0, or similar
    
    // Simulate auth delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock user with a random ID
    const user: User = {
      id: `user-${Math.random().toString(36).substring(2, 15)}`,
      name: "Google User",
      email: "user@example.com",
      profilePicture: "https://ui-avatars.com/api/?name=Google+User&background=random",
      isAuthenticated: true,
    };
    
    // Save to localStorage
    localStorage.setItem('chatpdf-user', JSON.stringify(user));
    currentUser = user;
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw new Error("Failed to sign in with Google");
  }
};

// Sign out
export const signOut = (): void => {
  localStorage.removeItem('chatpdf-user');
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
