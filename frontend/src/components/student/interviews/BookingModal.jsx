import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Video,
  ExternalLink,
  Target
} from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

const INTERVIEW_TYPES = [
  {
    id: 'technical',
    title: 'Full Stack & Software Engineering',
    description: 'System design, React/Node frameworks, database architecture, and live coding.',
    duration: 45,
  },
  {
    id: 'dsa',
    title: 'DSA & Algorithmic Problem Solving',
    description: 'Arrays, trees, graphs, dynamic programming, and time/space complexity analysis.',
    duration: 45,
  },
  {
    id: 'system_design',
    title: 'System Design & Distributed Systems',
    description: 'Scalability, microservices, caching with Redis, message queues, and databases.',
    duration: 45,
  },
  {
    id: 'behavioral',
    title: 'Behavioral & STAR Leadership Screen',
    description: 'Project walk-throughs, conflict resolution, situational judgment, and communication.',
    duration: 30,
  },
];

const STANDARD_SLOTS = ['09:30', '11:00', '14:00', '15:30', '17:00'];

export const BookingModal = ({
  isOpen = false,
  onClose = () => {},
  facultyMentors = [],
  onSubmitBooking = () => {},
  isSubmitting = false,
  preselectedFacultyId = '',
}) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    interviewType: INTERVIEW_TYPES[0].title,
    facultyId: '',
    date: '',
    time: '14:00',
    customMeetLink: '',
  });

  const [errors, setErrors] = useState({});

  const wasOpenRef = React.useRef(false);
  const DEFAULT_FACULTY = [
    { id: 'fac-cse-01', name: 'Dr. Sarah Jenkins', careerTag: 'Computer Science & Engineering' },
    { id: 'fac-cse-02', name: 'Dr. Rajesh Rao', careerTag: 'Distributed Systems & Cloud Computing' },
    { id: 'fac-cse-03', name: 'Prof. Ananya Iyer', careerTag: 'Algorithms & Full Stack Engineering' },
  ];
  const evaluators = facultyMentors && facultyMentors.length > 0 ? facultyMentors : DEFAULT_FACULTY;

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const initialFaculty = preselectedFacultyId || evaluators[0]?.id || '';

      setFormData({
        interviewType: INTERVIEW_TYPES[0].title,
        facultyId: initialFaculty,
        date: tomorrow.toISOString().split('T')[0],
        time: '14:00',
        customMeetLink: '',
      });
      setStep(preselectedFacultyId ? 2 : 1);
      setErrors({});
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, preselectedFacultyId, evaluators]);

  // Validation per step
  const validateCurrentStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.interviewType) {
        newErrors.interviewType = 'Please select a focus area.';
      }
    } else if (step === 2) {
      if (!formData.facultyId) {
        newErrors.facultyId = 'Please select a faculty evaluator.';
      }
    } else if (step === 3) {
      if (!formData.date) {
        newErrors.date = 'Please select a valid date.';
      } else {
        const selected = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
          newErrors.date = 'Date must be today or in the future.';
        }
      }
      if (!formData.time) {
        newErrors.time = 'Please select or enter a preferred time.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 4) {
      handleNext();
      return;
    }
    if (!validateCurrentStep()) return;
    onSubmitBooking(formData);
  };

  const selectedFaculty = evaluators.find((f) => f.id === formData.facultyId) || evaluators[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Book Mock Interview"
      description="Step-by-step scheduling with departmental faculty evaluators."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
          {[
            { num: 1, label: 'Focus Area' },
            { num: 2, label: 'Faculty' },
            { num: 3, label: 'Date & Time' },
            { num: 4, label: 'Confirm' },
          ].map((item) => {
            const isCurrent = step === item.num;
            const isCompleted = step > item.num;

            return (
              <button
                key={item.num}
                type="button"
                onClick={() => {
                  if (item.num < step) setStep(item.num);
                }}
                disabled={item.num > step}
                className={`
                  flex items-center gap-1.5 transition-colors
                  ${isCurrent ? 'text-blue-600 font-bold' : isCompleted ? 'text-emerald-600 font-semibold cursor-pointer' : 'text-slate-400 cursor-not-allowed'}
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold
                    ${isCurrent ? 'bg-blue-600 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}
                  `}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.num}
                </div>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* STEP 1: Focus Area Selection */}
        {step === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Step 1: Choose Mock Interview Domain
            </label>

            <div className="space-y-2">
              {INTERVIEW_TYPES.map((type) => {
                const isSelected = formData.interviewType === type.title;
                return (
                  <div
                    key={type.id}
                    onClick={() => setFormData((prev) => ({ ...prev, interviewType: type.title }))}
                    className={`
                      p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 flex items-start justify-between gap-3
                      ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {type.title}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                    <Badge variant={isSelected ? 'primary' : 'neutral'} size="xs" className="shrink-0">
                      {type.duration} Min
                    </Badge>
                  </div>
                );
              })}
            </div>
            {errors.interviewType && (
              <p className="text-xs text-rose-600 font-medium">{errors.interviewType}</p>
            )}
          </div>
        )}

        {/* STEP 2: Choose Faculty */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Step 2: Choose Faculty Evaluator
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {evaluators.length} evaluators available
              </span>
            </div>

            {evaluators.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No faculty evaluators currently configured. Please contact the administrator.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {evaluators.map((faculty) => {
                  const isSelected = formData.facultyId === faculty.id;
                  return (
                    <div
                      key={faculty.id}
                      onClick={() => setFormData((prev) => ({ ...prev, facultyId: faculty.id }))}
                      className={`
                        faculty-option p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 flex items-center justify-between gap-3
                        ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {faculty.name ? faculty.name.charAt(0).toUpperCase() : 'F'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                            {faculty.name}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">
                            {faculty.careerTag || 'Computer Science & Engineering'}
                          </span>
                        </div>
                      </div>

                      <Badge variant="success" size="xs" className="shrink-0">
                        Available
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.facultyId && (
              <p className="text-xs text-rose-600 font-medium">{errors.facultyId}</p>
            )}
          </div>
        )}

        {/* STEP 3: Choose Date & Time */}
        {step === 3 && (
          <div className="space-y-3.5 animate-fadeIn">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Step 3: Select Date &amp; Preferred Time Slot
            </label>

            {/* Date Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Interview Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full bg-white text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-200 px-3 py-2.5 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300"
              />
              {errors.date && <p className="text-xs text-rose-600 font-medium">{errors.date}</p>}
            </div>

            {/* Available Time Slots */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Select Available Slot</span>
                <span className="text-[11px] font-mono font-medium text-slate-500">
                  {formData.time ? `Selected: ${formData.time}` : 'Choose below'}
                </span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {STANDARD_SLOTS.map((slot) => {
                  const isSelected = formData.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, time: slot }))}
                      className={`
                        py-2 px-1 text-center rounded-xl text-xs font-mono font-semibold transition-colors border
                        ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }
                      `}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              {/* Custom time input option */}
              <div className="pt-1.5">
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:border-blue-600"
                />
              </div>
              {errors.time && <p className="text-xs text-rose-600 font-medium">{errors.time}</p>}
            </div>
          </div>
        )}

        {/* STEP 4: Confirmation & Optional Custom Link */}
        {step === 4 && (
          <div className="space-y-3.5 animate-fadeIn">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Step 4: Confirm Booking Details
            </label>

            {/* Summary Ticket */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                <span className="text-slate-500 font-medium">Domain Focus</span>
                <span className="font-bold text-slate-900 text-right">{formData.interviewType}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                <span className="text-slate-500 font-medium">Evaluator</span>
                <span className="font-bold text-slate-900">{selectedFaculty?.name || 'Selected Faculty'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                <span className="text-slate-500 font-medium">Scheduled Time</span>
                <span className="font-bold text-slate-900 font-mono">
                  {formData.date} at {formData.time}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Session Format</span>
                <span className="font-bold text-blue-700">45-Minute Standard Rubric</span>
              </div>
            </div>

            {/* Optional Custom Meet URL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Custom Video URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>meet.google.com/new</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="url"
                placeholder="Leave blank for automatic room upon acceptance"
                value={formData.customMeetLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, customMeetLink: e.target.value }))}
                className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-200 px-3 py-2 transition-colors focus:outline-none focus:border-blue-600 hover:border-slate-300 font-medium"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
              ℹ️ Your request will be routed to the faculty member. Once accepted, your meeting space will be activated.
            </p>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleBack}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              loadingText="Submitting..."
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
            >
              Confirm &amp; Request Mock
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
