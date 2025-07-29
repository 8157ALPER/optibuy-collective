import { useState } from "react";
import { ArrowLeft, User, Settings, Bell, Shield, HelpCircle, LogOut, Edit, Star, Award } from "lucide-react";
import { useLocation } from "wouter";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    location: "Istanbul, Turkey",
    memberSince: "March 2024",
    verificationTier: "verified",
    totalPlans: 8,
    completedPurchases: 3,
    savedAmount: 1247.50,
    rating: 4.8
  };

  const menuItems = [
    {
      icon: Edit,
      title: "Edit Profile",
      description: "Update your personal information",
      action: () => setLocation("/edit-profile")
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage your notification preferences",
      action: () => setLocation("/notification-preferences")
    },
    {
      icon: Shield,
      title: "Verification",
      description: "Verify your identity for better deals",
      action: () => setLocation("/verification")
    },
    {
      icon: Settings,
      title: "Settings",
      description: "App preferences and privacy",
      action: () => setLocation("/settings")
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help or contact support",
      action: () => setLocation("/help")
    },
  ];

  const getVerificationColor = (tier: string) => {
    switch (tier) {
      case "verified":
        return "bg-blue-100 text-blue-700";
      case "certified":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/consumer-dashboard")}
              className="mr-4 p-0"
            >
              <ArrowLeft className="text-neutral-600" size={20} />
            </Button>
            <h2 className="text-xl font-medium">Profile</h2>
          </div>
        </div>

        {/* Profile content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* User info card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/avatar-placeholder.png" />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-neutral-600 text-sm">{user.email}</p>
                  <p className="text-neutral-500 text-sm">{user.location}</p>
                </div>
                <Badge className={getVerificationColor(user.verificationTier)}>
                  <Award size={12} className="mr-1" />
                  Verified
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="font-semibold text-lg">{user.totalPlans}</div>
                  <div className="text-xs text-neutral-600">Total Plans</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{user.completedPurchases}</div>
                  <div className="text-xs text-neutral-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">₺{user.savedAmount}</div>
                  <div className="text-xs text-neutral-600">Saved</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-neutral-600">Get notified about offers and updates</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-updates" className="font-medium">Email Updates</Label>
                  <p className="text-sm text-neutral-600">Weekly summary and special offers</p>
                </div>
                <Switch
                  id="email-updates"
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Menu items */}
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4" onClick={item.action}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                      <item.icon size={20} className="text-neutral-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-neutral-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sign out */}
          <Card className="mt-6 cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <LogOut size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Sign Out</h4>
                  <p className="text-sm text-red-500">Sign out of your account</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-neutral-500 mt-6 mb-4">
            Member since {user.memberSince} • OptiBuy v1.0
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
