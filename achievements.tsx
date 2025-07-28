import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import AchievementBadges, { generateUserAchievements } from "@/components/achievement-badges";

export default function Achievements() {
  const [, setLocation] = useLocation();

  // Mock user stats for achievements
  const userStats = {
    totalPurchases: 3,
    groupPurchases: 2,
    savingsGenerated: 250,
    referrals: 1
  };

  const achievements = generateUserAchievements(userStats);

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/consumer-dashboard")}
              className="p-1"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-medium">Achievements</h1>
              <p className="text-sm text-neutral-600">Track your collective buying progress</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AchievementBadges achievements={achievements} />
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Keep Going!
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Create more purchase intentions and invite friends to unlock new badges 
              and earn greater collective buying power.
            </p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
