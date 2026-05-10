
import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Question, StudentAnswer, ExamResult } from '../../types';
import { fetchExamDetails } from '../../services/api';
import Spinner from '../ui/Spinner';
import QuestionPanel from './QuestionPanel';
import NavigationPanel from './NavigationPanel';
import Button from '../ui/Button';
import { useAntiCheat } from '../../hooks/useAntiCheat';

interface ExamInterfaceProps {
  examId: string;
  onFinishExam: (result: ExamResult) => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({ examId, onFinishExam }) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleAntiCheat = useCallback((type: string) => {
    console.log(`Pelanggaran terdeteksi: ${type}`);
    // You could show a warning popup here.
  }, []);

  const { warnings } = useAntiCheat(handleAntiCheat, 3);

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
  
  const handleSubmit = useCallback((isAutoSubmit: boolean = false) => {
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
            studentId: 'current-student-id', // from auth context in real app
            score: score,
            answers: answers,
            startedAt: new Date(Date.now() - exam.durationMinutes * 60 * 1000), // Approximate start time
            finishedAt: new Date(),
        };
        onFinishExam(result);
    }
    
    if(isAutoSubmit) {
        alert("Waktu habis! Ujian akan diselesaikan secara otomatis.");
        confirmSubmit();
    } else if (window.confirm("Apakah Anda yakin ingin menyelesaikan ujian ini?")) {
        confirmSubmit();
    }
  }, [exam, answers, onFinishExam, questions]);

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
    <div className="w-full h-[95vh] max-w-7xl flex flex-col md:flex-row gap-6 bg-white/30 dark:bg-slate-900/30 backdrop-blur-2xl p-4 rounded-2xl shadow-lg border border-white/40 dark:border-slate-700/50">
        <div className="flex-grow flex flex-col bg-white/40 dark:bg-slate-800/50 rounded-lg p-6">
            <div className="flex-grow overflow-y-auto pr-2">
                {currentQuestion && currentAnswer && (
                    <QuestionPanel 
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                        currentAnswer={currentAnswer.answer}
                        isDoubtful={currentAnswer.isDoubtful}
                        onAnswerChange={handleAnswerChange}
                        onToggleDoubtful={toggleDoubtful}
                    />
                )}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/50 dark:border-slate-700">
                <Button 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="secondary"
                >
                    Sebelumnya
                </Button>
                <Button 
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                >
                    Selanjutnya
                </Button>
            </div>
        </div>

        <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white/40 dark:bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-slate-600 dark:text-slate-300">Sisa Waktu</p>
                <p className={`text-3xl font-bold tracking-wider ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600 dark:text-yellow-300'}`}>{formatTime(timeLeft)}</p>
                <p className={`text-xs mt-2 font-semibold transition-colors ${warnings > 0 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>Peringatan Pelanggaran: {warnings} / 3</p>
            </div>
            <NavigationPanel
                questions={questions}
                answers={answers}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={setCurrentQuestionIndex}
            />
            <Button onClick={() => handleSubmit(false)} variant="danger" className="mt-auto">
                Selesaikan Ujian
            </Button>
        </div>
    </div>
  );
};

export default ExamInterface;
