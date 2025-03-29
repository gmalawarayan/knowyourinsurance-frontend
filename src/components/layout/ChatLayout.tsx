
import React, { useState } from "react";
import { Menu, Plus, UserCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    // Clear the chat messages in the main area
    setMessages([]);
    // Dispatch a custom event that the ChatInterface can listen for
    window.dispatchEvent(new CustomEvent('new-chat'));
  };

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
              <span className="font-semibold text-lg">ChatPDF</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 shadow-sm scale-up-button" 
              onClick={handleNewChat}
            >
              <Plus size={18} />
              <span>New Chat</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-gray-300 shadow-sm hover:bg-muted scale-up-button"
            >
              <UserCircle2 size={18} />
              <span>Sign In</span>
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex-grow mt-2 overflow-y-auto">
            {/* Chat history or other sidebar content can go here */}
            <div className="py-3 px-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">About ChatPDF</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Upload PDF files up to 25MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ask questions about your documents</span>
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
    </div>
  );
};

export default ChatLayout;
