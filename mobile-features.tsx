import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import MobileIntegration from "@/components/mobile-integration";

export default function MobileFeatures() {
  const [, setLocation] = useLocation();

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/consumer-dashboard")}
              className="p-1"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-medium">Mobile Features</h1>
              <p className="text-sm text-neutral-600">Cross-platform mobile integration</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <MobileIntegration userType="consumer" />
        </div>
      </div>
    </MobileContainer>
  );
}
