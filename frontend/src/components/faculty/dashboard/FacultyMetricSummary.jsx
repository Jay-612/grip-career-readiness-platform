import React from 'react';
import { Calendar, FileCheck, Users, Award } from 'lucide-react';
import StatCard from '../../common/StatCard';

export const FacultyMetricSummary = ({
  interviewsConducted = 0,
  pendingEvaluations = 0,
  assignedMentees = 0,
  averageScore = 0,
}) => {
  return (
    <section data-purpose="faculty-summary-metrics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Interviews Conducted */}
        <StatCard
          title="Interviews Conducted"
          value={interviewsConducted}
          subtitle="Mock sessions completed"
          badgeText="Total"
          badgeVariant="neutral"
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
        />

        {/* Metric 2: Pending Evaluations */}
        <StatCard
          title="Pending Evaluations"
          value={pendingEvaluations}
          subtitle={pendingEvaluations > 0 ? 'Awaiting rubric scoring' : 'All scored'}
          badgeText={pendingEvaluations > 0 ? 'Action Needed' : 'Complete'}
          badgeVariant={pendingEvaluations > 0 ? 'danger' : 'success'}
          icon={FileCheck}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-100"
        />

        {/* Metric 3: Assigned Mentees */}
        <StatCard
          title="Assigned Mentees"
          value={assignedMentees}
          subtitle="Cohort candidates"
          badgeText="Mentorship"
          badgeVariant="primary"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50 border-indigo-100"
        />

        {/* Metric 4: Average Score */}
        <StatCard
          title="Avg Interview Score"
          value={`${averageScore}%`}
          subtitle="Cohort readiness benchmark"
          badgeText={averageScore >= 70 ? 'On Track' : 'Needs Focus'}
          badgeVariant={averageScore >= 70 ? 'success' : 'warning'}
          icon={Award}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
        />
      </div>
    </section>
  );
};

export default FacultyMetricSummary;
