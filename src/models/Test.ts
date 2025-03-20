import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

// Question types
export type TestType = 'multipleChoice' | 'matching' | 'fillInBlanks';

// Base question interface
interface BaseQuestion {
  vocabItemId: mongoose.Types.ObjectId;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
}

// Multiple choice question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multipleChoice';
  prompt: string;
  options: string[];
  correctOptionIndex: number;
}

// Matching question
export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  term: string;
  options: string[];
  correctOptionIndex: number;
}

// Fill in the blanks question
export interface FillInBlanksQuestion extends BaseQuestion {
  type: 'fillInBlanks';
  sentence: string;
  blankIndex: number;
  correctAnswer: string;
}

// Union type for all question types
export type TestQuestion = MultipleChoiceQuestion | MatchingQuestion | FillInBlanksQuestion;

/**
 * Interface for Test document, aligned with frontend requirements
 */
export interface ITest extends Document {
  title: string;
  description: string;
  type: TestType;
  questions: TestQuestion[];
  settings: {
    timeLimit?: number;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    showFeedbackAfterEachQuestion: boolean;
  };
  creator: mongoose.Types.ObjectId | IUser;
  vocabListId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

/**
 * Schema for different question types
 */
const baseQuestionSchema = {
  vocabItemId: {
    type: Schema.Types.ObjectId,
    ref: 'VocabItem',
    required: true
  },
  difficultyRating: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true
  }
};

const multipleChoiceQuestionSchema = {
  ...baseQuestionSchema,
  type: {
    type: String,
    enum: ['multipleChoice'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctOptionIndex: {
    type: Number,
    required: true
  }
};

const matchingQuestionSchema = {
  ...baseQuestionSchema,
  type: {
    type: String,
    enum: ['matching'],
    required: true
  },
  term: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctOptionIndex: {
    type: Number,
    required: true
  }
};

const fillInBlanksQuestionSchema = {
  ...baseQuestionSchema,
  type: {
    type: String,
    enum: ['fillInBlanks'],
    required: true
  },
  sentence: {
    type: String,
    required: true
  },
  blankIndex: {
    type: Number,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  }
};

/**
 * Test schema
 */
const testSchema = new Schema<ITest>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['multipleChoice', 'matching', 'fillInBlanks'],
      required: [true, 'Test type is required'],
    },
    questions: [{
      type: Schema.Types.Mixed,
      required: true,
    }],
    settings: {
      timeLimit: {
        type: Number,
        default: null,
      },
      randomizeQuestions: {
        type: Boolean,
        default: true,
      },
      randomizeOptions: {
        type: Boolean,
        default: true,
      },
      showFeedbackAfterEachQuestion: {
        type: Boolean,
        default: true,
      },
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Add validation for questions array
testSchema.path('questions').validate(function(questions: any[]) {
  // Ensure questions array is not empty
  if (questions.length === 0) return false;
  
  // Validate each question based on its type
  return questions.every(q => {
    switch(q.type) {
      case 'multipleChoice':
        return q.prompt && q.options && q.options.length > 0 && 
                q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length;
      case 'matching':
        return q.term && q.options && q.options.length > 0 && 
                q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length;
      case 'fillInBlanks':
        return q.sentence && q.correctAnswer !== undefined && q.blankIndex >= 0;
      default:
        return false;
    }
  });
}, 'Invalid question format');

/**
 * Test model
 */
export const Test = mongoose.model<ITest>('Test', testSchema); 