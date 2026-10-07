import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Building2, Briefcase, GraduationCap, Award } from 'lucide-react';

export const CompanyEditModal = ({
  isOpen = false,
  onClose = () => {},
  initialData = {},
  onSave = () => {},
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    oldCompanyName: '',
    name: '',
    designation: '',
    industry: '',
    location: '',
    website: '',
    targetRole: '',
    openPositions: 15,
    cgpaCutoff: '',
    eligibleBatch: '',
    eligibleDepartments: [],
    minimumMatchScore: 70,
    requiredSkills: [],
    preferredSkills: [],
    description: '',
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        companyName: initialData.companyName || '',
        oldCompanyName: initialData.companyName || '',
        name: initialData.name || '',
        designation: initialData.designation || 'Lead University Talent Partner',
        industry: initialData.industry || 'Technology & Cloud Infrastructure',
        location: initialData.location || 'Bengaluru, India',
        website: initialData.website || '',
        targetRole: initialData.targetRole || 'Distributed Systems & Cloud Platform Engineer',
        openPositions: initialData.openPositions !== undefined ? initialData.openPositions : 15,
        cgpaCutoff: initialData.cgpaCutoff || '7.5+ CGPA',
        eligibleBatch: initialData.eligibleBatch || '2026 Batch',
        eligibleDepartments: Array.isArray(initialData.eligibleDepartments) && initialData.eligibleDepartments.length > 0
          ? initialData.eligibleDepartments
          : ['Computer Science & Engineering', 'Information Technology'],
        minimumMatchScore: initialData.minimumMatchScore || 70,
        requiredSkills: Array.isArray(initialData.requiredSkills) && initialData.requiredSkills.length > 0
          ? initialData.requiredSkills
          : ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design'],
        preferredSkills: Array.isArray(initialData.preferredSkills) && initialData.preferredSkills.length > 0
          ? initialData.preferredSkills
          : ['Go', 'AWS Lambda', 'GraphQL', 'Linux Kernel'],
        description: initialData.description || '',
      });
      setNewRequiredSkill('');
      setNewPreferredSkill('');
      setNewDepartment('');
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Add / Remove Required Skill
  const handleAddRequiredSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = newRequiredSkill.trim();
    if (!trimmed) return;
    if (formData.requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewRequiredSkill('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, trimmed],
    }));
    setNewRequiredSkill('');
  };

  const handleRemoveRequiredSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  // Add / Remove Preferred Skill
  const handleAddPreferredSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = newPreferredSkill.trim();
    if (!trimmed) return;
    if (formData.preferredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewPreferredSkill('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      preferredSkills: [...prev.preferredSkills, trimmed],
    }));
    setNewPreferredSkill('');
  };

  const handleRemovePreferredSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      preferredSkills: prev.preferredSkills.filter((s) => s !== skill),
    }));
  };

  // Add / Remove Eligible Department
  const handleAddDepartment = (e) => {
    if (e) e.preventDefault();
    const trimmed = newDepartment.trim();
    if (!trimmed) return;
    if (formData.eligibleDepartments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      setNewDepartment('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      eligibleDepartments: [...prev.eligibleDepartments, trimmed],
    }));
    setNewDepartment('');
  };

  const handleRemoveDepartment = (dept) => {
    setFormData((prev) => ({
      ...prev,
      eligibleDepartments: prev.eligibleDepartments.filter((d) => d !== dept),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Lead Recruiter contact name is required.');
      return;
    }
    if (!formData.targetRole.trim()) {
      setError('Primary Hiring Role Title is required.');
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err?.message || 'Failed to update company settings.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-edit-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="company-edit-title" className="text-base font-bold text-slate-900">
                Edit Company Profile &amp; Campus Drive
              </h2>
              <p className="text-xs text-slate-500">
                Configure corporate identity, active hiring role, eligibility thresholds, and skill criteria
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Corporate Identity & Representative */}
          <div className="space-y-3.5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Corporate Identity &amp; Representative</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Google, Microsoft, TechCorp"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Industry Sector</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Cloud Infrastructure, FinTech, AI"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Lead Recruiter Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Alex Rivera"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Senior Talent Acquisition Specialist"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Headquarters / Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Bengaluru, India or Remote"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Company Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Active Role & Drive Details */}
          <div className="space-y-3.5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Active Hiring Role &amp; Open Positions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 block">Primary Role Title *</label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Distributed Systems & Cloud Platform Engineer"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Open Positions Count</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.openPositions}
                  onChange={(e) => setFormData({ ...formData, openPositions: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Role Description &amp; Drive Overview</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of the role, day-to-day responsibilities, and team charter..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Section 3: Eligibility & Cutoff Criteria */}
          <div className="space-y-3.5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Eligibility &amp; Academic Benchmark</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Academic CGPA Cutoff</label>
                <input
                  type="text"
                  value={formData.cgpaCutoff}
                  onChange={(e) => setFormData({ ...formData, cgpaCutoff: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. 7.5+ CGPA or 7.0 / 10.0"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Eligible Batches</label>
                <input
                  type="text"
                  value={formData.eligibleBatch}
                  onChange={(e) => setFormData({ ...formData, eligibleBatch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. 2026 Batch (Semesters 6 & 7)"
                />
              </div>
            </div>

            {/* Match Threshold Slider */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800 block">Minimum Match Threshold</label>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  {formData.minimumMatchScore}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={formData.minimumMatchScore}
                onChange={(e) =>
                  setFormData({ ...formData, minimumMatchScore: Number(e.target.value) })
                }
                className="w-full accent-indigo-600"
              />
              <span className="text-[11px] text-slate-500 block">
                Students scoring ≥ {formData.minimumMatchScore}% in readiness match will be highlighted as eligible candidates.
              </span>
            </div>

            {/* Eligible Departments */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block">Eligible Departments</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDepartment();
                    }
                  }}
                  placeholder="Add department (e.g. Computer Science, Information Technology)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddDepartment}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.eligibleDepartments.map((dept) => (
                  <span
                    key={dept}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-200/60"
                  >
                    <span>{dept}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDepartment(dept)}
                      className="text-indigo-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Skills Criteria */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Skill Criteria</span>
            </div>

            {/* Mandatory Required Skills */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block">Mandatory Required Skills</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequiredSkill();
                    }
                  }}
                  placeholder="Add mandatory skill (e.g. Docker, Kafka, System Design)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddRequiredSkill}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-medium border border-indigo-200/60"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequiredSkill(skill)}
                      className="text-indigo-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Electives */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block">Preferred Electives / Skills</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPreferredSkill}
                  onChange={(e) => setNewPreferredSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPreferredSkill();
                    }
                  }}
                  placeholder="Add elective skill (e.g. Go, AWS Lambda, GraphQL)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddPreferredSkill}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.preferredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePreferredSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/70 -mx-6 -mb-6 mt-6 flex items-center justify-end gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 shadow-xs"
            >
              {isSaving ? 'Saving Changes...' : 'Save Company & Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyEditModal;
