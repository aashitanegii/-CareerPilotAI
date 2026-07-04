<p align="center">
  <img src="https://raw.githubusercontent.com/ashnegi2222/CareerPilot-AI/main/assets/careerpilot_ai_banner.png" alt="CareerPilot AI Banner" width="100%" style="border-radius: 8px;" />
</p>

<h1 align="center">🚀 CareerPilot AI</h1>

<p align="center">
  <strong>An Agentic Career Intelligence & Learning Roadmap System powered by Gemini AI and Live Google Search Grounding.</strong>
</p>

<p align="center">
  <a href="https://github.com/ashnegi2222/CareerPilot-AI/actions"><img src="https://img.shields.io/github/actions/workflow/status/ashnegi2222/CareerPilot-AI/ci.yml?branch=main&style=flat-square&logo=github" alt="Build Status" /></a>
  <a href="https://github.com/ashnegi2222/CareerPilot-AI/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ashnegi2222/CareerPilot-AI?style=flat-square&logo=opensourceinitiative&logoColor=white&color=blue" alt="License" /></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/Gemini_API-3.5_Flash-orange?style=flat-square&logo=google&logoColor=white" alt="Gemini API" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express" /></a>
</p>

---

## 📖 Table of Contents

- [🛑 Problem Statement](#-problem-statement)
- [🤖 Why AI Agents?](#-why-ai-agents)
- [✨ Key Features](#-key-features)
- [🧭 Overall Architecture](#-overall-architecture)
- [⚙️ Agentic Workflow](#%EF%B8%8F-agentic-workflow)
- [📊 System Data Flow](#-system-data-flow)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [💾 Grounded Knowledge Cache](#-grounded-knowledge-cache)
- [🎯 Weighted Readiness Score Formula](#-weighted-readiness-score-formula)
- [🔒 Security & Guardrails](#-security--guardrails)
- [🔮 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [✍️ Author](#%EF%B8%8F-author)

---

## 🛑 Problem Statement

Aspiring software engineers, students, and career changers face a daunting barrier: **rapidly shifting hiring landscapes.** Conventional career guidance is static, generic, and quickly becomes obsolete. Online learning paths recommend outdated frameworks, fail to evaluate a candidate's background honestly, and do not factor in personal logistical constraints like weekly study hour budgets. This results in wasted study hours, misalignment with current hiring requirements, and severe imposter syndrome.

---

## 🤖 Why AI Agents?

Traditional single-prompt LLM interactions fail to deliver reliable, structured, and factually accurate roadmap recommendations. They suffer from:
1. **Knowledge Cutoffs**: Inability to recognize late-breaking industry demands (e.g. late 2026 stack shifting).
2. **Hallucinated Resources**: Inventing non-existent Udemy courses or Coursera specializations.
3. **Black-box Scoring**: Randomly assigning a "9/10 readiness match" without mathematical explanation.

**CareerPilot AI** addresses this by transitioning the career advising experience into a **multi-stage agentic system**. By dividing the reasoning pipeline into modular, validated stages (Decomposition, Grounded Search, Intake Alignment, Mathematical scoring, Roadmap compilation, and Constraint Self-Check), the system minimizes error propagation, enforces rigid schemas, guarantees real-world citation grounding, and delivers an exceptionally structured blueprint.

---

## ✨ Key Features

- **🔍 Adaptive Ambiguity & Goal Check**: Evaluates user career goals with a gatekeeping model; vague suggestions are intercepted with helpful clarifications and recommendations for concrete alternative roles.
- **📋 Dynamic Background Intake**: Dynamically generates tailored assessment questions based on the selected career track, mapping out existing skillsets and hours available for study.
- **📡 Active Google Search Grounding**: Formulates multi-aspect research queries and uses live Google Search to pull verified Late 2026 hiring metrics, complete with interactive source citations.
- **🧠 Zero-Latency Knowledge Cache**: Stores freshly researched roles in a local knowledge base (`career_knowledge_base.json`). Hits within 30 days bypass rate-limited live searches, keeping responses snappy.
- **🔢 50/35/15 Weighted Scoring**: Evaluates current student readiness using a transparent mathematical formula: **50% Foundational**, **35% Core specific**, and **15% Advanced tools**.
- **📅 30-Day Phased Roadmap**: Compiles a highly detailed timeline split into 4 logical phases, custom-fitted with hands-on portfolio projects and actionable milestones.
- **🛡️ Agentic Self-Evaluation Pass**: Runs a final validation check on its own output, verifying that the milestone workload is reasonable for the user's weekly study budget and certifying that suggested technologies are modern.
- **📡 Server-Sent Events (SSE)**: Streams agent reasoning progress to the client in real-time, displaying status, diagnostic log details, and final payloads.
- **💾 Profile Session Persistence**: Saves and restores historical student profile roadmaps through local file persistence using custom login identifiers.

---

## 🧭 Overall Architecture

The diagram below details how the multi-layered agent components interact to validate, research, score, and evaluate a student's career trajectory.

```mermaid
graph TD
    User([User Client]) -->|1. Submit Goal| GoalValidator[Goal Validator & Ambiguity Checker]
    GoalValidator -->|Rejects Vague| Clarify[Clarification Prompt & Suggestions]
    Clarify --> User
    GoalValidator -->|Approves Specific| RoleNormalizer[Role Normalizer]
    RoleNormalizer -->|Generates Normalized Key| KB[Knowledge Cache Check]
    
    KB -->|Cache Hit <30 Days| Scorer[Background Analyzer & Scorer]
    KB -->|Cache Miss| GoogleSearch[Google Search Grounding Engine]
    GoogleSearch -->|Retrieves Late 2026 Hiring Data| KBUpdate[Update Knowledge Cache]
    KBUpdate --> KB
    
    User -->|2. Answer Reflection Intake| BackgroundIntake[Student Intake Store]
    BackgroundIntake --> BackgroundAnalyzer[Background Analyzer]
    KB -->|Supplies Required Role Skills| BackgroundAnalyzer
    
    BackgroundAnalyzer --> Scorer
    Scorer -->|Calculates Weighted Score| RoadmapGen[Roadmap & Milestone Generator]
    RoadmapGen -->|Drafts 30-Day Blueprint & Projects| Evaluation[Self-Evaluation & Currency Check]
    Evaluation -->|Validates Feasibility| SSEStream[Server-Sent Events SSE Stream]
    SSEStream -->|Presents Active Dashboard| Frontend[Interactive React UI]
    Frontend -->|Saves Profile| SessionStore[Session Store / Local disk json]
    SessionStore -->|Restores Profile| Frontend
```

---

## ⚙️ Agentic Workflow

Each invocation of the analysis engine executes a sequential **6-Step Reasoning Pipeline**, streaming the intermediate thought logs directly to the user's browser.

```mermaid
stateDiagram-v2
    [*] --> GoalDecomposition : Step 1: Decompose Goal into 5 Sub-Queries
    GoalDecomposition --> CacheCheck : Step 2: Check Knowledge Base Cache
    
    state CacheCheck {
        [*] --> CheckKB
        CheckKB --> ServeCached : Hit (<30 days)
        CheckKB --> RunGoogleSearch : Miss
        RunGoogleSearch --> StructureJSON : Formulate Query & Search Grounding
        StructureJSON --> UpdateKB : Strict Response Schema Parse
        UpdateKB --> ServeCached
    }
    
    CacheCheck --> AlignmentMapping : Step 3: Align Student Background Intake
    AlignmentMapping --> ReadinessScoring : Step 4: Compute Mathematical Score
    note right of ReadinessScoring
      Foundational: 50%
      Core Specific: 35%
      Advanced Tools: 15%
    end note
    
    ReadinessScoring --> RoadmapConstruction : Step 5: Draft 30-Day Phased Plan
    RoadmapConstruction --> SelfEvaluation : Step 6: Self-Correction Validation
    
    state SelfEvaluation {
        [*] --> FeasibilityCheck : Compare hours vs milestones
        FeasibilityCheck --> CurrencyCheck : Certify Late 2026 tools
        CurrencyCheck --> Feasible : Passed
        Feasible --> [*]
    }
    
    SelfEvaluation --> StreamingOutput : Emit via SSE
    StreamingOutput --> [*]
```

---

## 📊 System Data Flow

Data flows seamlessly through structured schemas and strict JSON interfaces from raw user input to the final rich React state tree.

```mermaid
graph LR
    subgraph Client State
        A[User Goal String] -->|POST /api/generate-intake| B[Intake Engine]
        B -->|JSON: Question Schema| C[Dynamic Intake Form]
        C -->|POST /api/analyze-career| D[SSE Stream Engine]
    end
    
    subgraph Server Processing [Express Backend]
        D -->|1. Decompose| E[Query Array]
        D -->|2. Search / Cache| F[Role Data JSON]
        D -->|3. Align Answers| G[Aligned Skills Array]
        D -->|4. Score Formulas| H[Readiness Score Breakdown]
        D -->|5. Sourcing| I[Resources & Projects]
        D -->|6. Self-Check| J[Validation Feedback]
        
        E & F & G & H & I & J -->|Assemble| K[AnalysisResult Package]
    end
    
    subgraph Response Flow
        K -->|Server Sent Events Stream| L[JSON-Lines Chunk Stream]
        L -->|Incremental State Feed| M[React State Reducer]
        M -->|Interactive Graph & Gantt| N[Polished Interface]
    end
```

---

## 🛠️ Tech Stack

| Technology | Category | Role in Architecture |
| :--- | :--- | :--- |
| **Gemini 3.5 Flash** | AI Engine | Powers multi-stage logical evaluations, formatting, and analysis. |
| **Google Search Grounding** | Grounding Tool | Connects model reasoning to live web content for late-2026 demand data. |
| **React 19** | Frontend Framework | Renders dynamic dashboards, cards, and state tracking. |
| **TypeScript** | Language | Enforces strict, compile-time type safety across frontend and backend. |
| **Tailwind CSS v4** | Styling | Delivers an immersive, sleek cosmic slate interface design. |
| **Express / Node.js** | Server Platform | Powers API routing, caching systems, and streaming mechanisms. |
| **Server-Sent Events** | Stream Protocol | Delivers logs and results incrementally to prevent browser timeouts. |
| **JSON Cache** | Data Store | Implements zero-dependency file-based cache systems. |
| **Cloud Run** | Deployment | Serves the containerized system with scale-to-zero capabilities. |

---

## 📂 Project Structure

```text
├── assets/                       # Static public assets and banners
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Navigation and profile loading controls
│   │   └── CareerRoadmap.tsx     # The primary dashboard visualizer (Score, timeline, checklists)
│   ├── App.tsx                   # Main React entry point & SSE controller
│   ├── index.css                 # Global styles and Tailwind configuration
│   ├── main.tsx                  # Vite browser bootstrap
│   └── types.ts                  # Shared compile-time TypeScript interface definitions
├── server.ts                     # Full-stack Express server (Gemini API pipeline and SSE)
├── career_knowledge_base.json    # Local JSON database for role search cache
├── sessions.json                 # Local JSON database for profile persistence
├── .env.example                  # Environment template
├── tsconfig.json                 # TS Compiler rules
├── package.json                  # Dependencies and execution scripts
└── README.md                     # Documentation
```

---

## 🚀 Quick Start & Installation

### Prerequisites
Ensure you have the following installed locally:
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)

### Setup & Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ashnegi2222/CareerPilot-AI.git
   cd CareerPilot-AI
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory by copying the template:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure your **Gemini API Key**:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyGoesHere...
   ```

4. **Boot Local Server:**
   ```bash
   npm run dev
   ```
   The development server will mount. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   To compile and package the app for deployment (bundling Express and React):
   ```bash
   npm run build
   npm run start
   ```

---

## 💾 Grounded Knowledge Cache

To prevent rate limits and speed up user interactions, CareerPilot AI implements a smart caching layer in `server.ts`. 

Whenever a career goal is submitted, the role is normalized (e.g. "Full Stack Dev" resolves to `full-stack-developer`). The system checks `career_knowledge_base.json` first:
- **Hit (< 30 days old)**: Instantly loads the cached profile.
- **Miss (or > 30 days old)**: Triggers the live Google Search grounding engine, formats the response with strict schemas, and updates the local database.

This strategy ensures high-fidelity career data with incredibly low response times!

---

## 🎯 Weighted Readiness Score Formula

Our dynamic readiness score is calculated using a robust, deterministic mathematical formula mapping raw background answers to extracted industry metrics:

$$\text{Readiness Score} = \left( \frac{F_{\text{matched}}}{F_{\text{total}}} \times 50 \right) + \left( \frac{C_{\text{matched}}}{C_{\text{total}}} \times 35 \right) + \left( \frac{A_{\text{matched}}}{A_{\text{total}}} \times 15 \right)$$

Where:
* $F$ = Foundational Skills (50% weight). Prerequisite languages and core computer science fundamentals.
* $C$ = Core Professional Skills (35% weight). Target frameworks, libraries, and active standards.
* $A$ = Advanced Specialized Skills (15% weight). Niche architectural topics, scaling, and systems design.

As students check off missing skills on their interactive roadmap, the score recalculates in **real-time** on the frontend, visually charting their progress toward employment!

---

## 🔒 Security & Guardrails

- **🛡️ Prompt Injection Shielding**: All inputs undergo length constraints and a sanitization check at Step 1, rejecting hijacking commands.
- **🛡️ Structural JSON Schemas**: Every Gemini call uses `@google/genai`'s `responseSchema` to completely block malformed Markdown outputs.
- **🛡️ Lazy SDK Instantiation**: The Google Gen AI SDK is initialized on demand, ensuring that missing server-side keys don't crash container builds on startup.
- **🛡️ Try-Catch Fallbacks**: Parsing issues or streaming blockages fail gracefully, falling back to high-fidelity local templates rather than disrupting user sessions.

---

## 🔮 Future Enhancements

- [ ] **Firestore Database Integration**: Upgrade the local JSON store to durable cloud persistence for multi-device login sessions.
- [ ] **Google Calendar API sync**: Auto-export weekly study milestones to the user's real Google Calendar.
- [ ] **Interactive Code Playgrounds**: Embed interactive coding playgrounds directly inside Phase 1 foundational checklist cards.
- [ ] **Continuous PDF Resume Export**: Offer dynamic resume compilation matching updated roadmap readiness profiles.

---

## 🤝 Contributing

Contributions are highly valued! Please help make CareerPilot AI even better:
1. Fork the Repository.
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

---

## ✍️ Author

**Ash Negi**
- Email: [ashnegi2222@gmail.com](mailto:ashnegi2222@gmail.com)
- GitHub: [@ashnegi2222](https://github.com/ashnegi2222)
- Devapp Link: [Live App Preview](https://ais-dev-o4kuzntbf54aflixzvu3z4-910967307641.asia-east1.run.app)
