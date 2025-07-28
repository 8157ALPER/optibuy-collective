import { useState } from "react";
import { ArrowLeft, Search, Car, Home, Laptop, Smartphone, Shirt, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Categories() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categoryIcons: Record<string, any> = {
    "Automotive": Car,
    "Home & Garden": Home,
    "Electronics": Laptop,
    "Mobile & Tablets": Smartphone,
    "Fashion": Shirt,
    "Books & Education": BookOpen,
  };

  const defaultCategories = [
    { id: 1, name: "Electronics", icon: "Electronics", activeOffers: 24, totalIntentions: 156 },
    { id: 2, name: "Automotive", icon: "Automotive", activeOffers: 18, totalIntentions: 89 },
    { id: 3, name: "Home & Garden", icon: "Home & Garden", activeOffers: 31, totalIntentions: 203 },
    { id: 4, name: "Mobile & Tablets", icon: "Mobile & Tablets", activeOffers: 42, totalIntentions: 278 },
    { id: 5, name: "Fashion", icon: "Fashion", activeOffers: 15, totalIntentions: 124 },
    { id: 6, name: "Books & Education", icon: "Books & Education", activeOffers: 8, totalIntentions: 67 },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  const filteredCategories = displayCategories.filter((category: any) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/consumer-dashboard")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">Categories</h2>
        </div>

        {/* Search */}
        <div className="bg-white px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" size={20} />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-neutral-50 border-neutral-200"
            />
          </div>
        </div>

        {/* Categories grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredCategories.map((category: any) => {
              const IconComponent = categoryIcons[category.icon] || Laptop;
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setLocation("/consumer-dashboard")}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="text-primary" size={24} />
                    </div>
                    <h3 className="font-medium text-sm mb-2">{category.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {category.activeOffers || 0} Offers
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-600">
                        {category.totalIntentions || 0} Purchase Plans
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No categories found</p>
              <p className="text-sm text-neutral-500 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
