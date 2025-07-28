import { useState } from "react";
import { ArrowLeft, Mail, Bell, Clock, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";

import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EmailPreferences() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    orderConfirmations: true,
    sellerOffers: true,
    advancementOpportunities: true,
    cancellationReminders: true,
    frequency: "immediate", // immediate, daily, weekly
    emailTime: "09:00"
  });

  const [testEmail, setTestEmail] = useState("");

  const testEmailMutation = useMutation({
    mutationFn: async ({ type, email }: { type: string; email: string }) => {
      const response = await apiRequest("POST", "/api/test-email", {
        userEmail: email,
        userName: "Test User",
        productName: "Sample Product",
        type
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Test email sent!",
          description: "Check your inbox for the test email notification.",
        });
      } else {
        toast({
          title: "Email failed",
          description: "Unable to send test email. Please check your email configuration.",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Unable to send test email. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleTestEmail = (type: string) => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address to test.",
        variant: "destructive"
      });
      return;
    }
    testEmailMutation.mutate({ type, email: testEmail });
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white p-4 border-b flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/consumer-dashboard")}
            className="mr-3 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <Mail className="mr-2 text-primary" size={20} />
          <h1 className="text-xl font-semibold">Email Preferences</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2" size={20} />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="order-confirmations" className="font-medium">Order Confirmations</Label>
                  <p className="text-sm text-neutral-600">Receive confirmation emails when your orders are received</p>
                </div>
                <Switch
                  id="order-confirmations"
                  checked={preferences.orderConfirmations}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, orderConfirmations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="seller-offers" className="font-medium">Seller Offers</Label>
                  <p className="text-sm text-neutral-600">Get notified about new offers from sellers</p>
                </div>
                <Switch
                  id="seller-offers"
                  checked={preferences.sellerOffers}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, sellerOffers: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="advancement-opportunities" className="font-medium">Advancement Opportunities</Label>
                  <p className="text-sm text-neutral-600">Alerts about order advancement and bonus discounts</p>
                </div>
                <Switch
                  id="advancement-opportunities"
                  checked={preferences.advancementOpportunities}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, advancementOpportunities: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cancellation-reminders" className="font-medium">Cancellation Reminders</Label>
                  <p className="text-sm text-neutral-600">Reminders about cancellation deadlines</p>
                </div>
                <Switch
                  id="cancellation-reminders"
                  checked={preferences.cancellationReminders}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, cancellationReminders: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2" size={20} />
                Email Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="frequency">Communication Frequency</Label>
                <Select value={preferences.frequency} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, frequency: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-600 mt-1">
                  Choose how often you want to receive seller offer updates
                </p>
              </div>

              {preferences.frequency !== "immediate" && (
                <div>
                  <Label htmlFor="email-time">Preferred Email Time</Label>
                  <Input
                    id="email-time"
                    type="time"
                    value={preferences.emailTime}
                    onChange={(e) => setPreferences(prev => ({ ...prev, emailTime: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-neutral-600 mt-1">
                    Time when you prefer to receive summary emails
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Email Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="mr-2" size={20} />
                Test Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestEmail("order")}
                  disabled={testEmailMutation.isPending}
                  className="flex-1"
                >
                  Test Order Confirmation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestEmail("rfq")}
                  disabled={testEmailMutation.isPending}
                  className="flex-1"
                >
                  Test RFQ Confirmation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestEmail("offer")}
                  disabled={testEmailMutation.isPending}
                  className="flex-1"
                >
                  Test Seller Offer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Email Policy */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <h3 className="font-medium text-primary mb-2">OptiBuy Email Policy</h3>
              <ul className="text-sm text-neutral-700 space-y-1">
                <li>• You will be contacted through your registered email in the system</li>
                <li>• Companies provide up-to-date information within the period you specify</li>
                <li>• Offers available both from OptiBuy platform and direct email</li>
                <li>• All communications respect your specified timeframe and preferences</li>
              </ul>
            </CardContent>
          </Card>

          {/* Save Preferences */}
          <Button className="w-full" size="lg">
            Save Email Preferences
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
