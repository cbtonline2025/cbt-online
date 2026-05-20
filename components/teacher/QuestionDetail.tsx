
import React, { useState, useEffect } from 'react';
import { Question, QuestionType, QuestionMediaType } from '../../types';
import { fetchQuestionById } from '../../services/api';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { CheckCircle2, Circle, ArrowLeft, Info, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

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
        
        <div className="flex items-center gap-4 mb-6">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Detail Soal</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700/50" />
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
    </div>
  );
};

export default QuestionDetail;
