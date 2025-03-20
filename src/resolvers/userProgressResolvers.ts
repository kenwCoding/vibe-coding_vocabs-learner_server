import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { UserProgress, VocabItem, IUser, IUserProgress } from '../models';
import { userProgressSchema } from '../utils/validation';
import { withValidation } from '../utils/validationMiddleware';

// Type with _id field made explicit for TypeScript
type IUserProgressWithId = IUserProgress & { _id: mongoose.Types.ObjectId };

// Add the interface definition at the top of the file
// This should match the interface from UserProgress.ts
interface VocabItemProgress {
  vocabItemId: mongoose.Types.ObjectId;
  masteryLevel: number; // 0-100 percent
  correctAttempts: number;
  incorrectAttempts: number;
  lastReviewedAt?: Date;
  nextReviewDue?: Date; // For spaced repetition
}

interface UserStats {
  totalItemsStudied: number;
  totalCorrectAttempts: number;
  totalIncorrectAttempts: number;
  averageMastery: number;
  streakDays: number;
  lastStudyDate?: Date;
  studyTimeMinutes: number;
  completedTests: number;
  averageTestScore: number;
}

export const userProgressResolvers = {
  Query: {
    getUserProgress: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const userProgress = await UserProgress.findOne({ user: context.user._id });
        
        if (!userProgress) {
          // Create new progress record if none exists
          return await UserProgress.create({
            user: context.user._id,
            itemProgress: [],
            stats: {
              totalItemsStudied: 0,
              totalCorrectAttempts: 0,
              totalIncorrectAttempts: 0,
              averageMastery: 0,
              streakDays: 0,
              studyTimeMinutes: 0,
              completedTests: 0,
              averageTestScore: 0
            },
            achievements: [],
            lastUpdated: new Date()
          });
        }
        
        return userProgress;
      } catch (error) {
        throw new GraphQLError('Error fetching user progress', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getItemProgress: async (_: any, { vocabItemId }: { vocabItemId: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Check if vocabItem exists
        const vocabItem = await VocabItem.findById(vocabItemId);
        
        if (!vocabItem) {
          throw new GraphQLError('Vocabulary item not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Get user progress
        const userProgress = await UserProgress.findOne({ user: context.user._id });
        
        if (!userProgress) {
          return {
            vocabItemId,
            masteryLevel: 0,
            correctAttempts: 0,
            incorrectAttempts: 0,
            lastReviewedAt: null,
            nextReviewDue: new Date()
          };
        }
        
        // Find progress for specific item
        const itemProgress = userProgress.itemProgress.find(
          (progress) => progress.vocabItemId.toString() === vocabItemId
        );
        
        if (!itemProgress) {
          return {
            vocabItemId,
            masteryLevel: 0,
            correctAttempts: 0,
            incorrectAttempts: 0,
            lastReviewedAt: null,
            nextReviewDue: new Date()
          };
        }
        
        return itemProgress;
      } catch (error) {
        throw new GraphQLError('Error fetching item progress', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getUserStats: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const userProgress = await UserProgress.findOne({ user: context.user._id });
        
        if (!userProgress) {
          return {
            totalItemsStudied: 0,
            totalCorrectAttempts: 0,
            totalIncorrectAttempts: 0,
            averageMastery: 0,
            streakDays: 0,
            lastStudyDate: null,
            studyTimeMinutes: 0,
            completedTests: 0,
            averageTestScore: 0
          };
        }
        
        return userProgress.stats;
      } catch (error) {
        throw new GraphQLError('Error fetching user stats', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getUserMasteryStats: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const userProgress = await UserProgress.findOne({ user: context.user._id });
        
        if (!userProgress) {
          return {
            masteredItemsCount: 0,
            averageMastery: 0,
            totalStudyTime: 0,
            sessionsCompleted: 0,
            averageTestScore: 0,
          };
        }
        
        // Calculate mastery statistics
        const masteredItems = userProgress.itemProgress.filter(
          (item) => item.masteryLevel >= 90
        );
        
        const totalItems = userProgress.itemProgress.length;
        
        const totalMastery = userProgress.itemProgress.reduce(
          (sum, item) => sum + item.masteryLevel,
          0
        );
        
        const averageMasteryPercentage = totalItems > 0 ? totalMastery / totalItems : 0;
        
        return {
          masteredItemsCount: masteredItems.length,
          averageMastery: averageMasteryPercentage,
          totalStudyTime: userProgress.stats.studyTimeMinutes,
          sessionsCompleted: userProgress.stats.completedTests,
          averageTestScore: userProgress.stats.averageTestScore,
        };
      } catch (error) {
        throw new GraphQLError('Error fetching user mastery stats', {
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
    updateItemProgress: async (_: any, { vocabItemId, correct }: { vocabItemId: string; correct: boolean }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Check if vocabItem exists
        const vocabItem = await VocabItem.findById(vocabItemId);
        
        if (!vocabItem) {
          throw new GraphQLError('Vocabulary item not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Use the static method to update progress
        const userProgress = await UserProgress.updateItemProgress(
          context.user._id,
          new mongoose.Types.ObjectId(vocabItemId),
          correct
        );
        
        return userProgress;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error updating item progress', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    updateTotalStudyTime: async (
      _: any, 
      { minutes }: { minutes: number }, 
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
        // Get user progress or create if not exists
        let userProgress = await UserProgress.findOne({ user: context.user._id });
        
        if (!userProgress) {
          userProgress = await UserProgress.create({
            user: context.user._id,
            itemProgress: [],
            stats: {
              totalItemsStudied: 0,
              totalCorrectAttempts: 0,
              totalIncorrectAttempts: 0,
              averageMastery: 0,
              streakDays: 0,
              studyTimeMinutes: minutes,
              completedTests: 1,
              averageTestScore: 0
            },
            achievements: [],
            lastUpdated: new Date()
          });
        } else {
          // Update study time and session count
          userProgress.stats.studyTimeMinutes += minutes;
          userProgress.stats.completedTests += 1;
          userProgress.lastUpdated = new Date();
          
          await userProgress.save();
        }
        
        return userProgress;
      } catch (error) {
        throw new GraphQLError('Error updating study time', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    resetUserProgress: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Reset user progress
        await UserProgress.updateOne(
          { user: context.user._id },
          {
            itemProgress: [],
            stats: {
              totalItemsStudied: 0,
              totalCorrectAttempts: 0,
              totalIncorrectAttempts: 0,
              averageMastery: 0,
              streakDays: 0,
              studyTimeMinutes: 0,
              completedTests: 0,
              averageTestScore: 0
            },
            achievements: [],
            lastUpdated: new Date()
          },
          { upsert: true }
        );
        
        const resetProgress = await UserProgress.findOne({ user: context.user._id });
        return resetProgress;
      } catch (error) {
        throw new GraphQLError('Error resetting user progress', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    updateVocabItemProgress: async (_: any, { vocabItemId, masteryLevel }: { vocabItemId: string; masteryLevel: number }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Check if vocabItem exists
        const vocabItem = await VocabItem.findById(vocabItemId);
        
        if (!vocabItem) {
          throw new GraphQLError('Vocabulary item not found', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Get user progress or create if not exists
        let userProgress = await UserProgress.findOne({ user: context.user._id });
        
        if (!userProgress) {
          userProgress = await UserProgress.create({
            user: context.user._id,
            itemProgress: [],
            stats: {
              totalItemsStudied: 0,
              totalCorrectAttempts: 0,
              totalIncorrectAttempts: 0,
              averageMastery: 0,
              streakDays: 0,
              studyTimeMinutes: 0,
              completedTests: 0,
              averageTestScore: 0
            },
            achievements: [],
            lastUpdated: new Date()
          });
        }
        
        // Find if item already has progress
        const itemIndex = userProgress.itemProgress.findIndex(
          (progress) => progress.vocabItemId.toString() === vocabItemId
        );
        
        // Update the item's progress
        if (itemIndex !== -1) {
          userProgress.itemProgress[itemIndex] = {
            ...userProgress.itemProgress[itemIndex],
            masteryLevel: masteryLevel,
            correctAttempts: userProgress.itemProgress[itemIndex].correctAttempts + 1,
            lastReviewedAt: new Date()
          };
        } else {
          // Add new item progress
          userProgress.itemProgress.push({
            vocabItemId: new mongoose.Types.ObjectId(vocabItemId),
            masteryLevel: masteryLevel,
            correctAttempts: 1,
            incorrectAttempts: 0,
            lastReviewedAt: new Date()
          });
        }
        
        // Update user progress timestamps
        userProgress.lastUpdated = new Date();
        
        // Save changes
        await userProgress.save();
        
        // Return updated progress for the specific item
        return userProgress.itemProgress.find(
          (progress) => progress.vocabItemId.toString() === vocabItemId
        );
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error updating item progress', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    logStudySession: async (_: any, { minutes, vocabListId }: { minutes: number; vocabListId: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Get user progress or create if not exists
        let userProgress = await UserProgress.findOne({ user: context.user._id });
        
        if (!userProgress) {
          userProgress = await UserProgress.create({
            user: context.user._id,
            itemProgress: [],
            stats: {
              totalItemsStudied: 0,
              totalCorrectAttempts: 0,
              totalIncorrectAttempts: 0,
              averageMastery: 0,
              streakDays: 0,
              studyTimeMinutes: minutes,
              completedTests: 1,
              averageTestScore: 0
            },
            achievements: [],
            lastUpdated: new Date()
          });
        } else {
          // Update study time and session count
          userProgress.stats.studyTimeMinutes += minutes;
          userProgress.stats.completedTests += 1;
          userProgress.lastUpdated = new Date();
          
          // Save changes
          await userProgress.save();
        }
        
        return userProgress;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error logging study session', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  UserProgress: {
    id: (parent: IUserProgressWithId) => parent._id.toString(),
    
    // Resolver for user field
    user: async (parent: IUserProgressWithId) => {
      try {
        return await mongoose.model('User').findById(parent.user);
      } catch (error) {
        console.error('Error resolving UserProgress user:', error);
        return null;
      }
    },
  },
  
  ItemProgress: {
    // Resolver for vocabItem field
    vocabItem: async (parent: any) => {
      try {
        return await VocabItem.findById(parent.vocabItemId);
      } catch (error) {
        console.error('Error resolving ItemProgress vocabItem:', error);
        return null;
      }
    },
  },
}; 