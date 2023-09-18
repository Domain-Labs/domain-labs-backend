export interface Clio {
  token: string;
  messages: [
    {
      role: 'user' | 'assistant' | 'function' | 'system';
      content: string;
    },
  ];
  updated: Date;
}
