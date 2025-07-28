import { useState } from "react";
import { Bell, Search, Plus, Car, Home, Laptop, Trophy } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileContainer from "@/components/mobile-container";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AchievementBadges, { generateUserAchievements } from "@/components/achievement-badges";
import OnboardingTour, { useOnboardingTour } from "@/components/onboarding-tour";
import GroupNegotiationVisual from "@/components/group-negotiation-visual";
import MoodTracker from "@/components/mood-tracker";
import AIRecommendations from "@/components/ai-recommendations";
import MobileIntegration from "@/components/mobile-integration";

export default function ConsumerDashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { hasSeenTour, completeTour } = useOnboardingTour();
  const [showTour, setShowTour] = useState(!hasSeenTour);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: userIntentions = [] } = useQuery({
    queryKey: ["/api/purchase-intentions", "1"], // Mock user ID
  });

  // Mock user stats for achievements
  const userStats = {
    totalPurchases: 3,
    groupPurchases: 2,
    savingsGenerated: 250,
    referrals: 1
  };

  const achievements = generateUserAchievements(userStats);

  // Mock group negotiation data
  const mockGroupData = {
    intentionId: 1,
    productName: "iPhone 15 Pro Max",
    targetPrice: 999,
    currentPrice: 1099,
    participantCount: 12,
    targetParticipants: 20,
    timeRemaining: "2 days, 14 hours",
    status: "active" as const,
    priceHistory: [
      { timestamp: new Date(), price: 1199, participants: 1 },
      { timestamp: new Date(), price: 1150, participants: 5 },
      { timestamp: new Date(), price: 1100, participants: 10 }
    ],
    recentJoins: [
      { name: "Sarah M.", joinedAt: new Date() },
      { name: "Mike K.", joinedAt: new Date() }
    ]
  };

  const categoryIcons: Record<string, any> = {
    "Automotive": Car,
    "Home & Garden": Home,
    "Electronics": Laptop,
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header with search */}
        <div className="bg-white shadow-sm px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-medium">Hello, Sarah</h1>
              <p className="text-sm text-neutral-600">Find your next collective purchase</p>
            </div>
            <div className="relative">
              <Bell className="text-neutral-600 text-xl" size={24} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" size={20} />
            <Input
              type="text"
              placeholder="Search products or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 rounded-lg border-none"
            />
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="px-4 py-3 bg-white border-b dashboard-overview">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">3</div>
              <div className="text-xs text-neutral-600">Active Plans</div>
            </div>
            <div className="text-center savings-display">
              <div className="text-lg font-bold text-secondary">$250</div>
              <div className="text-xs text-neutral-600">Total Saved</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">7</div>
              <div className="text-xs text-neutral-600">New Offers</div>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Achievement Badges - compact view */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Your Progress</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/achievements")}
                className="text-primary text-sm font-medium flex items-center space-x-1"
              >
                <Trophy size={16} />
                <span>View All</span>
              </Button>
            </div>
            <AchievementBadges achievements={achievements} compact={true} />
          </div>

          {/* Simple Mood Tracker (Consumer Only) */}
          <div className="px-4 pb-4">
            <MoodTracker compact={true} />
          </div>

          {/* AI Recommendations */}
          <div className="px-4 pb-4">
            <AIRecommendations 
              userId={1} 
              context="dashboard"
              compact={true}
              onRecommendationClick={(rec) => {
                // Navigate to product or create intention
                console.log("Recommendation clicked:", rec);
              }}
            />
          </div>

          {/* Active Group Negotiation */}
          {userIntentions.length > 0 && (
            <div className="px-4 pb-4">
              <h3 className="font-medium mb-3">Live Group Purchase</h3>
              <GroupNegotiationVisual data={mockGroupData} compact={true} />
            </div>
          )}

          {/* Categories */}
          <div className="p-4">
            <h3 className="font-medium mb-3">Popular Categories</h3>
            <div className="grid grid-cols-3 gap-3">
              {categories.slice(0, 6).map((category: any) => {
                const IconComponent = categoryIcons[category.name] || Car;
                return (
                  <Card key={category.id} className="text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <IconComponent className="text-primary text-2xl mb-2 mx-auto" size={32} />
                      <p className="text-xs font-medium">{category.name}</p>
                      <p className="text-xs text-accent">234 buyers</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Active purchase intentions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Your Purchase Plans</h3>
              <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
                View All
              </Button>
            </div>
            
            {userIntentions.length === 0 ? (
              <Card className="p-4 text-center">
                <p className="text-neutral-600 text-sm">No purchase plans yet</p>
                <p className="text-xs text-neutral-500 mt-1">Create your first plan to get started</p>
              </Card>
            ) : (
              userIntentions.map((plan: any) => (
                <Card key={plan.id} className="p-4 mb-3 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{plan.productName}</h4>
                      <p className="text-sm text-neutral-600">
                        Target: {new Date(plan.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-warning/10 text-warning">
                      Pending
                    </Badge>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Collective Interest</span>
                      <span>847 of 1000</span>
                    </div>
                    <Progress value={84.7} className="w-full h-2" />
                  </div>
                  
                  {/* Offers */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-600">Best Offer</p>
                      <p className="font-bold text-success">$42,500</p>
                    </div>
                    <Button size="sm" className="bg-primary text-white px-4 py-2 rounded-lg text-sm">
                      View Offers
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {/* Trending purchases */}
          <div className="p-4 pb-24">
            <h3 className="font-medium mb-3">Trending Now</h3>
            <Card className="p-3 mb-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center">
                    <Laptop className="text-neutral-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">iPhone 15 Pro</p>
                    <p className="text-xs text-neutral-600">1,234 buyers interested</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
                  Join
                </Button>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Bottom navigation */}
        <BottomNavigation userType="consumer" />
        
        {/* Floating Action Button */}
        <Button
          onClick={() => setLocation("/create-intention")}
          className="absolute bottom-20 right-4 w-14 h-14 bg-accent text-white rounded-full shadow-lg p-0 create-intention-btn"
        >
          <Plus size={24} />
        </Button>

        {/* Onboarding Tour */}
        <OnboardingTour
          isOpen={showTour}
          onComplete={() => {
            completeTour();
            setShowTour(false);
          }}
          onSkip={() => {
            completeTour();
            setShowTour(false);
          }}
          userType="consumer"
        />
      </div>
    </MobileContainer>
  );
}
