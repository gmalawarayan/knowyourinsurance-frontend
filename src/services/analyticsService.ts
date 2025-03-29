
// Simple analytics service to track usage metrics

interface UsageMetrics {
  totalPdfsUploaded: number;
  totalQueriesAsked: number;
  uniqueUsers: number;
  lastUsed: Date;
}

// Get stored metrics from localStorage
export const getUsageMetrics = (): UsageMetrics => {
  const storedMetrics = localStorage.getItem('chatpdf-metrics');
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
  localStorage.setItem('chatpdf-metrics', JSON.stringify(metrics));
  return metrics;
};

// Track query asked
export const trackQueryAsked = () => {
  const metrics = getUsageMetrics();
  metrics.totalQueriesAsked += 1;
  metrics.lastUsed = new Date();
  localStorage.setItem('chatpdf-metrics', JSON.stringify(metrics));
  return metrics;
};

// Track unique user (should be called after authentication)
export const trackUniqueUser = (userId: string) => {
  const metrics = getUsageMetrics();
  // Store unique users in a separate storage to avoid duplicates
  const uniqueUsersKey = 'chatpdf-unique-users';
  const uniqueUsers = JSON.parse(localStorage.getItem(uniqueUsersKey) || '[]');
  
  if (!uniqueUsers.includes(userId)) {
    uniqueUsers.push(userId);
    localStorage.setItem(uniqueUsersKey, JSON.stringify(uniqueUsers));
    metrics.uniqueUsers = uniqueUsers.length;
    metrics.lastUsed = new Date();
    localStorage.setItem('chatpdf-metrics', JSON.stringify(metrics));
  }
  
  return metrics;
};

// Check if user is admin (for analytics access)
export const isAdmin = (user: { id: string; email: string } | null): boolean => {
  if (!user) return false;
  
  // This is a simple check. In a real app, you'd have a more robust admin check
  // For example, checking against a list of admin emails or admin role in user profile
  const adminEmails = ['admin@example.com'];
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
  localStorage.setItem('chatpdf-metrics', JSON.stringify(emptyMetrics));
  localStorage.removeItem('chatpdf-unique-users');
  return emptyMetrics;
};
