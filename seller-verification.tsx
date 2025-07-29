import { useState } from "react";
import { ArrowLeft, Upload, Check, Clock, X, Shield, Star, Crown, AlertTriangle } from "lucide-react";
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

const sellerVerificationTiers = {
  unverified: {
    name: "Unverified Seller",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    offerLimit: 5,
    maxOfferValue: 1000,
    features: ["Basic selling", "Limited visibility", "Consumer warnings displayed"],
    requirements: ["Email verification only"],
    trustScore: 1
  },
  verified: {
    name: "Verified Seller",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    offerLimit: 25,
    maxOfferValue: 25000,
    features: ["Verified badge", "Enhanced visibility", "Customer testimonials", "Priority support"],
    requirements: ["ID verification", "Business license or tax ID", "Bank account verification"],
    trustScore: 3
  },
  trusted: {
    name: "Trusted Seller",
    icon: Crown,
    color: "text-warning",
    bgColor: "bg-warning/10",
    offerLimit: -1,
    maxOfferValue: -1,
    features: ["Trusted badge", "Premium placement", "Extended warranties", "Volume discounts", "Brand partnership"],
    requirements: ["Multiple successful transactions", "Insurance coverage", "Professional references", "Quality certifications"],
    trustScore: 5
  }
};

const sellerDocumentTypes = {
  id_verification: "Government-issued ID",
  business_license: "Business License / Tax ID",
  bank_verification: "Bank Account Verification",
  insurance_coverage: "Business Insurance Certificate",
  quality_certification: "Quality/Safety Certifications",
  professional_references: "Professional References"
};

export default function SellerVerification() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<"verified" | "trusted">("verified");
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user and verification status
  const { data: userProfile } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  const { data: verificationDocs } = useQuery({
    queryKey: ["/api/verification/seller-documents"],
  });

  const { data: verificationRequests } = useQuery({
    queryKey: ["/api/verification/seller-requests"],
  });

  const { data: offerLimits } = useQuery({
    queryKey: ["/api/verification/offer-limits"],
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { documentType: string; file: File }) => {
      const formData = new FormData();
      formData.append("documentType", data.documentType);
      formData.append("userType", "seller");
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
      queryClient.invalidateQueries({ queryKey: ["/api/verification/seller-documents"] });
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
    mutationFn: async (tier: "verified" | "trusted") => {
      return apiRequest("/api/verification/seller-request", {
        method: "POST",
        body: JSON.stringify({ requestedTier: tier }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Verification requested",
        description: "Your verification request has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/seller-requests"] });
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

  const currentTier = userProfile?.sellerTier || "unverified";
  const currentTierInfo = sellerVerificationTiers[currentTier as keyof typeof sellerVerificationTiers];

  const getDocumentStatus = (docType: string) => {
    const doc = verificationDocs?.find((d: any) => d.documentType === docType);
    return doc?.verificationStatus || "none";
  };

  const getVerificationProgress = () => {
    if (!verificationDocs) return 0;
    const requiredDocs = selectedTier === "verified" ? 3 : 5;
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
            onClick={() => setLocation("/seller-dashboard")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">Seller Verification</h2>
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
                      <p className="text-neutral-600">Monthly Offer Limit</p>
                      <p className="font-medium">
                        {currentTierInfo.offerLimit === -1 ? "Unlimited" : currentTierInfo.offerLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Max Offer Value</p>
                      <p className="font-medium">
                        {currentTierInfo.maxOfferValue === -1 ? "Unlimited" : `$${currentTierInfo.maxOfferValue.toLocaleString()}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Trust Score</p>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < currentTierInfo.trustScore ? "text-warning fill-current" : "text-neutral-300"}
                            />
                          ))}
                        </div>
                        <span className="text-sm">{currentTierInfo.trustScore}/5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-neutral-600">Completed Sales</p>
                      <p className="font-medium">{userProfile?.completedTransactions || 0}</p>
                    </div>
                  </div>
                  
                  {offerLimits && (
                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Offers Used This Month</span>
                        <span>{offerLimits.used} / {offerLimits.limit === -1 ? "∞" : offerLimits.limit}</span>
                      </div>
                      {offerLimits.limit !== -1 && (
                        <Progress value={(offerLimits.used / offerLimits.limit) * 100} className="h-2" />
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Benefits:</p>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      {currentTierInfo.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="mr-2 text-success" size={14} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {currentTier === "unverified" && (
                    <div className="bg-destructive/10 p-3 rounded-lg">
                      <p className="text-destructive text-sm font-medium mb-1">Consumer Warning</p>
                      <p className="text-destructive text-xs">
                        Unverified sellers display warning notices to consumers. Get verified to build trust and increase sales.
                      </p>
                    </div>
                  )}
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
                {(["verified", "trusted"] as const).map((tier) => {
                  const tierInfo = sellerVerificationTiers[tier];
                  const canUpgrade = currentTier === "unverified" || (currentTier === "verified" && tier === "trusted");
                  
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
                            <p className="text-neutral-600">Monthly Offers</p>
                            <p className="font-medium">
                              {tierInfo.offerLimit === -1 ? "Unlimited" : tierInfo.offerLimit}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-600">Max Value</p>
                            <p className="font-medium">
                              {tierInfo.maxOfferValue === -1 ? "Unlimited" : `$${tierInfo.maxOfferValue.toLocaleString()}`}
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
                    disabled={getVerificationProgress() < 60 || requestVerificationMutation.isPending}
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
                {Object.entries(sellerDocumentTypes).map(([type, name]) => {
                  const status = getDocumentStatus(type);
                  const isRequired = selectedTier === "verified" ? 
                    ["id_verification", "business_license", "bank_verification"].includes(type) :
                    ["id_verification", "business_license", "bank_verification", "insurance_coverage", "professional_references"].includes(type);

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
                <p><strong>Processing time:</strong> 1-3 business days</p>
                <p><strong>Seller benefits:</strong> Higher visibility, increased consumer trust, premium features</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileContainer>
  );
}
