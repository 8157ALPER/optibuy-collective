import { useState } from "react";
import { AlertTriangle, Flag, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface UserReportingProps {
  targetUserId: number;
  targetUserName: string;
  contentType?: "offer" | "intention" | "rfq" | "profile";
  contentId?: number;
}

interface BlockUserProps {
  targetUserId: number;
  targetUserName: string;
}

export function ReportUser({ targetUserId, targetUserName, contentType, contentId }: UserReportingProps) {
  const [reportReason, setReportReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportReasons = [
    { value: "spam", label: "Spam or misleading content" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "fake", label: "Fake or fraudulent offers" },
    { value: "scam", label: "Suspected scam" },
    { value: "terms", label: "Violation of terms of service" },
    { value: "other", label: "Other" }
  ];

  const handleSubmit = async () => {
    if (!reportReason) {
      toast({
        title: "Report Reason Required",
        description: "Please select a reason for reporting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/report-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          reason: reportReason,
          description,
          contentType,
          contentId
        })
      });

      if (response.ok) {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep OptiBuy safe. We'll review this report."
        });
        setReportReason("");
        setDescription("");
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (error) {
      toast({
        title: "Report Failed",
        description: "Could not submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
          <Flag size={14} className="mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={20} />
            <span>Report User</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Reporting: <span className="font-medium">{targetUserName}</span>
            </p>
            
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for reporting" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Textarea
              placeholder="Additional details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BlockUser({ targetUserId, targetUserName }: BlockUserProps) {
  const [isBlocking, setIsBlocking] = useState(false);
  const { toast } = useToast();

  const handleBlock = async () => {
    setIsBlocking(true);
    try {
      const response = await fetch("/api/block-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId })
      });

      if (response.ok) {
        toast({
          title: "User Blocked",
          description: `${targetUserName} has been blocked. You won't see their content anymore.`
        });
      } else {
        throw new Error("Failed to block user");
      }
    } catch (error) {
      toast({
        title: "Block Failed",
        description: "Could not block user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
          <X size={14} className="mr-1" />
          Block
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="text-red-500" size={20} />
            <span>Block User</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to block <span className="font-medium">{targetUserName}</span>?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              When you block this user:
            </p>
            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
              <li>• You won't see their offers or purchase intentions</li>
              <li>• They won't be able to join your group purchases</li>
              <li>• You can unblock them anytime in settings</li>
            </ul>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={handleBlock} 
              disabled={isBlocking}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isBlocking ? "Blocking..." : "Block User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
