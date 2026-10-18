import React from 'react';
import { UserCheck, Edit3, RefreshCw } from 'lucide-react';
import Button from '../../common/Button';

export const ProfileHeader = ({
  onEditProfile = () => {},
  onRefresh = () => {},
  isLoading = false,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Profile &amp; Skills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your academic record, resume, verified competencies, and professional links.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
          title="Refresh profile details"
        >
          Sync
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onEditProfile}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          className="shadow-sm"
        >
          Edit Profile
        </Button>
      </div>
    </header>
  );
};

export default ProfileHeader;
