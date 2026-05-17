
import React, { useState, useMemo } from 'react';
import { User, Exam } from '../../types';
import { mockExams } from '../../services/api';
import { SUBJECTS_SMA, SUBJECTS_SMP } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Atom, Microscope, BookOpen, Copy, LogOut } from 'lucide-react';

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
    <div className="w-full max-w-5xl glass-card p-10 ring-1 ring-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">Portal Siswa</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Online</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Halo, {user.fullName}!</h1>
          <p className="text-slate-500 font-medium mt-1">Selamat datang kembali di sistem ujian kurikulum merdeka.</p>
        </div>
        <Button onClick={logout} variant="secondary" className="flex items-center gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm rounded-xl px-6 py-3">
          <LogOut className="w-4 h-4" />
          <span className="font-bold text-xs uppercase tracking-wider">Keluar Sesi</span>
        </Button>
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
    </div>
  );
};

export default StudentDashboard;
