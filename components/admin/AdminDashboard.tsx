import React from 'react';
import { User } from '../../types';
import Button from '../ui/Button';
import { Users, Monitor, Settings, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

const DashboardCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void;
    color: 'teal' | 'indigo' | 'amber';
}> = ({ title, description, icon, onClick, color }) => {
    const colorGradients = {
        teal: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-teal-400 hover:border-emerald-450 dark:hover:border-teal-500/50',
        indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:border-indigo-450 dark:hover:border-indigo-500/50',
        amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:border-amber-450 dark:hover:border-amber-500/50'
    };
    
    const highlightGlows = {
        teal: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
        indigo: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
        amber: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
    };

    return (
        <motion.div
            whileHover={{ y: -12, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`group relative glass-card p-8 rounded-[2.5rem] cursor-pointer overflow-hidden border-2 transition-all duration-500 bg-gradient-to-br ${colorGradients[color]} hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_20px_40px_rgba(20,184,166,0.1)] backdrop-blur-xl`}
        >
            <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl opacity-0 group-hover:opacity-40 ${highlightGlows[color]} transition-all duration-700 group-hover:scale-125 -z-10`} />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 ${highlightGlows[color]} border border-white/30 dark:border-white/10 backdrop-blur-md`}>
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
                </div>
                
                <h3 className="font-extrabold text-2xl mb-3 text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};


const AdminDashboard: React.FC<{ user: User, logout: () => void }> = ({ user, logout }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-6xl glass-card p-10 relative overflow-hidden border-2 border-white/60 dark:border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl bg-white/65 dark:bg-slate-900/40 transition-all duration-700"
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
             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Button onClick={logout} variant="secondary" className="group rounded-2xl border-none bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-6 py-3 flex items-center gap-2 transition-all">
                    <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    <span className="font-bold text-[10px] uppercase tracking-[0.2em]">KELUAR</span>
                 </Button>
             </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DashboardCard
                title="Manajemen Pengguna"
                description="Kelola akun siswa, guru, dan hak akses proktor lainnya dengan mudah."
                onClick={() => alert('Fitur Manajemen Pengguna segera hadir!')}
                color="indigo"
                icon={<Users className="h-6 w-6" />}
            />
            <DashboardCard
                title="Monitoring Ujian"
                description="Pantau jalannya ujian secara langsung, lihat status pengerjaan, dan log aktivitas peserta."
                onClick={() => alert('Fitur Monitoring Ujian segera hadir!')}
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
    </motion.div>
  );
};

export default AdminDashboard;
