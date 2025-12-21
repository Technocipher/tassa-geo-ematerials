import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface Material {
  id: string;
  title: string;
  category: string;
  google_drive_link: string;
  upload_date: string;
  view_count: number;
  is_premium?: boolean;
}

interface MaterialDialogProps {
  material?: Material;
  onSuccess: () => void;
}

const categories = [
  'Lesson Notes',
  'Geography Books',
  'Exams',
  'Results',
  'Statistics'
];

export function MaterialDialog({ material, onSuccess }: MaterialDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [link, setLink] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [premiumCode, setPremiumCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!material;

  useEffect(() => {
    if (material) {
      setTitle(material.title);
      setCategory(material.category);
      setLink(material.google_drive_link);
      setIsPremium(material.is_premium || false);
      setPremiumCode('');
    } else {
      setTitle('');
      setCategory('');
      setLink('');
      setIsPremium(false);
      setPremiumCode('');
    }
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require premium code for NEW premium materials
    if (!isEdit && isPremium && !premiumCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a premium code for this material',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create or update material
      const { data: materialResult, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: isEdit ? 'update_material' : 'create_material',
          materialData: {
            title,
            category,
            google_drive_link: link,
            is_premium: isPremium,
          },
          materialId: material?.id
        }
      });

      if (error) throw error;
      if (materialResult?.error) throw new Error(materialResult.error);

      // If premium and code is provided, set the premium code
      if (isPremium && premiumCode.trim()) {
        const targetMaterialId = material?.id || materialResult?.material?.id;
        
        if (!targetMaterialId) {
          throw new Error('Failed to get material ID');
        }
        
        const { data: codeResult, error: codeError } = await supabase.functions.invoke('admin-auth', {
          body: {
            action: 'set_premium_code',
            materialId: targetMaterialId,
            premiumCode: premiumCode.trim()
          }
        });

        // Check for error in response body (400 status returns data, not error)
        if (codeError) throw codeError;
        if (codeResult?.error) {
          toast({
            title: 'Material saved',
            description: `But premium code failed: ${codeResult.error}`,
            variant: 'destructive',
          });
          setOpen(false);
          onSuccess();
          return;
        }
      }

      toast({
        title: `Material ${isEdit ? 'updated' : 'created'} successfully`,
        description: isPremium && premiumCode.trim() ? 'Premium code has been set' : undefined,
      });

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="sm" variant="ghost">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Material' : 'Add New Material'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="link">Google Drive Link</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              required
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <Label htmlFor="premium" className="cursor-pointer">Premium Material</Label>
                <p className="text-xs text-muted-foreground">Requires special code to access</p>
              </div>
            </div>
            <Switch
              id="premium"
              checked={isPremium}
              onCheckedChange={setIsPremium}
            />
          </div>

          {isPremium && (
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <Label htmlFor="code">
                {isEdit ? 'Add New Premium Code (Optional)' : 'Premium Access Code'}
              </Label>
              <Input
                id="code"
                type="text"
                value={premiumCode}
                onChange={(e) => setPremiumCode(e.target.value)}
                placeholder={isEdit ? "Leave empty to keep existing codes" : "Enter code for users to access this material"}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {isEdit 
                  ? 'Enter a new code to add it to this material. Use "Manage Codes" to view existing codes.'
                  : 'Users will need this code to unlock access to this premium material'
                }
              </p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : (isEdit ? 'Update Material' : 'Add Material')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}