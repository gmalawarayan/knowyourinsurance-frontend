
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
    
    // Save user data to userDetails.txt file
    saveUserToFile(user);
    
    return user;
  } catch (error) {
    console.error("Error setting user info:", error);
    throw new Error("Failed to save user information");
  }
};

// Save user data to a file
const saveUserToFile = (user: User): void => {
  try {
    // In a browser environment, we can't directly write to the filesystem
    // So we'll simulate this by creating a downloadable file
    const userData = `
User Details:
--------------
ID: ${user.id}
Name: ${user.name}
Email: ${user.email}
Created: ${new Date(user.createdAt).toLocaleString()}
--------------
`;
    
    // Create a blob with the user data
    const blob = new Blob([userData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'userDetails.txt';
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log(`[Server] User information saved for ${user.name} (${user.email}) at ${user.createdAt}`);
  } catch (error) {
    console.error("Error saving user to file:", error);
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
