import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { connectDB } from './config/db';
import { getUserFromToken } from './utils/auth';
import { IUser } from './models';

// Load environment variables
dotenv.config();

// Define interface with mongoose ObjectId
interface IUserDocument extends IUser {
  _id: mongoose.Types.ObjectId;
}

// Define the interface for the context
interface MyContext {
  user: IUserDocument | null;
}

async function startServer() {
  // Create Express app and HTTP server
  const app = express();
  const httpServer = http.createServer(app);

  // Connect to MongoDB
  await connectDB();

  // Add health check endpoint
  app.get('/health', (req, res) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    };
    
    try {
      res.status(200).json(healthcheck);
    } catch (error) {
      healthcheck.message = error instanceof Error ? error.message : 'Error occurred';
      res.status(503).json(healthcheck);
    }
  });

  // Create Apollo Server
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start Apollo Server
  await server.start();

  // Apply Express middleware
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    // Use ts-ignore to bypass the type error with expressMiddleware
    // @ts-ignore: Express middleware compatibility issue
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Get the user token from the headers
        const token = req.headers.authorization || '';
        
        // Try to retrieve a user with the token
        const user = await getUserFromToken(token) as IUserDocument | null;
        
        // Add the user to the context
        return { user };
      },
    }),
  );

  // Start the server
  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/health`);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
}); 