
import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  attachment?: {
    type: "image" | "pdf" | "text";
    name: string;
    url?: string;
    content?: string;
  };
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const fileUrl = isImage || isPdf ? URL.createObjectURL(file) : null;
  
  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-md mt-2 animate-fade-in shadow-sm">
      <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground">
        {isImage && (
          <div className="w-10 h-10 rounded bg-background overflow-hidden border border-border">
            <img src={fileUrl!} alt={file.name} className="w-full h-full object-cover" />
          </div>
        )}
        {isPdf && (
          <div className="w-10 h-10 rounded bg-background flex items-center justify-center text-muted-foreground border border-border">
            PDF
          </div>
        )}
        {!isImage && !isPdf && (
          <div className="w-10 h-10 rounded bg-background flex items-center justify-center text-muted-foreground border border-border">
            TXT
          </div>
        )}
        <span className="truncate max-w-[200px]">{file.name}</span>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full scale-up-button"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Listen for new-chat event
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setMessage("");
      setSelectedFile(null);
      setIsTyping(false);
      setIsAnalyzing(false);
    };
    
    window.addEventListener('new-chat', handleNewChat);
    
    return () => {
      window.removeEventListener('new-chat', handleNewChat);
    };
  }, []);

  // Simulate AI response
  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: `I received your message: "${userMessage}"${
          selectedFile ? ` and your ${selectedFile.type.startsWith("image/") ? "image" : "file"}: ${selectedFile.name}` : ""
        }`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedFile) {
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      attachment: selectedFile ? {
        type: selectedFile.type.startsWith("image/") 
          ? "image" 
          : selectedFile.type === "application/pdf" 
            ? "pdf" 
            : "text",
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
      } : undefined,
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    simulateAIResponse(message);
    setMessage("");
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload an image, PDF, or text file.");
      return;
    }
    
    setSelectedFile(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage(prev => prev + text);
      }
    } catch (err) {
      toast.error("Failed to paste text. Please paste manually.");
    }
  };
  
  const handleAnalyze = () => {
    if (!message.trim() && !selectedFile) {
      toast.error("Please provide text or upload a file to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      toast.success("Analysis complete!");
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages area */}
      <ScrollArea className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <h1 className="text-3xl font-bold mb-4 text-gradient">Welcome to the Chat</h1>
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
                  } fade-in-message`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto shadow-md"
                        : "bg-muted text-foreground shadow-sm"
                    } transition-all duration-300 hover:shadow-lg`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    
                    {msg.attachment && msg.attachment.type === "image" && msg.attachment.url && (
                      <div className="mt-2 rounded-lg overflow-hidden max-w-xs border border-border/30 animate-fade-in">
                        <img 
                          src={msg.attachment.url} 
                          alt={msg.attachment.name} 
                          className="w-full object-contain max-h-[200px]"
                        />
                      </div>
                    )}
                    
                    {msg.attachment && msg.attachment.type === "pdf" && (
                      <div className="mt-2 p-2 bg-background/50 rounded-lg flex items-center gap-2 text-xs border border-border/30 animate-fade-in">
                        <span>PDF: {msg.attachment.name}</span>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start fade-in-message">
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
      <div className="border-t p-4 sticky bottom-0 bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {selectedFile && (
            <FilePreview 
              file={selectedFile} 
              onRemove={() => setSelectedFile(null)} 
            />
          )}
          
          <div className="flex gap-2 mt-2">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-12 resize-none pr-10 shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors scale-up-button"
                onClick={triggerFileUpload}
                aria-label="Upload file"
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Upload file</span>
              </Button>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 shadow-md scale-up-button" 
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    size="icon" 
                    className="h-12 w-12 bg-purple-500 hover:bg-purple-600 text-white shadow-md scale-up-button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    aria-label="Analyze input"
                  >
                    {isAnalyzing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <BarChart2 className="h-5 w-5" />
                    )}
                    <span className="sr-only">Analyze</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Analyze your input</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePasteText}
              className="text-xs h-8 text-muted-foreground hover:text-foreground scale-up-button"
            >
              Paste from clipboard
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
