import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Users, Calendar, Edit, Trash2, Eye } from "lucide-react";

import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CampaignManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    brandName: "",
    productName: "",
    discountPercentage: "",
    targetParticipants: "",
    minAge: "",
    maxAge: "",
    targetGender: "all",
    priority: "medium",
    endDate: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const companyId = 1; // In a real app, get from auth context

  const { data: campaigns = [] } = useQuery({
    queryKey: ["/api/campaigns/company", companyId]
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest("POST", "/api/campaigns", {
        companyId,
        ...campaignData,
        discountPercentage: parseInt(campaignData.discountPercentage),
        targetParticipants: parseInt(campaignData.targetParticipants),
        minAge: campaignData.minAge ? parseInt(campaignData.minAge) : null,
        maxAge: campaignData.maxAge ? parseInt(campaignData.maxAge) : null,
        startDate: new Date().toISOString(),
        endDate: new Date(campaignData.endDate).toISOString(),
        targetSegments: [], // Will be populated based on other criteria
        isActive: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/company", companyId] });
      setShowCreateDialog(false);
      setNewCampaign({
        title: "",
        description: "",
        brandName: "",
        productName: "",
        discountPercentage: "",
        targetParticipants: "",
        minAge: "",
        maxAge: "",
        targetGender: "all",
        priority: "medium",
        endDate: ""
      });
      toast({
        title: "Campaign Created",
        description: "Your targeted campaign is now live!",
      });
    }
  });

  const handleCreateCampaign = () => {
    createCampaignMutation.mutate(newCampaign);
  };

  const getStatusColor = (campaign: any) => {
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const participationRate = (campaign.currentParticipants / campaign.targetParticipants) * 100;

    if (endDate < now) return "bg-gray-100 text-gray-800";
    if (participationRate >= 100) return "bg-green-100 text-green-800";
    if (participationRate >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (campaign: any) => {
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const participationRate = (campaign.currentParticipants / campaign.targetParticipants) * 100;

    if (endDate < now) return "Expired";
    if (participationRate >= 100) return "Target Reached";
    if (participationRate >= 75) return "Nearly Full";
    return "Active";
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Campaign Management</h1>
              <p className="text-sm text-neutral-600">Create targeted pop-up campaigns</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-1" size={16} />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Targeted Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Campaign Title</label>
                    <Input
                      placeholder="e.g., 200 more people needed for Nike discount"
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe the offer and what customers get..."
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Brand Name</label>
                      <Input
                        placeholder="Nike"
                        value={newCampaign.brandName}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, brandName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Product</label>
                      <Input
                        placeholder="Air Max Sneakers"
                        value={newCampaign.productName}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, productName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Discount %</label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={newCampaign.discountPercentage}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, discountPercentage: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Target People</label>
                      <Input
                        type="number"
                        placeholder="200"
                        value={newCampaign.targetParticipants}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, targetParticipants: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Target Gender</label>
                    <Select 
                      value={newCampaign.targetGender} 
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetGender: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Min Age</label>
                      <Input
                        type="number"
                        placeholder="18"
                        value={newCampaign.minAge}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, minAge: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Age</label>
                      <Input
                        type="number"
                        placeholder="65"
                        value={newCampaign.maxAge}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, maxAge: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select 
                      value={newCampaign.priority} 
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="datetime-local"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateCampaign} 
                    disabled={createCampaignMutation.isPending}
                    className="w-full"
                  >
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{campaigns.length}</div>
                <p className="text-xs text-neutral-600">Total Campaigns</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-lg font-bold text-green-600">
                  {campaigns.filter((c: any) => c.isActive).length}
                </div>
                <p className="text-xs text-neutral-600">Active</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="mx-auto mb-3 text-neutral-400" size={48} />
                  <h3 className="font-medium text-neutral-700 mb-2">No campaigns yet</h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Create your first targeted pop-up campaign to reach specific user segments.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-1" size={16} />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign: any) => {
                const participationRate = (campaign.currentParticipants / campaign.targetParticipants) * 100;
                
                return (
                  <Card key={campaign.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getStatusColor(campaign)}>
                              {getStatusText(campaign)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {campaign.priority}
                            </Badge>
                          </div>
                          <h3 className="font-medium">{campaign.title}</h3>
                          <p className="text-sm text-neutral-600">{campaign.brandName} • {campaign.productName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{campaign.discountPercentage}% OFF</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <Users size={14} className="mr-1" />
                            {campaign.currentParticipants} / {campaign.targetParticipants} joined
                          </span>
                          <span>{Math.round(participationRate)}%</span>
                        </div>
                        <Progress value={participationRate} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-neutral-600 mb-3">
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          Ends {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                        <span>
                          Target: {campaign.targetGender !== "all" ? campaign.targetGender : "All"} 
                          {campaign.minAge && `, ${campaign.minAge}+`}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="mr-1" size={14} />
                          View Stats
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
