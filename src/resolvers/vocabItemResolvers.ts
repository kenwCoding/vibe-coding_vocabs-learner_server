import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { VocabItem, IVocabItem, IUser } from '../models';
import { vocabItemSchema } from '../utils/validation';
import { withValidation } from '../utils/validationMiddleware';

// Type with _id field made explicit for TypeScript
type IVocabItemWithId = IVocabItem & { _id: mongoose.Types.ObjectId };

// Type for VocabItem input
interface VocabItemInput {
  term: string;
  definitionEn: string;
  definitionZh: string;
  exampleSentence: string;
  partOfSpeech: string;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export const vocabItemResolvers = {
  Query: {
    getVocabItems: async () => {
      try {
        const vocabItems = await VocabItem.find();
        return vocabItems;
      } catch (error) {
        throw new GraphQLError('Error fetching vocabulary items', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getVocabItemById: async (_: any, { id }: { id: string }) => {
      try {
        const vocabItem = await VocabItem.findById(id);
        
        if (!vocabItem) {
          throw new GraphQLError('Vocabulary item not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        return vocabItem;
      } catch (error) {
        throw new GraphQLError('Error fetching vocabulary item', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    searchVocabItems: async (_: any, { query }: { query: string }) => {
      try {
        const vocabItems = await VocabItem.find({
          $or: [
            { term: { $regex: query, $options: 'i' } },
            { definitionEn: { $regex: query, $options: 'i' } },
            { definitionZh: { $regex: query, $options: 'i' } },
          ],
        });
        
        return vocabItems;
      } catch (error) {
        throw new GraphQLError('Error searching vocabulary items', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getVocabItemsByTags: async (_: any, { tags }: { tags: string[] }) => {
      try {
        const vocabItems = await VocabItem.find({
          tags: { $in: tags },
        });
        
        return vocabItems;
      } catch (error) {
        throw new GraphQLError('Error fetching vocabulary items by tags', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getVocabItemsByDifficulty: async (_: any, { difficulty }: { difficulty: number }) => {
      // Validate difficulty is between 1-5
      if (difficulty < 1 || difficulty > 5) {
        throw new GraphQLError('Difficulty must be between 1 and 5', {
          extensions: {
            code: 'BAD_USER_INPUT',
            http: { status: 400 },
          },
        });
      }
      
      try {
        const vocabItems = await VocabItem.find({
          difficultyRating: difficulty,
        });
        
        return vocabItems;
      } catch (error) {
        throw new GraphQLError('Error fetching vocabulary items by difficulty', {
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
    createVocabItem: withValidation(vocabItemSchema)(
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
          // Create new vocab item with validated input
          const vocabItem = await VocabItem.create({
            ...input,
            creator: context.user._id,
          });
          
          return vocabItem;
        } catch (error) {
          throw new GraphQLError('Error creating vocabulary item', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    updateVocabItem: withValidation(vocabItemSchema.partial())(
      async (_: any, { id, input }: { id: string; input: any }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
          // Find vocab item by ID
          const vocabItem = await VocabItem.findById(id) as IVocabItemWithId | null;
          
          if (!vocabItem) {
            throw new GraphQLError('Vocabulary item not found', {
              extensions: {
                code: 'NOT_FOUND',
                http: { status: 404 },
              },
            });
          }
          
          // Check if user is the creator
          if (vocabItem.creator.toString() !== context.user._id.toString()) {
            throw new GraphQLError('Not authorized to update this vocabulary item', {
              extensions: {
                code: 'FORBIDDEN',
                http: { status: 403 },
              },
            });
          }
          
          // Update vocab item with validated input
          const updatedVocabItem = await VocabItem.findByIdAndUpdate(
            id,
            { $set: input },
            { new: true }
          );
          
          return updatedVocabItem;
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          throw new GraphQLError('Error updating vocabulary item', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    deleteVocabItem: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Find vocab item by ID
        const vocabItem = await VocabItem.findById(id) as IVocabItemWithId | null;
        
        if (!vocabItem) {
          throw new GraphQLError('Vocabulary item not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the creator
        if (vocabItem.creator.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to delete this vocabulary item', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Delete vocab item
        await VocabItem.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error deleting vocabulary item', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  VocabItem: {
    id: (parent: IVocabItemWithId) => parent._id.toString(),
  },
}; 