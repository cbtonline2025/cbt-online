
import React, { useState, useMemo } from 'react';
import { User, Exam } from '../../types';
import { mockExams } from '../../services/api';
import { SUBJECTS_SMA, SUBJECTS_SMP } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Atom, Microscope, BookOpen, Copy, LogOut, Sparkles, LayoutDashboard, User as UserIcon, GraduationCap, Hand, Trophy, Zap, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentDashboardProps {
  user: User;
  onStartExam: (examId: string) => void;
  logout: () => void;
}

const SubjectIcon: React.FC<{ subject: string }> = ({ subject }) => {
    const renderIcon = () => {
        switch(subject.toLowerCase()){
            case 'fisika':
                return <Atom className="h-8 w-8" />;
            case 'ipa':
                return <Microscope className="h-8 w-8" />;
            default:
                return <BookOpen className="h-8 w-8" />;
        }
    }
    return <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400">{renderIcon()}</div>
}


const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onStartExam, logout }) => {
  const [token, setToken] = useState('');
  
  const studentClass = user.details?.class || '';
  const gradeLevel = parseInt(studentClass.match(/\d+/)?.[0] || '0');

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const availableExams = useMemo(() => {
    const studentPhase = gradeLevel >= 10 ? 'F' : 'D'; // Simplified logic
    return mockExams.filter(exam => exam.phase === studentPhase);
  }, [gradeLevel]);

  const handleStartExam = () => {
      const exam = mockExams.find(e => e.id === token);
      if (exam) {
        onStartExam(exam.id);
      } else {
        alert("Token ujian tidak valid.");
      }
  };

  const handleCopyToken = (examId: string) => {
    navigator.clipboard.writeText(examId).then(() => {
      alert(`Token "${examId}" berhasil disalin!`);
    });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl glass-card p-10 ring-1 ring-slate-100 dark:ring-white/5"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-sky-400 to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative w-20 h-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100 dark:border-indigo-800/50">
                <LayoutDashboard className="w-3 h-3" />
                Portal Pelajar
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100 dark:border-emerald-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                SINKRON
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-100 dark:border-amber-800/50">
                <GraduationCap className="w-3 h-3" />
                {studentClass || 'Kelas ...'}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight flex items-center flex-wrap gap-x-4 gap-y-3 leading-tight">
              <div className="flex items-center gap-4">
                <div className="relative group/wave">
                  <motion.div 
                    animate={{ rotate: [0, 15, -15, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-sky-400 rounded-[1.75rem] flex items-center justify-center shadow-xl shadow-indigo-500/30 text-white group-hover/wave:scale-110 transition-transform"
                  >
                    <Hand className="w-10 h-10 drop-shadow-md" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-1">{getTimeGreeting()}</span>
                  <span className="text-slate-900 dark:text-white">Halo,</span>
                </div>
              </div>
              
              <span className="relative group inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-violet-600 to-rose-500 font-extrabold tracking-tighter bg-[length:300%_auto] animate-gradient-x drop-shadow-md pb-2">
                  {user.fullName}
                </span>
                <motion.div 
                  className="absolute bottom-1 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-violet-500 to-rose-500 rounded-full opacity-40 blur-[1px]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </span>
              
              <div className="flex gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="p-3 bg-amber-400/10 rounded-2xl border border-amber-400/20"
                >
                  <Sparkles className="w-8 h-8 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                </motion.div>
                <div className="p-3 bg-sky-400/10 rounded-2xl border border-sky-400/20 hidden md:flex items-center justify-center">
                  <Zap className="w-8 h-8 text-sky-500 animate-pulse" />
                </div>
              </div>
            </h1>
            
            <div className="flex items-center gap-4 mt-3">
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
                Kamu siap untuk menunjukkan performa terbaikmu hari ini?
              </p>
              <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-800/50 uppercase tracking-widest">
                <Trophy className="w-3 h-3" />
                Target: Juara
              </div>
            </div>
          </div>
        </div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={logout} variant="secondary" className="group rounded-2xl border-none bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-8 py-4 flex items-center gap-3 transition-all">
            <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">Keluar Sesi</span>
          </Button>
        </motion.div>
      </div>

      <div className="mt-8 p-1 bg-gradient-to-br from-indigo-50 to-sky-50 rounded-3xl">
        <div className="p-8 bg-white/60 backdrop-blur-sm rounded-[22px] border border-white/50 shadow-inner">
            <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
              Akses Ujian
            </h2>
            <p className="text-slate-500 text-sm font-medium mb-8">Masukkan kode token unik yang diberikan oleh pengawas ujian Anda.</p>
            <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-grow w-full">
                  <Input
                    id="token"
                    label="KODE TOKEN UNIK"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Contoh: EXAM-XXXX-XXXX"
                    className="h-14 rounded-2xl border-slate-200 font-mono text-lg tracking-widest uppercase placeholder:text-slate-300 placeholder:italic placeholder:font-sans placeholder:text-sm"
                  />
                </div>
                <Button onClick={handleStartExam} className="w-full md:w-auto h-14 px-10 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  KONFIRMASI
                </Button>
            </div>
        </div>
      </div>
      
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ujian Tersedia</h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter">{availableExams.length} Ditemukan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableExams.map(exam => (
                <div key={exam.id} className="group flex flex-col bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500">
                    <div className="flex items-start justify-between mb-6">
                        <SubjectIcon subject={exam.subject} />
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase">Fase {exam.phase}</span>
                    </div>
                    
                    <div className="flex-grow">
                        <h3 className="font-extrabold text-xl text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors leading-tight">{exam.title}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{exam.subject}</p>
                        
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {exam.durationMinutes} Menit
                          </div>
                        </div>
                    </div>

                    <div className='mt-8 pt-6 border-t border-slate-50'>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>Token Akses Cepat</p>
                      <div className='flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all'>
                        <code className='text-indigo-600 px-3 text-sm font-black tracking-widest flex-grow text-center'>{exam.id}</code>
                        <button 
                          onClick={() => handleCopyToken(exam.id)} 
                          className='p-2.5 bg-white text-slate-400 hover:text-indigo-600 hover:scale-110 shadow-sm border border-slate-100 rounded-xl transition-all active:scale-95'
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
