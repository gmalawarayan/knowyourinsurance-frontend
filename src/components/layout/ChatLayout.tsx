
import React, { useState } from "react";
import { Menu, Plus, UserCircle2, FileText, BarChart2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { clearUserInfo, getCurrentUser, isAuthenticated } from "@/services/authService";
import { trackUniqueUser, isAdmin } from "@/services/analyticsService";
import { toast } from "sonner";
import UsageMetricsDialog from "@/components/analytics/UsageMetricsDialog";
import { useNavigate } from "react-router-dom";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    // Clear the chat messages in the main area
    setMessages([]);
    // Dispatch a custom event that the ChatInterface can listen for
    window.dispatchEvent(new CustomEvent('new-chat'));
  };

  const handleSignOut = () => {
    clearUserInfo();
    setUser(null);
    toast.info("User information cleared");
  };

  const handleViewMetrics = () => {
    setMetricsOpen(true);
  };
  
  const goToAdminDashboard = () => {
    navigate("/admin");
  };

  // Check if user is admin
  const userIsAdmin = isAdmin(user);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden shadow-sm bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={toggleSidebar}
        aria-label="Toggle Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[20%] min-w-64 bg-[#F5F5F5] border-r border-border transition-transform duration-300 ease-in-out shadow-md",
          "md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-purple-600" />
              <span className="font-semibold text-lg">AnalyzeYourInsurancePolicy</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 shadow-sm scale-up-button" 
              onClick={handleNewChat}
            >
              <Plus size={18} />
              <span>New Analysis</span>
            </Button>
            
            {user && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <UserCircle2 size={24} className="text-primary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 border-gray-300 shadow-sm hover:bg-muted scale-up-button"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  <span>Clear User Info</span>
                </Button>
              </>
            )}
            
            {/* Only show analytics options to admins */}
            {userIsAdmin && (
              <>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 border-gray-300 shadow-sm hover:bg-muted scale-up-button"
                  onClick={handleViewMetrics}
                >
                  <BarChart2 size={18} />
                  <span>Quick Analytics</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 border-gray-300 shadow-sm hover:bg-muted scale-up-button"
                  onClick={goToAdminDashboard}
                >
                  <BarChart2 size={18} />
                  <span>Admin Dashboard</span>
                </Button>
              </>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex-grow mt-2 overflow-y-auto">
            {/* Chat history or other sidebar content can go here */}
            <div className="py-3 px-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">About AnalyzeYourInsurancePolicy</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Upload insurance policy PDF files up to 25MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ask questions about your policy documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Get instant, accurate responses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main 
        className={cn(
          "flex-1 ml-0 md:ml-[20%] transition-all duration-300",
          "min-h-screen"
        )}
      >
        {children}
      </main>
      
      {/* Analytics Dialog - will only be shown if metrics open is true */}
      <UsageMetricsDialog open={metricsOpen} onOpenChange={setMetricsOpen} />
    </div>
  );
};

export default ChatLayout;
