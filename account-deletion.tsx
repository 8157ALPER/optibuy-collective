import { useState } from "react";
import { ArrowLeft, Trash2, AlertTriangle, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function AccountDeletion() {
  const [, setLocation] = useLocation();
  const [reason, setReason] = useState("");
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitDeletion = async () => {
    if (!confirmDeletion) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm you understand the deletion consequences",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/account-deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast({
          title: "Deletion Request Submitted",
          description: "We'll process your request within 30 days and send confirmation via email."
        });
        setReason("");
        setConfirmDeletion(false);
      } else {
        throw new Error("Failed to submit deletion request");
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Could not submit deletion request. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="p-1"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              OptiBuy Account Deletion
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Request deletion of your account and associated data
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Important Information */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertTriangle size={20} />
              <span>Important: Account Deletion Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700 dark:text-red-300">
            <p className="mb-3">
              Deleting your OptiBuy account is permanent and cannot be undone. Please review the following carefully:
            </p>
            
            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Data that will be permanently deleted:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Your user profile and account information</li>
                <li>All purchase intentions and saved plans</li>
                <li>Your participation history in group purchases</li>
                <li>Achievement badges and progress</li>
                <li>AI recommendation preferences and history</li>
                <li>Business verification documents (if applicable)</li>
                <li>App preferences and settings</li>
              </ul>

              <h4 className="font-medium pt-3">Data that may be retained:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Anonymous transaction records (for legal compliance) - 7 years</li>
                <li>Support ticket communications - 3 years</li>
                <li>Fraud prevention logs (anonymized) - 2 years</li>
                <li>Aggregated analytics data (non-identifiable) - indefinitely</li>
              </ul>

              <h4 className="font-medium pt-3">Processing timeline:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Account deactivation: Within 24 hours</li>
                <li>Complete data deletion: Within 30 days</li>
                <li>Email confirmation: Sent upon completion</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Partial Data Deletion Alternative */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield size={20} className="text-blue-500" />
              <span>Alternative: Selective Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Instead of deleting your entire account, you can manage specific data:
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/profile")}
                className="w-full justify-start"
              >
                Edit Profile & Privacy Settings
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/my-plans")}
                className="w-full justify-start"
              >
                Delete Specific Purchase Plans
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open("mailto:privacy@optibuy.app?subject=Data Request")}
                className="w-full justify-start"
              >
                Request Specific Data Export or Deletion
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trash2 size={20} className="text-red-500" />
              <span>Submit Account Deletion Request</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason for deletion (optional)
              </label>
              <Textarea
                placeholder="Help us improve OptiBuy by sharing why you're leaving..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="confirm-deletion"
                checked={confirmDeletion}
                onCheckedChange={(checked) => setConfirmDeletion(checked as boolean)}
              />
              <label 
                htmlFor="confirm-deletion" 
                className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                I understand that deleting my OptiBuy account is permanent and cannot be undone. 
                I have read and understand the data deletion and retention policies above.
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSubmitDeletion}
                disabled={isSubmitting || !confirmDeletion}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? "Submitting..." : "Delete My Account"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              If you have questions about account deletion or data handling:
            </p>
            <div className="space-y-1 text-sm">
              <p>Email: <a href="mailto:privacy@optibuy.app" className="text-blue-600 hover:underline">privacy@optibuy.app</a></p>
              <p>Support: <a href="mailto:support@optibuy.app" className="text-blue-600 hover:underline">support@optibuy.app</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
