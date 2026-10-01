import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Briefcase,
  UserCheck,
  ShieldCheck,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Pagination
  const [activeRole, setActiveRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    semester: 1,
    selectedCareer: '',
    department: 'Computer Science & Engineering',
    employeeId: '',
    isHOD: false,
    currentCompany: '',
    jobRole: '',
    companyName: '',
    designation: '',
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const data = await adminService.getUsers({
        page: currentPage,
        limit: 10,
        role: activeRole,
        search: searchQuery,
      });
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeRole, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: activeRole !== 'all' ? activeRole : 'student',
      semester: 1,
      selectedCareer: '',
      department: 'Computer Science & Engineering',
      employeeId: '',
      isHOD: false,
      currentCompany: '',
      jobRole: '',
      companyName: '',
      designation: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      semester: u.profile?.semester || 1,
      selectedCareer: u.profile?.selectedCareer || '',
      department: u.profile?.department || 'Computer Science & Engineering',
      employeeId: u.profile?.employeeId || '',
      isHOD: u.profile?.isHOD || false,
      currentCompany: u.profile?.currentCompany || '',
      jobRole: u.profile?.jobRole || '',
      companyName: u.profile?.companyName || '',
      designation: u.profile?.designation || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profileData: {},
      };

      if (formData.role === 'student') {
        payload.profileData = {
          semester: Number(formData.semester),
          selectedCareer: formData.selectedCareer,
        };
      } else if (formData.role === 'faculty') {
        payload.profileData = {
          department: formData.department,
          employeeId: formData.employeeId,
          isHOD: formData.isHOD,
        };
      } else if (formData.role === 'alumni') {
        payload.profileData = {
          currentCompany: formData.currentCompany,
          jobRole: formData.jobRole,
        };
      } else if (formData.role === 'recruiter') {
        payload.profileData = {
          companyName: formData.companyName,
          designation: formData.designation,
        };
      }

      await adminService.createUser(payload);
      showToast(`User ${formData.name} created successfully`);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        profileData: {},
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      if (formData.role === 'student') {
        payload.profileData = {
          semester: Number(formData.semester),
          selectedCareer: formData.selectedCareer,
        };
      } else if (formData.role === 'faculty') {
        payload.profileData = {
          department: formData.department,
          employeeId: formData.employeeId,
          isHOD: formData.isHOD,
        };
      } else if (formData.role === 'alumni') {
        payload.profileData = {
          currentCompany: formData.currentCompany,
          jobRole: formData.jobRole,
        };
      } else if (formData.role === 'recruiter') {
        payload.profileData = {
          companyName: formData.companyName,
          designation: formData.designation,
        };
      }

      await adminService.updateUser(editingUser.id, payload);
      showToast(`User ${formData.name} updated successfully`);
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      await adminService.deleteUser(user.id);
      showToast(`User "${user.name}" removed successfully`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const roleBadges = {
    student: <Badge variant="primary" size="xs">Student</Badge>,
    faculty: <Badge variant="info" size="xs">Faculty</Badge>,
    alumni: <Badge variant="tier1" size="xs">Alumni</Badge>,
    recruiter: <Badge variant="warning" size="xs">Recruiter</Badge>,
    admin: <Badge variant="danger" size="xs">Admin</Badge>,
  };

  return (
    <main className="space-y-6 pb-12 antialiased" aria-label="User Directory & RBAC Governance">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User Directory & Access Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated accounts, assign institutional roles, and configure student profiles.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          Add New User
        </Button>
      </div>

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'student', label: 'Students' },
              { id: 'faculty', label: 'Faculty' },
              { id: 'alumni', label: 'Alumni' },
              { id: 'recruiter', label: 'Recruiters' },
              { id: 'admin', label: 'Admins' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveRole(tab.id);
                  setCurrentPage(1);
                }}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer
                  ${
                    activeRole === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <Button type="submit" variant="secondary" size="xs">
              Search
            </Button>
          </form>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-y border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Role Profile Details</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="py-4 px-4">
                      <Skeleton variant="text" height="24px" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{roleBadges[u.role] || u.role}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {u.role === 'student' && (
                        <span>
                          Sem {u.profile?.semester || 1} •{' '}
                          {u.profile?.selectedCareer ? (
                            <strong className="text-blue-700">{u.profile.selectedCareer}</strong>
                          ) : (
                            <span className="italic text-slate-400">Exploring</span>
                          )}{' '}
                          • Readiness: <strong>{u.profile?.readinessScore || 0}%</strong>
                        </span>
                      )}
                      {u.role === 'faculty' && (
                        <span>
                          {u.profile?.department || 'CSE'}{' '}
                          {u.profile?.isHOD && <span className="font-bold text-indigo-600">(HOD)</span>}
                        </span>
                      )}
                      {u.role === 'alumni' && (
                        <span>
                          {u.profile?.jobRole || 'Engineer'} @ {u.profile?.currentCompany || 'Partner'}
                        </span>
                      )}
                      {u.role === 'recruiter' && (
                        <span>
                          {u.profile?.designation || 'Talent Lead'} @ {u.profile?.companyName || 'Hiring'}
                        </span>
                      )}
                      {u.role === 'admin' && <span className="text-slate-400 font-medium">Institutional Administrator</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit user"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete user"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total users)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ─── ADD USER MODAL ───────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Institutional User"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Maya Patel"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="maya.patel@campus.edu"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Temporary password"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">System Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            >
              <option value="student">Student (Preparing for Placement)</option>
              <option value="faculty">Faculty Member / Advisor</option>
              <option value="alumni">Alumni Mentor</option>
              <option value="recruiter">Recruiter / Hiring Partner</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          {/* Dynamic Role Profile Fields */}
          {formData.role === 'student' && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3">
              <span className="font-bold text-blue-900 block text-xs">Student Profile Specifics</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Semester (1 - 8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Career Track</label>
                  <input
                    type="text"
                    value={formData.selectedCareer}
                    onChange={(e) => setFormData({ ...formData, selectedCareer: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="e.g. Distributed Systems"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'faculty' && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
              <span className="font-bold text-indigo-900 block text-xs">Faculty Specifics</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="FAC-CSE-001"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'alumni' && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
              <span className="font-bold text-emerald-900 block text-xs">Alumni Specifics</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={formData.currentCompany}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="e.g. Google"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Job Role</label>
                  <input
                    type="text"
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="Senior Cloud Architect"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'recruiter' && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <span className="font-bold text-amber-900 block text-xs">Recruiter Specifics</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="e.g. Microsoft"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    placeholder="Campus Recruiter"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
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
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── EDIT USER MODAL ──────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile & Credentials"
        size="md"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reset Password (Optional)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Leave blank to preserve"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty Member</option>
              <option value="alumni">Alumni Mentor</option>
              <option value="recruiter">Recruiter Partner</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
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
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default UserManagementPage;
