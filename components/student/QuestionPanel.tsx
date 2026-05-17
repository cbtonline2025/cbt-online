
import React from 'react';
import { Question, QuestionType, QuestionMediaType } from '../../types';

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  currentAnswer: string;
  isDoubtful: boolean;
  onAnswerChange: (questionId: string, answer: string) => void;
  onToggleDoubtful: (questionId: string) => void;
}

const getEmbedUrl = (url: string, type?: QuestionMediaType): string | null => {
    if (!url) return null;
    try {
        const trimmedUrl = url.trim();
        
        // Handle YouTube
        if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
            let videoId = null;
            if (trimmedUrl.includes('youtube.com/watch?v=')) {
                const urlObj = new URL(trimmedUrl);
                videoId = urlObj.searchParams.get('v');
            } else if (trimmedUrl.includes('youtube.com/embed/')) {
                videoId = trimmedUrl.split('/embed/')[1].split(/[?#]/)[0];
            } else if (trimmedUrl.includes('youtu.be/')) {
                const urlObj = new URL(trimmedUrl);
                videoId = urlObj.pathname.substring(1);
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        // Handle Google Drive
        if (trimmedUrl.includes('drive.google.com/file/d/')) {
            const fileId = trimmedUrl.split('/d/')[1].split('/')[0];
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        
        if (trimmedUrl.includes('drive.google.com/open?id=')) {
            const urlObj = new URL(trimmedUrl);
            const fileId = urlObj.searchParams.get('id');
            if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
        }

    } catch (e) {
        console.error("Invalid URL for embedding:", url, e);
    }
    return url; // Fallback for other URLs
};

const MediaRenderer: React.FC<{ question: Question }> = ({ question }) => {
    const mediaType = question.mediaType || QuestionMediaType.TEXT;
    const embedUrl = getEmbedUrl(question.content, mediaType);
    
    if (!embedUrl || embedUrl.trim() === '') {
        return <p className="text-amber-500 italic my-2 text-sm">Media tidak tersedia.</p>;
    }

    const isDrive = embedUrl.includes('drive.google.com');
    const isYouTube = embedUrl.includes('youtube.com/embed');

    if (mediaType === QuestionMediaType.AUDIO) {
        if (isDrive) {
            return (
                <div className="my-4 w-full h-40 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                    <iframe
                        src={embedUrl}
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
                    <source src={embedUrl} />
                    Browser Anda tidak mendukung elemen audio.
                </audio>
            </div>
        );
    }

    if (mediaType === QuestionMediaType.VIDEO) {
        return (
            <div className="my-6 w-full aspect-video bg-black rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {(isYouTube || isDrive) ? (
                    <iframe
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Video Content - ${question.id}`}
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


const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  questionNumber,
  currentAnswer,
  isDoubtful,
  onAnswerChange,
  onToggleDoubtful,
}) => {
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  const mediaType = question.mediaType || QuestionMediaType.TEXT;
  
  return (
    <div>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-50 pb-6">
            <div className="flex items-center gap-3">
                <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-100 italic">Q</span>
                <div>
                   <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Pertanyaan Ke</h2>
                   <span className="text-2xl font-black text-slate-900 tracking-tighter">{questionNumber} <span className="text-slate-300 font-medium">/ 10</span></span>
                </div>
            </div>
            {mediaType !== QuestionMediaType.TEXT && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100 shadow-sm">
                    {mediaType === QuestionMediaType.AUDIO ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15L4 14.414V9.586L5.586 9H10l5 5v5l-5-4H5.586z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                    <span>{mediaType === QuestionMediaType.AUDIO ? 'LISTEN' : 'WATCH'}</span>
                </div>
            )}
        </div>

        <div className="mb-12">
            {mediaType === QuestionMediaType.TEXT ? (
                <div className="text-2xl leading-snug text-slate-900 max-w-none font-bold tracking-tight">
                    {question.content}
                </div>
            ) : (
                <div className="space-y-8">
                    {question.promptText && (
                        <div className="text-lg leading-relaxed text-slate-600 max-w-none bg-slate-50/50 p-8 rounded-3xl border border-dashed border-slate-200 italic font-medium">
                            <span className="not-italic font-black block mb-4 text-indigo-500 text-[10px] uppercase tracking-widest pl-1">Instruksi Spesifik</span>
                            {question.promptText}
                        </div>
                    )}
                    <MediaRenderer question={question} />
                </div>
            )}
        </div>

        {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
            <div className="grid grid-cols-1 gap-4">
                {question.options.map((option, index) => (
                    <div
                        key={option.id}
                        onClick={() => onAnswerChange(question.id, option.id)}
                        className={`group flex items-center p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                            currentAnswer === option.id
                            ? 'bg-indigo-50 border-indigo-600 shadow-lg shadow-indigo-100 scale-[1.01]'
                            : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 hover:shadow-md'
                        }`}
                    >
                        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-black rounded-xl mr-5 transition-all duration-300 ${
                             currentAnswer === option.id 
                             ? 'bg-indigo-600 text-white shadow-lg' 
                             : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                        }`}>
                          {optionLetters[index]}
                        </div>
                        <div className={`flex-grow font-bold transition-colors ${currentAnswer === option.id ? 'text-indigo-900' : 'text-slate-600'}`}>
                            {option.text}
                        </div>
                        {currentAnswer === option.id && (
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {question.type === QuestionType.ESSAY && (
            <div className="relative group">
                <textarea
                    rows={10}
                    className="w-full bg-white border-2 border-slate-100 rounded-3xl text-slate-900 p-8 font-bold text-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all shadow-inner outline-none placeholder:text-slate-200 placeholder:italic placeholder:font-medium"
                    placeholder="Tuliskan pemahaman atau jawaban Anda secara komprehensif di sini..."
                    value={currentAnswer}
                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                />
                <div className="absolute top-4 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Essay Editor</div>
            </div>
        )}

        <div className="mt-12 group">
            <label className="inline-flex items-center cursor-pointer select-none px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-amber-200 transition-all duration-300">
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={isDoubtful}
                        onChange={() => onToggleDoubtful(question.id)}
                        className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded-lg bg-white border-2 border-slate-200 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <span className={`ml-3 text-xs font-black uppercase tracking-widest transition-colors ${isDoubtful ? 'text-amber-600' : 'text-slate-400 group-hover:text-amber-500'}`}>Tandai Ragu-ragu</span>
                {isDoubtful && <div className="ml-2 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>}
            </label>
        </div>
    </div>
  );
};

export default QuestionPanel;
