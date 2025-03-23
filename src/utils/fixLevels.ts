import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { VocabList } from '../models';
import { connectDB } from '../config/db';

// Load environment variables
dotenv.config();

/**
 * Normalize level value to one of: 'beginner', 'intermediate', or 'advanced'
 * 
 * @param level The input level value to normalize
 * @returns Normalized level value
 */
export function normalizeLevel(level: string | undefined | null | any): 'beginner' | 'intermediate' | 'advanced' {
  // Handle null, undefined, or empty values
  if (level === null || level === undefined || level === '') {
    return 'beginner';
  }
  
  // Convert to string and handle non-string values
  let levelStr: string;
  try {
    levelStr = String(level).toLowerCase().trim();
  } catch (error) {
    console.log(`Error converting level value to string: ${error}`);
    return 'beginner';
  }

  // Handle abbreviated forms
  if (levelStr === 'b' || levelStr === 'beg') return 'beginner';
  if (levelStr === 'i' || levelStr === 'int') return 'intermediate';
  if (levelStr === 'a' || levelStr === 'adv') return 'advanced';

  // Handle numeric encodings
  if (levelStr === '1') return 'beginner';
  if (levelStr === '2') return 'intermediate';
  if (levelStr === '3') return 'advanced';

  // Handle alternative terms
  if (levelStr === 'easy' || levelStr === 'basic' || levelStr === 'entry') return 'beginner';
  if (levelStr === 'medium' || levelStr === 'mid' || levelStr === 'moderate') return 'intermediate';
  if (levelStr === 'hard' || levelStr === 'difficult' || levelStr === 'expert') return 'advanced';

  // Handle valid values
  if (levelStr === 'beginner') return 'beginner';
  if (levelStr === 'intermediate') return 'intermediate';
  if (levelStr === 'advanced') return 'advanced';

  // Default to beginner for any other value
  console.log(`Unknown level value "${level}" defaulting to "beginner"`);
  return 'beginner';
}

/**
 * Fix level values in all VocabList documents
 */
async function fixLevels() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB.');

    // Find all vocabulary lists
    console.log('Fetching all vocabulary lists...');
    const vocabLists = await VocabList.find({});
    console.log(`Found ${vocabLists.length} vocabulary lists.`);

    let updatedCount = 0;
    let unchangedCount = 0;

    // Process each vocabulary list
    for (const list of vocabLists) {
      const originalLevel = list.level;
      const normalizedLevel = normalizeLevel(originalLevel);

      // Only update if the level needs to be changed
      if (originalLevel !== normalizedLevel) {
        console.log(`Updating list "${list.title}" (${list._id}): "${originalLevel}" -> "${normalizedLevel}"`);
        
        list.level = normalizedLevel;
        await list.save();
        updatedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log('\nSummary:');
    console.log(`- Total vocabulary lists: ${vocabLists.length}`);
    console.log(`- Updated lists: ${updatedCount}`);
    console.log(`- Unchanged lists: ${unchangedCount}`);
    console.log('\nLevel fix completed successfully.');

  } catch (error) {
    console.error('Error fixing vocabulary list levels:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Only run the function if this file is executed directly (not imported)
if (require.main === module) {
  fixLevels()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
} 