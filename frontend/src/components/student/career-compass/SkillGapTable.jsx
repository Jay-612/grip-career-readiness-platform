import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, Plus, Filter, Search } from 'lucide-react';
import Badge from '../../common/Badge';
import Button from '../../common/Button';

export const SkillGapTable = ({
  skillsData = [],
  companyMatches = [],
  targetTrack = '',
  actionPlans = [],
}) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'gaps' | 'ready'
  const [search, setSearch] = useState('');

  // Normalize skills into standardized rows: { name, currentLevel, requiredLevel, status, notes }
  const rows = useMemo(() => {
    const list = [];
    const seen = new Set();

    // 1. From active track or skillsData
    (skillsData || []).forEach((item) => {
      const name = typeof item === 'string' ? item : item.name;
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());

      const current = item.currentLevel ?? (item.verified ? 8 : 4);
      const required = item.requiredLevel ?? 8;
      const status = current >= required ? 'Ready' : current > 0 ? 'Needs Improvement' : 'Missing';

      list.push({
        name,
        currentLevel: `${current}/10`,
        requiredLevel: `${required}/10`,
        status,
        notes: item.category || 'Core Trajectory Competency',
      });
    });

    // 2. From company matches
    (companyMatches || []).forEach((comp) => {
      (comp.requiredSkills || []).forEach((reqSkill) => {
        if (seen.has(reqSkill.toLowerCase())) return;
        seen.add(reqSkill.toLowerCase());

        const isMatched = (comp.matchedSkills || []).some(
          (ms) => ms.toLowerCase() === reqSkill.toLowerCase()
        );

        list.push({
          name: reqSkill,
          currentLevel: isMatched ? '8/10' : '0/10',
          requiredLevel: '8/10',
          status: isMatched ? 'Ready' : 'Missing',
          notes: `Required by ${comp.companyName}`,
        });
      });
    });

    // Fallback default skills if empty
    if (list.length === 0) {
      const defaults = [
        { name: 'System Design & Architecture', currentLevel: '5/10', requiredLevel: '8/10', status: 'Needs Improvement', notes: 'Core Distributed Systems' },
        { name: 'High-Concurrency APIs', currentLevel: '7/10', requiredLevel: '8/10', status: 'Needs Improvement', notes: 'REST & GraphQL Services' },
        { name: 'Distributed Caching (Redis)', currentLevel: '8/10', requiredLevel: '8/10', status: 'Ready', notes: 'In-Memory State Stores' },
        { name: 'Microservices & Containerization', currentLevel: '8/10', requiredLevel: '8/10', status: 'Ready', notes: 'Docker & Kubernetes' },
        { name: 'Database Internals & Sharding', currentLevel: '4/10', requiredLevel: '7/10', status: 'Needs Improvement', notes: 'PostgreSQL / MongoDB' },
        { name: 'Distributed Consensus (Raft/Paxos)', currentLevel: '2/10', requiredLevel: '7/10', status: 'Missing', notes: 'Advanced Distributed State' },
      ];
      return defaults;
    }

    return list;
  }, [skillsData, companyMatches]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'ready') return r.status === 'Ready';
      if (filter === 'gaps') return r.status === 'Needs Improvement' || r.status === 'Missing';
      return true;
    });
  }, [rows, filter, search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Ready</span>
          </span>
        );
      case 'Needs Improvement':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Improve</span>
          </span>
        );
      case 'Missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Gap</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4" aria-label="Skill Gap Analysis">
      {/* Control bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Skills ({rows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('gaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'gaps'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Skill Gaps ({rows.filter((r) => r.status !== 'Ready').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'ready'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ready ({rows.filter((r) => r.status === 'Ready').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Clean Structured Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Required Skill</th>
                <th className="py-3.5 px-4 sm:px-6">Current Level</th>
                <th className="py-3.5 px-4 sm:px-6">Required Level</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No skills matched the current filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900">{row.name}</div>
                      <span className="text-[11px] text-slate-400 block">{row.notes}</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-slate-700">
                      {row.currentLevel}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-semibold text-slate-900">
                      {row.requiredLevel}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {row.status !== 'Ready' ? (
                        <Link
                          to="/student/goals"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Target in Goals</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkillGapTable;
