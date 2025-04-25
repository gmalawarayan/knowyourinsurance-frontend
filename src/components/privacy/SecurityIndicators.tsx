
import React from "react";
import { Shield, Lock, HardDrive } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SecurityIndicators: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 mt-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-green-100 p-1 rounded-full">
              <Lock className="h-4 w-4 text-green-700" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">End-to-end encrypted</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-green-100 p-1 rounded-full">
              <Shield className="h-4 w-4 text-green-700" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Secure document processing</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-green-100 p-1 rounded-full">
              <HardDrive className="h-4 w-4 text-green-700" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Local processing available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SecurityIndicators;
