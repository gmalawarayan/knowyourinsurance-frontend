
import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, FileText, Camera } from "lucide-react";
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
import { uploadPdfToAnalyzer, sendMessageToAnalyzer, deletePdfSource } from "@/services/chatPdfService";
import { trackPdfUpload, trackQueryAsked, trackUniqueUser } from "@/services/analyticsService";
import { setUserInfo, getCurrentUser } from "@/services/authService";
import UserInfoDialog from "./UserInfoDialog";
import PhotoCapture from "./PhotoCapture";

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
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [pendingSummaryResponse, setPendingSummaryResponse] = useState<string | null>(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
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
      setPendingSummaryResponse(null);
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

  useEffect(() => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      processPdfFile(selectedFile);
    }
  }, [selectedFile]);

  const processPdfFile = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      const source = await uploadPdfToAnalyzer(file);
      
      if (!source) {
        toast.error("Failed to upload PDF. Please try again.");
        setIsAnalyzing(false);
        return;
      }
      
      trackPdfUpload();
      
      setActivePdfSource(source);
      setIsPdfMode(true);
      
      const userMessage: Message = {
        id: Date.now().toString() + "-user",
        content: "I've uploaded an insurance policy document.",
        sender: "user",
        timestamp: new Date(),
        attachment: {
          type: "pdf",
          name: file.name,
          url: URL.createObjectURL(file),
        },
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      const initialPrompt = `Please provide a brief summary of what this insurance policy document contains.`;
      const summaryResponse = await processMessageWithAnalyzer(source.sourceId, initialPrompt, false);
      
      if (!getCurrentUser() && summaryResponse) {
        setPendingSummaryResponse(summaryResponse);
        setShowUserInfoDialog(true);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const processMessageWithAnalyzer = async (sourceId: string, userMessage: string, addUserMessage = true): Promise<string | undefined> => {
    setIsTyping(true);
    
    try {
      if (addUserMessage) {
        const newUserMessage: Message = {
          id: Date.now().toString() + "-user-message",
          content: userMessage,
          sender: "user",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        setMessage("");
      }
      
      trackQueryAsked();
      
      const response = await sendMessageToAnalyzer(sourceId, userMessage);
      
      if (!addUserMessage && !getCurrentUser()) {
        return response;
      }
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      return response;
    } catch (error) {
      console.error("Error getting response from analyzer:", error);
      toast.error("Failed to get response. Please try again.");
      return undefined;
    } finally {
      setIsTyping(false);
      setIsAnalyzing(false);
    }
  };

  const handleUserInfoSubmit = (name: string, email: string) => {
    const user = setUserInfo(name, email);
    trackUniqueUser(user.id);
    
    console.log(`User information saved: ${name}, ${email}`);
    
    setShowUserInfoDialog(false);
    
    if (pendingSummaryResponse && activePdfSource) {
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: pendingSummaryResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setPendingSummaryResponse(null);
      
      toast.success(`Thank you, ${name}! You can now chat about your policy.`);
    }
  };

  const handlePhotoCapture = async (photoBlob: Blob) => {
    try {
      setShowPhotoCapture(false);
      setIsAnalyzing(true);
      toast.info("Converting photo to PDF...");
      
      // Convert the image to PDF 
      const photoFile = new File([photoBlob], "document_photo.jpg", { type: "image/jpeg" });
      const pdfBlob = await convertImageToPdf(photoFile);
      const pdfFile = new File([pdfBlob], "converted_document.pdf", { type: "application/pdf" });
      
      setSelectedFile(pdfFile);
      // The existing useEffect will trigger processPdfFile since it's a PDF
    } catch (error) {
      console.error("Error processing photo:", error);
      toast.error("Failed to process photo. Please try again.");
      setIsAnalyzing(false);
    }
  };
  
  const convertImageToPdf = async (imageFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          
          // Set the canvas dimensions to match the image with padding
          const padding = 50; // padding in pixels
          canvas.width = img.width + (padding * 2);
          canvas.height = img.height + (padding * 2);
          
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");
          
          // Fill with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the image with padding
          ctx.drawImage(img, padding, padding, img.width, img.height);
          
          // Convert to PDF using canvas.toBlob
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert image to blob"));
            }
          }, 'application/pdf');
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
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
    
    if (isPdfMode && activePdfSource) {
      if (!getCurrentUser()) {
        toast.error("Please provide your name and email first.");
        setShowUserInfoDialog(true);
        return;
      }
      
      processMessageWithAnalyzer(activePdfSource.sourceId, message);
    } else {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "user",
        timestamp: new Date(),
        attachment: selectedFile && !isPdfMode ? {
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
    }
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
      toast.info("Processing PDF document...");
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

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }
    setShowUserInfoDialog(open);
  };

  return (
    <div className="flex flex-col h-screen">
      <ScrollArea className="flex-grow p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <h1 className="text-3xl font-bold mb-4 text-gradient">Welcome to AnalyzeYourInsurancePolicy</h1>
              <p className="text-muted-foreground mb-6">
                Upload your insurance policy document or take a photo and ask questions about it.
              </p>
              <div className="max-w-md mx-auto bg-muted p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="font-medium">How to use:</span>
                </div>
                <ol className="list-decimal pl-6 space-y-2 text-sm text-left text-muted-foreground">
                  <li>Click the paperclip icon to upload your insurance policy document</li>
                  <li>Or click the camera icon to take a photo of your physical document</li>
                  <li>Wait for the document to be processed automatically</li>
                  <li>Ask questions about your policy in the chat</li>
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
                Policy analysis active: {activePdfSource.fileName}
              </span>
            </div>
          )}
          
          <div className="flex gap-2 mt-2">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isPdfMode ? "Ask a question about your insurance policy..." : "Type your message here..."}
                className="min-h-12 resize-none pr-10 shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-shadow duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isAnalyzing}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
                onChange={handleFileSelect}
              />
              <div className="absolute right-2 top-2 flex space-x-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors scale-up-button"
                  onClick={() => setShowPhotoCapture(true)}
                  aria-label="Take photo"
                  disabled={isAnalyzing}
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Take photo</span>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors scale-up-button"
                  onClick={triggerFileUpload}
                  aria-label="Upload file"
                  disabled={isAnalyzing}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="sr-only">Upload file</span>
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 shadow-md scale-up-button" 
              aria-label="Send message"
              disabled={isAnalyzing || (!message.trim() && !selectedFile)}
            >
              {isAnalyzing ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
          
          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePasteText}
              className="text-xs h-8 text-muted-foreground hover:text-foreground scale-up-button"
              disabled={isAnalyzing}
            >
              Paste from clipboard
            </Button>
          </div>
        </form>
      </div>
      
      <UserInfoDialog 
        open={showUserInfoDialog}
        onSubmit={handleUserInfoSubmit}
        onOpenChange={handleDialogOpenChange}
      />

      {showPhotoCapture && (
        <PhotoCapture 
          onCapture={handlePhotoCapture} 
          onClose={() => setShowPhotoCapture(false)} 
        />
      )}
    </div>
  );
};

export default ChatInterface;
