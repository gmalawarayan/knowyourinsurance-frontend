
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUsageMetrics, isAdmin } from "@/services/analyticsService";
import { BarChart2, File, MessageSquare, Users, AlertTriangle } from "lucide-react";
import { getCurrentUser } from "@/services/authService";

interface UsageMetricsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UsageMetricsDialog: React.FC<UsageMetricsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const metrics = getUsageMetrics();
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin(currentUser);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-purple-600" />
            <span>Usage Analytics</span>
          </DialogTitle>
          <DialogDescription>
            View statistics about ChatPDF service usage
          </DialogDescription>
        </DialogHeader>
        
        {!userIsAdmin ? (
          <div className="py-8 px-4 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-sm text-muted-foreground">
              You don't have permission to view analytics data.
              Please contact an administrator.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="bg-muted p-4 rounded-xl flex flex-col items-center">
                <div className="mb-2 p-2 bg-background rounded-full">
                  <File className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">{metrics.totalPdfsUploaded}</div>
                <div className="text-xs text-muted-foreground text-center">PDFs Uploaded</div>
              </div>
              
              <div className="bg-muted p-4 rounded-xl flex flex-col items-center">
                <div className="mb-2 p-2 bg-background rounded-full">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">{metrics.totalQueriesAsked}</div>
                <div className="text-xs text-muted-foreground text-center">Queries Asked</div>
              </div>
              
              <div className="bg-muted p-4 rounded-xl flex flex-col items-center">
                <div className="mb-2 p-2 bg-background rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">{metrics.uniqueUsers}</div>
                <div className="text-xs text-muted-foreground text-center">Unique Users</div>
              </div>
              
              <div className="bg-muted p-4 rounded-xl flex flex-col items-center">
                <div className="mb-2 p-2 bg-background rounded-full">
                  <BarChart2 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-sm font-medium">
                  {metrics.lastUsed.toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground text-center">Last Used</div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground text-center mt-2">
              Note: These metrics are stored locally in your browser.
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UsageMetricsDialog;
