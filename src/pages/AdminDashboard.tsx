import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getUsageMetrics, 
  resetMetrics, 
  exportAnalyticsToCSV, 
  isAdmin,
  getAllUserDetails
} from "@/services/analyticsService";
import { 
  getCurrentUser,
  adminLogout,
  isAdminAuthenticated 
} from "@/services/authService";
import { 
  BarChart2, 
  File, 
  MessageSquare, 
  Users, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Calendar,
  Mail,
  Info,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ChatLayout from "@/components/layout/ChatLayout";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(getUsageMetrics());
  const [userDetails, setUserDetails] = useState(getAllUserDetails());
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  
  // Check if admin is authenticated
  if (!isAdminAuthenticated()) {
    navigate("/admin/login");
    return null;
  }
  
  const handleResetMetrics = () => {
    if (window.confirm("Are you sure you want to reset all analytics data? This cannot be undone.")) {
      const newMetrics = resetMetrics();
      setMetrics(newMetrics);
      setUserDetails([]);
      toast.success("Analytics data has been reset successfully");
    }
  };
  
  const handleExportCSV = () => {
    const csvContent = exportAnalyticsToCSV();
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `insurance-policy-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Analytics data exported successfully");
  };
  
  const handleLogout = () => {
    adminLogout();
    toast.info("Admin logged out successfully");
    navigate("/admin/login");
  };

  // Calculate percentage change (just for demonstration, mocking growth)
  const getRandomPercentage = () => {
    return (Math.random() * 30 + 5).toFixed(1);
  };
  
  return (
    <ChatLayout>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Analytics and management for AnalyzeYourInsurancePolicy service
            </p>
          </div>
          
          <div className="flex gap-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button onClick={handleExportCSV} variant="outline" className="flex gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                Export all analytics data and user details to a CSV file for offline analysis
              </HoverCardContent>
            </HoverCard>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button onClick={handleResetMetrics} variant="outline" className="flex gap-2" aria-label="Reset metrics">
                  <RefreshCw className="h-4 w-4" />
                  <span>Reset Data</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                Reset all analytics data and user details. This action cannot be undone.
              </HoverCardContent>
            </HoverCard>
            
            <Button onClick={handleLogout} variant="outline" className="flex gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
        
        {/* Dashboard cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total PDFs Uploaded
              </CardTitle>
              <File className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPdfsUploaded}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{getRandomPercentage()}% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Queries Asked
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalQueriesAsked}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{getRandomPercentage()}% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{getRandomPercentage()}% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Last Activity
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {new Date(metrics.lastUsed).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(metrics.lastUsed).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* User Details Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Information about users who have used the application</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No user data available yet
                    </TableCell>
                  </TableRow>
                ) : (
                  userDetails.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.firstSeen).toLocaleString()}</TableCell>
                      <TableCell>{new Date(user.lastSeen).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Analytics Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Detailed breakdown of system usage</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">PDFs Uploaded</TableCell>
                  <TableCell>{metrics.totalPdfsUploaded}</TableCell>
                  <TableCell>Total number of documents uploaded to the system</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Queries Asked</TableCell>
                  <TableCell>{metrics.totalQueriesAsked}</TableCell>
                  <TableCell>Total number of questions asked about documents</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Unique Users</TableCell>
                  <TableCell>{metrics.uniqueUsers}</TableCell>
                  <TableCell>Number of unique users who have used the system</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Queries Per PDF</TableCell>
                  <TableCell>
                    {metrics.totalPdfsUploaded === 0 
                      ? '0' 
                      : (metrics.totalQueriesAsked / metrics.totalPdfsUploaded).toFixed(2)}
                  </TableCell>
                  <TableCell>Average number of questions asked per document</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Queries Per User</TableCell>
                  <TableCell>
                    {metrics.uniqueUsers === 0 
                      ? '0' 
                      : (metrics.totalQueriesAsked / metrics.uniqueUsers).toFixed(2)}
                  </TableCell>
                  <TableCell>Average number of questions asked per user</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Last Activity</TableCell>
                  <TableCell>
                    {new Date(metrics.lastUsed).toLocaleDateString() + ' ' + 
                     new Date(metrics.lastUsed).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>Last time the system was used</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="text-sm text-center text-muted-foreground">
          <p>Analytics data is stored locally in your browser.</p>
          <p>For production use, consider implementing server-side analytics storage.</p>
        </div>
      </div>
    </ChatLayout>
  );
};

export default AdminDashboard;
