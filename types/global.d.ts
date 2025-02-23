declare module 'connect-pg-simple';
declare module '@neondatabase/serverless';

interface IStorage {
  // User operations
  getUser(id: number): Promise<import('@shared/schema').User | undefined>;
  getUserByUsername(username: string): Promise<import('@shared/schema').User | undefined>;
  createUser(user: import('@shared/schema').InsertUser): Promise<import('@shared/schema').User>;
  
  // Add other storage interface methods as needed
  // This ensures type safety across the application
}

// Make the interface available globally
declare global {
  interface Window {
    ENV: {
      DATABASE_URL: string;
    }
  }
}

export {};
