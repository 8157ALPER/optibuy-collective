import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  animation?: "slideIn" | "fadeIn" | "bounce";
  action?: "highlight" | "point" | "circle";
}

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userType: "consumer" | "business" | "seller";
}

const tourSteps = {
  consumer: [
    {
      id: "welcome",
      title: "Welcome to OptiBuy!",
      content: "Discover your invisible buying neighbors and unlock group purchasing power. Let's take a quick tour!",
      animation: "slideIn"
    },
    {
      id: "dashboard",
      title: "Your Dashboard",
      content: "This is your personal hub where you can see all your purchase intentions and group progress.",
      target: ".dashboard-overview",
      animation: "fadeIn",
      action: "highlight"
    },
    {
      id: "create_intention",
      title: "Create Purchase Plans", 
      content: "Express what you want to buy and when. We'll find others with similar needs!",
      target: ".create-intention-btn",
      animation: "bounce",
      action: "circle"
    },
    {
      id: "group_power",
      title: "Group Buying Power",
      content: "Watch as others join your intention. More people = better prices for everyone!",
      animation: "slideIn"
    },
    {
      id: "savings",
      title: "Track Your Savings",
      content: "See how much you've saved through collective purchasing. Every dollar counts!",
      target: ".savings-display",
      animation: "fadeIn", 
      action: "highlight"
    }
  ],
  business: [
    {
      id: "welcome_business",
      title: "Welcome to OptiBuy for Business!",
      content: "Optimize your procurement with B2B group purchasing. Let's explore your tools!",
      animation: "slideIn"
    },
    {
      id: "procurement_dashboard",
      title: "Procurement Hub",
      content: "Manage all your business purchase needs and connect with suppliers.",
      target: ".business-dashboard",
      animation: "fadeIn",
      action: "highlight"
    },
    {
      id: "bulk_orders",
      title: "Bulk Order Management",
      content: "Create large-scale purchase intentions and leverage volume discounts.",
      target: ".bulk-order-section",
      animation: "bounce",
      action: "circle"
    },
    {
      id: "supplier_network",
      title: "Supplier Network",
      content: "Access our verified network of veterinary and pharmacy suppliers.",
      animation: "slideIn"
    }
  ],
  seller: [
    {
      id: "welcome_seller",
      title: "Welcome to OptiBuy for Sellers!",
      content: "Connect with buyers and maximize your sales through group offers. Let's get started!",
      animation: "slideIn"
    },
    {
      id: "seller_dashboard",
      title: "Seller Control Center",
      content: "Monitor your offers, track buyer interest, and manage your inventory.",
      target: ".seller-dashboard",
      animation: "fadeIn",
      action: "highlight"
    },
    {
      id: "create_offers",
      title: "Create Volume Offers",
      content: "Set up offers with volume discounts to attract group purchases.",
      target: ".create-offer-btn",
      animation: "bounce",
      action: "circle"
    },
    {
      id: "analytics",
      title: "Market Analytics",
      content: "View demand patterns and optimize your pricing strategies.",
      animation: "slideIn"
    }
  ]
};

export default function OnboardingTour({ isOpen, onComplete, onSkip, userType }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const steps = tourSteps[userType];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const getAnimationClass = (animation?: string) => {
    if (isAnimating) return "opacity-0 scale-95";
    
    switch (animation) {
      case "slideIn":
        return "animate-slide-in-bottom";
      case "fadeIn":
        return "animate-fade-in";
      case "bounce":
        return "animate-bounce-in";
      default:
        return "animate-fade-in";
    }
  };

  if (!isOpen || !steps.length) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Play className="text-blue-500" size={20} />
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </Button>
          </div>

          <div className={`transition-all duration-300 ${getAnimationClass(step.animation)}`}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {step.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {step.content}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </Button>

            <Button
              onClick={nextStep}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
            >
              <span>{currentStep === steps.length - 1 ? "Get Started" : "Next"}</span>
              {currentStep !== steps.length - 1 && <ChevronRight size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Highlight overlay for targeted elements */}
      {step.target && step.action === "highlight" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-lg" 
               style={{
                 top: "20%",
                 left: "10%", 
                 width: "80%",
                 height: "60%"
               }} 
          />
        </div>
      )}
    </div>
  );
}

// Hook to manage onboarding state
export function useOnboardingTour() {
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem("optibuy_tour_completed") === "true";
  });

  const completeTour = () => {
    setHasSeenTour(true);
    localStorage.setItem("optibuy_tour_completed", "true");
  };

  const resetTour = () => {
    setHasSeenTour(false);
    localStorage.removeItem("optibuy_tour_completed");
  };

  return {
    hasSeenTour,
    completeTour,
    resetTour
  };
}
