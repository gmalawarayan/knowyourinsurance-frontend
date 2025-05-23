import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, FileText, Camera, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadPdfToAnalyzer, sendMessageToAnalyzer, deletePdfSource, translateText } from "@/services/chatPdfService";
import { trackPdfUpload, trackQueryAsked, trackUniqueUser } from "@/services/analyticsService";
import { setUserInfo, getCurrentUser } from "@/services/authService";
import PhotoCapture from "./PhotoCapture";
import PaymentModal from "./PaymentModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type Language = "english" | "tamil";

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
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [language, setLanguage] = useState<Language>("english");
  const [capturedPhotos, setCapturedPhotos] = useState<Blob[]>([]);
  const [isCapturingMultiplePhotos, setIsCapturingMultiplePhotos] = useState(false);
  const [questionCount, setQuestionCount] = useState(() => {
    return parseInt(localStorage.getItem("policyAnalyzer_questionCount") || "0");
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaid, setIsPaid] = useState(() => {
    return localStorage.getItem("policyAnalyzer_isPaid") === "true";
  });
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Changed from 10 to Infinity to allow unlimited pages
  const MAX_POLICY_PAGES = Infinity;
  const MAX_QUESTIONS = 3;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_FREE_QUESTIONS = 3;
  
  const insuranceTrivia = [
    "The concept of insurance dates back to ancient Babylonian times, around 1750 BC, where merchants would pay a premium to lenders to guarantee their shipments.",
    "The first life insurance policies were taken out in the early 18th century at Lloyd's Coffee House in London, which later became Lloyd's of London.",
    "In the U.S., Benjamin Franklin helped establish the first insurance company in 1752, the Philadelphia Contributionship for the Insurance of Houses from Loss by Fire.",
    "The term 'deductible' refers to the amount you pay out of pocket before your insurance starts covering costs.",
    "The largest insurance market in the world is in London, known as Lloyd's of London.",
    "Insurance fraud costs the industry billions of dollars annually, which ultimately increases premiums for all policyholders.",
    "Comprehensive auto insurance typically covers damage not caused by a collision, such as theft, vandalism, or natural disasters.",
    "The insurance industry employs over 2.8 million people in the United States alone.",
    "Actuaries are professionals who analyze statistical data to calculate insurance risks and premiums.",
    "The term 'umbrella insurance' refers to liability insurance that provides additional coverage beyond your existing policies.",
    "Some of the most expensive insurance policies in the world are those covering celebrity body parts, like Jennifer Lopez's legs for $27 million.",
    "The first health insurance plan in the United States was created in 1929 when a group of teachers contracted with Baylor Hospital for room, board, and medical services.",
    "Insurance companies use a credit-based insurance score to determine premiums in many states, as statistics show that people with poor credit file more claims.",
    "Flood damage is typically not covered by standard homeowners insurance policies in the United States.",
    "The insurance industry is one of the largest investors in the global financial markets."
  ];

  const getRandomTrivia = () => {
    return insuranceTrivia[Math.floor(Math.random() * insuranceTrivia.length)];
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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
      
      if (!getCurrentUser()) {
        const user = setUserInfo("User", "user@example.com");
        trackUniqueUser(user.id);
      }
      
      const initialPrompt = `Please provide a brief summary of what this insurance policy document contains.`;
      await processMessageWithAnalyzer(source.sourceId, initialPrompt, false);
      
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
        
        if (isPdfMode) {
          // Update question count if we're in PDF mode and it's a user question
          const newCount = questionCount + 1;
          setQuestionCount(newCount);
          localStorage.setItem("policyAnalyzer_questionCount", newCount.toString());
          
          // Check if user needs to pay
          if (newCount > MAX_FREE_QUESTIONS && !isPaid) {
            const paymentPrompt: Message = {
              id: Date.now().toString(),
              content: language === "english" 
                ? "You've used all your free questions. Please upgrade to continue asking questions." 
                : "நீங்கள் உங்கள் அனைத்து இலவச கேள்விகளையும் பயன்படுத்தியுள்ளீர்கள். தொடர்ந்து கேள்விகளைக் கேட்க தயவுசெய்து மேம்படுத்தவும்.",
              sender: "ai",
              timestamp: new Date(),
            };
            
            setMessages(prev => [...prev, paymentPrompt]);
            setShowPaymentModal(true);
            setIsTyping(false);
            return undefined;
          }
        }
      }
      
      trackQueryAsked();
      
      const response = await sendMessageToAnalyzer(sourceId, userMessage, language);
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);

      if (isPdfMode && questionCount >= MAX_QUESTIONS) {
        setShowContinueDialog(true);
      }

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

  const handlePhotoCapture = async (photoBlob: Blob) => {
    try {
      const newPhotos = [...capturedPhotos, photoBlob];
      setCapturedPhotos(newPhotos);
      
      if (newPhotos.length >= MAX_POLICY_PAGES) {
        setShowPhotoCapture(false);
        setIsCapturingMultiplePhotos(true);
        await combinePhotosIntoPdf(newPhotos);
      }
    } catch (error) {
      console.error("Error processing photo:", error);
      toast.error("Failed to process photo. Please try again.");
    }
  };
  
  const combinePhotosIntoPdf = async (photos: Blob[]) => {
    try {
      setIsAnalyzing(true);
      toast.info(`Converting ${photos.length} photos to PDF...`);
      
      const pdf = new jsPDF();
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const photoUrl = URL.createObjectURL(photo);
        
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = photoUrl;
        });
        
        if (i > 0) {
          pdf.addPage();
        }
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const scaleFactor = Math.min(
          pageWidth / imgWidth,
          pageHeight / imgHeight
        ) * 0.9;
        
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = imgHeight * scaleFactor;
        
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        
        pdf.addImage(photoUrl, 'JPEG', x, y, scaledWidth, scaledHeight);
        
        URL.revokeObjectURL(photoUrl);
      }
      
      const pdfBlob = pdf.output('blob');
      
      const pdfFile = new File([pdfBlob], "policy_document.pdf", { type: "application/pdf" });
      
      setCapturedPhotos([]);
      setIsCapturingMultiplePhotos(false);
      
      setSelectedFile(pdfFile);
      
      toast.success(`Successfully created PDF with ${photos.length} pages.`);
    } catch (error) {
      console.error("Error combining photos:", error);
      toast.error("Failed to combine photos into PDF. Please try again.");
      setIsAnalyzing(false);
      setIsCapturingMultiplePhotos(false);
      setCapturedPhotos([]);
    }
  };
  
  const convertImageToPdf = async (imageFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          
          const padding = 50;
          canvas.width = img.width + (padding * 2);
          canvas.height = img.height + (padding * 2);
          
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");
          
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, padding, padding, img.width, img.height);
          
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

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(async () => {
      let responseText = "";
      
      if (!isPdfMode) {
        const greeting = getTimeBasedGreeting();
        const trivia = getRandomTrivia();
        
        responseText = `${greeting}! ${trivia}\n\nTo get the most out of our service, please upload your insurance policy document, and I'll be able to analyze it for you.`;
      } else {
        responseText = `I received your message: "${userMessage}"`;
        if (selectedFile && !isPdfMode) {
          responseText += ` and your ${selectedFile.type.startsWith("image/") ? "image" : "file"}: ${selectedFile.name}`;
        }
      }
      
      if (language === "tamil") {
        responseText = await translateText(responseText, "english", "tamil");
      }
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleContinueResponse = (continueChat: boolean) => {
    setShowContinueDialog(false);
    
    if (continueChat) {
      setQuestionCount(0);
      toast.success(language === "english" 
        ? "You can continue asking questions about your policy." 
        : "நீங்கள் உங்கள் பாலிசி பற்றி மேலும் கேள்விகளைக் கேட்கலாம்.");
    } else {
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    
    if (activePdfSource) {
      deletePdfSource(activePdfSource.sourceId)
        .then(() => {
          toast.success(language === "english" 
            ? "Your policy document has been deleted." 
            : "உங்கள் பாலிசி ஆவணம் நீக்கப்பட்டது.");
          
          setMessages([]);
          setMessage("");
          setSelectedFile(null);
          setActivePdfSource(null);
          setIsPdfMode(false);
          setQuestionCount(0);
          
          window.dispatchEvent(new Event('new-chat'));
        })
        .catch(() => {
          toast.error(language === "english" 
            ? "Failed to delete your policy document." 
            : "உங்கள் பாலிசி ஆவணத்தை நீக்க முடியவில்லை.");
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedFile) {
      return;
    }
    
    if (isPdfMode && activePdfSource) {
      if (!getCurrentUser()) {
        const user = setUserInfo("User", "user@example.com");
        trackUniqueUser(user.id);
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

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
    
    const welcomeMessage = value === "english" 
      ? "Language changed to English!"
      : "மொழி தமிழாக மாற்றப்பட்டது!"; // "Language changed to Tamil!"
      
    toast.success(welcomeMessage);
  };

  // Handle payment success event
  const handlePaymentSuccess = () => {
    setIsPaid(true);
    setQuestionCount(0);
    toast.success(language === "english" 
      ? "You now have unlimited questions access!" 
      : "உங்களிடம் வரம்பற்ற கேள்விகள் அணுகல் உள்ளது!");
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
                {!isPaid && (
                  <span className="block mt-2 text-sm font-medium text-primary">
                    {language === "english" 
                      ? `You have ${MAX_FREE_QUESTIONS - questionCount} free questions remaining.` 
                      : `உங்களிடம் ${MAX_FREE_QUESTIONS - questionCount} இலவச கேள்விகள் உள்ளன.`}
                  </span>
                )}
                {isPaid && (
                  <span className="block mt-2 text-sm font-medium text-green-600">
                    {language === "english" 
                      ? "You have unlimited questions access." 
                      : "உங்களிடம் வரம்பற்ற கேள்விகள் அணுகல் உள்ளது."}
                  </span>
                )}
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
                  <li>Select your preferred language from the dropdown</li>
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
            <Select
              defaultValue="english"
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-36 h-12 shadow-sm border-input flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <SelectValue placeholder="Language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isPdfMode 
                  ? language === "english" 
                    ? "Ask a question about your insurance policy..." 
                    : "உங்கள் காப்பீட்டுக் கொள்கை பற்றிய கேள்வியைக் கேட்கலாம்..."
                  : language === "english"
                    ? "Type your message here..."
                    : "உங்கள் செய்தியை இங்கே தட்டச்சு செய்யவும்..."}
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
              {language === "english" ? "Paste from clipboard" : "கிளிப்போர்டிலிருந்து ஒட்டவும்"}
            </Button>
          </div>
        </form>
      </div>

      {showPhotoCapture && (
        <PhotoCapture 
          onCapture={handlePhotoCapture} 
          onClose={() => {
            setShowPhotoCapture(false);
            if (capturedPhotos.length > 0) {
              combinePhotosIntoPdf(capturedPhotos);
            }
          }}
          currentPageCount={capturedPhotos.length}
          maxPages={MAX_POLICY_PAGES}
        />
      )}

      <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "english" 
                ? "Do you have more questions?"
                : "உங்களுக்கு மேலும் கேள்விகள் உள்ளனவா?"}
            </DialogTitle>
            <DialogDescription>
              {language === "english"
                ? "You've asked 3 questions about your policy. Would you like to continue asking more questions?"
                : "உங்கள் பாலிசி பற்றி 3 கேள்விகளை கேட்டுள்ளீர்கள். மேலும் கேள்விகள் கேட்க விரும்புகிறீர்களா?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleContinueResponse(false)}>
              {language === "english" ? "No, I'm done" : "இல்லை, முடிந்தது"}
            </Button>
            <Button onClick={() => handleContinueResponse(true)}>
              {language === "english" ? "Yes, continue" : "ஆம், தொடரவும்"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "english"
                ? "Delete Policy Document"
                : "பாலிசி ஆவணத்தை நீக்கவும்"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "english"
                ? "Are you sure you want to delete your policy document? This action cannot be undone."
                : "உங்கள் பாலிசி ஆவணத்தை நீக்க விரும்புகிறீர்களா? இந்த செயலை மீட்டெடுக்க முடியவில்லை."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "english" ? "Cancel" : "ரத்து செய்"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {language === "english" ? "Delete" : "நீக்கு"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Status Indicator - Shows if user has paid */}
      {isPaid && isPdfMode && (
        <div className="bg-green-50 border-t border-green-200 py-1 px-4 text-center text-xs text-green-700">
          {language === "english" 
            ? "Unlimited Questions Access Enabled" 
            : "வரம்பற்ற கேள்விகள் அணுகல் செயல்படுத்தப்பட்டது"}
        </div>
      )}
      
      {/* Free Questions Counter - Shows when user hasn't paid */}
      {!isPaid && isPdfMode && (
        <div className="bg-blue-50 border-t border-blue-200 py-1 px-4 text-center text-xs text-blue-700">
          {language === "english" 
            ? `Free Questions: ${questionCount}/${MAX_FREE_QUESTIONS}` 
            : `இலவச கேள்விகள்: ${questionCount}/${MAX_FREE_QUESTIONS}`}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ChatInterface;
