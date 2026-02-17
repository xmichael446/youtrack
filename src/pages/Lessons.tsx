import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  FileText,
  UploadCloud,
  Plus,
  X,
  Link as LinkIcon,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import { useLessons, LessonsProvider } from '../context/LessonsContext';
import {
  AttachmentSubmission,
  AssignmentData
} from '../services/apiTypes';

// Simple Toast Component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-full duration-500 ease-out ${type === 'success' ? 'bg-slate-900 border border-emerald-500/30' : 'bg-slate-900 border border-red-500/30'
      }`}>
      <div className={`p-2 rounded-full ${type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
        {type === 'success' ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
      </div>
      <div>
        <h4 className={`text-base font-black ${type === 'success' ? 'text-white' : 'text-white'}`}>
          {type === 'success' ? 'Success' : 'Error'}
        </h4>
        <p className="text-sm font-bold text-slate-400">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// Submission Modal Component
import ReactDOM from 'react-dom';

// ... (keep Toast component as is)

// Submission Modal Component
const SubmissionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentData;
  onSubmit: (data: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ isOpen, onClose, assignment, onSubmit, showToast }) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const [attachmentsMetadata, setAttachmentsMetadata] = useState<AttachmentSubmission[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [currentAttachmentType, setCurrentAttachmentType] = useState<'link' | 'file'>('link');
  const [currentAttachmentName, setCurrentAttachmentName] = useState('');
  const [currentAttachmentValue, setCurrentAttachmentValue] = useState(''); // Text for link, Filename for file
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Lock body scroll when modal is open to prevent background scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setComment('');
      setAttachmentsMetadata([]);
      setSelectedFiles([]);
      setCurrentAttachmentName('');
      setCurrentAttachmentValue('');
      setCurrentFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCurrentFile(file);
      setCurrentAttachmentValue(file.name);
    }
  };

  const handleAddAttachment = () => {
    if (!currentAttachmentName) return;
    if (currentAttachmentType === 'link' && !currentAttachmentValue) return;
    if (currentAttachmentType === 'file' && !currentFile) return;

    if (currentAttachmentType === 'file' && currentFile) {
      setSelectedFiles(prev => [...prev, currentFile]);
      setAttachmentsMetadata(prev => [...prev, {
        type: 'file',
        name: currentAttachmentName,
        url: '' // No URL for local file
      }]);
    } else {
      setAttachmentsMetadata(prev => [...prev, {
        type: 'link',
        name: currentAttachmentName,
        url: currentAttachmentValue
      }]);
    }

    // Reset inputs
    setCurrentAttachmentName('');
    setCurrentAttachmentValue('');
    setCurrentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    const attachmentToRemove = attachmentsMetadata[index];

    if (attachmentToRemove.type === 'file') {
      let fileIndex = 0;
      for (let i = 0; i < index; i++) {
        if (attachmentsMetadata[i].type === 'file') fileIndex++;
      }

      const newFiles = [...selectedFiles];
      newFiles.splice(fileIndex, 1);
      setSelectedFiles(newFiles);
    }

    const newMeta = [...attachmentsMetadata];
    newMeta.splice(index, 1);
    setAttachmentsMetadata(newMeta);
  };

  const handleSubmit = async () => {
    try {
      const fileAttachmentsCount = attachmentsMetadata.filter(a => a.type === 'file').length;
      if (fileAttachmentsCount !== selectedFiles.length) {
        showToast("File count mismatch. Please re-add files.", 'error');
        return;
      }

      await onSubmit({
        comment: comment,
        attachments: attachmentsMetadata,
        files: selectedFiles
      });

      showToast("Homework submitted successfully!", 'success');
      onClose();
    } catch (err: any) {
      const msg = err.message || "Failed to submit homework";
      showToast(msg, 'error');
    }
  };

  if (!isOpen) return null;

  // Use React Portal to render outside the main DOM hierarchy
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Backdrop click handler */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-300 max-h-[90vh]">

        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-indigo-50/30 dark:bg-indigo-500/5 rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{assignment.lesson_topic} {t('assignment')}</h2>
            <p className="text-sm text-red-500 dark:text-red-400 font-medium mt-1">{t('due')}: {new Date(assignment.deadline).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Scrollable independent of page) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Comment Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('commentOptional')}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('anyNotes')}
              rows={2}
              className="w-full rounded-2xl border-2 border-gray-300 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 p-5 text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none dark:text-white min-h-[60px] transition-all"
            ></textarea>
          </div>

          {/* Attachments List */}
          {attachmentsMetadata.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">{t('attachedFiles')}</label>
              {attachmentsMetadata.map((att, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    {att.type === 'link' ? <LinkIcon className="w-4 h-4 text-brand-primary" /> : <FileText className="w-4 h-4 text-orange-500" />}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{att.name}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-500 max-w-xs truncate">{att.url || "File"}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveAttachment(idx)} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Attachment Section */}
          <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-4 border border-dashed border-gray-300 dark:border-slate-700 transition-colors">
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">{t('addAttachment')}</p>

            <div className="space-y-3">
              {/* Name Input */}
              <input
                type="text"
                placeholder="e.g. Task 1 PDF, Screenshot, Google Doc..."
                className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none dark:text-white transition-all"
                value={currentAttachmentName}
                onChange={(e) => setCurrentAttachmentName(e.target.value)}
              />

              {/* Toggle Type */}
              <div className="flex rounded-lg bg-gray-200 dark:bg-slate-700 p-1 w-fit">
                <button
                  onClick={() => setCurrentAttachmentType('link')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${currentAttachmentType === 'link' ? 'bg-white dark:bg-slate-900 shadow text-brand-primary' : 'text-gray-500 dark:text-slate-400'}`}
                >
                  {t('link')}
                </button>
                <button
                  onClick={() => setCurrentAttachmentType('file')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${currentAttachmentType === 'file' ? 'bg-white dark:bg-slate-900 shadow text-brand-primary' : 'text-gray-500 dark:text-slate-400'}`}
                >
                  {t('file')}
                </button>
              </div>

              {/* Dynamic Input based on Toggle */}
              <div className="flex gap-2">
                {currentAttachmentType === 'link' ? (
                  <input
                    type="url"
                    placeholder="https://..."
                    className="flex-1 rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none dark:text-white transition-all"
                    value={currentAttachmentValue}
                    onChange={(e) => setCurrentAttachmentValue(e.target.value)}
                  />
                ) : (
                  <div className="flex-1 flex items-center">
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors w-full flex justify-between items-center">
                      <span className="truncate">{currentAttachmentValue || t('chooseFile')}</span>
                      <UploadCloud className="w-4 h-4 ml-2" />
                    </label>
                  </div>
                )}

                <button
                  onClick={handleAddAttachment}
                  disabled={!currentAttachmentName || (!currentAttachmentValue && !currentFile)}
                  className="bg-brand-primary disabled:bg-brand-primary/30 text-white px-3 rounded-lg hover:bg-brand-accent transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl bg-gray-50 dark:bg-slate-800 transition-colors shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-brand-primary hover:bg-brand-accent shadow-md shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            {t('submitAssignment')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AssignmentCard: React.FC<{
  assignment: AssignmentData;
  isCurrent?: boolean;
  onExpand: () => void;
  isExpanded: boolean;
  onSubmit?: () => void;
}> = ({ assignment, isCurrent, onExpand, isExpanded, onSubmit }) => {
  const { t } = useLanguage();

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'attended' || s === 'submitted') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
    if (s === 'rejected' || s === 'absent' || s === 'missed') return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20';
    return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
  };

  const latestSubmission = assignment.submissions && assignment.submissions.length > 0 ? assignment.submissions[0] : null;

  // Determine status label to show in collapsed row
  let statusLabel = "Pending";
  if (latestSubmission) {
    statusLabel = latestSubmission.status;
  } else {
    const deadline = new Date(assignment.deadline).getTime();
    const now = new Date().getTime();
    if (deadline < now) statusLabel = "Missed";
  }

  // Check if we should show submit button: only if status is not "approved"
  const showSubmitButton = isCurrent && (!latestSubmission || latestSubmission.status.toLowerCase() !== 'approved');

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all ${isExpanded ? 'border-brand-primary shadow-lg' : 'border-gray-100 dark:border-slate-800 hover:border-brand-primary/30'}`}>
      {/* Card Header - Always visible */}
      <div
        onClick={onExpand}
        className="p-4 md:p-6 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isCurrent && <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse flex-shrink-0"></div>}
              <h3 className={`text-sm md:text-base font-black truncate ${isCurrent ? 'text-brand-dark dark:text-white' : 'text-gray-600 dark:text-slate-400'}`}>
                {assignment.lesson_topic}
              </h3>
              {isCurrent && <span className="inline-flex px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[9px] font-bold rounded uppercase tracking-wider flex-shrink-0">{t("current")}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(assignment.start_datetime).toLocaleDateString()}
              </span>
              {isCurrent && (
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <Clock className="w-3 h-3" />
                  {t("due")}: {new Date(assignment.deadline).toLocaleDateString()} {new Date(assignment.deadline).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider border ${getStatusColor(statusLabel)}`}>
              {statusLabel}
            </span>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-slate-800 p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Description */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border-l-4 border-brand-primary">
            <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
              {t('homeworkDescription')}
            </h4>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300 italic leading-relaxed">
              "{assignment.description}"
            </p>
          </div>

          {/* Resources */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                {t('homeworkResources')}
              </h4>
              <div className="space-y-2">
                {assignment.attachments.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all group"
                  >
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg mr-3 group-hover:bg-brand-primary/10 transition-colors">
                      <FileText className="w-4 h-4 text-gray-400 group-hover:text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-700 dark:text-slate-300 truncate group-hover:text-brand-dark dark:group-hover:text-white">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">
                        {item.extension ? item.extension.toUpperCase() : 'FILE'}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Submission History - for ALL assignments with submissions */}
          {assignment.submissions && assignment.submissions.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                {t('submissionHistory')}
              </h4>
              <div className="space-y-2">
                {assignment.submissions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-600 dark:text-slate-400">
                        {new Date(sub.created_at).toLocaleDateString()} {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                    {sub.teacher_comment && (
                      <p className="text-xs text-gray-600 dark:text-slate-400 italic mt-2 pl-3 border-l-2 border-gray-300 dark:border-slate-600">
                        "{sub.teacher_comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button - for current assignment if not approved */}
          {showSubmitButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubmit && onSubmit();
              }}
              className="w-full bg-slate-900 dark:bg-brand-primary text-white py-3 md:py-4 rounded-xl font-black hover:bg-black dark:hover:bg-brand-accent transition-all shadow-xl shadow-slate-900/10 dark:shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-2 group"
            >
              <UploadCloud className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
              {latestSubmission ? t('resubmit') : t('startSubmission')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const LessonsContent: React.FC = () => {
  const { t } = useLanguage();
  const { refetch } = useDashboard();
  const { lessonsData, loading, error, markAttendance, submitAssignment } = useLessons();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Track expanded rows by ID
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setExpandedRowIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Attendance State
  const [attendanceCode, setAttendanceCode] = useState('');
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [isExpired, setIsExpired] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Timer Logic
  useEffect(() => {
    if (!lessonsData?.attendance?.closes_at) return;
    if (lessonsData.attendance.status !== null) return; // Already attended/absent

    const deadline = new Date(lessonsData.attendance.closes_at).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft('00:00:00');
        setIsExpired(true);
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        setIsExpired(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lessonsData?.attendance?.closes_at, lessonsData?.attendance?.status]);

  const handleMarkAttendance = async () => {
    if (!attendanceCode) return;

    try {
      const response = await markAttendance(attendanceCode);
      if (response.success) {
        showToast(`Earned ${response.data.xp} XP and ${response.data.coins} Coins!`, 'success');
        setAttendanceCode('');
        refetch();
      }
    } catch (err: any) {
      showToast(err.message || "Invalid keyword", 'error');
    }
  };

  // Helper to format deadline
  const formatDeadline = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs < 0) return "Expired";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Helper to get status color (for attendance only now)
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
    const s = status.toLowerCase();
    if (s === 'approved' || s === 'attended') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
    if (s === 'rejected' || s === 'absent' || s === 'missed') return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20';
    return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
  };

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;

  const attendance = lessonsData?.attendance;
  const assignments = lessonsData?.assignments;
  const currentAssignment = assignments?.current;
  const previousAssignments = assignments?.previous || [];

  return (
    <div className="space-y-8 md:space-y-12 px-1 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Attendance Section */}
      {attendance && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all hover:shadow-xl">
          <h2 className="text-xl font-black text-brand-dark dark:text-white mb-6 flex items-center tracking-tight">
            <Clock className="w-6 h-6 mr-3 text-brand-primary" />
            {t('lessonAttendance')}
          </h2>

          {/* Lesson Details & Timer */}
          <div className="mb-8 bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left overflow-hidden w-full sm:w-auto">
              <h3 className="text-base md:text-lg font-black text-brand-dark dark:text-white mb-2 whitespace-nowrap truncate px-2 sm:px-0">
                Lesson {attendance.number}: {attendance.lesson_topic}
              </h3>
              <div className="flex flex-nowrap items-center justify-center sm:justify-start gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400">
                <span className="flex items-center bg-white dark:bg-slate-800 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm whitespace-nowrap">
                  <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 md:mr-2 text-brand-primary" />
                  {new Date(attendance.opens_at).toLocaleDateString()}
                </span>
                <span className="flex items-center bg-white dark:bg-slate-800 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm whitespace-nowrap">
                  <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 md:mr-2 text-brand-primary" />
                  {new Date(attendance.opens_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {attendance.status === null && !isExpired && (
              <div className="flex flex-col items-center sm:items-end">
                <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{t('timeRemaining')}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  <p className="text-2xl md:text-3xl font-black text-brand-primary tabular-nums tracking-tight drop-shadow-sm">
                    {timeLeft}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-5">
            <div className="flex-1">
              <label className="block text-[10px] md:text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 md:mb-3 ml-1">
                {t('enterKeyword')}
              </label>
              {isExpired && attendance.status === null ? (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 text-center w-full animate-in fade-in zoom-in duration-300">
                  <p className="text-sm font-black text-red-500 dark:text-red-400 uppercase tracking-wide">
                    {t('expiredMessage')}
                  </p>
                </div>
              ) : attendance.status === 'attended' ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4 text-center w-full animate-in fade-in zoom-in duration-300">
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {t('successMessage')}
                  </p>
                </div>
              ) : attendance.status === 'absent' ? (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 text-center w-full animate-in fade-in zoom-in duration-300">
                  <p className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {t('absent') || "ABSENT"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={attendanceCode}
                    onChange={(e) => setAttendanceCode(e.target.value)}
                    placeholder="e.g. apple"
                    className="flex-1 rounded-xl md:rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary focus:outline-none transition-all dark:text-white dark:placeholder:text-slate-600"
                  />
                  <button
                    onClick={handleMarkAttendance}
                    className="h-10 sm:h-14 px-6 sm:px-10 bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[100px] sm:min-w-[160px]"
                  >
                    {t('mark')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Assignments Section */}
      {assignments && (
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">{t('assignments')}</h2>
          </div>

          <div className="space-y-4">
            {/* Current Assignment First */}
            {currentAssignment && (
              <AssignmentCard
                assignment={currentAssignment}
                isCurrent={true}
                isExpanded={expandedRowIds.includes(currentAssignment.id)}
                onExpand={() => toggleRow(currentAssignment.id)}
                onSubmit={() => setIsModalOpen(true)}
              />
            )}

            {/* Previous Assignments (Latest to Earliest) */}
            {previousAssignments.map((prev) => (
              <AssignmentCard
                key={prev.id}
                assignment={prev}
                isExpanded={expandedRowIds.includes(prev.id)}
                onExpand={() => toggleRow(prev.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Submission Modal */}
      {currentAssignment && (
        <SubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assignment={currentAssignment}
          onSubmit={submitAssignment}
          showToast={showToast}
        />
      )}
    </div>
  );
};

const Lessons: React.FC = () => {
  return (
    <LessonsProvider>
      <LessonsContent />
    </LessonsProvider>
  );
};

export default Lessons;