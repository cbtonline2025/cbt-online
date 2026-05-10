
import React from 'react';
import { Question, StudentAnswer } from '../../types';

interface NavigationPanelProps {
  questions: Question[];
  answers: StudentAnswer[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  questions,
  answers,
  currentQuestionIndex,
  onSelectQuestion,
}) => {
  const getButtonClass = (index: number) => {
    const answer = answers[index];
    let baseClass = 'w-12 h-12 flex items-center justify-center rounded-md font-bold transition-transform transform hover:scale-110 ';
    
    if (index === currentQuestionIndex) {
      return baseClass + 'bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-white shadow-lg';
    }
    if (answer?.isDoubtful) {
      return baseClass + 'bg-amber-400 text-black';
    }
    if (answer?.answer) {
      return baseClass + 'bg-emerald-500 dark:bg-green-600 text-white';
    }
    return baseClass + 'bg-white/50 hover:bg-white/80 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300';
  };

  return (
    <div className="bg-white/40 dark:bg-slate-800/50 rounded-lg p-4 flex-grow">
      <h3 className="text-center font-semibold mb-4 text-slate-800 dark:text-white">Navigasi Soal</h3>
      <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(index)}
            className={getButtonClass(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationPanel;
