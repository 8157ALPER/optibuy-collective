import { useState, useEffect } from "react";
import { Users, TrendingDown, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GroupNegotiationData {
  intentionId: number;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  participantCount: number;
  targetParticipants: number;
  timeRemaining: string;
  status: "active" | "negotiating" | "success" | "failed";
  priceHistory: { timestamp: Date; price: number; participants: number }[];
  recentJoins: { name: string; joinedAt: Date }[];
}

interface GroupNegotiationVisualProps {
  data: GroupNegotiationData;
  compact?: boolean;
}

export default function GroupNegotiationVisual({ data, compact = false }: GroupNegotiationVisualProps) {
  const [animatingPrice, setAnimatingPrice] = useState(data.currentPrice);
  const [animatingParticipants, setAnimatingParticipants] = useState(data.participantCount);

  // Animate price and participant changes
  useEffect(() => {
    setAnimatingPrice(data.currentPrice);
    setAnimatingParticipants(data.participantCount);
  }, [data.currentPrice, data.participantCount]);

  const discountPercentage = ((data.targetPrice - data.currentPrice) / data.targetPrice) * 100;
  const participantProgress = (data.participantCount / data.targetParticipants) * 100;
  
  const statusConfig = {
    active: { 
      color: "bg-blue-100 text-blue-800", 
      icon: Clock, 
      label: "Gathering" 
    },
    negotiating: { 
      color: "bg-yellow-100 text-yellow-800", 
      icon: TrendingDown, 
      label: "Negotiating" 
    },
    success: { 
      color: "bg-green-100 text-green-800", 
      icon: CheckCircle, 
      label: "Success" 
    },
    failed: { 
      color: "bg-red-100 text-red-800", 
      icon: AlertCircle, 
      label: "Closed" 
    }
  };

  const StatusIcon = statusConfig[data.status].icon;

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <Users className="text-blue-500" size={20} />
          <div>
            <p className="font-medium text-sm">{data.productName}</p>
            <p className="text-xs text-gray-500">{data.participantCount} participants</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-semibold text-lg text-green-600">
            ${animatingPrice.toFixed(2)}
          </p>
          <Badge className={statusConfig[data.status].color}>
            {statusConfig[data.status].label}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{data.productName}</CardTitle>
          <Badge className={statusConfig[data.status].color}>
            <StatusIcon size={14} className="mr-1" />
            {statusConfig[data.status].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
          <div className="flex items-center justify-center space-x-4">
            <div>
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="text-3xl font-bold text-green-600 transition-all duration-500">
                ${animatingPrice.toFixed(2)}
              </p>
            </div>
            
            {discountPercentage > 0 && (
              <div className="text-center">
                <TrendingDown className="text-green-500 mx-auto mb-1" size={24} />
                <p className="text-sm font-semibold text-green-600">
                  {discountPercentage.toFixed(1)}% off
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Participant Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center space-x-2">
              <Users size={16} className="text-blue-500" />
              <span>Group Progress</span>
            </span>
            <span className="font-medium">
              {animatingParticipants}/{data.targetParticipants} people
            </span>
          </div>
          
          <Progress 
            value={participantProgress} 
            className="h-3 transition-all duration-500"
          />
          
          <p className="text-xs text-gray-500 text-center">
            {data.targetParticipants - data.participantCount} more needed for target price
          </p>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Time remaining</span>
          </div>
          <span className="font-medium text-orange-600">{data.timeRemaining}</span>
        </div>

        {/* Recent Activity */}
        {data.recentJoins.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Activity
            </h4>
            <div className="space-y-1">
              {data.recentJoins.slice(0, 3).map((join, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between text-xs text-gray-500 p-2 bg-green-50 dark:bg-green-900/20 rounded animate-fade-in"
                >
                  <span>{join.name} joined the group</span>
                  <span>{new Date(join.joinedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Trend Visualization */}
        {data.priceHistory.length > 1 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Trend
            </h4>
            <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 flex items-end space-x-1">
              {data.priceHistory.slice(-10).map((point, index) => {
                const height = ((data.targetPrice - point.price) / data.targetPrice) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`$${point.price} - ${point.participants} participants`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Real-time hook for group negotiation data
export function useGroupNegotiation(intentionId: number) {
  const [data, setData] = useState<GroupNegotiationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    const fetchData = async () => {
      setIsLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: GroupNegotiationData = {
        intentionId,
        productName: "iPhone 15 Pro Max",
        targetPrice: 999,
        currentPrice: 1199 - (Math.random() * 200),
        participantCount: Math.floor(Math.random() * 15) + 5,
        targetParticipants: 20,
        timeRemaining: "2 days, 14 hours",
        status: "active",
        priceHistory: [
          { timestamp: new Date(), price: 1199, participants: 1 },
          { timestamp: new Date(), price: 1150, participants: 5 },
          { timestamp: new Date(), price: 1100, participants: 10 },
          { timestamp: new Date(), price: 1050, participants: 15 }
        ],
        recentJoins: [
          { name: "Sarah M.", joinedAt: new Date() },
          { name: "Mike K.", joinedAt: new Date() },
          { name: "Lisa Chen", joinedAt: new Date() }
        ]
      };
      
      setData(mockData);
      setIsLoading(false);
    };

    fetchData();
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [intentionId]);

  return { data, isLoading };
}
