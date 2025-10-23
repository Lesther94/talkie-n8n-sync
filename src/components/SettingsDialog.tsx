import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SettingsDialogProps {
  webhookUrl: string;
  onWebhookUrlChange: (url: string) => void;
}

export const SettingsDialog = ({ webhookUrl, onWebhookUrlChange }: SettingsDialogProps) => {
  const [tempUrl, setTempUrl] = useState(webhookUrl);

  const handleSave = () => {
    onWebhookUrlChange(tempUrl);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent/20">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Configuration n8n</DialogTitle>
          <DialogDescription>
            Configurez l'URL de votre webhook n8n pour connecter l'application à votre workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="webhook">URL du Webhook n8n</Label>
            <Input
              id="webhook"
              placeholder="https://votre-instance.n8n.io/webhook/..."
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <Button onClick={handleSave} className="w-full bg-gradient-primary hover:opacity-90">
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
