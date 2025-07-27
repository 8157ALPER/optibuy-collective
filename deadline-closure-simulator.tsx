import { useState, useEffect } from "react";
import { Clock, TrendingUp, Award, Users, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Offer {
  id: number;
  sellerId: number;
  sellerName: string;
  price: number;
  originalPrice: number;
  discount: number;
  reliability: number;
  responseTime: string;
  terms: string;
}

interface DeadlineClosureSimulatorProps {
  productName: string;
  totalBuyers: number;
  onSelectionComplete?: (result: any) => void;
}

export default function DeadlineClosureSimulator({ 
  productName, 
  totalBuyers, 
  onSelectionComplete 
}: DeadlineClosureSimulatorProps) {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectionResult, setSelectionResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<"countdown" | "sorting" | "selection" | "complete">("countdown");

  // Generate sample offers
  useEffect(() => {
    const sampleOffers: Offer[] = [
      {
        id: 1,
        sellerId: 101,
        sellerName: "TechStore Pro",
        price: 999,
        originalPrice: 1199,
        discount: 17,
        reliability: 95,
        responseTime: "2 min",
        terms: "Free shipping, 1yr warranty"
      },
      {
        id: 2,
        sellerId: 102,
        sellerName: "MegaTech Solutions",
        price: 1049,
        originalPrice: 1199,
        discount: 13,
        reliability: 92,
        responseTime: "5 min",
        terms: "Express delivery, 2yr warranty"
      },
      {
        id: 3,
        sellerId: 103,
        sellerName: "ElectroWorld",
        price: 1079,
        originalPrice: 1199,
        discount: 10,
        reliability: 88,
        responseTime: "12 min",
        terms: "Standard delivery, 1yr warranty"
      },
      {
        id: 4,
        sellerId: 104,
        sellerName: "GadgetHub",
        price: 1099,
        originalPrice: 1199,
        discount: 8,
        reliability: 85,
        responseTime: "8 min",
        terms: "Free shipping, 90 day warranty"
      },
      {
        id: 5,
        sellerId: 105,
        sellerName: "TechMart",
        price: 1129,
        originalPrice: 1199,
        discount: 6,
        reliability: 82,
        responseTime: "15 min",
        terms: "Standard shipping, 6 month warranty"
      }
    ];
    setOffers(sampleOffers);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0 && currentStep === "countdown") {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentStep === "countdown") {
      processDeadlineClosure();
    }
  }, [timeRemaining, currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processDeadlineClosure = async () => {
    setIsProcessing(true);
    setCurrentStep("sorting");

    // Step 1: Sort offers by price
    await new Promise(resolve => setTimeout(resolve, 2000));
    const sortedOffers = [...offers].sort((a, b) => a.price - b.price);
    setOffers(sortedOffers);

    setCurrentStep("selection");
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Select best offer and backups
    const selectedOffer = sortedOffers[0];
    const backupOffers = sortedOffers.slice(1, 4);
    const rejectedOffers = sortedOffers.slice(4);

    const result = {
      selectedOffer,
      backupOffers,
      rejectedOffers,
      totalBuyers,
      savingsPerBuyer: selectedOffer.originalPrice - selectedOffer.price,
      totalSavings: (selectedOffer.originalPrice - selectedOffer.price) * totalBuyers
    };

    setSelectionResult(result);
    setCurrentStep("complete");
    setIsProcessing(false);
    onSelectionComplete?.(result);
  };

  const simulateFailureAndSwitch = () => {
    if (!selectionResult) return;

    const failedOffer = selectionResult.selectedOffer;
    const newSelected = selectionResult.backupOffers[0];
    const newBackups = selectionResult.backupOffers.slice(1);

    setSelectionResult({
      ...selectionResult,
      selectedOffer: newSelected,
      backupOffers: newBackups,
      failedOffer
    });
  };

  return (
    <div className="space-y-4">
      {/* Countdown Phase */}
      {currentStep === "countdown" && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="text-blue-500" size={20} />
              <span>Deadline Countdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-neutral-600">Time remaining for {productName} offers</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{offers.length}</div>
                <p className="text-sm text-neutral-600">Active Offers</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalBuyers.toLocaleString()}</div>
                <p className="text-sm text-neutral-600">Ready Buyers</p>
              </div>
            </div>

            <Progress value={((300 - timeRemaining) / 300) * 100} className="h-2" />

            <div className="text-xs text-neutral-500 bg-blue-50 p-3 rounded">
              <p className="font-medium mb-1">What happens at deadline:</p>
              <p>• All offers are automatically sorted by price (lowest first)</p>
              <p>• Best offer (cheapest) is selected for all {totalBuyers.toLocaleString()} buyers</p>
              <p>• Top 3 backup offers are prepared in case of seller failure</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Phase */}
      {(currentStep === "sorting" || currentStep === "selection") && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              <TrendingUp className="text-orange-500" size={48} />
            </motion.div>
            
            {currentStep === "sorting" && (
              <div>
                <h3 className="font-bold text-lg mb-2">Sorting Offers by Price</h3>
                <p className="text-neutral-600">OptiBuy is analyzing all {offers.length} offers...</p>
              </div>
            )}
            
            {currentStep === "selection" && (
              <div>
                <h3 className="font-bold text-lg mb-2">Selecting Best Option</h3>
                <p className="text-neutral-600">Choosing lowest price with backup options...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Phase */}
      {currentStep === "complete" && selectionResult && (
        <div className="space-y-4">
          {/* Selected Offer */}
          <Card className="border-l-4 border-l-green-500 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="text-green-500" size={20} />
                <span>Best Offer Selected</span>
                <Badge className="bg-green-500 text-white">WINNER</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Seller</p>
                  <p className="font-bold">{selectionResult.selectedOffer.sellerName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Winning Price</p>
                  <p className="font-bold text-2xl text-green-600">
                    ${selectionResult.selectedOffer.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      ${selectionResult.savingsPerBuyer}
                    </div>
                    <p className="text-xs text-neutral-600">Savings per buyer</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {totalBuyers.toLocaleString()}
                    </div>
                    <p className="text-xs text-neutral-600">Total buyers</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      ${selectionResult.totalSavings.toLocaleString()}
                    </div>
                    <p className="text-xs text-neutral-600">Total savings</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => {
                    // Simulate order confirmation
                  }}
                >
                  <CheckCircle className="mr-2" size={16} />
                  Confirm Orders
                </Button>
                <Button 
                  variant="outline" 
                  onClick={simulateFailureAndSwitch}
                  className="border-orange-500 text-orange-600"
                >
                  <AlertTriangle className="mr-2" size={16} />
                  Simulate Failure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Backup Offers */}
          {selectionResult.backupOffers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backup Options Ready</CardTitle>
                <p className="text-sm text-neutral-600">
                  Automatically switch if seller cannot fulfill orders
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectionResult.backupOffers.map((offer: Offer, index: number) => (
                  <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 2}
                      </Badge>
                      <div>
                        <p className="font-medium">{offer.sellerName}</p>
                        <p className="text-xs text-neutral-600">{offer.terms}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${offer.price.toLocaleString()}</p>
                      <p className="text-xs text-neutral-600">
                        +${offer.price - selectionResult.selectedOffer.price} vs winner
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Failed Offer Alert */}
          {selectionResult.failedOffer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <div>
                      <h3 className="font-medium text-red-800">Seller Fulfillment Failed</h3>
                      <p className="text-sm text-red-700">
                        {selectionResult.failedOffer.sellerName} cannot fulfill orders. 
                        Automatically switched to next best option.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Legal Notice */}
          <div className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded border">
            <p className="font-medium mb-1">Legal Disclaimer:</p>
            <p>OptiBuy facilitates offer selection but is not responsible for seller fulfillment. All obligations are between buyers and selected sellers. OptiBuy reserves the right to switch to backup offers in case of seller failure.</p>
          </div>
        </div>
      )}
    </div>
  );
}
