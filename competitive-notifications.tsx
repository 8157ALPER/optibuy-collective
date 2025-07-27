import { useState, useEffect } from "react";
import { X, TrendingUp, Users, Clock, Zap, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface CompetitiveNotification {
  id: number;
  offerId: number;
  sellerId: number;
  targetAudience: "buyers" | "competitors" | "both";
  notificationType: "new_offer" | "price_drop" | "deadline_warning" | "competition_alert";
  title: string;
  message: string;
  priceInfo?: string;
  buyerPoolSize?: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
}

interface CompetitiveNotificationsProps {
  userId: number;
  userType: "consumer" | "seller" | "business";
}

export default function CompetitiveNotifications({ userId, userType }: CompetitiveNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<CompetitiveNotification[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["/api/notifications", userId],
    refetchInterval: 30000, // Poll every 30 seconds for real-time updates
    enabled: !!userId
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest("POST", `/api/notifications/${notificationId}/read`, {
        userId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", userId] });
    }
  });

  // Update visible notifications when new ones arrive
  useEffect(() => {
    const newNotifications = notifications.filter(
      (notif: CompetitiveNotification) => !dismissed.includes(notif.id)
    );
    setVisibleNotifications(newNotifications);
  }, [notifications, dismissed]);

  const handleDismiss = (notificationId: number) => {
    setDismissed(prev => [...prev, notificationId]);
    markAsReadMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string, urgency: string) => {
    if (urgency === "critical") return <Zap className="text-red-500" size={20} />;
    switch (type) {
      case "new_offer": return <TrendingUp className="text-blue-500" size={20} />;
      case "competition_alert": return <Zap className="text-orange-500" size={20} />;
      case "price_drop": return <DollarSign className="text-green-500" size={20} />;
      case "deadline_warning": return <Clock className="text-red-500" size={20} />;
      default: return <Users className="text-purple-500" size={20} />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "border-red-500 bg-red-50";
      case "high": return "border-orange-500 bg-orange-50";
      case "medium": return "border-blue-500 bg-blue-50";
      default: return "border-gray-300 bg-gray-50";
    }
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return "";
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} days left`;
    if (diffHours > 0) return `${diffHours} hours left`;
    return "Expires soon";
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {visibleNotifications.slice(0, 3).map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: index * 0.1 
            }}
            className="relative"
          >
            <Card className={`shadow-lg border-l-4 ${getUrgencyColor(notification.urgencyLevel)} cursor-pointer hover:shadow-xl transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getNotificationIcon(notification.notificationType, notification.urgencyLevel)}
                    <Badge 
                      variant={notification.urgencyLevel === "critical" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {notification.urgencyLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    <X size={14} />
                  </Button>
                </div>

                <h4 className="font-medium text-sm mb-1 line-clamp-2">
                  {notification.title}
                </h4>
                
                <p className="text-xs text-neutral-600 mb-3 line-clamp-3">
                  {notification.message}
                </p>

                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    {notification.priceInfo && (
                      <span className="font-medium text-green-600">
                        ${parseFloat(notification.priceInfo).toLocaleString()}
                      </span>
                    )}
                    {notification.buyerPoolSize && (
                      <div className="flex items-center space-x-1">
                        <Users size={12} />
                        <span>{notification.buyerPoolSize.toLocaleString()} buyers</span>
                      </div>
                    )}
                  </div>
                  
                  {notification.expiresAt && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Clock size={12} />
                      <span>{getTimeRemaining(notification.expiresAt)}</span>
                    </div>
                  )}
                </div>

                {(notification.notificationType === "competition_alert" && userType === "seller") && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      // Navigate to create offer page
                      window.location.href = "/create-offer";
                    }}
                  >
                    <TrendingUp className="mr-1" size={14} />
                    Counter Offer
                  </Button>
                )}

                {(notification.notificationType === "new_offer" && userType !== "seller") && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => {
                      // Navigate to offer details or consumer dashboard
                      window.location.href = "/consumer-dashboard";
                    }}
                  >
                    <Users className="mr-1" size={14} />
                    Join Group Buy
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Pulse animation for high priority */}
            {notification.urgencyLevel === "critical" && (
              <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse pointer-events-none" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* More notifications indicator */}
      {visibleNotifications.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Badge variant="outline" className="text-xs">
            +{visibleNotifications.length - 3} more notifications
          </Badge>
        </motion.div>
      )}
    </div>
  );
}
