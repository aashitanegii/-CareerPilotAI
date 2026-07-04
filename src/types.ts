export interface CareerQuestion {
  id: string;
  type: 'text' | 'select';
  label: string;
  placeholder?: string;
  options?: string[];
}

export interface SkillItem {
  name: string;
  category: 'foundational' | 'core' | 'advanced';
  matched: boolean;
  importance: string; // e.g. "High", "Critical", "Moderate"
  description: string;
}

export interface ScoreBreakdown {
  score: number;
  formula: string;
  foundationalCount: number;
  foundationalMatched: number;
  coreCount: number;
  coreMatched: number;
  advancedCount: number;
  advancedMatched: number;
  strengths: string[];
  gaps: string[];
  priorityGaps: {
    skill: string;
    impact: string;
    priorityReason: string;
    recommendedCourses?: {
      title: string;
      provider: string;
      url?: string;
    }[];
    recommendedCertifications?: {
      name: string;
      issuer: string;
    }[];
  }[];
}

export interface RoadmapPhase {
  phaseTitle: string; // e.g. "Foundation (Days 1-7)"
  objective: string;
  topics: string[];
  milestones: string[];
}

export interface GroundedResource {
  title: string;
  provider: string;
  type: string; // e.g. "Certification", "Documentation", "Course"
  url?: string;
  description: string;
}

export interface RecommendedProject {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: string[];
  milestones: string[];
}

export interface WeeklyMilestone {
  week: string; // e.g. "Week 1"
  focus: string;
  tasks: string[];
}

export interface SelfEvaluationPass {
  passed: boolean;
  notes: string;
  currencyAssurance: string; // Explicit statement for 2026 relevance check
  potentialRisks: string[];
  mitigationStrategies: string[];
}

export interface AnalysisResult {
  goal: string;
  briefSummary: string;
  decomposedQuestions: string[];
  industryTrends2026: string[];
  skills: SkillItem[];
  scoreBreakdown: ScoreBreakdown;
  phases: RoadmapPhase[];
  resources: GroundedResource[];
  projects: RecommendedProject[];
  weeklyPlan: WeeklyMilestone[];
  top3NextActions?: string[];
  selfEvaluation: SelfEvaluationPass;
  groundingLinks?: { title: string; url: string }[];
}

export interface StepLog {
  type: 'status' | 'log' | 'result' | 'error';
  step?: number;
  text?: string;
  data?: AnalysisResult;
}
