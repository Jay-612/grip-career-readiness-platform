import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

export const UploadResumeModal = ({
  isOpen = false,
  onClose = () => {},
  onSaveResume = () => {},
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit. Please upload a smaller PDF or Word document.');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF or DOCX file to upload.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onSaveResume({
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / 1024).toFixed(0)} KB`,
        uploadedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        atsScore: 91,
        status: 'Verified by Placement Cell',
      });
      setIsProcessing(false);
      setSelectedFile(null);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isProcessing && onClose()}
      title="Upload / Replace Resume"
      description="Upload your latest PDF resume for automated ATS parsing and placement verification."
      size="md"
    >
      <form onSubmit={handleUploadSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop / Selector Zone */}
        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer block text-center">
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
            <Upload className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              {selectedFile ? selectedFile.name : 'Click to select or drag and drop resume'}
            </span>
            <span className="text-[11px] text-slate-500">
              PDF or DOCX format (Max size: 5 MB)
            </span>
          </div>
        </label>

        {selectedFile && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold truncate max-w-xs">{selectedFile.name}</span>
            </div>
            <span className="text-emerald-700 font-mono text-[11px]">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <span className="font-semibold text-slate-800 text-[11px] block">
            Automated Placement Cell Verification
          </span>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Resumes are indexed with standard ATS parsers to extract verified skills, project keywords, and graduation eligibility criteria for campus recruiters.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isProcessing}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isProcessing}
            loadingText="Uploading &amp; Parsing..."
            disabled={!selectedFile}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload Resume
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadResumeModal;
