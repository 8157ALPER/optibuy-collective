import { Bell, Plus, Factory, TrendingUp, Package, Truck } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileContainer from "@/components/mobile-container";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BusinessDashboard() {
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: businessIntentions = [] } = useQuery({
    queryKey: ["/api/purchase-intentions", "1"], // Mock business user ID
  });

  const businessCategories = categories.filter((cat: any) => 
    ["Raw Materials", "Industrial Equipment", "Office Supplies", "Manufacturing"].includes(cat.name)
  );

  const categoryIcons: Record<string, any> = {
    "Raw Materials": Factory,
    "Industrial Equipment": Package,
    "Office Supplies": Package,
    "Manufacturing": Factory,
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-medium">TechCorp Industries</h1>
              <p className="text-sm text-neutral-600">Procurement Dashboard</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="text-neutral-600 text-xl" size={24} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full"></span>
              </div>
              <Button 
                onClick={() => setLocation("/create-intention")}
                size="sm" 
                className="bg-warning text-white px-3 py-1 rounded-lg text-sm"
              >
                New Request
              </Button>
            </div>
          </div>
          
          {/* Business stats */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">8</div>
              <div className="text-xs text-neutral-600">Active Requests</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">$145K</div>
              <div className="text-xs text-neutral-600">Potential Savings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-warning">15</div>
              <div className="text-xs text-neutral-600">Supplier Offers</div>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick access categories */}
          <div className="p-4">
            <h3 className="font-medium mb-3">Procurement Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {businessCategories.slice(0, 4).map((category: any) => {
                const IconComponent = categoryIcons[category.name] || Factory;
                return (
                  <Card key={category.id} className="text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <IconComponent className="text-warning text-2xl mb-2 mx-auto" size={32} />
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-warning">12 suppliers</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="p-4">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            
            <Card 
              className="p-4 mb-3 shadow-sm border-l-4 border-l-warning cursor-pointer"
              onClick={() => setLocation("/business-order-management")}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-warning">Manage RFQs</h4>
                  <p className="text-sm text-neutral-600">Cancel or advance your procurement requests</p>
                </div>
                <ArrowRight className="text-neutral-400" size={16} />
              </div>
              <p className="text-xs text-neutral-600">Get cost savings by advancing deadlines early</p>
            </Card>
            
            <Card 
              className="p-4 mb-3 shadow-sm border-l-4 border-l-primary cursor-pointer"
              onClick={() => setLocation("/create-rfq")}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-primary">Create RFQ</h4>
                  <p className="text-sm text-neutral-600">Request quotes from suppliers</p>
                </div>
                <ArrowRight className="text-neutral-400" size={16} />
              </div>
              <p className="text-xs text-neutral-600">Get competitive pricing for your business needs</p>
            </Card>

            <Card 
              className="p-4 mb-3 shadow-sm border-l-4 border-l-warning cursor-pointer"
              onClick={() => setLocation("/verification")}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-warning">Verification Center</h4>
                  <p className="text-sm text-neutral-600">Upgrade your business tier</p>
                </div>
                <ArrowRight className="text-neutral-400" size={16} />
              </div>
              <p className="text-xs text-neutral-600">Unlock higher limits and premium features</p>
            </Card>
          </div>
          
          {/* Active procurement requests */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Your Procurement Requests</h3>
              <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
                View All
              </Button>
            </div>
            
            {/* Sample business procurement request */}
            <Card className="p-4 mb-3 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">Industrial Steel Sheets</h4>
                  <p className="text-sm text-neutral-600">
                    Target: March 30, 2024 • Quantity: 500 tonnes
                  </p>
                </div>
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  Active
                </Badge>
              </div>
              
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Supplier Interest</span>
                  <span>8 of 15 suppliers</span>
                </div>
                <Progress value={53} className="w-full h-2" />
              </div>
              
              {/* Best offer */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-600">Best Offer</p>
                  <p className="font-bold text-success">$2,450/tonne</p>
                  <p className="text-xs text-neutral-500">15% below market rate</p>
                </div>
                <Button size="sm" className="bg-warning text-white px-4 py-2 rounded-lg text-sm">
                  Review Offers
                </Button>
              </div>
            </Card>

            <Card className="p-4 mb-3 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">Office Computers (Dell OptiPlex)</h4>
                  <p className="text-sm text-neutral-600">
                    Target: April 15, 2024 • Quantity: 50 units
                  </p>
                </div>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                  Ready
                </Badge>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Collective Interest</span>
                  <span>247 companies</span>
                </div>
                <Progress value={85} className="w-full h-2" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-600">Group Price</p>
                  <p className="font-bold text-success">$485/unit</p>
                  <p className="text-xs text-neutral-500">22% savings vs individual</p>
                </div>
                <Button size="sm" className="bg-secondary text-white px-4 py-2 rounded-lg text-sm">
                  Join Group
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Market opportunities */}
          <div className="p-4 pb-24">
            <h3 className="font-medium mb-3">Market Opportunities</h3>
            
            <Card className="p-4 mb-3 shadow-sm border-l-4 border-l-warning">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-warning">Large Volume Discount Available</h4>
                  <p className="text-sm text-neutral-600">Industrial Aluminum Sheets</p>
                </div>
                <Badge className="bg-warning/10 text-warning text-xs">
                  Limited Time
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-neutral-600 text-xs">Minimum Order</p>
                  <p className="font-medium">200 tonnes</p>
                </div>
                <div>
                  <p className="text-neutral-600 text-xs">Discount</p>
                  <p className="font-medium text-success">28% off market</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-neutral-600">Expires in: </span>
                  <span className="font-medium text-warning">3 days</span>
                </div>
                <Button variant="outline" size="sm" className="text-warning border-warning">
                  Learn More
                </Button>
              </div>
            </Card>

            {/* Legal Notice */}
            <div className="bg-neutral-100 p-3 rounded-lg text-center">
              <p className="text-xs text-neutral-600">
                <span 
                  className="text-primary underline cursor-pointer font-medium"
                  onClick={() => setLocation("/legal")}
                >
                  Review legal disclaimer
                </span>{" "}
                regarding company information confidentiality
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom navigation */}
        <BottomNavigation userType="business" />
        
        {/* Floating Action Button */}
        <Button
          onClick={() => setLocation("/create-rfq")}
          className="absolute bottom-20 right-4 w-14 h-14 bg-warning text-white rounded-full shadow-lg p-0"
        >
          <Plus size={24} />
        </Button>
      </div>
    </MobileContainer>
  );
}
