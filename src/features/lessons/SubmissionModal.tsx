import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  X,
  Link as LinkIcon,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { AssignmentData, HomeworkSubmissionData } from '../../services/apiTypes';
import { ShowToast } from './lessonTypes';

const SubmissionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentData;
  onSubmit: (data: Omit<HomeworkSubmissionData, 'assignment_id' | 'student_code'>) => Promise<void>;
  showToast: ShowToast;
}> = ({ isOpen, onClose, assignment, onSubmit, showToast }) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<({ type: 'link', value: string } | { type: 'file', file: File })[]>([{ type: 'link', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddLink = () => setAttachments([...attachments, { type: 'link', value: '' }]);
  const handleRemoveAttachment = (index: number) => setAttachments(attachments.filter((_, i) => i !== index));
  const handleLinkChange = (index: number, value: string) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].type === 'link') {
      newAttachments[index] = { type: 'link', value };
      setAttachments(newAttachments);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ type: 'file' as const, file }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const links = attachments.filter(a => a.type === 'link' && a.value.trim() !== '') as { type: 'link', value: string }[];
      const files = attachments.filter(a => a.type === 'file') as { type: 'file', file: File }[];

      const finalAttachments: any[] = [];
      const finalFiles: File[] = [];

      links.forEach(l => {
        finalAttachments.push({ type: 'link', name: 'Link', url: l.value });
      });

      files.forEach(f => {
        finalAttachments.push({ type: 'file', name: f.file.name });
        finalFiles.push(f.file);
      });

      await onSubmit({
        comment: comment,
        attachments: finalAttachments.length > 0 ? finalAttachments : undefined,
        files: finalFiles.length > 0 ? finalFiles : undefined
      });

      showToast(t('assignmentSubmitted'), "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || t('failedToSubmitAssignment'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/60 animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-t-[24px] md:rounded-[24px] shadow-2xl w-full max-w-2xl relative z-10 flex flex-col border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[90vh] animate-in duration-300 ease-out">
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-brand-dark dark:text-white">{t('submitAssignment')}</h3>
            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">LSN {assignment.number}: {assignment.lesson_topic}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="section-label text-gray-400 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-2 text-brand-primary" />
              {t('commentOptional')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('anyNotes')}
              className="w-full rounded-[16px] border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none transition-all dark:text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="section-label text-gray-400 flex items-center">
                <LinkIcon className="w-3.5 h-3.5 mr-2 text-brand-primary" />
                {t('addAttachment')}
              </label>
              <div className="flex bg-gray-100 dark:bg-slate-950 p-1 rounded-[12px] border border-gray-200/50 dark:border-slate-800">
                <button
                  onClick={handleAddLink}
                  className="px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wider transition-all text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {t('addLink')}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wider transition-all text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {t('addFile')}
                </button>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              {attachments.map((attachment, idx) => (
                <div key={idx} className="flex gap-2 group items-center">
                  {attachment.type === 'link' ? (
                    <div className="relative flex-1">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={attachment.value}
                        onChange={(e) => handleLinkChange(idx, e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-[12px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2.5 text-sm font-mono focus:border-brand-primary focus:outline-none transition-all dark:text-white"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-800 rounded-[12px] border border-gray-100 dark:border-slate-700 hover:border-brand-primary/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-brand-primary" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate max-w-[150px] md:max-w-[200px]">{attachment.file.name}</span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">{(attachment.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                  <button onClick={() => handleRemoveAttachment(idx)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {attachments.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  {t('noAttachments')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-slate-800 flex gap-3 bg-gray-50/50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-3 md:px-4 md:py-3.5 rounded-[12px] text-sm md:text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-3 py-3 md:px-4 md:py-3.5 rounded-[12px] text-sm md:text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span className="truncate">{t('submitAssignment')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SubmissionModal;
