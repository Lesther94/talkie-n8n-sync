import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  onPlayAudio?: () => void;
}

export const ChatMessage = ({ message, isUser, timestamp, onPlayAudio }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 transition-smooth",
        isUser 
          ? "bg-gradient-primary text-primary-foreground ml-auto" 
          : "bg-card border border-border"
      )}>
        <p className="text-sm leading-relaxed">{message}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-xs opacity-70">
            {timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && onPlayAudio && (
            <Button
              onClick={onPlayAudio}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent/20"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
