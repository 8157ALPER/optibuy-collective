import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Timer, Tag, TrendingUp, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

interface PopupCampaign {
  id: number;
  title: string;
  description: string;
  brandName: string;
  productName: string;
  discountPercentage: number;
  currentParticipants: number;
  targetParticipants: number;
  priority: string;
  endDate: string;
  startDate: string;
}

interface TargetedPopupCampaignsProps {
  userId: number;
  userType: "consumer" | "seller" | "business";
}

export default function TargetedPopupCampaigns({ userId, userType }: TargetedPopupCampaignsProps) {
  const [visibleCampaigns, setVisibleCampaigns] = useState<PopupCampaign[]>([]);
  const [dismissedCampaigns, setDismissedCampaigns] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns/active", userId],
    refetchInterval: 60000, // Check for new campaigns every minute
    enabled: !!userId
  });

  const joinCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/join`, {
        userId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/active", userId] });
    }
  });

  const recordInteractionMutation = useMutation({
    mutationFn: async ({ campaignId, interactionType }: { campaignId: number; interactionType: string }) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/interact`, {
        userId,
        interactionType
      });
      return response.json();
    }
  });

  // Show new campaigns that haven't been dismissed
  useEffect(() => {
    if (campaigns.length > 0) {
      const newCampaigns = campaigns.filter(
        (campaign: PopupCampaign) => !dismissedCampaigns.includes(campaign.id)
      );
      setVisibleCampaigns(newCampaigns.slice(0, 2)); // Show max 2 at a time
    }
  }, [campaigns, dismissedCampaigns]);

  const handleDismiss = (campaignId: number) => {
    setDismissedCampaigns(prev => [...prev, campaignId]);
    recordInteractionMutation.mutate({ campaignId, interactionType: "dismiss" });
  };

  const handleJoin = (campaignId: number) => {
    joinCampaignMutation.mutate(campaignId);
    setDismissedCampaigns(prev => [...prev, campaignId]);
  };

  const handleView = (campaignId: number) => {
    recordInteractionMutation.mutate({ campaignId, interactionType: "view" });
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} days left`;
    if (diffHours > 0) return `${diffHours} hours left`;
    return "Ending soon";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-red-500 bg-red-50";
      case "high": return "border-orange-500 bg-orange-50";
      case "medium": return "border-blue-500 bg-blue-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {visibleCampaigns.map((campaign, index) => {
          const participationPercentage = (campaign.currentParticipants / campaign.targetParticipants) * 100;
          const remainingParticipants = campaign.targetParticipants - campaign.currentParticipants;

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                delay: index * 0.1 
              }}
              className="relative"
              onViewportEnter={() => handleView(campaign.id)}
            >
              <Card className={`shadow-xl border-l-4 ${getPriorityColor(campaign.priority)} cursor-pointer hover:shadow-2xl transition-all duration-300`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {campaign.brandName}
                        </Badge>
                        {campaign.priority === "urgent" && (
                          <Badge className="bg-red-500 text-white text-xs">
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-sm leading-tight">{campaign.title}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-600"
                      onClick={() => handleDismiss(campaign.id)}
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-neutral-600 mb-1">
                      <span className="flex items-center">
                        <Users size={12} className="mr-1" />
                        {campaign.currentParticipants.toLocaleString()} joined
                      </span>
                      <span className="flex items-center">
                        <Timer size={12} className="mr-1" />
                        {getTimeRemaining(campaign.endDate)}
                      </span>
                    </div>
                    
                    <Progress 
                      value={participationPercentage} 
                      className="h-2 mb-2"
                    />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-600">
                        {remainingParticipants} more needed
                      </span>
                      {campaign.discountPercentage && (
                        <Badge className="bg-green-500 text-white text-xs">
                          {campaign.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 mb-3 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      onClick={() => handleJoin(campaign.id)}
                      disabled={joinCampaignMutation.isPending}
                    >
                      {joinCampaignMutation.isPending ? (
                        "Joining..."
                      ) : (
                        <>
                          <Star className="mr-1" size={12} />
                          Join Deal
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-3"
                    >
                      <TrendingUp size={12} />
                    </Button>
                  </div>

                  {participationPercentage >= 90 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Star className="text-green-500 mr-1" size={14} />
                        <p className="text-xs text-green-700 font-medium">
                          Almost there! Deal activates at {campaign.targetParticipants} people.
                        </p>
                      </div>
                    </div>
                  )}

                  {campaign.priority === "urgent" && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                      <div className="flex items-center">
                        <Timer className="text-red-500 mr-1" size={14} />
                        <p className="text-xs text-red-700 font-medium">
                          Limited time! This offer expires in hours.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
