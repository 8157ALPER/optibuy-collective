import { Users, Calendar, Percent, Handshake } from "lucide-react";
import { useLocation } from "wouter";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const [, setLocation] = useLocation();

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col">
        {/* Background with gradient */}
        <div className="flex-1 bg-gradient-primary relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 right-5 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-32 left-8 w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-40 right-12 w-16 h-16 bg-white/15 rounded-full"></div>
          
          {/* Main content */}
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="mb-8">
              <Users className="text-6xl text-white mb-4 mx-auto" size={64} />
              <h1 className="text-3xl font-bold text-white mb-2">OptiBuy</h1>
              <p className="text-white/90 text-lg">Collective Purchase Power</p>
            </div>
            
            <div className="space-y-4 text-white/80 text-sm">
              <div className="flex items-center space-x-3">
                <Calendar className="text-accent" size={20} />
                <span>Plan future purchases together</span>
              </div>
              <div className="flex items-center space-x-3">
                <Percent className="text-secondary" size={20} />
                <span>Get better prices through volume</span>
              </div>
              <div className="flex items-center space-x-3">
                <Handshake className="text-warning" size={20} />
                <span>Connect buyers with sellers</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom action area */}
        <div className="p-6 bg-white">
          <Button 
            onClick={() => setLocation("/user-type")}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg font-medium text-lg transition-colors mb-4"
          >
            Get Started
          </Button>
          <p className="text-xs text-neutral-600 text-center">
            By continuing, you agree to our{" "}
            <span 
              className="text-primary underline cursor-pointer"
              onClick={() => setLocation("/legal")}
            >
              Terms of Service
            </span> and{" "}
            <span 
              className="text-primary underline cursor-pointer"
              onClick={() => setLocation("/privacy")}
            >
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
