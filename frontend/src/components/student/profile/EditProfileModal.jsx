import React, { useState, useEffect } from 'react';
import { AlertCircle, User, GraduationCap, Target, Link2, FileText } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { CAREER_TRACK_NAMES } from '../../../constants/careerTracks';

export const EditProfileModal = ({
  isOpen = false,
  onClose = () => {},
  initialData = {},
  onSubmit = () => {},
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    semester: 1,
    selectedCareer: '',
    bio: '',
    github: '',
    linkedin: '',
    portfolio: '',
    leetcode: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.name || '',
        semester: initialData.semester || 1,
        selectedCareer: initialData.selectedCareer || '',
        bio: initialData.bio || '',
        github: initialData.links?.github || '',
        linkedin: initialData.links?.linkedin || '',
        portfolio: initialData.links?.portfolio || '',
        leetcode: initialData.links?.leetcode || '',
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.selectedCareer.trim()) errs.selectedCareer = 'Career track is required.';
    if (!formData.semester || formData.semester < 1 || formData.semester > 8) {
      errs.semester = 'Semester must be between 1 and 8.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Edit Profile &amp; Professional Links"
      description="Update your academic trajectory, career statement, and external profile URLs."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {errors.submit && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <span>Full Name</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600"
          />
          {errors.name && <p className="text-xs text-rose-600 font-medium">{errors.name}</p>}
        </div>

        {/* Current Semester & Target Career */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Current Semester</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData((prev) => ({ ...prev, semester: Number(e.target.value) }))}
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
            {errors.semester && <p className="text-xs text-rose-600 font-medium">{errors.semester}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>Target Career Track</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.selectedCareer}
              onChange={(e) => setFormData((prev) => ({ ...prev, selectedCareer: e.target.value }))}
              className="w-full bg-white text-slate-900 text-sm rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Select Track --</option>
              {CAREER_TRACK_NAMES.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
            {errors.selectedCareer && (
              <p className="text-xs text-rose-600 font-medium">{errors.selectedCareer}</p>
            )}
          </div>
        </div>

        {/* Bio / Career Statement */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Career Objective &amp; Bio
          </label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Briefly describe your technical focus and placement objectives..."
            className="w-full bg-white text-slate-900 text-xs sm:text-sm rounded-lg border border-slate-200 p-2.5 transition-colors focus:outline-none focus:border-blue-600 resize-none"
          />
        </div>

        {/* Professional Links */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Professional &amp; Portfolio Links
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">GitHub URL</span>
              <input
                type="url"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">LinkedIn URL</span>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">Portfolio Website</span>
              <input
                type="url"
                placeholder="https://yourportfolio.dev"
                value={formData.portfolio}
                onChange={(e) => setFormData((prev) => ({ ...prev, portfolio: e.target.value }))}
                className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600">LeetCode URL</span>
              <input
                type="url"
                placeholder="https://leetcode.com/username"
                value={formData.leetcode}
                onChange={(e) => setFormData((prev) => ({ ...prev, leetcode: e.target.value }))}
                className="w-full bg-white text-slate-900 text-xs rounded-lg border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            loadingText="Saving Changes..."
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
