
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
    const isActive = index === currentQuestionIndex;
    const isDoubtful = answer?.isDoubtful;
    const isAnswered = !!answer?.answer;
    
    let baseClass = 'w-12 h-12 flex items-center justify-center rounded-2xl font-black text-sm transition-all duration-300 transform active:scale-90 ';
    
    if (isActive) {
      if (isDoubtful) {
        return baseClass + 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-lg scale-110 z-10';
      }
      return baseClass + 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-xl scale-110 z-10';
    }
    
    if (isDoubtful) {
      return baseClass + 'bg-amber-100 text-amber-600 border-2 border-amber-400 hover:bg-amber-500 hover:text-white shadow-sm';
    }
    
    if (isAnswered) {
      return baseClass + 'bg-emerald-50 text-emerald-600 border-2 border-emerald-400 hover:bg-emerald-500 hover:text-white shadow-sm';
    }
    
    return baseClass + 'bg-white text-slate-400 border-2 border-slate-100 hover:border-indigo-200 hover:text-indigo-500 shadow-sm';
  };

  return (
    <div className="glass-card border-slate-100 p-8 flex-grow flex flex-col h-full ring-1 ring-slate-100 italic">
      <div className="flex items-center justify-center gap-2 mb-8 not-italic">
        <div className="h-1 w-4 bg-slate-200 rounded-full"></div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status Soal</h3>
        <div className="h-1 w-4 bg-slate-200 rounded-full"></div>
      </div>
      <div className="grid grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-100 not-italic">
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
