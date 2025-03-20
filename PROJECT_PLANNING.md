# VocabMaster Project Planning Document

This document outlines the detailed planning, architecture, and roadmap for the VocabMaster platform.

## Target Users

Language learners who want to:
- Learn English vocabulary (with Chinese as native language)
- Assess their vocabulary strengths and weaknesses
- Receive personalized training plans
- Track their progress over time

## System Requirements

### Functional Requirements

1. **User Management**
   - User registration and authentication
   - User profile management
   - Learning preference settings

2. **Vocabulary Content**
   - Integration with news sources via n8n
   - Dictionary API integration
   - Vocabulary categorization by level, topic, etc.
   - Custom vocabulary list creation

3. **Test System**
   - Multiple test formats (MCQ, matching, fill-in-blanks)
   - Timed and untimed test options
   - Difficulty levels
   - Test results and feedback

4. **Performance Tracking**
   - Test history storage
   - Performance metrics and analytics
   - Progress visualization
   - Trend analysis

5. **AI Analysis**
   - Basic performance insights
   - Detailed cognitive analysis
   - Weakness identification
   - Personalized recommendations
   - Adaptive test generation

### Non-Functional Requirements

1. **Performance**
   - Fast page loading (<2s)
   - Responsive UI for all screen sizes
   - Smooth test-taking experience

2. **Scalability**
   - Start with support for 10 users
   - Architecture designed for future scaling

3. **Security**
   - Secure authentication
   - Data encryption
   - Privacy protection

4. **Reliability**
   - 99.9% uptime
   - Backup and recovery systems

5. **Usability**
   - Intuitive UI/UX
   - Mobile-friendly responsive design
   - Clear instructions and feedback
   - Full accessibility compliance (WCAG 2.1)
   - Internationalization support (starting with Chinese and English)

## Technical Architecture

### Frontend (This Repository)
- ReactJS for UI components
- TypeScript for type safety
- React Router for navigation
- **Zustand** for state management
- TailwindCSS for styling
- Vite for development and bundling
- i18next for internationalization
- Deployed on Vercel

### Backend (To Be Developed)
- Node.js/Express API
- **GraphQL** for flexible data queries
- Apollo Server for GraphQL implementation
- Authentication service (JWT-based)
- Test management service
- User service
- Vocabulary service
- Data access layer

### AI Processing Layer
- LangChain for AI workflow components
- LangGraph for agent-based systems
- GPT-4o-mini (recommended) or similar model
- Inferencing optimization

### Data Layer
- PostgreSQL for relational data
- Redis for caching
- S3 or similar for media storage

### Integration
- n8n for news content automation
- Dictionary API integration
- Potentially custom scraper for vocabulary sources

### Testing
- **Jest** for unit and integration testing
- React Testing Library for component testing
- Cypress for end-to-end testing
- Accessibility testing with axe-core

## Database Schema

```
Users
  - id
  - username
  - email
  - password (hashed)
  - preferences (JSON)
  - created_at

VocabLists
  - id
  - title
  - description
  - level
  - creator_id (foreign key to Users)
  - created_at

VocabItems
  - id
  - vocab_list_id (foreign key to VocabLists)
  - term
  - definition_en
  - definition_zh
  - example_sentence
  - part_of_speech
  - difficulty_rating

Tests
  - id
  - title
  - description
  - creator_id (foreign key to Users)
  - test_type (MCQ, matching, etc.)
  - settings (JSON)
  - created_at

TestItems
  - id
  - test_id (foreign key to Tests)
  - vocab_item_id (foreign key to VocabItems)
  - question
  - correct_answer
  - distractors (JSON array)
  - difficulty_rating

TestAttempts
  - id
  - user_id (foreign key to Users)
  - test_id (foreign key to Tests)
  - started_at
  - completed_at
  - score
  - analytics (JSON)

TestItemResponses
  - id
  - test_attempt_id (foreign key to TestAttempts)
  - test_item_id (foreign key to TestItems)
  - user_response
  - is_correct
  - response_time
  - confidence_level

AIAnalysisReports
  - id
  - user_id (foreign key to Users)
  - report_type
  - parameters (JSON)
  - results (JSON)
  - recommendations (JSON)
  - created_at
```

## Recommendations

### LLM Selection
For AI analysis components, GPT-4o-mini is recommended due to:
- Good balance of performance and cost
- Strong language understanding capabilities
- Reasonable inference speed

Alternatives:
- Claude Instant for potentially better reasoning
- Gemini Pro for good multilingual capabilities
- Llama 3 8B for self-hosting possibilities

### Testing Methodology
Recommended approaches:
1. **Spaced Repetition**: Schedule reviews at increasing intervals
2. **Retrieval Practice**: Emphasize active recall over passive recognition
3. **Interleaving**: Mix different types of problems
4. **Desirable Difficulty**: Calibrate difficulty to be challenging but achievable
5. **Metacognitive Assessment**: Have users rate their confidence in answers

### Data Privacy Considerations
1. Implement user consent for data collection
2. Store user data in compliance with GDPR standards
3. Anonymize data used for AI model training
4. Provide transparency about data usage
5. Allow users to delete their data
6. Encrypt sensitive information

## Development Roadmap

### Phase 1: Foundation (2-3 weeks)
- [x] Project setup with React, TypeScript, and Tailwind
- [ ] Create project structure
- [ ] Implement basic UI components
- [ ] Setup routing
- [ ] Configure Zustand state management
- [ ] Set up i18n infrastructure

### Phase 2: User Interface (3-4 weeks)
- [ ] Implement user registration/login screens
- [ ] Create user dashboard
- [ ] Design and implement test-taking interface
- [ ] Develop results visualization components
- [ ] Implement accessibility features
- [ ] Add Chinese and English translations

### Phase 3: Backend Integration (2-3 weeks)
- [ ] Design GraphQL schema
- [ ] Develop and implement GraphQL resolvers
- [ ] Set up Apollo Server
- [ ] Implement data storage and retrieval
- [ ] Set up user authentication flow
- [ ] Create test data management system

### Phase 4: AI Integration (3-4 weeks)
- [ ] Set up LangChain components
- [ ] Implement LangGraph agents
- [ ] Develop analysis algorithms
- [ ] Create recommendation system
- [ ] Build GraphQL endpoints for AI services

### Phase 5: Content Integration (2-3 weeks)
- [ ] Integrate with news sources via n8n
- [ ] Implement dictionary API connection
- [ ] Develop content management system
- [ ] Create test generation system

### Phase 6: Testing and Refinement (2-3 weeks)
- [ ] Implement Jest unit tests
- [ ] Create component tests with React Testing Library
- [ ] Develop end-to-end tests with Cypress
- [ ] Conduct accessibility testing
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Security hardening

### Phase 7: Launch Preparation (1-2 weeks)
- [ ] Documentation
- [ ] Vercel deployment setup
- [ ] Analytics integration
- [ ] Final testing

## Future Enhancements

- Additional language support
- Social learning features
- Gamification elements
- Advanced analytics dashboard
- Tutor/teacher role and management
- Integration with other learning platforms
- Mobile app versions
- Custom vocab list sharing
- Premium subscription features

## Monetization Strategy

- **Free Tier**: Basic vocabulary testing and tracking
- **Premium Features**:
  - Advanced AI analysis
  - Personalized learning paths
  - Unlimited tests
  - Progress reports
  - Priority support

---

Last updated: March 20, 2024 