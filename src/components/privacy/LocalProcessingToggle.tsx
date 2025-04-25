
import React from "react";
import { HardDrive } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { toggleLocalProcessing, isLocalProcessingActive } from "@/services/documentProcessingService";

const LocalProcessingToggle = () => {
  const [isEnabled, setIsEnabled] = React.useState(isLocalProcessingActive());

  const handleToggle = () => {
    const newState = toggleLocalProcessing();
    setIsEnabled(newState);
    toast.success(
      newState 
        ? "Local processing enabled. Documents will be pre-processed on your device." 
        : "Local processing disabled. Documents will be processed directly on the server."
    );
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Local Processing</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Process documents locally on your device before sending to the server for enhanced privacy.
        </p>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};

export default LocalProcessingToggle;
