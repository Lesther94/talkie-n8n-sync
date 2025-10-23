export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface N8nResponse {
  response?: string;
  message?: string;
  text?: string;
  [key: string]: any;
}
