import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { Test, VocabItem, VocabList, IUser, ITest } from '../models';
import { testSchema } from '../utils/validation';
import { withValidation } from '../utils/validationMiddleware';

// Type with _id field made explicit for TypeScript
type ITestWithId = ITest & { _id: mongoose.Types.ObjectId };

export const testResolvers = {
  Query: {
    getTests: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const tests = await Test.find();
        return tests;
      } catch (error) {
        throw new GraphQLError('Error fetching tests', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getTestById: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const test = await Test.findById(id);
        
        if (!test) {
          throw new GraphQLError('Test not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        return test;
      } catch (error) {
        throw new GraphQLError('Error fetching test', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getTestsByCreator: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const tests = await Test.find({ creator: context.user._id });
        return tests;
      } catch (error) {
        throw new GraphQLError('Error fetching tests', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getAvailableTests: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Get all published tests or tests created by the current user
        const tests = await Test.find({
          $or: [
            { isPublished: true }, 
            { creator: context.user._id }
          ]
        });
        
        return tests;
      } catch (error) {
        throw new GraphQLError('Error fetching available tests', {
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
    createTest: withValidation(testSchema)(
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
          // Check if vocabList exists if provided
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
            
            // If no vocabItems provided, use the ones from vocabList
            if (!input.questions || input.questions.length === 0) {
              // Get vocab items from the list
              const vocabItems = await VocabItem.find({
                _id: { $in: vocabList.itemIds }
              });
              
              // Generate questions from vocab items
              input.questions = vocabItems.map(item => ({
                type: 'MultipleChoice',
                text: `What is the correct definition of "${item.term}"?`,
                options: [
                  item.definitionEn,
                  // You would typically generate wrong options here
                  // For simplicity, we'll just use placeholder text
                  'Wrong option 1',
                  'Wrong option 2',
                  'Wrong option 3',
                ],
                correctAnswer: 0, // Index of correct option
                vocabItemId: item._id,
              }));
            }
          }
          
          // Ensure questions are provided
          if (!input.questions || input.questions.length === 0) {
            throw new GraphQLError('Test must have at least one question', {
              extensions: {
                code: 'BAD_USER_INPUT',
                http: { status: 400 },
              },
            });
          }
          
          // Create new test
          const test = await Test.create({
            ...input,
            creator: context.user._id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          return test;
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          throw new GraphQLError('Error creating test', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    updateTest: withValidation(testSchema.partial())(
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
          // Find test by ID
          const test = await Test.findById(id) as ITestWithId | null;
          
          if (!test) {
            throw new GraphQLError('Test not found', {
              extensions: {
                code: 'NOT_FOUND',
                http: { status: 404 },
              },
            });
          }
          
          // Check if user is the creator
          if (test.creator.toString() !== context.user._id.toString()) {
            throw new GraphQLError('Not authorized to update this test', {
              extensions: {
                code: 'FORBIDDEN',
                http: { status: 403 },
              },
            });
          }
          
          // Update the test
          const updatedTest = await Test.findByIdAndUpdate(
            id,
            { 
              ...input,
              updatedAt: new Date(),
            },
            { new: true }
          );
          
          return updatedTest;
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          throw new GraphQLError('Error updating test', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    deleteTest: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Find test by ID
        const test = await Test.findById(id) as ITestWithId | null;
        
        if (!test) {
          throw new GraphQLError('Test not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the creator
        if (test.creator.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to delete this test', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Delete test
        await Test.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error deleting test', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    publishTest: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        // Find test by ID
        const test = await Test.findById(id) as ITestWithId | null;
        
        if (!test) {
          throw new GraphQLError('Test not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is the creator
        if (test.creator.toString() !== context.user._id.toString()) {
          throw new GraphQLError('Not authorized to publish this test', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Check if test has questions
        if (!test.questions || test.questions.length === 0) {
          throw new GraphQLError('Cannot publish a test with no questions', {
            extensions: {
              code: 'BAD_USER_INPUT',
              http: { status: 400 },
            },
          });
        }
        
        // Publish test
        const updatedTest = await Test.findByIdAndUpdate(
          id,
          { 
            isPublished: true,
            updatedAt: new Date(),
          },
          { new: true }
        );
        
        return updatedTest;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error publishing test', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  Test: {
    id: (parent: ITestWithId) => parent._id.toString(),
    
    // Resolver for creator field
    creator: async (parent: ITestWithId) => {
      try {
        return await mongoose.model('User').findById(parent.creator);
      } catch (error) {
        console.error('Error resolving Test creator:', error);
        return null;
      }
    },
    
    // If your Test model has a vocabList field, use this resolver
    // Otherwise, this might be part of why you're getting an error
    vocabList: async (parent: ITestWithId) => {
      // Check if this test is associated with a vocabList
      // This depends on your data model - if tests aren't associated with lists
      // then this resolver shouldn't exist
      try {
        // Assuming your Test model has a vocabListId field
        // You might need to add this field to your Test interface and schema
        if (!parent.vocabListId) return null;
        
        const VocabList = mongoose.model('VocabList');
        return await VocabList.findById(parent.vocabListId);
      } catch (error) {
        console.error('Error resolving Test vocabList:', error);
        return null;
      }
    },
  },
  
  // Type resolver for the Question interface
  Question: {
    __resolveType(obj: any) {
      if (obj.type === 'MultipleChoice') {
        return 'MultipleChoiceQuestion';
      } else if (obj.type === 'TrueFalse') {
        return 'TrueFalseQuestion';
      } else if (obj.type === 'FillInBlank') {
        return 'FillInBlankQuestion';
      } else if (obj.type === 'Matching') {
        return 'MatchingQuestion';
      }
      return null; // GraphQLError is thrown
    },
  },
}; 