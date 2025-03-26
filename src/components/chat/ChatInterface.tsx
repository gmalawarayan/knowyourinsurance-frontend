
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate AI response
  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: `I received your message: "${userMessage}"`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "user",
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      simulateAIResponse(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages area */}
      <ScrollArea className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Welcome to the Chat</h1>
              <p className="text-muted-foreground">
                Start typing or upload a file to begin...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted text-foreground"
                    } shadow-sm`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-muted text-foreground shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse animation-delay-200"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-pulse animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>
      
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
