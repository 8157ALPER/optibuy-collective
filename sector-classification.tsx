import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Target, Calendar, ShoppingBag, Building2 } from "lucide-react";

import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SectorClassification() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState({
    whatToBuy: "",
    whenToBuy: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const classificationMutation = useMutation({
    mutationFn: async (data: { questionType: string; response: string }) => {
      const response = await apiRequest("POST", "/api/classification", {
        userId: 1, // In a real app, get from auth context
        ...data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classification"] });
    }
  });

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!responses.whatToBuy.trim()) {
        toast({
          title: "Response Required",
          description: "Please tell us what you want to buy",
          variant: "destructive"
        });
        return;
      }
      
      await classificationMutation.mutateAsync({
        questionType: "what_to_buy",
        response: responses.whatToBuy
      });
      
      setCurrentStep(2);
    } else {
      if (!responses.whenToBuy.trim()) {
        toast({
          title: "Response Required", 
          description: "Please tell us when you're planning to buy",
          variant: "destructive"
        });
        return;
      }
      
      await classificationMutation.mutateAsync({
        questionType: "when_to_buy",
        response: responses.whenToBuy
      });
      
      toast({
        title: "Classification Complete",
        description: "Thank you! We'll show you relevant offers and campaigns.",
      });
      
      setLocation("/consumer-dashboard");
    }
  };

  const suggestedCategories = [
    "Electronics & Technology",
    "Automotive & Transportation", 
    "Fashion & Apparel",
    "Home & Garden",
    "Health & Wellness",
    "Food & Beverages",
    "Business & Industrial Equipment",
    "Sports & Recreation"
  ];

  const timingOptions = [
    "Immediately (within 1 week)",
    "Soon (within 1 month)",
    "Planning ahead (2-3 months)",
    "Future consideration (6+ months)",
    "Flexible timing - waiting for best deal"
  ];

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Sector Classification</h1>
              <p className="text-sm text-neutral-600">Help us personalize your experience</p>
            </div>
            <div className="text-sm text-neutral-500">
              Step {currentStep} of 2
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="mr-2 text-blue-500" size={24} />
                    What do you want to buy?
                  </CardTitle>
                  <p className="text-sm text-neutral-600">
                    Tell us about the products or services you're interested in purchasing. 
                    This helps us categorize you and show relevant group buying opportunities.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe what you're looking to buy... (e.g., smartphones, office furniture, raw materials for manufacturing, etc.)"
                    value={responses.whatToBuy}
                    onChange={(e) => setResponses(prev => ({ ...prev, whatToBuy: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-2">Common Categories:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedCategories.map((category) => (
                        <Button
                          key={category}
                          variant="outline"
                          size="sm"
                          className="text-xs justify-start h-auto py-2 px-3"
                          onClick={() => setResponses(prev => ({ 
                            ...prev, 
                            whatToBuy: prev.whatToBuy ? `${prev.whatToBuy}, ${category}` : category 
                          }))}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Target className="text-blue-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-blue-900">Why we ask this</h3>
                      <p className="text-sm text-blue-700">
                        By understanding your purchasing interests, we can:
                      </p>
                      <ul className="text-sm text-blue-700 mt-1 ml-2">
                        <li>• Show you relevant group buying opportunities</li>
                        <li>• Connect you with similar buyers for better discounts</li>
                        <li>• Send targeted campaign notifications from brands</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 text-green-500" size={24} />
                    When are you planning to buy?
                  </CardTitle>
                  <p className="text-sm text-neutral-600">
                    Understanding your timeline helps us prioritize the most relevant 
                    opportunities and notify you of time-sensitive deals.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe your purchase timeline... (e.g., need new laptops for office by end of quarter, planning wedding in 6 months, etc.)"
                    value={responses.whenToBuy}
                    onChange={(e) => setResponses(prev => ({ ...prev, whenToBuy: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-2">Common Timelines:</p>
                    <div className="space-y-2">
                      {timingOptions.map((option) => (
                        <Button
                          key={option}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => setResponses(prev => ({ 
                            ...prev, 
                            whenToBuy: option
                          }))}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Building2 className="text-green-500 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-medium text-green-900">Timeline Benefits</h3>
                      <p className="text-sm text-green-700">
                        Sharing your timeline allows us to:
                      </p>
                      <ul className="text-sm text-green-700 mt-1 ml-2">
                        <li>• Match you with time-sensitive group deals</li>
                        <li>• Prioritize urgent vs. future purchase opportunities</li>
                        <li>• Send campaign alerts that match your schedule</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleNext}
              disabled={classificationMutation.isPending}
              className="w-full"
              size="lg"
            >
              {classificationMutation.isPending ? (
                "Processing..."
              ) : currentStep === 1 ? (
                <>
                  Continue to Timeline
                  <ChevronRight className="ml-2" size={16} />
                </>
              ) : (
                "Complete Classification"
              )}
            </Button>

            {currentStep === 2 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="w-full"
              >
                Back to Product Categories
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => setLocation("/consumer-dashboard")}
              className="w-full text-neutral-600"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
