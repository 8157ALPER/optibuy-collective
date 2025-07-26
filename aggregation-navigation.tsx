import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Stethoscope, 
  Pill, 
  BarChart3, 
  Building2, 
  Users, 
  Package,
  TrendingUp
} from "lucide-react";

interface NavigationProps {
  currentUser?: {
    userType: string;
    businessSubsector?: string;
  };
}

export default function AggregationNavigation({ currentUser }: NavigationProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const getRecommendedPath = () => {
    if (!currentUser) return "/sector-dashboard";
    
    if (currentUser.businessSubsector === "veterinary_clinic") {
      return "/veterinary-aggregation";
    } else if (currentUser.businessSubsector === "pharmacy") {
      return "/pharmacy-aggregation";
    }
    
    return "/sector-dashboard";
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Link href="/sector-dashboard">
              <Button 
                variant={isActive("/sector-dashboard") ? "default" : "outline"} 
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Sector Overview
              </Button>
            </Link>
            
            <Link href="/veterinary-aggregation">
              <Button 
                variant={isActive("/veterinary-aggregation") ? "default" : "outline"} 
                size="sm"
                className="gap-2"
              >
                <Stethoscope className="h-4 w-4" />
                Veterinary
                <Badge variant="secondary" className="ml-1">2K Clinics</Badge>
              </Button>
            </Link>
            
            <Link href="/pharmacy-aggregation">
              <Button 
                variant={isActive("/pharmacy-aggregation") ? "default" : "outline"} 
                size="sm"
                className="gap-2"
              >
                <Pill className="h-4 w-4" />
                Pharmacy
                <Badge variant="secondary" className="ml-1">12K Pharmacies</Badge>
              </Button>
            </Link>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Recommended for you:
              </div>
              <Link href={getRecommendedPath()}>
                <Button size="sm" variant="default">
                  <Users className="h-4 w-4 mr-1" />
                  {currentUser.businessSubsector === "veterinary_clinic" ? "Vet Orders" : 
                   currentUser.businessSubsector === "pharmacy" ? "Pharmacy Orders" : 
                   "Browse All"}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">15+</div>
            <div className="text-xs text-muted-foreground">Active Orders</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">₺250K</div>
            <div className="text-xs text-muted-foreground">Total Savings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">14K</div>
            <div className="text-xs text-muted-foreground">Businesses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">12%</div>
            <div className="text-xs text-muted-foreground">Avg Discount</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
