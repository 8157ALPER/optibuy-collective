import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  TrendingDown, 
  Award, 
  Clock, 
  Star,
  CheckCircle,
  Package,
  Truck
} from "lucide-react";

interface WarehouseQuote {
  id: number;
  warehouseName: string;
  location: string;
  unitPrice: number;
  totalPrice: number;
  discountPercentage: number;
  deliveryDays: number;
  rating: number;
  reliability: string;
  paymentTerms: string;
  minimumQuantity: number;
  stockAvailable: number;
}

interface WarehouseCompetitionProps {
  aggregationOrderId: number;
  sector: "veterinary" | "pharmaceutical";
  productName: string;
  quantity: number;
  originalPrice: number;
}

export default function WarehouseCompetition({ 
  aggregationOrderId, 
  sector, 
  productName, 
  quantity, 
  originalPrice 
}: WarehouseCompetitionProps) {
  const [selectedQuote, setSelectedQuote] = useState<number | null>(null);

  // Mock data - in real app would fetch from API
  const warehouseQuotes: WarehouseQuote[] = [
    {
      id: 1,
      warehouseName: sector === "veterinary" ? "VetMed Warehouse Istanbul" : "PharmaTürk Distribution",
      location: "Istanbul - Başakşehir",
      unitPrice: originalPrice * 0.85, // 15% discount
      totalPrice: originalPrice * 0.85 * quantity,
      discountPercentage: 15,
      deliveryDays: 2,
      rating: 4.8,
      reliability: "excellent",
      paymentTerms: "Net 30",
      minimumQuantity: Math.floor(quantity * 0.8),
      stockAvailable: quantity * 2
    },
    {
      id: 2,
      warehouseName: sector === "veterinary" ? "Ankara Veteriner Dağıtım" : "İlaç Dağıtım Merkezi",
      location: "Ankara - Sincan",
      unitPrice: originalPrice * 0.88, // 12% discount
      totalPrice: originalPrice * 0.88 * quantity,
      discountPercentage: 12,
      deliveryDays: 3,
      rating: 4.6,
      reliability: "good",
      paymentTerms: "Net 45",
      minimumQuantity: Math.floor(quantity * 0.9),
      stockAvailable: quantity * 1.5
    },
    {
      id: 3,
      warehouseName: sector === "veterinary" ? "Türkiye Veteriner Malzemeleri" : "Ege Pharmaceutical",
      location: "İzmir - Kemalpaşa",
      unitPrice: originalPrice * 0.90, // 10% discount
      totalPrice: originalPrice * 0.90 * quantity,
      discountPercentage: 10,
      deliveryDays: 4,
      rating: 4.4,
      reliability: "good",
      paymentTerms: "Net 15",
      minimumQuantity: quantity,
      stockAvailable: quantity * 3
    }
  ];

  const bestQuote = warehouseQuotes.sort((a, b) => a.unitPrice - b.unitPrice)[0];
  const totalSavings = (originalPrice - bestQuote.unitPrice) * quantity;

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case "excellent": return "text-green-600 dark:text-green-400";
      case "good": return "text-blue-600 dark:text-blue-400";
      default: return "text-yellow-600 dark:text-yellow-400";
    }
  };

  const getReliabilityBadge = (reliability: string) => {
    switch (reliability) {
      case "excellent": return "success";
      case "good": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Warehouse Competition Results
          </CardTitle>
          <CardDescription>
            {warehouseQuotes.length} warehouses competing for your aggregated order of {quantity} units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <TrendingDown className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">₺{totalSavings.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Savings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{bestQuote.discountPercentage}%</div>
              <div className="text-sm text-muted-foreground">Best Discount</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{bestQuote.deliveryDays}</div>
              <div className="text-sm text-muted-foreground">Days Delivery</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Warehouse Quotes</h3>
            {warehouseQuotes.map((quote, index) => (
              <Card 
                key={quote.id} 
                className={`cursor-pointer transition-all ${
                  selectedQuote === quote.id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
                } ${index === 0 ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50' : ''}`}
                onClick={() => setSelectedQuote(quote.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{quote.warehouseName}</h4>
                        {index === 0 && (
                          <Badge variant="default" className="gap-1">
                            <Award className="h-3 w-3" />
                            Best Price
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{quote.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₺{quote.unitPrice.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">per unit</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Price</div>
                      <div className="font-medium">₺{quote.totalPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Discount</div>
                      <div className="font-medium text-green-600">{quote.discountPercentage}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Delivery</div>
                      <div className="font-medium">{quote.deliveryDays} days</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rating</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{quote.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant={getReliabilityBadge(quote.reliability)} className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {quote.reliability}
                      </Badge>
                      <span className="text-muted-foreground">
                        Payment: {quote.paymentTerms}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>Stock: {quote.stockAvailable}+ units</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">Automatic Selection Process</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  OptiBuy will automatically select the best warehouse quote when the aggregation deadline closes. 
                  Selection is based on lowest price, with delivery time and reliability as secondary factors.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
