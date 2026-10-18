import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, HelpCircle } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const CareerCompassQuizModal = ({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  isSubmitting = false,
  quizResult = null,
  onApplyResult = () => {},
}) => {
  const [selectedInterests, setSelectedInterests] = useState(['cloud', 'distributed', 'microservices']);
  const [selectedStrengths, setSelectedStrengths] = useState(['backend', 'system design', 'docker']);

  const interestOptions = [
    { id: 'cloud', label: 'Cloud Architecture & Microservices' },
    { id: 'frontend', label: 'Modern Frontend & Web UX' },
    { id: 'devops', label: 'CI/CD Pipelines & Infrastructure' },
    { id: 'ai', label: 'Machine Learning & Data Pipelines' },
    { id: 'systems', label: 'Operating Systems & Concurrency' },
  ];

  const strengthOptions = [
    { id: 'backend', label: 'Backend APIs (Node/FastAPI/Java)' },
    { id: 'dsa', label: 'Data Structures & Algorithms' },
    { id: 'react', label: 'React / Component Architecture' },
    { id: 'system_design', label: 'System Design & Scalability' },
    { id: 'database', label: 'Database Optimization & SQL' },
  ];

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleStrength = (id) => {
    setSelectedStrengths((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onSubmit({
      interests: selectedInterests,
      strengths: selectedStrengths,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Career Diagnostic Assessment"
      description="Select your technical interests and engineering strengths to deduce your recommended trajectory."
      maxWidth="max-w-xl"
    >
      {quizResult ? (
        <div className="py-3 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Diagnostic Result
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {quizResult.suggestedCareer}
            </h3>
            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
              {quizResult.description ||
                'This engineering trajectory matches your primary technical strengths and high-concurrency interests.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApplyResult(quizResult.suggestedCareer)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Apply Trajectory
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div>
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              1. What technical domains interest you most?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {interestOptions.map((opt) => {
                const isSelected = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              2. What are your current strongest competencies?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {strengthOptions.map((opt) => {
                const isSelected = selectedStrengths.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleStrength(opt.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Analyze Best-Fit Trajectory
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CareerCompassQuizModal;
