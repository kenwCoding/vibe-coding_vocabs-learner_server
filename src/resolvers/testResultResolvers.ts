import { GraphQLError } from 'graphql';
import mongoose from 'mongoose';
import { TestResult, Test, IUser, ITestResult } from '../models';
import { testResultSchema } from '../utils/validation';
import { withValidation } from '../utils/validationMiddleware';

// Type with _id field made explicit for TypeScript
type ITestResultWithId = ITestResult & { _id: mongoose.Types.ObjectId };

export const testResultResolvers = {
  Query: {
    getTestResults: async (_: any, __: any, context: { user: IUser & { _id: mongoose.Types.ObjectId } | null }) => {
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
        const testResults = await TestResult.find({ user: context.user._id });
        return testResults;
      } catch (error) {
        throw new GraphQLError('Error fetching test results', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getTestResultById: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId; isAdmin?: boolean } | null }) => {
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
        const testResult = await TestResult.findById(id);
        
        if (!testResult) {
          throw new GraphQLError('Test result not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is authorized to see this result
        if (testResult.user.toString() !== context.user._id.toString() && !(context.user.isAdmin === true)) {
          throw new GraphQLError('Not authorized to view this test result', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        return testResult;
      } catch (error) {
        throw new GraphQLError('Error fetching test result', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
    
    getTestResultsByTest: async (_: any, { testId }: { testId: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId; isAdmin?: boolean } | null }) => {
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
        // Check if user is authorized to see all results for this test (test creator or admin)
        const test = await Test.findById(testId);
        
        if (!test) {
          throw new GraphQLError('Test not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        const isTestCreator = test.creator.toString() === context.user._id.toString();
        
        // If not the test creator or admin, only return the user's own results
        if (!isTestCreator && !(context.user.isAdmin === true)) {
          const userResults = await TestResult.find({ 
            test: testId,
            user: context.user._id 
          });
          return userResults;
        }
        
        // Otherwise, return all results for this test
        const testResults = await TestResult.find({ test: testId });
        return testResults;
      } catch (error) {
        throw new GraphQLError('Error fetching test results', {
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
    submitTestResult: withValidation(testResultSchema)(
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
          // Check if test exists
          const test = await Test.findById(input.testId);
          
          if (!test) {
            throw new GraphQLError('Test not found', {
              extensions: {
                code: 'BAD_USER_INPUT',
                http: { status: 400 },
              },
            });
          }
          
          // Calculate score based on answers
          let totalQuestions = test.questions.length;
          let correctAnswers = 0;
          
          input.answers.forEach((answer: any, index: number) => {
            if (index < test.questions.length) {
              const question = test.questions[index];
              
              // Check if answer is correct based on question type
              if ((question.type === 'multipleChoice' || question.type === 'matching') && 
                  answer.selectedOption === question.correctOptionIndex) {
                correctAnswers++;
              } else if (question.type === 'fillInBlanks' && 
                         answer.text.toLowerCase() === question.correctAnswer.toLowerCase()) {
                correctAnswers++;
              }
            }
          });
          
          const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
          
          // Create new test result
          const testResult = await TestResult.create({
            test: input.testId,
            user: context.user._id,
            score,
            answers: input.answers,
            completedAt: new Date(),
          });
          
          return testResult;
        } catch (error) {
          if (error instanceof GraphQLError) {
            throw error;
          }
          
          throw new GraphQLError('Error submitting test result', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              http: { status: 500 },
              error,
            },
          });
        }
      }
    ),
    
    deleteTestResult: async (_: any, { id }: { id: string }, context: { user: IUser & { _id: mongoose.Types.ObjectId; isAdmin?: boolean } | null }) => {
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
        // Find test result
        const testResult = await TestResult.findById(id) as ITestResultWithId | null;
        
        if (!testResult) {
          throw new GraphQLError('Test result not found', {
            extensions: {
              code: 'NOT_FOUND',
              http: { status: 404 },
            },
          });
        }
        
        // Check if user is authorized to delete this result (owner or admin)
        if (testResult.user.toString() !== context.user._id.toString() && !(context.user.isAdmin === true)) {
          throw new GraphQLError('Not authorized to delete this test result', {
            extensions: {
              code: 'FORBIDDEN',
              http: { status: 403 },
            },
          });
        }
        
        // Delete test result
        await TestResult.findByIdAndDelete(id);
        
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Error deleting test result', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            http: { status: 500 },
            error,
          },
        });
      }
    },
  },
  
  TestResult: {
    id: (parent: ITestResultWithId) => parent._id.toString(),
    
    // Resolver for user field
    user: async (parent: ITestResultWithId) => {
      try {
        return await mongoose.model('User').findById(parent.user);
      } catch (error) {
        console.error('Error resolving TestResult user:', error);
        return null;
      }
    },
    
    // Resolver for test field
    test: async (parent: ITestResultWithId) => {
      try {
        return await Test.findById(parent.test);
      } catch (error) {
        console.error('Error resolving TestResult test:', error);
        return null;
      }
    },
  },
}; 