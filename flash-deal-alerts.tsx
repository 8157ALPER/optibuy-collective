import { useState, useEffect } from "react";
import { Zap, Clock, Users, DollarSign, Target, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FlashDeal {
  id: number;
  productName: string;
  sellerName: string;
  originalPrice: number;
  flashPrice: number;
  discountPercent: number;
  timeRemaining: number; // seconds
  buyersJoined: number;
  maxBuyers: number;
  urgencyLevel: "medium" | "high" | "critical";
  category: string;
}

interface FlashDealAlertsProps {
  userType: "consumer" | "seller" | "business";
  onDealJoin?: (dealId: number) => void;
}

export default function FlashDealAlerts({ userType, onDealJoin }: FlashDealAlertsProps) {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [currentDeal, setCurrentDeal] = useState<FlashDeal | null>(null);

  // Generate flash deals
  useEffect(() => {
    const generateFlashDeal = (): FlashDeal => {
      const products = ["iPhone 15 Pro", "Tesla Model Y", "MacBook Pro M3", "Samsung Galaxy S24", "iPad Pro"];
      const sellers = ["TechMart", "AutoWorld", "GadgetPro", "ElectroHub", "DeviceStore"];
      const originalPrice = Math.floor(Math.random() * 2000) + 500;
      const discountPercent = Math.floor(Math.random() * 40) + 20; // 20-60% off
      
      return {
        id: Date.now() + Math.random(),
        productName: products[Math.floor(Math.random() * products.length)],
        sellerName: sellers[Math.floor(Math.random() * sellers.length)],
        originalPrice,
        flashPrice: Math.floor(originalPrice * (1 - discountPercent / 100)),
        discountPercent,
        timeRemaining: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
        buyersJoined: Math.floor(Math.random() * 80) + 20,
        maxBuyers: 100,
        urgencyLevel: discountPercent > 50 ? "critical" : discountPercent > 35 ? "high" : "medium",
        category: "Electronics"
      };
    };

    // Generate initial deals
    const initialDeals = Array.from({ length: 3 }, generateFlashDeal);
    setFlashDeals(initialDeals);
    setCurrentDeal(initialDeals[0]);

    // Add new deals periodically
    const dealInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newDeal = generateFlashDeal();
        setFlashDeals(prev => [newDeal, ...prev.slice(0, 4)]);
        setCurrentDeal(newDeal);
      }
    }, 8000);

    return () => clearInterval(dealInterval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashDeals(prev => 
        prev.map(deal => ({
          ...deal,
          timeRemaining: Math.max(0, deal.timeRemaining - 1),
          buyersJoined: deal.timeRemaining > 30 ? 
            Math.min(deal.maxBuyers, deal.buyersJoined + (Math.random() > 0.8 ? 1 : 0)) : 
            deal.buyersJoined
        })).filter(deal => deal.timeRemaining > 0)
      );

      setCurrentDeal(prev => {
        if (!prev || prev.timeRemaining <= 1) return null;
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
          buyersJoined: prev.timeRemaining > 30 ? 
            Math.min(prev.maxBuyers, prev.buyersJoined + (Math.random() > 0.9 ? 1 : 0)) : 
            prev.buyersJoined
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical": return "border-red-500 bg-red-50";
      case "high": return "border-orange-500 bg-orange-50";
      default: return "border-blue-500 bg-blue-50";
    }
  };

  const getBuyerProgress = (joined: number, max: number) => {
    return (joined / max) * 100;
  };

  if (!currentDeal && flashDeals.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {/* Main flash deal alert */}
        {currentDeal && currentDeal.timeRemaining > 0 && (
          <motion.div
            key={currentDeal.id}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className={`border-2 ${getUrgencyColor(currentDeal.urgencyLevel)} shadow-xl`}>
              <CardContent className="p-4">
                {/* Header with flash icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="text-yellow-500 animate-pulse" size={20} />
                    <Badge className="bg-red-500 text-white text-xs animate-bounce">
                      FLASH DEAL
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Clock className="text-red-500" size={14} />
                      <span className="font-bold text-red-600 text-lg">
                        {formatTime(currentDeal.timeRemaining)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product info */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg">{currentDeal.productName}</h3>
                  <p className="text-sm text-neutral-600">{currentDeal.sellerName}</p>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-neutral-600">Was</p>
                    <p className="text-lg line-through text-neutral-500">
                      ${currentDeal.originalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-600">Flash Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${currentDeal.flashPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Discount badge */}
                <div className="text-center mb-3">
                  <Badge className="bg-green-500 text-white text-lg px-3 py-1">
                    <TrendingDown className="mr-1" size={16} />
                    {currentDeal.discountPercent}% OFF
                  </Badge>
                </div>

                {/* Buyers progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Buyers Joined</span>
                    <span>{currentDeal.buyersJoined}/{currentDeal.maxBuyers}</span>
                  </div>
                  <Progress 
                    value={getBuyerProgress(currentDeal.buyersJoined, currentDeal.maxBuyers)} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-center mt-1">
                    <Users className="text-blue-500 mr-1" size={12} />
                    <span className="text-xs text-blue-600 font-medium">
                      {currentDeal.buyersJoined} people buying now!
                    </span>
                  </div>
                </div>

                {/* Action button */}
                {userType !== "seller" ? (
                  <Button 
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
                    onClick={() => onDealJoin?.(currentDeal.id)}
                  >
                    <Target className="mr-2" size={16} />
                    JOIN FLASH DEAL
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      // Navigate to competitive offer creation
                    }}
                  >
                    <Zap className="mr-2" size={16} />
                    Create Counter Offer
                  </Button>
                )}

                {/* Urgency indicator for critical deals */}
                {currentDeal.urgencyLevel === "critical" && (
                  <motion.div
                    animate={{ 
                      backgroundColor: ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.3)", "rgba(239, 68, 68, 0.1)"] 
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="mt-2 p-2 rounded text-xs text-red-700 text-center font-bold"
                  >
                    🔥 MEGA DEAL - Limited Spots Left!
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mini alerts for other deals */}
        {flashDeals.slice(1, 3).map((deal, index) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: index * 0.1 }}
            className="cursor-pointer"
            onClick={() => setCurrentDeal(deal)}
          >
            <Card className="border border-gray-300 bg-white/90 hover:bg-white transition-colors">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{deal.productName}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold text-sm">
                        ${deal.flashPrice.toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        -{deal.discountPercent}%
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span className="text-xs font-medium text-red-600">
                        {formatTime(deal.timeRemaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
