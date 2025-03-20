import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { User, IUser } from '../models';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';
import { userLoginSchema, userRegistrationSchema, userUpdateSchema } from '../utils/validation';
import { validateInput } from '../utils/validationMiddleware';

// Define a type that includes _id
interface IUserDocument extends IUser {
  _id: mongoose.Types.ObjectId;
}

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: { user: IUserDocument | null }) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      // Return the current user from context
      return context.user;
    },
    
    getUserById: async (_: any, { id }: { id: string }, context: { user: IUserDocument | null }) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      // Find user by ID
      try {
        const user = await User.findById(id);
        
        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        return user;
      } catch (error) {
        throw new GraphQLError('Error fetching user', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  Mutation: {
    register: async (_: any, { input }: { input: any }) => {
      // Validate input using Zod schema
      const validatedInput = validateInput(userRegistrationSchema, input);
      
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [{ email: validatedInput.email }, { username: validatedInput.username }] 
        });
        
        if (existingUser) {
          throw new GraphQLError('User already exists with that email or username', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(validatedInput.password);
        
        // Create new user
        const user = await User.create({
          username: validatedInput.username,
          email: validatedInput.email,
          password: hashedPassword,
          nativeLanguage: validatedInput.nativeLanguage,
          preferences: validatedInput.preferences,
        }) as IUserDocument;
        
        // Generate JWT token
        const token = generateToken(user._id.toString());
        
        return {
          token,
          user,
        };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error creating user', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    login: async (_: any, { input }: { input: any }) => {
      // Validate input using Zod schema
      const validatedInput = validateInput(userLoginSchema, input);
      
      try {
        // Find user by email
        const user = await User.findOne({ email: validatedInput.email }) as IUserDocument | null;
        
        if (!user) {
          throw new GraphQLError('Invalid email or password', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Check password
        const isMatch = await comparePassword(validatedInput.password, user.password);
        
        if (!isMatch) {
          throw new GraphQLError('Invalid email or password', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Generate JWT token
        const token = generateToken(user._id.toString());
        
        return {
          token,
          user,
        };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error logging in', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    updateUser: async (_: any, { input }: { input: any }, context: { user: IUserDocument | null }) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      // Validate input using Zod schema
      const validatedInput = validateInput(userUpdateSchema, input);
      
      try {
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $set: validatedInput },
          { new: true }
        );
        
        if (!updatedUser) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        return updatedUser;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error updating user', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  User: {
    // Field resolvers for User type
    id: (parent: IUserDocument) => parent._id.toString(),
  },
}; 