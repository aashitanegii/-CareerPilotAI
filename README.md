# CareerPilot AI: Research-Powered Career Roadmap Agent

CareerPilot AI is a production-grade, full-stack AI Career Copilot and Learning Roadmap Agent. Developed as a Capstone Project for the **Google 5-Day AI Agents Intensive**, the platform equips students and aspiring engineers with a highly transparent, grounded, and personalized trajectory toward their career dreams.

Rather than relying on generic, stale pre-trained model memories, CareerPilot AI uses **live Google Search grounding** to retrieve exact Late 2026 hiring demands. It executes a visible multi-step reasoning workflow, performs mathematical skill alignment mapping, compiles tailored course/credential pathways, and runs an internal self-evaluation validation pass to ensure feasibility before presenting results.

---

## 🗺️ Agentic System Architecture

Below is the structured data and reasoning flow illustrating the career pipeline, detailing how input goal validation connects to the 2026 Google Search grounding engine, local knowledge caching, and multi-stage execution.

```text
       +-------------------------------------------------------------+
       |                  Student Input (Career Goal)                |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |              Step 1: Goal Validation & Ambiguity            |
       |  (Gemini-3.5-Flash check, rejects vague input, suggests refs) |
       +------------------------------+------------------------------+
                                      | (Valid Specific Goal)
                                      v
       +-------------------------------------------------------------+
       |                 Dynamic Student Intake Form                 |
       |     (Dynamic reflection questions based on target role)     |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |             Step 2: Industry Requirements Search            |
       |                                                             |
       |   +------------------+             +--------------------+   |
       |   |  Local Knowledge |---[Hit?]--->| Read Cache (<30d)  |   |
       |   |  Cache (JSON)    |             +--------------------+   |
       |   +------------------+                       |              |
       |            |                                 |              |
       |         [Miss]                               |              |
       |            v                                 |              |
       |   +------------------+                       |              |
       |   |  Google Search   |                       |              |
       |   |  Grounding Tool  |                       v              |
       |   +------------------+             +--------------------+   |
       |            |                       |   Structure JSON   |   |
       |            +---------------------->|   Formatting       |   |
       |                                    +--------------------+   |
       +----------------------------------------------+--------------+
                                                      |
                                                      v
       +-------------------------------------------------------------+
       |             Step 3: Background Alignment Mapping             |
       | (Synthesizes intake answers with extracted required skills) |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |               Step 4: Mathematical Evaluation               |
       |   (Transparent weighted score: 50% Foundations, 35% Core,   |
       |             15% Advanced Tools & Frameworks)                |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                 Step 5: Learning Roadmap                    |
       |      (Grounded Course recommendations & 30-Day Timeline)     |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                Step 6: Self-Evaluation Pass                 |
       |  (Verifies workload feasibility, sequencing, tech currency) |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |                Streaming Output (SSE) & UI                  |
       |  (Renders interactive graphs, projects, calendars, logs)    |
       +-------------------------------------------------------------+
```

---

## 🚀 Core Agentic Principles (ADK Inspired)

CareerPilot AI explicitly demonstrates state-of-the-art Agent Design patterns (ADK) taught in Google’s developer curricula:

1. **Separation of Concerns (Multi-Stage Reasoning)**: Rather than trying to validate, search, score, roadmap, and evaluate in a single complex LLM invocation, the system breaks reasoning down into six distinct step functions. This reduces error propagation and maximizes response accuracy.
2. **Deterministic-Probabilistic Hybrid Logic**: The readiness score is not a randomly generated "black-box" AI score. It uses a **deterministic mathematical formula** mapping the model's factual skill-gap matches into a 50/35/15 weight system.
3. **Double-Turn Structured Search**: Gemini 3 series models support Google Search grounding. However, combining Search with rigid JSON output schemas can crash typical single-stage pipelines. CareerPilot solves this by utilizing a robust **two-stage search block**: first extracting search content freely, then formatting the raw data into strict JSON structures.
4. **Self-Correction (Self-Check Pass)**: Before emitting the roadmap, the agent runs a dedicated self-evaluation stage, comparing weekly milestone study densities against the hours the student committed during intake, verifying logical sequencing, and certifying technical currency.

---

## 📡 Live Google Search Grounding & Citations

To bypass the typical "knowledge cutoff" and LLM hallucination limits, Step 2 implements live Google Search query execution. CareerPilot formulates multi-aspect queries for target roles, retrieves late-2026 hiring demands, and exposes **interactive web citations** directly in the user interface. This ensures that recommended tools, courses, and certifications represent actual, current market dynamics.

---

## 💾 Cache Reuse & Session Persistence

To minimize latency and optimize API quota use:
- **Knowledge Cache (`career_knowledge_base.json`)**: Whenever a role's skills and certifications are compiled via Google Search, they are stored with a timestamp. If another student searches for a similar role within 30 days, the agent reuses the cached profile, serving it instantly while preserving grounding citations.
- **Student Profile Store (`sessions.json`)**: To skip tedious authentication setups, students save and load historical roadmaps using an ephemeral identifier (e.g., Name or Email). The sessions are saved directly to server disk space for instant retrieval.

---

## 🔒 Security Validation & Guardrails

1. **Prompt Injection Shielding**: Step 1 validates career goals through an Express-side length limit and an AI-level sanitization layer, rejecting goals containing command hacks (e.g., "Ignore previous instructions") and suggesting valid paths.
2. **Strict Schema Constraints**: Every stage of the model pipeline uses `@google/genai` strict `responseSchema` with JSON configuration, preventing raw Markdown code blocks and enforcing structural integrity.
3. **Lazy SDK Initialization**: The Gemini client is initialized on demand, preventing application startup failures if environment secrets are temporarily missing.
4. **Fallback Recovery**: Malformed streaming fragments or parse failures are captured silently within try-catch gates, falling back to cached or default structures instead of crashing the UI stream.

---

## 💡 Why These Recommendations?

The suggestions outputted on the roadmap are checked against five strict parameters displayed transparently in the UI:
- **Industry-Current**: Mapped to active Late 2026 index requisites.
- **Stated Background**: Aligned with the specific skills the student claimed.
- **Study Hour Match**: Feasibility verified against weekly hour constraints.
- **Foundational Priority**: Hard-coded to sequence prerequisite core theories before starting hands-on portfolio projects.

---

## ⚠️ Known Limitations

- **Ephemeral File Storage**: Since session data and the knowledge base are stored on local JSON files, they will clear if the host container scales down or restarts. For production, this is easily swappable with Firebase Firestore or Cloud SQL.
- **Search API Rate Limits**: Active Google Search grounding relies on prompt-based tool allocations. Under heavy concurrent load, request speed might degrade slightly.
- **Simulation of Dates**: All citations and trends are targeted to "Late 2026" trends using active search index filters.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js (v18 or higher)
- Gemini API Key (configured in the Secrets panel or `.env`)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Provide your `GEMINI_API_KEY` inside `.env`.

3. Boot the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the live app.

### Building for Production

Compile both the React assets and the Express server:
```bash
npm run build
```
The compiled output is bundled cleanly inside `/dist`. Start the production instance:
```bash
npm run start
```
