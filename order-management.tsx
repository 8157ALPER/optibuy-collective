import { useState } from "react";
import { ArrowLeft, Calendar, AlertTriangle, TrendingUp, Gift, Clock, Ban } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OrderManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [newAdvanceDate, setNewAdvanceDate] = useState("");
  const [selectedIntention, setSelectedIntention] = useState<any>(null);

  const { data: userIntentions = [] } = useQuery({
    queryKey: ["/api/purchase-intentions/user/1"], // Mock user ID
  });

  const { data: cancellationStatus } = useQuery({
    queryKey: ["/api/cancellation-status/1"], // Mock user ID
  });

  const { data: advancementOpportunities = [] } = useQuery({
    queryKey: ["/api/advancement-opportunities/1"], // Mock user ID
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ intentionId, reason }: { intentionId: number; reason: string }) => {
      const response = await apiRequest("POST", "/api/cancel-intention", {
        userId: 1, // Mock user ID
        intentionId,
        reason
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: data.penaltyApplied ? "Order cancelled with penalty" : "Order cancelled",
          description: data.penaltyApplied 
            ? "You've reached your monthly cancellation limit. Your account may be restricted."
            : "Your purchase intention has been cancelled successfully.",
          variant: data.penaltyApplied ? "destructive" : "default"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/purchase-intentions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/cancellation-status"] });
      }
    },
    onError: () => {
      toast({
        title: "Cancellation failed",
        description: "Unable to cancel your order. Please try again.",
        variant: "destructive"
      });
    }
  });

  const advanceMutation = useMutation({
    mutationFn: async ({ intentionId, newDate }: { intentionId: number; newDate: string }) => {
      const response = await apiRequest("POST", "/api/advance-order", {
        userId: 1, // Mock user ID
        intentionId,
        newDate
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Order advanced successfully!",
          description: `You earned ${data.bonusDiscount}% additional discount for moving your order forward.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/purchase-intentions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/advancement-opportunities"] });
      }
    },
    onError: () => {
      toast({
        title: "Order advancement failed",
        description: "Unable to advance your order. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCancel = (intention: any) => {
    if (!cancelReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for cancellation.",
        variant: "destructive"
      });
      return;
    }

    cancelMutation.mutate({
      intentionId: intention.id,
      reason: cancelReason
    });
    setCancelReason("");
    setSelectedIntention(null);
  };

  const handleAdvance = (intention: any) => {
    if (!newAdvanceDate) {
      toast({
        title: "Date required",
        description: "Please select a new target date.",
        variant: "destructive"
      });
      return;
    }

    advanceMutation.mutate({
      intentionId: intention.id,
      newDate: newAdvanceDate
    });
    setNewAdvanceDate("");
    setSelectedIntention(null);
  };

  const getTimeToDeadline = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const hours = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60));
    return hours;
  };

  const canCancel = (intention: any) => {
    const hoursToDeadline = getTimeToDeadline(intention.targetDate);
    return hoursToDeadline > 24 && intention.status === 'active';
  };

  const canAdvance = (intention: any) => {
    return intention.status === 'active' && new Date(intention.targetDate) > new Date();
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white p-4 border-b flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/consumer-dashboard")}
            className="mr-3 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold">Order Management</h1>
        </div>

        {/* Account Status Warning */}
        {cancellationStatus && cancellationStatus.cancellationsThisMonth >= 2 && (
          <div className="p-4">
            <Card className="border-l-4 border-l-warning bg-warning/10">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertTriangle className="text-warning mr-2 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-warning">Cancellation Warning</p>
                    <p className="text-sm text-neutral-700 mt-1">
                      You've cancelled {cancellationStatus.cancellationsThisMonth}/3 orders this month. 
                      One more cancellation will result in account suspension.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Orders */}
          <div>
            <h2 className="text-lg font-medium mb-3">Your Active Orders</h2>
            
            {userIntentions.length === 0 ? (
              <Card className="p-6 text-center">
                <Calendar className="mx-auto text-neutral-400 mb-3" size={48} />
                <p className="text-neutral-600 text-sm">No active orders</p>
                <p className="text-xs text-neutral-500 mt-1">Create a purchase intention to get started</p>
              </Card>
            ) : (
              userIntentions.map((intention: any) => {
                const hoursToDeadline = getTimeToDeadline(intention.targetDate);
                const isNearDeadline = hoursToDeadline <= 24;
                
                return (
                  <Card key={intention.id} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{intention.productName}</h3>
                          <p className="text-sm text-neutral-600">
                            Target: {new Date(intention.targetDate).toLocaleDateString()}
                          </p>
                          {intention.daysAdvanced > 0 && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Advanced {intention.daysAdvanced} days
                            </Badge>
                          )}
                        </div>
                        <Badge 
                          variant={isNearDeadline ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {hoursToDeadline > 0 ? `${Math.ceil(hoursToDeadline / 24)} days left` : "Overdue"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-neutral-600 text-xs">Budget Range</p>
                          <p className="font-medium">${intention.minPrice} - ${intention.maxPrice}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-xs">Quantity</p>
                          <p className="font-medium">{intention.quantity} units</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        {canAdvance(intention) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-primary border-primary"
                                onClick={() => setSelectedIntention(intention)}
                              >
                                <TrendingUp className="mr-1" size={14} />
                                Advance Order
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Advance Your Order</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <Gift className="text-primary mr-2" size={16} />
                                    <p className="text-sm font-medium">Early Purchase Bonus</p>
                                  </div>
                                  <p className="text-xs text-neutral-700">
                                    Move your order forward by 30+ days to earn up to 15% additional discount from sellers eager for early sales!
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="advance-date">New Target Date</Label>
                                  <Input
                                    id="advance-date"
                                    type="date"
                                    value={newAdvanceDate}
                                    onChange={(e) => setNewAdvanceDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={new Date(intention.targetDate).toISOString().split('T')[0]}
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleAdvance(intention)}
                                    disabled={advanceMutation.isPending}
                                    className="flex-1"
                                  >
                                    {advanceMutation.isPending ? "Processing..." : "Advance Order"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {canCancel(intention) ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => setSelectedIntention(intention)}
                              >
                                <Ban className="mr-1" size={14} />
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Order</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-warning/10 p-3 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <AlertTriangle className="text-warning mr-2" size={16} />
                                    <p className="text-sm font-medium">Cancellation Policy</p>
                                  </div>
                                  <p className="text-xs text-neutral-700">
                                    You can cancel up to 3 orders per month. Frequent cancellations may result in account restrictions.
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="cancel-reason">Reason for cancellation</Label>
                                  <Textarea
                                    id="cancel-reason"
                                    placeholder="Please explain why you need to cancel this order..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleCancel(intention)}
                                    disabled={cancelMutation.isPending}
                                    className="flex-1"
                                  >
                                    {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex-1 text-center">
                            <Badge variant="secondary" className="text-xs">
                              {isNearDeadline ? "Cancel deadline passed" : "Cannot cancel"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Advancement Opportunities */}
          {advancementOpportunities.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">Your Advancement Rewards</h2>
              {advancementOpportunities.map((reward: any) => (
                <Card key={reward.id} className="mb-3 border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-primary">Bonus Discount Earned</h3>
                        <p className="text-sm text-neutral-600">
                          {reward.bonusDiscount}% discount for advancing {reward.daysAdvanced} days
                        </p>
                      </div>
                      <Badge 
                        variant={reward.status === "redeemed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {reward.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
