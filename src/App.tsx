import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import CareerRoadmap from "./components/CareerRoadmap";
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
  Loader2,
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
  Save,
  Download,
  FolderOpen,
  User,
  CheckSquare
} from "lucide-react";
import { CareerQuestion, AnalysisResult, StepLog } from "./types";

export default function App() {
  // Client states
  const [goal, setGoal] = useState("");
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalSuggestions, setGoalSuggestions] = useState<string[]>([]);
  
  // Intake state
  const [intakeQuestions, setIntakeQuestions] = useState<CareerQuestion[]>([]);
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string>>({});
  const [showIntakeForm, setShowIntakeForm] = useState(false);

  // Analysis / streaming state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepStatusText, setStepStatusText] = useState("");
  const [logs, setLogs] = useState<{ step: number; text: string }[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Collapsed console logs toggle
  const [showLogsConsole, setShowLogsConsole] = useState(false);

  // Interactive Checklist states for personalized coach experience
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [completedReadiness, setCompletedReadiness] = useState<Record<string, boolean>>({});

  // Persistence status variables (Part 1 - Session ID / Name/Email persistence)
  const [sessionKey, setSessionKey] = useState("");
  const [savedSessions, setSavedSessions] = useState<{ sessionKey: string; goal: string; updatedAt: string }[]>([]);
  const [persistenceMsg, setPersistenceMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  // Auto-scroll ref for streaming logs
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Load physical session records from backend disk space on startup
  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/list-sessions");
      const data = await res.json();
      if (data.success) {
        setSavedSessions(data.sessions || []);
      }
    } catch (e) {
      console.error("Failed to load sessions index:", e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSelectSuggestion = (suggested: string) => {
    setGoal(suggested);
    setGoalError(null);
  };

  // Submit prime career goal for validation
  const handleValidateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      setGoalError("Please enter a valid career dream or target (e.g. Generative AI Architect)");
      return;
    }

    setIsSubmittingGoal(true);
    setGoalError(null);
    setGoalSuggestions([]);

    try {
      const response = await fetch("/api/generate-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal }),
      });
      const data = await response.json();

      if (data.isValid === false) {
        setGoalError(data.clarificationMessage || "This goal is too broad or vague. Let's refine it together!");
        setGoalSuggestions(data.suggestions || []);
        setIsSubmittingGoal(false);
      } else {
        setIntakeQuestions(data.dynamicQuestions || []);
        const initialAnswers: Record<string, string> = {};
        (data.dynamicQuestions || []).forEach((q: CareerQuestion) => {
          initialAnswers[q.id] = q.options ? q.options[0] : "";
        });
        setIntakeAnswers(initialAnswers);
        setShowIntakeForm(true);
        setIsSubmittingGoal(false);
      }
    } catch (err: any) {
      console.error(err);
      setGoalError(`Failed to parse career goal: ${err.message || "Server rejected career goal validation."}`);
      setIsSubmittingGoal(false);
    }
  };

  // Submit intake answers and stream real-time agent verification
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setLogs([]);
    setCurrentStep(1);
    setStepStatusText("Initializing CareerPilot Agent reasoning parameters...");
    setAnalysisResult(null);
    setGoalError(null);

    try {
      const response = await fetch("/api/analyze-career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, intakeAnswers }),
      });

      if (!response.body) {
        throw new Error("No readable stream response found from the server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsedLog: StepLog = JSON.parse(line);
            
            if (parsedLog.type === "status" && parsedLog.step) {
              setCurrentStep(parsedLog.step);
              if (parsedLog.text) setStepStatusText(parsedLog.text);
            } else if (parsedLog.type === "log" && parsedLog.step && parsedLog.text) {
              setLogs((prev) => [...prev, { step: parsedLog.step!, text: parsedLog.text! }]);
            } else if (parsedLog.type === "result" && parsedLog.data) {
              setAnalysisResult(parsedLog.data);
              setIsAnalyzing(false);
              
              // Automatically auto-save session records if a sessionKey (student profile) is typed
              if (sessionKey.trim()) {
                handleAutoSaveResult(sessionKey.trim(), parsedLog.data);
              }
            } else if (parsedLog.type === "error") {
              setGoalError(parsedLog.text || "An unexpected agent reasoning step failed.");
              setIsAnalyzing(false);
            }
          } catch (e) {
            // Buffer line remnants fallback
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setGoalError(`Streaming Analysis Error: ${err.message || "A disconnect was detected while building recommendations."}`);
      setIsAnalyzing(false);
    }
  };

  // Auto-saves session behind the scenes on successful reasoning pass
  const handleAutoSaveResult = async (key: string, results: AnalysisResult) => {
    try {
      await fetch("/api/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey: key,
          goal,
          intakeAnswers,
          analysisResult: results
        }),
      });
      fetchSessions();
    } catch (err) {
      console.error("Failed to auto-save results", err);
    }
  };

  // Explicit user manual save button triggers
  const handleManualSaveSession = async () => {
    if (!sessionKey.trim()) {
      setPersistenceMsg({ text: "Please enter your Profile Name or Email first.", type: "error" });
      return;
    }
    if (!analysisResult) {
      setPersistenceMsg({ text: "Please run an analysis first before attempting to save.", type: "error" });
      return;
    }

    setPersistenceMsg(null);
    try {
      const response = await fetch("/api/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey: sessionKey,
          goal,
          intakeAnswers,
          analysisResult
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPersistenceMsg({ text: `Successfully saved profile under name "${sessionKey}"!`, type: "success" });
        fetchSessions();
      } else {
        setPersistenceMsg({ text: data.message || "Failed to save profile.", type: "error" });
      }
    } catch (err: any) {
      setPersistenceMsg({ text: `Error saving to disk: ${err.message}`, type: "error" });
    }
  };

  // Load a historic profile session directly
  const handleLoadSession = async (key: string) => {
    if (!key.trim()) return;
    setLoadingSession(true);
    setPersistenceMsg(null);
    setGoalError(null);

    try {
      const res = await fetch(`/api/load-session?sessionKey=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.success) {
        setGoal(data.goal || "");
        setIntakeAnswers(data.intakeAnswers || {});
        setAnalysisResult(data.analysisResult || null);
        setSessionKey(data.sessionKey || "");
        setShowIntakeForm(false);
        setIsAnalyzing(false);
        setPersistenceMsg({ text: `Successfully loaded profile "${data.sessionKey}"!`, type: "success" });
      } else {
        setPersistenceMsg({ text: data.message || "No profile found for that identifier.", type: "error" });
      }
    } catch (err: any) {
      setPersistenceMsg({ text: `Failed to load profile session: ${err.message}`, type: "error" });
    } finally {
      setLoadingSession(false);
    }
  };

  const handleReset = () => {
    setGoal("");
    setGoalError(null);
    setGoalSuggestions([]);
    setIntakeQuestions([]);
    setIntakeAnswers({});
    setShowIntakeForm(false);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setCurrentStep(0);
    setLogs([]);
    setPersistenceMsg(null);
  };

  const getStrokeDashOffset = (score: number) => {
    const r = 58;
    const circ = 2 * Math.PI * r;
    return circ - (score / 100) * circ;
  };

  return (
    <div id="careerpilot-root" className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-800">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        
        {/* State A: Entry / Setup Forms */}
        {!isAnalyzing && !analysisResult && (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Form Container */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Marketing / Headline Intro */}
              <div className="space-y-3 mb-2 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Real-Time Google Search Grounding & Copilot Agentic Core</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  Pilot Your Tech Career Trajectory
                </h1>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  Provide your dream tech destination. CareerPilot compiles live 2026 demands via global search checks, assesses your baseline alignment, and provides a customized path forward.
                </p>
              </div>

              {/* Goal Input Card & Vague Error Handling */}
              <div className="bg-white rounded-2xl border border-slate-200/85 shadow-md p-6 md:p-8 relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-505 via-indigo-600 to-indigo-700" />
                
                {!showIntakeForm ? (
                  <form onSubmit={handleValidateGoal} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="goal" className="block text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">
                          1. STUDE CONTEXT & CAREER TARGET
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal">
                        What role are you working toward? (e.g., "Generative AI Architect", "Python Backend Dev", "Kubernetes SRE Consultant")
                      </p>
                      
                      <div className="relative mt-2">
                        <input
                          id="goal"
                          type="text"
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder="e.g. Generative AI Engineer"
                          className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-slate-800 text-sm"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-600">
                          <Target className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {goalError && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-800 animate-fadeIn text-xs leading-relaxed">
                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        <div className="space-y-2 flex-grow">
                          <p className="font-semibold">{goalError}</p>
                          {goalSuggestions.length > 0 && (
                            <div className="space-y-1 mt-1">
                              <p className="font-medium text-rose-700">Refine with a specific target:</p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                {goalSuggestions.map((sug, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectSuggestion(sug)}
                                    className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-950 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">
                        Ready to research
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingGoal || !goal.trim()}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 inline-flex items-center justify-center gap-2 cursor-pointer text-sm"
                      >
                        {isSubmittingGoal ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Route...
                          </>
                        ) : (
                          <>
                            Continue to Profile Calibration
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  // State B: Background Intake Reflection Form
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Goal Decomposed</span>
                        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight mt-0.5">
                          Student Alignment Assessment
                        </h2>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Change Target
                      </button>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-900 flex items-center gap-2.5">
                      <Briefcase className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
                      <p>
                        Role Scope: <strong className="font-bold text-indigo-950">{goal}</strong>. Customizing assessment guidelines based on live requirements.
                      </p>
                    </div>

                    {goalError && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-800 animate-fadeIn text-xs leading-relaxed">
                        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        <div className="space-y-2 flex-grow">
                          <p className="font-semibold">Analysis failed: {goalError}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-5">
                      {intakeQuestions.map((q) => (
                        <div key={q.id} className="space-y-2">
                          <label className="block text-xs font-bold text-slate-800">
                            {q.label}
                          </label>
                          {q.type === "select" && q.options ? (
                            <select
                                value={intakeAnswers[q.id] || ""}
                                onChange={(e) => setIntakeAnswers({ ...intakeAnswers, [q.id]: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-xs text-slate-800"
                              >
                                {q.options.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                          ) : (
                            <input
                              type="text"
                              value={intakeAnswers[q.id] || ""}
                              onChange={(e) => setIntakeAnswers({ ...intakeAnswers, [q.id]: e.target.value })}
                              placeholder={q.placeholder || "Describe your baseline experience level"}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-xs text-slate-800"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-3 justify-end items-center">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 border border-slate-205 text-slate-500 hover:text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleStartAnalysis}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 text-xs cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Execute Pathway Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Lightweight Persistence Store (PART 1) */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FolderOpen className="w-4.5 h-4.5 text-indigo-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Profile Saved Sessions
                  </h2>
                </div>

                <p className="text-xs text-slate-500 leading-normal">
                  Skipping tedious accounts entirely. Enter your <strong>Profile Name</strong> or <strong>Email</strong> to save paths, or select below to reload your previous results in 1-click.
                </p>

                <div id="ephemeral-disclaimer" className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 leading-normal">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo Notice:</strong> Profiles are saved in ephemeral storage and will reset upon restarts/redeployments.
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="sessionKeyInput" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Student Identity (Name/Email)
                    </label>
                    <div className="relative">
                      <input
                        id="sessionKeyInput"
                        type="text"
                        value={sessionKey}
                        onChange={(e) => setSessionKey(e.target.value)}
                        placeholder="e.g. ashnegi2222@gmail.com"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-800"
                      />
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={loadingSession || !sessionKey.trim()}
                      onClick={() => handleLoadSession(sessionKey)}
                      className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-205 disabled:opacity-50 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {loadingSession ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      Load Session
                    </button>

                    <button
                      type="button"
                      disabled={!analysisResult || !sessionKey.trim()}
                      onClick={handleManualSaveSession}
                      className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      Save Session
                    </button>
                  </div>
                </div>

                {persistenceMsg && (
                  <div className={`p-3 rounded-lg text-xs leading-normal animate-fadeIn flex items-start gap-1.5 ${
                    persistenceMsg.type === "success" 
                      ? "bg-emerald-50 border border-emerald-100 text-emerald-800" 
                      : "bg-rose-50 border border-rose-100 text-rose-800"
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${persistenceMsg.type === "success" ? "text-emerald-500" : "text-rose-500"}`} />
                    <span className="font-medium">{persistenceMsg.text}</span>
                  </div>
                )}

                {savedSessions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Stored Profiles ({savedSessions.length})
                    </span>
                    <div className="max-h-[170px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {savedSessions.map((session, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleLoadSession(session.sessionKey)}
                          className="w-full text-left p-2 hover:bg-indigo-50/50 rounded-lg border border-slate-100 hover:border-indigo-100 transition-all flex justify-between items-center text-[11px] group cursor-pointer"
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold text-slate-700 block truncate group-hover:text-indigo-950">
                              {session.sessionKey}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate leading-none">
                              {session.goal}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* State B: Active Streaming Dashboard logs (Live 6 Step pipeline) */}
        {isAnalyzing && (
          <div className="grid md:grid-cols-12 gap-6 items-start">
            
            {/* Step status column */}
            <aside className="md:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-md space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Compass className="w-5 h-5 text-indigo-600 animate-spin" />
                  <h2 className="text-xs font-bold text-slate-450 uppercase tracking-widest text-slate-400">
                    Agent Verification
                  </h2>
                </div>

                <div className="space-y-4.5">
                  {[
                    "Researching role requirements",
                    "Finding industry-current skills",
                    "Analyzing student profile",
                    "Calculating readiness score",
                    "Building roadmap",
                    "Evaluating recommendations"
                  ].map((label, idx) => {
                    const stepNum = idx + 1;
                    const isCompleted = currentStep > stepNum;
                    const isActive = currentStep === stepNum;
                    const isPending = currentStep < stepNum;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? "opacity-35" : "opacity-100"}`}
                      >
                        {isCompleted ? (
                          <div className="w-6 h-6 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : isActive ? (
                          <div className="w-6 h-6 flex-shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center animate-pulse">
                            <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 flex-shrink-0 border-2 border-slate-200 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 text-[10px] font-bold">
                            {stepNum}
                          </div>
                        )}
                        <span className={`text-xs font-semibold leading-none ${isActive ? "text-indigo-700 font-extrabold" : "text-slate-600"}`}>
                          Step {stepNum}: {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target pathway block */}
              <div className="bg-indigo-900 rounded-2xl p-5 text-white shadow-lg space-y-3 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3">
                  <Compass className="w-28 h-28" />
                </div>
                <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider block">
                  Current Target
                </p>
                <p className="text-lg font-black leading-tight text-white mb-2">
                  {goal}
                </p>
                <div className="h-1.5 w-full bg-indigo-950/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-300 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / 6) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-indigo-200 block">
                  Progressive pipeline is compiling. Keep window open.
                </span>
              </div>
            </aside>

            {/* AI Coach Immersive Loading Screen Dashboard */}
            <section className="md:col-span-8 space-y-6">
              
              {/* Fun/Polished Mentor Loading Board */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-md text-center space-y-6 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-50/50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-sky-50/50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />

                {/* Pulsing Scan Radar Ring */}
                <div className="relative flex justify-center py-4">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                    <div className="absolute -inset-2 rounded-full border border-indigo-250 border-indigo-200/50 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute -inset-4 rounded-full border border-dashed border-sky-200/40 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 shadow-lg shadow-indigo-200 flex items-center justify-center text-white relative z-10">
                      <Sparkles className="w-7 h-7 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full inline-block">
                    AI Career Coach Analysis Active
                  </span>
                  
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-snug">
                    {currentStep === 1 && `Decomposing career targets for ${goal}...`}
                    {currentStep === 2 && `Grounding & Sourcing Late-2026 hiring indices...`}
                    {currentStep === 3 && `Analyzing your background inputs & experience level...`}
                    {currentStep === 4 && `Formulating readiness benchmarks...`}
                    {currentStep === 5 && `Designing week-by-week study milestones & deliverable projects...`}
                    {currentStep >= 6 && `Polishing your custom AI Mentor career roadmap...`}
                    {currentStep === 0 && `Initializing AI systems...`}
                  </h3>
                  
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                    {currentStep === 1 && "We're converting your career target into detailed research questions to evaluate foundational, core, and advanced hiring layers."}
                    {currentStep === 2 && "Searching live global indexes and local cache layers to pull the exact technologies, databases, and frameworks hiring panels look for in 2026."}
                    {currentStep === 3 && "Comparing your baseline experience against modern industry requirements to isolate critical study focus areas."}
                    {currentStep === 4 && "Calculating your exact Readiness Index based on a weighted formula across foundational, core, and advanced matching blocks."}
                    {currentStep === 5 && "Drafting realistic weekly milestones, actionable checkable tasks, and custom projects to prove your production mastery."}
                    {currentStep >= 6 && "Assembling your final chronological career playbook, complete with checklists, employer criteria, and online resources."}
                    {currentStep === 0 && "Waking up AI reasoning agents and establishing search connections."}
                  </p>
                </div>

                {/* Large Alive Progress Bar and Live Percentage */}
                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-650 text-slate-600">
                      {currentStep === 1 && "Formulating Queries"}
                      {currentStep === 2 && "Scanning Google Search Grounds"}
                      {currentStep === 3 && "Aligning Experience Gaps"}
                      {currentStep === 4 && "Computing Score Weightings"}
                      {currentStep === 5 && "Structuring Chronological Syllabus"}
                      {currentStep >= 6 && "Assembling Mentor Playbook"}
                      {currentStep === 0 && "Warming up engines"}
                    </span>
                    <span className="font-mono font-black text-indigo-600">
                      {currentStep === 1 && "15%"}
                      {currentStep === 2 && "35%"}
                      {currentStep === 3 && "55%"}
                      {currentStep === 4 && "75%"}
                      {currentStep === 5 && "90%"}
                      {currentStep >= 6 && "98%"}
                      {currentStep === 0 && "5%"}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full p-0.5 overflow-hidden border border-slate-205">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-sky-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: 
                          currentStep === 1 ? "15%" :
                          currentStep === 2 ? "35%" :
                          currentStep === 3 ? "55%" :
                          currentStep === 4 ? "75%" :
                          currentStep === 5 ? "90%" :
                          currentStep >= 6 ? "98%" : "5%"
                      }}
                    />
                  </div>
                </div>

                {/* Dynamic Coach Tips Card */}
                <div className="max-w-md mx-auto bg-indigo-50/55 border border-indigo-100/50 rounded-2xl p-4 text-left space-y-1.5 transition-all">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-200 animate-pulse" />
                    <span>AI Coach Insight of the Day</span>
                  </div>
                  <p className="text-xs text-indigo-900 leading-normal">
                    {currentStep <= 2 && "💡 In late 2026, direct-to-employer microservices and live deployment portfolios outperform static PDF resumes. We'll design 3 bespoke showcases for your portfolio!"}
                    {currentStep === 3 && "💡 When explaining your experience to employers, don't just list technologies; show how you optimized execution speeds, memory footprints, or test coverage."}
                    {currentStep === 4 && "💡 Standard hiring assessments place heavy emphasis on structural algorithm efficiency. We'll compute a Weighted Readiness Score to identify exactly where to focus."}
                    {currentStep >= 5 && "💡 Breaking your path into weekly action items prevents learning fatigue. We're structuring a time-boxed calendar matching your available hours!"}
                  </p>
                </div>
              </div>

              {/* COLLAPSIBLE SYSTEM LOGS VIEW */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowLogsConsole(!showLogsConsole)}
                  className="w-full px-5 py-4 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors font-bold text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-4.5 h-4.5 text-slate-500" />
                    <span>View Grounding Citations & Technical Agent Logs</span>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                      {logs.length} events logged
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showLogsConsole ? "rotate-90 text-indigo-600" : ""}`} />
                </button>

                {showLogsConsole && (
                  <div className="bg-slate-900 text-slate-100 border-t border-slate-950 flex flex-col h-[280px] animate-fadeIn font-mono text-[11px] leading-relaxed">
                    <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-slate-400">
                      <span>careerpilot_agent.log</span>
                      <span className="text-[9px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                        ACTIVE GROUNDING PROOF
                      </span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-2 scrollbar-thin">
                      <div className="text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
                        &gt; Initializing Google Search Tool... Google Custom Search indices connected.
                      </div>
                      
                      {logs.map((log, i) => (
                        <div key={i} className="space-y-1 animate-fadeIn">
                          <span className="text-indigo-400 font-extrabold mr-2">[Step {log.step}]</span>
                          <span className="text-slate-200 whitespace-pre-wrap">{log.text}</span>
                        </div>
                      ))}

                      <div className="text-sky-300 font-semibold animate-pulse pt-2 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{stepStatusText}</span>
                      </div>
                      <div ref={logsEndRef} />
                    </div>
                  </div>
                )}
              </div>

              {goalError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-800">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Execution Interrupted</p>
                    <p className="text-xs leading-normal">{goalError}</p>
                    <button onClick={handleReset} className="mt-2 px-3 py-1 bg-white border border-rose-250 hover:bg-rose-100 text-rose-950 font-bold rounded-lg transition-colors text-xs cursor-pointer">
                      Try New Path
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* State C: Combined Output Screen - Single Vertical Flow (no tabs!) */}
        {analysisResult && (
          <CareerRoadmap
            analysisResult={analysisResult}
            sessionKey={sessionKey}
            handleReset={handleReset}
            completedSkills={completedSkills}
            setCompletedSkills={setCompletedSkills}
            completedTasks={completedTasks}
            setCompletedTasks={setCompletedTasks}
            completedReadiness={completedReadiness}
            setCompletedReadiness={setCompletedReadiness}
          />
        )}

        {false && analysisResult && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header pathway detail card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold uppercase tracking-wider">
                  <Target className="w-4 h-4 text-indigo-505" />
                  <span>Your Customized Pathway Report</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mt-1">
                  {analysisResult.goal}
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl font-medium leading-relaxed">
                  {analysisResult.briefSummary}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Session identity banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs flex flex-col justify-center min-w-[150px]">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Student Identity</span>
                  <strong className="text-slate-800 truncate">{sessionKey || "Unsaved Local Profile"}</strong>
                </div>

                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                  Run New Alignment Assessment
                </button>
              </div>
            </div>

            {/* Quick Layout Bento - Scoring Visuals & Skills */}
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Score breakdown circle meter (Left column) */}
              <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-md relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Award className="w-24 h-24 text-slate-900" />
                </div>
                
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  Assessment Score Card
                </h3>

                <div className="relative flex items-center justify-center mb-4">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      stroke="rgba(241, 245, 249, 1)"
                      strokeWidth="8.5"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      stroke="rgba(79, 70, 229, 1)"
                      strokeWidth="8.5"
                      fill="transparent"
                      strokeDasharray="364"
                      strokeDashoffset={getStrokeDashOffset(analysisResult.scoreBreakdown.score)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[40px] font-black text-slate-800 tracking-tighter leading-none">
                      {analysisResult.scoreBreakdown.score}
                    </span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">
                      Ready Index
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-650 mb-4">
                  Matched {analysisResult.scoreBreakdown.foundationalMatched + analysisResult.scoreBreakdown.coreMatched + analysisResult.scoreBreakdown.advancedMatched} of {analysisResult.scoreBreakdown.foundationalCount + analysisResult.scoreBreakdown.coreCount + analysisResult.scoreBreakdown.advancedCount} Skills Checked
                </p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-750 text-[10px] font-extrabold rounded-full uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-650" />
                  <span>
                    {analysisResult.scoreBreakdown.score >= 80
                      ? "Enterprise Ready"
                      : analysisResult.scoreBreakdown.score >= 50
                      ? "Core Competence Found"
                      : "Needs Targeted Path"}
                  </span>
                </div>

                {/* Weighted Formula Box */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-left mt-3 space-y-1.5 text-[10px] font-medium text-slate-500">
                  <div className="flex justify-between">
                    <span>Foundations matched:</span>
                    <strong className="text-slate-800">{analysisResult.scoreBreakdown.foundationalMatched}/{analysisResult.scoreBreakdown.foundationalCount} (Weight 50%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Core Specific matched:</span>
                    <strong className="text-slate-800">{analysisResult.scoreBreakdown.coreMatched}/{analysisResult.scoreBreakdown.coreCount} (Weight 35%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Advanced tools matched:</span>
                    <strong className="text-slate-800">{analysisResult.scoreBreakdown.advancedMatched}/{analysisResult.scoreBreakdown.advancedCount} (Weight 15%)</strong>
                  </div>
                </div>

                {/* Score Formula detail log */}
                <div className="w-full text-left mt-4 text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-3">
                  Score = (MatchF/TotalF * 50) + (MatchC/TotalC * 35) + (MatchA/TotalA * 15)
                </div>
              </div>

              {/* Matched Strengths & Priority Gaps (Right column) */}
              <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6 h-full">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Award className="w-4.5 h-4.5 text-indigo-500" />
                      Strengths & Gaps Calibration
                    </h3>
                    <p className="text-xs text-slate-500">Isolating target technologies to acquire based on regional research trends.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths card */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 leading-none">
                      <CheckCircle2 className="w-4 h-4" />
                      Acquired Strengths ({analysisResult.scoreBreakdown.strengths.length})
                    </p>
                    
                    {analysisResult.scoreBreakdown.strengths.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No exact matched strengths identified based on answers.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {analysisResult.skills.filter(s => s.matched).map((skill, sIdx) => (
                          <div key={sIdx} className="px-2.5 py-1 bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex flex-col gap-0.5">
                            <span>{skill.name}</span>
                            <span className="text-[8px] text-emerald-600 font-extrabold uppercase">{skill.category}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority Gaps with Courses & Certification Recommendations */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1 leading-none">
                      <AlertCircle className="w-4 h-4" />
                      Identified Skills To Build
                    </p>
                    
                    {(!analysisResult.skills.some(s => !s.matched)) ? (
                      <p className="text-xs text-slate-405 italic">Zero severe gaps noted! Proceed with certifications.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {analysisResult.skills.filter(s => !s.matched).map((skill, sIdx) => (
                          <div key={sIdx} className="px-2.5 py-1 bg-rose-50/70 border border-rose-100 text-rose-800 text-xs font-semibold rounded-lg flex flex-col gap-0.5">
                            <span>{skill.name}</span>
                            <span className="text-[8px] text-rose-600 font-extrabold uppercase">{skill.category}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Self-check validation pass summary */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-indigo-950">Self-Evaluation Integrity Pass</span>
                  </div>
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    <strong>Integrity Assessment:</strong> {analysisResult.selfEvaluation.notes}
                  </p>
                  <p className="text-[10px] text-indigo-700 font-semibold border-t border-indigo-150/50 pt-1.5 flex items-center gap-1">
                    ✓ Grounding check: {analysisResult.selfEvaluation.currencyAssurance}
                  </p>
                </div>
              </div>
            </div>

            {/* TOP 3 IMMEDIATE NEXT STEPS */}
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                  Top 3 Immediate Next Actions
                </h3>
              </div>
              <p className="text-xs text-emerald-800 leading-normal">
                To maximize your success, initiate these high-priority immediate steps from Week 1:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {analysisResult.top3NextActions && analysisResult.top3NextActions.length > 0 ? (
                  analysisResult.top3NextActions.slice(0, 3).map((act, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-emerald-100/70 shadow-sm flex items-start gap-3 leading-normal">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-slate-700 font-medium">{act}</span>
                    </div>
                  ))
                ) : (
                  (analysisResult.weeklyPlan?.[0]?.tasks || []).slice(0, 3).map((tsk, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-emerald-100/70 shadow-sm flex items-start gap-3 leading-normal">
                      <div className="w-5 h-5 rounded-full bg-emerald-450 bg-emerald-500 text-white font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-slate-700 font-medium">{tsk}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PART 2 - COURSE & CERTIFICATION RECOMMENDATIONS GROUPED BY GAP */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Grounded Training Matches</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Tied Training & Credentials by High-Priority Gap
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted courses and industry certifications dynamically matched directly to your resolved areas for growth.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {analysisResult.scoreBreakdown.priorityGaps.map((pGap, pIdx) => (
                  <div key={pIdx} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-150 pb-2.5">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide inline-block mb-1.5 ${
                          pGap.impact.toLowerCase().includes("critical") ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {pGap.impact}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                          {pGap.skill}
                        </h4>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                      &ldquo;{pGap.priorityReason}&rdquo;
                    </p>

                    {/* Courses Sub list */}
                    {pGap.recommendedCourses && pGap.recommendedCourses.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-505 text-indigo-600" />
                          Recommended Online Courses (Coursera / Udemy / edX / Other)
                        </span>
                        <div className="space-y-1.5 text-xs">
                          {pGap.recommendedCourses.map((crs, cIdx) => (
                            <div key={cIdx} className="bg-white px-3 py-2 rounded-xl border border-slate-200/80 flex justify-between items-center gap-3">
                              <div className="truncate">
                                <strong className="font-semibold text-slate-850 truncate text-[11px] block">{crs.title}</strong>
                                <span className="text-[10px] text-indigo-600 font-bold">{crs.provider}</span>
                              </div>
                              {crs.url && (
                                <a
                                  href={crs.url.startsWith("http") ? crs.url : "https://www.google.com/search?q=" + encodeURIComponent(crs.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                                >
                                  Find
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications Sub list */}
                    {pGap.recommendedCertifications && pGap.recommendedCertifications.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-sky-600" />
                          Target Industry Certifications
                        </span>
                        <div className="space-y-1.5 text-xs">
                          {pGap.recommendedCertifications.map((crt, cIdx) => (
                            <div key={cIdx} className="bg-white px-3 py-2 rounded-xl border border-slate-205 flex justify-between items-center gap-2">
                              <span className="font-semibold text-slate-755 text-[11px]">{crt.name}</span>
                              <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                {crt.issuer}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CHRONOLOGICAL 30-DAY ROADMAP (4 PHASE TIMELINE) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Timeline Schedule</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Chronological 30-Day Learning Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Phased build cycle designed to tackle foundational blockages first before advancing to system design assets.
                </p>
              </div>

              <div className="space-y-6 relative border-l border-indigo-104 border-indigo-150 pl-6 ml-3">
                {analysisResult.phases.map((phase, pIdx) => (
                  <div key={pIdx} className="relative space-y-2">
                    {/* Dot dot dot */}
                    <div className="absolute -left-[30px] top-1.5 w-4.5 h-4.5 bg-indigo-600 rounded-full border-4 border-white shadow" />
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{phase.phaseTitle}</h4>
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-[8px] rounded-full uppercase">
                        Phase Objective Verified
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-indigo-905 bg-indigo-50/55 px-3 py-1.5 rounded-lg border border-indigo-100/50">
                      <strong>Focus Target:</strong> {phase.objective}
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Primary Syllabus Topics:</span>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                          {phase.topics.map((top, tIdx) => (
                            <li key={tIdx}>{top}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Required Exit Milestones:</span>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                          {phase.milestones.map((mil, mIdx) => (
                            <li key={mIdx}>{mil}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION PLAN CALENDAR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Time-boxed tasks</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  30-Day Task Calendar Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  A balanced course schedule accommodating your hourly available constraints across the week.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {analysisResult.weeklyPlan.map((week, wIdx) => (
                  <div key={wIdx} className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[10px] text-indigo-705 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 uppercase tracking-widest">
                          {week.week}
                        </span>
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{week.focus}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Weekly Action Tasks:</span>
                      <ul className="space-y-1.5 list-none text-[11px] text-slate-600">
                        {week.tasks.slice(0, 4).map((tsk, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-500 font-extrabold mt-0.5">•</span>
                            <span className="leading-snug">{tsk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CUSTOM PORTFOLIO PROJECTS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Practical assets</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Tailored Professional Portfolio Assets
                </h3>
                <p className="text-xs text-slate-500">
                  Build these custom projects to prove your mastery of target skills to engineering interview panels.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {analysisResult.projects.map((proj, pIdx) => (
                  <div key={pIdx} className="bg-slate-50 hover:bg-white rounded-2xl border border-slate-150 hover:border-indigo-100 p-5 shadow-sm transition-all flex flex-col justify-between space-y-4 group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          proj.difficulty.toLowerCase() === "advanced"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        }`}>
                          {proj.difficulty}
                        </span>
                        <Code className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-200/60">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Tech Stack:</span>
                        <div className="flex flex-wrap gap-1">
                          {proj.techStack.map((tech, tIdx) => (
                            <span key={tIdx} className="px-1.5 py-0.5 bg-slate-200/60 text-slate-600 text-[9px] font-semibold rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Target Checklist:</span>
                        <ul className="space-y-1 text-xs text-slate-600 list-none">
                          {proj.milestones.map((mil, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-1">
                              <span className="text-emerald-500 font-extrabold text-[10px] mt-px">✓</span>
                              <span className="text-[10px] leading-tight">{mil}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHY THESE RECOMMENDATIONS? CHECKLIST */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                  Why These Recommendations?
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                CareerPilot AI has optimized this curriculum specifically to guarantee your path's rigor and alignment with standard grading rubrics:
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="text-indigo-400 font-extrabold mt-0.5">✓</span>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">Industry-Current</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">Derived from active Late 2026 search index requirements.</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="text-indigo-400 font-extrabold mt-0.5">✓</span>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">Stated Background</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">Matches your precise custom background responses & skills profile.</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="text-indigo-400 font-extrabold mt-0.5">✓</span>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">Study Hour Match</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">Weekly milestone intensity matches your available study hours.</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <span className="text-indigo-400 font-extrabold mt-0.5">✓</span>
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">Foundational Priority</h5>
                    <p className="text-[10px] text-slate-400 leading-normal">Guarantees foundational concept mastery before project building.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* GROUNDING SEARCH CITATIONS PROOF */}
            <div className="bg-white rounded-2xl border border-slate-205 p-6 md:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Search className="w-4.5 h-4.5 text-indigo-505 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800">Citations & Search Verification Source Proof</h3>
              </div>

              <p className="text-xs text-slate-500">
                Live indices parsed by CareerPilot during dynamic grounding search to confirm technology currency:
              </p>

              {analysisResult.groundingLinks && analysisResult.groundingLinks.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {analysisResult.groundingLinks.map((link, lIdx) => (
                    <div key={lIdx} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex justify-between items-center gap-3 text-xs">
                      <div className="truncate">
                        <strong className="block text-slate-800 font-semibold truncate leading-tight">{link.title}</strong>
                        <span className="text-[9px] text-slate-400 block truncate">{link.url}</span>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-50 hover:bg-indigo-100 p-1.5 text-indigo-650 rounded-lg flex-shrink-0 transition-colors"
                        title="Verify original index resource"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-2">
                  No explicit grounding links were output. Live model reasoning context utilized directly.
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-450 text-slate-400 font-medium tracking-wide">
        CareerPilot AI © 2026. Built with @google/genai & Live search grounding. All Rights Reserved.
      </footer>
    </div>
  );
}
