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

  const sendAudioToN8n = async (audioBlob: Blob): Promise<{ transcription: string; response: string; audioUrl?: string }> => {
    if (!webhookUrl) {
      throw new Error('URL du webhook n8n non configurée');
    }

    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      console.log('Sending audio to n8n, size:', audioBlob.size);

      // Send audio to n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          audioType: audioBlob.type,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur n8n: ${response.status}`);
      }

      const data: N8nResponse = await response.json();
      
      // Handle binary audio data (base64) from n8n TTS node
      let audioUrl: string | undefined;
      if (data.audio || data.audioData) {
        const audioBase64 = data.audio || data.audioData;
        // Convert base64 to blob and create object URL
        const binaryString = atob(audioBase64!);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        audioUrl = URL.createObjectURL(audioBlob);
      } else if (data.audioUrl || data.audio_url) {
        // Fallback to URL if provided
        audioUrl = data.audioUrl || data.audio_url;
      }
      
      return {
        transcription: data.transcription || data.text || 'Transcription reçue',
        response: data.response || data.message || 'Réponse reçue',
        audioUrl,
      };
    } catch (error) {
      console.error('Error sending to n8n:', error);
      throw error;
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Send audio directly to n8n (which will handle Whisper + processing + TTS)
      const { transcription, response, audioUrl } = await sendAudioToN8n(audioBlob);
      
      // Add user message (transcription from n8n)
      const userMessage: Message = {
        id: Date.now().toString(),
        content: transcription,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Add assistant message (response from n8n)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        audioUrl, // Store audio URL if n8n returns TTS audio
      };
      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Message traité",
        description: "Transcription et réponse reçues de n8n",
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

  const handlePlayAudio = async (message: Message) => {
    if (message.audioUrl) {
      // Play audio from n8n TTS
      const audio = new Audio(message.audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Erreur audio",
          description: "Impossible de lire l'audio",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Audio non disponible",
        description: "Votre workflow n8n doit renvoyer un URL audio",
      });
    }
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
            onPlayAudio={!message.isUser ? () => handlePlayAudio(message) : undefined}
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
