
import React, { useMemo } from 'react';
import { ExamResult } from '../../types';
import { QUOTES } from '../../constants';
import Button from '../ui/Button';

interface ExamEndScreenProps {
  result: ExamResult;
  onReturnToDashboard: () => void;
}

const ExamEndScreen: React.FC<ExamEndScreenProps> = ({ result, onReturnToDashboard }) => {
  const quote = useMemo(() => {
    let quoteCategory;
    if (result.score >= 80) {
      quoteCategory = QUOTES.HIGH_PERFORMANCE;
    } else if (result.score >= 50) {
      quoteCategory = QUOTES.MEDIUM_PERFORMANCE;
    } else {
      quoteCategory = QUOTES.LOW_PERFORMANCE;
    }
    return quoteCategory[Math.floor(Math.random() * quoteCategory.length)];
  }, [result.score]);

  return (
    <div className="w-full max-w-2xl text-center bg-white/20 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-2xl shadow-lg border border-white/30 dark:border-slate-700/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-emerald-500 dark:text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Ujian Telah Selesai</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">Terima kasih telah menyelesaikan ujian. Jawaban Anda telah berhasil disimpan.</p>

      <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg italic">
        <p className="text-lg text-slate-700 dark:text-slate-200">"{quote}"</p>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 my-6">
        Hasil ujian Anda akan diinformasikan oleh guru atau proktor Anda.
      </p>

      <Button onClick={onReturnToDashboard}>
        Kembali ke Beranda
      </Button>
    </div>
  );
};

export default ExamEndScreen;
