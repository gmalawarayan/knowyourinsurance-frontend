
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    // Load the PayPal SDK script when the component mounts
    if (isOpen && !paypalLoaded) {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD";
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      
      document.body.appendChild(script);
      
      return () => {
        // Clean up the script when the component unmounts
        document.body.removeChild(script);
      };
    }
  }, [isOpen, paypalLoaded]);

  useEffect(() => {
    // Initialize PayPal buttons when the SDK is loaded
    if (paypalLoaded && paypalButtonRef.current && isOpen) {
      paypalButtonRef.current.innerHTML = '';
      
      // @ts-ignore - PayPal global object
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '1.00'
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          setIsProcessing(true);
          
          return actions.order.capture().then(function(details: any) {
            // Save payment status to localStorage
            localStorage.setItem("policyAnalyzer_isPaid", "true");
            
            // Show success message
            toast.success(`Payment successful! Thanks, ${details.payer.name.given_name}. You now have unlimited questions.`);
            
            setIsProcessing(false);
            // Notify parent component
            onPaymentSuccess();
            onClose();
          });
        },
        onError: (err: any) => {
          setIsProcessing(false);
          toast.error("Payment failed. Please try again.");
          console.error("PayPal error:", err);
        }
      }).render(paypalButtonRef.current);
    }
  }, [paypalLoaded, isOpen, onPaymentSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span>Upgrade to Unlimited Questions</span>
          </DialogTitle>
          <DialogDescription>
            You've used your 3 free questions. Pay just $1 to ask unlimited questions about your insurance policy.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-lg my-4">
          <h3 className="font-medium mb-2">What you get:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Unlimited questions about your policy</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Detailed policy analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Support for multiple policies</span>
            </li>
          </ul>
        </div>
        
        {/* PayPal Button Container */}
        <div 
          ref={paypalButtonRef} 
          className="mt-4 mb-2"
          style={{ minHeight: '45px' }}
        >
          {!paypalLoaded && (
            <div className="w-full h-10 bg-gray-200 animate-pulse rounded flex items-center justify-center text-gray-500">
              Loading payment options...
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
