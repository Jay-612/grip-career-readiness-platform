import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  User,
  Search,
  Filter,
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredEvents = events.filter((ev) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      (ev.targetSkill || '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="space-y-6 pb-12 antialiased max-w-7xl mx-auto" aria-label="Event Management">
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
            Event Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule targeted technical workshops, mock interview bootcamps, and career readiness sessions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm self-start sm:self-auto"
        >
          Schedule New Event
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events by title or target skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium self-end sm:self-auto">
          Showing {filteredEvents.length} of {events.length} events
        </span>
      </div>

      {/* Events Table View */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton variant="text" className="h-6 w-1/4" />
          <Skeleton variant="card" className="h-48" />
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
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Target Skill Domain</th>
                  <th className="py-3 px-4">Date & Timing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((ev) => {
                  const evDate = new Date(ev.date);
                  const isUpcoming = evDate >= new Date();

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 min-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{ev.title}</div>
                            <div className="text-[11px] text-slate-400">
                              By {typeof ev.organizer === 'object' && ev.organizer !== null ? ev.organizer.name || ev.organizer.email || 'Admin' : ev.organizer || 'Admin'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {ev.targetSkill || 'General Technical Readiness'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {evDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isUpcoming ? 'success' : 'neutral'} size="xs">
                          {isUpcoming ? 'Upcoming' : 'Concluded'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(ev)}
                          title="Delete Event"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CREATE EVENT MODAL ───────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Department Event"
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
              placeholder="e.g. Distributed System Mock Interview Bootcamp"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Skill Competency</label>
            <input
              type="text"
              value={formData.targetSkill}
              onChange={(e) => setFormData({ ...formData, targetSkill: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. System Design, DSA, Cloud Infrastructure"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Connect this event to weak domains detected in institutional skill gap analytics.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
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
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default EventManagementPage;
