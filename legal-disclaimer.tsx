import { ArrowLeft, Shield, AlertTriangle, FileText } from "lucide-react";
import { useLocation } from "wouter";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LegalDisclaimer() {
  const [, setLocation] = useLocation();

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">Legal Disclaimer</h2>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Platform Responsibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 text-warning" size={20} />
                Platform Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                OptiBuy operates as a marketplace platform that facilitates connections between buyers and sellers. 
                We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600">
                <li>Product quality, specifications, or delivery</li>
                <li>Transaction completion or payment processing</li>
                <li>Disputes between buyers and sellers</li>
                <li>Verification of seller credentials or capabilities</li>
                <li>Actual delivery of goods or services</li>
              </ul>
            </CardContent>
          </Card>

          {/* Company Information Disclaimer */}
          <Card className="border-l-4 border-l-warning">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 text-warning" size={20} />
                Company Information & Confidentiality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="bg-warning/10 p-3 rounded-lg">
                <p className="font-medium text-warning mb-2">Important Notice:</p>
                <p>
                  OptiBuy is NOT responsible for any company information, trade secrets, 
                  confidential data, or proprietary information disclosed by business users 
                  on this platform.
                </p>
              </div>
              
              <div className="space-y-3">
                <p><strong>By using OptiBuy as a business user, you acknowledge:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>You are solely responsible for protecting your confidential information</li>
                  <li>Any information shared in RFQs, specifications, or communications is at your own risk</li>
                  <li>OptiBuy does not guarantee the confidentiality of information shared on the platform</li>
                  <li>We recommend using non-disclosure agreements directly with potential suppliers</li>
                  <li>Avoid sharing sensitive company data, trade secrets, or proprietary information</li>
                </ul>
              </div>

              <div className="bg-neutral-100 p-3 rounded-lg">
                <p className="font-medium mb-2">Recommended Best Practices:</p>
                <ul className="list-disc list-inside space-y-1 text-neutral-600">
                  <li>Share only necessary information for procurement purposes</li>
                  <li>Use general specifications rather than proprietary details</li>
                  <li>Conduct detailed discussions through private channels</li>
                  <li>Implement your own confidentiality agreements with suppliers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 text-primary" size={20} />
                Data Usage & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                OptiBuy collects and analyzes market data to provide insights and improve our services. 
                This includes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600">
                <li>Aggregated demand and supply trends</li>
                <li>Market pricing information</li>
                <li>Category and sector analytics</li>
                <li>Platform usage statistics</li>
              </ul>
              <p className="text-neutral-600 mt-3">
                We may share anonymized, aggregated data with third parties for market research purposes. 
                Individual company information is never disclosed without explicit consent.
              </p>
            </CardContent>
          </Card>

          {/* Commission Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commission & Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                OptiBuy charges a 2% commission on successful transactions completed through the platform.
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600">
                <li>Commission is calculated on the final transaction value</li>
                <li>Sellers are responsible for providing transaction documentation</li>
                <li>Commission payment is required for continued platform access</li>
                <li>OptiBuy is not involved in direct payment processing between parties</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>All users must:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600">
                <li>Provide accurate and truthful information</li>
                <li>Comply with applicable laws and regulations</li>
                <li>Respect intellectual property rights</li>
                <li>Conduct business ethically and professionally</li>
                <li>Handle their own legal agreements and contracts</li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Footer */}
          <div className="text-xs text-neutral-500 text-center pb-6">
            <p>Last updated: December 25, 2024</p>
            <p className="mt-2">
              By using OptiBuy, you agree to these terms and conditions. 
              These disclaimers are subject to change without notice.
            </p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
