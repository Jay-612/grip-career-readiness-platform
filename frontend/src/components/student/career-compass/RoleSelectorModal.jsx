import React, { useState } from 'react';
import { Target, Check, X, Building2, Sparkles } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

export const RoleSelectorModal = ({
  isOpen = false,
  onClose = () => {},
  tracks = [],
  activeTrack = '',
  onSelectTrack = () => {},
  isUpdating = false,
}) => {
  const [selected, setSelected] = useState(activeTrack);

  React.useEffect(() => {
    setSelected(activeTrack);
  }, [activeTrack, isOpen]);

  const handleConfirm = () => {
    if (selected && selected !== activeTrack) {
      onSelectTrack(selected);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Target Career Trajectory"
      description="Selecting a trajectory customizes your semester curriculum roadmap, skill benchmark analysis, and campus recruiter matching."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3 py-2">
        {tracks.map((track) => {
          const isCurrent = activeTrack.toLowerCase() === track.title.toLowerCase();
          const isChosen = selected.toLowerCase() === track.title.toLowerCase();

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => setSelected(track.title)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                isChosen
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    {track.title}
                  </span>
                  {isCurrent && (
                    <Badge variant="primary" size="xs">
                      Current
                    </Badge>
                  )}
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    {track.ctcRange}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {track.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Hiring Tier: <strong className="text-slate-600">{track.hiringTier}</strong></span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                  isChosen
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isChosen && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          disabled={!selected || isUpdating}
          isLoading={isUpdating}
        >
          Confirm & Align Roadmap
        </Button>
      </div>
    </Modal>
  );
};

export default RoleSelectorModal;
