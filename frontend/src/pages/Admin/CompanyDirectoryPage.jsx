import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Target,
  Users,
  CheckCircle2,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const CompanyDirectoryPage = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    requiredSkillsStr: '',
    minimumMatchScore: 60,
  });

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const data = await adminService.getCompanies();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError(err.response?.data?.message || 'Failed to load hiring partner companies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedCompanyId(null);
    setFormData({
      companyName: '',
      requiredSkillsStr: '',
      minimumMatchScore: 60,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setIsEditing(true);
    setSelectedCompanyId(c.id);
    setFormData({
      companyName: c.companyName,
      requiredSkillsStr: (c.requiredSkills || []).join(', '),
      minimumMatchScore: c.minimumMatchScore || 60,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) return;
    setIsSubmitting(true);

    try {
      const skills = formData.requiredSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        companyName: formData.companyName.trim(),
        requiredSkills: skills,
        minimumMatchScore: Number(formData.minimumMatchScore),
      };

      if (isEditing && selectedCompanyId) {
        await adminService.updateCompany(selectedCompanyId, payload);
        showToast(`Company "${formData.companyName}" updated successfully`);
      } else {
        await adminService.createCompany(payload);
        showToast(`Company "${formData.companyName}" registered successfully`);
      }

      setIsModalOpen(false);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save company profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to remove hiring partner "${c.companyName}"?`)) {
      return;
    }
    try {
      await adminService.deleteCompany(c.id);
      showToast(`Company "${c.companyName}" removed`);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete company.');
    }
  };

  return (
    <main className="space-y-6 pb-12 antialiased" aria-label="Placement Hiring Partner Companies">
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
            Hiring Partner Companies & Placement Criteria
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain campus visiting companies, technical skill requirements, and minimum placement readiness cutoffs (SRS R.5).
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          Register Company Partner
        </Button>
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8 text-slate-400" />}
          title="No Hiring Partner Companies Listed"
          description="Register visiting campus recruiters and companies to unlock student placement matching."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
              Add First Company
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <article
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.companyName}</h3>
                      <span className="text-[11px] text-slate-400">Institutional Recruiter</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      title="Edit Company"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      title="Delete Company"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Readiness Cutoff */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="text-slate-500">Readiness Cutoff:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    ≥ {c.minimumMatchScore}% Score
                  </span>
                </div>

                {/* Eligible Students Count */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Eligible Candidates:</span>
                  </span>
                  <strong className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {c.eligibleStudentsCount || 0} Students
                  </strong>
                </div>

                {/* Required Skills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Required Hiring Skills
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(c.requiredSkills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Ref: {c.id.slice(-6).toUpperCase()}</span>
                <span className="text-emerald-600 font-semibold">Active Hiring Partner</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ─────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Hiring Partner Criteria' : 'Register New Hiring Partner'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company / Organization Name *</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Cisco Systems"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Minimum Placement Readiness Score Cutoff (0 - 100%) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.minimumMatchScore}
                onChange={(e) => setFormData({ ...formData, minimumMatchScore: e.target.value })}
                className="flex-1"
              />
              <span className="w-14 text-center font-mono font-bold text-xs bg-slate-100 py-1.5 px-2 rounded-lg border border-slate-200">
                {formData.minimumMatchScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Students achieving at or above this readiness score will automatically match with this company.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Required Technical Skills (comma-separated) *
            </label>
            <input
              type="text"
              required
              value={formData.requiredSkillsStr}
              onChange={(e) => setFormData({ ...formData, requiredSkillsStr: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Python, Docker, Networking, Linux, Algorithms"
            />
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
              {isEditing ? 'Save Changes' : 'Register Partner'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default CompanyDirectoryPage;
