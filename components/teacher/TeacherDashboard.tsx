
import React, { useState } from 'react';
import { User } from '../../types';
import ResultsAnalysis from './ResultsAnalysis';
import Button from '../ui/Button';
import QuestionBank from './QuestionBank';
import { Database, PlusCircle, BarChart3, ChevronLeft, LogOut } from 'lucide-react';

type TeacherView = 'dashboard' | 'question_bank' | 'exam_creator' | 'results';

const DashboardCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; isFeatured?: boolean }> = ({ title, description, icon, onClick, isFeatured }) => (
    <div
        onClick={onClick}
        className={`group relative glass-card p-6 rounded-xl hover:-translate-y-1 cursor-pointer overflow-hidden ${isFeatured ? 'bg-indigo-100/60 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : ''}`}
    >
        <div className={`absolute -top-3 -right-3 p-3 rounded-bl-xl transition-all duration-300 ${isFeatured ? 'bg-indigo-500/20 text-indigo-500 dark:text-indigo-300' : 'bg-slate-500/10 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'}`}>
            {icon}
        </div>
        <h3 className={`font-bold text-xl mb-2 ${isFeatured ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>{title}</h3>
        <p className={`text-sm ${isFeatured ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>{description}</p>
    </div>
);


const TeacherDashboard: React.FC<{ user: User, logout: () => void }> = ({ user, logout }) => {
  const [view, setView] = useState<TeacherView>('dashboard');

  const renderView = () => {
    switch(view) {
        case 'results':
            return <ResultsAnalysis />;
        case 'question_bank':
            return <QuestionBank />;
        // Other views like ExamCreator would be rendered here
        case 'dashboard':
        default:
            return (
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Menu Utama</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DashboardCard
                            title="Bank Soal"
                            description="Kelola, tambah, dan impor soal untuk berbagai mata pelajaran."
                            onClick={() => setView('question_bank')}
                            isFeatured
                            icon={<Database className="h-8 w-8" />}
                        />
                        <DashboardCard
                            title="Buat Ujian Baru"
                            description="Rancang ujian, atur waktu, dan pilih soal dari bank soal."
                            onClick={() => alert('Fitur Buat Ujian segera hadir!')}
                            icon={<PlusCircle className="h-8 w-8" />}
                        />
                        <DashboardCard
                            title="Analisis Hasil"
                            description="Lihat hasil, analisis esai dengan AI, dan cetak laporan."
                            onClick={() => setView('results')}
                            icon={<BarChart3 className="h-8 w-8" />}
                        />
                    </div>
                </div>
            );
    }
  };


  return (
    <div className="w-full max-w-6xl glass p-8 rounded-2xl">
        <div className="flex justify-between items-start mb-8">
            <div>
                 <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">Portal Guru</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Selamat datang, {user.fullName}.</p>
            </div>
            <div className='flex items-center gap-4'>
                {view !== 'dashboard' && (
                    <button 
                        onClick={() => setView('dashboard')} 
                        className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Kembali
                    </button>
                )}
                <Button onClick={logout} variant="secondary" className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Keluar
                </Button>
            </div>
        </div>
        
        {renderView()}
    </div>
  );
};

export default TeacherDashboard;
