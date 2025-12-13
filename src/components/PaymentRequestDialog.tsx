import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreditCard, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentRequestDialogProps {
  materialId: string;
  materialTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeEntry: () => void;
}

export function PaymentRequestDialog({ 
  materialId, 
  materialTitle, 
  open, 
  onOpenChange,
  onCodeEntry 
}: PaymentRequestDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const MATERIAL_PRICE = "2000/=";
  const WHATSAPP_NUMBER = "255756377013";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Format WhatsApp message
      const message = encodeURIComponent(
        `🎓 *PREMIUM MATERIAL REQUEST*\n\n` +
        `📚 Material: ${materialTitle}\n` +
        `💰 Price: ${MATERIAL_PRICE}\n\n` +
        `👤 Name: ${name}\n` +
        `📧 Email: ${email}\n` +
        `📱 Phone: ${phone}\n\n` +
        `Please send payment details and access code.`
      );

      // Open WhatsApp
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "Request Sent!",
        description: "Your payment request has been sent via WhatsApp. You'll receive an access code after payment.",
      });

      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      onOpenChange(false);

      // Show message about entering code
      setTimeout(() => {
        toast({
          title: "Next Step",
          description: "After payment, click 'Enter Access Code' to unlock the material.",
        });
      }, 2000);

    } catch (error: any) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Request Premium Access
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-sm font-medium mb-2">📚 {materialTitle}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{MATERIAL_PRICE}</span>
              <span className="text-sm text-muted-foreground">per material</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., 0700123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <p className="font-medium">📝 What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
              <li>Your request will be sent via WhatsApp</li>
              <li>Complete payment as instructed</li>
              <li>Receive your unique access code</li>
              <li>Enter the code to unlock the material</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Sending..." : "Send Request"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCodeEntry}
              className="flex-1"
            >
              I Have a Code
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}