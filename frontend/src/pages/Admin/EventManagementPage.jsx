import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  User,
  Layers,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Skeleton, SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const EventManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetSkill: '',
    date: '',
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const data = await adminService.getEvents();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError(err.response?.data?.message || 'Failed to load department events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      targetSkill: '',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) return;
    setIsSubmitting(true);

    try {
      await adminService.createEvent({
        title: formData.title.trim(),
        targetSkill: formData.targetSkill.trim() || 'General Technical Readiness',
        date: formData.date,
      });

      showToast(`Event "${formData.title}" scheduled successfully`);
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`Are you sure you want to cancel and delete the event "${ev.title}"?`)) {
      return;
    }
    try {
      await adminService.deleteEvent(ev.id);
      showToast(`Event "${ev.title}" deleted`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  return (
    <main className="space-y-6 pb-12 antialiased" aria-label="Department Skill-Improvement Events">
      {/* Toast */}
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
            Department Skill-Improvement Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule targeted technical workshops, mock interview bootcamps, and career readiness sessions (SRS R.6.3).
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm"
        >
          Schedule New Event
        </Button>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8 text-slate-400" />}
          title="No Department Events Scheduled"
          description="Schedule a technical skill workshop or placement bootcamp to appear on student calendars."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
              Schedule Event
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <article
              key={ev.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                      <span className="text-[11px] text-slate-400">Department Intervention</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(ev)}
                    title="Delete Event"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Target Skill Chip */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Target Skill Focus
                  </span>
                  <div className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                    {ev.targetSkill}
                  </div>
                </div>

                {/* Date & Organizer */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold">
                      {new Date(ev.date).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {ev.organizer && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Organized by {ev.organizer.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Student Calendar Synced ✓</span>
                <span className="text-amber-700 font-semibold">Active Event</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ─── SCHEDULE EVENT MODAL ─────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Skill-Improvement Event"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. System Design & Distributed Caching Masterclass"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Target Skill Domain (SRS R.6.3) *
            </label>
            <input
              type="text"
              required
              value={formData.targetSkill}
              onChange={(e) => setFormData({ ...formData, targetSkill: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Low-Level System Design, Microservices, Public Speaking"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Scheduled Event Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              Publish to Student Calendars
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default EventManagementPage;
