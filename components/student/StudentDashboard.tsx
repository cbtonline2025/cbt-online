
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
      className="w-full max-w-5xl glass-card relative p-8 md:p-12 overflow-hidden border border-white/40 dark:border-white/10 shadow-2xl backdrop-blur-xl"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-10">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-amber-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-tilt"></div>
            <div className="relative w-24 h-24 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 border border-white/50 dark:border-white/10 shadow-2xl overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 backdrop-blur-md text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
                <LayoutDashboard className="w-3 h-3" />
                Portal Pelajar
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 backdrop-blur-md text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Aktif
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 backdrop-blur-md text-amber-600 dark:text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-500/20">
                <GraduationCap className="w-3 h-3" />
                {studentClass || 'Kelas ...'}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center flex-wrap gap-x-4 gap-y-2 leading-[1.1]">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.4em] mb-1">{getTimeGreeting()}</span>
                  <span className="text-slate-900 dark:text-white opacity-90">Halo,</span>
                </div>
              </div>
              
              <span className="relative group inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-orange-500 font-black tracking-tighter bg-[length:200%_auto] animate-gradient-x py-1">
                  {user.fullName}
                </span>
                <motion.div 
                  className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-indigo-600/50 via-fuchsia-600/50 to-orange-500/50 rounded-full blur-[1px]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </span>
              
              <div className="flex gap-2 ml-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="p-2.5 bg-amber-500/10 backdrop-blur-md rounded-2xl border border-amber-500/20"
                >
                  <Sparkles className="w-6 h-6 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                </motion.div>
              </div>
            </h1>
            
            <div className="flex items-center gap-4 mt-4">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-md">
                Sudah siap untuk menunjukkan kemampuan terbaikmu? Fokus dan teliti dalam mengerjakan setiap soal.
              </p>
            </div>
          </div>
        </div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={logout} variant="secondary" className="group rounded-2xl border border-rose-500/10 bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 backdrop-blur-md px-6 py-4 flex items-center gap-3 transition-all">
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold text-[10px] uppercase tracking-[0.2em]">Selesai Sesi</span>
          </Button>
        </motion.div>
      </div>

      <div className="relative group z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
        <div className="relative p-8 md:p-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/60 dark:border-white/10 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-32 h-32 text-indigo-500" />
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3 tracking-tighter">
              <div className="h-4 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-fuchsia-500"></div>
              Akses Portal Ujian
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">Gunakan token akses untuk masuk ke ruang ujian virtual Anda.</p>
            
            <div className="flex flex-col md:flex-row items-end gap-5">
                <div className="flex-grow w-full relative">
                  <div className="absolute top-1/2 left-5 -translate-y-1/2 z-20 text-slate-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <Input
                    id="token"
                    label=""
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="MASUKKAN TOKEN DISINI"
                    className="h-16 pl-14 rounded-2xl border-white/40 bg-white/20 backdrop-blur-md dark:bg-slate-800/20 font-mono text-xl tracking-[0.3em] uppercase placeholder:text-slate-400/50 placeholder:italic placeholder:font-sans placeholder:text-xs placeholder:tracking-widest shadow-inner"
                  />
                </div>
                <Button onClick={handleStartExam} className="w-full md:w-auto h-16 px-12 rounded-2xl text-xs font-black uppercase tracking-[0.3em] bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 shadow-xl shadow-indigo-500/25 active:scale-95 transition-all group overflow-hidden relative">
                  <span className="relative z-10 flex items-center gap-2">
                    Mulai Sekarang
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>
            </div>
        </div>
      </div>
      
      <div className="mt-20 relative z-10">
        <div className="flex items-center justify-between mb-10 border-b border-slate-200/50 dark:border-white/5 pb-6">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Jadwal Hari Ini</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
              Ujian yang dapat Anda ikuti
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{availableExams.length} Sesi Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableExams.map((exam, idx) => (
                <motion.div 
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                >
                    {/* Card gradient glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                    
                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 rounded-2xl backdrop-blur-md border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                          <BookOpen className="h-8 w-8" />
                        </div>
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">Fase {exam.phase}</span>
                    </div>
                    
                    <div className="flex-grow relative z-10">
                        <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2 leading-[1.1] tracking-tight group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                        <div className="flex items-center gap-2 mb-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.subject}</p>
                          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                          <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3" />
                            {exam.durationMinutes}m
                          </div>
                        </div>
                    </div>

                    <div className='mt-6 pt-6 border-t border-slate-200/50 dark:border-white/5 relative z-10'>
                      <p className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4'>Salin Token Akses</p>
                      <div className='flex items-center gap-2 p-1.5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/50 dark:border-white/5 group-hover:border-indigo-500/30 transition-all'>
                        <code className='text-indigo-600 dark:text-indigo-400 px-3 text-sm font-black tracking-[0.2em] flex-grow text-center'>{exam.id}</code>
                        <button 
                          onClick={() => handleCopyToken(exam.id)} 
                          className='p-3 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 shadow-lg shadow-indigo-500/5 border border-slate-100 dark:border-slate-600 rounded-xl transition-all active:scale-95'
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
