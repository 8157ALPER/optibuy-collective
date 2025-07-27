import { useState } from "react";
import { AlertTriangle, X, Shield, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LegalDisclaimerBannerProps {
  onAccept?: () => void;
  variant?: "fulfillment" | "selection" | "general";
}

export default function LegalDisclaimerBanner({ 
  onAccept, 
  variant = "fulfillment" 
}: LegalDisclaimerBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept?.();
  };

  const getContent = () => {
    switch (variant) {
      case "fulfillment":
        return {
          title: "Order Fulfillment Disclaimer",
          summary: "OptiBuy is not responsible for seller fulfillment, manufacturing, or delivery.",
          details: [
            "OptiBuy acts solely as a marketplace facilitator connecting buyers and sellers",
            "All manufacturing, production, and delivery obligations are between buyers and sellers",
            "OptiBuy automatically selects the best offer (lowest price) after deadline closure",
            "If a seller cannot fulfill orders, we automatically switch to backup options",
            "OptiBuy is not liable for seller performance, quality issues, or delivery delays"
          ]
        };
      case "selection":
        return {
          title: "Automatic Selection Process",
          summary: "OptiBuy automatically processes offer selection based on predefined criteria.",
          details: [
            "After deadline closure, all offers are sorted by price (lowest to highest)",
            "The cheapest offer is automatically selected for all buyers",
            "Top 3 backup offers are prepared in case the selected seller fails",
            "Selection process is fully automated with no manual intervention",
            "Backup switching happens automatically without buyer notification delay"
          ]
        };
      default:
        return {
          title: "Platform Terms",
          summary: "By using OptiBuy, you agree to our terms and conditions.",
          details: [
            "OptiBuy facilitates connections between buyers and sellers",
            "All transactions are between users directly",
            "OptiBuy provides platform services only",
            "Users are responsible for their own due diligence",
            "Platform usage constitutes acceptance of all terms"
          ]
        };
    }
  };

  const content = getContent();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Card className="border-l-4 border-l-orange-500 bg-orange-50 shadow-lg max-w-4xl mx-auto">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-orange-500 mt-1 flex-shrink-0" size={24} />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-orange-800">{content.title}</h3>
                    <Badge className="bg-orange-500 text-white text-xs">
                      IMPORTANT
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-orange-700 hover:text-orange-800"
                    >
                      <FileText size={16} className="mr-1" />
                      {isExpanded ? "Less" : "Details"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVisible(false)}
                      className="text-orange-700 hover:text-orange-800 p-1"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>

                <p className="text-orange-700 mb-3 font-medium">
                  {content.summary}
                </p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-sm text-orange-700 mb-4 space-y-1 bg-orange-100 p-3 rounded">
                        <p className="font-medium mb-2">Key Points:</p>
                        {content.details.map((detail, index) => (
                          <p key={index} className="flex items-start space-x-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{detail}</span>
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={handleAccept}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                  >
                    <Shield className="mr-2" size={16} />
                    I Understand & Accept
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="border-orange-500 text-orange-700"
                  >
                    {isExpanded ? "Hide" : "Read"} Full Terms
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
