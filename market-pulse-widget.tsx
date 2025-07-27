import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, Zap, Users, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketPulseData {
  timestamp: string;
  totalBuyers: number;
  averagePrice: number;
  competitionLevel: number;
  offers: number;
}

interface MarketActivity {
  id: number;
  type: "new_buyer" | "price_drop" | "new_offer" | "competition_start";
  message: string;
  timestamp: string;
  category: string;
  impact: "high" | "medium" | "low";
}

export default function MarketPulseWidget() {
  const [pulseData, setPulseData] = useState<MarketPulseData[]>([]);
  const [activities, setActivities] = useState<MarketActivity[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Generate market pulse data
  useEffect(() => {
    const generateDataPoint = (): MarketPulseData => {
      const now = new Date();
      return {
        timestamp: now.toLocaleTimeString(),
        totalBuyers: Math.floor(Math.random() * 1000) + 5000,
        averagePrice: Math.floor(Math.random() * 500) + 800,
        competitionLevel: Math.floor(Math.random() * 100),
        offers: Math.floor(Math.random() * 50) + 100
      };
    };

    // Initial data
    const initialData = Array.from({ length: 10 }, () => generateDataPoint());
    setPulseData(initialData);

    // Real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        setPulseData(prev => {
          const newData = [...prev.slice(1), generateDataPoint()];
          return newData;
        });
        
        // Generate random market activity
        if (Math.random() > 0.7) {
          const activities = [
            {
              type: "new_buyer" as const,
              message: "127 new buyers joined Electronics category",
              category: "Electronics",
              impact: "medium" as const
            },
            {
              type: "price_drop" as const,
              message: "TechStore Pro dropped iPhone price by 15%",
              category: "Electronics",
              impact: "high" as const
            },
            {
              type: "new_offer" as const,
              message: "MegaTech posted competitive Tesla offer",
              category: "Automotive",
              impact: "high" as const
            },
            {
              type: "competition_start" as const,
              message: "New MacBook competition started - 500 buyers ready",
              category: "Electronics",
              impact: "high" as const
            }
          ];

          const randomActivity = activities[Math.floor(Math.random() * activities.length)];
          const newActivity: MarketActivity = {
            id: Date.now(),
            ...randomActivity,
            timestamp: new Date().toLocaleTimeString()
          };

          setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_buyer": return <Users className="text-blue-500" size={14} />;
      case "price_drop": return <TrendingDown className="text-green-500" size={14} />;
      case "new_offer": return <DollarSign className="text-purple-500" size={14} />;
      case "competition_start": return <Zap className="text-orange-500" size={14} />;
      default: return <Activity className="text-gray-500" size={14} />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-orange-600 bg-orange-100";
      case "low": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const currentData = pulseData[pulseData.length - 1];
  const previousData = pulseData[pulseData.length - 2];

  const buyerTrend = currentData && previousData ? 
    currentData.totalBuyers - previousData.totalBuyers : 0;
  const priceTrend = currentData && previousData ? 
    currentData.averagePrice - previousData.averagePrice : 0;

  return (
    <div className="space-y-4">
      {/* Market Pulse Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <Activity className="text-blue-500" size={20} />
                <span>Market Pulse</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Real-time
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-neutral-600">Active Buyers</p>
              <div className="flex items-center space-x-2">
                <p className="text-xl font-bold">{currentData?.totalBuyers.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 text-xs ${
                  buyerTrend > 0 ? 'text-green-600' : buyerTrend < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {buyerTrend > 0 ? <TrendingUp size={12} /> : buyerTrend < 0 ? <TrendingDown size={12} /> : null}
                  <span>{buyerTrend > 0 ? '+' : ''}{buyerTrend}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-neutral-600">Avg Price</p>
              <div className="flex items-center space-x-2">
                <p className="text-xl font-bold">${currentData?.averagePrice.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 text-xs ${
                  priceTrend < 0 ? 'text-green-600' : priceTrend > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {priceTrend < 0 ? <TrendingDown size={12} /> : priceTrend > 0 ? <TrendingUp size={12} /> : null}
                  <span>{priceTrend > 0 ? '+' : ''}${priceTrend}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini chart */}
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pulseData}>
                <Line 
                  type="monotone" 
                  dataKey="totalBuyers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
                <XAxis dataKey="timestamp" hide />
                <YAxis hide />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow text-xs">
                          <p>{`Time: ${label}`}</p>
                          <p className="text-blue-600">{`Buyers: ${payload[0]?.value?.toLocaleString()}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Zap className="text-orange-500" size={20} />
            <span>Live Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activities.length === 0 ? (
            <div className="text-center py-4">
              <Activity className="mx-auto text-neutral-400 mb-2" size={32} />
              <p className="text-neutral-600 text-sm">Monitoring market activity...</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                    <Badge className={`text-xs ${getImpactColor(activity.impact)}`}>
                      {activity.impact}
                    </Badge>
                    <span className="text-xs text-neutral-500">{activity.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
