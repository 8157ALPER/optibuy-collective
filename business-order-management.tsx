import { useState } from "react";
import { ArrowLeft, Calendar, AlertTriangle, TrendingUp, Gift, Clock, Ban, Building, DollarSign } from "lucide-react";
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

export default function BusinessOrderManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [newAdvanceDate, setNewAdvanceDate] = useState("");
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);

  const { data: businessRFQs = [] } = useQuery({
    queryKey: ["/api/rfqs/buyer/1"], // Mock user ID
  });

  const { data: cancellationStatus } = useQuery({
    queryKey: ["/api/cancellation-status/1"], // Mock user ID
  });

  const { data: advancementOpportunities = [] } = useQuery({
    queryKey: ["/api/advancement-opportunities/1"], // Mock user ID
  });

  const cancelRFQMutation = useMutation({
    mutationFn: async ({ rfqId, reason }: { rfqId: number; reason: string }) => {
      const response = await apiRequest("POST", "/api/cancel-rfq", {
        userId: 1, // Mock user ID
        rfqId,
        reason
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: data.penaltyApplied ? "RFQ cancelled with penalty" : "RFQ cancelled",
          description: data.penaltyApplied 
            ? `You've reached your monthly RFQ cancellation limit. Account restricted for 60 days.${data.compensationRequired ? ` Compensation required: $${data.compensationRequired}` : ''}`
            : `Your RFQ has been cancelled successfully.${data.compensationRequired ? ` Compensation required: $${data.compensationRequired}` : ''}`,
          variant: data.penaltyApplied ? "destructive" : "default"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/rfqs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/cancellation-status"] });
      }
    },
    onError: () => {
      toast({
        title: "RFQ cancellation failed",
        description: "Unable to cancel your RFQ. Please try again.",
        variant: "destructive"
      });
    }
  });

  const advanceRFQMutation = useMutation({
    mutationFn: async ({ rfqId, newDate }: { rfqId: number; newDate: string }) => {
      const response = await apiRequest("POST", "/api/advance-rfq", {
        userId: 1, // Mock user ID
        rfqId,
        newDate
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "RFQ advanced successfully!",
          description: `You earned ${data.bonusDiscount}% additional discount and $${data.costSavings?.toLocaleString()} in cost savings by moving your RFQ forward.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/rfqs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/advancement-opportunities"] });
      }
    },
    onError: () => {
      toast({
        title: "RFQ advancement failed",
        description: "Unable to advance your RFQ. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCancelRFQ = (rfq: any) => {
    if (!cancelReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a business reason for cancellation.",
        variant: "destructive"
      });
      return;
    }

    cancelRFQMutation.mutate({
      rfqId: rfq.id,
      reason: cancelReason
    });
    setCancelReason("");
    setSelectedRFQ(null);
  };

  const handleAdvanceRFQ = (rfq: any) => {
    if (!newAdvanceDate) {
      toast({
        title: "Date required",
        description: "Please select a new deadline date.",
        variant: "destructive"
      });
      return;
    }

    advanceRFQMutation.mutate({
      rfqId: rfq.id,
      newDate: newAdvanceDate
    });
    setNewAdvanceDate("");
    setSelectedRFQ(null);
  };

  const getTimeToDeadline = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const hours = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60));
    return hours;
  };

  const canCancelRFQ = (rfq: any) => {
    const hoursToDeadline = getTimeToDeadline(rfq.deadline);
    return hoursToDeadline > 48 && rfq.status === 'active'; // 48-hour deadline for B2B
  };

  const canAdvanceRFQ = (rfq: any) => {
    return rfq.status === 'active' && new Date(rfq.deadline) > new Date();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white p-4 border-b flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/business-dashboard")}
            className="mr-3 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <Building className="mr-2 text-primary" size={20} />
          <h1 className="text-xl font-semibold">Business Order Management</h1>
        </div>

        {/* Account Status Warning */}
        {cancellationStatus && cancellationStatus.rfqCancellationsThisMonth >= 1 && (
          <div className="p-4">
            <Card className="border-l-4 border-l-warning bg-warning/10">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertTriangle className="text-warning mr-2 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-warning">Business Cancellation Warning</p>
                    <p className="text-sm text-neutral-700 mt-1">
                      You've cancelled {cancellationStatus.rfqCancellationsThisMonth}/2 RFQs this month. 
                      One more cancellation will result in 60-day account suspension and may require supplier compensation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active RFQs */}
          <div>
            <h2 className="text-lg font-medium mb-3">Your Active RFQs</h2>
            
            {businessRFQs.length === 0 ? (
              <Card className="p-6 text-center">
                <Calendar className="mx-auto text-neutral-400 mb-3" size={48} />
                <p className="text-neutral-600 text-sm">No active RFQs</p>
                <p className="text-xs text-neutral-500 mt-1">Create an RFQ to start procurement</p>
              </Card>
            ) : (
              businessRFQs.map((rfq: any) => {
                const hoursToDeadline = getTimeToDeadline(rfq.deadline);
                const isNearDeadline = hoursToDeadline <= 48; // 48-hour threshold for B2B
                
                return (
                  <Card key={rfq.id} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{rfq.productName}</h3>
                          <p className="text-sm text-neutral-600">
                            Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                          </p>
                          {rfq.daysAdvanced > 0 && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Advanced {rfq.daysAdvanced} days
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={isNearDeadline ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {hoursToDeadline > 0 ? `${Math.ceil(hoursToDeadline / 24)} days left` : "Overdue"}
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${getUrgencyColor(rfq.businessUrgency || 'medium')}`} 
                               title={`${rfq.businessUrgency || 'medium'} priority`} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-neutral-600 text-xs">Target Price</p>
                          <p className="font-medium">${rfq.targetPrice?.toLocaleString() || 'TBD'}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 text-xs">Quantity</p>
                          <p className="font-medium">{rfq.quantity?.toLocaleString()} units</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-neutral-600 text-xs">Specifications</p>
                        <p className="text-sm">{rfq.specifications}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        {canAdvanceRFQ(rfq) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-primary border-primary"
                                onClick={() => setSelectedRFQ(rfq)}
                              >
                                <TrendingUp className="mr-1" size={14} />
                                Advance Deadline
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Advance Your RFQ Deadline</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <Gift className="text-primary mr-2" size={16} />
                                    <p className="text-sm font-medium">Early Procurement Bonus</p>
                                  </div>
                                  <p className="text-xs text-neutral-700">
                                    Move your deadline forward by 15+ days to earn up to 20% additional discount! 
                                    Suppliers offer better prices for confirmed early orders.
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="advance-deadline">New Deadline</Label>
                                  <Input
                                    id="advance-deadline"
                                    type="date"
                                    value={newAdvanceDate}
                                    onChange={(e) => setNewAdvanceDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    max={new Date(rfq.deadline).toISOString().split('T')[0]}
                                    className="mt-1"
                                  />
                                </div>
                                
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <DollarSign className="text-green-600 mr-2" size={16} />
                                    <p className="text-sm font-medium text-green-800">Estimated Cost Savings</p>
                                  </div>
                                  <p className="text-xs text-green-700">
                                    Based on your quantity and target price, advancing could save your business 
                                    significant procurement costs through early-bird supplier discounts.
                                  </p>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleAdvanceRFQ(rfq)}
                                    disabled={advanceRFQMutation.isPending}
                                    className="flex-1"
                                  >
                                    {advanceRFQMutation.isPending ? "Processing..." : "Advance Deadline"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {canCancelRFQ(rfq) ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => setSelectedRFQ(rfq)}
                              >
                                <Ban className="mr-1" size={14} />
                                Cancel RFQ
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Business RFQ</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-warning/10 p-3 rounded-lg">
                                  <div className="flex items-center mb-2">
                                    <AlertTriangle className="text-warning mr-2" size={16} />
                                    <p className="text-sm font-medium">B2B Cancellation Policy</p>
                                  </div>
                                  <p className="text-xs text-neutral-700">
                                    Business users can cancel up to 2 RFQs per month. Frequent cancellations result in 
                                    60-day suspension. Cancellations within 72 hours may require supplier compensation.
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="cancel-reason">Business reason for cancellation</Label>
                                  <Textarea
                                    id="cancel-reason"
                                    placeholder="Please explain the business reason for cancelling this RFQ (budget changes, requirements change, project postponed, etc.)"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleCancelRFQ(rfq)}
                                    disabled={cancelRFQMutation.isPending}
                                    className="flex-1"
                                  >
                                    {cancelRFQMutation.isPending ? "Cancelling..." : "Cancel RFQ"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex-1 text-center">
                            <Badge variant="secondary" className="text-xs">
                              {isNearDeadline ? "Cancel deadline passed (48h)" : "Cannot cancel"}
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
          {advancementOpportunities.filter((reward: any) => reward.rfqId).length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">Your Business Advancement Rewards</h2>
              {advancementOpportunities.filter((reward: any) => reward.rfqId).map((reward: any) => (
                <Card key={reward.id} className="mb-3 border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-primary">Cost Savings Achieved</h3>
                        <p className="text-sm text-neutral-600">
                          {reward.bonusDiscount}% procurement discount for advancing {reward.daysAdvanced} days
                        </p>
                      </div>
                      <Badge 
                        variant={reward.status === "redeemed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {reward.status}
                      </Badge>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-sm">
                      <div className="flex items-center">
                        <DollarSign className="text-green-600 mr-1" size={14} />
                        <span className="font-medium text-green-800">
                          ${parseFloat(reward.costSavings || "0").toLocaleString()} saved
                        </span>
                      </div>
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
