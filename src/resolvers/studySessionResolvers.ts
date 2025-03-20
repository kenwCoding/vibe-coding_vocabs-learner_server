import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { StudySession, VocabList, IUser, IStudySession } from '../models';
import { studySessionSchema } from '../utils/validation';
import { withValidation } from '../utils/validationMiddleware';

// Type with _id field made explicit for TypeScript
type IStudySessionWithId = IStudySession & { _id: mongoose.Types.ObjectId };

export const studySessionResolvers = {
  Query: {
    getStudySessions: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      try {
        const sessions = await StudySession.find({ user: context.user._id })
          .sort({ startedAt: -1 });
        return sessions;
      } catch (error) {
        throw new GraphQLError('Error fetching study sessions', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getStudySessionById: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      try {
        const session = await StudySession.findById(id);
        
        if (!session) {
          throw new GraphQLError('Study session not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is authorized to see this session
        if (session.user.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to view this study session', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        return session;
      } catch (error) {
        throw new GraphQLError('Error fetching study session', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getSessionsByVocabList: async (_: any, { vocabListId }: { vocabListId: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      try {
        // Check if vocabList exists
        const vocabList = await VocabList.findById(vocabListId);
        
        if (!vocabList) {
          throw new GraphQLError('Vocabulary list not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Get user's sessions for this vocab list
        const sessions = await StudySession.find({
          user: context.user._id,
          vocabList: vocabListId,
        }).sort({ startedAt: -1 });
        
        return sessions;
      } catch (error) {
        throw new GraphQLError('Error fetching study sessions', {
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
    startStudySession: withValidation(studySessionSchema)(
      async (_: any, { input }: { input: any }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
        // Check if user is authenticated
        if (!context.user) {
          throw new GraphQLError('Not authenticated', {
            extensions: {
              code: 'UNAUTHENTICATED',
              http: { status: 401 },
            },
          });
        }
        
        try {
          // Check if vocabList exists
          if (input.vocabListId) {
            const vocabList = await VocabList.findById(input.vocabListId);
            
            if (!vocabList) {
              throw new GraphQLError('Vocabulary list not found', {
                extensions: {
                  code: 'BAD_USER_INPUT',
                  http: { status: 400 },
                },
              });
            }
          }
          
          // Create new study session
          const studySession = await StudySession.create({
            user: context.user._id,
            vocabList: input.vocabListId,
            mode: input.mode,
            settings: input.settings || {},
            startedAt: new Date(),
            status: 'in_progress',
          });
          
          return studySession;
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          throw new GraphQLError('Error starting study session', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    completeStudySession: async (
      _: any, 
      { 
        id, 
        duration, 
        itemsStudied, 
        correctAnswers 
      }: { 
        id: string; 
        duration: number; 
        itemsStudied: number; 
        correctAnswers: number;
      }, 
      context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }
    ) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      try {
        // Find study session by ID
        const session = await StudySession.findById(id) as IStudySessionWithId | null;
        
        if (!session) {
          throw new GraphQLError('Study session not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the owner of this session
        if (session.user.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to complete this study session', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Check if session is already completed
        if (session.status === 'completed') {
          throw new GraphQLError('Study session is already completed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Update session with completion info
        const updatedSession = await StudySession.findByIdAndUpdate(
          id,
          {
            status: 'completed',
            duration,
            itemsStudied,
            correctAnswers,
            accuracy: itemsStudied > 0 ? (correctAnswers / itemsStudied) * 100 : 0,
            completedAt: new Date(),
          },
          { new: true }
        );
        
        return updatedSession;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error completing study session', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    deleteStudySession: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }
      
      try {
        // Find study session by ID
        const session = await StudySession.findById(id) as IStudySessionWithId | null;
        
        if (!session) {
          throw new GraphQLError('Study session not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the owner of this session
        if (session.user.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to delete this study session', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Delete study session
        await StudySession.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error deleting study session', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  StudySession: {
    id: (parent: IStudySessionWithId) => parent._id.toString(),
    
    // Resolver for user field
    user: async (parent: IStudySessionWithId) => {
      try {
        return await mongoose.model('User').findById(parent.user);
      } catch (error) {
        console.error('Error resolving StudySession user:', error);
        return null;
      }
    },
    
    // Resolver for vocabLists field
    vocabLists: async (parent: IStudySessionWithId) => {
      try {
        if (!parent.vocabListIds || parent.vocabListIds.length === 0) return [];
        
        return await VocabList.find({
          _id: { $in: parent.vocabListIds }
        });
      } catch (error) {
        console.error('Error resolving StudySession vocabLists:', error);
        return [];
      }
    },
  },
}; 