import { useState } from "react";
import { ArrowLeft, Calendar, MapPin, Users, Filter } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShareIntention from "@/components/share-intention";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MyPlans() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: userIntentions = [] } = useQuery({
    queryKey: ["/api/purchase-intentions", "1"], // Mock user ID
  });

  const defaultPlans = [
    {
      id: 1,
      productName: "iPhone 15 Pro Max",
      targetDate: "2024-12-31",
      flexibility: "1-2 weeks",
      quantity: 1,
      location: "Istanbul",
      currency: "USD",
      minPrice: 999,
      maxPrice: 1199,
      status: "active",
      interestedBuyers: 12,
      targetGroup: 25,
      progress: 48
    },
    {
      id: 2,
      productName: "MacBook Air M3",
      targetDate: "2025-01-15",
      flexibility: "1 month",
      quantity: 1,
      location: "Istanbul",
      status: "active",
      interestedBuyers: 8,
      targetGroup: 20,
      progress: 40
    },
    {
      id: 3,
      productName: "Tesla Model 3",
      targetDate: "2024-11-20",
      flexibility: "fixed",
      quantity: 1,
      location: "Istanbul",
      status: "completed",
      interestedBuyers: 15,
      targetGroup: 15,
      progress: 100
    }
  ];

  const displayPlans = userIntentions.length > 0 ? userIntentions : defaultPlans;
  const filteredPlans = statusFilter === "all" ? displayPlans : displayPlans.filter((plan: any) => plan.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/consumer-dashboard")}
              className="mr-4 p-0"
            >
              <ArrowLeft className="text-neutral-600 dark:text-neutral-300" size={20} />
            </Button>
            <h2 className="text-xl font-medium dark:text-white">My Purchase Plans</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/create-intention")}
              className="gap-2"
            >
              <Filter size={16} />
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white px-4 pb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plans list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">No purchase plans found</p>
              <p className="text-sm text-neutral-500 mt-1 mb-4">Create your first plan to get started</p>
              <Button onClick={() => setLocation("/create-intention")} className="gap-2">
                Create Purchase Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan: any) => (
                <Card key={plan.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{plan.productName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar size={14} className="text-neutral-500" />
                          <span className="text-sm text-neutral-600">
                            {new Date(plan.targetDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={14} className="text-neutral-500" />
                          <span className="text-sm text-neutral-600">{plan.location}</span>
                        </div>
                        {(plan.minPrice || plan.maxPrice) && (
                          <div className="text-sm text-neutral-600 mt-1">
                            Price: {plan.currency === "TRY" ? "₺" : 
                                   plan.currency === "EUR" ? "€" : 
                                   plan.currency === "GBP" ? "£" : 
                                   plan.currency === "JPY" ? "¥" : "$"}
                            {plan.minPrice && plan.maxPrice ? `${plan.minPrice} - ${plan.maxPrice}` :
                             plan.minPrice ? `from ${plan.minPrice}` :
                             plan.maxPrice ? `up to ${plan.maxPrice}` : ""}
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {getStatusLabel(plan.status)}
                      </Badge>
                    </div>

                    {plan.status === "active" && (
                      <>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-neutral-600">Group Progress</span>
                            <span className="font-medium">
                              {plan.interestedBuyers || 0}/{plan.targetGroup || 25}
                            </span>
                          </div>
                          <Progress value={plan.progress || 0} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Users size={14} />
                          <span>{plan.interestedBuyers || 0} people interested</span>
                        </div>
                      </>
                    )}

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">
                          Flexibility: {plan.flexibility}
                        </span>
                        <div className="flex items-center gap-2">
                          {plan.status === "active" && (
                            <ShareIntention intention={plan} />
                          )}
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
