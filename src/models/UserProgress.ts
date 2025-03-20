import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

/**
 * Interface for tracking progress on individual vocabulary items
 */
interface VocabItemProgress {
  vocabItemId: mongoose.Types.ObjectId;
  masteryLevel: number; // 0-100 percent
  correctAttempts: number;
  incorrectAttempts: number;
  lastReviewedAt?: Date;
  nextReviewDue?: Date; // For spaced repetition
}

/**
 * Interface for tracking user statistics overall
 */
interface UserStats {
  totalItemsStudied: number;
  totalCorrectAttempts: number;
  totalIncorrectAttempts: number;
  averageMastery: number; // 0-100 percent
  streakDays: number;
  lastStudyDate?: Date;
  studyTimeMinutes: number;
  completedTests: number;
  averageTestScore: number;
}

/**
 * Interface for UserProgress document, aligned with frontend requirements
 */
export interface IUserProgress extends Document {
  user: mongoose.Types.ObjectId | IUser;
  itemProgress: VocabItemProgress[];
  stats: UserStats;
  achievements: string[]; // IDs or names of achievements unlocked
  lastUpdated: Date;
}

/**
 * Schema for tracking progress on individual vocabulary items
 */
const vocabItemProgressSchema = new Schema(
  {
    vocabItemId: {
      type: Schema.Types.ObjectId,
      ref: 'VocabItem',
      required: true,
    },
    masteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },
    incorrectAttempts: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    nextReviewDue: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

/**
 * Schema for tracking user statistics overall
 */
const userStatsSchema = new Schema(
  {
    totalItemsStudied: {
      type: Number,
      default: 0,
    },
    totalCorrectAttempts: {
      type: Number,
      default: 0,
    },
    totalIncorrectAttempts: {
      type: Number,
      default: 0,
    },
    averageMastery: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastStudyDate: {
      type: Date,
      default: null,
    },
    studyTimeMinutes: {
      type: Number,
      default: 0,
    },
    completedTests: {
      type: Number,
      default: 0,
    },
    averageTestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { _id: false }
);

/**
 * UserProgress schema
 */
const userProgressSchema = new Schema<IUserProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemProgress: {
      type: [vocabItemProgressSchema],
      default: [],
    },
    stats: {
      type: userStatsSchema,
      default: () => ({}),
    },
    achievements: {
      type: [String],
      default: [],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Create indexes for efficient queries
 */
userProgressSchema.index({ user: 1 }, { unique: true });
userProgressSchema.index({ 'itemProgress.vocabItemId': 1 });

/**
 * Update the lastUpdated timestamp before saving
 */
userProgressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

/**
 * Static method to update item progress
 */
userProgressSchema.statics.updateItemProgress = async function(
  userId: mongoose.Types.ObjectId, 
  vocabItemId: mongoose.Types.ObjectId, 
  correct: boolean
) {
  // Find the user progress document
  const userProgress = await this.findOne({ user: userId });
  
  if (!userProgress) {
    throw new Error('User progress not found');
  }
  
  // Find the item in the user's progress array
  const itemIndex = userProgress.itemProgress.findIndex(
    (item: VocabItemProgress) => item.vocabItemId.toString() === vocabItemId.toString()
  );
  
  const now = new Date();
  
  if (itemIndex === -1) {
    // Item not found, add it to the array
    const newItem: VocabItemProgress = {
      vocabItemId,
      masteryLevel: correct ? 20 : 0, // Initial mastery level
      correctAttempts: correct ? 1 : 0,
      incorrectAttempts: correct ? 0 : 1,
      lastReviewedAt: now,
      nextReviewDue: new Date(now.getTime() + (correct ? 86400000 : 43200000)), // 24h if correct, 12h if incorrect
    };
    
    userProgress.itemProgress.push(newItem);
  } else {
    // Update existing item progress
    const item = userProgress.itemProgress[itemIndex];
    
    if (correct) {
      item.correctAttempts += 1;
      // Increase mastery level, max 100
      item.masteryLevel = Math.min(100, item.masteryLevel + 10);
    } else {
      item.incorrectAttempts += 1;
      // Decrease mastery level, min 0
      item.masteryLevel = Math.max(0, item.masteryLevel - 5);
    }
    
    item.lastReviewedAt = now;
    
    // Calculate next review based on spaced repetition algorithm
    const reviewInterval = correct ? 
      (1 + item.masteryLevel / 20) * 86400000 : // 1-5 days based on mastery if correct
      43200000; // 12 hours if incorrect
    
    item.nextReviewDue = new Date(now.getTime() + reviewInterval);
  }
  
  // Update overall stats
  userProgress.stats.totalItemsStudied = userProgress.itemProgress.length;
  
  if (correct) {
    userProgress.stats.totalCorrectAttempts += 1;
  } else {
    userProgress.stats.totalIncorrectAttempts += 1;
  }
  
  // Update average mastery
  const totalMastery = userProgress.itemProgress.reduce(
    (sum: number, item: VocabItemProgress) => sum + item.masteryLevel, 
    0
  );
  userProgress.stats.averageMastery = Math.round(
    totalMastery / userProgress.itemProgress.length
  );
  
  // Update last study date and streak
  const lastDate = userProgress.stats.lastStudyDate;
  userProgress.stats.lastStudyDate = now;
  
  // Update streak if studying on a new day
  if (lastDate) {
    const lastDay = new Date(lastDate).setHours(0, 0, 0, 0);
    const today = new Date(now).setHours(0, 0, 0, 0);
    const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0);
    
    if (lastDay === yesterday) {
      // Studied yesterday, increment streak
      userProgress.stats.streakDays += 1;
    } else if (lastDay < yesterday) {
      // Missed a day, reset streak
      userProgress.stats.streakDays = 1;
    }
    // If same day, no change to streak
  } else {
    // First study session, start streak
    userProgress.stats.streakDays = 1;
  }
  
  await userProgress.save();
  return userProgress;
};

/**
 * UserProgress model
 */
export const UserProgress = mongoose.model<
  IUserProgress, 
  mongoose.Model<IUserProgress> & {
    updateItemProgress: (
      userId: mongoose.Types.ObjectId, 
      vocabItemId: mongoose.Types.ObjectId, 
      correct: boolean
    ) => Promise<IUserProgress>;
  }
>('UserProgress', userProgressSchema); 