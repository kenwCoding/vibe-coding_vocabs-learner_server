/**
 * Test file for the normalizeLevel function
 * 
 * This is just a simple test to verify the function works correctly with various inputs.
 * Run with: npx ts-node src/utils/levelTest.ts
 */

import { normalizeLevel } from './fixLevels';

// Define test cases
const testCases: { input: any; expected: string }[] = [
  // Null/undefined cases
  { input: null, expected: 'beginner' },
  { input: undefined, expected: 'beginner' },
  { input: '', expected: 'beginner' },

  // Standard values
  { input: 'beginner', expected: 'beginner' },
  { input: 'intermediate', expected: 'intermediate' },
  { input: 'advanced', expected: 'advanced' },
  
  // Mixed case
  { input: 'Beginner', expected: 'beginner' },
  { input: 'INTERMEDIATE', expected: 'intermediate' },
  { input: 'Advanced', expected: 'advanced' },
  
  // Abbreviations
  { input: 'b', expected: 'beginner' },
  { input: 'i', expected: 'intermediate' },
  { input: 'a', expected: 'advanced' },
  { input: 'beg', expected: 'beginner' },
  { input: 'int', expected: 'intermediate' },
  { input: 'adv', expected: 'advanced' },
  
  // Numeric formats
  { input: '1', expected: 'beginner' },
  { input: '2', expected: 'intermediate' },
  { input: '3', expected: 'advanced' },
  
  // Alternative terms
  { input: 'easy', expected: 'beginner' },
  { input: 'medium', expected: 'intermediate' },
  { input: 'hard', expected: 'advanced' },
  { input: 'basic', expected: 'beginner' },
  { input: 'moderate', expected: 'intermediate' },
  { input: 'difficult', expected: 'advanced' },
  
  // Edge cases
  { input: '  beginner  ', expected: 'beginner' }, // Extra whitespace
  { input: 'unknown_value', expected: 'beginner' }, // Default behavior
  { input: 123, expected: 'beginner' }, // Non-string input
  { input: {}, expected: 'beginner' }, // Object input
];

// Run the tests
console.log('🧪 Testing normalizeLevel function:');
console.log('===================================');

let passCount = 0;
let failCount = 0;

testCases.forEach((test, index) => {
  // @ts-ignore - Allow any type of input for testing
  const result = normalizeLevel(test.input);
  const passed = result === test.expected;
  
  if (passed) {
    passCount++;
    console.log(`✅ Test #${index + 1}: "${test.input}" -> "${result}"`);
  } else {
    failCount++;
    console.log(`❌ Test #${index + 1}: "${test.input}" -> "${result}" (expected "${test.expected}")`);
  }
});

console.log('');
console.log(`Summary: ${passCount} passed, ${failCount} failed`);
console.log('');

if (failCount === 0) {
  console.log('🎉 All tests passed! The normalizeLevel function is working correctly.');
} else {
  console.log('⚠️ Some tests failed. The normalizeLevel function may need adjustment.');
} 