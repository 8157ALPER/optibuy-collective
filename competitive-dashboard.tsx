import { useState } from "react";
import { useLocation } from "wouter";
import { 
  TrendingUp, Users, Clock, Target, Zap, BarChart3, 
  DollarSign, AlertCircle, Crown, Star, Award, Activity
} from "lucide-react";

import MobileContainer from "@/components/mobile-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketplaceHeatmap from "@/components/marketplace-heatmap";
import RealTimePriceTracker from "@/components/real-time-price-tracker";
import CompetitionLeaderboard from "@/components/competition-leaderboard";
import MarketPulseWidget from "@/components/market-pulse-widget";
import CompetitorAnalysisWidget from "@/components/competitor-analysis-widget";
import OrderFulfillmentStatus from "@/components/order-fulfillment-status";
import DeadlineClosureSimulator from "@/components/deadline-closure-simulator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CompetitiveDashboard() {
  const [, setLocation] = useLocation();
  const [competitiveData] = useState({
    activeCompetitions: [
      {
        id: 1,
        productName: "iPhone 15 Pro",
        buyerPoolSize: 1247,
        competingOffers: 8,
        timeRemaining: "2h 15m",
        bestPrice: 999,
        myPrice: 1049,
        myRank: 3,
        competitionStatus: "active" as const
      },
      {
        id: 2,
        productName: "MacBook Air M3",
        buyerPoolSize: 892,
        competingOffers: 12,
        timeRemaining: "45m",
        bestPrice: 1199,
        myPrice: 1199,
        myRank: 1,
        competitionStatus: "final_phase" as const
      }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "final_phase": return "bg-red-100 text-red-800";
      case "winning": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Activity size={14} />;
      case "final_phase": return <Clock size={14} />;
      case "winning": return <Crown size={14} />;
      default: return <BarChart3 size={14} />;
    }
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Competitive Dashboard</h1>
              <p className="text-sm text-neutral-600">Real-time market intelligence & bidding</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-orange-500 text-white">
                <Zap size={12} className="mr-1" />
                LIVE
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-blue-600">2,139</div>
                <p className="text-xs text-neutral-600">Active Buyers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-orange-600">20</div>
                <p className="text-xs text-neutral-600">Live Competitions</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="heatmap" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 text-xs">
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="prices">Live Prices</TabsTrigger>
              <TabsTrigger value="leaderboard">Rankings</TabsTrigger>
              <TabsTrigger value="pulse">Market Pulse</TabsTrigger>
              <TabsTrigger value="analysis">Competitors</TabsTrigger>
              <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
              <TabsTrigger value="competitions">My Bids</TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap" className="mt-4">
              <MarketplaceHeatmap 
                userType="seller"
                onCategoryClick={(categoryId) => {
                  console.log("Selected category:", categoryId);
                }}
              />
            </TabsContent>
            
            <TabsContent value="prices" className="mt-4">
              <RealTimePriceTracker 
                userType="seller"
                onPriceAlert={(update) => {
                  console.log("Price alert:", update);
                }}
              />
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-4">
              <CompetitionLeaderboard 
                userType="seller"
                currentUserId={1}
                productName="iPhone 15 Pro"
              />
            </TabsContent>

            <TabsContent value="pulse" className="mt-4">
              <MarketPulseWidget />
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <CompetitorAnalysisWidget 
                category="Electronics"
                currentUserId={1}
              />
            </TabsContent>

            <TabsContent value="fulfillment" className="mt-4">
              <div className="space-y-4">
                <OrderFulfillmentStatus 
                  categoryId={1}
                  productName="iPhone 15 Pro"
                  onStatusUpdate={(status) => {
                    console.log("Fulfillment status updated:", status);
                  }}
                />
                
                <DeadlineClosureSimulator 
                  productName="iPhone 15 Pro"
                  totalBuyers={1247}
                  onSelectionComplete={(result) => {
                    console.log("Selection completed:", result);
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="competitions" className="mt-4">
              <div className="space-y-4">
                {competitiveData.activeCompetitions.map((competition) => (
                  <Card key={competition.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{competition.productName}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center space-x-1">
                              <Users size={14} className="text-blue-500" />
                              <span className="text-sm text-blue-600 font-medium">
                                {competition.buyerPoolSize.toLocaleString()} buyers ready
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {competition.competingOffers} sellers competing
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`text-xs ${getStatusColor(competition.competitionStatus)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(competition.competitionStatus)}
                              <span>{competition.competitionStatus.replace('_', ' ')}</span>
                            </div>
                          </Badge>
                          <p className="text-xs text-neutral-600 mt-1">{competition.timeRemaining} left</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center">
                          <p className="text-xs text-neutral-600">Best Price</p>
                          <p className="font-bold text-green-600">${competition.bestPrice.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-neutral-600">Your Rank</p>
                          <p className="font-bold text-orange-600">#{competition.myRank}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-neutral-600">Your Price</p>
                          <p className="font-bold">${competition.myPrice.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Competition Intensity</span>
                          <span>{competition.competingOffers}/15 sellers</span>
                        </div>
                        <Progress 
                          value={(competition.competingOffers / 15) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex space-x-2">
                        {competition.myRank > 1 && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            onClick={() => setLocation("/create-offer")}
                          >
                            <TrendingUp className="mr-1" size={14} />
                            Lower Price
                          </Button>
                        )}
                        
                        {competition.myRank === 1 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 border-green-500 text-green-600"
                            disabled
                          >
                            <Target className="mr-1" size={14} />
                            Leading Offer
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          View Details
                        </Button>
                      </div>

                      {competition.competitionStatus === "final_phase" && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <Clock className="text-red-500 mr-2" size={16} />
                            <p className="text-xs text-red-700 font-medium">
                              Final hours! {competition.buyerPoolSize} buyers are deciding now.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setLocation("/create-offer")}
              >
                <TrendingUp className="mr-2" size={16} />
                Create Competitive Offer
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/seller-dashboard")}
              >
                <Users className="mr-2" size={16} />
                View All Market Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
}
