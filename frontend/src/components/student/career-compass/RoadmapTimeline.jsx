import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  Layers,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import Badge from '../../common/Badge';

export const RoadmapTimeline = ({
  roadmap = null,
  currentSemester = 5,
  targetTrack = '',
}) => {
  // 8 canonical curriculum steps
  const fallbackSteps = [
    {
      title: 'CS Foundations, Procedural Logic & Discrete Math',
      semesterNumber: 1,
      subjects: ['Engineering Mathematics', 'C Programming & Pointers', 'Digital Logic Design'],
      milestone: 'Complete 30 foundational LeetCode Easy problems and basic CLI applications.',
    },
    {
      title: 'Data Structures, Algorithms & Object-Oriented Design',
      semesterNumber: 2,
      subjects: ['Data Structures in C++/Java', 'Object-Oriented Programming', 'Computer Architecture'],
      milestone: 'Build a modular OOP project (e.g. Banking or Inventory System) with unit tests.',
    },
    {
      title: 'Relational Databases, Operating Systems & Web Architecture',
      semesterNumber: 3,
      subjects: ['Database Management Systems (SQL)', 'Operating Systems & Concurrency', 'Computer Networks'],
      milestone: 'Design a normalized 3NF database schema with indexing and ACID transaction support.',
    },
    {
      title: 'Full-Stack Development, REST APIs & Cloud Deployment',
      semesterNumber: 4,
      subjects: ['Modern Frontend (React/TypeScript)', 'Backend API Development (Node/FastAPI)', 'Cloud Basics (AWS/GCP)'],
      milestone: 'Ship an end-to-end deployed full-stack web application with JWT authentication.',
    },
    {
      title: 'Distributed Systems, Microservices & Container Orchestration',
      semesterNumber: 5,
      subjects: ['Microservices Architecture', 'Docker & Kubernetes', 'Message Brokers (RabbitMQ/Kafka)'],
      milestone: 'Deploy a multi-service containerized application with distributed caching via Redis.',
    },
    {
      title: 'System Design, High-Throughput Concurrency & Storage Engines',
      semesterNumber: 6,
      subjects: ['High-Level System Design', 'Database Sharding & Replication', 'Distributed Consensus'],
      milestone: 'Participate in verified mock interviews on Rate Limiters, URL Shorteners & Chat Systems.',
    },
    {
      title: 'Site Reliability Engineering, Observability & Security Pipelines',
      semesterNumber: 7,
      subjects: ['CI/CD Pipeline Automation', 'Prometheus & Grafana Telemetry', 'Cloud Security & DevSecOps'],
      milestone: 'Maintain 99.9% uptime on deployed services with automated canary releases.',
    },
    {
      title: 'Campus Super-Dream Drives, Capstone Defense & Corporate Onboarding',
      semesterNumber: 8,
      subjects: ['Placement Drive Sprints', 'Executive Leadership Capstone', 'Industry Internship'],
      milestone: 'Clear Tier-1 technical rounds and secure campus placement offers.',
    },
  ];

  // Derive steps from roadmap prop or fallback
  const rawSteps = roadmap?.steps || [];
  const steps = fallbackSteps.map((fb, idx) => {
    const customTitle = rawSteps[idx];
    return {
      ...fb,
      title: typeof customTitle === 'string' ? customTitle : fb.title,
    };
  });

  // State to track which step accordion is open (default: current semester step)
  const [expandedStep, setExpandedStep] = useState(currentSemester);

  const toggleStep = (semNum) => {
    setExpandedStep((prev) => (prev === semNum ? null : semNum));
  };

  return (
    <div className="space-y-4" aria-label="Curriculum Roadmap Timeline">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Semester Curriculum Roadmap
          </h3>
          <p className="text-xs text-slate-500">
            Aligned with VTU / Autonomous accreditation criteria for: <strong>{roadmap?.career || targetTrack || 'Engineering Trajectory'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Current Standing:</span>
          <Badge variant="primary" size="sm">
            Semester {currentSemester} of 8
          </Badge>
        </div>
      </div>

      {/* Accordion Steps List */}
      <div className="space-y-2.5">
        {steps.map((step) => {
          const semNum = step.semesterNumber;
          const isCompleted = semNum < currentSemester;
          const isCurrent = semNum === currentSemester;
          const isFuture = semNum > currentSemester;
          const isExpanded = expandedStep === semNum;

          const statusBadge = isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Completed</span>
            </span>
          ) : isCurrent ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
              <span>In Progress (Current)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Upcoming</span>
            </span>
          );

          return (
            <div
              key={semNum}
              className={`rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-blue-300 bg-white ring-1 ring-blue-500/20 shadow-sm'
                  : isCompleted
                  ? 'border-slate-200/90 bg-white'
                  : 'border-slate-200/70 bg-slate-50/60'
              }`}
            >
              {/* Accordion Header Button */}
              <button
                type="button"
                onClick={() => toggleStep(semNum)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {semNum}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Stage {semNum} • Semester {semNum}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {step.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {statusBadge}
                  <div className="w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Accordion Collapsible Body */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 text-xs animate-in fade-in duration-200">
                  {/* Subjects / Syllabus */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Curricular Subjects & Electives
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {step.subjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/60"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Placement Milestone */}
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Placement Benchmark Milestone:
                      </span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {step.milestone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapTimeline;
