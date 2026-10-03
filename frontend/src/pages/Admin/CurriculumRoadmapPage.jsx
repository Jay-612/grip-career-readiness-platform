import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Users,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Eye,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const CurriculumRoadmapPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal State (Progressive disclosure for inspect)
  const [viewingRoadmap, setViewingRoadmap] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    careerName: '',
    description: '',
    requiredSkillsStr: '',
    semesterPlans: [
      { semesterNumber: 1, subjectsStr: '' },
      { semesterNumber: 2, subjectsStr: '' },
      { semesterNumber: 3, subjectsStr: '' },
      { semesterNumber: 4, subjectsStr: '' },
    ],
  });

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const data = await adminService.getRoadmaps();
      setRoadmaps(data.roadmaps || []);
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
      setError(err.response?.data?.message || 'Failed to load career curriculum roadmaps.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedRoadmapId(null);
    setFormData({
      careerName: '',
      description: '',
      requiredSkillsStr: '',
      semesterPlans: [
        { semesterNumber: 1, subjectsStr: '' },
        { semesterNumber: 2, subjectsStr: '' },
        { semesterNumber: 3, subjectsStr: '' },
        { semesterNumber: 4, subjectsStr: '' },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rm) => {
    setIsEditing(true);
    setSelectedRoadmapId(rm.id);
    const existingPlans = (rm.semesterPlans || []).map((sp) => ({
      semesterNumber: sp.semesterNumber,
      subjectsStr: (sp.subjects || []).join(', '),
    }));

    setFormData({
      careerName: rm.careerName,
      description: rm.description || '',
      requiredSkillsStr: (rm.requiredSkills || []).join(', '),
      semesterPlans: existingPlans.length > 0 ? existingPlans : [{ semesterNumber: 1, subjectsStr: '' }],
    });
    setIsModalOpen(true);
  };

  const handleAddSemesterRow = () => {
    const nextSem = formData.semesterPlans.length + 1;
    if (nextSem > 8) return;
    setFormData({
      ...formData,
      semesterPlans: [...formData.semesterPlans, { semesterNumber: nextSem, subjectsStr: '' }],
    });
  };

  const handleRemoveSemesterRow = (index) => {
    const updated = formData.semesterPlans.filter((_, idx) => idx !== index);
    setFormData({ ...formData, semesterPlans: updated });
  };

  const handleSemesterSubjectsChange = (index, value) => {
    const updated = [...formData.semesterPlans];
    updated[index].subjectsStr = value;
    setFormData({ ...formData, semesterPlans: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.careerName.trim()) return;
    setIsSubmitting(true);

    try {
      const skills = formData.requiredSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const plans = formData.semesterPlans
        .filter((p) => p.subjectsStr && p.subjectsStr.trim().length > 0)
        .map((p) => ({
          semesterNumber: p.semesterNumber,
          subjects: p.subjectsStr.split(',').map((s) => s.trim()).filter((s) => s.length > 0),
        }));

      const payload = {
        careerName: formData.careerName.trim(),
        description: formData.description.trim(),
        requiredSkills: skills,
        semesterPlans: plans,
      };

      if (isEditing && selectedRoadmapId) {
        await adminService.updateRoadmap(selectedRoadmapId, payload);
        showToast(`Career track "${formData.careerName}" updated successfully`);
      } else {
        await adminService.createRoadmap(payload);
        showToast(`Career track "${formData.careerName}" created successfully`);
      }

      setIsModalOpen(false);
      fetchRoadmaps();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save career roadmap.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rm) => {
    if (!window.confirm(`Are you sure you want to delete the career roadmap for "${rm.careerName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteRoadmap(rm.id);
      showToast(`Career track "${rm.careerName}" deleted successfully`);
      fetchRoadmaps();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete roadmap.');
    }
  };

  const filteredRoadmaps = roadmaps.filter((rm) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rm.careerName.toLowerCase().includes(q) ||
      (rm.requiredSkills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <main className="space-y-6 pb-12 antialiased max-w-7xl mx-auto" aria-label="Curriculum Management">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Curriculum
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage degree career tracks, required competencies, and semester learning plans.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          Add Career Track
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tracks by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Showing {filteredRoadmaps.length} of {roadmaps.length} tracks
        </span>
      </div>

      {/* Curriculum Table / List View */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton variant="text" className="h-6 w-1/4" />
          <Skeleton variant="card" className="h-48" />
        </div>
      ) : roadmaps.length === 0 ? (
        <EmptyState
          icon={<Compass className="w-8 h-8 text-slate-400" />}
          title="No Career Roadmaps Configured"
          description="Create your first engineering career roadmap to power the student discovery quiz and semester learning paths."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAddModal} leftIcon={<Plus className="w-4 h-4" />}>
              Create Roadmap Track
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Track / Career</th>
                  <th className="py-3 px-4">Required Skills</th>
                  <th className="py-3 px-4">Semester Plans</th>
                  <th className="py-3 px-4 text-center">Enrolled</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoadmaps.map((rm) => (
                  <tr key={rm.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 min-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{rm.careerName}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {rm.description || 'Specialized engineering curriculum track'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(rm.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {(rm.requiredSkills || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium px-1 self-center">
                            +{(rm.requiredSkills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {(rm.semesterPlans || []).length} Semesters
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 text-xs">
                        {rm.enrolledStudents || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingRoadmap(rm)}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rm)}
                          title="Edit Track"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rm)}
                          title="Delete Track"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── DETAILS MODAL (PROGRESSIVE DISCLOSURE) ──────────────── */}
      {viewingRoadmap && (
        <Modal
          isOpen={Boolean(viewingRoadmap)}
          onClose={() => setViewingRoadmap(null)}
          title={viewingRoadmap.careerName}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Description
              </span>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {viewingRoadmap.description || 'No detailed syllabus overview provided.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Target Competency Skills ({(viewingRoadmap.requiredSkills || []).length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(viewingRoadmap.requiredSkills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Semester Learning Milestones
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(viewingRoadmap.semesterPlans || []).map((sp) => (
                  <div key={sp.semesterNumber} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800">Sem {sp.semesterNumber}: </span>
                    <span className="text-slate-600">{(sp.subjects || []).join(' • ') || 'General Technical Electives'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingRoadmap(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── ADD / EDIT MODAL ─────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Career Track & Curriculum' : 'Add New Career Track'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Career Track Title *</label>
            <input
              type="text"
              required
              value={formData.careerName}
              onChange={(e) => setFormData({ ...formData, careerName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Distributed Systems & Cloud Backend Engineer"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Track Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              placeholder="Overview of syllabus focus, hiring expectations, and learning outcomes..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Required Skills (comma-separated) *
            </label>
            <input
              type="text"
              required
              value={formData.requiredSkillsStr}
              onChange={(e) => setFormData({ ...formData, requiredSkillsStr: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Go, Kubernetes, Microservices, Distributed Caching, gRPC"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              These skill tags are matched directly against recruiter requirements for company matching.
            </p>
          </div>

          {/* Semester Milestones Editor */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                Semester Learning Milestones (1 to 8)
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddSemesterRow}
                disabled={formData.semesterPlans.length >= 8}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Semester
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formData.semesterPlans.map((plan, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-16 font-bold text-slate-700 text-xs shrink-0">
                    Sem {plan.semesterNumber}
                  </span>
                  <input
                    type="text"
                    value={plan.subjectsStr}
                    onChange={(e) => handleSemesterSubjectsChange(idx, e.target.value)}
                    placeholder="Subjects / Focus areas (comma separated)"
                    className="flex-1 p-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  {formData.semesterPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSemesterRow(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Remove Semester"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isEditing ? 'Save Changes' : 'Create Career Track'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default CurriculumRoadmapPage;
