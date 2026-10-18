import React from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

const MobileSidebar = ({ isOpen, onClose, role, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over sidebar container */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full z-10 shadow-2xl">
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Sidebar
          role={role}
          user={user}
          isOpen={true}
          onClose={onClose}
          isMobileDrawer={true}
        />
      </div>
    </div>
  );
};

export default MobileSidebar;
