import { useState, useEffect } from "react";
import { Smartphone, Download, Share2, Bell, Calendar, Camera, Vibrate } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MobileIntegrationProps {
  userType: "consumer" | "business" | "seller";
}

// Progressive Web App features
class MobileAppService {
  private deferredPrompt: any = null;
  private isInstalled = false;

  constructor() {
    this.initializePWA();
  }

  private initializePWA() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      console.log('OptiBuy PWA was installed');
    });

    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }

    // Request notification permissions
    this.requestNotificationPermission();
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.isInstalled = true;
        this.deferredPrompt = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  isAppInstalled(): boolean {
    return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
  }

  private async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  async sendNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/app-icon.svg',
        badge: '/app-icon.svg',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      return notification;
    }
    return null;
  }

  async shareContent(title: string, text: string, url?: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: url || window.location.href
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    
    // Fallback to clipboard
    if (navigator.clipboard) {
      const shareText = `${title}\n${text}\n${url || window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      return true;
    }
    
    return false;
  }

  async addToCalendar(title: string, date: Date, description?: string) {
    const startDate = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${title}
DESCRIPTION:${description || ''}
END:VEVENT
END:VCALENDAR`;

    const link = document.createElement('a');
    link.href = calendarUrl;
    link.download = 'optibuy-event.ics';
    link.click();
  }

  vibrate(pattern: number | number[] = 200) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  async capturePhoto(): Promise<string | null> {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        // In a real implementation, you'd create a camera interface
        // For now, return a placeholder
        return 'data:image/png;base64,placeholder';
      } catch (error) {
        console.error('Camera access denied:', error);
        return null;
      }
    }
    return null;
  }
}

const mobileService = new MobileAppService();

export default function MobileIntegration({ userType }: MobileIntegrationProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCanInstall(mobileService.canInstall());
    setIsInstalled(mobileService.isAppInstalled());
    setNotificationsEnabled(Notification.permission === 'granted');

    // Update install state when app is installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  const handleInstallApp = async () => {
    const success = await mobileService.installApp();
    if (success) {
      toast({
        title: "App Installed!",
        description: "OptiBuy is now available on your home screen",
      });
      setIsInstalled(true);
      setCanInstall(false);
    } else {
      toast({
        title: "Installation Failed",
        description: "Could not install the app. Try again later.",
        variant: "destructive"
      });
    }
  };

  const handleEnableNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      mobileService.sendNotification('Notifications Enabled!', {
        body: 'You\'ll now receive updates about group purchases and offers'
      });
      toast({
        title: "Notifications Enabled",
        description: "You'll receive updates about group purchases",
      });
    }
  };

  const handleShareApp = async () => {
    const success = await mobileService.shareContent(
      'OptiBuy - Collective Purchase Power',
      'Join me on OptiBuy to discover your invisible buying neighbors and unlock group purchasing discounts!',
      window.location.origin
    );
    
    if (success) {
      toast({
        title: "Shared Successfully",
        description: "OptiBuy link shared!",
      });
    }
  };

  const getFeaturesByUserType = () => {
    const baseFeatures = [
      { icon: Bell, title: "Push Notifications", description: "Real-time updates on group purchases" },
      { icon: Share2, title: "Easy Sharing", description: "Share purchase intentions with friends" },
      { icon: Calendar, title: "Calendar Integration", description: "Add purchase deadlines to your calendar" }
    ];

    switch (userType) {
      case "consumer":
        return [
          ...baseFeatures,
          { icon: Camera, title: "Product Scanner", description: "Scan barcodes to find group deals" },
          { icon: Vibrate, title: "Deal Alerts", description: "Haptic feedback for urgent deals" }
        ];
      case "business":
        return [
          ...baseFeatures,
          { icon: Camera, title: "Document Scanner", description: "Scan invoices and receipts" },
          { icon: Smartphone, title: "Mobile RFQ", description: "Create RFQs on the go" }
        ];
      case "seller":
        return [
          ...baseFeatures,
          { icon: Camera, title: "Inventory Scanner", description: "Quick product catalog updates" },
          { icon: Vibrate, title: "Order Alerts", description: "Immediate notifications for new orders" }
        ];
      default:
        return baseFeatures;
    }
  };

  const features = getFeaturesByUserType();

  return (
    <div className="space-y-4">
      {/* App Installation */}
      {canInstall && !isInstalled && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <Download className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">Install OptiBuy App</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Add to home screen for faster access
                  </p>
                </div>
              </div>
              <Button onClick={handleInstallApp} className="bg-blue-500 hover:bg-blue-600">
                Install
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Installation Success */}
      {isInstalled && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                <Smartphone className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  App Installed Successfully!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  OptiBuy is now available on your home screen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="text-purple-500" size={20} />
            <span>Mobile Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <IconComponent className="text-gray-600 dark:text-gray-400" size={20} />
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!notificationsEnabled && (
            <Button 
              onClick={handleEnableNotifications}
              variant="outline" 
              className="w-full justify-start"
            >
              <Bell className="mr-2" size={16} />
              Enable Notifications
            </Button>
          )}

          <Button 
            onClick={handleShareApp}
            variant="outline" 
            className="w-full justify-start"
          >
            <Share2 className="mr-2" size={16} />
            Share OptiBuy
          </Button>

          <Button 
            onClick={() => mobileService.addToCalendar(
              "OptiBuy Group Purchase",
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              "Check your active group purchases"
            )}
            variant="outline" 
            className="w-full justify-start"
          >
            <Calendar className="mr-2" size={16} />
            Add Reminder to Calendar
          </Button>
        </CardContent>
      </Card>

      {/* Platform Status */}
      <div className="flex items-center justify-center space-x-4 py-4">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Smartphone size={12} className="mr-1" />
          Mobile Optimized
        </Badge>
        {isInstalled && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            PWA Installed
          </Badge>
        )}
        {notificationsEnabled && (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Notifications On
          </Badge>
        )}
      </div>
    </div>
  );
}

// Export service for use in other components
export { mobileService };
