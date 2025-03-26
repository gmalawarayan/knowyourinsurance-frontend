
import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages area */}
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Welcome message */}
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Chat</h1>
            <p className="text-muted-foreground">
              Start a new conversation or continue where you left off.
            </p>
          </div>
          
          {/* Chat messages would be displayed here */}
          {/* This is just a placeholder */}
          <div className="space-y-4">
            {/* Example message bubbles can be added here */}
          </div>
        </div>
      </div>
      
      {/* Message input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-12 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" size="icon" className="h-12 w-12">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
