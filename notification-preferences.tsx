import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bell, BellOff, Filter, UserCheck, Settings } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  profession?: string;
  enablePopupNotifications: boolean;
  enableUnrelatedPopups: boolean;
  notificationFrequency: string;
}

export default function NotificationPreferences() {
  const { toast } = useToast();
  const [profession, setProfession] = useState("");

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/profile"],
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: { 
      enableUnrelatedPopups?: boolean; 
      notificationFrequency?: string;
      profession?: string;
    }) => {
      return apiRequest("/api/user/notification-preferences", {
        method: "PATCH",
        body: preferences,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    },
  });

  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const handleProfessionUpdate = () => {
    if (profession.trim()) {
      updatePreferencesMutation.mutate({ profession: profession.trim() });
      setProfession("");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Control which notifications you receive to avoid irrelevant pop-ups
          </p>
        </div>

        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Pop-up Notifications
            </CardTitle>
            <CardDescription>
              Control when and how you receive campaign notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Pop-up Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive campaign notifications and group buying opportunities
                </p>
              </div>
              <Switch
                checked={user?.enablePopupNotifications || false}
                onCheckedChange={(checked) => handlePreferenceChange("enablePopupNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Unrelated Pop-ups</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications even if they're not directly related to your profession or interests
                </p>
              </div>
              <Switch
                checked={user?.enableUnrelatedPopups || false}
                onCheckedChange={(checked) => handlePreferenceChange("enableUnrelatedPopups", checked)}
                disabled={!user?.enablePopupNotifications}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Notification Frequency</Label>
              <Select
                value={user?.notificationFrequency || "relevant_only"}
                onValueChange={(value) => handlePreferenceChange("notificationFrequency", value)}
                disabled={!user?.enablePopupNotifications}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="relevant_only">Relevant Only (Recommended)</SelectItem>
                  <SelectItem value="minimal">Minimal (High Priority Only)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose how often you want to receive notifications
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profession Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Help us show you more relevant notifications by sharing your profession
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Profession</Label>
              <p className="text-sm text-muted-foreground">
                {user?.profession || "Not specified"}
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter your profession (e.g., Veterinarian, Doctor, Teacher)"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleProfessionUpdate}
                disabled={!profession.trim() || updatePreferencesMutation.isPending}
              >
                Update
              </Button>
            </div>

            {user?.profession && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm">
                  <strong>Smart Filtering Active:</strong> As a {user.profession}, you'll only see 
                  notifications for products and services relevant to your profession when 
                  "Show Unrelated Pop-ups" is disabled.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              How Smart Filtering Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600 dark:text-green-400">
                  ✓ Relevant Notifications
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Products for your profession</li>
                  <li>• Items matching your purchase history</li>
                  <li>• Age and location-appropriate offers</li>
                  <li>• High-relevance group buying opportunities</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600 dark:text-red-400">
                  ✗ Filtered Out (When Disabled)
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Unrelated consumer products</li>
                  <li>• Wrong demographic targeting</li>
                  <li>• Low-relevance campaigns</li>
                  <li>• Generic mass-market offers</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <p className="text-sm">
                <strong>Tip for Professionals:</strong> Keep "Show Unrelated Pop-ups" disabled 
                to focus only on relevant business opportunities and avoid distractions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
