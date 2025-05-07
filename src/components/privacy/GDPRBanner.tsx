
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const GDPRBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("gdpr-consent");
    
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);
  
  const acceptCookies = () => {
    localStorage.setItem("gdpr-consent", "true");
    setShowBanner(false);
  };
  
  const declineCookies = () => {
    localStorage.setItem("gdpr-consent", "false");
    setShowBanner(false);
  };
  
  if (!showBanner) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200 p-4">
      <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-gray-700">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={declineCookies}
          >
            Reject All
          </Button>
          <Button 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={acceptCookies}
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GDPRBanner;
