
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Question, QuestionType, QuestionOption, QuestionMediaType } from '../../types';
import { fetchQuestionById, updateQuestion } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';

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
    if (question && question.options && question.options.length < 5) {
        const newOption: QuestionOption = {
            id: `${question.id}-o${Date.now()}`,
            text: ''
        };
        const newOptions = [...question.options, newOption];
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
            if (!finalQuestion.promptText) {
                finalQuestion.promptText = `Media: ${editMediaFile.name}`;
            }
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
        <div className="space-y-6">
             <div className="bg-white/30 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">Tipe Konten & Media</label>
                <div className="flex flex-col gap-4">
                    <select 
                        value={mediaType} 
                        onChange={(e) => handleMediaTypeChange(e.target.value as QuestionMediaType)} 
                        className="w-full md:w-1/2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    >
                        <option value={QuestionMediaType.TEXT}>Hanya Teks (Normal)</option>
                        <option value={QuestionMediaType.AUDIO}>Audio (Podcast/Listen)</option>
                        <option value={QuestionMediaType.VIDEO}>Video (YouTube/Drive)</option>
                    </select>

                    {mediaType === QuestionMediaType.TEXT ? (
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pertanyaan Utama</label>
                            <textarea
                                placeholder="Tulis pertanyaan teks di sini..."
                                rows={4}
                                value={question.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
                            />
                        </div>
                    ) : (
                        <div className='space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-2'>
                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="flex-grow w-full">
                                    <Input 
                                        label={`URL Media ${mediaType}`}
                                        value={question.content} 
                                        onChange={(e) => handleInputChange('content', e.target.value)} 
                                        placeholder={`Masukkan URL ${mediaType} (YouTube/G-Drive/Direct Link)...`}
                                        disabled={!!editMediaFile}
                                        className="!mb-0"
                                    />
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
                                        <Button type="button" variant="secondary" onClick={handleClearEditFile} className="h-11 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            Hapus
                                        </Button>
                                    ) : (
                                        <Button type="button" variant="secondary" onClick={() => editFileInputRef.current?.click()} className="h-11">
                                            Ganti File...
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teks Pengantar / Pertanyaan</label>
                                <textarea
                                    placeholder={`Tulis instruksi atau pertanyaan untuk ${mediaType.toLowerCase()} ini...`}
                                    rows={3}
                                    value={question.promptText || ''}
                                    onChange={(e) => handleInputChange('promptText', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>

                            {/* Media Preview Section */}
                            {(previewUrl || (question.content && (question.content.startsWith('http') || question.content.startsWith('data:')))) && (
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        Pratinjau Media
                                    </p>
                                    <div className="flex justify-center bg-black/5 dark:bg-black/20 rounded-lg overflow-hidden">
                                        {mediaType === QuestionMediaType.AUDIO ? (
                                            <audio controls src={previewUrl || question.content} className="w-full max-w-md my-4" />
                                        ) : (
                                            <div className="w-full aspect-video flex items-center justify-center">
                                                {question.content.includes('youtube.com') || question.content.includes('youtu.be') ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 italic text-sm text-slate-500">
                                                        Pratinjau YouTube hanya tersedia saat ujian.
                                                    </div>
                                                ) : (
                                                    <video controls src={previewUrl || question.content} className="max-w-full max-h-[300px]" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                                        {editMediaFile ? `File Lokal: ${editMediaFile.name}` : `URL: ${question.content.substring(0, 50)}...`}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Mata Pelajaran" value={question.subject} onChange={(e) => handleInputChange('subject', e.target.value)} />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fase</label>
                    <select value={question.phase} onChange={(e) => handleInputChange('phase', e.target.value)} className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3">
                        <option value="D">Fase D (SMP)</option>
                        <option value="E">Fase E (SMA)</option>
                        <option value="F">Fase F (SMA)</option>
                    </select>
                </div>
            </div>
            {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
                <div className="pt-4 border-t border-white/20 dark:border-slate-700/50">
                    <h4 className="text-lg font-semibold mb-2">Opsi Jawaban</h4>
                    <div className="space-y-3">
                        {question.options.map((opt, index) => (
                            <div key={opt.id} className="flex items-center gap-3">
                                <input type="radio" name="correctAnswer" checked={question.correctAnswer === opt.id} onChange={() => handleCorrectAnswerChange(opt.id)} className="h-5 w-5 text-indigo-600"/>
                                <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                                <Input label="" value={opt.text} onChange={(e) => handleOptionTextChange(opt.id, e.target.value)} className="flex-grow !mb-0"/>
                                {question.options && question.options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(opt.id)}
                                        className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors flex-shrink-0"
                                        title="Hapus Opsi"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddOption}
                            disabled={question.options.length >= 5}
                            className="text-sm py-2 px-3 flex items-center gap-2 group"
                        >
                            <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span>Tambah Opsi Jawaban</span>
                        </Button>
                        {question.options.length >= 5 && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic">
                                Maksimal 5 opsi jawaban telah tercapai.
                            </p>
                        )}
                    </div>
                </div>
            )}
            {question.type === QuestionType.ESSAY && (
                 <div className="pt-4 border-t border-white/20 dark:border-slate-700/50">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kunci Jawaban Esai</label>
                    <textarea
                        rows={3}
                        value={question.correctAnswer}
                        onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                        className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3"
                    />
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl p-8 transform transition-all overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Soal</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="pr-2">
            {isLoading && <div className="text-center p-8"><Spinner /></div>}
            {!isLoading && !question && <p className="text-red-500">{error || "Soal tidak ditemukan."}</p>}
            {!isLoading && question && renderForm()}
        </div>


        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
        <div className="flex justify-end gap-4 mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <Button variant="secondary" onClick={onClose}>Batal</Button>
            <Button 
                onClick={handleSaveChanges} 
                disabled={isSaving || isLoading || !question?.subject || question.subject.trim().length === 0}
            >
                {isSaving ? <Spinner size="small" /> : 'Simpan Perubahan'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
