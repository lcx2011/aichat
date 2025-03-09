export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  date: string;
  messages: Message[];
};

export type CustomModel = {
  id: string;
  name: string;
  value: string;
};

export type Settings = {
  apiUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  customModels: CustomModel[];
};

export type ApiConfig = {
  id: string;
  name: string;
  settings: Settings;
}; 