import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Package, Eye, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RFQList() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("open");

  const { data: allRfqs = [] } = useQuery({
    queryKey: ["/api/rfqs"],
  });

  const { data: myRfqs = [] } = useQuery({
    queryKey: ["/api/rfqs", "1"], // Mock business user ID
  });

  const openRfqs = allRfqs.filter((rfq: any) => rfq.status === 'open');
  const myActiveRfqs = myRfqs.filter((rfq: any) => rfq.status === 'open');
  const myClosedRfqs = myRfqs.filter((rfq: any) => rfq.status === 'closed');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDeadline = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days left`;
  };

  const RFQCard = ({ rfq, showActions = false }: { rfq: any; showActions?: boolean }) => (
    <Card className="mb-3 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium">{rfq.title}</h4>
            <p className="text-sm text-neutral-600 mt-1">{rfq.description}</p>
          </div>
          <Badge className={`ml-2 ${rfq.status === 'open' ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-600'}`}>
            {rfq.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div className="flex items-center">
            <Package className="mr-2 text-neutral-400" size={16} />
            <span>{rfq.quantity} units</span>
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 text-neutral-400" size={16} />
            <span>{rfq.deliveryLocation}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 text-neutral-400" size={16} />
            <span>Due: {formatDate(rfq.requiredDeliveryDate)}</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-2 text-warning" size={16} />
            <span className="font-medium">{formatDeadline(rfq.submissionDeadline)}</span>
          </div>
        </div>
        
        {rfq.targetPrice && (
          <div className="mb-3 p-2 bg-neutral-50 rounded">
            <span className="text-sm text-neutral-600">Target Price: </span>
            <span className="font-medium">${rfq.targetPrice}/unit</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            Posted {formatDate(rfq.createdAt)}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-1" size={14} />
              View Details
            </Button>
            {showActions && (
              <Button size="sm" className="bg-warning text-white">
                Submit Quote
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        <div className="bg-white shadow-sm px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/business-dashboard")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">RFQ Management</h2>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="open">Open RFQs</TabsTrigger>
              <TabsTrigger value="my-active">My Active</TabsTrigger>
              <TabsTrigger value="my-closed">My Closed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="open" className="flex-1 overflow-y-auto p-4 mt-0">
              <div className="mb-4">
                <h3 className="font-medium mb-2">Available RFQs</h3>
                <p className="text-sm text-neutral-600">Submit quotes for open procurement requests</p>
              </div>
              
              {openRfqs.length === 0 ? (
                <Card className="p-6 text-center">
                  <MessageSquare className="mx-auto text-neutral-400 mb-2" size={48} />
                  <p className="text-neutral-600">No open RFQs available</p>
                  <p className="text-xs text-neutral-500 mt-1">Check back later for new opportunities</p>
                </Card>
              ) : (
                openRfqs.map((rfq: any) => (
                  <RFQCard key={rfq.id} rfq={rfq} showActions={true} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="my-active" className="flex-1 overflow-y-auto p-4 mt-0">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium mb-1">My Active RFQs</h3>
                  <p className="text-sm text-neutral-600">Currently accepting quotes</p>
                </div>
                <Button 
                  onClick={() => setLocation("/create-rfq")}
                  size="sm" 
                  className="bg-warning text-white"
                >
                  New RFQ
                </Button>
              </div>
              
              {myActiveRfqs.length === 0 ? (
                <Card className="p-6 text-center">
                  <Package className="mx-auto text-neutral-400 mb-2" size={48} />
                  <p className="text-neutral-600">No active RFQs</p>
                  <Button 
                    onClick={() => setLocation("/create-rfq")}
                    className="mt-3 bg-warning text-white"
                  >
                    Create Your First RFQ
                  </Button>
                </Card>
              ) : (
                myActiveRfqs.map((rfq: any) => (
                  <RFQCard key={rfq.id} rfq={rfq} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="my-closed" className="flex-1 overflow-y-auto p-4 mt-0">
              <div className="mb-4">
                <h3 className="font-medium mb-2">Closed RFQs</h3>
                <p className="text-sm text-neutral-600">Completed procurement requests</p>
              </div>
              
              {myClosedRfqs.length === 0 ? (
                <Card className="p-6 text-center">
                  <Clock className="mx-auto text-neutral-400 mb-2" size={48} />
                  <p className="text-neutral-600">No closed RFQs</p>
                  <p className="text-xs text-neutral-500 mt-1">Your completed RFQs will appear here</p>
                </Card>
              ) : (
                myClosedRfqs.map((rfq: any) => (
                  <RFQCard key={rfq.id} rfq={rfq} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileContainer>
  );
}
