import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Clock, ShoppingCart, Users, Award, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

interface FulfillmentStatus {
  id: number;
  categoryId: number;
  productName: string;
  selectedOfferId?: number;
  backupOfferIds: string[];
  totalBuyers: number;
  selectionStatus: "pending" | "auto_selected" | "manual_review" | "completed" | "failed";
  selectionCriteria: string;
  deadlineDate: string;
  selectionProcessedAt?: string;
}

interface SelectedOffer {
  id: number;
  sellerId: number;
  productName: string;
  price: string;
  fulfillmentStatus: "pending" | "confirmed" | "failed" | "cancelled";
  sellerName?: string;
  companyName?: string;
}

interface OrderFulfillmentStatusProps {
  categoryId: number;
  productName: string;
  onStatusUpdate?: (status: FulfillmentStatus) => void;
}

export default function OrderFulfillmentStatus({ 
  categoryId, 
  productName, 
  onStatusUpdate 
}: OrderFulfillmentStatusProps) {
  const [showLegalNotice, setShowLegalNotice] = useState(true);
  const queryClient = useQueryClient();

  const { data: fulfillmentStatus, isLoading } = useQuery({
    queryKey: ["/api/fulfillment-status", categoryId, productName],
    refetchInterval: 10000, // Check every 10 seconds for updates
  });

  const { data: selectedOffer } = useQuery({
    queryKey: ["/api/offers", fulfillmentStatus?.selectedOfferId],
    enabled: !!fulfillmentStatus?.selectedOfferId,
  });

  const processDeadlineMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/process-deadline-closure", {
        categoryId,
        productName
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fulfillment-status"] });
    }
  });

  const acknowledgeLegalMutation = useMutation({
    mutationFn: async (acknowledgmentType: string) => {
      const response = await apiRequest("POST", "/api/legal-acknowledgment", {
        userId: 1, // Mock user ID
        acknowledgmentType,
        content: getLegalContent(acknowledgmentType)
      });
      return response.json();
    },
    onSuccess: () => {
      setShowLegalNotice(false);
    }
  });

  useEffect(() => {
    if (fulfillmentStatus) {
      onStatusUpdate?.(fulfillmentStatus);
    }
  }, [fulfillmentStatus, onStatusUpdate]);

  const getLegalContent = (type: string) => {
    switch (type) {
      case "fulfillment_disclaimer":
        return "I acknowledge that OptiBuy is not responsible for seller fulfillment, manufacturing, or delivery. OptiBuy facilitates connections between buyers and sellers but does not guarantee order completion.";
      case "selection_process":
        return "I understand that OptiBuy automatically selects the best offer based on price and availability after deadline closure, with backup options in case of seller failure.";
      default:
        return "General acknowledgment of OptiBuy terms and conditions.";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "auto_selected": return "text-blue-600 bg-blue-100";
      case "failed": return "text-red-600 bg-red-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="text-green-500" size={20} />;
      case "auto_selected": return <Award className="text-blue-500" size={20} />;
      case "failed": return <AlertTriangle className="text-red-500" size={20} />;
      case "pending": return <Clock className="text-yellow-500" size={20} />;
      default: return <RefreshCw className="text-gray-500" size={20} />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
          <p>Checking fulfillment status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legal Notice */}
      <AnimatePresence>
        {showLegalNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-l-4 border-l-orange-500 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-orange-500 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-800 mb-2">Important Legal Notice</h3>
                    <div className="text-sm text-orange-700 mb-3 space-y-1">
                      <p>• OptiBuy automatically selects the best offer (lowest price) after deadline closure</p>
                      <p>• If a seller cannot fulfill orders, we automatically switch to the next best option</p>
                      <p>• OptiBuy is NOT responsible for manufacturing, delivery, or order fulfillment</p>
                      <p>• Sellers are solely responsible for completing customer orders</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => acknowledgeLegalMutation.mutate("fulfillment_disclaimer")}
                      disabled={acknowledgeLegalMutation.isPending}
                    >
                      I Understand & Acknowledge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fulfillment Status */}
      {fulfillmentStatus ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(fulfillmentStatus.selectionStatus)}
                <span>Order Fulfillment Status</span>
              </div>
              <Badge className={`${getStatusColor(fulfillmentStatus.selectionStatus)} text-xs`}>
                {fulfillmentStatus.selectionStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Product</p>
                <p className="font-medium">{fulfillmentStatus.productName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Buyers</p>
                <p className="font-medium">{fulfillmentStatus.totalBuyers.toLocaleString()}</p>
              </div>
            </div>

            {fulfillmentStatus.selectionStatus === "auto_selected" && selectedOffer && (
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="text-green-500" size={16} />
                  <span className="font-medium text-green-800">Best Offer Selected</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-600">Selected Price</p>
                    <p className="font-bold text-lg text-green-600">${parseFloat(selectedOffer.price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">Selection Criteria</p>
                    <p className="font-medium">Lowest Price</p>
                  </div>
                </div>
                
                {fulfillmentStatus.backupOfferIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-neutral-600 mb-1">Backup Options Available</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={100} className="flex-1 h-2" />
                      <span className="text-xs text-green-600 font-medium">
                        {fulfillmentStatus.backupOfferIds.length} backups ready
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {fulfillmentStatus.selectionStatus === "pending" && (
              <div className="text-center py-4">
                <Clock className="mx-auto mb-2 text-yellow-500" size={32} />
                <p className="text-neutral-600 mb-3">Deadline is still open. Selection will happen automatically when deadline closes.</p>
                <Button 
                  onClick={() => processDeadlineMutation.mutate()}
                  disabled={processDeadlineMutation.isPending}
                  variant="outline"
                >
                  <RefreshCw className="mr-2" size={16} />
                  Simulate Deadline Closure
                </Button>
              </div>
            )}

            <div className="text-xs text-neutral-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">Selection Process:</p>
              <p>✓ OptiBuy automatically sorts all offers by price (lowest to highest)</p>
              <p>✓ Best offer (cheapest) is selected automatically after deadline</p>
              <p>✓ If seller fails, we switch to 2nd best offer automatically</p>
              <p>✓ Process continues until order is fulfilled or all options exhausted</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingCart className="mx-auto mb-2 text-neutral-400" size={48} />
            <p className="text-neutral-600">No fulfillment process started yet.</p>
            <p className="text-xs text-neutral-500 mt-1">Status will appear once offers are submitted.</p>
          </CardContent>
        </Card>
      )}

      {/* Additional Legal Footer */}
      <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded border">
        <p className="font-medium mb-1">Legal Disclaimer:</p>
        <p>OptiBuy acts solely as a marketplace facilitator. We are not responsible for seller performance, manufacturing delays, quality issues, or delivery problems. All contractual obligations are between buyers and sellers directly.</p>
      </div>
    </div>
  );
}
