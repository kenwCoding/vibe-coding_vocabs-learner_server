# VocabMaster: AI-Powered Vocabulary Learning Platform

An intelligent platform for enhancing vocabulary learning through adaptive tests, performance tracking, and AI-driven analysis.

## Features

- 🧠 Customized vocabulary tests (MCQ, matching, fill-in-blanks)
- 📊 Test history and performance tracking
- 🤖 AI-powered performance analysis reports
- 📈 User ability estimation and learning path recommendations
- ⚡️ Adaptive testing that adjusts to user skill level
- 🔄 Real-time feedback and improvement suggestions
- 🌐 Full internationalization support (Chinese and English)
- ♿ Accessible design for all users

## Live Demo

🚀 **Check out the live application**: [VocabMaster on Vercel](https://vibe-coding-vocabs-learner.vercel.app/)

Experience the latest version of VocabMaster in action! The demo showcases the current UI components, authentication flow, and dashboard features.

## Tech Stack

- **Frontend**: 
  - ReactJS with React Router for navigation
  - Zustand for state management
  - i18next for internationalization
- **Backend**:
  - GraphQL API
  - Apollo Server
- **Styling**: TailwindCSS for responsive design
- **AI Integration**: 
  - LangChain for building AI workflow components
  - LangGraph for creating dynamic agent-based systems
- **Testing**:
  - Jest and React Testing Library
  - Cypress for end-to-end testing
- **Development**:
  - TypeScript for type safety
  - Vite for fast development and bundling

## System Architecture

```mermaid
graph TD
    subgraph "Frontend - Vercel"
        UI[React UI]
        RM[Route Management]
        ZUS[Zustand State Management]
        I18N[i18next Translation]
    end
    
    subgraph "Backend Services"
        GQL[GraphQL API]
        APL[Apollo Server]
        AUTH[Authentication Service]
        TS[Test Service]
        US[User Service]
        VS[Vocabulary Service]
    end
    
    subgraph "AI Processing Layer"
        AI[AI Analysis Engine]
        LCH[LangChain Components]
        LG[LangGraph Agents]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        CACHE[(Redis Cache)]
    end
    
    subgraph "Content Sources"
        NEWS[News Integration]
        DICT[Dictionary API]
    end
    
    UI --> RM
    UI --> I18N
    RM --> ZUS
    ZUS --> GQL
    
    GQL --> APL
    APL --> AUTH
    APL --> TS
    APL --> US
    APL --> VS
    APL --> AI
    
    AI --> LCH
    AI --> LG
    LCH --> DB
    LG --> DB
    
    TS --> DB
    US --> DB
    VS --> DB
    
    AUTH --> CACHE
    VS --> NEWS
    VS --> DICT
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Yarn or npm for package management

### Installation

Install the dependencies:

```bash
npm install
# or
yarn
```

### Development

Start the development server with HMR:

```bash
npm run dev
# or
yarn dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
# or
yarn build
```

## Deployment

This application is deployed using Vercel for the frontend. The backend services will be developed separately.

---

Built with ❤️ by VocabMaster Team
# vibe-coding_vocabs-learner_server
