
import React, { useState, useEffect } from 'react';
import { Question, QuestionType, QuestionMediaType } from '../../types';
import { fetchQuestionById } from '../../services/api';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { CheckCircle2, Circle, ArrowLeft, Info, AlertCircle, Eye, X, Volume2, Video, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuestionDetailProps {
  questionId: string;
  onBack: () => void;
}

const DetailCard: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-sm ${className}`}>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {label}
        </p>
        <p className="font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
    </div>
);

const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
        return false;
    }
};

const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    const trimmedUrl = url.trim();

    // YouTube: handles watch, embed, shorts, youtu.be, and /v/
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const youtubeMatch = trimmedUrl.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Google Drive: handles /file/d/, open?id=, and /d/
    const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=|d\/)([a-zA-Z0-9_-]+)/i;
    const driveMatch = trimmedUrl.match(driveRegex);
    
    if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    // Return the original URL as fallback if it looks like a direct link
    return trimmedUrl;
};

const MediaRenderer: React.FC<{ question: Question }> = ({ question }) => {
    const mediaType = question.mediaType || QuestionMediaType.TEXT;
    const content = question.content;
    const embedUrl = getEmbedUrl(content);
    
    if (!content || content.trim() === '') {
        return (
            <div className="my-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Media tidak tersedia: URL atau konten media kosong.</span>
            </div>
        );
    }

    if (!isValidUrl(content)) {
        return (
            <div className="my-4 p-5 bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-950/50 text-rose-900 dark:text-rose-450 rounded-2xl flex items-start gap-4 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                    <h5 className="font-black text-sm text-rose-800 dark:text-rose-300">URL Media Tidak Valid</h5>
                    <p className="text-xs opacity-90 mt-1">Harap berikan URL yang memiliki protokol HTTP/HTTPS lengkap (contoh: dari YouTube, Google Drive, atau link file audio/video langsung).</p>
                    <code className="block mt-2.5 text-[10px] p-2 bg-black/5 dark:bg-black/30 rounded font-mono truncate max-w-full">{content}</code>
                </div>
            </div>
        );
    }

    const isDrive = embedUrl ? embedUrl.includes('drive.google.com') : false;
    const isYouTube = embedUrl ? embedUrl.includes('youtube.com/embed') : false;

    if (mediaType === QuestionMediaType.AUDIO) {
        if (isDrive) {
            return (
                <div className="my-4 w-full h-42 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                    <iframe
                        src={embedUrl || undefined}
                        frameBorder="0"
                        className="w-full h-full"
                        title={`Audio dari Drive - ${question.id}`}
                    ></iframe>
                </div>
            );
        }
        return (
            <div className="my-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                 <audio controls className="w-full" key={question.id}>
                    <source src={embedUrl || undefined} />
                    Browser Anda tidak mendukung elemen audio.
                </audio>
            </div>
        );
    }

    if (mediaType === QuestionMediaType.VIDEO) {
        return (
            <div className="my-4 w-full aspect-video bg-black rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                {(isYouTube || isDrive) ? (
                    <iframe
                        src={embedUrl || undefined}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Konten Video untuk soal ${question.id}`}
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <video 
                        src={embedUrl || undefined} 
                        controls 
                        className="w-full h-full"
                        key={question.id}
                    >
                        Browser Anda tidak mendukung elemen video.
                    </video>
                )}
            </div>
        );
    }
    
    return null;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ questionId, onBack }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAnswer, setPreviewAnswer] = useState<string>('');
  const [previewDoubtful, setPreviewDoubtful] = useState<boolean>(false);

  useEffect(() => {
    setPreviewAnswer('');
    setPreviewDoubtful(false);
  }, [questionId, isPreviewOpen]);

  useEffect(() => {
    const loadQuestion = async () => {
      setIsLoading(true);
      setError(null);
      const data = await fetchQuestionById(questionId);
      if (data) {
        setQuestion(data);
      } else {
        setError("Soal tidak ditemukan.");
      }
      setIsLoading(false);
    };
    loadQuestion();
  }, [questionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Spinner />
        <p className="mt-4 text-slate-700 dark:text-slate-300">Memuat detail soal...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="text-center p-8">
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <Button onClick={onBack} variant="secondary">Kembali ke Bank Soal</Button>
        </div>
    );
  }

  if (!question) return null;

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  const mediaType = question.mediaType || QuestionMediaType.TEXT;

  return (
    <div>
        <div className="mb-6">
             <button 
                onClick={onBack} 
                className="group flex items-center gap-2 font-black text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all text-xs uppercase tracking-widest"
            >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Kembali ke Daftar Soal
            </button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Detail Soal</h2>
                <div className="hidden md:block h-px w-24 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700/50" />
            </div>
            <Button 
                onClick={() => setIsPreviewOpen(true)}
                className="py-2.5 px-5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/15 active:scale-[0.98] flex items-center justify-center gap-2 rounded-xl transition-all border border-indigo-500/20 cursor-pointer"
            >
                <Eye className="w-4.5 h-4.5" />
                Pratinjau Tampilan Siswa
            </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DetailCard label="Mata Pelajaran" value={question.subject} />
            <DetailCard label="Fase" value={question.phase} />
            <DetailCard label="Tipe Soal" value={question.type} />
            <DetailCard label="Tipe Konten" value={mediaType} />
        </div>

        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 dark:border-slate-800/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">
                    {mediaType === QuestionMediaType.TEXT ? 'Konten Pertanyaan' : 'Teks Pengantar'}
                </h3>
            </div>
            
            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 mb-8 p-6 bg-white/30 dark:bg-slate-800/30 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-inner leading-relaxed text-lg">
                {mediaType === QuestionMediaType.TEXT ? question.content : question.promptText}
            </div>

            {(mediaType === QuestionMediaType.AUDIO || mediaType === QuestionMediaType.VIDEO) && (
                <div className="mb-8">
                    <h3 className="font-black text-lg mb-4 text-indigo-700 dark:text-indigo-300">Pratinjau Media</h3>
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/10">
                        <MediaRenderer question={question} />
                    </div>
                </div>
            )}

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent my-8" />

            {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
                <div>
                    <h3 className="font-black text-xl mb-6 text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                        Opsi Jawaban
                    </h3>
                    <div className="grid gap-4">
                        {question.options.map((option, index) => {
                            const isCorrect = option.id === question.correctAnswer;
                            return (
                                <motion.div
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group flex items-start p-5 backdrop-blur-md rounded-[1.5rem] border-2 transition-all duration-500 ${
                                        isCorrect
                                        ? 'bg-emerald-50/60 border-emerald-500 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                        : 'bg-white/40 border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-md'
                                    }`}
                                >
                                    <div className="mr-4 flex-shrink-0">
                                        {isCorrect ? (
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <CheckCircle2 className="w-6 h-6 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center border-2 border-slate-200 dark:border-slate-600 group-hover:scale-105 transition-transform">
                                                <span className="font-black text-slate-400 dark:text-slate-500">
                                                    {optionLetters[index]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-1">
                                        <p className={`font-bold transition-colors ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {option.text}
                                        </p>
                                        {isCorrect && (
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1 inline-block">
                                                Jawaban Terverifikasi
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {question.type === QuestionType.ESSAY && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="font-black text-xl mb-4 text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                        Kunci Jawaban Esai
                    </h3>
                    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-900/10 dark:to-sky-900/10 p-6 rounded-3xl border-2 border-indigo-100 dark:border-indigo-500/20">
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-bold italic">
                            "{question.correctAnswer}"
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Student Preview Modal */}
        <AnimatePresence>
            {isPreviewOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-hidden"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 15 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden text-slate-800 dark:text-white"
                    >
                        {/* Device/Workspace Frame Header */}
                        <div className="px-6 py-4.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5 pl-1">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                </div>
                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
                                <div>
                                    <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 tracking-widest bg-indigo-50 dark:bg-slate-900 px-2.5 py-1 rounded-md border border-indigo-500/15">PREVIEW MODE</span>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">Simulasi Lembar Kerja Siswa</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                                title="Tutup Pratinjau"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Informational Hint banner */}
                        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/15 text-amber-800 dark:text-amber-400 text-[11px] font-bold flex items-center gap-2.5 shrink-0">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span>Ini adalah simulasi interaktif. Pengoperasian media, pemilihan jawaban, dan tombol ragu-ragu di bawah bekerja persis seperti antarmuka ril siswa. Anda tidak akan mengubah data asli.</span>
                        </div>

                        {/* Scrollable Mock Exam Container */}
                        <div className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50 dark:bg-slate-950/20">
                            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 shadow-sm">
                                {/* Question header */}
                                <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
                                    <div className="flex items-center gap-3.5">
                                        <span className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/10 italic text-lg">Q</span>
                                        <div>
                                            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Pertanyaan Simulasi</h2>
                                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                1 <span className="text-slate-300 dark:text-slate-700 font-extrabold text-lg">/ 1</span>
                                            </span>
                                        </div>
                                    </div>
                                    {mediaType !== QuestionMediaType.TEXT && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 dark:bg-indigo-550/20 text-indigo-600 dark:text-indigo-405 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 dark:border-indigo-500/30 shadow-sm transition-all duration-500">
                                            {mediaType === QuestionMediaType.AUDIO ? (
                                                <Volume2 className="h-4 w-4 animate-pulse text-indigo-500" />
                                            ) : (
                                                <Video className="h-4 w-4 animate-pulse text-indigo-500" />
                                            )}
                                            <span>{mediaType === QuestionMediaType.AUDIO ? 'LISTEN' : 'WATCH'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Question text & media panel */}
                                <div className="mb-12">
                                    {mediaType === QuestionMediaType.TEXT ? (
                                        <div className="text-2xl leading-relaxed text-slate-900 dark:text-slate-100 max-w-none font-bold tracking-tight">
                                            {question.content}
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {question.promptText && (
                                                <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-none bg-slate-500/5 dark:bg-slate-900/30 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 italic font-medium relative overflow-hidden group/prompt">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl transition-colors"></div>
                                                    <span className="not-italic font-black flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest pl-1">
                                                        <Info className="w-3.5 h-3.5" />
                                                        Instruksi Spesifik
                                                    </span>
                                                    {question.promptText}
                                                </div>
                                            )}
                                            <MediaRenderer question={question} />
                                        </div>
                                    )}
                                </div>

                                {/* Question options */}
                                {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {question.options.map((option, idx) => {
                                            const isSelected = previewAnswer === option.id;
                                            return (
                                                <div
                                                    key={option.id}
                                                    onClick={() => setPreviewAnswer(option.id)}
                                                    className={`group flex items-center p-5 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                                                        isSelected
                                                        ? 'bg-indigo-500/10 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-550 shadow-xl shadow-indigo-500/5 scale-[1.01]'
                                                        : 'bg-white dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-lg'
                                                    }`}
                                                >
                                                    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-black rounded-2xl mr-5 transition-all duration-305 transform group-hover:scale-105 ${
                                                         isSelected 
                                                         ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg' 
                                                         : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600'
                                                    }`}>
                                                      {optionLetters[idx]}
                                                    </div>
                                                    <div className={`flex-grow font-bold transition-colors text-base ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {option.text}
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Question essays */}
                                {question.type === QuestionType.ESSAY && (
                                    <div className="relative group/essay">
                                        <textarea
                                            rows={8}
                                            className="w-full bg-white dark:bg-slate-905 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-slate-900 dark:text-white p-6 font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all shadow-inner outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:italic placeholder:font-medium leading-relaxed"
                                            placeholder="Ketikkan tanggapan Anda di sini untuk melihat tanggapan pada antarmuka siswa..."
                                            value={previewAnswer}
                                            onChange={(e) => setPreviewAnswer(e.target.value)}
                                        />
                                        <div className="absolute top-5 right-8 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.25em]">Essay Editor Mock</div>
                                    </div>
                                )}

                                {/* Doubtful banner */}
                                <div className="mt-12 group">
                                    <label className="inline-flex items-center cursor-pointer select-none px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all duration-300">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={previewDoubtful}
                                                onChange={() => setPreviewDoubtful(!previewDoubtful)}
                                                className="peer sr-only"
                                            />
                                            <div className="h-6 w-6 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 peer-checked:bg-amber-500 peer-checked:border-amber-500 peer-checked:scale-105 transition-all"></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2500/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        </div>
                                        <span className={`ml-3 text-xs font-black uppercase tracking-widest transition-colors ${previewDoubtful ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 group-hover:text-amber-500'}`}>Tandai Ragu-ragu</span>
                                        {previewDoubtful && <div className="ml-2 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default QuestionDetail;
