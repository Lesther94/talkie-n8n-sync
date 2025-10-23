import { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ChatMessage } from '@/components/ChatMessage';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useToast } from '@/hooks/use-toast';
import type { Message, N8nResponse } from '@/types/chat';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('n8n_webhook_url') || ''
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('n8n_webhook_url', webhookUrl);
  }, [webhookUrl]);

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          // TODO: Replace with actual Lovable Cloud function when enabled
          // For now, simulating transcription
          console.log('Audio blob size:', audioBlob.size);
          resolve('Message vocal transcrit (simulation)');
          
          toast({
            title: "Info",
            description: "Activez Lovable Cloud pour la transcription réelle via Whisper",
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(audioBlob);
    });
  };

  const sendToN8n = async (text: string): Promise<string> => {
    if (!webhookUrl) {
      throw new Error('URL du webhook n8n non configurée');
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi à n8n');
      }

      const data: N8nResponse = await response.json();
      return data.response || data.message || data.text || 'Réponse reçue';
    } catch (error) {
      console.error('Error sending to n8n:', error);
      throw error;
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Step 1: Transcribe audio
      const transcribedText = await transcribeAudio(audioBlob);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: transcribedText,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Step 2: Send to n8n
      const response = await sendToN8n(transcribedText);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Message envoyé",
        description: "Réponse reçue de n8n",
      });
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = async (text: string) => {
    // TODO: Implement text-to-speech with Lovable Cloud
    toast({
      title: "Info",
      description: "Activez Lovable Cloud pour la synthèse vocale",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Chat Vocal n8n</h1>
            <p className="text-xs text-muted-foreground">
              {webhookUrl ? 'Connecté' : 'Non configuré'}
            </p>
          </div>
        </div>
        <SettingsDialog 
          webhookUrl={webhookUrl} 
          onWebhookUrlChange={setWebhookUrl} 
        />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Commencez une conversation</p>
            <p className="text-sm">Appuyez sur le bouton micro pour parler</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            onPlayAudio={!message.isUser ? () => handlePlayAudio(message.content) : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recorder */}
      <div className="px-6 py-6 border-t border-border bg-card">
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          isProcessing={isProcessing}
        />
        {isProcessing && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            Traitement en cours...
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
