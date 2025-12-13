import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2, FileText, BookOpen, ClipboardList, BarChart3, Trophy, Crown, Lock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PremiumCodeDialog } from "./PremiumCodeDialog";
import { ManageCodesDialog } from "./ManageCodesDialog";
import { PaymentRequestDialog } from "./PaymentRequestDialog";

interface Material {
  id: string;
  title: string;
  category: string;
  google_drive_link: string;
  upload_date: string;
  view_count: number;
  is_premium?: boolean;
}

interface MaterialCardProps {
  material: Material;
  isAdmin?: boolean;
  onEdit?: (material: Material) => void;
  onDelete?: (id: string) => void;
}

export function MaterialCard({ material, isAdmin, onEdit, onDelete }: MaterialCardProps) {
  const [viewCount, setViewCount] = useState(material.view_count);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  useEffect(() => {
    if (material.is_premium && !isAdmin) {
      checkPremiumAccess();
    }
  }, [material.id, material.is_premium, isAdmin]);

  const checkPremiumAccess = async () => {
    setCheckingAccess(true);
    try {
      const userId = localStorage.getItem('user_id') || crypto.randomUUID();
      if (!localStorage.getItem('user_id')) {
        localStorage.setItem('user_id', userId);
      }

      const { data } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'check_premium_access',
          materialId: material.id,
          userId
        }
      });

      setHasAccess(data?.hasAccess || false);
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const handleLinkClick = async () => {
    // Increment view count
    const { error } = await supabase
      .from('materials')
      .update({ view_count: viewCount + 1 })
      .eq('id', material.id);

    if (!error) {
      setViewCount(prev => prev + 1);
    }

    // Open link in new tab
    window.open(material.google_drive_link, '_blank');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lesson Notes': return FileText;
      case 'Geography Books': return BookOpen;
      case 'Exams': return ClipboardList;
      case 'Results': return Trophy;
      case 'Statistics': return BarChart3;
      default: return FileText;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Lesson Notes': 
        return {
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          iconBg: 'bg-blue-50 dark:bg-blue-950/50',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'Geography Books': 
        return {
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
          iconColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'Exams': 
        return {
          badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900',
          iconBg: 'bg-red-50 dark:bg-red-950/50',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'Results': 
        return {
          badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-900',
          iconBg: 'bg-purple-50 dark:bg-purple-950/50',
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'Statistics': 
        return {
          badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900',
          iconBg: 'bg-orange-50 dark:bg-orange-950/50',
          iconColor: 'text-orange-600 dark:text-orange-400'
        };
      default: 
        return {
          badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          iconBg: 'bg-gray-50 dark:bg-gray-800/50',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const CategoryIcon = getCategoryIcon(material.category);
  const styles = getCategoryStyles(material.category);

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] sm:hover:scale-[1.03] hover:-translate-y-1 sm:hover:-translate-y-2 animate-fade-in border border-primary/20 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-[gradient_3s_ease_infinite]" style={{ backgroundSize: '200% 200%' }} />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Tech grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Glowing orb effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardHeader className="pb-3 sm:pb-4 relative z-10 p-3 sm:p-4 md:p-6">
        {/* Tech accent line */}
        <div className="absolute top-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500" />
        
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl ${styles.iconBg} transition-all group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-lg`}>
            {/* Icon glow */}
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/50 to-accent/50 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-500" />
            <CategoryIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${styles.iconColor} relative z-10`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
              <CardTitle className="text-sm sm:text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-300 relative line-clamp-2">
                {material.title}
                {/* Underline effect */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500" />
              </CardTitle>
              {material.is_premium && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 shadow-md text-xs">
                  <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <Badge className={`${styles.badge} border font-medium shadow-sm hover:shadow-md transition-shadow text-xs`} variant="secondary">
              {material.category}
            </Badge>
          </div>
          {isAdmin && (
            <div className="flex gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(material)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(material.id)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10 space-y-2 p-3 sm:p-4 md:p-6 pt-0">
        {material.is_premium && !isAdmin && !hasAccess ? (
          <div className="space-y-2">
            <Button 
              onClick={() => setShowPaymentDialog(true)}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
              size="default"
            >
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Request Premium Access (2000/=)</span>
              <span className="sm:hidden">Premium (2000/=)</span>
            </Button>
            
            <Button
              onClick={() => setShowCodeDialog(true)}
              variant="outline"
              className="w-full text-xs sm:text-sm"
              size="default"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">I Have an Access Code</span>
              <span className="sm:hidden">Enter Code</span>
            </Button>

            <PaymentRequestDialog
              materialId={material.id}
              materialTitle={material.title}
              open={showPaymentDialog}
              onOpenChange={setShowPaymentDialog}
              onCodeEntry={() => {
                setShowPaymentDialog(false);
                setShowCodeDialog(true);
              }}
            />

            <PremiumCodeDialog
              materialId={material.id}
              materialTitle={material.title}
              open={showCodeDialog}
              onOpenChange={setShowCodeDialog}
              onSuccess={checkPremiumAccess}
            />
          </div>
        ) : (
          <Button
            onClick={handleLinkClick}
            className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
            variant="default"
            size="default"
            disabled={checkingAccess}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            
            <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2 font-semibold">
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
              {checkingAccess ? 'Checking...' : 'Access Material'}
            </span>
            
            {/* Corner decorations */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
        )}
        
        {isAdmin && material.is_premium && (
          <ManageCodesDialog 
            materialId={material.id}
            materialTitle={material.title}
          />
        )}
      </CardContent>
    </Card>
  );
}