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
  [key: string]: any;
}
