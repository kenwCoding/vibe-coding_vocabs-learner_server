// Import resolver modules using require to avoid TypeScript module resolution issues
// @ts-ignore
const userResolvers = require('./userResolvers').userResolvers;
// @ts-ignore
const vocabItemResolvers = require('./vocabItemResolvers').vocabItemResolvers;
// @ts-ignore
const vocabListResolvers = require('./vocabListResolvers').vocabListResolvers;
// @ts-ignore
const testResolvers = require('./testResolvers').testResolvers;
// @ts-ignore
const testResultResolvers = require('./testResultResolvers').testResultResolvers;
// @ts-ignore
const studySessionResolvers = require('./studySessionResolvers').studySessionResolvers;
// @ts-ignore
const userProgressResolvers = require('./userProgressResolvers').userProgressResolvers;

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...vocabItemResolvers.Query,
    ...vocabListResolvers.Query,
    ...testResolvers.Query,
    ...testResultResolvers.Query,
    ...studySessionResolvers.Query,
    ...userProgressResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...vocabItemResolvers.Mutation,
    ...vocabListResolvers.Mutation,
    ...testResolvers.Mutation,
    ...testResultResolvers.Mutation,
    ...studySessionResolvers.Mutation,
    ...userProgressResolvers.Mutation,
  },
  User: userResolvers.User,
  VocabItem: vocabItemResolvers.VocabItem,
  VocabList: vocabListResolvers.VocabList,
  Test: testResolvers.Test,
  TestResult: testResultResolvers.TestResult,
  StudySession: studySessionResolvers.StudySession,
  UserProgress: userProgressResolvers.UserProgress,
  ItemProgress: userProgressResolvers.ItemProgress,
  
  // Type resolver for the Question interface
  Question: {
    __resolveType(obj: any) {
      if (obj.type === 'MultipleChoice') {
        return 'MultipleChoiceQuestion';
      } else if (obj.type === 'TrueFalse') {
        return 'TrueFalseQuestion';
      } else if (obj.type === 'FillInBlank') {
        return 'FillInBlankQuestion';
      } else if (obj.type === 'Matching') {
        return 'MatchingQuestion';
      }
      return null; // GraphQLError is thrown
    },
  },
}; 