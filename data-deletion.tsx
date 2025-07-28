import { useState } from "react";
import { ArrowLeft, Database, Shield, Mail, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function DataDeletion() {
  const [, setLocation] = useLocation();
  const [deletionType, setDeletionType] = useState<string>("");
  const [specificData, setSpecificData] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [confirmRequest, setConfirmRequest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const dataTypes = [
    { id: "profile", label: "Personal profile information", description: "Name, email, contact details" },
    { id: "intentions", label: "Purchase intentions", description: "All your saved purchase plans and preferences" },
    { id: "history", label: "Activity history", description: "Your participation in group purchases and offers" },
    { id: "ai-data", label: "AI recommendation data", description: "Personalized recommendations and preferences" },
    { id: "business", label: "Business information", description: "Company details and verification documents" },
    { id: "analytics", label: "Usage analytics", description: "App interaction and behavior data" }
  ];

  const handleDataTypeChange = (dataId: string, checked: boolean) => {
    if (checked) {
      setSpecificData([...specificData, dataId]);
    } else {
      setSpecificData(specificData.filter(id => id !== dataId));
    }
  };

  const handleSubmitRequest = async () => {
    if (!confirmRequest) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm you want to proceed with this data deletion request",
        variant: "destructive"
      });
      return;
    }

    if (deletionType === "specific" && specificData.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one type of data to delete",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/data-deletion-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          deletionType, 
          specificData,
          reason 
        })
      });

      if (response.ok) {
        toast({
          title: "Request Submitted Successfully",
          description: "We'll process your data deletion request within 30 days and send confirmation via email."
        });
        setDeletionType("");
        setSpecificData([]);
        setReason("");
        setConfirmRequest(false);
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Could not submit data deletion request. Please try again or contact support.",
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
              OptiBuy Data Deletion Request
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Request deletion of specific data without closing your account
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Introduction */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
              <Shield size={20} />
              <span>Data Deletion Request for OptiBuy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <p className="mb-3">
              You can request deletion of specific types of data from your OptiBuy account without deleting your entire account. This gives you granular control over your personal information.
            </p>
            
            <div className="text-sm space-y-2">
              <p><strong>Processing time:</strong> Up to 30 days</p>
              <p><strong>Confirmation:</strong> Email notification when completed</p>
              <p><strong>Account impact:</strong> Your account remains active</p>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database size={20} className="text-green-500" />
              <span>Step 1: Select Deletion Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={deletionType} onValueChange={setDeletionType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-personal" id="all-personal" />
                <Label htmlFor="all-personal" className="font-medium">
                  Delete all personal data (keep account active)
                </Label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 ml-6 mb-4">
                Removes all personal information while keeping your account for future use
              </p>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="specific" />
                <Label htmlFor="specific" className="font-medium">
                  Delete specific types of data
                </Label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 ml-6">
                Choose exactly which data categories to remove
              </p>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Specific Data Selection */}
        {deletionType === "specific" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle size={20} className="text-purple-500" />
                <span>Step 2: Select Data Types to Delete</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataTypes.map((dataType) => (
                  <div key={dataType.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={dataType.id}
                      checked={specificData.includes(dataType.id)}
                      onCheckedChange={(checked) => handleDataTypeChange(dataType.id, checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={dataType.id} className="font-medium text-sm">
                        {dataType.label}
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {dataType.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Retention Information */}
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Data Retention Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Data that will be permanently deleted:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-600 dark:text-gray-300">
                <li>Selected personal information and preferences</li>
                <li>AI recommendation history and personalization data</li>
                <li>Purchase intention details and saved plans</li>
                <li>Activity logs and interaction history</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Data that may be retained:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4 text-gray-600 dark:text-gray-300">
                <li>Anonymous transaction records (legal requirement) - 7 years</li>
                <li>Support communications - 3 years</li>
                <li>Security and fraud prevention logs (anonymized) - 2 years</li>
                <li>Aggregated analytics (non-identifiable) - indefinitely</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Reason (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Reason for Data Deletion (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Help us understand why you want to delete this data..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Confirmation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2 mb-4">
              <Checkbox
                id="confirm-request"
                checked={confirmRequest}
                onCheckedChange={(checked) => setConfirmRequest(checked as boolean)}
              />
              <Label 
                htmlFor="confirm-request" 
                className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                I understand that this data deletion request cannot be undone. I have read and understand 
                the data retention policies and processing timeline above.
              </Label>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSubmitRequest}
                disabled={isSubmitting || !confirmRequest || !deletionType}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Data Deletion Request"}
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
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <h3 className="font-medium text-green-900 dark:text-green-200 mb-2 flex items-center space-x-2">
              <Mail size={16} />
              <span>Need Help with Data Deletion?</span>
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              For questions about data deletion, privacy, or specific data handling:
            </p>
            <div className="space-y-1 text-sm">
              <p>Privacy Team: <a href="mailto:privacy@optibuy.app" className="text-blue-600 hover:underline font-medium">privacy@optibuy.app</a></p>
              <p>Support: <a href="mailto:support@optibuy.app" className="text-blue-600 hover:underline font-medium">support@optibuy.app</a></p>
              <p className="text-xs text-green-600 dark:text-green-400 pt-1">
                Response time: Within 2 business days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
