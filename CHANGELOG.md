# Changelog

All notable changes to the VocabMaster backend project will be documented in this file.

## Tags Definition
- [Add] - New features or components added
- [Update] - Updates to existing features or components
- [Remove] - Features or components that have been removed
- [Fix] - Bug fixes
- [Security] - Security-related changes
- [Performance] - Performance-related improvements
- [Docs] - Documentation updates

## Changes

### 2024-03-25 11:30 AM
#### 🐛 Fixes
- Fixed issue with VocabList level values being stored incorrectly
- Added enhanced level normalization to handle various input formats
- Added robust debug logging to vocabListResolvers for troubleshooting level values

#### 🧰 Utilities
- Added `normalizeLevel` utility function to standardize level values (beginner/intermediate/advanced)
- Created `fixLevels.ts` utility script to correct existing level values in the database
- Created `run-fix-levels.sh` shell script for easy execution of the fix utility

### 2024-03-24 11:45 AM
#### ✨ Features
- Added a health check endpoint at `/health` to monitor API status
- Updated README with production API endpoint information

### 2024-03-24 09:45 AM
#### 🐛 Fixes
- Fixed TypeScript errors in `src/index.ts`
  - Added proper type declarations for imported modules
  - Created `declarations.d.ts` file for type declarations
  - Updated `tsconfig.json` for type declaration handling
  - Added explanatory comment for `@ts-ignore` related to `expressMiddleware`

#### 🔧 Updates
- Improved project structure by organizing type declarations

#### ⚡️ Performance
- Server now starts without TypeScript errors

### 2024-03-24 09:30 AM
#### 🐛 Fixes
- Fixed Mongoose warning about duplicate schema index in UserProgress model
  - Removed redundant `unique: true` property and kept explicit index definition

### 2024-03-24 08:45 AM
- [Fix] Fixed property name issues in userProgressResolvers.ts:
  - Updated property names to match model definitions (proficiency → masteryLevel, reviewCount → correctAttempts)
  - Fixed getUserMasteryStats resolver to correctly calculate statistics
  - Updated parameters in updateVocabItemProgress mutation to use proper naming
  - Fixed logStudySession mutation to work with correct parameters
  - Added proper interface definitions at the top of the file
- [Update] Updated server to start successfully with all resolvers matching schema definitions
- [Performance] Improved server startup by addressing type errors

### 2024-03-24 08:15 AM
- [Fix] Fixed missing GraphQL schema elements by adding missing mutations:
  - Added `deleteTestResult` mutation for managing test results
  - Added `startStudySession` and `deleteStudySession` mutations
  - Added `updateTotalStudyTime` and `resetUserProgress` mutations
  - Added `updateVocabItemProgress` and `logStudySession` mutations
- [Fix] Added `vocabList` field to the `Test` type to associate tests with vocab lists
- [Fix] Added `ItemProgress` type in schema to align with resolvers
- [Fix] Added `vocabItem` field to the `ItemProgress` type for references
- [Update] Ensured complete alignment between resolvers and GraphQL schema

### 2024-03-23 10:30 AM
- [Add] Integrated Zod for schema validation
- [Add] Created validation utility with schemas for all models
- [Add] Added validation middleware for GraphQL resolvers
- [Update] Implemented Zod validation in User and VocabItem resolvers
- [Security] Enhanced input validation for GraphQL mutations
- Created missing resolver files:
  - Created `vocabListResolvers.ts` with Zod validation
  - Created `testResolvers.ts` with Zod validation and test generation functionality
  - Created `testResultResolvers.ts` for tracking and managing test results
  - Created `studySessionResolvers.ts` for study session tracking and analysis
  - Created `userProgressResolvers.ts` for user progress tracking and spaced repetition
- Updated the main resolvers index file to properly import and combine all resolvers
- Added type safety throughout resolver files with proper interface typing
- Implemented validation middleware with Zod schemas across all mutating operations

### 2024-03-22 07:00 PM
- [Add] Created missing resolver files (testResolvers, testResultResolvers, studySessionResolvers, userProgressResolvers)
- [Fix] Fixed type errors in userResolvers.ts by properly typing the user document with mongoose ObjectId
- [Update] Added IUserDocument interface to properly type MongoDB documents across the application
- [Fix] Updated src/index.ts to use the proper user document type
- Added missing resolver files: `userResolvers` and `vocabItemResolvers`
- Fixed type errors in `userResolvers.ts` by properly typing the user document with `mongoose.ObjectId`
- Updated the application to include the `IUserDocument` interface for consistent MongoDB document typing
- Updated `src/index.ts` to utilize the correct user document type

### 2024-03-22 06:15 PM
- [Fix] Fixed Docker volume configuration to prevent overwriting node_modules
- [Security] Added non-root user in production Dockerfile
- [Add] Created separate Docker configuration for development environment
- [Performance] Optimized Docker layers for better caching and smaller images
- [Docs] Updated README with development Docker setup instructions

### 2024-03-22 05:30 PM
- [Add] Added Docker and Docker Compose configuration for containerized deployment
- [Add] Created .dockerignore file to optimize Docker builds
- [Add] Added .env.example file for environment variables documentation
- [Docs] Updated README with Docker setup instructions and architecture details

### 2024-03-22 04:25 PM
- [Add] Created GraphQL schema with type definitions for all models (User, VocabItem, VocabList, Test, etc.)
- [Add] Implemented GraphQL resolvers for User, VocabItem, and VocabList
- [Add] Added user authentication with JWT and proper error handling
- [Add] Created test-related models (Test, TestResult) and progress tracking models (StudySession, UserProgress)

### 2024-03-21 03:55 PM
- [Add] Created frontend-backend-alignment cursor rule to ensure backend development aligns with frontend requirements
- [Add] Added git-commit-rule for standardizing commit practices
- [Docs] Added PROJECT_PLANNING.md with project requirements and architecture
- [Docs] Added initial CHANGELOG.md file to track project changes 