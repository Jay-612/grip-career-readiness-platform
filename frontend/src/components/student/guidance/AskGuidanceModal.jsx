import React, { useState } from 'react';
import {
  MessageSquare,
  GraduationCap,
  Briefcase,
  Send,
  User,
  AlertCircle,
  Sparkles,
  Building,
  Search,
  Check,
} from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const AskGuidanceModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  isSubmitting = false,
  facultyList = [],
  alumniList = [],
}) => {
  // Step 1: Recipient Type ('faculty' | 'alumni')
  const [recipientType, setRecipientType] = useState('faculty');

  // Selected Mentor
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedAlumniId, setSelectedAlumniId] = useState('');
  const [alumniSearchQuery, setAlumniSearchQuery] = useState('');

  // Topic & Question
  const [selectedTopic, setSelectedTopic] = useState('Technical Guidance');
  const [questionText, setQuestionText] = useState('');
  const [formError, setFormError] = useState('');

  const FACULTY_TOPICS = [
    'Technical Guidance',
    'Career Guidance',
    'Placement Preparation',
    'Resume Guidance',
    'Skill Development',
    'Higher Studies',
    'Other',
  ];

  const ALUMNI_TOPICS = [
    'Career Journey',
    'Company Interview',
    'Referral Guidance',
    'Technology / Skills',
    'Placement Preparation',
    'Industry Advice',
    'Higher Studies',
    'Other',
  ];

  const filteredAlumni = alumniList.filter((a) => {
    if (!alumniSearchQuery.trim()) return true;
    const q = alumniSearchQuery.toLowerCase();
    return (
      (a.name || '').toLowerCase().includes(q) ||
      (a.currentCompany || '').toLowerCase().includes(q) ||
      (a.currentRole || '').toLowerCase().includes(q) ||
      (a.department || '').toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (recipientType === 'faculty') {
      if (!selectedFacultyId) {
        setFormError('Please select a faculty member.');
        return;
      }
    } else {
      if (!selectedAlumniId) {
        setFormError('Please select an alumni mentor.');
        return;
      }
    }

    if (!questionText.trim()) {
      setFormError('Please write your guidance question.');
      return;
    }

    if (questionText.trim().length < 10) {
      setFormError('Please write at least 10 characters so your mentor has sufficient context.');
      return;
    }

    if (recipientType === 'faculty') {
      const chosen = facultyList.find((f) => (f.id || f._id) === selectedFacultyId);
      onSubmit({
        recipientType: 'faculty',
        targetFacultyId: selectedFacultyId,
        facultyName: chosen?.name || 'Faculty Member',
        topic: selectedTopic,
        question: questionText.trim(),
      });
    } else {
      const chosen = alumniList.find((a) => (a.id || a._id) === selectedAlumniId);
      onSubmit({
        recipientType: 'alumni',
        targetAlumniId: selectedAlumniId,
        alumniName: chosen?.name || 'Alumni Mentor',
        topic: selectedTopic,
        question: questionText.trim(),
      });
    }
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setFormError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Ask for Guidance"
      description="Connect directly with faculty advisors or alumni mentors for personalized guidance."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1" data-testid="ask-guidance-form">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Step 1: Who would you like guidance from? */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Who would you like guidance from?
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setRecipientType('faculty');
                setSelectedTopic('Technical Guidance');
                setFormError('');
              }}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                recipientType === 'faculty'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-1 ring-blue-600/20 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  recipientType === 'faculty' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Faculty Member</p>
                <p className="text-[11px] text-slate-500 font-normal">Department advisors & professors</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRecipientType('alumni');
                setSelectedTopic('Career Journey');
                setFormError('');
              }}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                recipientType === 'alumni'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-600/20 font-semibold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  recipientType === 'alumni' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Alumni Mentor</p>
                <p className="text-[11px] text-slate-500 font-normal">Industry pros & working alumni</p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2A: Faculty Selection Flow */}
        {recipientType === 'faculty' && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Select Faculty Advisor</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => {
                setSelectedFacultyId(e.target.value);
                setFormError('');
              }}
              className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 transition focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 hover:border-slate-300"
              required
            >
              <option value="">-- Choose a Faculty Member --</option>
              {facultyList.map((f) => (
                <option key={f.id || f._id} value={f.id || f._id}>
                  {f.name} — {f.department || 'Computer Science'} ({f.designation || 'Faculty Member'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step 2B: Alumni Selection Flow (Compact Searchable List) */}
        {recipientType === 'alumni' && (
          <div className="space-y-1.5 animate-fadeIn">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Select Alumni Mentor</span>
              <span className="text-rose-500">*</span>
            </label>

            {/* Compact Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={alumniSearchQuery}
                onChange={(e) => setAlumniSearchQuery(e.target.value)}
                placeholder="Search alumni by name, company, role, or department..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Compact List */}
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
              {filteredAlumni.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No alumni mentors match your search query.
                </div>
              ) : (
                filteredAlumni.map((a) => {
                  const aId = a.id || a._id;
                  const isSelected = selectedAlumniId === aId;
                  return (
                    <button
                      key={aId}
                      type="button"
                      onClick={() => {
                        setSelectedAlumniId(aId);
                        setFormError('');
                      }}
                      className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 font-semibold text-indigo-950'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{a.name}</span>
                          {a.graduationYear && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                              Class of '{String(a.graduationYear).slice(-2)}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <span>{a.currentRole || 'Professional'}</span>
                          <span>at</span>
                          <strong className="text-slate-700">{a.currentCompany || 'Tech'}</strong>
                          <span>•</span>
                          <span>{a.department || 'Engineering'}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Step 3: Select Topic */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Topic</span>
            <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 p-2.5 transition focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 hover:border-slate-300"
          >
            {(recipientType === 'faculty' ? FACULTY_TOPICS : ALUMNI_TOPICS).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Step 4: Write Question */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Question Details</span>
            <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder={
              recipientType === 'faculty'
                ? 'Type your guidance question or academic blocker here...'
                : 'Ask about interview processes, industry experience, referral advice...'
            }
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              setFormError('');
            }}
            className="w-full p-3 text-xs sm:text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 hover:border-slate-300 transition resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={handleModalClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            loadingText="Submitting..."
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit Guidance Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AskGuidanceModal;
