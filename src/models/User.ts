import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for User document, aligned with frontend requirements
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  nativeLanguage: 'en' | 'zh';
  preferences: {
    darkMode: boolean;
    [key: string]: any;
  };
  createdAt: Date;
}

/**
 * User schema
 */
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    nativeLanguage: {
      type: String,
      enum: ['en', 'zh'],
      required: [true, 'Native language is required'],
      default: 'en',
    },
    preferences: {
      darkMode: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * User model
 */
export const User = mongoose.model<IUser>('User', userSchema); 