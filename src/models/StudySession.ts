import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

/**
 * Interface for individual VocabItem study record within a session
 */
interface StudyRecord {
  vocabItemId: mongoose.Types.ObjectId;
  correctAttempts: number;
  incorrectAttempts: number;
  lastReviewedAt: Date;
  userDifficultyRating?: number; // User's personal difficulty rating (1-5)
  notes?: string;
}

/**
 * Interface for StudySession document, aligned with frontend requirements
 */
export interface IStudySession extends Document {
  user: mongoose.Types.ObjectId | IUser;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // Duration in minutes
  vocabListIds: mongoose.Types.ObjectId[];
  itemsStudied: StudyRecord[];
  status: 'active' | 'paused' | 'completed';
  settings: {
    useSpacedRepetition: boolean;
    focusOnDifficult: boolean;
    studyBothLanguages: boolean;
  };
}

/**
 * Schema for individual VocabItem study record
 */
const studyRecordSchema = new Schema(
  {
    vocabItemId: {
      type: Schema.Types.ObjectId,
      ref: 'VocabItem',
      required: true,
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
      default: Date.now,
    },
    userDifficultyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

/**
 * StudySession schema
 */
const studySessionSchema = new Schema<IStudySession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // Duration in minutes
    },
    vocabListIds: [{
      type: Schema.Types.ObjectId,
      ref: 'VocabList',
      required: true,
    }],
    itemsStudied: {
      type: [studyRecordSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    settings: {
      useSpacedRepetition: {
        type: Boolean,
        default: true,
      },
      focusOnDifficult: {
        type: Boolean,
        default: false,
      },
      studyBothLanguages: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Create indexes for efficient queries
 */
studySessionSchema.index({ user: 1, startTime: -1 });
studySessionSchema.index({ status: 1 });

/**
 * Update duration before saving if session is completed
 */
studySessionSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.endTime && !this.duration) {
    const startTime = this.startTime instanceof Date ? this.startTime : new Date(this.startTime);
    const endTime = this.endTime instanceof Date ? this.endTime : new Date(this.endTime);
    
    // Calculate duration in minutes
    this.duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }
  next();
});

/**
 * StudySession model
 */
export const StudySession = mongoose.model<IStudySession>('StudySession', studySessionSchema); 