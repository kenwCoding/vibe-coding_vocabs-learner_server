# Validation with Zod in VocabMaster

This document describes how validation is implemented using Zod throughout the VocabMaster backend.

## What is Zod?

[Zod](https://github.com/colinhacks/zod) is a TypeScript-first schema validation library that allows you to define schemas for data validation. Some of the key advantages:

- Fully TypeScript compatible with static type inference
- Composable and reusable schemas
- Rich validation rules and error messages
- Zero dependencies and small bundle size

## Validation Structure

The validation system in VocabMaster is structured in the following way:

1. **Schema Definitions** (`src/utils/validation.ts`): Contains Zod schemas for all models and input types
2. **Validation Middleware** (`src/utils/validationMiddleware.ts`): Provides utilities for validating inputs in GraphQL resolvers
3. **Implementation in Resolvers**: Validation is applied in the GraphQL resolvers

## Available Schemas

The following Zod schemas are available in `src/utils/validation.ts`:

### User-related:
- `userRegistrationSchema`: Validates user registration input
- `userLoginSchema`: Validates user login input
- `userUpdateSchema`: Validates user update input

### Vocabulary-related:
- `vocabItemSchema`: Validates vocabulary item input
- `vocabListSchema`: Validates vocabulary list input

### Test-related:
- `multipleChoiceQuestionSchema`: Validates multiple-choice questions
- `trueFalseQuestionSchema`: Validates true/false questions
- `matchingQuestionSchema`: Validates matching questions
- `fillInBlankQuestionSchema`: Validates fill-in-the-blank questions
- `questionSchema`: Combined schema for all question types
- `testSchema`: Validates test input
- `testResultSchema`: Validates test result input

### Progress-related:
- `studySessionSchema`: Validates study session input
- `itemProgressSchema`: Validates item progress data
- `userStatsSchema`: Validates user statistics data
- `achievementSchema`: Validates achievement data
- `userProgressSchema`: Validates user progress input

## How to Use Validation

### Direct Validation

You can directly validate data using the `validateInput` utility:

```typescript
import { validateInput } from '../utils/validationMiddleware';
import { userRegistrationSchema } from '../utils/validation';

// Will throw a formatted GraphQLError if validation fails
const validatedData = validateInput(userRegistrationSchema, inputData);
```

### Resolver Middleware

You can wrap resolvers with the `withValidation` helper:

```typescript
import { withValidation } from '../utils/validationMiddleware';
import { vocabItemSchema } from '../utils/validation';

const resolvers = {
  Mutation: {
    createVocabItem: withValidation(vocabItemSchema)(
      async (_, { input }, context) => {
        // input is already validated here
        // ...
      }
    )
  }
};
```

### Partial Validation

For updates where not all fields are required, use `.partial()`:

```typescript
withValidation(vocabItemSchema.partial())(
  async (_, { id, input }, context) => {
    // input is validated but all fields are optional
    // ...
  }
)
```

## Validation Errors

When validation fails, a GraphQLError is thrown with:

- HTTP status code 400 (Bad Request)
- Error code 'BAD_USER_INPUT'
- Detailed validation errors for each field

Example error response:

```json
{
  "errors": [
    {
      "message": "Validation failed",
      "extensions": {
        "code": "BAD_USER_INPUT",
        "http": {
          "status": 400
        },
        "validationErrors": [
          {
            "path": "email",
            "message": "Invalid email"
          },
          {
            "path": "password",
            "message": "String must contain at least 8 character(s)"
          }
        ]
      }
    }
  ]
}
```

## Adding New Validations

To add a new validation schema:

1. Define the schema in `src/utils/validation.ts`
2. Import and use it in your resolver using one of the methods above

Example:

```typescript
// In validation.ts
export const newFeatureSchema = z.object({
  name: z.string().min(3),
  value: z.number().positive(),
});

// In your resolver
import { newFeatureSchema } from '../utils/validation';
import { withValidation } from '../utils/validationMiddleware';

export const newFeatureResolvers = {
  Mutation: {
    createNewFeature: withValidation(newFeatureSchema)(
      async (_, { input }, context) => {
        // ...
      }
    )
  }
};
``` 