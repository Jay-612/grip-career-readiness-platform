import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { User, Mail, Building, MapPin, Phone, Award, BookOpen, Clock, Tag, X } from 'lucide-react';

const FacultyEditModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    employeeId: '',
    cabinNumber: '',
    officeHours: '',
    phone: '',
    education: '',
    specialization: [],
    researchInterests: [],
    bio: '',
  });

  const [specInput, setSpecInput] = useState('');
  const [researchInput, setResearchInput] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      const u = initialData.user || {};
      const p = initialData.profile || {};

      setFormData({
        name: u.name || '',
        email: u.email || '',
        designation: p.designation || 'Assistant Professor',
        department: p.department || 'Computer Science & Engineering',
        employeeId: p.employeeId || '',
        cabinNumber: p.cabinNumber || '',
        officeHours: p.officeHours || '',
        phone: p.phone || '',
        education: p.education || '',
        specialization: Array.isArray(p.specialization) ? p.specialization : [],
        researchInterests: Array.isArray(p.researchInterests) ? p.researchInterests : [],
        bio: p.bio || '',
      });
      setSpecInput('');
      setResearchInput('');
      setValidationError('');
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSpec = () => {
    const trimmed = specInput.trim();
    if (!trimmed) return;
    if (formData.specialization.includes(trimmed)) {
      setSpecInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      specialization: [...prev.specialization, trimmed],
    }));
    setSpecInput('');
  };

  const handleRemoveSpec = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.filter((t) => t !== tagToRemove),
    }));
  };

  const handleAddResearch = () => {
    const trimmed = researchInput.trim();
    if (!trimmed) return;
    if (formData.researchInterests.includes(trimmed)) {
      setResearchInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      researchInterests: [...prev.researchInterests, trimmed],
    }));
    setResearchInput('');
  };

  const handleRemoveResearch = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    setValidationError('');
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Faculty Profile"
      description="Update your professional credentials, academic details, and consultation availability."
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSaving}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {validationError}
          </div>
        )}

        {/* Basic Personal Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Personal & Institutional Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dr. Rajesh Kumar"
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Institutional Email"
              name="email"
              value={formData.email}
              disabled
              helperText="Institutional email is managed by university administrator"
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Associate Professor, HOD"
              leftIcon={<Award className="w-4 h-4" />}
            />

            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science & Engineering"
              leftIcon={<Building className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="e.g. FAC-2024-08"
              leftIcon={<Award className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Office & Consultation Details */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Office & Availability
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cabin / Office Location"
              name="cabinNumber"
              value={formData.cabinNumber}
              onChange={handleChange}
              placeholder="e.g. Tech Block A, Room 304"
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <Input
              label="Office / Consultation Hours"
              name="officeHours"
              value={formData.officeHours}
              onChange={handleChange}
              placeholder="e.g. Mon, Wed 2:00 PM – 4:00 PM"
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Highest Academic Qualification"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="e.g. Ph.D. in Computer Science (IIT Bombay), M.Tech"
            leftIcon={<BookOpen className="w-4 h-4" />}
          />
        </div>

        {/* Specialization Tags */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Subject Specializations
          </h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="specInput"
                value={specInput}
                onChange={(e) => setSpecInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpec();
                  }
                }}
                placeholder="Add specialization area and press enter (e.g. Cloud Computing)"
                leftIcon={<Tag className="w-4 h-4" />}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSpec}
              className="mt-6"
            >
              Add
            </Button>
          </div>

          {formData.specialization.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.specialization.map((spec, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg px-2.5 py-1 text-xs font-medium"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(spec)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Research Interests Tags */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Research Interests & Focus Areas
          </h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="researchInput"
                value={researchInput}
                onChange={(e) => setResearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddResearch();
                  }
                }}
                placeholder="Add research topic (e.g. Distributed Consensus, LLMs)"
                leftIcon={<Tag className="w-4 h-4" />}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddResearch}
              className="mt-6"
            >
              Add
            </Button>
          </div>

          {formData.researchInterests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.researchInterests.map((interest, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-lg px-2.5 py-1 text-xs font-medium"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveResearch(interest)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Biography */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Professional Biography
          </h4>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Share your academic background, research interests, teaching philosophy, and guidance focus..."
            helperText="Visible to students during mock interview scheduling and guidance requests."
          />
        </div>
      </form>
    </Modal>
  );
};

export default FacultyEditModal;
