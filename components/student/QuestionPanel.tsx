import React from 'react';
import { Question, QuestionType, QuestionMediaType } from '../../types';
import { Volume2, Video, Headphones, Info, AlertCircle, ArrowUp, ArrowDown, CheckSquare, Square, Play, Pause, VolumeX, RotateCcw } from 'lucide-react';

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer: string;
  isDoubtful: boolean;
  onAnswerChange: (questionId: string, answer: string) => void;
  onToggleDoubtful: (questionId: string) => void;
}

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

const CustomAudioPlayer: React.FC<{ src: string; questionId: string }> = ({ src, questionId }) => {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => console.error("Error playing audio:", err));
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, clickX / width));
        audioRef.current.currentTime = percentage * duration;
        setCurrentTime(percentage * duration);
    };

    const handleVolumeToggle = () => {
        if (!audioRef.current) return;
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        audioRef.current.muted = newMuted;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        setIsMuted(newVol === 0);
        audioRef.current.volume = newVol;
        audioRef.current.muted = newVol === 0;
    };

    const handleRestart = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        audioRef.current.play().then(() => {
            setIsPlaying(true);
        });
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs)) return '0:00';
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const boundedPercent = Math.min(100, progressPercent);

    return (
        <div className="my-6 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 dark:from-indigo-550/10 dark:to-fuchsia-550/10 p-6 rounded-3xl border-2 border-white/60 dark:border-white/10 shadow-lg backdrop-blur-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
            <audio 
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                key={questionId}
                className="hidden"
            />

            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700 -z-10"></div>
            
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-2xl text-white shadow-lg shadow-indigo-500/25 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Headphones className="w-8 h-8" />
            </div>

            <div className="flex-grow w-full space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 dark:bg-indigo-500/20 px-3.5 py-1 rounded-full border border-indigo-500/20">Pemutar Audio Interaktif</span>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mt-2">Dengarkan klip audio materi dengan bilah pelacakan di bawah ini.</h4>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                        {formatTime(currentTime)} <span className="text-slate-300 dark:text-slate-650">/</span> {formatTime(duration)}
                    </div>
                </div>

                {/* Custom Progress Bar Indicator */}
                <div className="space-y-2">
                    <div 
                        onClick={handleProgressClick}
                        className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full cursor-pointer overflow-hidden transition-all duration-300 hover:h-4"
                    >
                        <div 
                            style={{ width: `${boundedPercent}%` }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-fuchsia-650 rounded-full transition-all duration-100"
                        />
                        <div 
                            style={{ left: `${boundedPercent}%` }}
                            className="absolute top-0 -translate-x-1/2 w-1 h-full bg-white opacity-90 pointer-events-none"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20 cursor-pointer"
                            title={isPlaying ? "Jeda" : "Putar"}
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>

                        <button
                            type="button"
                            onClick={handleRestart}
                            className="w-11 h-11 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl transition hover:scale-105 cursor-pointer"
                            title="Mulai Ulang"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleVolumeToggle}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition cursor-pointer"
                            title={isMuted ? "Suarakan" : "Senyapkan"}
                        >
                            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 md:w-28 accent-indigo-600 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomVideoPlayer: React.FC<{ src: string; questionId: string }> = ({ src, questionId }) => {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(false);
    const [showControls, setShowControls] = React.useState(true);

    React.useEffect(() => {
        let timeout: any;
        if (isPlaying) {
            timeout = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        } else {
            setShowControls(true);
        }
        return () => clearTimeout(timeout);
    }, [isPlaying, currentTime]);

    const handleMouseMove = () => {
        setShowControls(true);
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => console.error("Error playing video:", err));
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, clickX / width));
        videoRef.current.currentTime = percentage * duration;
        setCurrentTime(percentage * duration);
    };

    const handleVolumeToggle = () => {
        if (!videoRef.current) return;
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        videoRef.current.muted = newMuted;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        setIsMuted(newVol === 0);
        videoRef.current.volume = newVol;
        videoRef.current.muted = newVol === 0;
    };

    const handleRestart = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
        videoRef.current.play().then(() => {
            setIsPlaying(true);
        });
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs)) return '0:00';
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const boundedPercent = Math.min(100, progressPercent);

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="my-6 w-full aspect-video bg-slate-950 dark:bg-black rounded-3xl shadow-2xl overflow-hidden border-2 border-white/60 dark:border-white/10 relative group/video"
        >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-rose-500 z-20"></div>

            <video 
                ref={videoRef}
                src={src}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer relative z-10"
                key={questionId}
            />

            <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent p-5 pt-10 z-20 transition-all duration-300 flex flex-col gap-4 ${
                showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
                <div className="space-y-1">
                    <div 
                        onClick={handleProgressClick}
                        className="relative w-full h-2 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer overflow-hidden transition-all duration-300 hover:h-3"
                    >
                        <div 
                            style={{ width: `${boundedPercent}%` }}
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-550 to-rose-500 rounded-full"
                        />
                        <div 
                            style={{ left: `${boundedPercent}%` }}
                            className="absolute top-0 -translate-x-1/2 w-1 h-full bg-white opacity-90 pointer-events-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="w-10 h-10 flex items-center justify-center bg-white text-slate-950 rounded-xl transition hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                            title={isPlaying ? "Jeda" : "Putar"}
                        >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current text-slate-950" /> : <Play className="w-4 h-4 fill-current text-slate-950 ml-0.5" />}
                        </button>

                        <button
                            type="button"
                            onClick={handleRestart}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition hover:scale-105 cursor-pointer"
                            title="Mulai Ulang"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-white" />
                        </button>

                        <div className="text-xs font-mono font-bold text-white/95 px-2 py-1">
                            {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleVolumeToggle}
                            className="p-1.5 hover:bg-white/10 text-white rounded-lg transition shrink-0 cursor-pointer"
                        >
                            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                        </button>
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 md:w-24 accent-white bg-white/20 h-1 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MediaRenderer: React.FC<{ question: Question }> = ({ question }) => {
    const mediaType = question.mediaType || QuestionMediaType.TEXT;
    const content = question.content;
    const embedUrl = getEmbedUrl(content);
    
    if (!content || content.trim() === '') {
        return (
            <div className="my-6 p-5 bg-amber-500/10 dark:bg-amber-950/20 shadow-lg backdrop-blur-md border border-amber-500/30 text-amber-705 dark:text-amber-400 rounded-2xl text-sm font-bold leading-relaxed flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Media tidak tersedia: URL atau konten media tidak ditemukan.</span>
            </div>
        );
    }

    if (!isValidUrl(content)) {
        return (
            <div className="my-6 p-6 bg-rose-500/10 dark:bg-rose-950/20 shadow-xl backdrop-blur-md border-2 border-rose-500/20 text-rose-800 dark:text-rose-400 rounded-3xl flex flex-col md:flex-row items-start gap-4">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-grow">
                    <h5 className="font-extrabold text-base text-rose-700 dark:text-rose-300">URL Media Tidak Valid</h5>
                    <p className="text-sm opacity-90 leading-relaxed font-semibold">Harap berikan URL yang memiliki protokol HTTP/HTTPS lengkap (contoh: dari YouTube, Google Drive, atau link file audio/video langsung).</p>
                    <code className="block mt-2 text-xs p-3 bg-black/10 dark:bg-black/40 rounded-xl font-mono truncate max-w-full text-rose-900 dark:text-rose-200">{content}</code>
                </div>
            </div>
        );
    }

    const isDrive = embedUrl ? embedUrl.includes('drive.google.com') : false;
    const isYouTube = embedUrl ? embedUrl.includes('youtube.com/embed') : false;

    if (mediaType === QuestionMediaType.AUDIO) {
        if (isDrive) {
            return (
                <div className="my-6 w-full h-42 bg-gradient-to-br from-indigo-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-950/50 rounded-3xl overflow-hidden border-2 border-white/60 dark:border-white/10 shadow-xl backdrop-blur-xl group/iframe relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-505 to-fuchsia-505"></div>
                    <iframe
                        src={embedUrl || undefined}
                        frameBorder="0"
                        className="w-full h-full"
                        title={`Audio dari Drive - ${question.id}`}
                    ></iframe>
                </div>
            );
        }
        return <CustomAudioPlayer src={embedUrl || ''} questionId={question.id} />;
    }

    if (mediaType === QuestionMediaType.VIDEO) {
        return (isYouTube || isDrive) ? (
            <div className="my-6 w-full aspect-video bg-slate-950 dark:bg-black rounded-3xl shadow-2xl overflow-hidden border-2 border-white/60 dark:border-white/10 relative group/video">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-rose-500 z-20"></div>
                <iframe
                    src={embedUrl || undefined}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Video Content - ${question.id}`}
                    className="w-full h-full relative z-10"
                ></iframe>
            </div>
        ) : (
            <CustomVideoPlayer src={embedUrl || ''} questionId={question.id} />
        );
    }
    
    return null;
};

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
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
            <div className="flex items-center gap-3.5">
                <span className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/10 italic text-lg">Q</span>
                <div>
                   <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Pertanyaan Ke</h2>
                   <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {questionNumber} <span className="text-slate-300 dark:text-slate-700 font-extrabold text-lg">/ {totalQuestions}</span>
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

        <div className="mb-12">
            {mediaType === QuestionMediaType.TEXT ? (
                <div className="text-2xl leading-relaxed text-slate-900 dark:text-slate-100 max-w-none font-bold tracking-tight">
                    {question.content}
                </div>
            ) : (
                <div className="space-y-8">
                    {question.promptText && (
                        <div className="text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-none bg-slate-500/5 dark:bg-slate-900/30 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 italic font-medium relative group/prompt overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover/prompt:bg-indigo-500/10 transition-colors"></div>
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

        {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
            <div className="grid grid-cols-1 gap-4">
                {question.options.map((option, index) => {
                    const isSelected = currentAnswer === option.id;
                    return (
                        <div
                            key={option.id}
                            onClick={() => onAnswerChange(question.id, option.id)}
                            className={`group flex items-center p-5 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                                isSelected
                                ? 'bg-indigo-500/10 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-550 shadow-xl shadow-indigo-500/5 scale-[1.01]'
                                : 'bg-white/40 dark:bg-slate-900/30 border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 hover:shadow-lg'
                            }`}
                        >
                            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-black rounded-2xl mr-5 transition-all duration-300 transform group-hover:scale-105 ${
                                 isSelected 
                                 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg' 
                                 : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600'
                            }`}>
                              {optionLetters[index]}
                            </div>
                            <div className={`flex-grow font-bold transition-colors text-base ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-350'}`}>
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

        {question.type === QuestionType.COMPLEX_MULTIPLE_CHOICE && question.options && (
            <div className="grid grid-cols-1 gap-4">
                <div className="mb-2 p-3.5 bg-indigo-50-solid bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 dark:border-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Pilihan Ganda Kompleks: Anda dapat memilih lebih dari satu jawaban benar.</span>
                </div>
                {question.options.map((option, index) => {
                    const selectedList = currentAnswer ? currentAnswer.split(',') : [];
                    const isSelected = selectedList.includes(option.id);
                    const handleToggle = () => {
                        let newList;
                        if (isSelected) {
                            newList = selectedList.filter(id => id !== option.id);
                        } else {
                            newList = [...selectedList, option.id];
                        }
                        onAnswerChange(question.id, newList.join(','));
                    };
                    return (
                        <div
                            key={option.id}
                            onClick={handleToggle}
                            className={`group flex items-center p-5 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                                isSelected
                                ? 'bg-indigo-500/10 dark:bg-indigo-950/30 border-indigo-600 dark:border-indigo-550 shadow-xl shadow-indigo-500/5 scale-[1.01]'
                                : 'bg-white/40 dark:bg-slate-900/30 border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 hover:shadow-lg'
                            }`}
                        >
                            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center font-black rounded-2xl mr-5 transition-all duration-300 transform group-hover:scale-105 ${
                                 isSelected 
                                 ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg' 
                                 : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600'
                            }`}>
                              {optionLetters[index]}
                            </div>
                            <div className={`flex-grow font-bold transition-colors text-base ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-350'}`}>
                                {option.text}
                            </div>
                            <div className="ml-2">
                                {isSelected ? (
                                    <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                ) : (
                                    <Square className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {question.type === QuestionType.MATCHING && question.matchingPairs && (
            <div className="space-y-6">
                <div className="mb-2 p-3.5 bg-indigo-50-solid bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 dark:border-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Menjodohkan: Pasangkan deskripsi kiri dengan jawaban yang benar di kanan.</span>
                </div>
                
                {(() => {
                    let answersObj: Record<string, string> = {};
                    try {
                        if (currentAnswer) {
                            answersObj = JSON.parse(currentAnswer);
                        }
                    } catch (_) {}
                    
                    const uniqueResponses = Array.from(new Set(question.matchingPairs.map(p => p.response).filter(Boolean)));
                    
                    return (
                        <div className="space-y-4">
                            {question.matchingPairs.map((pair, index) => {
                                const matched = answersObj[pair.premise] || "";
                                const handleSelectResponse = (e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const newAnswers = { ...answersObj, [pair.premise]: e.target.value };
                                    onAnswerChange(question.id, JSON.stringify(newAnswers));
                                };
                                return (
                                    <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center p-5 bg-white/40 dark:bg-slate-900/30 rounded-3xl border-2 border-slate-100 dark:border-white/5 gap-4">
                                        <div className="flex-grow font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">
                                            <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-black mr-3 text-slate-500 tabular-nums">{index + 1}</span>
                                            {pair.premise}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs font-black text-slate-300 dark:text-slate-650 uppercase tracking-widest hidden md:inline">➔</span>
                                            <select
                                                aria-label={`Pilih jawaban untuk ${pair.premise}`}
                                                value={matched}
                                                onChange={handleSelectResponse}
                                                className="w-full md:w-64 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-2xl py-3 px-4 font-bold text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="">-- Pilih Jawaban --</option>
                                                {uniqueResponses.map((resp, idx) => (
                                                    <option key={idx} value={resp}>{resp}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
        )}

        {question.type === QuestionType.ORDERING && (question.orderItems || question.options) && (
            <div className="space-y-6">
                <div className="mb-2 p-3.5 bg-indigo-50-solid bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 dark:border-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Mengurutkan: Susunlah elemen-elemen di bawah ini ke dalam urutan yang tepat dengan tombol panah.</span>
                </div>
                
                {(() => {
                    const defaultItems = question.orderItems && question.orderItems.length > 0 
                        ? question.orderItems 
                        : (question.options?.map(o => o.text) || []);
                    
                    let currentList = currentAnswer ? currentAnswer.split(',') : [];
                    if (currentList.length === 0 || !currentList.every(i => defaultItems.includes(i))) {
                        currentList = [...defaultItems];
                    }
                    
                    const handleMove = (index: number, direction: 'up' | 'down') => {
                        const newList = [...currentList];
                        const targetIdx = direction === 'up' ? index - 1 : index + 1;
                        if (targetIdx >= 0 && targetIdx < newList.length) {
                            const temp = newList[index];
                            newList[index] = newList[targetIdx];
                            newList[targetIdx] = temp;
                            onAnswerChange(question.id, newList.join(','));
                        }
                    };

                    return (
                        <div className="space-y-3">
                            {currentList.map((item, index) => (
                                <div key={index} className="flex items-center p-4 bg-white/40 dark:bg-slate-900/30 rounded-3xl border-2 border-slate-100 dark:border-white/5 justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 bg-indigo-500/10 text-indigo-600 flex items-center justify-center rounded-xl text-xs font-black italic">{index + 1}</div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{item}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => handleMove(index, 'up')}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900 text-slate-600 hover:text-indigo-600 rounded-xl disabled:opacity-30 transition-all cursor-pointer"
                                            title="Pindahkan ke atas"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={index === currentList.length - 1}
                                            onClick={() => handleMove(index, 'down')}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900 text-slate-600 hover:text-indigo-600 rounded-xl disabled:opacity-30 transition-all cursor-pointer"
                                            title="Pindahkan ke bawah"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        )}

        {question.type === QuestionType.TRUE_FALSE && question.statements && (
            <div className="space-y-6">
                <div className="mb-2 p-3.5 bg-indigo-50-solid bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 dark:border-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Pernyataan Benar-Salah: Tentukan status kebenaran (Benar / Salah) untuk setiap pernyataan berikut.</span>
                </div>
                
                {(() => {
                    let answersObj: Record<string, 'Benar' | 'Salah' | ''> = {};
                    try {
                        if (currentAnswer) {
                            answersObj = JSON.parse(currentAnswer);
                        }
                    } catch (_) {}
                    
                    return (
                        <div className="space-y-4">
                            {question.statements.map((statement, index) => {
                                const selected = answersObj[statement.id] || '';
                                const handleSelectValue = (val: 'Benar' | 'Salah') => {
                                    const newAnswers = { ...answersObj, [statement.id]: val };
                                    onAnswerChange(question.id, JSON.stringify(newAnswers));
                                };
                                return (
                                    <div key={statement.id} className="flex flex-col md:flex-row items-stretch md:items-center p-5 bg-white/40 dark:bg-slate-900/30 rounded-3xl border-2 border-slate-100 dark:border-white/5 gap-4 justify-between">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base flex-1">
                                            <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-black mr-3 text-slate-500 tabular-nums">{index + 1}</span>
                                            {statement.text}
                                        </div>
                                        <div className="flex gap-2.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectValue('Benar')}
                                                className={`flex-1 md:w-28 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                                                    selected === 'Benar'
                                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500 shadow-xl'
                                                    : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 hover:border-emerald-500/30 text-slate-500 dark:text-slate-400 cursor-pointer'
                                                }`}
                                            >
                                                Benar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectValue('Salah')}
                                                className={`flex-1 md:w-28 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border-2 ${
                                                    selected === 'Salah'
                                                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500 shadow-xl'
                                                    : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 hover:border-rose-500/30 text-slate-500 dark:text-slate-400 cursor-pointer'
                                                }`}
                                            >
                                                Salah
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
        )}

        {question.type === QuestionType.ESSAY && (
            <div className="relative group/essay">
                <textarea
                    rows={10}
                    className="w-full bg-white/40 dark:bg-slate-900/30 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] text-slate-900 dark:text-white p-8 font-bold text-lg focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all shadow-inner outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:italic placeholder:font-medium leading-relaxed"
                    placeholder="Tuliskan pemahaman atau jawaban Anda secara komprehensif di sini..."
                    value={currentAnswer}
                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                />
                <div className="absolute top-5 right-8 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.25em]">Essay Editor</div>
            </div>
        )}

        <div className="mt-12 group">
            <label className="inline-flex items-center cursor-pointer select-none px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-900/30 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all duration-300">
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={isDoubtful}
                        onChange={() => onToggleDoubtful(question.id)}
                        className="peer sr-only"
                    />
                    <div className="h-6 w-6 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 peer-checked:bg-amber-500 peer-checked:border-amber-500 peer-checked:scale-105 transition-all"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2500/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <span className={`ml-3 text-xs font-black uppercase tracking-widest transition-colors ${isDoubtful ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 group-hover:text-amber-500'}`}>Tandai Ragu-ragu</span>
                {isDoubtful && <div className="ml-2 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>}
            </label>
        </div>
    </div>
  );
};

export default QuestionPanel;
