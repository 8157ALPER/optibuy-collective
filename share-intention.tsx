import { useState } from "react";
import { Share, Copy, Mail, MessageCircle, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ShareIntentionProps {
  intention: {
    id: number;
    productName: string;
    targetPrice: number;
    currency: string;
    targetDate: string;
    quantity: number;
  };
}

export default function ShareIntention({ intention }: ShareIntentionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState<string[]>([]);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/intention/${intention.id}`;
  const shareText = `Join my group purchase for ${intention.productName}! Target price: ${intention.currency}${intention.targetPrice} for ${intention.quantity} units by ${new Date(intention.targetDate).toLocaleDateString()}. Join here: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = (emails: string) => {
    const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
    const subject = `Join my group purchase: ${intention.productName}`;
    const body = encodeURIComponent(shareText);
    const mailtoUrl = `mailto:${emailList.join(',')}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
    
    setCopiedEmails(emailList);
    toast({
      title: "Email client opened",
      description: `Prepared to share with ${emailList.length} contacts`,
    });
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSocialShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Group purchase: ${intention.productName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share size={16} />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Share Purchase Intention
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900">{intention.productName}</h4>
            <p className="text-sm text-blue-700">
              Target: {intention.currency}{intention.targetPrice} × {intention.quantity} units
            </p>
            <p className="text-sm text-blue-700">
              Deadline: {new Date(intention.targetDate).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Share via Email</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="colleague@company.com, team@company.com"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEmailShare((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    if (input?.value) handleEmailShare(input.value);
                  }}
                >
                  <Mail size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple emails with commas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsAppShare}
                className="gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSocialShare}
                className="gap-2"
              >
                <Share size={16} />
                More
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Direct Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button size="sm" onClick={handleCopyLink}>
                  <Copy size={16} />
                </Button>
              </div>
            </div>
          </div>

          {copiedEmails.length > 0 && (
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">
                  Shared with {copiedEmails.length} contacts
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
