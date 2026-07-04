import { Compass, GraduationCap, Award } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 tracking-tight block leading-none">
              CareerPilot AI
            </span>
            <span className="text-xs text-indigo-600 font-semibold tracking-wide">
              Agentic Career Intelligence & Roadmap System
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
          <GraduationCap className="w-4 h-4" />
          <span>Professional Career Agent</span>
        </div>
      </div>
    </header>
  );
}
