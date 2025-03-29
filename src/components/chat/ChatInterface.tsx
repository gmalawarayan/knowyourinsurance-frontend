import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, BarChart2, FileText } from "lucide-react";
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
import { uploadPdfToChatPDF, sendMessageToChatPDF, deletePdfSource } from "@/services/chatPdfService";
import { trackPdfUpload, trackQueryAsked } from "@/services/analyticsService";

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

interface ChatPDFSource {
  sourceId: string;
  fileName: string;
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
  const [activePdfSource, setActivePdfSource] = useState<ChatPDFSource | null>(null);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    const handleNewChat = () => {
      if (activePdfSource) {
        deletePdfSource(activePdfSource.sourceId)
          .then(() => console.log("PDF source deleted"))
          .catch((error) => console.error("Failed to delete PDF source:", error));
      }
      
      setMessages([]);
      setMessage("");
      setSelectedFile(null);
      setIsTyping(false);
      setIsAnalyzing(false);
      setActivePdfSource(null);
      setIsPdfMode(false);
    };
    
    window.addEventListener('new-chat', handleNewChat);
    
    return () => {
      window.removeEventListener('new-chat', handleNewChat);
      
      if (activePdfSource) {
        deletePdfSource(activePdfSource.sourceId)
          .catch((error) => console.error("Failed to delete PDF source:", error));
      }
    };
  }, [activePdfSource]);

  const processPdfFile = async (file: File, userQuery: string) => {
    setIsAnalyzing(true);
    
    try {
      const source = await uploadPdfToChatPDF(file);
      
      if (!source) {
        toast.error("Failed to upload PDF. Please try again.");
        setIsAnalyzing(false);
        return;
      }
      
      trackPdfUpload();
      
      setActivePdfSource(source);
      setIsPdfMode(true);
      
      const systemMessage: Message = {
        id: Date.now().toString() + "-system",
        content: `PDF "${file.name}" uploaded successfully. You can now ask questions about this document.`,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      
      if (userQuery.trim()) {
        processMessageWithChatPDF(source.sourceId, userQuery);
      } else {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const processMessageWithChatPDF = async (sourceId: string, userMessage: string) => {
    setIsTyping(true);
    
    try {
      trackQueryAsked();
      
      const response = await sendMessageToChatPDF(sourceId, userMessage);
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting response from ChatPDF:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: `I received your message: "${userMessage}"${
          selectedFile && !isPdfMode ? ` and your ${selectedFile.type.startsWith("image/") ? "image" : "file"}: ${selectedFile.name}` : ""
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
    
    if (isPdfMode && activePdfSource) {
      processMessageWithChatPDF(activePdfSource.sourceId, message);
    } else if (selectedFile && selectedFile.type === "application/pdf") {
      processPdfFile(selectedFile, message);
    } else {
      simulateAIResponse(message);
    }
    
    setMessage("");
    setSelectedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size is 25MB.");
      return;
    }
    
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload an image, PDF, or text file.");
      return;
    }
    
    setSelectedFile(file);
    
    if (file.type === "application/pdf") {
      toast.info("PDF detected! Click Analyze to process with ChatPDF or Send to upload as attachment.");
    }
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
    if (!selectedFile) {
      toast.error("Please upload a PDF file to analyze");
      return;
    }
    
    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files can be analyzed with ChatPDF");
      return;
    }
    
    setIsAnalyzing(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: "I'd like to analyze this PDF.",
      sender: "user",
      timestamp: new Date(),
      attachment: {
        type: "pdf",
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
      },
    };
    
    setMessages(prev => [...prev, userMessage]);
    processPdfFile(selectedFile, "");
  };

  return (
    <div className="flex flex-col h-screen">
      <ScrollArea className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <h1 className="text-3xl font-bold mb-4 text-gradient">Welcome to ChatPDF</h1>
              <p className="text-muted-foreground mb-6">
                Upload a PDF document and ask questions about it.
              </p>
              <div className="max-w-md mx-auto bg-muted p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="font-medium">How to use:</span>
                </div>
                <ol className="list-decimal pl-6 space-y-2 text-sm text-left text-muted-foreground">
                  <li>Click the paperclip icon to upload a PDF document</li>
                  <li>Click the purple "Analyze" button to process the PDF</li>
                  <li>Ask questions about the document in the chat</li>
                </ol>
              </div>
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
                        <FileText className="h-3 w-3" />
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
      
      <div className="border-t p-4 sticky bottom-0 bg-background/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {selectedFile && (
            <FilePreview 
              file={selectedFile} 
              onRemove={() => setSelectedFile(null)} 
            />
          )}
          
          {isPdfMode && activePdfSource && (
            <div className="flex items-center gap-2 p-2 bg-purple-100 rounded-md mt-2 mb-2 animate-fade-in text-sm">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-purple-800 font-medium">
                ChatPDF active: {activePdfSource.fileName}
              </span>
            </div>
          )}
          
          <div className="flex gap-2 mt-2">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isPdfMode ? "Ask a question about your PDF..." : "Type your message here..."}
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
                    disabled={isAnalyzing || !selectedFile || selectedFile.type !== "application/pdf"}
                    aria-label="Analyze PDF"
                  >
                    {isAnalyzing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <BarChart2 className="h-5 w-5" />
                    )}
                    <span className="sr-only">Analyze PDF</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Analyze your PDF</p>
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
