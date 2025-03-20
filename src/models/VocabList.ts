import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

/**
 * Interface for VocabList document, aligned with frontend requirements
 */
export interface IVocabList extends Document {
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  itemIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  creator: mongoose.Types.ObjectId | IUser;
}

/**
 * VocabList schema
 */
const vocabListSchema = new Schema<IVocabList>(
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
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Level is required'],
      default: 'intermediate',
    },
    itemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'VocabItem'
      }
    ],
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

/**
 * VocabList model
 */
export const VocabList = mongoose.model<IVocabList>('VocabList', vocabListSchema); 