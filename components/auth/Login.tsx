
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { Role } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { motion } from 'motion/react';
import { User, GraduationCap, ShieldCheck, LogIn, UserCircle } from 'lucide-react';

interface LoginProps {
    onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);
  const { login } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = username.trim();
    if (finalUsername) {
      login(finalUsername, selectedRole);
    } else {
      alert("Username/NISN tidak boleh kosong.");
    }
  };

  const roleIcons = {
    [Role.STUDENT]: <User className="w-4 h-4" />,
    [Role.TEACHER]: <GraduationCap className="w-4 h-4" />,
    [Role.ADMIN]: <ShieldCheck className="w-4 h-4" />,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg glass-card p-12 relative overflow-hidden"
    >
      {/* Decorative accent with enhanced gradient */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />
      
      <div className="mb-12 text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-900/10 dark:to-sky-900/10 rounded-[1.75rem] flex items-center justify-center mb-6 shadow-inner border border-white/50 dark:border-white/5 group transition-all duration-500 hover:rotate-6">
          <LogIn className="w-10 h-10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-3 leading-tight">
          Masuk <span className="text-indigo-600 dark:text-indigo-400">Portal</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-[240px] mx-auto">
          Silakan akses pembelajaran mandiri dengan akun terdaftar Anda.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] pl-1">Identitas Pengguna</label>
          <Input 
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="NISN atau Nama Pengguna"
            icon={<UserCircle className="w-5 h-5 text-slate-400" />}
            className="rounded-[1.25rem] py-5 border-white/40 dark:border-white/5 bg-white/30 dark:bg-slate-950/20"
            required
          />
        </div>
        
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Peran Akses</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {(Object.values(Role) as Role[]).map(role => (
                    <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`flex flex-col items-center gap-3 py-5 px-2 text-[10px] font-black rounded-3xl transition-all duration-500 border-2 ${
                          selectedRole === role 
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-400 shadow-2xl shadow-indigo-500/40 scale-105 z-10' 
                            : 'bg-white/40 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 border-white/60 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800/40 hover:border-indigo-200/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                    >
                        <div className={`p-2 rounded-xl ${selectedRole === role ? 'bg-white/20' : 'bg-slate-100/50 dark:bg-slate-800/50'}`}>
                          {React.cloneElement(roleIcons[role] as React.ReactElement, { className: 'w-5 h-5' })}
                        </div>
                        <span className="uppercase tracking-widest leading-none">{role}</span>
                    </button>
                ))}
            </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 text-sm font-black tracking-[0.2em] rounded-[1.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          OTENTIKASI SEKARANG
        </Button>
      </form>

      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-10 font-medium">
        Belum memiliki akun?{' '}
        <button onClick={onRegisterClick} className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
          Daftar Sekarang
        </button>
      </p>

      {/* Quick Access Info Section */}
      <div className="mt-12 pt-8 border-t border-dashed border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-2 mb-5 px-1">
          <div className="h-0.5 w-6 bg-indigo-400 dark:bg-indigo-600 rounded-full"></div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Akun Demo</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
            {[
              { r: Role.STUDENT, u: '0012345678', icon: <User className="w-3 h-3" />, color: 'bg-blue-500/10 text-blue-500' },
              { r: Role.TEACHER, u: 'guru_ipa', icon: <GraduationCap className="w-3 h-3" />, color: 'bg-indigo-500/10 text-indigo-500' },
              { r: Role.ADMIN, u: 'proktor_utama', icon: <ShieldCheck className="w-3 h-3" />, color: 'bg-amber-500/10 text-amber-500' }
            ].map((item) => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={item.r} 
                className="flex justify-between items-center px-5 py-4 text-[10px] bg-white/30 dark:bg-slate-900/40 border border-white/50 dark:border-white/5 rounded-3xl group hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow-md"
                title={`Klik untuk menyalin username`}
                onClick={() => setUsername(item.u)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{item.r}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-indigo-500 dark:text-indigo-400 font-black bg-indigo-50/50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                    {item.u}
                  </span>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
