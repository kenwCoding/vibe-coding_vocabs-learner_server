import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for VocabItem document, aligned with frontend requirements
 */
export interface IVocabItem extends Document {
  term: string;
  definitionEn: string;
  definitionZh: string;
  exampleSentence: string;
  partOfSpeech: string;
  difficultyRating: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  creator: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * VocabItem schema
 */
const vocabItemSchema = new Schema<IVocabItem>(
  {
    term: {
      type: String,
      required: [true, 'Term is required'],
      trim: true,
    },
    definitionEn: {
      type: String,
      required: [true, 'English definition is required'],
      trim: true,
    },
    definitionZh: {
      type: String,
      required: [true, 'Chinese definition is required'],
      trim: true,
    },
    exampleSentence: {
      type: String,
      required: [true, 'Example sentence is required'],
      trim: true,
    },
    partOfSpeech: {
      type: String,
      required: [true, 'Part of speech is required'],
      trim: true,
    },
    difficultyRating: {
      type: Number,
      required: [true, 'Difficulty rating is required'],
      enum: [1, 2, 3, 4, 5],
      default: 3,
    },
    tags: {
      type: [String],
      default: [],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create search index on term and definition
vocabItemSchema.index({ term: 'text', definitionEn: 'text', definitionZh: 'text' });

// Add index on tags for faster querying
vocabItemSchema.index({ tags: 1 });

// Add index on difficulty for faster querying
vocabItemSchema.index({ difficultyRating: 1 });

/**
 * VocabItem model
 */
export const VocabItem = mongoose.model<IVocabItem>('VocabItem', vocabItemSchema); 