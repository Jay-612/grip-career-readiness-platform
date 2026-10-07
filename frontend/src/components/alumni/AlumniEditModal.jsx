import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Checkbox from '../common/Checkbox';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Linkedin,
  Github,
  Tag,
  X,
  Compass,
} from 'lucide-react';

const AlumniEditModal = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentCompany: '',
    jobRole: '',
    graduationYear: new Date().getFullYear(),
    department: 'Computer Science & Engineering',
    location: '',
    phone: '',
    linkedinUrl: '',
    githubUrl: '',
    isAvailableForMentorship: true,
    skills: [],
    mentorshipTopics: [],
    bio: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      const u = initialData.user || {};
      const p = initialData.profile || {};

      setFormData({
        name: u.name || '',
        email: u.email || '',
        currentCompany: p.currentCompany || '',
        jobRole: p.jobRole || '',
        graduationYear: p.graduationYear || new Date().getFullYear(),
        department: p.department || 'Computer Science & Engineering',
        location: p.location || '',
        phone: p.phone || '',
        linkedinUrl: p.linkedinUrl || '',
        githubUrl: p.githubUrl || '',
        isAvailableForMentorship: p.isAvailableForMentorship !== false,
        skills: Array.isArray(p.skills) ? p.skills : [],
        mentorshipTopics: Array.isArray(p.mentorshipTopics) ? p.mentorshipTopics : [],
        bio: p.bio || '',
      });
      setSkillInput('');
      setTopicInput('');
      setValidationError('');
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setSkillInput('');
  };

  const handleRemoveSkill = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== tagToRemove),
    }));
  };

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (formData.mentorshipTopics.includes(trimmed)) {
      setTopicInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      mentorshipTopics: [...prev.mentorshipTopics, trimmed],
    }));
    setTopicInput('');
  };

  const handleRemoveTopic = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      mentorshipTopics: prev.mentorshipTopics.filter((t) => t !== tagToRemove),
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
      title="Edit Alumni Profile"
      description="Update your industry credentials, mentorship preferences, and professional contact links."
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

        {/* Identity & Company */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Identity & Professional Role
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Rivera"
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              name="email"
              value={formData.email}
              disabled
              helperText="Managed by campus login credentials"
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Company"
              name="currentCompany"
              value={formData.currentCompany}
              onChange={handleChange}
              placeholder="e.g. Google, Microsoft, Adobe"
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <Input
              label="Job Role / Title"
              name="jobRole"
              value={formData.jobRole}
              onChange={handleChange}
              placeholder="e.g. Senior Software Engineer"
              leftIcon={<Briefcase className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Graduation Year"
              name="graduationYear"
              type="number"
              value={formData.graduationYear}
              onChange={handleChange}
              placeholder="e.g. 2022"
              leftIcon={<GraduationCap className="w-4 h-4" />}
            />

            <Input
              label="Department / Degree"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science & Engineering"
              leftIcon={<GraduationCap className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, Karnataka"
              leftIcon={<MapPin className="w-4 h-4" />}
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

        {/* Professional Links */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Professional Links & Profiles
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="LinkedIn URL"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              leftIcon={<Linkedin className="w-4 h-4 text-blue-600" />}
            />

            <Input
              label="GitHub URL"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username"
              leftIcon={<Github className="w-4 h-4 text-slate-700" />}
            />
          </div>
        </div>

        {/* Mentorship Preference */}
        <div className="pt-3 border-t border-slate-100">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">Available for Student Mentorship</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When enabled, students can submit guidance inquiries and request mock interview feedback.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                name="isAvailableForMentorship"
                checked={formData.isAvailableForMentorship}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Technical Skills & Tech Stack
          </h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="skillInput"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill (e.g. React, Kubernetes, Go) and press Enter"
                leftIcon={<Tag className="w-4 h-4" />}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSkill}
              className="mt-6"
            >
              Add
            </Button>
          </div>

          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg px-2.5 py-1 text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mentorship Topics Tags */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Mentorship Topics
          </h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="topicInput"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                placeholder="Add topic (e.g. System Design, Resume Review, FAANG Transition)"
                leftIcon={<Compass className="w-4 h-4" />}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTopic}
              className="mt-6"
            >
              Add
            </Button>
          </div>

          {formData.mentorshipTopics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.mentorshipTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg px-2.5 py-1 text-xs font-medium"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(topic)}
                    className="hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Professional Bio & Student Advice
          </h4>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Share your transition from campus to your current company, advice for students preparing for placements, and areas you love to mentor in..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AlumniEditModal;
