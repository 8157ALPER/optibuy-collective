import MobileContainer from "@/components/mobile-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <MobileContainer>
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Privacy Policy</h1>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 pb-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Privacy Policy for OptiBuy</CardTitle>
              <p className="text-sm text-neutral-600">
                <strong>Effective Date:</strong> July 10, 2025<br />
                <strong>Last Updated:</strong> July 10, 2025
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                OptiBuy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our collective purchasing platform mobile application and related services (the "Service").
              </p>
              <p className="font-medium text-red-600">
                <strong>Age Restriction:</strong> OptiBuy is intended for users who are 13 years of age or older. We do not knowingly collect personal information from children under 13. If you are under 13, please do not use this Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">2.1 Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Account Information:</strong> Name, email address, phone number, business information (for B2B users)</li>
                  <li><strong>Profile Data:</strong> User type (consumer, seller, business), location, preferences</li>
                  <li><strong>Purchase Intentions:</strong> Product requirements, quantity needs, price ranges, delivery locations</li>
                  <li><strong>Business Information:</strong> Company name, sector classification (veterinary, pharmacy, etc.), business verification details</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">2.2 Transaction Information</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Purchase Plans:</strong> Product specifications, quantities, target dates, flexibility preferences</li>
                  <li><strong>Offers and Bids:</strong> Seller proposals, volume discounts, competitive pricing</li>
                  <li><strong>Group Buying Data:</strong> Participation in collective purchases, group size tracking</li>
                  <li><strong>Commission Data:</strong> Platform revenue tracking and transaction fees</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">2.3 Technical Information</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
                  <li><strong>Usage Analytics:</strong> App usage patterns, feature interaction, session duration</li>
                  <li><strong>Location Data:</strong> City/region for delivery and local market matching</li>
                  <li><strong>Communication Data:</strong> Messages between buyers and sellers, notifications preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">3.1 Core Platform Services</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Collective Purchasing:</strong> Matching buyers with sellers for volume discounts</li>
                  <li><strong>Market Aggregation:</strong> Connecting multiple buyers for bulk purchasing power</li>
                  <li><strong>Offer Management:</strong> Facilitating seller proposals and buyer responses</li>
                  <li><strong>Group Coordination:</strong> Managing collective purchase timelines and logistics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">3.2 B2B Professional Services</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Sector Targeting:</strong> Connecting veterinary clinics and pharmacies with suppliers</li>
                  <li><strong>Professional Verification:</strong> Validating business credentials for B2B transactions</li>
                  <li><strong>Wholesale Matching:</strong> Facilitating bulk orders for professional buyers</li>
                  <li><strong>Supply Chain Optimization:</strong> Improving procurement efficiency for businesses</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">4.1 Seller-Buyer Interactions</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Purchase Intentions:</strong> Sellers can view anonymized buyer requirements</li>
                  <li><strong>Contact Permissions:</strong> Facilitating direct communication when authorized</li>
                  <li><strong>Group Formation:</strong> Sharing participant information for collective purchases</li>
                  <li><strong>Market Analytics:</strong> Providing aggregated demand data to suppliers</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">4.2 Service Providers</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Payment Processing:</strong> Secure transaction handling through third-party processors</li>
                  <li><strong>Cloud Services:</strong> Data storage and backup through secure cloud providers</li>
                  <li><strong>Analytics Services:</strong> Usage tracking and performance monitoring</li>
                  <li><strong>Communication Services:</strong> Email and SMS notifications through service providers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">5.1 Protection Measures</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Encryption:</strong> Data transmission and storage using industry-standard encryption</li>
                  <li><strong>Access Controls:</strong> Restricted access to personal information on need-to-know basis</li>
                  <li><strong>Security Monitoring:</strong> Continuous monitoring for unauthorized access attempts</li>
                  <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">5.2 User Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Account Security:</strong> Maintaining strong passwords and secure login practices</li>
                  <li><strong>Information Accuracy:</strong> Providing accurate and up-to-date profile information</li>
                  <li><strong>Privacy Settings:</strong> Managing personal privacy preferences and sharing permissions</li>
                  <li><strong>Suspicious Activity:</strong> Reporting potential security breaches or unauthorized access</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">6.1 Access and Control</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Data Access:</strong> Requesting copies of your personal information</li>
                  <li><strong>Data Correction:</strong> Updating or correcting inaccurate information</li>
                  <li><strong>Data Deletion:</strong> Requesting removal of your personal data (subject to legal requirements)</li>
                  <li><strong>Download Data:</strong> Exporting your data in a portable format</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">6.2 Communication Preferences</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Notification Settings:</strong> Controlling email, SMS, and push notification preferences</li>
                  <li><strong>Marketing Communications:</strong> Opting out of promotional messages</li>
                  <li><strong>Seller Contact:</strong> Managing permissions for seller communications</li>
                  <li><strong>Analytics Participation:</strong> Choosing whether to include data in market analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Age Verification and Restrictions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">7.1 Minimum Age Requirement</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Age Limit:</strong> Users must be 13 years of age or older to use OptiBuy</li>
                  <li><strong>Verification Process:</strong> Age verification during account registration</li>
                  <li><strong>Parental Consent:</strong> Users aged 13-17 may require parental consent in certain jurisdictions</li>
                  <li><strong>Account Termination:</strong> Immediate termination of accounts for users under 13</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">7.2 Protection Measures</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Registration Controls:</strong> Age verification questions during sign-up process</li>
                  <li><strong>Content Filtering:</strong> Age-appropriate content and interaction limitations</li>
                  <li><strong>Reporting System:</strong> Easy reporting of underage users</li>
                  <li><strong>Regular Monitoring:</strong> Ongoing verification of user age compliance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">8.1 Retention Periods</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Active Accounts:</strong> Personal data retained while account remains active</li>
                  <li><strong>Transaction Records:</strong> Purchase and offer data retained for legal and business purposes</li>
                  <li><strong>Analytics Data:</strong> Aggregated and anonymized data may be retained indefinitely</li>
                  <li><strong>Communication Records:</strong> Message history retained according to legal requirements</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">8.2 Deletion Policies</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Account Closure:</strong> Personal data deletion upon account termination (subject to legal obligations)</li>
                  <li><strong>Inactive Accounts:</strong> Automatic data removal after extended periods of inactivity</li>
                  <li><strong>Legal Requirements:</strong> Retention of certain data for compliance with laws and regulations</li>
                  <li><strong>User Requests:</strong> Prompt processing of data deletion requests where legally permissible</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Collective Purchasing Specific Provisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">9.1 Group Buying Data</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Participant Information:</strong> Limited sharing of buyer information for group formation</li>
                  <li><strong>Volume Requirements:</strong> Aggregation of quantity needs for bulk purchasing</li>
                  <li><strong>Timing Coordination:</strong> Sharing delivery timelines among group participants</li>
                  <li><strong>Pricing Transparency:</strong> Disclosure of volume discount structures</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">9.2 Professional B2B Features</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li><strong>Business Verification:</strong> Enhanced due diligence for professional accounts</li>
                  <li><strong>Sector Classification:</strong> Industry-specific grouping and targeted offers</li>
                  <li><strong>Supply Chain Integration:</strong> Connection with authorized distributors and wholesalers</li>
                  <li><strong>Regulatory Compliance:</strong> Adherence to industry-specific regulations and standards</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</p>
              <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
                <p><strong>Email:</strong> privacy@optibuy.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@optibuy.com</p>
                <p><strong>Support:</strong> support@optibuy.com</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center text-xs text-neutral-500 pt-6">
              <p><strong>Last Updated:</strong> July 10, 2025</p>
              <p><strong>Version:</strong> 1.0</p>
              <p className="mt-2">This Privacy Policy is designed to comply with applicable data protection laws and regulations. Users are encouraged to read this policy carefully and contact us with any questions or concerns.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
}
