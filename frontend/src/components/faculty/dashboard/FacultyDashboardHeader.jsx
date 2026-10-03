import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Calendar, FileCheck } from 'lucide-react';
import Button from '../../common/Button';

export const FacultyDashboardHeader = ({
  facultyName = 'Faculty Member',
  departmentName = 'Computer Science & Engineering',
  isHOD = false,
}) => {
  // Determine time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6"
      data-purpose="faculty-header"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side: Greeting, Department, Date */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              {departmentName}
            </span>
            {isHOD && (
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                HOD
              </span>
            )}
            <span>•</span>
            <span className="font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {todayDateString}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            {getGreeting()}, {facultyName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Here is what needs your attention today.
          </p>
        </div>

        {/* Right side: Quick Action */}
        <div className="shrink-0 self-start md:self-auto">
          <Link to="/faculty/interviews">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FileCheck className="w-3.5 h-3.5" />}
              className="text-xs bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              + Evaluate Student
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FacultyDashboardHeader;
