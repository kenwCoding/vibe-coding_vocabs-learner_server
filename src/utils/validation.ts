import { z } from 'zod';

// User Schemas
export const userRegistrationSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  nativeLanguage: z.string().default('en'),
  preferences: z.object({
    darkMode: z.boolean().default(false),
  }).optional().default({ darkMode: false }),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  nativeLanguage: z.string().optional(),
  preferences: z.object({
    darkMode: z.boolean(),
  }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});

// VocabItem Schemas
export const vocabItemSchema = z.object({
  term: z.string().min(1),
  definitionEn: z.string().min(1),
  definitionZh: z.string().min(1),
  exampleSentence: z.string().min(1),
  partOfSpeech: z.string().min(1),
  difficultyRating: z.number().int().min(1).max(5),
  tags: z.array(z.string()).optional().default([]),
});

// VocabList Schemas
export const vocabListSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  items: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// Test Schemas
export const multipleChoiceQuestionSchema = z.object({
  type: z.literal('multipleChoice'),
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctOption: z.number().int().min(0),
});

export const trueFalseQuestionSchema = z.object({
  type: z.literal('trueFalse'),
  question: z.string(),
  correctAnswer: z.boolean(),
});

export const matchingQuestionSchema = z.object({
  type: z.literal('matching'),
  pairs: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
    })
  ).min(2),
});

export const fillInBlankQuestionSchema = z.object({
  type: z.literal('fillInBlank'),
  question: z.string(),
  correctAnswer: z.string(),
});

// Union type for all question types
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  matchingQuestionSchema,
  fillInBlankQuestionSchema,
]);

// Test schema
export const testSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
  timeLimit: z.number().int().positive().optional(),
  shuffleQuestions: z.boolean().default(false),
  passingScore: z.number().int().min(0).max(100).default(60),
  allowRetakes: z.boolean().default(true),
});

// Test Result Schema
export const answerSchema = z.object({
  questionIndex: z.number().int().nonnegative(),
  answer: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  isCorrect: z.boolean(),
});

export const testResultSchema = z.object({
  test: z.string(), // Test ID
  score: z.number().min(0).max(100),
  answers: z.array(answerSchema),
  timeTaken: z.number().int().positive(),
  completed: z.boolean().default(true),
});

// Study Session Schema
export const studySessionSchema = z.object({
  vocabList: z.string(), // VocabList ID
  settings: z.object({
    studyMode: z.enum(['flashcards', 'quiz', 'writing', 'matching']),
    showDefinitionFirst: z.boolean().default(false),
    shuffleItems: z.boolean().default(true),
    limitItems: z.number().int().positive().optional(),
  }),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
  progress: z.object({
    itemsStudied: z.number().int().nonnegative().default(0),
    correctAnswers: z.number().int().nonnegative().default(0),
    incorrectAnswers: z.number().int().nonnegative().default(0),
  }).default({
    itemsStudied: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
  }),
  startedAt: z.date().default(() => new Date()),
  completedAt: z.date().optional().nullable(),
});

// Item Progress Schema (for UserProgress)
export const itemProgressSchema = z.object({
  item: z.string(), // VocabItem ID
  masteryLevel: z.number().min(0).max(5).default(0),
  correctAttempts: z.number().int().nonnegative().default(0),
  incorrectAttempts: z.number().int().nonnegative().default(0),
  lastStudied: z.date().optional().nullable(),
  nextReviewDate: z.date().optional().nullable(),
});

// User Stats Schema (for UserProgress)
export const userStatsSchema = z.object({
  totalItemsStudied: z.number().int().nonnegative().default(0),
  totalCorrectAttempts: z.number().int().nonnegative().default(0),
  totalIncorrectAttempts: z.number().int().nonnegative().default(0),
  averageMastery: z.number().min(0).max(5).default(0),
  streakDays: z.number().int().nonnegative().default(0),
  studyTimeMinutes: z.number().int().nonnegative().default(0),
  completedTests: z.number().int().nonnegative().default(0),
  averageTestScore: z.number().min(0).max(100).default(0),
});

// Achievement Schema (for UserProgress)
export const achievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  earnedAt: z.date(),
  iconUrl: z.string().optional(),
});

// User Progress Schema
export const userProgressSchema = z.object({
  user: z.string(), // User ID
  itemProgress: z.array(itemProgressSchema).default([]),
  stats: userStatsSchema.default({
    totalItemsStudied: 0,
    totalCorrectAttempts: 0,
    totalIncorrectAttempts: 0,
    averageMastery: 0,
    streakDays: 0,
    studyTimeMinutes: 0,
    completedTests: 0,
    averageTestScore: 0,
  }),
  achievements: z.array(achievementSchema).default([]),
}); 