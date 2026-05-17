
import React, { useState } from 'react';
import { User } from '../../types';
import ResultsAnalysis from './ResultsAnalysis';
import Button from '../ui/Button';
import QuestionBank from './QuestionBank';
import { Database, PlusCircle, BarChart3, ChevronLeft, LogOut, ArrowRight, BookOpen, Settings } from 'lucide-react';
import { motion } from 'motion/react';

type TeacherView = 'dashboard' | 'question_bank' | 'exam_creator' | 'results';

const DashboardCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void; 
    color: 'indigo' | 'emerald' | 'amber' | 'violet';
    isFeatured?: boolean 
}> = ({ title, description, icon, onClick, color, isFeatured }) => {
    const colorClasses = {
        indigo: 'from-indigo-500/10 to-sky-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500/40 hover:border-indigo-400 shadow-indigo-500/10',
        emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/40 hover:border-emerald-400 shadow-emerald-500/10',
        amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 dark:border-amber-500/40 hover:border-amber-400 shadow-amber-500/10',
        violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 dark:border-violet-500/40 hover:border-violet-400 shadow-violet-500/10'
    };

    const gradientClasses = {
        indigo: 'bg-gradient-to-br from-indigo-500/20 to-sky-500/20',
        emerald: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
        amber: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
        violet: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20'
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`group relative glass-card p-8 rounded-[2.5rem] cursor-pointer overflow-hidden border-2 transition-all duration-500 bg-gradient-to-br ${colorClasses[color]} ${isFeatured ? 'md:col-span-2' : ''}`}
        >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-30 ${gradientClasses[color]}`} />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${gradientClasses[color]} shadow-inner`}>
                    {icon}
                </div>
                
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        {description}
                    </p>
                </div>
                
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all duration-300 transform group-hover:translate-x-2">
                    <span className={colorClasses[color].split(' ')[2]}>BUKA MENU</span>
                    <ArrowRight className={`w-4 h-4 ${colorClasses[color].split(' ')[2]}`} />
                </div>
            </div>
        </motion.div>
    );
};


const TeacherDashboard: React.FC<{ user: User, logout: () => void }> = ({ user, logout }) => {
  const [view, setView] = useState<TeacherView>('dashboard');

  const renderView = () => {
    switch(view) {
        case 'results':
            return <ResultsAnalysis />;
        case 'question_bank':
            return <QuestionBank />;
        case 'dashboard':
        default:
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <div className="h-0.5 w-8 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Panel Kendali</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DashboardCard
                            title="Bank Soal Komprehensif"
                            description="Kelola bank data pertanyaan, impor dari Excel/Word, dan atur per mata pelajaran dengan mudah."
                            onClick={() => setView('question_bank')}
                            color="indigo"
                            isFeatured
                            icon={<Database className="h-7 w-7" />}
                        />
                        <DashboardCard
                            title="Analisis Hasil AI"
                            description="Tinjau performa siswa secara real-time dengan bantuan scoring AI untuk jawaban esai."
                            onClick={() => setView('results')}
                            color="emerald"
                            icon={<BarChart3 className="h-7 w-7" />}
                        />
                        <DashboardCard
                            title="Konfigurasi Ujian"
                            description="Rancang jadwal ujian, durasi, dan tentukan peserta ujian dalam satu langkah."
                            onClick={() => alert('Fitur Konfigurasi Ujian segera hadir!')}
                            color="amber"
                            icon={<PlusCircle className="h-7 w-7" />}
                        />
                        <DashboardCard
                            title="Materi Pembelajaran"
                            description="Unggah dan kelola modul pembelajaran sebagai referensi belajar mandiri siswa."
                            onClick={() => alert('Fitur Materi segera hadir!')}
                            color="violet"
                            icon={<BookOpen className="h-7 w-7" />}
                        />
                        <DashboardCard
                            title="Pengaturan Sistem"
                            description="Atur profil, preferensi notifikasi, dan keamanan akun guru Anda."
                            onClick={() => alert('Fitur Pengaturan segera hadir!')}
                            color="indigo"
                            icon={<Settings className="h-7 w-7" />}
                        />
                    </div>
                </motion.div>
            );
    }
  };


  return (
    <div className="w-full max-w-7xl glass-card p-10 relative overflow-hidden transition-all duration-700">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-100 to-sky-50 dark:from-indigo-900/40 dark:to-sky-900/40 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden group">
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <div>
                     <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-sky-600 dark:from-white dark:via-indigo-300 dark:to-sky-300 tracking-tighter">
                        Portal Pendidik
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Aktif: <span className="text-indigo-600 dark:text-indigo-400">{user.fullName}</span>
                        </p>
                    </div>
                </div>
            </div>
            
            <div className='flex items-center gap-4 self-center md:self-auto'>
                {view !== 'dashboard' && (
                    <motion.button 
                        whileHover={{ x: -4 }}
                        onClick={() => setView('dashboard')} 
                        className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800/50"
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        BERANDA
                    </motion.button>
                )}
                <Button onClick={logout} variant="secondary" className="group rounded-2xl border-none bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-6 py-3 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>KELUAR</span>
                </Button>
            </div>
        </div>
        
        <div className="relative">
            {renderView()}
        </div>
    </div>
  );
};

export default TeacherDashboard;

