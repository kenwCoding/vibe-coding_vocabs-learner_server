import { GraphQLError } from 'graphql';
import { z } from 'zod';

/**
 * A utility function to validate GraphQL inputs against a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param input The input data to validate
 * @returns The validated and typed data
 * @throws GraphQLError with validation details if validation fails
 */
export const validateInput = <T extends z.ZodType>(schema: T, input: unknown): z.infer<T> => {
  try {
    // Parse and validate the input
    const validatedData = schema.parse(input);
    return validatedData;
  } catch (error) {
    // If it's a Zod error, format it for GraphQL
    if (error instanceof z.ZodError) {
      // Create a structured error object with field paths
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      throw new GraphQLError('Validation failed', {
        extensions: {
          code: 'BAD_USER_INPUT',
          http: { status: 400 },
          validationErrors: formattedErrors
        }
      });
    }
    
    // If it's another type of error, rethrow it
    throw new GraphQLError('Validation error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        http: { status: 500 }
      }
    });
  }
};

/**
 * A helper function to create validation middleware for resolvers
 * 
 * @param schema The Zod schema to validate against
 * @returns A function that can be used to wrap resolvers
 */
export const withValidation = <T extends z.ZodType>(schema: T) => {
  return (resolver: (parent: any, args: any, context: any, info: any) => any) => {
    return (parent: any, args: any, context: any, info: any) => {
      // Validate the input field
      const validatedInput = validateInput(schema, args.input);
      
      // Replace the original input with the validated one
      const newArgs = {
        ...args,
        input: validatedInput
      };
      
      // Call the original resolver with validated input
      return resolver(parent, newArgs, context, info);
    };
  };
}; 