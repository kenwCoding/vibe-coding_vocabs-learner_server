import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ITest } from './Test';

/**
 * Interface for QuestionResponse, tracking individual question answers
 */
interface QuestionResponse {
  questionIndex: number;
  userAnswer: string | number; // Can be answer text or option index
  isCorrect: boolean;
  timeSpent?: number; // Time in seconds spent on this question
}

/**
 * Interface for TestResult document, aligned with frontend requirements
 */
export interface ITestResult extends Document {
  test: mongoose.Types.ObjectId | ITest;
  user: mongoose.Types.ObjectId | IUser;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completionTime: number;  // Total time in seconds
  responses: QuestionResponse[];
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * QuestionResponse schema
 */
const questionResponseSchema = new Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    userAnswer: {
      type: Schema.Types.Mixed, // Can be string or number
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

/**
 * TestResult schema
 */
const testResultSchema = new Schema<ITestResult>(
  {
    test: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    completionTime: {
      type: Number,
      default: 0,
    },
    responses: {
      type: [questionResponseSchema],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Create indexes for efficient queries
 */
testResultSchema.index({ user: 1, test: 1 });
testResultSchema.index({ completedAt: -1 });

/**
 * TestResult model
 */
export const TestResult = mongoose.model<ITestResult>('TestResult', testResultSchema); 