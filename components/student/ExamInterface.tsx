
import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Question, StudentAnswer, ExamResult, User } from '../../types';
import { fetchExamDetails } from '../../services/api';
import Spinner from '../ui/Spinner';
import QuestionPanel from './QuestionPanel';
import NavigationPanel from './NavigationPanel';
import Button from '../ui/Button';
import { useAntiCheat } from '../../hooks/useAntiCheat';

interface ExamInterfaceProps {
  examId: string;
  onFinishExam: (result: ExamResult) => void;
  user: User;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId, onFinishExam, user }) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const [violationMessage, setViolationMessage] = useState<string | null>(null);

  const handleAntiCheat = useCallback((type: 'visibility' | 'blur') => {
    const msg = type === 'visibility' ? 'Deteksi Perpindahan Tab' : 'Deteksi Keluar Jendela';
    console.warn(`[ANTI-CHEAT LOG] Pelanggaran terdeteksi: ${msg} pada ${new Date().toLocaleTimeString()}`);
    setViolationMessage(`Peringatan: Jangan meninggalkan halaman ujian! (${msg})`);
    
    // Auto-clear message after 5 seconds
    setTimeout(() => setViolationMessage(null), 5000);
  }, []);

  const { warnings, isDisqualified } = useAntiCheat(handleAntiCheat, 3);

  // Handle disqualification
  useEffect(() => {
    if (isDisqualified) {
      console.error("[ANTI-CHEAT LOG] Siswa didiskualifikasi karena terlalu banyak pelanggaran.");
      handleSubmit(true, "Diskualifikasi: Terlalu banyak pelanggaran anti-cheat.");
    }
  }, [isDisqualified]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const loadExam = async () => {
      const data = await fetchExamDetails(examId);
      if (data) {
        const shuffledQuestions = shuffleArray(data.questions);
        setExam(data.exam);
        setQuestions(shuffledQuestions);
        setAnswers(shuffledQuestions.map(q => ({ questionId: q.id, answer: '', isDoubtful: false })));
        setTimeLeft(data.exam.durationMinutes * 60);
      }
      setIsLoading(false);
    };
    loadExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0 && !isLoading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isLoading && exam) {
      handleSubmit(true); // Auto-submit when time is up
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isLoading, exam]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, answer } : a));
  };

  const toggleDoubtful = (questionId: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, isDoubtful: !a.isDoubtful } : a));
  };
  
  const handleSubmit = useCallback((isAutoSubmit: boolean = false, reason?: string) => {
    if(!exam) return;

    const confirmSubmit = () => {
        // Simple scoring logic for demo
        const correctAnswers = answers.filter(ans => {
            const question = questions.find(q => q.id === ans.questionId);
            return question && question.correctAnswer === ans.answer;
        }).length;
        const score = (correctAnswers / questions.length) * 100;

        const result: ExamResult = {
            examId: exam.id,
            studentId: user.id,
            score: score,
            answers: answers,
            startedAt: new Date(Date.now() - exam.durationMinutes * 60 * 1000), // Approximate start time
            finishedAt: new Date(),
        };
        onFinishExam(result);
    }
    
    if(isAutoSubmit) {
        if (reason) {
          alert(reason);
        } else {
          alert("Waktu habis! Ujian akan diselesaikan secara otomatis.");
        }
        confirmSubmit();
    } else if (window.confirm("Apakah Anda yakin ingin menyelesaikan ujian ini?")) {
        confirmSubmit();
    }
  }, [exam, answers, onFinishExam, questions, user.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Spinner />
        <p className="mt-4 text-slate-700 dark:text-slate-300">Mempersiapkan ujian...</p>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return <p className="text-red-600 font-semibold">Gagal memuat ujian. Silakan coba lagi.</p>;
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="w-full h-[95vh] max-w-7xl flex flex-col md:flex-row gap-8 bg-transparent p-2 relative">
        {/* Persistent Anti-Cheat Warning Banner */}
        {warnings > 0 && (
            <div className="absolute top-0 left-0 right-0 z-[60] bg-rose-600 text-white py-1.5 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse border-b border-white/20">
                Sistem Integritas: Pelanggaran Terdeteksi ({warnings}/3 Peringatan). Hindari keluar dari tab atau jendela ujian!
            </div>
        )}

        {/* Anti-Cheat Alert Overlay (Transient) */}
        {violationMessage && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-rose-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-xl">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.365-.796 1.485-.796 1.85 0l6.323 13.79c.366.798-.223 1.71-1.125 1.71H4.695c-.902 0-1.491-.912-1.125-1.71l6.323-13.79zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="font-black text-sm uppercase tracking-widest">{violationMessage}</p>
                </div>
            </div>
        )}

        <div className="flex-grow flex flex-col glass-card border-slate-100 p-10 overflow-hidden">
            <div className="flex-grow overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                {currentQuestion && currentAnswer && (
                    <QuestionPanel 
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        currentAnswer={currentAnswer.answer}
                        isDoubtful={currentAnswer.isDoubtful}
                        onAnswerChange={handleAnswerChange}
                        onToggleDoubtful={toggleDoubtful}
                    />
                )}
            </div>
            <div className="flex justify-between items-center mt-10 pt-8 border-t border-slate-50">
                <Button 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="secondary"
                    className="rounded-xl px-8 py-3 font-bold text-xs uppercase tracking-widest bg-white border-slate-200 hover:bg-slate-50 disabled:opacity-30"
                >
                    Sebelumnya
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Progress</span>
                    <div className="h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300" 
                          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <Button 
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="rounded-xl px-10 py-3 font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all disabled:opacity-30"
                >
                    Selanjutnya
                </Button>
            </div>
        </div>

        <div className="w-full md:w-96 flex-shrink-0 flex flex-col gap-6">
            <div className="glass-card border-indigo-50 bg-indigo-50/20 p-8 text-center ring-4 ring-white/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Sisa Waktu Pengerjaan</p>
                <div className={`text-4xl font-black tabular-nums tracking-tighter ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-slate-900'}`}>{formatTime(timeLeft)}</div>
                
                <div className="mt-8 pt-6 border-t border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integritas</span>
                        <span className={`text-[10px] font-black uppercase ${warnings > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{warnings}/3 Peringatan</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${warnings >= 2 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${(warnings / 3) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow flex flex-col overflow-hidden">
                <NavigationPanel
                    questions={questions}
                    answers={answers}
                    currentQuestionIndex={currentQuestionIndex}
                    onSelectQuestion={setCurrentQuestionIndex}
                />
            </div>

            <Button onClick={() => handleSubmit(false)} variant="danger" className="w-full h-16 rounded-2xl text-sm font-black uppercase tracking-[0.2em] bg-slate-900 border-none hover:bg-rose-600 shadow-xl active:scale-95 transition-all">
                AKSES SELESAI
            </Button>
        </div>
    </div>
  );
};

export default ExamInterface;
