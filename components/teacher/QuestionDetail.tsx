
import React, { useState, useEffect } from 'react';
import { Question, QuestionType, QuestionMediaType } from '../../types';
import { fetchQuestionById } from '../../services/api';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

interface QuestionDetailProps {
  questionId: string;
  onBack: () => void;
}

const DetailCard: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={`bg-white/40 dark:bg-slate-800/50 p-3 rounded-lg ${className}`}>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="font-semibold text-slate-800 dark:text-white">{value}</p>
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
             <button onClick={onBack} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors text-sm">
                {'< Kembali ke Daftar Soal'}
            </button>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Detail Soal</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <DetailCard label="Mata Pelajaran" value={question.subject} />
            <DetailCard label="Fase" value={question.phase} />
            <DetailCard label="Tipe Soal" value={question.type} />
            <DetailCard label="Tipe Konten" value={mediaType} />
        </div>

        <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-indigo-700 dark:text-indigo-300">
              {mediaType === QuestionMediaType.TEXT ? 'Konten Pertanyaan' : 'Teks Pengantar'}
            </h3>
            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 mb-6">
                {mediaType === QuestionMediaType.TEXT ? question.content : question.promptText}
            </div>

            {(mediaType === QuestionMediaType.AUDIO || mediaType === QuestionMediaType.VIDEO) && (
                <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 text-indigo-700 dark:text-indigo-300">Pratinjau Media</h3>
                    <MediaRenderer question={question} />
                </div>
            )}

            <hr className="border-white/20 dark:border-slate-700/50 my-6" />

            {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
                <div>
                    <h3 className="font-bold text-lg mb-4 text-indigo-700 dark:text-indigo-300">Opsi Jawaban</h3>
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const isCorrect = option.id === question.correctAnswer;
                            return (
                                <div
                                    key={option.id}
                                    className={`flex items-start p-4 border rounded-lg transition-all duration-200 ${
                                        isCorrect
                                        ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-500'
                                        : 'bg-white/50 border-slate-300 dark:bg-slate-800/50 dark:border-slate-600'
                                    }`}
                                >
                                    {isCorrect ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <div className="flex-shrink-0 w-6 h-6 border-2 border-slate-400 dark:border-slate-500 rounded-full flex items-center justify-center mr-3" />
                                    )}
                                    <span className="font-semibold mr-2">{optionLetters[index]}.</span>
                                    <span className="text-slate-800 dark:text-slate-200">{option.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {question.type === QuestionType.ESSAY && (
                <div>
                    <h3 className="font-bold text-lg mb-3 text-indigo-700 dark:text-indigo-300">Kunci Jawaban Esai</h3>
                     <p className="text-sm text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 p-4 rounded-md">{question.correctAnswer}</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default QuestionDetail;
