// Simple analytics service to track usage metrics

interface UsageMetrics {
  totalPdfsUploaded: number;
  totalQueriesAsked: number;
  uniqueUsers: number;
  lastUsed: Date;
}

interface UserDetail {
  id: string;
  name: string;
  email: string;
  firstSeen: string;
  lastSeen: string;
}

// Get stored metrics from localStorage
export const getUsageMetrics = (): UsageMetrics => {
  const storedMetrics = localStorage.getItem('insurance-policy-metrics');
  if (storedMetrics) {
    const metrics = JSON.parse(storedMetrics);
    // Convert string date back to Date object
    metrics.lastUsed = new Date(metrics.lastUsed);
    return metrics;
  }
  
  // Default initial metrics
  return {
    totalPdfsUploaded: 0,
    totalQueriesAsked: 0,
    uniqueUsers: 0,
    lastUsed: new Date()
  };
};

// Track PDF upload
export const trackPdfUpload = () => {
  const metrics = getUsageMetrics();
  metrics.totalPdfsUploaded += 1;
  metrics.lastUsed = new Date();
  localStorage.setItem('insurance-policy-metrics', JSON.stringify(metrics));
  return metrics;
};

// Track query asked
export const trackQueryAsked = () => {
  const metrics = getUsageMetrics();
  metrics.totalQueriesAsked += 1;
  metrics.lastUsed = new Date();
  localStorage.setItem('insurance-policy-metrics', JSON.stringify(metrics));
  return metrics;
};

// Track unique user with detailed information
export const trackUniqueUser = (userId: string) => {
  const metrics = getUsageMetrics();
  
  // Get user details from auth service
  import('@/services/authService').then(authService => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Store user details in a separate storage with more information
      const userDetailsKey = 'insurance-policy-user-details';
      const userDetails: UserDetail[] = JSON.parse(localStorage.getItem(userDetailsKey) || '[]');
      
      const existingUserIndex = userDetails.findIndex(user => user.id === userId);
      const now = new Date().toISOString();
      
      if (existingUserIndex === -1) {
        // New user - add to the list
        userDetails.push({
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          firstSeen: now,
          lastSeen: now
        });
      } else {
        // Existing user - update last seen
        userDetails[existingUserIndex].lastSeen = now;
      }
      
      localStorage.setItem(userDetailsKey, JSON.stringify(userDetails));
    }
  });
  
  // Update basic metrics as before
  const uniqueUsersKey = 'insurance-policy-unique-users';
  const uniqueUsers = JSON.parse(localStorage.getItem(uniqueUsersKey) || '[]');
  
  if (!uniqueUsers.includes(userId)) {
    uniqueUsers.push(userId);
    localStorage.setItem(uniqueUsersKey, JSON.stringify(uniqueUsers));
    metrics.uniqueUsers = uniqueUsers.length;
    metrics.lastUsed = new Date();
    localStorage.setItem('insurance-policy-metrics', JSON.stringify(metrics));
  }
  
  return metrics;
};

// Get list of unique user IDs
export const getUniqueUserIds = (): string[] => {
  const uniqueUsersKey = 'insurance-policy-unique-users';
  return JSON.parse(localStorage.getItem(uniqueUsersKey) || '[]');
};

// Get detailed information about all users
export const getAllUserDetails = (): UserDetail[] => {
  const userDetailsKey = 'insurance-policy-user-details';
  return JSON.parse(localStorage.getItem(userDetailsKey) || '[]');
};

// Check if user is admin (for analytics access)
export const isAdmin = (user: { id: string; email: string } | null): boolean => {
  if (!user) return false;
  
  // Updated admin emails list
  const adminEmails = [
    'admin@example.com', 
    'your.email@example.com', 
    'admin@chatpdf.com'
  ];
  return adminEmails.includes(user.email);
};

// Reset metrics (for admin purposes)
export const resetMetrics = () => {
  const emptyMetrics = {
    totalPdfsUploaded: 0,
    totalQueriesAsked: 0,
    uniqueUsers: 0,
    lastUsed: new Date()
  };
  localStorage.setItem('insurance-policy-metrics', JSON.stringify(emptyMetrics));
  localStorage.removeItem('insurance-policy-unique-users');
  localStorage.removeItem('insurance-policy-user-details');
  return emptyMetrics;
};

// Export analytics data to CSV
export const exportAnalyticsToCSV = (): string => {
  const metrics = getUsageMetrics();
  const userDetails = getAllUserDetails();
  
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add metrics data
  csvContent += "Metric,Value\n";
  csvContent += `Total PDFs Uploaded,${metrics.totalPdfsUploaded}\n`;
  csvContent += `Total Queries Asked,${metrics.totalQueriesAsked}\n`;
  csvContent += `Unique Users,${metrics.uniqueUsers}\n`;
  csvContent += `Last Used Date,${metrics.lastUsed.toISOString()}\n\n`;
  
  // Add user details if available
  if (userDetails.length > 0) {
    csvContent += "User ID,Name,Email,First Seen,Last Seen\n";
    userDetails.forEach(user => {
      csvContent += `${user.id},${user.name},${user.email},${user.firstSeen},${user.lastSeen}\n`;
    });
  }
  
  return csvContent;
};
