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
  Search,
  Eye,
  Percent,
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
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal State
  const [viewingCompany, setViewingCompany] = useState(null);

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

  const filteredCompanies = companies.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      (c.requiredSkills || []).some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <main className="space-y-6 pb-12 antialiased max-w-7xl mx-auto" aria-label="Company Management">
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
            Companies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage partner profiles, hiring eligibility thresholds, and required skills for placement drives.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          Register Company Partner
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search companies by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Showing {filteredCompanies.length} of {companies.length} companies
        </span>
      </div>

      {/* Companies Table View */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton variant="text" className="h-6 w-1/4" />
          <Skeleton variant="card" className="h-48" />
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
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Required Skills</th>
                  <th className="py-3 px-4 text-center">Readiness Cutoff</th>
                  <th className="py-3 px-4 text-center">Eligible Pool</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 min-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{c.companyName}</div>
                          <div className="text-[11px] text-slate-400">Institutional Recruiter</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(c.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                          >
                            {skill}
                          </span>
                        ))}
                        {(c.requiredSkills || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium px-1 self-center">
                            +{(c.requiredSkills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-xs">
                        ≥ {c.minimumMatchScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded text-xs">
                        <Users className="w-3 h-3 text-emerald-600" />
                        {c.eligibleStudentsCount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingCompany(c)}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Company"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Delete Company"
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
      {viewingCompany && (
        <Modal
          isOpen={Boolean(viewingCompany)}
          onClose={() => setViewingCompany(null)}
          title={viewingCompany.companyName}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  Readiness Cutoff
                </span>
                <span className="text-base font-bold text-blue-600 font-mono">
                  ≥ {viewingCompany.minimumMatchScore}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  Eligible Students
                </span>
                <span className="text-base font-bold text-emerald-600 font-mono">
                  {viewingCompany.eligibleStudentsCount || 0} Candidates
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Target Hiring Skills ({(viewingCompany.requiredSkills || []).length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(viewingCompany.requiredSkills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-500">
              <span>Partner Reference ID:</span>
              <code className="font-mono text-slate-800 font-bold">{viewingCompany.id}</code>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingCompany(null)}>
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
        title={isEditing ? 'Edit Company Partner' : 'Register Company Partner'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Amazon Web Services, Cisco, Thoughtworks"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Minimum Readiness Score Cutoff (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={formData.minimumMatchScore}
              onChange={(e) => setFormData({ ...formData, minimumMatchScore: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Students whose calculated composite readiness matches or exceeds this threshold will be qualified.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Required Hiring Skills (comma-separated) *
            </label>
            <input
              type="text"
              required
              value={formData.requiredSkillsStr}
              onChange={(e) => setFormData({ ...formData, requiredSkillsStr: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. React, Node.js, TypeScript, SQL, Docker"
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
