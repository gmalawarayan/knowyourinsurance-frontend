
import React from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PrivacyPolicy from "./PrivacyPolicy";
import GDPRPolicy from "./GDPRPolicy";
import TermsOfService from "./TermsOfService";
import LocalProcessingToggle from "./LocalProcessingToggle";

const PrivacyBanner: React.FC = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  const [isGDPROpen, setIsGDPROpen] = React.useState(false);
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);

  return (
    <>
      <div className="space-y-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Your documents are processed securely and deleted after 30 days.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 ml-7 sm:ml-0">
            <Button 
              variant="link" 
              className="text-blue-600 text-sm p-0 h-auto whitespace-nowrap"
              onClick={() => setIsPrivacyOpen(true)}
            >
              Privacy Policy
            </Button>
            <Button 
              variant="link" 
              className="text-blue-600 text-sm p-0 h-auto whitespace-nowrap"
              onClick={() => setIsGDPROpen(true)}
            >
              GDPR Policy
            </Button>
            <Button 
              variant="link" 
              className="text-blue-600 text-sm p-0 h-auto whitespace-nowrap"
              onClick={() => setIsTermsOpen(true)}
            >
              Terms of Service
            </Button>
          </div>
        </div>
        <LocalProcessingToggle />
      </div>

      <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isGDPROpen} onOpenChange={setIsGDPROpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <GDPRPolicy onClose={() => setIsGDPROpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <TermsOfService onClose={() => setIsTermsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrivacyBanner;
