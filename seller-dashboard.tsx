import { Bell, Plus, TrendingUp, DollarSign, Tag } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileContainer from "@/components/mobile-container";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SellerDashboard() {
  const [, setLocation] = useLocation();

  const { data: marketAnalytics = [] } = useQuery({
    queryKey: ["/api/market-analytics"],
  });

  const { data: sellerOffers = [] } = useQuery({
    queryKey: ["/api/offers", "1"], // Mock seller ID
  });

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-medium">TechHub Solutions</h1>
              <p className="text-sm text-neutral-600">Seller Dashboard</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="text-neutral-600 text-xl" size={24} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
              </div>
              <Button 
                onClick={() => setLocation("/create-offer")}
                size="sm" 
                className="bg-secondary text-white px-3 py-1 rounded-lg text-sm"
              >
                New Offer
              </Button>
            </div>
          </div>
          
          {/* Seller stats */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">12</div>
              <div className="text-xs text-neutral-600">Active Offers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">$84,250</div>
              <div className="text-xs text-neutral-600">Revenue (30d)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">$1,685</div>
              <div className="text-xs text-neutral-600">Commission Due</div>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick filters */}
          <div className="p-4 bg-white border-b">
            <div className="flex space-x-2 overflow-x-auto">
              <Button size="sm" className="bg-primary text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                All Categories
              </Button>
              <Button size="sm" variant="outline" className="px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                Electronics
              </Button>
              <Button size="sm" variant="outline" className="px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                Automotive
              </Button>
              <Button size="sm" variant="outline" className="px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                Home
              </Button>
            </div>
          </div>
          
          {/* Market opportunities */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Market Opportunities</h3>
              <Button variant="ghost" size="sm" className="text-primary text-sm">
                View All
              </Button>
            </div>
            
            {marketAnalytics.length === 0 ? (
              <Card className="p-4 text-center">
                <TrendingUp className="mx-auto text-neutral-400 mb-2" size={48} />
                <p className="text-neutral-600 text-sm">No market opportunities available</p>
                <p className="text-xs text-neutral-500 mt-1">Check back later for new buyer demand</p>
              </Card>
            ) : (
              marketAnalytics.map((opportunity: any) => (
                <Card key={opportunity.productName} className="p-4 mb-3 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{opportunity.productName}</h4>
                      <p className="text-sm text-neutral-600">High demand opportunity</p>
                    </div>
                    <Badge className="bg-success/10 text-success text-xs px-2 py-1 rounded-full">
                      Hot
                    </Badge>
                  </div>
                  
                  {/* Demand info */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-neutral-600">Total Buyers</p>
                      <p className="font-bold text-lg">{opportunity.totalBuyers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600">Est. Volume</p>
                      <p className="font-bold text-lg">${opportunity.estimatedRevenue?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Price range */}
                  <div className="mb-3">
                    <p className="text-xs text-neutral-600 mb-1">Buyer Price Range</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>${opportunity.priceRange?.min || 'N/A'}</span>
                      <div className="flex-1 mx-3 h-2 bg-neutral-200 rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{width: '70%'}}></div>
                      </div>
                      <span>${opportunity.priceRange?.max || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setLocation("/create-offer")}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-sm"
                    >
                      Make Offer
                    </Button>
                    <Button variant="outline" className="px-4 py-2 rounded-lg text-sm">
                      Details
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          {/* Active offers */}
          <div className="p-4 pb-24">
            <h3 className="font-medium mb-3">Your Active Offers</h3>
            
            {sellerOffers.length === 0 ? (
              <Card className="p-4 text-center">
                <Tag className="mx-auto text-neutral-400 mb-2" size={48} />
                <p className="text-neutral-600 text-sm">No active offers</p>
                <p className="text-xs text-neutral-500 mt-1">Create your first offer to start selling</p>
              </Card>
            ) : (
              sellerOffers.map((offer: any) => (
                <Card key={offer.id} className="p-4 mb-3 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{offer.productName}</h4>
                    <Badge className="bg-warning/10 text-warning text-xs px-2 py-1 rounded-full">
                      {offer.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-neutral-600 text-xs">Your Price</p>
                      <p className="font-medium">${offer.price}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-xs">Min. Quantity</p>
                      <p className="font-medium">{offer.minQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-xs">Expires</p>
                      <p className="font-medium">5 days</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-neutral-600">Interest: </span>
                        <span className="font-medium">{offer.interestedBuyers} buyers</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
                        Edit Offer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        
        {/* Bottom navigation */}
        <BottomNavigation userType="seller" />
      </div>
    </MobileContainer>
  );
}
