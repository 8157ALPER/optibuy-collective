import { useState } from "react";
import { ArrowLeft, Upload, Check, Clock, X, Shield, Star, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const verificationTiers = {
  basic: {
    name: "Basic Business",
    icon: Shield,
    color: "text-neutral-600",
    bgColor: "bg-neutral-100",
    rfqLimit: 3,
    maxRfqValue: 10000,
    features: ["Email verification", "Basic company profile", "Limited RFQ posting"],
    requirements: ["Valid business email domain"]
  },
  verified: {
    name: "Verified Business", 
    icon: Star,
    color: "text-primary",
    bgColor: "bg-primary/10",
    rfqLimit: 15,
    maxRfqValue: 100000,
    features: ["Priority listing", "Enhanced profile badge", "Increased posting limits", "Buyer contact info"],
    requirements: ["Business registration documents", "Tax certificate or chamber membership"]
  },
  certified: {
    name: "Premium Certified",
    icon: Crown,
    color: "text-warning",
    bgColor: "bg-warning/10",
    rfqLimit: -1,
    maxRfqValue: -1,
    features: ["Unlimited RFQs", "Premium support", "API access", "Custom terms", "International trading"],
    requirements: ["Notarized documents", "Bank reference letters", "International trade certificates"]
  }
};

const documentTypes = {
  business_registration: "Business Registration Certificate",
  chamber_membership: "Chamber of Commerce Membership",
  tax_certificate: "Tax Registration Certificate",
  bank_reference: "Bank Reference Letter",
  trade_license: "Trade License",
  company_profile: "Company Profile Document"
};

export default function VerificationCenter() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<"verified" | "certified">("verified");
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user and verification status
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  const { data: verificationDocs } = useQuery({
    queryKey: ["/api/verification/documents"],
  });

  const { data: verificationRequests } = useQuery({
    queryKey: ["/api/verification/requests"],
  });

  const { data: rfqLimits } = useQuery({
    queryKey: ["/api/verification/rfq-limits"],
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { documentType: string; file: File }) => {
      const formData = new FormData();
      formData.append("documentType", data.documentType);
      formData.append("file", data.file);
      
      return apiRequest("/api/verification/upload-document", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded",
        description: "Your document has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/documents"] });
      setUploadingDoc(null);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
      setUploadingDoc(null);
    },
  });

  const requestVerificationMutation = useMutation({
    mutationFn: async (tier: "verified" | "certified") => {
      return apiRequest("/api/verification/request", {
        method: "POST",
        body: JSON.stringify({ requestedTier: tier }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Verification requested",
        description: "Your verification request has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/requests"] });
    },
    onError: () => {
      toast({
        title: "Request failed",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (documentType: string, file: File) => {
    setUploadingDoc(documentType);
    uploadDocumentMutation.mutate({ documentType, file });
  };

  const currentTier = userProfile?.verificationTier || "basic";
  const currentTierInfo = verificationTiers[currentTier as keyof typeof verificationTiers];

  const getDocumentStatus = (docType: string) => {
    const doc = verificationDocs?.find((d: any) => d.documentType === docType);
    return doc?.verificationStatus || "none";
  };

  const getVerificationProgress = () => {
    if (!verificationDocs) return 0;
    const requiredDocs = selectedTier === "verified" ? 2 : 4;
    const approvedDocs = verificationDocs.filter((doc: any) => doc.verificationStatus === "approved").length;
    return Math.min((approvedDocs / requiredDocs) * 100, 100);
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/business-dashboard")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">Verification Center</h2>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid grid-cols-3 m-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Current Status Tab */}
            <TabsContent value="status" className="p-4 space-y-4">
              {/* Current Tier Card */}
              <Card className={`border-l-4 ${currentTierInfo.bgColor}`}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <currentTierInfo.icon className={`mr-2 ${currentTierInfo.color}`} size={20} />
                    {currentTierInfo.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-600">Monthly RFQ Limit</p>
                      <p className="font-medium">
                        {currentTierInfo.rfqLimit === -1 ? "Unlimited" : currentTierInfo.rfqLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Max RFQ Value</p>
                      <p className="font-medium">
                        {currentTierInfo.maxRfqValue === -1 ? "Unlimited" : `$${currentTierInfo.maxRfqValue.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  
                  {rfqLimits && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span>RFQs Used This Month</span>
                        <span>{rfqLimits.used} / {rfqLimits.limit === -1 ? "∞" : rfqLimits.limit}</span>
                      </div>
                      {rfqLimits.limit !== -1 && (
                        <Progress value={(rfqLimits.used / rfqLimits.limit) * 100} className="h-2" />
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      {currentTierInfo.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="mr-2 text-success" size={14} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status */}
              {verificationRequests && verificationRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {verificationRequests.map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{request.requestedTier} Verification</p>
                          <p className="text-sm text-neutral-600">
                            Submitted {new Date(request.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={request.status === "approved" ? "default" : 
                                  request.status === "rejected" ? "destructive" : "secondary"}
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Upgrade Tab */}
            <TabsContent value="upgrade" className="p-4 space-y-4">
              <div className="grid gap-4">
                {(["verified", "certified"] as const).map((tier) => {
                  const tierInfo = verificationTiers[tier];
                  const canUpgrade = currentTier === "basic" || (currentTier === "verified" && tier === "certified");
                  
                  return (
                    <Card 
                      key={tier}
                      className={`cursor-pointer transition-all ${
                        selectedTier === tier ? "ring-2 ring-primary" : ""
                      } ${!canUpgrade ? "opacity-50" : ""}`}
                      onClick={() => canUpgrade && setSelectedTier(tier)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center">
                            <tierInfo.icon className={`mr-2 ${tierInfo.color}`} size={20} />
                            {tierInfo.name}
                          </div>
                          {!canUpgrade && <Badge variant="secondary">Current</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-600">Monthly RFQ Limit</p>
                            <p className="font-medium">
                              {tierInfo.rfqLimit === -1 ? "Unlimited" : tierInfo.rfqLimit}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-600">Max RFQ Value</p>
                            <p className="font-medium">
                              {tierInfo.maxRfqValue === -1 ? "Unlimited" : `$${tierInfo.maxRfqValue.toLocaleString()}`}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Requirements:</p>
                          <ul className="text-sm text-neutral-600 space-y-1">
                            {tierInfo.requirements.map((req, index) => (
                              <li key={index} className="flex items-center">
                                <Clock className="mr-2 text-warning" size={14} />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Upgrade Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upgrade Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Document Verification</span>
                    <span>{Math.round(getVerificationProgress())}% Complete</span>
                  </div>
                  <Progress value={getVerificationProgress()} />
                  
                  <Button
                    onClick={() => requestVerificationMutation.mutate(selectedTier)}
                    disabled={getVerificationProgress() < 100 || requestVerificationMutation.isPending}
                    className="w-full"
                  >
                    {requestVerificationMutation.isPending ? "Submitting..." : `Request ${selectedTier} Verification`}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="p-4 space-y-4">
              <div className="space-y-4">
                {Object.entries(documentTypes).map(([type, name]) => {
                  const status = getDocumentStatus(type);
                  const isRequired = selectedTier === "verified" ? 
                    ["business_registration", "tax_certificate"].includes(type) :
                    ["business_registration", "tax_certificate", "bank_reference", "trade_license"].includes(type);

                  return (
                    <Card key={type} className={isRequired ? "border-l-4 border-l-primary" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{name}</h4>
                            {isRequired && <Badge variant="outline" className="text-xs mt-1">Required</Badge>}
                          </div>
                          <div className="flex items-center">
                            {status === "approved" && <Check className="text-success mr-2" size={16} />}
                            {status === "pending" && <Clock className="text-warning mr-2" size={16} />}
                            {status === "rejected" && <X className="text-destructive mr-2" size={16} />}
                            <Badge 
                              variant={status === "approved" ? "default" : 
                                      status === "rejected" ? "destructive" : "secondary"}
                            >
                              {status === "none" ? "Not uploaded" : status}
                            </Badge>
                          </div>
                        </div>

                        {status === "none" && (
                          <div className="space-y-2">
                            <Label htmlFor={`file-${type}`} className="cursor-pointer">
                              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                                <Upload className="mx-auto mb-2 text-neutral-500" size={20} />
                                <p className="text-sm text-neutral-600">
                                  {uploadingDoc === type ? "Uploading..." : "Click to upload document"}
                                </p>
                              </div>
                            </Label>
                            <Input
                              id={`file-${type}`}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(type, file);
                              }}
                              disabled={uploadingDoc === type}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Separator />

              <div className="text-xs text-neutral-500 space-y-2">
                <p><strong>Accepted formats:</strong> PDF, JPG, PNG (max 10MB)</p>
                <p><strong>Processing time:</strong> 2-5 business days</p>
                <p><strong>International documents:</strong> Must be translated to English and notarized</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileContainer>
  );
}
