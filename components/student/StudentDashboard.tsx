
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
    <div className="w-full max-w-5xl glass p-8 rounded-2xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">Halo, {user.fullName}!</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Selamat datang di portal ujian online.</p>
        </div>
        <Button onClick={logout} variant="secondary" className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </div>

      <div className="mt-8 p-6 glass-card rounded-xl">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Mulai Ujian</h2>
          <p className="text-slate-700 dark:text-slate-400 mb-4">Masukkan kode token yang diberikan oleh proktor atau guru Anda untuk memulai ujian.</p>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              <Input
                id="token"
                label="Kode Token Ujian"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Masukkan token..."
                className="flex-grow"
              />
              <Button onClick={handleStartExam} className="w-full sm:w-auto h-12">Mulai Ujian</Button>
          </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-white">Latihan Soal & Ujian Tersedia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExams.map(exam => (
                <div key={exam.id} className="group glass-card p-6 rounded-xl flex flex-col justify-between hover:scale-[1.02]">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{exam.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{exam.subject} - Fase {exam.phase}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{exam.durationMinutes} menit</p>
                        </div>
                         <SubjectIcon subject={exam.subject} />
                    </div>
                    <div className='mt-6'>
                      <p className='text-xs text-slate-700 dark:text-slate-300 mb-2'>Gunakan token ini untuk memulai:</p>
                      <div className='flex items-center gap-2'>
                        <code className='bg-slate-900/5 dark:bg-slate-900/70 text-indigo-700 dark:text-indigo-300 p-2 rounded-md text-sm font-semibold flex-grow text-center'>{exam.id}</code>
                        <button onClick={() => handleCopyToken(exam.id)} title="Salin Token" className='p-2 hover:bg-indigo-500/10 rounded-md transition-colors'>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
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
