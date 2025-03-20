// Type declarations for resolver modules
declare module './userResolvers' {
  export const userResolvers: any;
}

declare module './vocabItemResolvers' {
  export const vocabItemResolvers: any;
}

declare module './vocabListResolvers' {
  export const vocabListResolvers: any;
}

declare module './testResolvers' {
  export const testResolvers: any;
}

declare module './testResultResolvers' {
  export const testResultResolvers: any;
}

declare module './studySessionResolvers' {
  export const studySessionResolvers: any;
}

declare module './userProgressResolvers' {
  export const userProgressResolvers: any;
}

// Additional module declarations for imports in src/index.ts
declare module '../schema' {
  export const typeDefs: any;
}

declare module '../resolvers' {
  export const resolvers: any;
}

declare module '../config/db' {
  export function connectDB(): Promise<void>;
}

declare module '../utils/auth' {
  export function getUserFromToken(token: string): Promise<any>;
  export function generateToken(id: string): string;
  export function hashPassword(password: string): Promise<string>;
  export function comparePassword(enteredPassword: string, storedPassword: string): Promise<boolean>;
} 