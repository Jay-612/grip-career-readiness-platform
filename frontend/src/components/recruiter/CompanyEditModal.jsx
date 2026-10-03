import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';

export const CompanyEditModal = ({
  isOpen = false,
  onClose = () => {},
  initialData = {},
  onSave = () => {},
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    companyName: initialData.companyName || '',
    designation: initialData.designation || '',
    name: initialData.name || '',
    minimumMatchScore: initialData.minimumMatchScore || 70,
    requiredSkills: initialData.requiredSkills || ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'System Design'],
  });
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        companyName: initialData.companyName || '',
        designation: initialData.designation || '',
        name: initialData.name || '',
        minimumMatchScore: initialData.minimumMatchScore || 70,
        requiredSkills: initialData.requiredSkills || ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'System Design'],
      });
      setNewSkill('');
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (formData.requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkill('');
      return;
    }
    setFormData({
      ...formData,
      requiredSkills: [...formData.requiredSkills, trimmed],
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Recruiter contact name is required.');
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err?.message || 'Failed to update company settings.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-edit-title"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 id="company-edit-title" className="text-base font-bold text-slate-900">
              Edit Company &amp; Hiring Drive
            </h2>
            <p className="text-xs text-slate-500">
              Update corporate identity, representative info, and skill thresholds
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Company Name *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g. TechCorp Solutions"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Lead Recruiter Name *</label>
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
              <label className="font-bold text-slate-700 block">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. University Talent Partner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 block">Minimum Match Threshold</label>
              <span className="font-mono font-bold text-indigo-600">
                {formData.minimumMatchScore}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={formData.minimumMatchScore}
              onChange={(e) =>
                setFormData({ ...formData, minimumMatchScore: Number(e.target.value) })
              }
              className="w-full accent-indigo-600"
            />
            <span className="text-[11px] text-slate-400 block">
              Students meeting or exceeding this match % will be flagged as eligible.
            </span>
          </div>

          {/* Required Skills Manager */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Required Technical Skills</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add required skill (e.g. Python, AWS)..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/60 -mx-5 -mb-5 mt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyEditModal;
