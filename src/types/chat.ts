export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string; // Optional audio URL from n8n TTS
}

export interface N8nResponse {
  transcription?: string;
  text?: string;
  response?: string;
  message?: string;
  audioUrl?: string;
  audio_url?: string;
  audio?: string; // Base64 encoded audio data
  audioData?: string; // Alternative field for audio data
  [key: string]: any;
}
