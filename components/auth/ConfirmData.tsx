
import React, { useState } from 'react';
import { StudentData } from '../../types';
import Button from '../ui/Button';
import { CheckCircle2, KeyRound, AlertTriangle, Copy, Check, ShieldCheck, HelpCircle } from 'lucide-react';

interface ConfirmDataProps {
  studentData: StudentData & { username?: string };
  onConfirm: () => void;
}

const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
);

const ConfirmData: React.FC<ConfirmDataProps> = ({ studentData, onConfirm }) => {
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const username = studentData.username || 'Tidak Digenerate';
  const password = studentData.password || 'Tidak Digenerate';

  const copyToClipboard = (text: string, type: 'user' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'user') {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-xl glass-card p-10 relative overflow-hidden">
      {/* Top success bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

      <div className="mb-8 text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[1.25rem] flex items-center justify-center mb-5 animate-bounce">
          <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Registrasi Berhasil!</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Akun ujian mandiri Anda telah berhasil dibuat secara gratis.</p>
      </div>

      {/* Account credentials header */}
      <div className="bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 dark:from-indigo-950/20 dark:to-fuchsia-950/20 p-6 rounded-3xl border-2 border-indigo-500/20 dark:border-indigo-500/10 shadow-lg space-y-4 mb-6">
        <div className="flex items-center gap-2 pb-3 border-b border-indigo-500/10">
          <KeyRound className="w-5 h-5 text-indigo-500" />
          <span className="text-[10px] font-black tracking-[0.25em] text-indigo-600 dark:text-indigo-400 uppercase">KREDENSIAL LOGIN ANDA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Username area */}
          <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">USERNAME</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 tracking-tight">{username}</span>
              <button 
                id="btn-copy-username"
                onClick={() => copyToClipboard(username, 'user')}
                className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all border border-transparent hover:border-indigo-500/20 text-slate-400 hover:text-indigo-600"
                title="Salin Username"
              >
                {copiedUser ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedUser && <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mt-1 block">Tersalin ke clipboard</span>}
          </div>

          {/* Password area */}
          <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">PASSWORD (PIN)</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black font-mono text-fuchsia-600 dark:text-fuchsia-400 tracking-tight">{password}</span>
              <button 
                id="btn-copy-password"
                onClick={() => copyToClipboard(password, 'pass')}
                className="p-2 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/50 rounded-xl transition-all border border-transparent hover:border-fuchsia-500/20 text-slate-400 hover:text-fuchsia-600"
                title="Salin Password"
              >
                {copiedPass ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedPass && <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mt-1 block">Tersalin ke clipboard</span>}
          </div>
        </div>
      </div>

      {/* Critical Note warning */}
      <div className="bg-amber-500/15 dark:bg-amber-950/35 border-2 border-amber-500/35 p-5 rounded-2xl flex items-start gap-3.5 mb-8">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h5 className="font-extrabold text-xs text-amber-800 dark:text-amber-400 uppercase tracking-wider">PENTING - HARAP SALIN/CATAT!</h5>
          <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-bold">
            Silakan catat Username dan Password di atas pada <span className="text-amber-700 dark:text-amber-300 underline font-black">SECARIK KERTAS, buku tulis</span>, atau ambil tangkapan layar (screenshot) sekarang juga! Akun ini diperlukan setiap kali masuk ujian.
          </p>
        </div>
      </div>

      {/* Accordion other details */}
      <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 mb-8">
        <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detail Informasi Biodata</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
          <DataRow label="Nama Lengkap" value={studentData.fullName} />
          <DataRow label="Kelas" value={studentData.class} />
          <DataRow label="Asal Sekolah" value={studentData.school} />
          <DataRow label="Dibuat Pada" value={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </div>
      </div>

      <div className="text-center space-y-4">
        <Button 
          id="btn-confirm-registration"
          onClick={onConfirm} 
          className="w-full py-5 text-sm font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 text-white transform hover:scale-[1.02] active:scale-95 transition-all"
        >
          SAYA SUDAH MENYALIN AKUN - LANJUT LOGIN
        </Button>
      </div>
    </div>
  );
};

export default ConfirmData;
