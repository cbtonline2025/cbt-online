
import React, { useState } from 'react';
import { User } from '../../types';
import ResultsAnalysis from './ResultsAnalysis';
import Button from '../ui/Button';
import QuestionBank from './QuestionBank';
import DeploymentGuide from './DeploymentGuide';
import { Database, PlusCircle, BarChart3, ChevronLeft, LogOut, ArrowRight, BookOpen, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

type TeacherView = 'dashboard' | 'question_bank' | 'exam_creator' | 'results' | 'guide';

const DashboardCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void; 
    color: 'indigo' | 'emerald' | 'amber' | 'violet';
    isFeatured?: boolean 
}> = ({ title, description, icon, onClick, color, isFeatured }) => {
    const colorClasses = {
        indigo: 'from-indigo-500/10 to-sky-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500/40 hover:border-indigo-400',
        emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/40 hover:border-emerald-400',
        amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 dark:border-amber-500/40 hover:border-amber-400',
        violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 dark:border-violet-500/40 hover:border-violet-400'
    };

    const titleGradients = {
        indigo: 'from-indigo-600 via-sky-600 to-blue-600 dark:from-indigo-300 dark:via-sky-200 dark:to-blue-200',
        emerald: 'from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-300 dark:via-teal-200 dark:to-green-200',
        amber: 'from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-300 dark:to-yellow-300',
        violet: 'from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-300 dark:via-purple-200 dark:to-fuchsia-200'
    };

    const gradientClasses = {
        indigo: 'bg-gradient-to-br from-indigo-500/30 to-sky-500/30',
        emerald: 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30',
        amber: 'bg-gradient-to-br from-amber-500/30 to-orange-500/30',
        violet: 'bg-gradient-to-br from-violet-500/30 to-purple-500/30'
    };

    const shadowClasses = {
        indigo: 'hover:shadow-indigo-500/30',
        emerald: 'hover:shadow-emerald-500/30',
        amber: 'hover:shadow-amber-500/30',
        violet: 'hover:shadow-violet-500/30'
    };

    const glowClasses = {
        indigo: 'group-hover:bg-indigo-500/5',
        emerald: 'group-hover:bg-emerald-500/5',
        amber: 'group-hover:bg-amber-500/5',
        violet: 'group-hover:bg-violet-500/5'
    };

    return (
        <motion.div
            whileHover={{ y: -16, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={`group relative glass-card p-10 rounded-[3rem] cursor-pointer overflow-hidden border-2 transition-all duration-700 bg-gradient-to-br ${colorClasses[color]} ${shadowClasses[color]} ${glowClasses[color]} hover:shadow-3xl backdrop-blur-xl ${isFeatured ? 'md:col-span-2 shadow-xl' : 'shadow-lg'}`}
        >
            <div className={`absolute top-0 right-0 w-48 h-48 -mr-12 -mt-12 rounded-full blur-3xl opacity-0 group-hover:opacity-60 ${gradientClasses[color]} transition-all duration-1000 group-hover:scale-150`} />
            <div className={`absolute bottom-0 left-0 w-32 h-32 -ml-16 -mb-16 rounded-full blur-2xl opacity-0 group-hover:opacity-40 ${gradientClasses[color]} transition-all duration-1000 group-hover:scale-150 delay-100`} />
            
            <div className="relative z-10 flex flex-col h-full">
                <motion.div 
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 ${gradientClasses[color]} shadow-inner border border-white/30 dark:border-white/10 backdrop-blur-md`}
                >
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8 drop-shadow-sm' })}
                </motion.div>
                
                <div className="flex-1">
                    <h3 className={`text-2xl md:text-3xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r ${titleGradients[color]} drop-shadow-sm`}>
                        {title}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-[95%] group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-500">
                        {description}
                    </p>
                </div>
                
                <div className="mt-10 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-700 group-hover:translate-x-3">
                    <span className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500">Buka Modul</span>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${gradientClasses[color]} border border-white/20 dark:border-white/5 shadow-sm group-hover:shadow-md transition-all duration-500`}>
                        <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" />
                    </div>
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
        case 'guide':
            return <DeploymentGuide />;
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
                            title="Panduan Distribusi Massal"
                            description="Cara host gratis selamanya di Cloud & SOP pengerjaan massal bebas server down."
                            onClick={() => setView('guide')}
                            color="violet"
                            icon={<HelpCircle className="h-7 w-7" />}
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
    <div className="w-full max-w-7xl glass-card p-10 relative overflow-hidden border-2 border-white/60 dark:border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl bg-white/65 dark:bg-slate-900/40 transition-all duration-700">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500 z-20" />
        
        {/* Decorative brighter backdrop blobs */}
        <div className="absolute top-[10%] left-[-15%] w-[450px] h-[450px] bg-indigo-400/15 dark:bg-indigo-600/10 rounded-full blur-[110px] animate-pulse transition-all duration-1000 -z-10"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-400/15 dark:bg-emerald-600/10 rounded-full blur-[100px] animate-pulse transition-all duration-1000 delay-1000 -z-10"></div>
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-sky-300/10 dark:bg-sky-500/5 rounded-full blur-[80px] -z-10"></div>
        
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

