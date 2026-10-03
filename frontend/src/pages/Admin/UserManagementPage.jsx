import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import adminService from '../../services/adminService';
import UserDetailsDrawer from '../../components/admin/UserDetailsDrawer';
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

  // Drawer & Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  const handleViewUser = (u) => {
    setSelectedUser(u);
    setIsDrawerOpen(true);
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

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage system users, assigned roles, and institutional credentials.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-xs self-start sm:self-auto"
        >
          Add User
        </Button>
      </div>

      {/* Compact Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Users' },
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeRole === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <Button type="submit" size="xs" variant="secondary">
            Filter
          </Button>
        </form>
      </div>

      {/* User Table (Clean & Scannable) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Affiliation / Career</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="py-4 px-4">
                      <Skeleton className="h-6 w-full" />
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
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{u.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono block truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="primary" size="xs">
                        {u.role}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {u.role === 'student' && (
                        <span>
                          Sem {u.profile?.semester || 1} • {u.profile?.selectedCareer || 'Exploring'}
                        </span>
                      )}
                      {u.role === 'faculty' && (
                        <span>
                          {u.profile?.department || 'CSE'} {u.profile?.isHOD && '(HOD)'}
                        </span>
                      )}
                      {u.role === 'alumni' && (
                        <span>
                          {u.profile?.jobRole || 'Engineer'} @ {u.profile?.currentCompany || 'Partner'}
                        </span>
                      )}
                      {u.role === 'recruiter' && (
                        <span>
                          {u.profile?.designation || 'Lead'} @ {u.profile?.companyName || 'Hiring'}
                        </span>
                      )}
                      {u.role === 'admin' && (
                        <span className="text-slate-400">Institutional Governance</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewUser(u)}
                          title="View Details"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit User"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete User"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
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
        <div className="flex items-center justify-between p-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} users)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Details Drawer */}
      <UserDetailsDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUser(null);
        }}
        onEdit={(u) => handleOpenEditModal(u)}
      />

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Platform Account"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
              placeholder="e.g. John Doe"
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
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                placeholder="user@campus.edu"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Temporary Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni Mentor</option>
              <option value="recruiter">Corporate Recruiter</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile"
        size="md"
      >
        <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
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
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                placeholder="Leave blank to keep unchanged"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Account Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="alumni">Alumni Mentor</option>
              <option value="recruiter">Corporate Recruiter</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
            >
              {isSubmitting ? 'Saving...' : 'Save Updates'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
