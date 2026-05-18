
import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Image as ImageIcon, Video, Mic, CheckCircle2, Trash2 } from 'lucide-react';
import { Question, QuestionType, QuestionOption, QuestionMediaType } from '../../types';
import { fetchQuestionById, updateQuestion } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { motion, AnimatePresence } from 'motion/react';

interface EditQuestionModalProps {
  questionId: string;
  onClose: () => void;
  onQuestionUpdated: (updatedQuestion: Question) => void;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({ questionId, onClose, onQuestionUpdated }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const editFileInputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const loadQuestion = async () => {
      setIsLoading(true);
      setError(null);
      const data = await fetchQuestionById(questionId);
      if (data) {
        // Ensure mediaType defaults to TEXT if not present
        setQuestion({ ...data, mediaType: data.mediaType || QuestionMediaType.TEXT });
      } else {
        setError("Gagal memuat soal untuk diedit.");
      }
      setIsLoading(false);
    };
    loadQuestion();
  }, [questionId]);
  
  const handleInputChange = (field: keyof Question, value: any) => {
    if (question) {
        setQuestion({ ...question, [field]: value });
    }
  };

  const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        if (file.size > 10 * 1024 * 1024) { // Increased to 10MB as 2MB is quite small for video
            setError('Ukuran file terlalu besar (maks 10MB). Saran: Gunakan URL Google Drive atau YouTube.');
            return;
        }

        // Cleanup old preview
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const newPreviewUrl = URL.createObjectURL(file);
        setEditMediaFile(file);
        setPreviewUrl(newPreviewUrl);
        setError(null);
        handleInputChange('content', `File: ${file.name}`);
    }
  };

  const handleClearEditFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setEditMediaFile(null);
    setPreviewUrl(null);
    handleInputChange('content', '');
    if (editFileInputRef.current) {
        editFileInputRef.current.value = '';
    }
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    if (question && question.options) {
        const newOptions = question.options.map(opt => 
            opt.id === optionId ? { ...opt, text } : opt
        );
        handleInputChange('options', newOptions);
    }
  };

  const handleCorrectAnswerChange = (optionId: string) => {
    if (question?.type === QuestionType.MULTIPLE_CHOICE) {
        handleInputChange('correctAnswer', optionId);
    }
  };

  const handleAddOption = () => {
    if (question && (question.options?.length || 0) < 5) {
        const newOption: QuestionOption = {
            id: `${question.id}-o${Date.now()}`,
            text: ''
        };
        const newOptions = [...(question.options || []), newOption];
        handleInputChange('options', newOptions);
    }
  };

  const handleRemoveOption = (optionIdToRemove: string) => {
    if (question && question.options && question.options.length > 2) {
      if (!window.confirm("Apakah Anda yakin ingin menghapus opsi ini?")) {
        return;
      }
      const newOptions = question.options.filter(opt => opt.id !== optionIdToRemove);

      let newCorrectAnswer = question.correctAnswer;
      // If the deleted option was the correct answer, reset to the first remaining option
      if (question.correctAnswer === optionIdToRemove) {
        newCorrectAnswer = newOptions[0]?.id || '';
      }

      setQuestion({
        ...question,
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!question) return;

    setIsSaving(true);
    setError(null);

    // Basic validation
    if (!question.subject || typeof question.subject !== 'string' || question.subject.trim().length === 0) {
        setError("Mata pelajaran wajib diisi dan tidak boleh hanya berisi spasi.");
        setIsSaving(false);
        return;
    }
     if (question.mediaType === QuestionMediaType.TEXT) {
        if (!question.content.trim()) {
            setError("Konten soal tidak boleh kosong.");
            setIsSaving(false);
            return;
        }
    } else {
        if (!question.content.trim()) {
            setError("URL media tidak boleh kosong.");
            setIsSaving(false);
            return;
        }
        if (!question.promptText?.trim()) {
            setError("Teks pengantar media tidak boleh kosong.");
            setIsSaving(false);
            return;
        }
    }

    if (question.type === QuestionType.MULTIPLE_CHOICE) {
        const hasEmptyOption = question.options?.some(opt => opt.text.trim() === '');
        if (hasEmptyOption) {
            setError("Teks opsi jawaban tidak boleh kosong.");
            setIsSaving(false);
            return;
        }
    }

    let finalQuestion = { ...question };
    if (editMediaFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(editMediaFile);
        });
        try {
            finalQuestion.content = await base64Promise;
        } catch (e) {
            setError("Gagal memproses file media.");
            setIsSaving(false);
            return;
        }
    }

    const success = await updateQuestion(finalQuestion);
    if (success) {
        onQuestionUpdated(finalQuestion);
        onClose();
    } else {
        setError("Gagal menyimpan perubahan. Silakan coba lagi.");
    }
    setIsSaving(false);
  };

  const handleMediaTypeChange = (newMediaType: QuestionMediaType) => {
    if (!question) return;

    let updatedQuestion = { ...question, mediaType: newMediaType };

    // If switching from TEXT to something else, move content to promptText if promptText is empty
    if (question.mediaType === QuestionMediaType.TEXT && newMediaType !== QuestionMediaType.TEXT) {
      if (!question.promptText || question.promptText.trim() === '') {
        updatedQuestion.promptText = question.content;
      }
      updatedQuestion.content = ''; // Clear content for URL
    } else if (question.mediaType !== QuestionMediaType.TEXT && newMediaType === QuestionMediaType.TEXT) {
      // If switching back to TEXT, restore content from promptText if content is just a URL
      if (question.promptText && (!question.content || question.content.startsWith('http') || question.content.startsWith('https'))) {
        updatedQuestion.content = question.promptText;
      }
    }

    setQuestion(updatedQuestion);
  };

  const renderForm = () => {
    if (!question) return null;
    
    const mediaType = question.mediaType || QuestionMediaType.TEXT;

    return (
        <div className="space-y-8">
             <div className="bg-white/40 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-indigo-500" />
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Konfigurasi Media</label>
                </div>
                
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Tipe Konten</label>
                            <select 
                                value={mediaType} 
                                onChange={(e) => handleMediaTypeChange(e.target.value as QuestionMediaType)} 
                                className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/5 rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                            >
                                <option value={QuestionMediaType.TEXT}>Normal (Teks)</option>
                                <option value={QuestionMediaType.AUDIO}>Audio Interaktif</option>
                                <option value={QuestionMediaType.VIDEO}>Video Eksplanasi</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Mata Pelajaran</label>
                            <Input 
                                value={question.subject} 
                                onChange={(e) => handleInputChange('subject', e.target.value)} 
                                className="rounded-2xl !mb-0"
                                placeholder="Cth: Matematika"
                            />
                        </div>
                    </div>

                    {mediaType === QuestionMediaType.TEXT ? (
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Pertanyaan Utama</label>
                            <textarea
                                placeholder="Tulis rincian pertanyaan di sini..."
                                rows={5}
                                value={question.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/5 rounded-3xl p-5 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all min-h-[150px] shadow-inner"
                            />
                        </div>
                    ) : (
                        <div className='space-y-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800/50'>
                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-2">URL Sumber Media <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <Input 
                                            value={question.content} 
                                            onChange={(e) => handleInputChange('content', e.target.value)} 
                                            placeholder={`https://... (Source ${mediaType})`}
                                            disabled={!!editMediaFile}
                                            className="!mb-0 rounded-2xl pl-12"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            {mediaType === QuestionMediaType.AUDIO ? <Mic className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <input 
                                        type="file" 
                                        ref={editFileInputRef} 
                                        className="hidden" 
                                        onChange={handleEditFileChange}
                                        accept={mediaType === QuestionMediaType.AUDIO ? "audio/*" : "video/*"}
                                    />
                                    {editMediaFile ? (
                                        <Button type="button" variant="secondary" onClick={handleClearEditFile} className="h-[68px] px-6 rounded-2xl flex items-center gap-2 border-rose-100 text-rose-500 dark:bg-rose-500/10">
                                            <Trash2 className="h-4 w-4" />
                                            HAPUS
                                        </Button>
                                    ) : (
                                        <Button type="button" variant="secondary" onClick={() => editFileInputRef.current?.click()} className="h-[68px] px-6 rounded-2xl font-bold text-xs tracking-widest">
                                            UPLOAD
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                    Instruksi / Narasi Soal <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    placeholder={`Jelaskan apa yang harus dilakukan siswa dengan media ${mediaType.toLowerCase()} ini...`}
                                    rows={3}
                                    value={question.promptText || ''}
                                    onChange={(e) => handleInputChange('promptText', e.target.value)}
                                    className={`w-full bg-white/50 dark:bg-slate-800/50 border ${!question.promptText?.trim() && error?.includes('Teks pengantar') ? 'border-rose-500' : 'border-white/60 dark:border-white/5'} rounded-3xl p-5 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner`}
                                />
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 italic">
                                    * Wajib diisi agar siswa memahami instruksi pengerjaan soal berbasis media.
                                </p>
                            </div>

                            {/* Media Preview Section */}
                            {(previewUrl || (question.content && (question.content.startsWith('http') || question.content.startsWith('data:')))) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-6 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Live Preview</span>
                                    </div>
                                    <div className="flex justify-center bg-black/5 dark:bg-black/20 rounded-2xl overflow-hidden shadow-inner">
                                        {mediaType === QuestionMediaType.AUDIO ? (
                                            <audio controls src={previewUrl || question.content} className="w-full max-w-md my-6 px-4" />
                                        ) : (
                                            <div className="w-full aspect-video flex items-center justify-center p-2">
                                                {question.content.includes('youtube.com') || question.content.includes('youtu.be') ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-white/20">
                                                        <Video className="w-8 h-8 text-slate-300 mb-2" />
                                                        <p className="text-xs font-semibold text-slate-400 italic">Pratinjau YouTube hanya tampil di modul ujian.</p>
                                                    </div>
                                                ) : (
                                                    <video controls src={previewUrl || question.content} className="max-w-full rounded-lg shadow-2xl max-h-[280px]" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Tipe Soal</label>
                    <select 
                        value={question.type} 
                        onChange={(e) => handleInputChange('type', e.target.value as QuestionType)} 
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/5 rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                    >
                        <option value={QuestionType.MULTIPLE_CHOICE}>Pilihan Ganda</option>
                        <option value={QuestionType.ESSAY}>Esai</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Level Kompetensi (Fase)</label>
                    <select 
                        value={question.phase} 
                        onChange={(e) => handleInputChange('phase', e.target.value)} 
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/5 rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                    >
                        <option value="D">Fase D (Tingkat SMP)</option>
                        <option value="E">Fase E (SMA Kelas 10)</option>
                        <option value="F">Fase F (SMA Kelas 11-12)</option>
                    </select>
                </div>
            </div>

            {question.type === QuestionType.MULTIPLE_CHOICE && (
                <div className="pt-8 border-t border-dashed border-slate-200 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Opsi Jawaban & Kunci</h4>
                    </div>
                    
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {(question.options || []).map((opt, index) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={opt.id} 
                                    className={`flex items-center gap-4 p-4 rounded-3xl transition-all border-2 ${
                                        question.correctAnswer === opt.id 
                                        ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                                        : 'bg-white/30 dark:bg-white/5 border-white/40 dark:border-white/5'
                                    }`}
                                >
                                    <div className="relative">
                                        <input 
                                            type="radio" 
                                            name="correctAnswer" 
                                            checked={question.correctAnswer === opt.id} 
                                            onChange={() => handleCorrectAnswerChange(opt.id)} 
                                            className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            question.correctAnswer === opt.id 
                                            ? 'bg-emerald-500 border-emerald-500 scale-110' 
                                            : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                            {question.correctAnswer === opt.id && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                        </div>
                                    </div>
                                    
                                    <span className="text-xs font-black text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">{String.fromCharCode(65 + index)}</span>
                                    
                                    <div className="flex-1">
                                        <Input 
                                            label="" 
                                            value={opt.text} 
                                            onChange={(e) => handleOptionTextChange(opt.id, e.target.value)} 
                                            className={`!mb-0 rounded-2xl border-none bg-transparent dark:bg-transparent px-0 font-medium ${question.correctAnswer === opt.id ? 'text-emerald-700 dark:text-emerald-300' : ''}`}
                                            placeholder={`Tulis opsi ${String.fromCharCode(65 + index)}...`}
                                        />
                                    </div>
                                    
                                    {question.options && question.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(opt.id)}
                                            className="p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-all active:scale-90"
                                            title="Hapus Opsi"
                                        >
                                            <Trash2 className="h-4.5 w-4.5" />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="mt-6 flex justify-center">
                        {(question.options?.length || 0) < 5 ? (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAddOption}
                                className="group rounded-2xl py-3 px-6 flex items-center gap-3 bg-white/40 dark:bg-white/5 border-dashed border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-indigo-600"
                            >
                                <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                                <span>TAMBAH OPSI JAWABAN</span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-full border border-amber-100 dark:border-amber-900/30">
                                <Settings className="w-3 h-3 text-amber-500" />
                                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                    Limit : Maksimal 5 Opsi
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {question.type === QuestionType.ESSAY && (
                 <div className="pt-8 border-t border-dashed border-slate-200 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        <label className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Kunci Jawaban Model Esai</label>
                    </div>
                    <textarea
                        rows={4}
                        placeholder="Masukkan estimasi jawaban atau poin kunci yang harus ada..."
                        value={question.correctAnswer}
                        onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/5 rounded-[2rem] p-6 text-sm font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                    />
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Aurora Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-4xl glass-card p-10 relative overflow-hidden flex flex-col max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500" />
        
        <div className="flex justify-between items-center mb-10 shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                    <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                     <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Editor Butir Soal</h2>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">ID Ref: {questionId.substring(0, 8)}...</p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800 transition-all border border-white/40 dark:border-white/5 active:scale-90"
            >
                <X className="h-6 w-6" />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading && (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Spinner size="large" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Menyiapkan Data...</p>
                </div>
            )}
            {!isLoading && !question && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-8 rounded-3xl text-center">
                    <p className="text-rose-600 dark:text-rose-400 font-bold">{error || "Data butir soal tidak ditemukan atau terhapus."}</p>
                </div>
            )}
            {!isLoading && question && renderForm()}
        </div>


        {error && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mx-2 mt-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center gap-3"
            >
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <p className="text-xs font-black text-rose-600 dark:text-rose-400 tracking-wider uppercase">{error}</p>
            </motion.div>
        )}
        
        <div className="flex justify-end items-center gap-4 mt-10 border-t border-slate-100/50 dark:border-slate-800/50 pt-8 shrink-0">
            <Button 
                variant="secondary" 
                onClick={onClose}
                className="px-8 py-4 rounded-2xl font-bold border-none transition-all"
            >
                BATAL
            </Button>
            <Button 
                onClick={handleSaveChanges} 
                disabled={isSaving || isLoading || !question?.subject || question?.subject?.trim().length === 0}
                className="px-10 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 transition-all text-sm tracking-widest"
            >
                {isSaving ? <Spinner size="small" /> : 'SIMPAN PERUBAHAN'}
            </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditQuestionModal;
