
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { Role } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface LoginProps {
    onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);
  const { login } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      login(trimmedUsername, selectedRole);
    }
  };

  return (
    <div className="w-full max-w-md glass p-8 rounded-2xl">
      <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">Selamat Datang</h1>
      <p className="text-center text-slate-600 dark:text-slate-300 mb-8">Silakan masuk untuk melanjutkan</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          id="username"
          label="NISN / Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Masukkan NISN atau username Anda"
          required
        />
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Masuk sebagai</label>
            <div className="grid grid-cols-3 gap-2">
                {(Object.values(Role) as Role[]).map(role => (
                    <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${selectedRole === role ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/40 hover:bg-white/70 text-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-700 dark:text-slate-300'}`}
                    >
                        {role}
                    </button>
                ))}
            </div>
        </div>
        <Button type="submit" className="w-full">
          Masuk
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
        Belum punya akun?{' '}
        <button onClick={onRegisterClick} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Daftar di sini
        </button>
      </p>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Akun Demo (Prototype Only)</p>
        <div className="space-y-2">
            <div className="flex justify-between items-baseline p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Siswa: <code className="text-indigo-600 dark:text-indigo-400">0012345678</code></span>
                <span className="text-[10px] text-slate-500">Pilih PERAN : SISWA</span>
            </div>
            <div className="flex justify-between items-baseline p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Guru: <code className="text-indigo-600 dark:text-indigo-400">guru_ipa</code></span>
                <span className="text-[10px] text-slate-500">Pilih PERAN : GURU</span>
            </div>
            <div className="flex justify-between items-baseline p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Admin: <code className="text-indigo-600 dark:text-indigo-400">proktor_utama</code></span>
                <span className="text-[10px] text-slate-500">Pilih PERAN : ADMIN</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
