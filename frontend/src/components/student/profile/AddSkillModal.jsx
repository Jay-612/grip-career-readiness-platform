import React, { useState } from 'react';
import { X, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'Technical',
  'Frontend',
  'Backend',
  'Cloud & DevOps',
  'Data & AI',
  'Tools & Methods',
  'Soft Skills'
];

const PROFICIENCY_LEVELS = [
  { label: 'Beginner', value: 'Beginner', defaultScore: 40 },
  { label: 'Intermediate', value: 'Intermediate', defaultScore: 70 },
  { label: 'Advanced', value: 'Advanced', defaultScore: 90 },
];

export const AddSkillModal = ({ isOpen, onClose, onAddSkill }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState('Intermediate');
  const [score, setScore] = useState(70);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Skill name is required');
      return;
    }

    onAddSkill({
      name: name.trim(),
      category,
      level,
      score: Number(score),
      evidenceUrl: evidenceUrl.trim(),
      verified: true, // Auto-verified for student demo/portfolio
      verifiedBy: 'Self-Submitted & Faculty Queued',
      verificationDate: new Date().toISOString().split('T')[0]
    });

    setName('');
    setError('');
    setEvidenceUrl('');
    onClose();
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    const found = PROFICIENCY_LEVELS.find(p => p.value === newLevel);
    if (found) setScore(found.defaultScore);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Add Verified Skill</h3>
              <p className="text-xs text-slate-500">Record a skill to your institutional competency record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Skill Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Next.js, Docker, Kubernetes, GraphQL"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Proficiency Level
              </label>
              <select
                value={level}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 bg-white"
              >
                {PROFICIENCY_LEVELS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Demonstrated Score
              </label>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {score}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Proof / GitHub Project URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;
