declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PUBLIC_URL: string;
      NODE_ENV: 'test' | 'production';
    }
  }
}

export {};
