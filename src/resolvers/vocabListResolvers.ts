import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { VocabList, VocabItem, IVocabList, IUser } from '../models';
import { vocabListSchema } from '../utils/validation';
import { withValidation } from '../utils/validationMiddleware';

// Type with _id field made explicit for TypeScript
type IVocabListWithId = IVocabList & { _id: mongoose.Types.ObjectId };

export const vocabListResolvers = {
  Query: {
    getVocabLists: async () => {
      try {
        const vocabLists = await VocabList.find();
        return vocabLists;
      } catch (error) {
        throw new GraphQLError('Error fetching vocabulary lists', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getVocabListById: async (_: any, { id }: { id: string }) => {
      try {
        const vocabList = await VocabList.findById(id);
        
        if (!vocabList) {
          throw new GraphQLError('Vocabulary list not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        return vocabList;
      } catch (error) {
        throw new GraphQLError('Error fetching vocabulary list', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getVocabListsByUser: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const vocabLists = await VocabList.find({
          creator: context.user._id,
        });
        
        return vocabLists;
      } catch (error) {
        throw new GraphQLError('Error fetching user vocabulary lists', {
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
    createVocabList: withValidation(vocabListSchema)(
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
          // Validate all item IDs exist if provided
          if (input.items && input.items.length > 0) {
            const itemCount = await VocabItem.countDocuments({
              _id: { $in: input.items.map((id: string) => new mongoose.Types.ObjectId(id)) }
            });
            
            if (itemCount !== input.items.length) {
              throw new GraphQLError('One or more vocabulary items do not exist', {
                extensions: {
                  code: 'BAD_USER_INPUT',
                  http: { status: 400 },
                },
              });
            }
          }
          
          // Create new vocab list
          const vocabList = await VocabList.create({
            ...input,
            itemIds: input.items || [],
            creator: context.user._id,
          });
          
          return vocabList;
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          throw new GraphQLError('Error creating vocabulary list', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    updateVocabList: withValidation(vocabListSchema.partial())(
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
          // Find vocab list by ID
          const vocabList = await VocabList.findById(id) as IVocabListWithId | null;
          
          if (!vocabList) {
            throw new GraphQLError('Vocabulary list not found', {
              extensions: {
                code: 'NOT_FOUND',
                http: { status: 404 },
              },
            });
          }
          
          // Check if user is the creator
          if (vocabList.creator.toString() !== context.user._id.toString()) {
            throw new GraphQLError('Not authorized to update this vocabulary list', {
              extensions: {
                code: 'FORBIDDEN',
                http: { status: 403 },
              },
            });
          }
          
          // Validate all item IDs exist if provided
          if (input.items && input.items.length > 0) {
            const itemCount = await VocabItem.countDocuments({
              _id: { $in: input.items.map((id: string) => new mongoose.Types.ObjectId(id)) }
            });
            
            if (itemCount !== input.items.length) {
              throw new GraphQLError('One or more vocabulary items do not exist', {
                extensions: {
                  code: 'BAD_USER_INPUT',
                  http: { status: 400 },
                },
              });
            }
          }
          
          // Update vocab list
          const updatedData: any = { ...input };
          if (input.items) {
            updatedData.itemIds = input.items;
            delete updatedData.items;
          }
          
          const updatedVocabList = await VocabList.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
          );
          
          return updatedVocabList;
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          throw new GraphQLError('Error updating vocabulary list', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    deleteVocabList: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Find vocab list by ID
        const vocabList = await VocabList.findById(id) as IVocabListWithId | null;
        
        if (!vocabList) {
          throw new GraphQLError('Vocabulary list not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the creator
        if (vocabList.creator.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to delete this vocabulary list', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Delete vocab list
        await VocabList.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error deleting vocabulary list', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    addItemToList: async (
      _: any,
      { listId, itemId }: { listId: string; itemId: string },
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
        // Check if vocab item exists
        const vocabItem = await VocabItem.findById(itemId);
        
        if (!vocabItem) {
          throw new GraphQLError('Vocabulary item not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Find vocab list by ID
        const vocabList = await VocabList.findById(listId) as IVocabListWithId | null;
        
        if (!vocabList) {
          throw new GraphQLError('Vocabulary list not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the creator
        if (vocabList.creator.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to update this vocabulary list', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Check if item already exists in the list
        if (vocabList.itemIds.some(id => id.toString() === itemId)) {
          throw new GraphQLError('Item already exists in the list', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Add item to list
        const updatedVocabList = await VocabList.findByIdAndUpdate(
          listId,
          { $addToSet: { itemIds: itemId } },
          { new: true }
        );
        
        return updatedVocabList;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error adding item to list', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    removeItemFromList: async (
      _: any,
      { listId, itemId }: { listId: string; itemId: string },
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
        // Find vocab list by ID
        const vocabList = await VocabList.findById(listId) as IVocabListWithId | null;
        
        if (!vocabList) {
          throw new GraphQLError('Vocabulary list not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the creator
        if (vocabList.creator.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to update this vocabulary list', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Check if item exists in the list
        if (!vocabList.itemIds.some(id => id.toString() === itemId)) {
          throw new GraphQLError('Item does not exist in the list', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Remove item from list
        const updatedVocabList = await VocabList.findByIdAndUpdate(
          listId,
          { $pull: { itemIds: itemId } },
          { new: true }
        );
        
        return updatedVocabList;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error removing item from list', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  VocabList: {
    id: (parent: IVocabListWithId) => parent._id.toString(),
    
    // Resolver for items field to populate VocabItems
    items: async (parent: IVocabListWithId) => {
      try {
        const items = await VocabItem.find({
          _id: { $in: parent.itemIds }
        });
        
        return items;
      } catch (error) {
        console.error('Error resolving VocabList items:', error);
        return [];
      }
    },
    
    // Resolver for creator field to populate User
    creator: async (parent: IVocabListWithId) => {
      if (parent.creator instanceof mongoose.Types.ObjectId) {
        try {
          return await mongoose.model('User').findById(parent.creator);
        } catch (error) {
          console.error('Error resolving VocabList creator:', error);
          return null;
        }
      }
      return parent.creator;
    },
  },
}; 