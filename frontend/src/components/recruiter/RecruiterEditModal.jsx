import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Calendar,
  Tag,
  X,
  Plus,
} from 'lucide-react';

export const RecruiterEditModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    designation: '',
    phone: '',
    location: '',
    experienceYears: 0,
    websiteUrl: '',
    linkedinUrl: '',
    hiringDomains: [],
    hiringRoles: [],
    bio: '',
  });

  const [domainInput, setDomainInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      const u = initialData.user || {};
      const p = initialData.profile || {};

      setFormData({
        name: u.name || '',
        email: u.email || '',
        companyName: p.companyName || '',
        designation: p.designation || '',
        phone: p.phone || '',
        location: p.location || '',
        experienceYears: p.experienceYears || 0,
        websiteUrl: p.websiteUrl || '',
        linkedinUrl: p.linkedinUrl || '',
        hiringDomains: Array.isArray(p.hiringDomains) ? p.hiringDomains : [],
        hiringRoles: Array.isArray(p.hiringRoles) ? p.hiringRoles : [],
        bio: p.bio || '',
      });
      setDomainInput('');
      setRoleInput('');
      setValidationError('');
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add hiring domain tag
  const handleAddDomain = () => {
    const trimmed = domainInput.trim();
    if (!trimmed) return;
    if (formData.hiringDomains.includes(trimmed)) {
      setDomainInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      hiringDomains: [...prev.hiringDomains, trimmed],
    }));
    setDomainInput('');
  };

  const handleRemoveDomain = (domainToRemove) => {
    setFormData((prev) => ({
      ...prev,
      hiringDomains: prev.hiringDomains.filter((d) => d !== domainToRemove),
    }));
  };

  // Add hiring role tag
  const handleAddRole = () => {
    const trimmed = roleInput.trim();
    if (!trimmed) return;
    if (formData.hiringRoles.includes(trimmed)) {
      setRoleInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      hiringRoles: [...prev.hiringRoles, trimmed],
    }));
    setRoleInput('');
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData((prev) => ({
      ...prev,
      hiringRoles: prev.hiringRoles.filter((r) => r !== roleToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!formData.companyName.trim()) {
      setValidationError('Company Name is required.');
      return;
    }
    setValidationError('');
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Recruiter Profile"
      description="Update your corporate recruiter credentials, hiring preferences, and contact details."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {validationError}
          </div>
        )}

        {/* ─── 1. Identity & Company ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Rivera"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Email
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. alex.rivera@techcorp.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. TechCorp Solutions"
              leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation / Role Title
            </label>
            <Input
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Lead Technical Recruiter"
              leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* ─── 2. Contact & Location ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 234-5678"
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Office Location
            </label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India"
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experience (Years)
            </label>
            <Input
              name="experienceYears"
              type="number"
              min="0"
              max="50"
              value={formData.experienceYears}
              onChange={handleChange}
              placeholder="e.g. 5"
              leftIcon={<Calendar className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* ─── 3. Web & Links ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Careers Website
            </label>
            <Input
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://techcorp.com/careers"
              leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              LinkedIn Profile URL
            </label>
            <Input
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/alexrivera"
              leftIcon={<Linkedin className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* ─── 4. Hiring Domains / Tech Focus ───────────────────────── */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Hiring Domains & Tech Stacks
          </label>
          <div className="flex gap-2">
            <Input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDomain();
                }
              }}
              placeholder="Add domain (e.g. Full-Stack, Cloud & DevOps, AI/ML) and press Enter"
              leftIcon={<Tag className="w-4 h-4 text-slate-400" />}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDomain}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.hiringDomains.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.hiringDomains.map((domain) => (
                <span
                  key={domain}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {domain}
                  <button
                    type="button"
                    onClick={() => handleRemoveDomain(domain)}
                    className="hover:text-blue-900 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ─── 5. Target Roles for Hiring ───────────────────────────── */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            Target Hiring Roles
          </label>
          <div className="flex gap-2">
            <Input
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRole();
                }
              }}
              placeholder="Add role (e.g. SDE 1, Frontend Engineer, Data Analyst) and press Enter"
              leftIcon={<Briefcase className="w-4 h-4 text-slate-400" />}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRole}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.hiringRoles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.hiringRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="hover:text-purple-900 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ─── 6. Bio / Professional Summary ────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Recruiter Summary & About
          </label>
          <Textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Share a short bio, hiring philosophy, or campus recruitment message..."
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecruiterEditModal;
