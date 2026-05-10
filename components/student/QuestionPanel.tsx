
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
    const mediaType = question.mediaType || QuestionMediaType.TEXT;
    const embedUrl = getEmbedUrl(question.content, mediaType);
    if (!embedUrl) {
        return <p className="text-red-500 my-4">Gagal memuat media: URL tidak valid.</p>;
    }

    if (mediaType === QuestionMediaType.AUDIO) {
        return (
            <div className="my-4">
                 <audio controls className="w-full" key={question.id}>
                    <source src={embedUrl} />
                    Browser Anda tidak mendukung elemen audio.
                </audio>
            </div>
        );
    }

    if (mediaType === QuestionMediaType.VIDEO) {
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
        <div className="mb-4">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Soal No. {questionNumber}</span>
        </div>
        <div className="text-lg text-slate-800 dark:text-slate-200 mb-6 prose dark:prose-invert max-w-none">
            {mediaType === QuestionMediaType.TEXT
                ? question.content
                : question.promptText
            }
        </div>

        {(mediaType === QuestionMediaType.AUDIO || mediaType === QuestionMediaType.VIDEO) && (
            <MediaRenderer question={question} />
        )}

        {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <div
                        key={option.id}
                        onClick={() => onAnswerChange(question.id, option.id)}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 text-slate-800 dark:text-slate-200 ${
                            currentAnswer === option.id
                            ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-400 dark:bg-indigo-900/50 dark:border-indigo-500'
                            : 'bg-white/50 border-slate-300 hover:bg-white/80 hover:border-slate-400 dark:bg-slate-700/50 dark:border-slate-600 dark:hover:bg-slate-700'
                        }`}
                    >
                        <div className="flex-shrink-0 w-6 h-6 border-2 rounded-full flex items-center justify-center mr-4" style={{borderColor: currentAnswer === option.id ? '#6366f1' : '#94a3b8'}}>
                          {currentAnswer === option.id && <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>}
                        </div>
                        <span className="font-semibold mr-2">{optionLetters[index]}.</span>
                        <span>{option.text}</span>
                    </div>
                ))}
            </div>
        )}

        {question.type === QuestionType.ESSAY && (
            <div>
                <textarea
                    rows={8}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Ketik jawaban Anda di sini..."
                    value={currentAnswer}
                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                />
            </div>
        )}

        <div className="mt-8">
            <label className="flex items-center cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isDoubtful}
                    onChange={() => onToggleDoubtful(question.id)}
                    className="h-5 w-5 rounded border-slate-400 dark:border-slate-600 bg-white/50 dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-slate-700 dark:text-slate-300">Tandai Ragu-ragu</span>
            </label>
        </div>
    </div>
  );
};

export default QuestionPanel;
