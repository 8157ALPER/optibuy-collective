import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Users, DollarSign, Clock, Zap, Target, Medal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface LeaderboardEntry {
  sellerId: number;
  sellerName: string;
  companyName: string;
  currentPrice: number;
  originalPrice: number;
  discountPercent: number;
  buyerInterest: number;
  responseTime: string;
  rank: number;
  rankChange: "up" | "down" | "same";
  isWinning: boolean;
  completedDeals: number;
  averageRating: number;
}

interface ProductCompetition {
  productName: string;
  categoryId: number;
  totalBuyers: number;
  deadline: string;
  status: "open" | "heating_up" | "final_hours" | "closed";
  prizePool: number;
  entries: LeaderboardEntry[];
}

interface CompetitionLeaderboardProps {
  productName?: string;
  userType: "consumer" | "seller" | "business";
  currentUserId?: number;
}

export default function CompetitionLeaderboard({ 
  productName = "iPhone 15 Pro", 
  userType, 
  currentUserId = 1 
}: CompetitionLeaderboardProps) {
  const [competition, setCompetition] = useState<ProductCompetition>({
    productName,
    categoryId: 1,
    totalBuyers: 1247,
    deadline: "2 days, 14 hours",
    status: "heating_up",
    prizePool: 125000,
    entries: [
      {
        sellerId: 1,
        sellerName: "TechStore Pro",
        companyName: "TechStore Electronics",
        currentPrice: 999,
        originalPrice: 1199,
        discountPercent: 17,
        buyerInterest: 347,
        responseTime: "2 min",
        rank: 1,
        rankChange: "up",
        isWinning: true,
        completedDeals: 156,
        averageRating: 4.8
      },
      {
        sellerId: 2,
        sellerName: "MegaTech",
        companyName: "MegaTech Solutions",
        currentPrice: 1049,
        originalPrice: 1199,
        discountPercent: 13,
        buyerInterest: 298,
        responseTime: "5 min",
        rank: 2,
        rankChange: "down",
        isWinning: false,
        completedDeals: 203,
        averageRating: 4.6
      },
      {
        sellerId: 3,
        sellerName: "ElectroWorld",
        companyName: "ElectroWorld Inc",
        currentPrice: 1079,
        originalPrice: 1199,
        discountPercent: 10,
        buyerInterest: 185,
        responseTime: "12 min",
        rank: 3,
        rankChange: "same",
        isWinning: false,
        completedDeals: 89,
        averageRating: 4.5
      },
      {
        sellerId: 4,
        sellerName: "GadgetHub",
        companyName: "GadgetHub Limited",
        currentPrice: 1099,
        originalPrice: 1199,
        discountPercent: 8,
        buyerInterest: 156,
        responseTime: "8 min",
        rank: 4,
        rankChange: "up",
        isWinning: false,
        completedDeals: 67,
        averageRating: 4.4
      },
      {
        sellerId: 5,
        sellerName: "PhoneMart",
        companyName: "PhoneMart Express",
        currentPrice: 1129,
        originalPrice: 1199,
        discountPercent: 6,
        buyerInterest: 94,
        responseTime: "15 min",
        rank: 5,
        rankChange: "down",
        isWinning: false,
        completedDeals: 34,
        averageRating: 4.2
      }
    ]
  });

  // Simulate real-time rank changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCompetition(prev => {
        const newEntries = [...prev.entries];
        
        // Randomly update some prices and rankings
        const randomEntry = newEntries[Math.floor(Math.random() * newEntries.length)];
        if (Math.random() > 0.7) {
          const newPrice = randomEntry.currentPrice - Math.floor(Math.random() * 20) - 5;
          randomEntry.currentPrice = Math.max(newPrice, randomEntry.originalPrice * 0.7);
          randomEntry.discountPercent = Math.round(((randomEntry.originalPrice - randomEntry.currentPrice) / randomEntry.originalPrice) * 100);
          randomEntry.buyerInterest += Math.floor(Math.random() * 20) + 5;
        }

        // Sort by price and update rankings
        newEntries.sort((a, b) => a.currentPrice - b.currentPrice);
        newEntries.forEach((entry, index) => {
          const oldRank = entry.rank;
          entry.rank = index + 1;
          entry.isWinning = index === 0;
          
          if (entry.rank < oldRank) entry.rankChange = "up";
          else if (entry.rank > oldRank) entry.rankChange = "down";
          else entry.rankChange = "same";
        });

        return { ...prev, entries: newEntries };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={16} />;
      case 2: return <Medal className="text-gray-400" size={16} />;
      case 3: return <Medal className="text-orange-600" size={16} />;
      default: return <span className="text-sm font-bold text-neutral-600">#{rank}</span>;
    }
  };

  const getRankChangeIcon = (change: string) => {
    switch (change) {
      case "up": return <TrendingUp className="text-green-500" size={12} />;
      case "down": return <TrendingUp className="text-red-500 rotate-180" size={12} />;
      default: return <div className="w-3 h-3 bg-gray-300 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "final_hours": return "text-red-600 bg-red-100";
      case "heating_up": return "text-orange-600 bg-orange-100";
      case "open": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const timeProgress = () => {
    if (competition.status === "final_hours") return 90;
    if (competition.status === "heating_up") return 60;
    if (competition.status === "open") return 30;
    return 100;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="text-orange-500" size={20} />
            <span className="text-lg">Competition Leaderboard</span>
          </div>
          <Badge className={`${getStatusColor(competition.status)} text-xs`}>
            {competition.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
        
        {/* Competition header */}
        <div className="space-y-2">
          <h3 className="font-medium">{competition.productName}</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-neutral-600">Total Buyers</p>
              <p className="font-bold text-blue-600">{competition.totalBuyers.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-neutral-600">Prize Pool</p>
              <p className="font-bold text-green-600">${competition.prizePool.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-neutral-600">Time Left</p>
              <p className="font-bold text-orange-600">{competition.deadline}</p>
            </div>
          </div>
          
          {/* Progress bar for deadline */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Competition Progress</span>
              <span>{timeProgress()}%</span>
            </div>
            <Progress value={timeProgress()} className="h-2" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1">
          <AnimatePresence>
            {competition.entries.map((entry, index) => (
              <motion.div
                key={entry.sellerId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`p-3 border-l-4 ${
                  entry.isWinning ? 'border-l-yellow-500 bg-yellow-50' : 
                  entry.sellerId === currentUserId ? 'border-l-blue-500 bg-blue-50' : 
                  'border-l-gray-300 hover:bg-gray-50'
                } ${index < competition.entries.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getRankIcon(entry.rank)}
                      {getRankChangeIcon(entry.rankChange)}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm flex items-center space-x-2">
                        <span>{entry.sellerName}</span>
                        {entry.isWinning && (
                          <Badge className="bg-yellow-500 text-white text-xs px-1 py-0">
                            Leading
                          </Badge>
                        )}
                        {entry.sellerId === currentUserId && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            You
                          </Badge>
                        )}
                      </h4>
                      <p className="text-xs text-neutral-600">{entry.companyName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      ${entry.currentPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500 line-through">
                      ${entry.originalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-neutral-600">Discount</p>
                    <p className="font-medium text-green-600">{entry.discountPercent}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-neutral-600">Interest</p>
                    <p className="font-medium">{entry.buyerInterest}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-neutral-600">Response</p>
                    <p className="font-medium">{entry.responseTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-neutral-600">Rating</p>
                    <p className="font-medium">⭐ {entry.averageRating}</p>
                  </div>
                </div>

                {/* Action buttons */}
                {userType === "seller" && entry.sellerId === currentUserId && (
                  <Button 
                    size="sm" 
                    className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-xs"
                  >
                    <DollarSign className="mr-1" size={12} />
                    Update Your Price
                  </Button>
                )}

                {userType === "seller" && entry.sellerId !== currentUserId && !entry.isWinning && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full mt-2 text-xs"
                  >
                    <Target className="mr-1" size={12} />
                    Beat ${entry.currentPrice}
                  </Button>
                )}

                {userType !== "seller" && entry.isWinning && (
                  <Button 
                    size="sm" 
                    className="w-full mt-2 text-xs"
                  >
                    <Users className="mr-1" size={12} />
                    Join {entry.buyerInterest} Buyers
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Competition footer */}
        <div className="p-3 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>Updates every 30 seconds</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target size={12} />
              <span>{competition.entries.length} sellers competing</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
