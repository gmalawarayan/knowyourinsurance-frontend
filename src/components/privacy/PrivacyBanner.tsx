
import React from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PrivacyPolicy from "./PrivacyPolicy";
import LocalProcessingToggle from "./LocalProcessingToggle";

const PrivacyBanner: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div className="space-y-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Your documents are processed securely and deleted after 30 days.
            </p>
          </div>
          <Button 
            variant="link" 
            className="text-blue-600 text-sm whitespace-nowrap"
            onClick={() => setIsOpen(true)}
          >
            Privacy Policy
          </Button>
        </div>
        <LocalProcessingToggle />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <PrivacyPolicy onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrivacyBanner;
