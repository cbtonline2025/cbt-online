
import React from 'react';
import { Question, QuestionType, QuestionMediaType } from '../../types';
import { Volume2, Video, Headphones, PlayCircle, Info } from 'lucide-react';

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer: string;
  isDoubtful: boolean;
  onAnswerChange: (questionId: string, answer: string) => void;
  onToggleDoubtful: (questionId: string) => void;
}

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
    const embedUrl = getEmbedUrl(question.content);
    
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
  totalQuestions,
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
                   <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Pertanyaan Ke</h2>
                   <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{questionNumber} <span className="text-slate-300 dark:text-slate-700 font-medium">/ {totalQuestions}</span></span>
                </div>
            </div>
            {mediaType !== QuestionMediaType.TEXT && (
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-all duration-500">
                    {mediaType === QuestionMediaType.AUDIO ? (
                        <Volume2 className="h-4 w-4 animate-pulse" />
                    ) : (
                        <Video className="h-4 w-4 animate-pulse" />
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
                        <div className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-none bg-slate-50/50 dark:bg-slate-900/30 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 italic font-medium relative group/prompt overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover/prompt:bg-indigo-500/10 transition-colors"></div>
                            <span className="not-italic font-black flex items-center gap-2 mb-4 text-indigo-500 dark:text-indigo-400 text-[10px] uppercase tracking-widest pl-1">
                                <Info className="w-3 h-3" />
                                Instruksi Spesifik
                            </span>
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
