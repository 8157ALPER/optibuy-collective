import { useState, useEffect } from "react";
import { Sparkles, Clock, Users, TrendingUp, Star, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductRecommendation {
  productName: string;
  category: string;
  reasoning: string;
  confidence: number;
  estimatedPrice: number;
  groupBuyingPotential: number;
  urgency: "low" | "medium" | "high";
  tags: string[];
}

interface AIRecommendationsProps {
  userId: number;
  context?: "dashboard" | "browsing" | "category" | "mood";
  mood?: string;
  categoryFilter?: string;
  compact?: boolean;
  onRecommendationClick?: (recommendation: ProductRecommendation) => void;
}

const urgencyColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-red-100 text-red-800"
};

const urgencyIcons = {
  low: Clock,
  medium: TrendingUp,
  high: Star
};

export default function AIRecommendations({ 
  userId, 
  context = "dashboard", 
  mood, 
  categoryFilter,
  compact = false,
  onRecommendationClick 
}: AIRecommendationsProps) {
  const [isPersonalizing, setIsPersonalizing] = useState(true);

  const { data: recommendations = [], isLoading, error } = useQuery({
    queryKey: ["/api/ai/recommendations", userId, context, mood, categoryFilter],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Simulate personalization loading
  useEffect(() => {
    const timer = setTimeout(() => setIsPersonalizing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isPersonalizing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-purple-500 animate-pulse" size={20} />
          <span className="text-sm text-gray-600">Personalizing recommendations...</span>
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-3" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            AI recommendations temporarily unavailable. Showing popular items instead.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (compact && recommendations.length > 0) {
    const topRecommendation = recommendations[0];
    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                <Sparkles className="text-purple-600 dark:text-purple-400" size={16} />
              </div>
              <div>
                <p className="font-medium text-sm">{topRecommendation.productName}</p>
                <p className="text-xs text-gray-600">AI picked for you</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-purple-600">${topRecommendation.estimatedPrice}</p>
              <div className="flex items-center space-x-1">
                <Users size={12} className="text-gray-500" />
                <span className="text-xs text-gray-500">
                  {Math.round(topRecommendation.groupBuyingPotential * 100)}% group potential
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-purple-500" size={20} />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Personalized
        </Badge>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec: ProductRecommendation, index: number) => {
          const UrgencyIcon = urgencyIcons[rec.urgency];
          
          return (
            <Card 
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500"
              onClick={() => onRecommendationClick?.(rec)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {rec.productName}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {rec.reasoning}
                    </p>
                  </div>
                  
                  <ChevronRight size={16} className="text-gray-400 mt-1" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        ${rec.estimatedPrice}
                      </p>
                      <p className="text-xs text-gray-500">Est. price</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Users size={14} className="text-blue-500" />
                        <span className="text-sm font-medium">
                          {Math.round(rec.groupBuyingPotential * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Group potential</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="text-sm font-medium">
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Confidence</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={urgencyColors[rec.urgency]}>
                      <UrgencyIcon size={12} className="mr-1" />
                      {rec.urgency}
                    </Badge>
                  </div>
                </div>

                {rec.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {rec.tags.slice(0, 3).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Card className="border-dashed border-gray-300">
          <CardContent className="p-6 text-center">
            <Sparkles className="text-gray-400 mx-auto mb-2" size={32} />
            <p className="text-gray-500">No recommendations available</p>
            <p className="text-sm text-gray-400">
              Create more purchase intentions to improve AI suggestions
            </p>
          </CardContent>
        </Card>
      )}

      <Button 
        variant="ghost" 
        className="w-full text-purple-600 hover:text-purple-700"
        onClick={() => {/* Navigate to full recommendations page */}}
      >
        <Sparkles size={16} className="mr-2" />
        View All AI Insights
      </Button>
    </div>
  );
}

// Hook for AI-powered purchase timing optimization
export function usePurchaseTimingOptimization(userId: number, productName: string) {
  return useQuery({
    queryKey: ["/api/ai/timing", userId, productName],
    enabled: !!productName,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
