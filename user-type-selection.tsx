import { ArrowLeft, ShoppingCart, Store, Building2, Check } from "lucide-react";
import { useLocation } from "wouter";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";

export default function UserTypeSelection() {
  const [, setLocation] = useLocation();

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-6 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">Choose Account Type</h2>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6">
          <p className="text-neutral-600 mb-8 text-center">Select how you plan to use OptiBuy</p>
          
          {/* Consumer Card */}
          <div 
            onClick={() => setLocation("/consumer-dashboard")}
            className="bg-white rounded-xl p-6 mb-4 border-2 border-transparent hover:border-primary cursor-pointer transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <ShoppingCart className="text-primary text-xl" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">I'm a Consumer</h3>
                <p className="text-neutral-600 text-sm mb-3">
                  Plan purchases, join collective buying groups, and get better prices
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center text-secondary">
                    <Check className="mr-2" size={14} />
                    <span>Post purchase intentions</span>
                  </div>
                  <div className="flex items-center text-secondary">
                    <Check className="mr-2" size={14} />
                    <span>Join group purchases</span>
                  </div>
                  <div className="flex items-center text-secondary">
                    <Check className="mr-2" size={14} />
                    <span>Get volume discounts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seller Card */}
          <div 
            onClick={() => setLocation("/seller-dashboard")}
            className="bg-white rounded-xl p-6 mb-4 border-2 border-transparent hover:border-secondary cursor-pointer transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-secondary/10 p-3 rounded-xl">
                <Store className="text-secondary text-xl" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">I'm a Seller</h3>
                <p className="text-neutral-600 text-sm mb-3">
                  View demand data, make bulk offers, and increase sales volume
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center text-secondary">
                    <Check className="mr-2" size={14} />
                    <span>Access demand analytics</span>
                  </div>
                  <div className="flex items-center text-secondary">
                    <Check className="mr-2" size={14} />
                    <span>Submit bulk offers</span>
                  </div>
                  <div className="flex items-center text-secondary">
                    <Check className="mr-2" size={14} />
                    <span>Increase sales volume</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Business Card */}
          <div 
            onClick={() => setLocation("/business-dashboard")}
            className="bg-white rounded-xl p-6 border-2 border-transparent hover:border-warning cursor-pointer transition-all"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-warning/10 p-3 rounded-xl">
                <Building2 className="text-warning text-xl" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">I'm a Business</h3>
                <p className="text-neutral-600 text-sm mb-3">
                  Procure raw materials, equipment, and supplies for your company
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center text-warning">
                    <Check className="mr-2" size={14} />
                    <span>Bulk raw material procurement</span>
                  </div>
                  <div className="flex items-center text-warning">
                    <Check className="mr-2" size={14} />
                    <span>Industrial equipment sourcing</span>
                  </div>
                  <div className="flex items-center text-warning">
                    <Check className="mr-2" size={14} />
                    <span>Volume pricing for companies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
