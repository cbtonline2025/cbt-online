
import React from 'react';
import { User } from '../../types';
import Button from '../ui/Button';
import { Users, Monitor, Settings, LogOut } from 'lucide-react';

const DashboardCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <div
        onClick={onClick}
        className="group relative glass-card p-6 rounded-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
        <div className="absolute -top-3 -right-3 p-3 rounded-bl-xl bg-slate-500/10 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-500 transition-all duration-300">
            {icon}
        </div>
        <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
);


const AdminDashboard: React.FC<{ user: User, logout: () => void }> = ({ user, logout }) => {
  return (
    <div className="w-full max-w-6xl glass p-8 rounded-2xl">
        <div className="flex justify-between items-start mb-10">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">Portal Proktor (Admin)</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">Selamat datang, {user.fullName}.</p>
            </div>
             <Button onClick={logout} variant="secondary" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Keluar
             </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
                title="Manajemen Pengguna"
                description="Kelola akun siswa, guru, dan proktor lainnya."
                onClick={() => alert('Fitur Manajemen Pengguna segera hadir!')}
                icon={<Users className="h-8 w-8" />}
            />
            <DashboardCard
                title="Monitoring Ujian"
                description="Pantau jalannya ujian secara langsung dan lihat status peserta."
                onClick={() => alert('Fitur Monitoring Ujian segera hadir!')}
                icon={<Monitor className="h-8 w-8" />}
            />
             <DashboardCard
                title="Pengaturan Ujian"
                description="Aktifkan ujian, buat token, dan kelola sesi ujian."
                onClick={() => alert('Fitur Pengaturan Ujian segera hadir!')}
                icon={<Settings className="h-8 w-8" />}
            />
        </div>
    </div>
  );
};

export default AdminDashboard;
