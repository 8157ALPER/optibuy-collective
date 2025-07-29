import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Users, Package, Clock, TrendingUp, Building2, Stethoscope, CheckCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AggregationNavigation from "@/components/aggregation-navigation";
import WarehouseCompetition from "@/components/warehouse-competition";

interface AggregationOrder {
  id: number;
  productName: string;
  productCode?: string;
  unitPrice: number;
  minimumQuantity: number;
  currentQuantity: number;
  maxParticipants: number;
  currentParticipants: number;
  targetSector: string;
  deadline: string;
  status: string;
  description?: string;
  initiatorId: number;
}

interface AggregationParticipant {
  id: number;
  participantId: number;
  requestedQuantity: number;
  participantType: string;
  joinedAt: string;
}

export default function VeterinaryAggregation() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showWarehouseCompetition, setShowWarehouseCompetition] = useState<number | null>(null);
  const [joinQuantity, setJoinQuantity] = useState(10);

  // Form state for creating new aggregation order
  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    unitPrice: "",
    minimumQuantity: "",
    maxParticipants: "",
    deadline: "",
    description: "",
    specifications: ""
  });

  const { data: aggregationOrders, isLoading } = useQuery<AggregationOrder[]>({
    queryKey: ["/api/aggregation-orders", { sector: "veterinary" }],
  });

  const { data: userOrders } = useQuery<AggregationOrder[]>({
    queryKey: ["/api/user/aggregation-orders"],
  });

  const { data: selectedOrderParticipants } = useQuery<AggregationParticipant[]>({
    queryKey: ["/api/aggregation-orders", selectedOrderId, "participants"],
    enabled: !!selectedOrderId,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("/api/aggregation-orders", {
        method: "POST",
        body: {
          ...orderData,
          unitPrice: parseFloat(orderData.unitPrice),
          minimumQuantity: parseInt(orderData.minimumQuantity),
          maxParticipants: parseInt(orderData.maxParticipants),
          deadline: new Date(orderData.deadline).toISOString(),
          targetSector: "veterinary",
          categoryId: 1 // Default category, should be selected in real app
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aggregation-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/aggregation-orders"] });
      setShowCreateDialog(false);
      setFormData({
        productName: "", productCode: "", unitPrice: "", minimumQuantity: "",
        maxParticipants: "", deadline: "", description: "", specifications: ""
      });
      toast({
        title: "Aggregation Order Created",
        description: "Your order is now collecting participants from other veterinary clinics.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create aggregation order.",
        variant: "destructive",
      });
    },
  });

  const joinOrderMutation = useMutation({
    mutationFn: async ({ orderId, quantity }: { orderId: number; quantity: number }) => {
      return apiRequest(`/api/aggregation-orders/${orderId}/join`, {
        method: "POST",
        body: {
          requestedQuantity: quantity,
          participantType: "veterinary_clinic"
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/aggregation-orders"] });
      toast({
        title: "Successfully Joined",
        description: "You've joined the aggregation order. We'll notify you when it reaches minimum quantity.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join aggregation order.",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrder = () => {
    createOrderMutation.mutate(formData);
  };

  const handleJoinOrder = (orderId: number) => {
    joinOrderMutation.mutate({ orderId, quantity: joinQuantity });
  };

  const calculateProgress = (current: number, minimum: number) => {
    return Math.round((current / minimum) * 100);
  };

  const calculateVolumeDiscount = (basePrice: number, quantity: number) => {
    let discount = 0;
    if (quantity >= 1000) discount = 15;
    else if (quantity >= 500) discount = 10;
    else if (quantity >= 250) discount = 7;
    else if (quantity >= 100) discount = 5;
    
    const finalPrice = basePrice * (1 - discount / 100);
    return { discount, finalPrice, savings: basePrice - finalPrice };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <AggregationNavigation currentUser={{ userType: "business", businessSubsector: "veterinary_clinic" }} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Veterinary Aggregation Orders</h1>
            <p className="text-muted-foreground">
              Join with other veterinary clinics to achieve volume discounts from warehouses
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Aggregation Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Aggregation Order</DialogTitle>
                <DialogDescription>
                  Start collecting orders from other veterinary clinics for bulk purchasing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Antibiotic Amoxicillin 500mg"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code (Optional)</Label>
                  <Input
                    id="productCode"
                    placeholder="e.g., AMX-500-VET"
                    value={formData.productCode}
                    onChange={(e) => setFormData({...formData, productCode: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price (₺)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="25.50"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minimumQuantity">Min Quantity</Label>
                    <Input
                      id="minimumQuantity"
                      type="number"
                      placeholder="1000"
                      value={formData.minimumQuantity}
                      onChange={(e) => setFormData({...formData, minimumQuantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Clinics</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      placeholder="100"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the product or requirements"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleCreateOrder} 
                  disabled={createOrderMutation.isPending || !formData.productName || !formData.unitPrice}
                  className="w-full"
                >
                  {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregationOrders?.filter(o => o.status === 'collecting').length || 0}</div>
              <p className="text-xs text-muted-foreground">Collecting participants</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Orders</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userOrders?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Initiated or joined</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Quote</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aggregationOrders?.filter(o => o.status === 'ready_for_quote').length || 0}</div>
              <p className="text-xs text-muted-foreground">Reached minimum</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,000</div>
              <p className="text-xs text-muted-foreground">In Istanbul</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Aggregation Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Aggregation Orders</h2>
          
          {aggregationOrders?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No active aggregation orders</p>
                <p className="text-muted-foreground mb-4">Be the first to create an order for bulk purchasing</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create First Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aggregationOrders?.map((order) => {
                const progress = calculateProgress(order.currentQuantity, order.minimumQuantity);
                const { discount, finalPrice, savings } = calculateVolumeDiscount(order.unitPrice, order.currentQuantity);
                const deadline = new Date(order.deadline);
                const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{order.productName}</CardTitle>
                        <Badge variant={order.status === 'collecting' ? 'default' : 'secondary'}>
                          {order.status === 'collecting' ? 'Collecting' : 'Ready'}
                        </Badge>
                      </div>
                      {order.productCode && (
                        <CardDescription>Code: {order.productCode}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{order.currentQuantity} / {order.minimumQuantity} units</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                        <div className="text-xs text-muted-foreground">
                          {progress}% completed
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Unit Price</p>
                          <p className="font-medium">₺{order.unitPrice}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Participants</p>
                          <p className="font-medium">{order.currentParticipants} / {order.maxParticipants}</p>
                        </div>
                      </div>
                      
                      {discount > 0 && (
                        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            {discount}% Volume Discount
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Save ₺{savings.toFixed(2)} per unit
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{daysLeft} days left</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Quantity"
                            min="1"
                            value={joinQuantity}
                            onChange={(e) => setJoinQuantity(parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <Button 
                          onClick={() => handleJoinOrder(order.id)}
                          disabled={joinOrderMutation.isPending || order.currentParticipants >= order.maxParticipants}
                          size="sm"
                        >
                          {joinOrderMutation.isPending ? "Joining..." : "Join"}
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Participants
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
