import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Clock, Zap, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PriceUpdate {
  id: number;
  productName: string;
  sellerId: number;
  sellerName: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
  changePercent: number;
  buyerCount: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
}

interface RealTimePriceTrackerProps {
  categoryId?: number;
  userType: "consumer" | "seller" | "business";
  onPriceAlert?: (update: PriceUpdate) => void;
}

export default function RealTimePriceTracker({ categoryId, userType, onPriceAlert }: RealTimePriceTrackerProps) {
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdate[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time price updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newUpdate: PriceUpdate = {
        id: Date.now(),
        productName: ["iPhone 15 Pro", "Tesla Model 3", "MacBook Air M3", "Samsung TV 75\"", "Sony Headphones"][Math.floor(Math.random() * 5)],
        sellerId: Math.floor(Math.random() * 100),
        sellerName: ["TechStore Pro", "AutoDealer Plus", "ElectroWorld", "GadgetHub", "MegaTech"][Math.floor(Math.random() * 5)],
        oldPrice: Math.floor(Math.random() * 2000) + 500,
        newPrice: 0, // Will be calculated
        timestamp: new Date().toLocaleTimeString(),
        changePercent: 0, // Will be calculated
        buyerCount: Math.floor(Math.random() * 500) + 100,
        urgencyLevel: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)] as any
      };

      // Calculate price drop (always a decrease for competitive effect)
      const dropPercent = Math.floor(Math.random() * 20) + 5; // 5-25% drop
      newUpdate.newPrice = Math.floor(newUpdate.oldPrice * (1 - dropPercent / 100));
      newUpdate.changePercent = -dropPercent;

      setPriceUpdates(prev => [newUpdate, ...prev.slice(0, 9)]); // Keep last 10 updates
      onPriceAlert?.(newUpdate);
    }, 3000 + Math.random() * 4000); // Random interval 3-7 seconds

    return () => clearInterval(interval);
  }, [isLive, onPriceAlert]);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical": return "text-red-600 bg-red-100 border-red-300";
      case "high": return "text-orange-600 bg-orange-100 border-orange-300";
      case "medium": return "text-blue-600 bg-blue-100 border-blue-300";
      default: return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };

  const formatPriceChange = (oldPrice: number, newPrice: number, changePercent: number) => {
    const savings = oldPrice - newPrice;
    return {
      savings: savings.toLocaleString(),
      percent: Math.abs(changePercent)
    };
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <DollarSign className="text-green-500" size={20} />
              <span>Live Price Drops</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="text-xs"
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {priceUpdates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`border-l-4 ${getUrgencyColor(update.urgencyLevel)} p-3 rounded-lg`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{update.productName}</h4>
                  <p className="text-xs text-neutral-600">{update.sellerName}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getUrgencyColor(update.urgencyLevel)}`}
                  >
                    {update.urgencyLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center">
                  <p className="text-xs text-neutral-600">Was</p>
                  <p className="font-medium text-sm line-through text-neutral-500">
                    ${update.oldPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-600">Now</p>
                  <p className="font-bold text-lg text-green-600">
                    ${update.newPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-600">Save</p>
                  <p className="font-bold text-sm text-green-600">
                    ${formatPriceChange(update.oldPrice, update.newPrice, update.changePercent).savings}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="text-green-500" size={12} />
                    <span className="font-medium text-green-600">
                      -{formatPriceChange(update.oldPrice, update.newPrice, update.changePercent).percent}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target size={12} />
                    <span>{update.buyerCount} interested</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-neutral-500">
                  <Clock size={12} />
                  <span>{update.timestamp}</span>
                </div>
              </div>

              {/* Action buttons based on user type */}
              <div className="mt-2 space-y-1">
                {userType === "seller" && (
                  <Button 
                    size="sm" 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-xs"
                    onClick={() => {
                      // Navigate to competitive offer creation
                    }}
                  >
                    <Zap className="mr-1" size={12} />
                    Beat This Price
                  </Button>
                )}

                {userType !== "seller" && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => {
                      // Navigate to offer details or join group buy
                    }}
                  >
                    <Target className="mr-1" size={12} />
                    Join Group Buy
                  </Button>
                )}
              </div>

              {/* Critical urgency extra emphasis */}
              {update.urgencyLevel === "critical" && (
                <motion.div
                  animate={{ 
                    backgroundColor: ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.3)", "rgba(239, 68, 68, 0.1)"] 
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mt-2 p-2 rounded text-xs text-red-700 text-center font-medium"
                >
                  🚨 Limited time: {update.buyerCount}+ buyers competing!
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {priceUpdates.length === 0 && (
          <div className="text-center py-8">
            <DollarSign className="mx-auto text-neutral-400 mb-2" size={48} />
            <p className="text-neutral-600 text-sm">Waiting for live price updates...</p>
            <p className="text-xs text-neutral-500 mt-1">
              {isLive ? "Monitoring competitive offers" : "Paused - click Resume to continue"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
