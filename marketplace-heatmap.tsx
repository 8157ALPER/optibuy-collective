import { useState, useEffect } from "react";
import { TrendingUp, Users, Zap, Target, DollarSign, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeatmapData {
  categoryId: number;
  categoryName: string;
  totalBuyers: number;
  averagePrice: number;
  competitionLevel: "low" | "medium" | "high" | "extreme";
  lastActivity: string;
  trendingScore: number;
  activeOffers: number;
  demandGrowth: number;
}

interface MarketplaceHeatmapProps {
  userType: "consumer" | "seller" | "business";
  onCategoryClick?: (categoryId: number) => void;
}

export default function MarketplaceHeatmap({ userType, onCategoryClick }: MarketplaceHeatmapProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState("24h");

  // Mock data for heat map - in real app would come from API
  const heatmapData: HeatmapData[] = [
    {
      categoryId: 1,
      categoryName: "Electronics",
      totalBuyers: 2847,
      averagePrice: 1250,
      competitionLevel: "extreme",
      lastActivity: "2 minutes ago",
      trendingScore: 95,
      activeOffers: 23,
      demandGrowth: 47
    },
    {
      categoryId: 2,
      categoryName: "Automotive",
      totalBuyers: 1653,
      averagePrice: 35000,
      competitionLevel: "high",
      lastActivity: "5 minutes ago",
      trendingScore: 87,
      activeOffers: 15,
      demandGrowth: 32
    },
    {
      categoryId: 3,
      categoryName: "Home & Garden",
      totalBuyers: 943,
      averagePrice: 280,
      competitionLevel: "medium",
      lastActivity: "12 minutes ago",
      trendingScore: 72,
      activeOffers: 18,
      demandGrowth: 18
    },
    {
      categoryId: 4,
      categoryName: "Fashion",
      totalBuyers: 1247,
      averagePrice: 85,
      competitionLevel: "medium",
      lastActivity: "8 minutes ago",
      trendingScore: 68,
      activeOffers: 31,
      demandGrowth: 12
    },
    {
      categoryId: 5,
      categoryName: "Sports & Fitness",
      totalBuyers: 567,
      averagePrice: 450,
      competitionLevel: "low",
      lastActivity: "34 minutes ago",
      trendingScore: 45,
      activeOffers: 9,
      demandGrowth: 5
    },
    {
      categoryId: 6,
      categoryName: "Books & Media",
      totalBuyers: 234,
      averagePrice: 25,
      competitionLevel: "low",
      lastActivity: "1 hour ago",
      trendingScore: 28,
      activeOffers: 6,
      demandGrowth: -3
    }
  ];

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "extreme": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-400";
    }
  };

  const getCompetitionBorderColor = (level: string) => {
    switch (level) {
      case "extreme": return "border-red-200";
      case "high": return "border-orange-200";
      case "medium": return "border-yellow-200";
      case "low": return "border-green-200";
      default: return "border-gray-200";
    }
  };

  const getHeatIntensity = (trendingScore: number) => {
    if (trendingScore >= 90) return "opacity-100 scale-105";
    if (trendingScore >= 75) return "opacity-90 scale-102";
    if (trendingScore >= 60) return "opacity-80 scale-100";
    if (trendingScore >= 40) return "opacity-70 scale-98";
    return "opacity-60 scale-95";
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
    onCategoryClick?.(categoryId);
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="text-orange-500" size={20} />
          <h3 className="font-semibold">Live Market Heatmap</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === "24h" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("24h")}
          >
            24h
          </Button>
          <Button
            variant={timeRange === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("7d")}
          >
            7d
          </Button>
        </div>
      </div>

      {/* Competition Legend */}
      <div className="flex items-center space-x-4 text-xs">
        <span>Competition Level:</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>High</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Extreme</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {heatmapData.map((category, index) => (
          <motion.div
            key={category.categoryId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative ${getHeatIntensity(category.trendingScore)}`}
          >
            <Card 
              className={`cursor-pointer border-2 ${getCompetitionBorderColor(category.competitionLevel)} ${
                selectedCategory === category.categoryId ? 'ring-2 ring-blue-500' : ''
              } hover:shadow-lg transition-all duration-200`}
              onClick={() => handleCategoryClick(category.categoryId)}
            >
              <CardContent className="p-3">
                {/* Competition indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-3 h-3 ${getCompetitionColor(category.competitionLevel)} rounded-full animate-pulse`}></div>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-1 py-0"
                  >
                    {category.trendingScore}°
                  </Badge>
                </div>

                <h4 className="font-medium text-sm mb-2">{category.categoryName}</h4>

                {/* Key metrics */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Users size={10} />
                      <span>{category.totalBuyers.toLocaleString()} buyers</span>
                    </div>
                    <span className="text-green-600 font-medium">
                      ${category.averagePrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Target size={10} />
                      <span>{category.activeOffers} offers</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      category.demandGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp size={10} />
                      <span>{category.demandGrowth > 0 ? '+' : ''}{category.demandGrowth}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-500 flex items-center space-x-1">
                    <Clock size={10} />
                    <span>{category.lastActivity}</span>
                  </div>
                </div>

                {/* Hot category indicator */}
                {category.trendingScore > 85 && (
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-red-500 text-white text-xs px-1 py-0 animate-bounce">
                      🔥
                    </Badge>
                  </div>
                )}

                {/* Action button for sellers */}
                {userType === "seller" && category.competitionLevel !== "low" && (
                  <Button 
                    size="sm" 
                    className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to create offer for this category
                    }}
                  >
                    <Zap className="mr-1" size={12} />
                    Join Competition
                  </Button>
                )}

                {/* Opportunity indicator for buyers */}
                {userType !== "seller" && category.competitionLevel === "extreme" && (
                  <div className="mt-2 p-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                    <span className="font-medium">Best deals expected!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed view for selected category */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="text-orange-500" size={20} />
                <span>
                  {heatmapData.find(c => c.categoryId === selectedCategory)?.categoryName} 
                  Market Details
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const category = heatmapData.find(c => c.categoryId === selectedCategory);
                if (!category) return null;
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{category.totalBuyers.toLocaleString()}</p>
                      <p className="text-xs text-neutral-600">Active Buyers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">${category.averagePrice.toLocaleString()}</p>
                      <p className="text-xs text-neutral-600">Avg. Price</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{category.activeOffers}</p>
                      <p className="text-xs text-neutral-600">Live Offers</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${category.demandGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {category.demandGrowth > 0 ? '+' : ''}{category.demandGrowth}%
                      </p>
                      <p className="text-xs text-neutral-600">Growth</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
