import { Trophy, Users, Target, Star, Award, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  compact?: boolean;
}

const rarityColors = {
  common: "bg-gray-100 text-gray-800 border-gray-300",
  rare: "bg-blue-100 text-blue-800 border-blue-300", 
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  legendary: "bg-yellow-100 text-yellow-800 border-yellow-300"
};

export default function AchievementBadges({ achievements, compact = false }: AchievementBadgesProps) {
  if (compact) {
    const earnedCount = achievements.filter(a => a.earned).length;
    return (
      <div className="flex items-center space-x-2">
        <Trophy className="text-yellow-500" size={16} />
        <span className="text-sm text-gray-600">{earnedCount}/{achievements.length} achievements</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievement Badges</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              achievement.earned 
                ? rarityColors[achievement.rarity] + " shadow-md"
                : "bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${achievement.earned ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"}`}>
                {achievement.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium truncate">{achievement.title}</h4>
                  {achievement.earned && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                </div>
                
                <p className="text-sm opacity-80 mt-1">{achievement.description}</p>
                
                {achievement.progress !== undefined && achievement.maxProgress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sample achievement data generator
export function generateUserAchievements(userStats: {
  totalPurchases: number;
  groupPurchases: number;
  savingsGenerated: number;
  referrals: number;
}): Achievement[] {
  return [
    {
      id: "first_purchase",
      title: "First Steps",
      description: "Created your first purchase intention",
      icon: <Target size={20} />,
      earned: userStats.totalPurchases >= 1,
      rarity: "common"
    },
    {
      id: "group_buyer", 
      title: "Team Player",
      description: "Joined 5 group purchases",
      icon: <Users size={20} />,
      earned: userStats.groupPurchases >= 5,
      progress: Math.min(userStats.groupPurchases, 5),
      maxProgress: 5,
      rarity: "rare"
    },
    {
      id: "savings_master",
      title: "Savings Master",
      description: "Generated $500+ in collective savings",
      icon: <Award size={20} />,
      earned: userStats.savingsGenerated >= 500,
      progress: Math.min(userStats.savingsGenerated, 500),
      maxProgress: 500,
      rarity: "epic"
    },
    {
      id: "community_builder",
      title: "Community Builder", 
      description: "Referred 10 new users to OptiBuy",
      icon: <Star size={20} />,
      earned: userStats.referrals >= 10,
      progress: Math.min(userStats.referrals, 10),
      maxProgress: 10,
      rarity: "legendary"
    }
  ];
}
