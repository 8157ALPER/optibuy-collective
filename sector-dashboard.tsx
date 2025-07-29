import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Stethoscope, 
  Pill, 
  Building2, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowRight,
  BarChart3,
  ShoppingCart,
  Target
} from "lucide-react";
import AggregationNavigation from "@/components/aggregation-navigation";

interface AggregationOrder {
  id: number;
  productName: string;
  currentQuantity: number;
  minimumQuantity: number;
  currentParticipants: number;
  maxParticipants: number;
  targetSector: string;
  status: string;
  unitPrice: number;
}

interface SectorStats {
  totalBusinesses: number;
  activeOrders: number;
  totalSavings: number;
  avgDiscount: number;
}

export default function SectorDashboard() {
  const { toast } = useToast();
  const [selectedSector, setSelectedSector] = useState<"veterinary" | "pharmaceutical">("veterinary");

  const { data: veterinaryOrders } = useQuery<AggregationOrder[]>({
    queryKey: ["/api/aggregation-orders", { sector: "veterinary" }],
  });

  const { data: pharmaceuticalOrders } = useQuery<AggregationOrder[]>({
    queryKey: ["/api/aggregation-orders", { sector: "pharmaceutical" }],
  });

  const veterinaryStats: SectorStats = {
    totalBusinesses: 2000, // Veterinary clinics in Istanbul
    activeOrders: veterinaryOrders?.filter(o => o.status === 'collecting').length || 0,
    totalSavings: 85000,
    avgDiscount: 12
  };

  const pharmacyStats: SectorStats = {
    totalBusinesses: 12000, // Pharmacies in Turkey
    activeOrders: pharmaceuticalOrders?.filter(o => o.status === 'collecting').length || 0,
    totalSavings: 125000,
    avgDiscount: 15
  };

  const calculateProgress = (current: number, minimum: number) => {
    return Math.min(100, Math.round((current / minimum) * 100));
  };

  const getTopOrders = (orders: AggregationOrder[]) => {
    return orders
      ?.filter(o => o.status === 'collecting')
      ?.sort((a, b) => calculateProgress(b.currentQuantity, b.minimumQuantity) - calculateProgress(a.currentQuantity, a.minimumQuantity))
      ?.slice(0, 3) || [];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <AggregationNavigation />
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Sector Aggregation Dashboard</h1>
          <p className="text-muted-foreground">
            B2B collective purchasing across veterinary and pharmaceutical sectors
          </p>
        </div>

        {/* Sector Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Veterinary Sector */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Veterinary Sector</CardTitle>
                    <CardDescription>Clinics & Warehouse Distributors</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{veterinaryStats.activeOrders} Active</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {veterinaryStats.totalBusinesses.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Vet Clinics</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₺{veterinaryStats.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Savings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {veterinaryStats.avgDiscount}%
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Discount</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Top Active Orders</h4>
                {getTopOrders(veterinaryOrders || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active orders</p>
                ) : (
                  getTopOrders(veterinaryOrders || []).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{order.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.currentParticipants} clinics joined
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {calculateProgress(order.currentQuantity, order.minimumQuantity)}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2">
                <Link href="/veterinary-aggregation">
                  <Button className="w-full gap-2">
                    View Veterinary Orders
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pharmaceutical Sector */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Pharmaceutical Sector</CardTitle>
                    <CardDescription>Pharmacies & Pharmaceutical Warehouses</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">{pharmacyStats.activeOrders} Active</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {pharmacyStats.totalBusinesses.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Pharmacies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₺{pharmacyStats.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Savings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {pharmacyStats.avgDiscount}%
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Discount</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Top Active Orders</h4>
                {getTopOrders(pharmaceuticalOrders || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active orders</p>
                ) : (
                  getTopOrders(pharmaceuticalOrders || []).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{order.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.currentParticipants} pharmacies joined
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {calculateProgress(order.currentQuantity, order.minimumQuantity)}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2">
                <Link href="/pharmacy-aggregation">
                  <Button className="w-full gap-2">
                    View Pharmacy Orders
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              How B2B Aggregation Works
            </CardTitle>
            <CardDescription>
              Professional collective purchasing for better pricing and warehouse competition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit mx-auto">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">Aggregate Orders</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple businesses combine small orders into bulk purchases for better pricing
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit mx-auto">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold">Volume Discounts</h3>
                <p className="text-sm text-muted-foreground">
                  Achieve wholesale pricing tiers through collective purchasing power
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto">
                  <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">Warehouse Competition</h3>
                <p className="text-sm text-muted-foreground">
                  Distributors compete for aggregated orders with competitive bulk pricing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Scenarios */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Veterinary Example
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Individual clinic order:</span>
                  <span className="font-medium">10 units × ₺25.00 = ₺250</span>
                </div>
                <div className="flex justify-between">
                  <span>100 clinics aggregated:</span>
                  <span className="font-medium">1,000 units</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>With 15% volume discount:</span>
                  <span className="font-bold text-green-600">₺21.25 per unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Total savings per clinic:</span>
                  <span className="font-bold text-green-600">₺37.50</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-green-600" />
                Pharmacy Example
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Individual pharmacy order:</span>
                  <span className="font-medium">20 units × ₺12.50 = ₺250</span>
                </div>
                <div className="flex justify-between">
                  <span>100 pharmacies aggregated:</span>
                  <span className="font-medium">2,000 units</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>With 20% volume discount:</span>
                  <span className="font-bold text-green-600">₺10.00 per unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Total savings per pharmacy:</span>
                  <span className="font-bold text-green-600">₺50.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
