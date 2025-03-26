
import React, { useState } from "react";
import { Menu, Plus, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[20%] min-w-64 bg-sidebar border-r border-border transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex flex-col gap-2">
            <Button className="w-full justify-start gap-2">
              <Plus size={18} />
              <span>New Chat</span>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-2">
              <UserCircle2 size={18} />
              <span>Sign In</span>
            </Button>
          </div>
          
          <div className="flex-grow mt-6">
            {/* Chat history or other sidebar content can go here */}
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
    </div>
  );
};

export default ChatLayout;
