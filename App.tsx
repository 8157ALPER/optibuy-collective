import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import CompetitiveNotifications from "@/components/competitive-notifications";
import FlashDealAlerts from "@/components/flash-deal-alerts";
import LegalDisclaimerBanner from "@/components/legal-disclaimer-banner";
import Onboarding from "@/pages/onboarding";
import UserTypeSelection from "@/pages/user-type-selection";
import ConsumerDashboard from "@/pages/consumer-dashboard";
import SellerDashboard from "@/pages/seller-dashboard";
import BusinessDashboard from "@/pages/business-dashboard";
import CreatePurchaseIntention from "@/pages/create-purchase-intention";
import CreateOffer from "@/pages/create-offer";
import CreateRFQ from "@/pages/create-rfq";
import RFQList from "@/pages/rfq-list";
import LegalDisclaimer from "@/pages/legal-disclaimer";
import VerificationCenter from "@/pages/verification-center";
import SellerVerification from "@/pages/seller-verification";
import SectorClassification from "@/pages/sector-classification";
import CampaignManagement from "@/pages/campaign-management";
import VeterinaryAggregation from "@/pages/veterinary-aggregation";
import PharmacyAggregation from "@/pages/pharmacy-aggregation";
import SectorDashboard from "@/pages/sector-dashboard";
import Achievements from "@/pages/achievements";
import MobileFeatures from "@/pages/mobile-features";
import AccountDeletion from "@/pages/account-deletion";
import DataDeletion from "@/pages/data-deletion";
import NotFound from "@/pages/not-found";
import Categories from "@/pages/categories";
import MyPlans from "@/pages/my-plans";
import Profile from "@/pages/profile";
import PrivacyPolicy from "@/pages/privacy-policy";
import { lazy } from "react";

const OrderManagement = lazy(() => import("@/pages/order-management"));
const BusinessOrderManagement = lazy(() => import("@/pages/business-order-management"));
const EmailPreferences = lazy(() => import("@/pages/email-preferences"));
const CompetitiveDashboard = lazy(() => import("@/pages/competitive-dashboard"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/user-type" component={UserTypeSelection} />
      <Route path="/consumer-dashboard" component={ConsumerDashboard} />
      <Route path="/seller-dashboard" component={SellerDashboard} />
      <Route path="/business-dashboard" component={BusinessDashboard} />
      <Route path="/create-intention" component={CreatePurchaseIntention} />
      <Route path="/create-offer" component={CreateOffer} />
      <Route path="/create-rfq" component={CreateRFQ} />
      <Route path="/rfq-list" component={RFQList} />
      <Route path="/legal" component={LegalDisclaimer} />
      <Route path="/verification" component={VerificationCenter} />
      <Route path="/seller-verification" component={SellerVerification} />
      <Route path="/sector-classification" component={SectorClassification} />
      <Route path="/campaign-management" component={CampaignManagement} />
      <Route path="/veterinary-aggregation" component={VeterinaryAggregation} />
      <Route path="/pharmacy-aggregation" component={PharmacyAggregation} />
      <Route path="/sector-dashboard" component={SectorDashboard} />
      <Route path="/categories" component={Categories} />
      <Route path="/my-plans" component={MyPlans} />
      <Route path="/profile" component={Profile} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/mobile-features" component={MobileFeatures} />
      <Route path="/account-deletion" component={AccountDeletion} />
      <Route path="/data-deletion" component={DataDeletion} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentUser] = useState({
    id: 1, // Mock user ID - in real app would come from auth
    userType: "seller" as "consumer" | "seller" | "business"
  });

  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(true);

  return (
    <ThemeProvider defaultTheme="light" storageKey="optibuy-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          {showLegalDisclaimer && (
            <LegalDisclaimerBanner 
              variant="fulfillment"
              onAccept={() => setShowLegalDisclaimer(false)}
            />
          )}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
