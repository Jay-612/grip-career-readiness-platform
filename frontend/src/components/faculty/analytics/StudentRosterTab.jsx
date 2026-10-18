import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  Award,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import Card from '../../common/Card';
import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';

const getReadinessTier = (score) => {
  if (typeof score !== 'number' || isNaN(score)) return { label: 'Unranked', variant: 'neutral', color: 'slate' };
  if (score >= 80) return { label: 'Placement Ready', variant: 'success', color: 'emerald' };
  if (score >= 60) return { label: 'Nearly Ready', variant: 'primary', color: 'blue' };
  if (score >= 40) return { label: 'Developing', variant: 'warning', color: 'amber' };
  return { label: 'Needs Attention', variant: 'danger', color: 'rose' };
};

export const StudentRosterTab = ({
  students = [],
  tierFilter = 'ALL',
  onTierFilterChange,
  searchQuery = '',
  onSearchChange,
  onSelectStudent,
  onExportCSV,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [tierFilter, searchQuery, students.length]);

  // Compute filtered & sorted students
  const filteredAndSorted = useMemo(() => {
    let list = [...students];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => {
        const nameMatch = s.studentName?.toLowerCase().includes(q);
        const emailMatch = s.email?.toLowerCase().includes(q);
        const careerMatch = s.selectedCareer?.toLowerCase().includes(q);
        const usnMatch = s.studentId?.toLowerCase().includes(q);
        return nameMatch || emailMatch || careerMatch || usnMatch;
      });
    }

    // Risk tier filter
    if (tierFilter !== 'ALL') {
      list = list.filter((s) => {
        const score = s.readinessScore || 0;
        if (tierFilter === 'READY') return score >= 80;
        if (tierFilter === 'NEARLY') return score >= 60 && score < 80;
        if (tierFilter === 'ATTENTION') return score < 60;
        return true;
      });
    }

    // Sorting: when ATTENTION is active, prioritize lowest readiness first
    if (tierFilter === 'ATTENTION') {
      list.sort((a, b) => (a.readinessScore || 0) - (b.readinessScore || 0));
    } else {
      list.sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0));
    }

    return list;
  }, [students, tierFilter, searchQuery]);

  // Pagination slice
  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedStudents = filteredAndSorted.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4" data-purpose="student-roster-tab">
      {/* ─── CONTROLS: SEARCH & RISK STATUS FILTER ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, email, career, or USN..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
          />
        </div>

        {/* Risk Status Filter Buttons / Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => onTierFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                tierFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => onTierFilterChange('ATTENTION')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                tierFilter === 'ATTENTION'
                  ? 'bg-rose-50 text-rose-700 shadow-xs font-bold border border-rose-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              At Risk (&lt;60%)
            </button>
            <button
              type="button"
              onClick={() => onTierFilterChange('NEARLY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                tierFilter === 'NEARLY'
                  ? 'bg-blue-50 text-blue-700 shadow-xs font-bold border border-blue-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nearly Ready
            </button>
            <button
              type="button"
              onClick={() => onTierFilterChange('READY')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                tierFilter === 'READY'
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs font-bold border border-emerald-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Placement Ready
            </button>
          </div>

          {onExportCSV && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs text-slate-700 hover:text-slate-900 hidden sm:inline-flex"
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* ─── STUDENT ROSTER TABLE (PAGINATED AT 10 PER PAGE) ────────────── */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">USN / ID</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Career Track</th>
                <th className="py-3 px-4 text-center">Readiness</th>
                <th className="py-3 px-4">Risk Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, idx) => {
                  const score = student.readinessScore || 0;
                  const tier = getReadinessTier(score);
                  const studentId = student.studentId || student._id || '';
                  const usn = studentId ? `1MS${studentId.slice(-6).toUpperCase()}` : 'N/A';

                  return (
                    <tr
                      key={student.studentId || idx}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.studentName} size="sm" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {student.studentName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* USN / ID */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {usn}
                      </td>

                      {/* Semester */}
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {student.semester ? `Semester ${student.semester}` : 'Unassigned'}
                      </td>

                      {/* Career Track */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {student.selectedCareer || (
                          <span className="text-slate-400 italic">None selected</span>
                        )}
                      </td>

                      {/* Readiness Score */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-sm ${
                            score >= 80
                              ? 'text-emerald-600'
                              : score >= 60
                              ? 'text-blue-600'
                              : score >= 40
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {score}%
                        </span>
                      </td>

                      {/* Risk Status */}
                      <td className="py-3 px-4">
                        <Badge variant={tier.variant} size="sm">
                          {tier.label}
                        </Badge>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectStudent(student)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          className="text-xs group-hover:border-blue-300 group-hover:text-blue-600 cursor-pointer"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <EmptyState
                      compact
                      title="No Students Found"
                      description={
                        searchQuery || tierFilter !== 'ALL'
                          ? 'No student records match the active search or risk filters.'
                          : 'No student records are currently available for this cohort.'
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── PAGINATION BAR ────────────────────────────────────────────── */}
        {totalItems > 0 && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">
                {Math.min(startIndex + pageSize, totalItems)}
              </span>{' '}
              of <span className="font-semibold text-slate-900">{totalItems}</span> students
            </div>

            <div className="flex items-center gap-2 self-center sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                className="text-xs py-1 px-2.5 h-auto cursor-pointer"
              >
                Previous
              </Button>

              <span className="font-mono text-xs px-2 text-slate-700">
                Page <strong className="text-slate-900">{safeCurrentPage}</strong> of{' '}
                <strong className="text-slate-900">{totalPages}</strong>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                className="text-xs py-1 px-2.5 h-auto cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentRosterTab;
