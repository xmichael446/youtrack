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
  Calendar
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

const LessonsContent: React.FC = () => {
  const { t } = useLanguage();
  const { refetch } = useDashboard();
  const { lessonsData, loading, error, markAttendance, submitAssignment } = useLessons();

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Helper to check if urgent (within 6 hours)
  const isUrgent = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diffHours = (deadline - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 6;
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

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;

  const attendance = lessonsData?.attendance;
  const assignment = lessonsData?.assignment;
  const previousLessons = lessonsData?.previous || [];

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

      {/* Upcoming Assignments */}
      {assignment && (
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-2xl font-black text-brand-dark dark:text-white flex items-center tracking-tight">
              {t('assignment')}
              {isUrgent(assignment.deadline) && (
                <span className="hidden sm:inline-flex ml-4 px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-500/20 animate-pulse uppercase tracking-wider">{t('urgent')}</span>
              )}
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-brand-primary/10 group">
            <div className="p-6 md:p-10 border-b border-gray-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                    Lesson {assignment.number}
                  </span>
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-600 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(assignment.start_datetime).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-brand-dark dark:text-white leading-tight mb-3">
                  {assignment.lesson_topic}
                </h3>
                <p className="text-red-500 dark:text-red-400 text-sm font-black flex items-center bg-red-50 dark:bg-red-500/5 w-fit px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-500/10">
                  <Clock className="w-4 h-4 mr-2" /> {t('expiresIn')} {formatDeadline(assignment.deadline)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="lg:w-auto bg-slate-900 dark:bg-brand-primary text-white px-12 py-5 rounded-[20px] font-black hover:bg-black dark:hover:bg-brand-accent transition-all shadow-xl shadow-slate-900/10 dark:shadow-brand-primary/20 hover:scale-[1.05] active:scale-95 text-lg"
              >
                {t('startSubmission')}
              </button>
            </div>


            {/* Homework Description */}
            <div className="p-6 md:p-10 border-b border-gray-50 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-800/10">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                <h4 className="flex items-center text-[10px] font-black text-brand-primary uppercase tracking-[0.25em] mb-4">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {t('homeworkDescription')}
                </h4>
                <p className="text-sm md:text-base font-bold text-gray-700 dark:text-slate-300 italic leading-relaxed relative z-10">
                  "{assignment.description}"
                </p>
              </div>
            </div>

            <div className="p-6 md:p-10 bg-gray-50/40 dark:bg-slate-800/10">
              <h4 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-6 ml-1">{t('homeworkResources')}</h4>

              {assignment.attachments && assignment.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignment.attachments.map((item, idx) => (
                    <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl hover:border-brand-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group/item ring-1 ring-transparent hover:ring-brand-primary/10">
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl mr-5 group-hover/item:bg-brand-primary/10 transition-colors">
                        <FileText className="w-6 h-6 text-gray-400 dark:text-slate-500 group-hover/item:text-brand-primary" />
                      </div>
                      <div>
                        <span className="block text-sm font-black text-gray-700 dark:text-slate-300 group-hover/item:text-brand-dark dark:group-hover/item:text-white transition-colors">{item.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" /> {item.extension ? item.extension.toUpperCase() : 'FILE'} • {(item.size ? (item.size / 1024).toFixed(0) + ' KB' : 'N/A')}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No resources attached.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Submission History */}
      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">{t('portfolioHistory')}</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] shadow-sm transition-all overflow-hidden">
          {previousLessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400 italic">
              No submission history found.
            </div>
          ) : (
            <>
              {/* Desktop View (Table) */}
              <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-50 dark:divide-slate-800">
                  <thead className="bg-gray-50/50 dark:bg-slate-800/30">
                    <tr>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('assignment')}</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('submitted')}</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('grade')}</th>
                      <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('teacherComment')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
                    {previousLessons.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-brand-primary/5 dark:hover:bg-brand-primary/5 transition-colors group/row">
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-brand-primary mr-3 opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                            <span className="text-sm font-black text-brand-dark dark:text-white">{sub.lesson_name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-gray-500 dark:text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
                                ${sub.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' :
                              sub.status === 'rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' :
                                'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'}`}>
                            {sub.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs text-gray-500 dark:text-slate-400 italic max-w-xs truncate font-semibold">
                          {sub.teacher_comment || t('noFeedback')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View (Card List) */}
              <div className="md:hidden divide-y divide-gray-50 dark:divide-slate-800">
                {previousLessons.map((sub, idx) => (
                  <div key={idx} className="p-5 active:bg-gray-50 dark:active:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-brand-primary mr-2"></div>
                        <span className="text-sm font-black text-brand-dark dark:text-white">{sub.lesson_name}</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border
                            ${sub.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' :
                          sub.status === 'rejected' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20' :
                            'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'}`}>
                        {sub.status || "Pending"}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-[10px] font-bold text-gray-400 dark:text-slate-500">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                      {sub.teacher_comment && (
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 italic font-semibold border-l-2 border-gray-100 dark:border-slate-800 pl-3 py-1">
                          {sub.teacher_comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Submission Modal */}
      {assignment && (
        <SubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assignment={assignment}
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