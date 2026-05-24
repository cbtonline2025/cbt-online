import React, { useState } from 'react';
import { User } from '../../types';
import Button from '../ui/Button';
import { Users, Monitor, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import ExamMonitoring from './ExamMonitoring';
import StudentManager from '../shared/StudentManager';

const DashboardCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void;
    color: 'teal' | 'indigo' | 'amber';
}> = ({ title, description, icon, onClick, color }) => {
    const colorGradients = {
        teal: 'from-emerald-500/[0.08] via-teal-500/[0.03] to-transparent border-emerald-500/20 text-emerald-600 dark:text-teal-400 hover:border-emerald-450 dark:hover:border-teal-500/50 hover:bg-emerald-500/[0.02]',
        indigo: 'from-indigo-500/[0.08] via-purple-500/[0.03] to-transparent border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:border-indigo-455 dark:hover:border-indigo-500/50 hover:bg-indigo-500/[0.02]',
        amber: 'from-amber-500/[0.08] via-orange-500/[0.03] to-transparent border-amber-500/20 text-amber-600 dark:text-amber-400 hover:border-amber-455 dark:hover:border-amber-500/50 hover:bg-amber-500/[0.02]'
    };
    
    const highlightGlows = {
        teal: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/25',
        indigo: 'bg-gradient-to-br from-indigo-500/25 to-purple-500/25',
        amber: 'bg-gradient-to-br from-amber-500/25 to-orange-500/25'
    };

    const borders = {
        teal: 'hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] focus:ring-emerald-500',
        indigo: 'hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] focus:ring-indigo-500',
        amber: 'hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)] focus:ring-amber-500'
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            className={`group relative glass-card p-8 md:p-10 rounded-[2.5rem] cursor-pointer overflow-hidden border-2 transition-all duration-500 bg-gradient-to-br ${colorGradients[color]} ${borders[color]} backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950`}
        >
            {/* Ambient dynamic radial glow back-drop circles on hover */}
            <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-60 ${highlightGlows[color]} transition-all duration-700 group-hover:scale-130 -z-10`} />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    {/* Icon circular badge container */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${highlightGlows[color]} border border-white/40 dark:border-white/10 backdrop-blur-md shadow-inner`}>
                        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 transition-all duration-500' })}
                    </div>
                    
                    <h3 className="font-extrabold text-2xl mb-3.5 text-slate-900 dark:text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-705 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Futuristic card action indicator link at the bottom list */}
                <div className="mt-8 flex items-center gap-1 text-xs font-black uppercase tracking-wider opacity-60 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">
                    <span className="text-[10px]">Akses Fitur</span>
                    <ChevronLeft className="w-3.5 h-3.5 rotate-180 transform" />
                </div>
            </div>
        </motion.div>
    );
};


const AdminDashboard: React.FC<{ user: User, logout: () => void }> = ({ user, logout }) => {
  const [view, setView] = useState<'dashboard' | 'monitoring' | 'students'>('dashboard');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-7xl glass-card p-10 relative overflow-hidden border-2 border-white/60 dark:border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl bg-white/65 dark:bg-slate-900/40 transition-all duration-700"
    >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 z-20" />
        
        {/* Decorative brighter backdrop blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-300/15 dark:bg-teal-500/10 rounded-full blur-[120px] animate-pulse transition-all duration-1000 -z-10"></div>
        <div className="absolute bottom-[-15%] left-[-15%] w-[450px] h-[450px] bg-indigo-300/15 dark:bg-indigo-500/10 rounded-full blur-[110px] animate-pulse transition-all duration-1000 delay-1000 -z-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
                 <div className="flex items-center gap-2 mb-4">
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 backdrop-blur-md text-teal-650 dark:text-teal-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-teal-500/20">
                          Portal Proktor
                     </span>
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 backdrop-blur-md text-indigo-650 dark:text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
                          Admin
                     </span>
                 </div>
                 <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-teal-600 to-indigo-600 dark:from-white dark:via-teal-300 dark:to-indigo-300 tracking-tighter">
                    Ruang Kontrol Ujian
                 </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">Selamat datang kembali, <span className="text-teal-650 dark:text-teal-400 font-extrabold">{user.fullName}</span>.</p>
            </div>
             <div className="flex items-center gap-4 self-center md:self-auto">
                 {view !== 'dashboard' && (
                     <motion.button 
                         whileHover={{ x: -4 }}
                         onClick={() => setView('dashboard')} 
                         className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold text-xs uppercase tracking-widest hover:bg-teal-150 dark:hover:bg-teal-900/50 transition-all border border-teal-100 dark:border-teal-800/50"
                     >
                         <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                         KONTROL PANEL
                     </motion.button>
                 )}
                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                     <Button id="btn-admin-logout" onClick={logout} variant="secondary" className="group rounded-2xl border-none bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-6 py-3 flex items-center gap-2 transition-all">
                        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span className="font-bold text-[10px] uppercase tracking-[0.2em]">KELUAR</span>
                     </Button>
                 </motion.div>
             </div>
        </div>

        {view === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                <DashboardCard
                    title="Manajemen Pengguna"
                    description="Kelola akun siswa, guru, dan hak akses proktor lainnya dengan mudah."
                    onClick={() => setView('students')}
                    color="indigo"
                    icon={<Users className="h-6 w-6" />}
                />
                <DashboardCard
                    title="Monitoring Ujian"
                    description="Pantau jalannya ujian secara langsung, lihat status pengerjaan, dan log aktivitas peserta."
                    onClick={() => setView('monitoring')}
                    color="teal"
                    icon={<Monitor className="h-6 w-6" />}
                />
                <DashboardCard
                    title="Pengaturan Ujian"
                    description="Aktifkan ujian, buat rilis token, manipulasi jadwal, dan kelola sesi ujian secara praktis."
                    onClick={() => alert('Fitur Pengaturan Ujian segera hadir!')}
                    color="amber"
                    icon={<Settings className="h-6 w-6" />}
                />
            </div>
        ) : view === 'students' ? (
            <div className="animate-fade-in relative">
                <StudentManager />
            </div>
        ) : (
            <div className="animate-fade-in relative">
                <ExamMonitoring />
            </div>
        )}
    </motion.div>
  );
};

export default AdminDashboard;
