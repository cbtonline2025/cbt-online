
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Exam, Question, StudentAnswer, ExamResult, User } from '../../types';
import { fetchExamDetails } from '../../services/api';
import Spinner from '../ui/Spinner';
import QuestionPanel from './QuestionPanel';
import NavigationPanel from './NavigationPanel';
import Button from '../ui/Button';
import { useAntiCheat } from '../../hooks/useAntiCheat';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

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
  const [questionTimeLeft, setQuestionTimeLeft] = useState(0);

  const [violationMessage, setViolationMessage] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [latestViolationType, setLatestViolationType] = useState<'visibility' | 'blur' | null>(null);
  const isFirstLoad = useRef(true);

  const handleAntiCheat = useCallback((type: 'visibility' | 'blur') => {
    const msg = type === 'visibility' ? 'Deteksi Perpindahan Tab' : 'Deteksi Keluar Jendela';
    console.warn(`[ANTI-CHEAT LOG] Pelanggaran terdeteksi: ${msg} pada ${new Date().toLocaleTimeString()}`);
    setViolationMessage(`Peringatan: Jangan meninggalkan halaman ujian! (${msg})`);
    setLatestViolationType(type);
    setShowViolationModal(true);
    
    // Auto-clear message after 5 seconds
    setTimeout(() => setViolationMessage(null), 5000);
  }, []);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, answer } : a));
  };

  const toggleDoubtful = (questionId: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, isDoubtful: !a.isDoubtful } : a));
  };

  const performSubmission = useCallback(() => {
    if(!exam) return;

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

    // Clean up draft after successful submission
    try {
      const savedDraftKey = `cbt_exam_draft_${user.id}_${exam.id}`;
      localStorage.removeItem(savedDraftKey);
    } catch (e) {
      console.error("Error cleaning up draft after submission:", e);
    }

    onFinishExam(result);
  }, [exam, answers, onFinishExam, questions, user.id]);

  const handleSubmit = useCallback((isAutoSubmit: boolean = false, reason?: string) => {
    if(!exam) return;

    if(isAutoSubmit) {
        if (reason) {
          alert(reason);
        } else {
          alert("Waktu habis! Ujian akan diselesaikan secara otomatis.");
        }
        performSubmission();
    } else {
        setIsSubmitModalOpen(true);
    }
  }, [exam, performSubmission]);

  const { warnings, isDisqualified } = useAntiCheat(handleAntiCheat, 3);

  // Handle disqualification
  useEffect(() => {
    if (isDisqualified) {
      console.error("[ANTI-CHEAT LOG] Siswa didiskualifikasi karena terlalu banyak pelanggaran.");
      setShowViolationModal(false);
      handleSubmit(true, "Diskualifikasi: Terlalu banyak pelanggaran anti-cheat.");
    }
  }, [isDisqualified]);

  useEffect(() => {
    const loadExam = async () => {
      const data = await fetchExamDetails(examId);
      if (data) {
        const shuffledQuestions = shuffleArray(data.questions);
        setExam(data.exam);
        setQuestions(shuffledQuestions);

        // Check if there are saved answers in localStorage
        const savedDraftKey = `cbt_exam_draft_${user.id}_${examId}`;
        const savedDraftStr = localStorage.getItem(savedDraftKey);
        let initialAnswers = shuffledQuestions.map(q => ({ questionId: q.id, answer: '', isDoubtful: false }));
        let restoredSuccess = false;

        if (savedDraftStr) {
          try {
            const parsedDraft = JSON.parse(savedDraftStr) as StudentAnswer[];
            if (Array.isArray(parsedDraft)) {
              // Map questions to draft answers if they exist
              initialAnswers = shuffledQuestions.map(q => {
                const draftAns = parsedDraft.find(da => da.questionId === q.id);
                return draftAns ? draftAns : { questionId: q.id, answer: '', isDoubtful: false };
              });
              restoredSuccess = parsedDraft.some(da => da.answer !== '' || da.isDoubtful);
            }
          } catch (e) {
            console.error("Error parsing saved draft:", e);
          }
        }

        setAnswers(initialAnswers);
        if (restoredSuccess) {
          setRestoredNotice(true);
          setTimeout(() => setRestoredNotice(false), 5000);
        }

        setTimeLeft(data.exam.durationMinutes * 60);
        if (data.exam.durationType === 'per-question') {
          setQuestionTimeLeft(data.exam.durationSecondsPerQuestion || 60);
        }
      }
      setIsLoading(false);
    };
    loadExam();
  }, [examId, user.id]);

  // Auto-save answers changes to localStorage
  useEffect(() => {
    if (exam && answers.length > 0) {
      try {
        const savedDraftKey = `cbt_exam_draft_${user.id}_${examId}`;
        localStorage.setItem(savedDraftKey, JSON.stringify(answers));
        
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
        } else {
          setIsSaving(true);
          const timer = setTimeout(() => {
            setIsSaving(false);
          }, 800);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error("Error saving answers to localStorage:", e);
      }
    }
  }, [answers, exam, examId, user.id]);

  useEffect(() => {
    if (timeLeft > 0 && !isLoading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isLoading && exam) {
      handleSubmit(true); // Auto-submit when time is up
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isLoading, exam]);

  useEffect(() => {
    if (exam && exam.durationType === 'per-question') {
      setQuestionTimeLeft(exam.durationSecondsPerQuestion || 60);
    }
  }, [currentQuestionIndex, exam]);

  useEffect(() => {
    if (exam && exam.durationType === 'per-question' && !isLoading) {
      if (questionTimeLeft > 0) {
        const timer = setTimeout(() => setQuestionTimeLeft(questionTimeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        if (currentQuestionIndex < questions.length - 1) {
          alert(`Waktu untuk Soal #${currentQuestionIndex + 1} habis! Otomatis beralih ke soal berikutnya.`);
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          alert("Waktu pengerjaan soal terakhir habis! Ujian akan diselesaikan secara otomatis.");
          performSubmission();
        }
      }
    }
  }, [questionTimeLeft, isLoading, exam, currentQuestionIndex, questions.length, performSubmission]);

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

        {/* Draft Restored Toast Notification */}
        {restoredNotice && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/20 backdrop-blur-xl">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="font-bold text-xs uppercase tracking-widest text-white">Draft Jawaban Berhasil Dipulihkan</p>
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    {exam?.durationType === 'per-question' ? 'Sisa Waktu Soal Ini' : 'Sisa Waktu Pengerjaan'}
                </p>
                <div className={`text-4xl font-black tabular-nums tracking-tighter ${
                    (exam?.durationType === 'per-question' ? questionTimeLeft < 10 : timeLeft < 300) 
                        ? 'text-rose-500 animate-pulse' 
                        : 'text-slate-900 dark:text-white'
                }`}>
                    {exam?.durationType === 'per-question' ? `${questionTimeLeft} dtk` : formatTime(timeLeft)}
                </div>
                
                {exam?.durationType === 'per-question' && (
                    <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-1000" 
                          style={{ width: `${(questionTimeLeft / (exam.durationSecondsPerQuestion || 60)) * 100}%` }}
                        ></div>
                    </div>
                )}

                {/* Auto-Save Status Indicator */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSaving ? 'animate-ping' : ''}`}></span>
                    <span>{isSaving ? "Menyimpan Draft..." : "Draft Tersimpan Otomatis"}</span>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-200/50 flex-col">
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

        {/* Anti-Cheat Interactive Red Alert Modal */}
        {showViolationModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-rose-950/85 backdrop-blur-md animate-fade-in text-slate-800 dark:text-white">
            <div className="w-full max-w-lg bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] border-2 border-rose-500 relative overflow-hidden space-y-6 text-center">
              {/* Top Accent */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600 animate-pulse" />
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-rose-500/10 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 border-2 border-rose-500 animate-bounce">
                  <ShieldAlert className="w-10 h-10 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-rose-600 tracking-tight uppercase">⚠️ Deteksi Pelanggaran Sistem Ujian ⚠️</h3>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Sistem mendeteksi aktivitas mencurigakan karena Anda mencoba berpindah halaman atau meninggalkan jendela pengerjaan.
                  </p>
                </div>
              </div>

              {/* Warning Counter */}
              <div className="p-4 bg-rose-500/10 dark:bg-rose-500/20 rounded-2xl border-2 border-rose-500/35 flex flex-col items-center justify-center gap-2">
                <div className="text-3xl font-black text-rose-600 font-mono">
                  {warnings} / 3 Peringatan
                </div>
                <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest leading-relaxed">
                  Batas maksimum: 3 Peringatan. Melebihi batas ini Anda akan otomatis DIDISKUALIFIKASI dari sistem ujian!
                </div>
              </div>

              {/* Specific detail of breach */}
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-xs font-bold leading-relaxed space-y-1 text-left">
                <div className="text-rose-700 dark:text-rose-300">
                  <strong className="uppercase">Aktivitas Terlarang:</strong> {latestViolationType === 'visibility' ? 'Berpindah Tab / Aplikasi Lain' : 'Meninggalkan Jendela / Kehilangan Fokus Layar'}
                </div>
                <p className="font-semibold text-slate-600 dark:text-slate-450">
                  Semua aktivitas perpindahan tab atau fokus browser dicatat demi transparansi dan keadilan ujian online ini.
                </p>
              </div>

              {/* Confirmation / Promise Button */}
              <Button 
                onClick={() => setShowViolationModal(false)}
                variant="danger"
                className="w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg border-none bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white"
              >
                SAYA MENGERTI & LANJUTKAN UJIAN
              </Button>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-white">
            <div className="w-full max-w-lg glass-card border-none bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
              {/* Top accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Konfirmasi Selesai Ujian</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Harap periksa kembali detail pengerjaan Anda sebelum mengirim jawaban.</p>
                </div>
              </div>

              {/* Progress Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-center">
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-450 font-mono">{answers.filter(a => a.answer !== '').length}</div>
                  <div className="text-[9px] font-black uppercase text-emerald-600/70 dark:text-emerald-400/70 tracking-wider">Terjawab</div>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl text-center">
                  <div className="text-xl font-black text-rose-600 dark:text-rose-450 font-mono">{questions.length - answers.filter(a => a.answer !== '').length}</div>
                  <div className="text-[9px] font-black uppercase text-rose-600/70 dark:text-rose-400/70 tracking-wider">Belum Terisi</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-center">
                  <div className="text-xl font-black text-amber-600 dark:text-amber-450 font-mono">{answers.filter(a => a.isDoubtful).length}</div>
                  <div className="text-[9px] font-black uppercase text-amber-600/70 dark:text-amber-400/70 tracking-wider">Ragu-ragu</div>
                </div>
              </div>

              {questions.length - answers.filter(a => a.answer !== '').length > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-700 dark:text-rose-400 font-bold flex items-center gap-2">
                  <span>⚠️ Perhatian: Ada {questions.length - answers.filter(a => a.answer !== '').length} soal yang belum Anda jawab!</span>
                </div>
              )}

              {answers.filter(a => a.isDoubtful).length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2">
                  <span>⚠️ Perhatian: Anda masih menandai {answers.filter(a => a.isDoubtful).length} soal sebagai ragu-ragu!</span>
                </div>
              )}

              {/* Accidental Checkbox Double-Security */}
              <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 cursor-pointer">
                <input 
                  id="chk-confirm-submit"
                  type="checkbox" 
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 h-4 w-4 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                  Saya menyatakan secara sadar telah menyelesaikan pengerjaan ujian ini dan siap mengirim semua jawaban untuk dinilai.
                </span>
              </label>

              {/* Button controls */}
              <div className="flex gap-4 pt-2">
                <Button 
                  id="btn-modal-cancel"
                  onClick={() => {
                    setIsSubmitModalOpen(false);
                    setConfirmChecked(false);
                  }} 
                  variant="secondary" 
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-widest rounded-2xl border-none hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Kembali
                </Button>
                <Button 
                  id="btn-modal-confirm-submit"
                  onClick={() => {
                    if (confirmChecked) {
                      setIsSubmitModalOpen(false);
                      setConfirmChecked(false);
                      performSubmission();
                    }
                  }}
                  disabled={!confirmChecked}
                  variant="danger"
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-full disabled:opacity-40 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-500 enabled:hover:scale-105 enabled:active:scale-95 border-none transition-all duration-200 text-white"
                >
                  Kirim Jawaban
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ExamInterface;
