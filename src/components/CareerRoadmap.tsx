import React from "react";
import {
  Compass,
  GraduationCap,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  Copy,
  FileText,
  Search,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Play,
  Check,
  ExternalLink,
  Briefcase,
  Calendar,
  Code,
  ShieldCheck,
  Target,
  CheckSquare
} from "lucide-react";
import { AnalysisResult } from "../types";

interface CareerRoadmapProps {
  analysisResult: AnalysisResult;
  sessionKey: string;
  handleReset: () => void;
  completedSkills: Record<string, boolean>;
  setCompletedSkills: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  completedTasks: Record<string, boolean>;
  setCompletedTasks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  completedReadiness: Record<string, boolean>;
  setCompletedReadiness: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function CareerRoadmap({
  analysisResult,
  sessionKey,
  handleReset,
  completedSkills,
  setCompletedSkills,
  completedTasks,
  setCompletedTasks,
  completedReadiness,
  setCompletedReadiness
}: CareerRoadmapProps) {
  
  // Destructure database/analysis metrics
  const { skills, weeklyPlan, projects, scoreBreakdown, selfEvaluation, groundingLinks } = analysisResult;

  // 1. Calculate REAL-TIME DYNAMIC READY INDEX based on ticked-off skill gaps
  const fTotal = skills.filter(s => s.category === "foundational").length;
  const fMatchedOriginal = skills.filter(s => s.category === "foundational" && s.matched).length;
  const fTicked = skills.filter(s => s.category === "foundational" && !s.matched && completedSkills[s.name]).length;
  const fMatched = fMatchedOriginal + fTicked;

  const cTotal = skills.filter(s => s.category === "core").length;
  const cMatchedOriginal = skills.filter(s => s.category === "core" && s.matched).length;
  const cTicked = skills.filter(s => s.category === "core" && !s.matched && completedSkills[s.name]).length;
  const cMatched = cMatchedOriginal + cTicked;

  const aTotal = skills.filter(s => s.category === "advanced").length;
  const aMatchedOriginal = skills.filter(s => s.category === "advanced" && s.matched).length;
  const aTicked = skills.filter(s => s.category === "advanced" && !s.matched && completedSkills[s.name]).length;
  const aMatched = aMatchedOriginal + aTicked;

  const fWeight = fTotal > 0 ? (fMatched / fTotal) * 50 : 50;
  const cWeight = cTotal > 0 ? (cMatched / cTotal) * 35 : 35;
  const aWeight = aTotal > 0 ? (aMatched / aTotal) * 15 : 15;
  
  const dynamicScore = Math.min(100, Math.round(fWeight + cWeight + aWeight));
  const totalSkillsAcquired = skills.filter(s => s.matched || completedSkills[s.name]).length;

  // Helpers to toggle checklist items
  const toggleSkill = (skillName: string) => {
    setCompletedSkills(prev => ({
      ...prev,
      [skillName]: !prev[skillName]
    }));
  };

  const toggleTask = (taskName: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskName]: !prev[taskName]
    }));
  };

  const toggleReadiness = (readinessKey: string) => {
    setCompletedReadiness(prev => ({
      ...prev,
      [readinessKey]: !prev[readinessKey]
    }));
  };

  // Circular stroke offset computation
  const getStrokeDashOffset = (val: number) => {
    const circumference = 364; // 2 * pi * r (where r is 58)
    const percentage = val / 100;
    return circumference - percentage * circumference;
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* 🎯 HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 to-sky-500" />
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-extrabold uppercase tracking-widest">
            <Target className="w-4.5 h-4.5 text-indigo-500" />
            <span>AI Career Mentor Playbook</span>
          </div>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-tight">
            {analysisResult.goal}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
            {analysisResult.briefSummary}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs flex flex-col justify-center min-w-[160px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Student Profile</span>
            <strong className="text-slate-800 truncate text-[11px] font-bold">{sessionKey || "Unsaved Local Profile"}</strong>
          </div>

          <button
            onClick={handleReset}
            className="px-5 py-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Alignment Session
          </button>
        </div>
      </div>

      {/* TWO-COLUMN DASHBOARD */}
      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: 📊 CAREER READINESS SCORE DIAL */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-md relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
            <Award className="w-24 h-24 text-slate-950" />
          </div>
          
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
            Live Readiness Score Card
          </h3>

          <div className="relative flex items-center justify-center mb-4">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke="rgba(241, 245, 249, 1)"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                stroke="url(#score-gradient)"
                strokeWidth="9"
                fill="transparent"
                strokeDasharray="364"
                strokeDashoffset={getStrokeDashOffset(dynamicScore)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
                {dynamicScore}
              </span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">
                Ready Index
              </span>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-600 mb-4">
            Acquired {totalSkillsAcquired} of {skills.length} Required Skills
          </p>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {dynamicScore >= 80
                ? "Enterprise Ready"
                : dynamicScore >= 50
                ? "Core Competency Achieved"
                : "Needs Targeted Syllabus"}
            </span>
          </div>

          {/* Weighted Real-Time Formula breakdown */}
          <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left mt-3 space-y-2.5 text-[10.5px] font-medium text-slate-500">
            <div className="flex justify-between">
              <span>Foundations matched:</span>
              <strong className="text-slate-800 font-bold">{fMatched}/{fTotal} <span className="text-[9px] text-slate-400">(Weight 50%)</span></strong>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fTotal > 0 ? (fMatched/fTotal)*100 : 100}%` }} />
            </div>

            <div className="flex justify-between">
              <span>Core Specific matched:</span>
              <strong className="text-slate-800 font-bold">{cMatched}/{cTotal} <span className="text-[9px] text-slate-400">(Weight 35%)</span></strong>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cTotal > 0 ? (cMatched/cTotal)*100 : 100}%` }} />
            </div>

            <div className="flex justify-between">
              <span>Advanced Specialized:</span>
              <strong className="text-slate-800 font-bold">{aMatched}/{aTotal} <span className="text-[9px] text-slate-400">(Weight 15%)</span></strong>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${aTotal > 0 ? (aMatched/aTotal)*100 : 100}%` }} />
            </div>
          </div>

          <div className="w-full text-center mt-4 text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-3">
            Score recalculates automatically as you check off skill gaps below!
          </div>
        </div>

        {/* RIGHT COLUMN: 🔥 SKILLS TO ACQUIRE (INTERACTIVE CHECKLIST) */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6 h-full">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Skills Calibration & Gap Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Interactive gap mapping. Check off technologies as you learn them to update your readiness score in real time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-1">
            
            {/* COLUMN A: Acquired Strengths */}
            <div className="space-y-3.5">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                Your Strengths ({skills.filter(s => s.matched).length})
              </p>
              
              <div className="space-y-2">
                {skills.filter(s => s.matched).length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                    No matching foundational baselines detected. Target all gaps below.
                  </p>
                ) : (
                  skills.filter(s => s.matched).map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl">
                      <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate leading-tight">{skill.name}</span>
                        <span className="text-[8px] text-emerald-600 font-extrabold uppercase tracking-wider">{skill.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN B: Skills to Acquire (Checkable!) */}
            <div className="space-y-3.5">
              <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <AlertCircle className="w-4 h-4 text-indigo-500" />
                Skills to Acquire ({skills.filter(s => !s.matched).length})
              </p>

              <div className="space-y-2">
                {skills.filter(s => !s.matched).length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                    Congratulations! All recommended skills are matched!
                  </p>
                ) : (
                  skills.filter(s => !s.matched).map((skill, idx) => {
                    const isCompleted = !!completedSkills[skill.name];
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleSkill(skill.name)}
                        className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-indigo-50/60 border-indigo-200 shadow-sm"
                            : "bg-slate-50/50 hover:bg-slate-50 border-slate-150 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border transition-all ${
                          isCompleted
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-300 text-transparent"
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div className="truncate">
                          <span className={`text-xs font-bold block truncate leading-tight transition-all ${isCompleted ? "text-indigo-900 line-through opacity-75" : "text-slate-800"}`}>
                            {skill.name}
                          </span>
                          <span className="text-[8px] text-slate-455 uppercase tracking-wider font-extrabold text-slate-500">
                            {skill.category}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Self evaluation review check */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
              <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">Self-Evaluation Integrity Pass</span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed font-medium">
              <strong>Rigorous Verification:</strong> {selfEvaluation.notes}
            </p>
            <p className="text-[10px] text-indigo-700 font-bold border-t border-indigo-100/50 pt-2 flex items-center gap-1">
              ✓ Grounding assurance: {selfEvaluation.currencyAssurance}
            </p>
          </div>
        </div>

      </div>

      {/* 📅 SECTION 4: 30-DAY CHRONOLOGICAL MILESTONE ROADMAP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Intense Training Timeline</span>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            Chronological 30-Day Action Calendar
          </h3>
          <p className="text-xs text-slate-500">
            Tackle these weekly focus items and check off action tasks to keep your physical study streak high.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {weeklyPlan.map((week, wIdx) => {
            // Provide a deliverable mock title corresponding to real projects
            const deliverableName = 
              wIdx === 0 ? "Environment Init Repo" :
              wIdx === 1 ? "REST Controller Engine" :
              wIdx === 2 ? "High-Speed Microservice Codebase" :
              "Deployed Web Portal & Actions Repo";

            return (
              <div key={wIdx} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[10px] text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-150 uppercase tracking-widest">
                      {week.week}
                    </span>
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 leading-snug">
                    Focus: {week.focus}
                  </h4>
                </div>

                {/* Weekly Tasks list (Checkable!) */}
                <div className="space-y-2 pt-3 border-t border-slate-200 flex-1">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Study Action Checklist:</span>
                  <div className="space-y-2">
                    {week.tasks.slice(0, 4).map((task, tIdx) => {
                      const isTaskChecked = !!completedTasks[task];
                      return (
                        <button
                          key={tIdx}
                          onClick={() => toggleTask(task)}
                          className="w-full text-left flex items-start gap-2 text-[11px] font-medium leading-relaxed group cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border transition-all ${
                            isTaskChecked 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "bg-white border-slate-300 text-transparent"
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className={`transition-all leading-snug ${isTaskChecked ? "text-slate-400 line-through" : "text-slate-600 group-hover:text-slate-900"}`}>
                            {task}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* REQUIRED WEEKLY EXIT DELIVERABLE */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-1">
                  <span className="text-[8px] font-black uppercase text-indigo-600 tracking-widest block">Exit Deliverable</span>
                  <span className="text-[10px] font-bold text-slate-800 block truncate leading-tight">
                    {deliverableName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🗓️ SECTION 5: MULTI-HORIZON CAREER ROADMAP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Long-Term Strategy</span>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            Three horizons to guarantee role hire
          </h3>
          <p className="text-xs text-slate-500">
            A healthy progression path designed to sequence your study efforts from foundational levels directly into interview practice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Horizon 1 */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/70 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider bg-indigo-100/60 border border-indigo-150 px-2.5 py-0.5 rounded-full">
                Horizon 1: Next 30 Days
              </span>
              <span className="text-xs font-black text-indigo-600">
                {Math.min(100, Math.round(fTotal > 0 ? (fMatched / fTotal) * 100 : 100))}%
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-850 text-slate-850 text-slate-900">Foundational Masteries</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Aim to master the direct physical prerequisites. Build 100% test coverage setups, environment isolation variables, and core logic parameters.
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${fTotal > 0 ? (fMatched / fTotal) * 100 : 100}%` }} />
            </div>
            <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
              <span>Goal: Achieve 100% of Foundations</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Horizon 2 */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider bg-indigo-100/60 border border-indigo-150 px-2.5 py-0.5 rounded-full">
                Horizon 2: 3-Month Plan
              </span>
              <span className="text-xs font-black text-indigo-600">
                {Math.min(100, Math.round(cTotal > 0 ? (cMatched / cTotal) * 100 : 100))}%
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-850 text-slate-900">Core Portfolio Expansion</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Develop three complete showcase microservices. Focus on speed limits, databases concurrency, asynchronous pools, and CI/CD pipelines.
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${cTotal > 0 ? (cMatched / cTotal) * 100 : 100}%` }} />
            </div>
            <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
              <span>Goal: 100% Core Projects Built</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Horizon 3 */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-white border border-slate-200 p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider bg-indigo-100/60 border border-indigo-150 px-2.5 py-0.5 rounded-full">
                Horizon 3: 6-Month Plan
              </span>
              <span className="text-xs font-black text-indigo-600">
                {Math.min(100, Math.round(aTotal > 0 ? (aMatched / aTotal) * 100 : 100))}%
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-850 text-slate-900">Elite Prep & Applications</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Deploy applications to public cloud providers, run diagnostic system design checks, polish resumes, and execute deep technical interview sessions.
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${aTotal > 0 ? (aMatched / aTotal) * 100 : 100}%` }} />
            </div>
            <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
              <span>Goal: Active Employment Applications</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

        </div>
      </div>

      {/* 🚀 SECTION 6: SHOWCASE PORTFOLIO PROJECTS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Production proof</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Target Portfolio Showcase Assets
            </h3>
            <p className="text-xs text-slate-500">
              Build these three tailored projects to provide undeniable physical proof of your knowledge during interviews.
            </p>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 px-3 py-1 rounded-full border border-sky-100 inline-block md:self-center">
            3 custom projects designed
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((proj, pIdx) => (
            <div key={pIdx} className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-150 hover:border-indigo-150 hover:shadow-md p-5 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider ${
                    proj.difficulty.toLowerCase() === "advanced"
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  }`}>
                    {proj.difficulty}
                  </span>
                  <Code className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>

                <h4 className="font-extrabold text-sm text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">
                  {proj.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="space-y-3.5 pt-3.5 border-t border-slate-200">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Tech Stack Utilized:</span>
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack.map((tech, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 bg-slate-200/60 text-slate-600 text-[9px] font-bold rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Target Milestones:</span>
                  <div className="space-y-1.5">
                    {proj.milestones.map((mil, mIdx) => {
                      const milestoneKey = `proj-${pIdx}-mil-${mIdx}`;
                      const isMilChecked = !!completedTasks[milestoneKey];
                      return (
                        <button
                          key={mIdx}
                          onClick={() => toggleTask(milestoneKey)}
                          className="w-full text-left flex items-start gap-1.5 text-[10px] leading-tight font-medium group cursor-pointer"
                        >
                          <div className={`w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border transition-all ${
                            isMilChecked ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-transparent"
                          }`}>
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className={`leading-snug transition-all ${isMilChecked ? "text-slate-400 line-through" : "text-slate-600 group-hover:text-slate-800"}`}>
                            {mil}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📚 SECTION 7: 'LEARN THIS SKILL' TRAINING & RESOURCES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Mentor Gaps Education</span>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            'Learn This Skill' Deep-Dive Syllabus
          </h3>
          <p className="text-xs text-slate-500">
            For each severe target gap, your AI Coach has structured an exact educational training card to expedite your mastery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {scoreBreakdown.priorityGaps.map((pGap, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-150 rounded-2xl p-5.5 space-y-4">
              
              {/* Header */}
              <div className="flex justify-between items-start gap-2 pb-2.5 border-b border-slate-200">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wide inline-block mb-1.5 ${
                    pGap.impact.toLowerCase().includes("critical") 
                      ? "bg-rose-150 text-rose-800 bg-rose-100 border border-rose-200" 
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {pGap.impact} Impact
                  </span>
                  <h4 className="text-sm font-black text-slate-900">
                    Syllabus: Learn {pGap.skill}
                  </h4>
                </div>
              </div>

              {/* Rationale description */}
              <p className="text-[11px] text-slate-600 leading-relaxed italic bg-white p-3 border border-slate-200 rounded-xl">
                &ldquo;{pGap.priorityReason}&rdquo;
              </p>

              {/* Course resources */}
              {pGap.recommendedCourses && pGap.recommendedCourses.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Hand-Picked Online Course
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {pGap.recommendedCourses.map((crs, cIdx) => (
                      <div key={cIdx} className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 flex justify-between items-center gap-3">
                        <div className="truncate">
                          <strong className="font-semibold text-slate-800 text-[11px] block truncate">{crs.title}</strong>
                          <span className="text-[10px] text-indigo-600 font-bold">{crs.provider}</span>
                        </div>
                        <a
                          href={crs.url && crs.url.startsWith("http") ? crs.url : "https://www.google.com/search?q=" + encodeURIComponent(crs.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md"
                        >
                          Find Course
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* practice project outcome */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/40">
                  <span className="text-[8px] uppercase font-bold text-indigo-600 block mb-0.5">Recommended Micro-Task</span>
                  <span className="text-[10.5px] text-indigo-900 leading-snug block">
                    Write small-scale test scripts targeting {pGap.skill} parameters.
                  </span>
                </div>
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/40">
                  <span className="text-[8px] uppercase font-bold text-indigo-600 block mb-0.5">Career Outcome</span>
                  <span className="text-[10.5px] text-indigo-900 leading-snug block">
                    Confidently explain {pGap.skill} optimization loops to technical recruiters.
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 📜 SECTION 8: TARGET CERTIFICATIONS & PROFESSIONAL CREDENTIALS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Verified badges</span>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            Target Industry Certifications & Credentials
          </h3>
          <p className="text-xs text-slate-500">
            Secure these professional certifications to automatically stand out from self-taught resume pools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {scoreBreakdown.priorityGaps.map((pGap, idx) => {
            if (!pGap.recommendedCertifications || pGap.recommendedCertifications.length === 0) return null;
            return pGap.recommendedCertifications.map((crt, cIdx) => (
              <div key={`${idx}-${cIdx}`} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                  <Award className="w-16 h-16 text-indigo-900" />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 border border-indigo-100 rounded inline-block">
                    {crt.issuer}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug pt-1">
                    {crt.name}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Credential Issuer:</span>
                  <strong className="text-indigo-600 font-bold">{crt.issuer}</strong>
                </div>
              </div>
            ));
          })}
        </div>
      </div>

      {/* 💼 SECTION 9: WHAT EMPLOYERS EXPECT (HIRING CRITERIA BENTO) */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center gap-2.5">
          <Briefcase className="w-5.5 h-5.5 text-indigo-400" />
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-widest text-white">
              What Employers Expect (Hiring Criteria)
            </h3>
            <p className="text-xs text-slate-400">
              Inside evaluation criteria mapped out from live late-2026 hiring metrics.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          
          <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-widest">Foundational Expectation</span>
            <h4 className="text-xs font-black text-white">100% Core Language Mastery</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Recruiters expect pristine execution structures. Clean code styling (linters like Ruff, ESLint) and strict structural type testing must be present.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-widest">Mid-Tier Expectation</span>
            <h4 className="text-xs font-black text-white">Asynchronous DB Session Management</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Hiring panels look for scalable backend setups. You must show asynchronous relational database pools, strict transactional rollbacks, and fast API routing.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-widest">Elite Expectation</span>
            <h4 className="text-xs font-black text-white">System Diagnostics & Deployment</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Senior panels look for proactive developers. Show live cloud-deployed portfolios, detailed README files analyzing bottleneck limits, and CI/CD pipelines.
            </p>
          </div>

        </div>
      </div>

      {/* 📈 SECTION 10: JOB READINESS CHECKLIST & INTERVIEW PREP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Final verification</span>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            Student Job Readiness Checklist
          </h3>
          <p className="text-xs text-slate-500">
            Check off these final checklist milestones when preparing your application dossier to verify alignment with recruitment benchmarks.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              key: "deployed",
              title: "Portfolio Deployed Globally on Public Cloud",
              desc: "Provide working URLs to live production codebases with active, secure endpoints."
            },
            {
              key: "readme",
              title: "Pragmatic README files detailing System Bottlenecks",
              desc: "Ensure repositories include clear write-ups analyzing memory footprints, test suite performance, or query limits."
            },
            {
              key: "bigO",
              title: "Standard Big-O Space/Time Complexity Verification",
              desc: "Annotate core routing blocks to prove algorithmic optimization behaviors to engineering reviewers."
            },
            {
              key: "interviews",
              title: "Completed 3 full Mock Interview Diagnostic loops",
              desc: "Pracice describing core project transaction steps in a verbal, self-assured manner."
            }
          ].map((item, idx) => {
            const isChecked = !!completedReadiness[item.key];
            return (
              <button
                key={idx}
                onClick={() => toggleReadiness(item.key)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isChecked
                    ? "bg-indigo-50/60 border-indigo-200 shadow-sm"
                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 hover:border-slate-350"
                }`}
              >
                <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all mt-0.5 ${
                  isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-transparent"
                }`}>
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className={`text-xs font-extrabold leading-tight ${isChecked ? "text-indigo-900 line-through opacity-75" : "text-slate-800"}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Citations block */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Search className="w-4.5 h-4.5 text-indigo-500" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Sourcing & Sourcing Proof Citations</h3>
        </div>

        <p className="text-xs text-slate-500">
          Dynamically fetched search parameters utilized by CareerPilot AI during background evaluation routines:
        </p>

        {groundingLinks && groundingLinks.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {groundingLinks.map((link, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-3 text-xs">
                <div className="truncate">
                  <strong className="block text-slate-800 font-semibold truncate leading-tight">{link.title}</strong>
                  <span className="text-[9px] text-slate-400 block truncate">{link.url}</span>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-50 hover:bg-indigo-100 p-1.5 text-indigo-600 rounded-lg flex-shrink-0 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            No external citation sources reported in current validation pass. Global AI context verified directly.
          </div>
        )}
      </div>

    </div>
  );
}
