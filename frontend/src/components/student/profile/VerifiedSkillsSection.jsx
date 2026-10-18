import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Plus,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

export const categorizeSkill = (skillName) => {
  const s = (skillName || '').toLowerCase();
  if (s.includes('react') || s.includes('vue') || s.includes('front') || s.includes('ui') || s.includes('graphql') || s.includes('rest') || s.includes('tailwind')) {
    return 'Frameworks & Web';
  }
  if (s.includes('docker') || s.includes('kubernetes') || s.includes('aws') || s.includes('cloud') || s.includes('terraform') || s.includes('ci/cd') || s.includes('linux')) {
    return 'DevOps & Cloud';
  }
  if (s.includes('sql') || s.includes('postgres') || s.includes('mongo') || s.includes('redis') || s.includes('database')) {
    return 'Database & Storage';
  }
  if (s.includes('kafka') || s.includes('microservices') || s.includes('system design') || s.includes('grpc') || s.includes('distributed') || s.includes('dsa') || s.includes('data structure')) {
    return 'Core CS & Systems';
  }
  return 'Languages & Runtimes';
};

export const VerifiedSkillsSection = ({
  skills = [],
  onOpenSkillDetails = () => {},
  onAddSkill = () => {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Languages & Runtimes',
    'Frameworks & Web',
    'DevOps & Cloud',
    'Database & Storage',
    'Core CS & Systems',
  ];

  const enrichedSkills = useMemo(() => {
    return skills.map((sk) => {
      const name = typeof sk === 'string' ? sk : sk.name;
      const category = typeof sk === 'object' && sk.category ? sk.category : categorizeSkill(name);
      return {
        id: typeof sk === 'object' && sk.id ? sk.id : `sk-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name,
        category,
        score: typeof sk === 'object' && sk.score ? sk.score : 8.5,
        proficiency: typeof sk === 'object' && sk.proficiency ? sk.proficiency : 'Advanced',
        verifiedBy: typeof sk === 'object' && sk.verifiedBy ? sk.verifiedBy : 'Faculty Evaluation Panel',
        verifierName: typeof sk === 'object' && sk.verifierName ? sk.verifierName : 'Dr. Sarah Jenkins (CSE Department)',
        verifiedDate: typeof sk === 'object' && sk.verifiedDate ? sk.verifiedDate : 'Fall 2026 Academic Term',
        coursework: typeof sk === 'object' && sk.coursework ? sk.coursework : 'Department Core Curriculum & Project Capstone',
      };
    });
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return enrichedSkills;
    return enrichedSkills.filter((s) => s.category === selectedCategory);
  }, [enrichedSkills, selectedCategory]);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-card space-y-4" aria-label="Verified Skills & Competencies">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Verified Skills
              </h2>
              <span className="px-2 py-0.2 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {enrichedSkills.length} Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Institutional academic benchmarks validated by faculty evaluation panels.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="xs"
          onClick={onAddSkill}
          leftIcon={<Plus className="w-3 h-3 text-blue-600" />}
          className="text-xs self-start sm:self-center font-semibold"
        >
          Add Skill
        </Button>
      </div>

      {/* Category Filter Pills */}
      {enrichedSkills.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist">
          {categories.map((cat) => {
            const count = cat === 'All' ? enrichedSkills.length : enrichedSkills.filter((s) => s.category === cat).length;
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                  }
                `}
              >
                <span>{cat}</span>
                <span
                  className={`
                    px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold
                    ${isActive ? 'bg-blue-700/60 text-white' : 'bg-slate-100 text-slate-600'}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Skills Grid */}
      {enrichedSkills.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-slate-400 stroke-[1.5]" />}
          title="No Verified Skills Yet"
          description="Add your core competencies or attend faculty mock evaluations to verify your technical skills."
          action={
            <Button
              variant="primary"
              size="xs"
              onClick={onAddSkill}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Your First Skill
            </Button>
          }
          compact
        />
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-slate-400" />}
          title={`No skills under "${selectedCategory}"`}
          description="Try switching to another category or view All."
          action={
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedCategory('All')}
            >
              View All Skills
            </Button>
          }
          compact
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => onOpenSkillDetails(skill)}
              className="group p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-card-hover transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 shadow-card"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {skill.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {skill.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="success" size="xs">
                  Verified
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default VerifiedSkillsSection;
