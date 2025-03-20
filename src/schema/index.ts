import gql from 'graphql-tag';

export const typeDefs = gql`
  # User type
  type User {
    id: ID!
    username: String!
    email: String!
    nativeLanguage: String!
    preferences: UserPreferences!
    createdAt: String!
    updatedAt: String!
  }

  type UserPreferences {
    darkMode: Boolean!
  }

  # Vocabulary Item type
  type VocabItem {
    id: ID!
    term: String!
    definitionEn: String!
    definitionZh: String!
    exampleSentence: String!
    partOfSpeech: String!
    difficultyRating: Int!
    tags: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  # Vocabulary List type
  type VocabList {
    id: ID!
    title: String!
    description: String!
    level: String!
    items: [VocabItem!]!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  # Test types
  enum TestType {
    multipleChoice
    matching
    fillInBlanks
  }

  # Question interface
  interface Question {
    vocabItemId: ID!
    difficultyRating: Int!
  }

  # Multiple-choice question
  type MultipleChoiceQuestion implements Question {
    vocabItemId: ID!
    difficultyRating: Int!
    type: String!
    prompt: String!
    options: [String!]!
    correctOptionIndex: Int!
  }

  # Matching question
  type MatchingQuestion implements Question {
    vocabItemId: ID!
    difficultyRating: Int!
    type: String!
    term: String!
    options: [String!]!
    correctOptionIndex: Int!
  }

  # Fill-in-the-blanks question
  type FillInBlanksQuestion implements Question {
    vocabItemId: ID!
    difficultyRating: Int!
    type: String!
    sentence: String!
    blankIndex: Int!
    correctAnswer: String!
  }

  # Test settings
  type TestSettings {
    timeLimit: Int
    randomizeQuestions: Boolean!
    randomizeOptions: Boolean!
    showFeedbackAfterEachQuestion: Boolean!
  }

  # Test type
  type Test {
    id: ID!
    title: String!
    description: String!
    type: TestType!
    questions: [Question!]!
    settings: TestSettings!
    creator: User!
    vocabList: VocabList
    createdAt: String!
    updatedAt: String!
  }

  # Question response for test results
  type QuestionResponse {
    questionIndex: Int!
    userAnswer: String!
    isCorrect: Boolean!
    timeSpent: Int
  }

  # Test result
  type TestResult {
    id: ID!
    test: Test!
    user: User!
    score: Float!
    totalQuestions: Int!
    correctAnswers: Int!
    completionTime: Int!
    responses: [QuestionResponse!]!
    completed: Boolean!
    startedAt: String!
    completedAt: String
    createdAt: String!
    updatedAt: String!
  }

  # Study record for individual vocab items
  type StudyRecord {
    vocabItemId: ID!
    correctAttempts: Int!
    incorrectAttempts: Int!
    lastReviewedAt: String!
    userDifficultyRating: Int
    notes: String
  }

  # Study session settings
  type StudySessionSettings {
    useSpacedRepetition: Boolean!
    focusOnDifficult: Boolean!
    studyBothLanguages: Boolean!
  }

  # Study session
  type StudySession {
    id: ID!
    user: User!
    title: String!
    startTime: String!
    endTime: String
    duration: Int!
    vocabLists: [VocabList!]!
    itemsStudied: [StudyRecord!]!
    status: String!
    settings: StudySessionSettings!
    createdAt: String!
    updatedAt: String!
  }

  # VocabItem progress
  type VocabItemProgress {
    vocabItemId: ID!
    masteryLevel: Int!
    correctAttempts: Int!
    incorrectAttempts: Int!
    lastReviewedAt: String
    nextReviewDue: String
    proficiency: Float
    reviewCount: Int
  }

  # ItemProgress type (alias of VocabItemProgress for resolvers)
  type ItemProgress {
    vocabItemId: ID!
    masteryLevel: Int!
    correctAttempts: Int!
    incorrectAttempts: Int!
    lastReviewedAt: String
    nextReviewDue: String
    proficiency: Float
    reviewCount: Int
    vocabItem: VocabItem
  }

  # User stats
  type UserStats {
    totalItemsStudied: Int!
    totalCorrectAttempts: Int!
    totalIncorrectAttempts: Int!
    averageMastery: Int!
    streakDays: Int!
    lastStudyDate: String
    studyTimeMinutes: Int!
    completedTests: Int!
    averageTestScore: Float!
    masteredItemsCount: Int
    totalStudyTime: Int
    sessionsCompleted: Int
  }

  # User progress
  type UserProgress {
    id: ID!
    user: User!
    itemProgress: [VocabItemProgress!]!
    stats: UserStats!
    achievements: [String!]!
    lastUpdated: String!
    createdAt: String!
    updatedAt: String!
  }

  # Input types for mutations

  # User preferences input
  input UserPreferencesInput {
    darkMode: Boolean!
  }

  # User registration input
  input RegisterUserInput {
    username: String!
    email: String!
    password: String!
    nativeLanguage: String!
    preferences: UserPreferencesInput
  }

  # User login input
  input LoginInput {
    email: String!
    password: String!
  }

  # User update input
  input UpdateUserInput {
    username: String
    email: String
    nativeLanguage: String
    preferences: UserPreferencesInput
  }

  # VocabItem input
  input VocabItemInput {
    term: String!
    definitionEn: String!
    definitionZh: String!
    exampleSentence: String!
    partOfSpeech: String!
    difficultyRating: Int!
    tags: [String!]
  }

  # VocabList input
  input VocabListInput {
    title: String!
    description: String!
    level: String!
    itemIds: [ID!]!
  }

  # Test question inputs
  input MultipleChoiceQuestionInput {
    vocabItemId: ID!
    difficultyRating: Int!
    type: String!
    prompt: String!
    options: [String!]!
    correctOptionIndex: Int!
  }

  input MatchingQuestionInput {
    vocabItemId: ID!
    difficultyRating: Int!
    type: String!
    term: String!
    options: [String!]!
    correctOptionIndex: Int!
  }

  input FillInBlanksQuestionInput {
    vocabItemId: ID!
    difficultyRating: Int!
    type: String!
    sentence: String!
    blankIndex: Int!
    correctAnswer: String!
  }

  # Union type for question input
  input TestQuestionInput {
    multipleChoice: MultipleChoiceQuestionInput
    matching: MatchingQuestionInput
    fillInBlanks: FillInBlanksQuestionInput
  }

  # Test settings input
  input TestSettingsInput {
    timeLimit: Int
    randomizeQuestions: Boolean!
    randomizeOptions: Boolean!
    showFeedbackAfterEachQuestion: Boolean!
  }

  # Test input
  input TestInput {
    title: String!
    description: String!
    type: TestType!
    questions: [TestQuestionInput!]!
    settings: TestSettingsInput!
  }

  # Question response input
  input QuestionResponseInput {
    questionIndex: Int!
    userAnswer: String!
    isCorrect: Boolean!
    timeSpent: Int
  }

  # Test result input
  input TestResultInput {
    testId: ID!
    score: Float!
    totalQuestions: Int!
    correctAnswers: Int!
    completionTime: Int!
    responses: [QuestionResponseInput!]!
    completed: Boolean!
    completedAt: String
  }

  # Study session settings input
  input StudySessionSettingsInput {
    useSpacedRepetition: Boolean!
    focusOnDifficult: Boolean!
    studyBothLanguages: Boolean!
  }

  # Study session input
  input StudySessionInput {
    title: String!
    vocabListIds: [ID!]!
    settings: StudySessionSettingsInput!
  }

  # Study record input
  input StudyRecordInput {
    vocabItemId: ID!
    correctAttempts: Int!
    incorrectAttempts: Int!
    userDifficultyRating: Int
    notes: String
  }

  # Update study session input
  input UpdateStudySessionInput {
    endTime: String
    status: String
    itemsStudied: [StudyRecordInput!]
  }

  # Query type
  type Query {
    # User queries
    me: User
    getUserById(id: ID!): User

    # VocabItem queries
    getVocabItems: [VocabItem!]!
    getVocabItemById(id: ID!): VocabItem
    searchVocabItems(term: String!): [VocabItem!]!
    getVocabItemsByTags(tags: [String!]!): [VocabItem!]!
    getVocabItemsByDifficulty(difficulty: Int!): [VocabItem!]!

    # VocabList queries
    getVocabLists: [VocabList!]!
    getVocabListById(id: ID!): VocabList
    getVocabListsByUser: [VocabList!]!

    # Test queries
    getTests: [Test!]!
    getTestById(id: ID!): Test
    getTestsByUser: [Test!]!
    getTestsByCreator: [Test!]!
    getAvailableTests: [Test!]!

    # TestResult queries
    getTestResults: [TestResult!]!
    getTestResultById(id: ID!): TestResult
    getTestResultsByUser: [TestResult!]!
    getTestResultsByTest(testId: ID!): [TestResult!]!

    # StudySession queries
    getStudySessions: [StudySession!]!
    getStudySessionById(id: ID!): StudySession
    getStudySessionsByUser: [StudySession!]!
    getActiveStudySession: StudySession
    getSessionsByVocabList(vocabListId: ID!): [StudySession!]!

    # UserProgress queries
    getUserProgress: UserProgress
    getUserMasteryStats: UserStats
    getItemProgress(vocabItemId: ID!): VocabItemProgress
    getUserStats: UserStats
  }

  # Mutation type
  type Mutation {
    # Auth mutations
    register(input: RegisterUserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    
    # User mutations
    updateUser(input: UpdateUserInput!): User!
    
    # VocabItem mutations
    createVocabItem(input: VocabItemInput!): VocabItem!
    updateVocabItem(id: ID!, input: VocabItemInput!): VocabItem!
    deleteVocabItem(id: ID!): Boolean!
    
    # VocabList mutations
    createVocabList(input: VocabListInput!): VocabList!
    updateVocabList(id: ID!, input: VocabListInput!): VocabList!
    deleteVocabList(id: ID!): Boolean!
    addItemToList(listId: ID!, itemId: ID!): VocabList!
    removeItemFromList(listId: ID!, itemId: ID!): VocabList!
    
    # Test mutations
    createTest(input: TestInput!): Test!
    updateTest(id: ID!, input: TestInput!): Test!
    deleteTest(id: ID!): Boolean!
    publishTest(id: ID!): Test!
    
    # TestResult mutations
    createTestResult(input: TestResultInput!): TestResult!
    updateTestResult(id: ID!, input: TestResultInput!): TestResult!
    submitTestResult(input: TestResultInput!): TestResult!
    deleteTestResult(id: ID!): Boolean!
    
    # StudySession mutations
    createStudySession(input: StudySessionInput!): StudySession!
    startStudySession(input: StudySessionInput!): StudySession!
    updateStudySession(id: ID!, input: UpdateStudySessionInput!): StudySession!
    completeStudySession(id: ID!): StudySession!
    deleteStudySession(id: ID!): Boolean!
    logStudySession(minutes: Int!, vocabListId: ID!): UserProgress!
    updateItemProgress(vocabItemId: ID!, correct: Boolean!): UserProgress!
    updateTotalStudyTime(minutes: Int!): UserProgress!
    resetUserProgress: UserProgress!
    updateVocabItemProgress(vocabItemId: ID!, masteryLevel: Int!): VocabItemProgress!
  }

  # Auth payload
  type AuthPayload {
    token: String!
    user: User!
  }
`; 