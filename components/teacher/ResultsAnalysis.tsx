
import React, { useState } from 'react';
import { mockQuestions } from '../../services/api';
import { Question, QuestionType } from '../../types';
import { analyzeEssayAnswer } from '../../services/geminiService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

// Mock student answer for demonstration
const mockStudentEssayAnswer = {
    questionId: 'q3',
    answer: 'Transformator step-up itu buat naikin tegangan. Lilitan sekundernya lebih banyak dari primer, jadi voltasenya naik.'
};


const ResultsAnalysis: React.FC = () => {
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const essayQuestions = mockQuestions.filter(q => q.type === QuestionType.ESSAY);

    const handleAnalyzeClick = async () => {
        if (!selectedQuestion) return;

        setIsAnalyzing(true);
        setAnalysisResult('');
        const result = await analyzeEssayAnswer(
            mockStudentEssayAnswer.answer, 
            selectedQuestion.correctAnswer
        );
        setAnalysisResult(result);
        setIsAnalyzing(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Analisis Jawaban Esai (Demo)</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Pilih soal esai untuk melihat jawaban siswa (mock) dan menganalisisnya menggunakan AI.</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
                {essayQuestions.map(q => (
                    <button 
                        key={q.id}
                        onClick={() => { setSelectedQuestion(q); setAnalysisResult(''); }}
                        className={`px-4 py-2 rounded-lg transition text-sm font-medium ${selectedQuestion?.id === q.id ? 'bg-indigo-600 text-white shadow' : 'bg-white/60 hover:bg-white/90 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'}`}
                    >
                        Soal Esai: {q.subject}
                    </button>
                ))}
            </div>

            {selectedQuestion && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg">
                        <h3 className="font-bold text-lg mb-2 text-indigo-700 dark:text-indigo-300">Pertanyaan</h3>
                        <p>{selectedQuestion.content}</p>

                        <h3 className="font-bold text-lg mt-6 mb-2 text-indigo-700 dark:text-indigo-300">Kunci Jawaban</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedQuestion.correctAnswer}</p>
                    </div>

                    <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg">
                        <h3 className="font-bold text-lg mb-2 text-sky-700 dark:text-cyan-300">Jawaban Siswa (Ahmad Prasetyo)</h3>
                        <p className="italic text-slate-700 dark:text-slate-300">"{mockStudentEssayAnswer.answer}"</p>
                        
                        <Button onClick={handleAnalyzeClick} disabled={isAnalyzing} className="mt-6">
                            {isAnalyzing ? <Spinner /> : 'Analisis dengan AI'}
                        </Button>
                        
                        {analysisResult && (
                             <div className="mt-6 bg-emerald-50 dark:bg-slate-800 p-4 rounded-lg border border-emerald-200 dark:border-slate-700">
                                <h4 className="font-semibold text-emerald-800 dark:text-green-400 mb-2">Hasil Analisis AI</h4>
                                <p className="text-sm text-emerald-900 dark:text-slate-200 whitespace-pre-wrap">{analysisResult}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
             <div className="mt-8 text-right">
                <Button variant="secondary" onClick={() => alert('Fitur Cetak Laporan PDF segera hadir!')}>Cetak Laporan (PDF)</Button>
            </div>
        </div>
    );
};

export default ResultsAnalysis;
