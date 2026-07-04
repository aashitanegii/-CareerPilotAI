import { Award, BookOpen, Calculator, CheckCircle2, Copy, FileText, Search } from "lucide-react";
import { useState } from "react";

export default function DesignDoc() {
  const [copied, setCopied] = useState(false);

  const designDocText = `# CareerPilot AI: Agentic Architecture & Scoring Logic
Designed for the Google 5-Day AI Agents Intensive Capstone

## 1. Core Planning & Verification Workflow (6 Visible Steps)
CareerPilot AI implements an explicit, multi-stage agent orchestration flow, displaying every step of its execution live to the user to make the reasoning process transparent and demonstrable of "system-level thinking":

1. **Researching role requirements (Decomposition):** 
Decomposes the career goal into 3-5 grounded sub-questions: (1) required skills/prerequisites, (2) typical interview funnels, (3) in-demand tools/certs, and (4) entry paths.
2. **Finding industry-current skills (Grounding):** 
Launches Google Search queries in real-time to retrieve up-to-date 2026 hiring metrics, preventing raw model hallucination.
3. **Analyzing student profile (Alignment):** 
Intakes 2-3 tailored reflection questions answered by the student, comparing state metrics with search summaries.
4. **Calculating readiness score (Evaluation):** 
Implements a strict, mathematical weighted assessment formula to quantify baseline readiness.
5. **Building roadmap (Action Planning):** 
Generates a phased 30-day chronological action schedule (Foundation -> Core -> Projects -> Applications) focusing on identified gaps in order of importance.
6. **Evaluating recommendations (Self-Check Pass):** 
Executes an automated self-check to verify correctness, workload distribution feasibility, and 2026 resource relevance.

## 2. Scoring Logic Detail (Mathematical and Explainable)
The assessment uses a transparent, tiered weighted calculation based on skill categorizations extracted from the research step:
- **Foundational Skills (Weight: 50%):** Immediate prerequisites (e.g., basic programming, general system logic). 
- **Core Skills (Weight: 35%):** Domain-specific tools, libraries, and frameworks.
- **Advanced Skills (Weight: 15%):** Niche system optimizations, architectural designs, and specialized platforms.

### Score Formula:
Score = (Foundational_Matched / Foundational_Total * 50) 
        + (Core_Matched / Core_Total * 35) 
        + (Advanced_Matched / Advanced_Total * 15)

*Value Proposition: Foundational skills are critical blockers for intermediate acquisition, whereas advanced skills establish the technical polish that secures high-end employment.*

## 3. Self-Evaluation Framework Verification Pass
To comply with robust evaluation guidelines, the agent executes an internal checking step. It evaluates its own plan against the student's constraints (e.g., allocated weekly study hours) and maps chronological paths to guarantee no dependencies are violated (e.g., studying machine learning libraries prior to writing basic Python).
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(designDocText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Instructor Writeup & Design Doc
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Copy this prepared documentation directly for your Google Capstone & Kaggle submission.
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Markdown
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <h4 className="text-xs font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            Grounded Research
          </h4>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Uses live Google Search grounding to extract up-to-date 2026 hiring demands, preventing stale model memory.
          </p>
        </div>

        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <h4 className="text-xs font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            Weighted Logic
          </h4>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Assigns 50% score weight to Foundations, 35% to Core skills, and 15% to Advanced specialized tooling.
          </p>
        </div>

        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <h4 className="text-xs font-bold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Self Check Pass
          </h4>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Re-evaluates workload and sequencing feasibility prior to generating output to guarantee the study plan is active.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 select-all scrollbar-thin">
        {designDocText}
      </div>
    </div>
  );
}
