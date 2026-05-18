
import React, { useState, useEffect } from 'react';
import { Question, QuestionType, QuestionMediaType } from '../../types';
import { fetchQuestionById } from '../../services/api';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { CheckCircle2, Circle, ArrowLeft, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface QuestionDetailProps {
  questionId: string;
  onBack: () => void;
}

const DetailCard: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-sm ${className}`}>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {label}
        </p>
        <p className="font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</p>
    </div>
);

const getEmbedUrl = (url: string, type?: QuestionMediaType): string | null => {
    if (!url) return null;
    try {
        if (type === QuestionMediaType.VIDEO) {
            let videoId;
            if (url.includes('youtube.com/watch?v=')) {
                videoId = new URL(url).searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = new URL(url).pathname.substring(1);
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;

            if (url.includes('drive.google.com/file/d/')) {
                 const fileId = url.split('/d/')[1].split('/')[0];
                 return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        } else if (type === QuestionMediaType.AUDIO) {
             if (url.includes('drive.google.com/file/d/')) {
                 const fileId = url.split('/d/')[1].split('/')[0];
                 return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }
    } catch (e) {
        console.error("Invalid URL for embedding:", url, e);
        return url; // Return original URL as fallback
    }
    return url; // Fallback for other URLs
};

const MediaRenderer: React.FC<{ question: Question }> = ({ question }) => {
    const embedUrl = getEmbedUrl(question.content, question.mediaType);
    if (!embedUrl) {
        return <p className="text-red-500 my-4">Gagal memuat media: URL tidak valid.</p>;
    }

    if (question.mediaType === QuestionMediaType.AUDIO) {
        return (
            <div className="my-4">
                 <audio controls className="w-full" key={question.id}>
                    <source src={embedUrl} />
                    Browser Anda tidak mendukung elemen audio.
                </audio>
            </div>
        );
    }

    if (question.mediaType === QuestionMediaType.VIDEO) {
        const isEmbed = embedUrl.includes('youtube.com/embed') || embedUrl.includes('drive.google.com');

        return (
            <div className="my-4 w-full aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
                {isEmbed ? (
                    <iframe
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Konten Video untuk soal ${question.id}`}
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <video 
                        src={embedUrl} 
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
