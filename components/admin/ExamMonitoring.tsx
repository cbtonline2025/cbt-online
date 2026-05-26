import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { mockExams } from '../../services/api';
import { 
  Users, 
  Monitor, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Send, 
  History, 
  Check, 
  Play, 
  Pause, 
  Radio, 
  ShieldAlert, 
  Clock, 
  Lock, 
  Unlock,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../ui/Button';

// Types for Simulated Active Student Progress
interface ActiveStudent {
  id: string;
  fullName: string;
  class: string;
  examTitle: string;
  totalQuestions: number;
  answeredQuestions: number;
  doubtfulQuestions: number;
  violationsCount: number;
  status: 'active' | 'stuck' | 'warned' | 'finished' | 'reset' | 'blocked';
  timeLeftMinutes: number;
  ipAddress: string;
  browser: string;
}

// Simulated active students list
const INITIAL_ACTIVE_STUDENTS: ActiveStudent[] = [
  {
    id: 'act-1',
    fullName: 'Ahmad Prasetyo',
    class: 'XII-IPA-1',
    examTitle: 'Ujian Akhir Semester Fisika',
    totalQuestions: 15,
    answeredQuestions: 11,
    doubtfulQuestions: 1,
    violationsCount: 0,
    status: 'active',
    timeLeftMinutes: 52,
    ipAddress: '192.168.100.12',
    browser: 'Chrome v122 (Windows)'
  },
  {
    id: 'act-2',
    fullName: 'Budi Santoso',
    class: 'IX-B',
    examTitle: 'Latihan ANBK IPA',
    totalQuestions: 20,
    answeredQuestions: 7,
    doubtfulQuestions: 2,
    violationsCount: 3,
    status: 'warned',
    timeLeftMinutes: 28,
    ipAddress: '191.168.100.41',
    browser: 'Chrome Mobile (Android)'
  },
  {
    id: 'act-3',
    fullName: 'Citra Lestari',
    class: 'XII-IPA-2',
    examTitle: 'Ujian Akhir Semester Fisika',
    totalQuestions: 15,
    answeredQuestions: 15,
    doubtfulQuestions: 0,
    violationsCount: 0,
    status: 'finished',
    timeLeftMinutes: 0,
    ipAddress: '192.168.100.58',
    browser: 'Edge v121 (Windows)'
  },
  {
    id: 'act-4',
    fullName: 'Daffa Firdaus',
    class: 'XII-IPA-1',
    examTitle: 'Ujian Akhir Semester Fisika',
    totalQuestions: 15,
    answeredQuestions: 4,
    doubtfulQuestions: 0,
    violationsCount: 0,
    status: 'active',
    timeLeftMinutes: 72,
    ipAddress: '192.168.100.115',
    browser: 'Safari v17.2 (macOS)'
  },
  {
    id: 'act-5',
    fullName: 'Erlangga Putra',
    class: 'XI-IPS-1',
    examTitle: 'Lisitening Comprehension',
    totalQuestions: 12,
    answeredQuestions: 9,
    doubtfulQuestions: 3,
    violationsCount: 5,
    status: 'active',
    timeLeftMinutes: 18,
    ipAddress: '192.168.100.90',
    browser: 'Firefox v123 (Windows)'
  },
  {
    id: 'act-6',
    fullName: 'Farhan Alamsyah',
    class: 'IX-B',
    examTitle: 'Latihan ANBK IPA',
    totalQuestions: 20,
    answeredQuestions: 14,
    doubtfulQuestions: 1,
    violationsCount: 1,
    status: 'active',
    timeLeftMinutes: 31,
    ipAddress: '192.168.100.103',
    browser: 'Chrome v122 (Linux)'
  },
  {
    id: 'act-7',
    fullName: 'Gita Permata',
    class: 'XI-IPS-2',
    examTitle: 'Lisitening Comprehension',
    totalQuestions: 12,
    answeredQuestions: 2,
    doubtfulQuestions: 0,
    violationsCount: 0,
    status: 'stuck',
    timeLeftMinutes: 42,
    ipAddress: '192.168.100.19',
    browser: 'Opera v108 (macOS)'
  },
  {
    id: 'act-8',
    fullName: 'Hana Safitri',
    class: 'XII-IPA-2',
    examTitle: 'Ujian Akhir Semester Fisika',
    totalQuestions: 15,
    answeredQuestions: 14,
    doubtfulQuestions: 0,
    violationsCount: 12,
    status: 'blocked',
    timeLeftMinutes: 34,
    ipAddress: '192.168.100.22',
    browser: 'Chrome v122 (Windows)'
  }
];

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'alert' | 'system';
}

const ExamMonitoring: React.FC = () => {
  const [students, setStudents] = useState<ActiveStudent[]>(() => {
    try {
      const stored = window.localStorage.getItem('cbt-merdeka-active-students');
      if (stored) {
        return JSON.parse(stored);
      }
      // If none, populate localStorage and use INITIAL_ACTIVE_STUDENTS
      window.localStorage.setItem('cbt-merdeka-active-students', JSON.stringify(INITIAL_ACTIVE_STUDENTS));
    } catch (error) {
      console.error("Failed to initialize students from localStorage", error);
    }
    return INITIAL_ACTIVE_STUDENTS;
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'l1', time: '19:40:12', message: 'Ujian Akhir Semester Fisika resmi dibuka oleh Proktor.', type: 'system' },
    { id: 'l2', time: '19:41:05', message: 'Ahmad Prasetyo berhasil login ke sesi ujian.', type: 'info' },
    { id: 'l3', time: '19:42:15', message: 'Citra Lestari mulai mengerjakan Soal #1.', type: 'info' },
    { id: 'l4', time: '19:44:31', message: 'ALERT: Hana Safitri beralih dari jendela browser utama!', type: 'alert' },
    { id: 'l5', time: '19:45:10', message: 'Latihan ANBK IPA diaktifkan untuk kelas VIII & IX.', type: 'system' },
    { id: 'l6', time: '19:46:12', message: 'Budi Santoso terdeteksi beralih tab browser (Peringatan ke-1).', type: 'warn' },
    { id: 'l7', time: '19:47:005', message: 'SUCCESS: Citra Lestari mengumpulkan jawaban dengan aman.', type: 'success' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [warnModalInfo, setWarnModalInfo] = useState<{ 
    isOpen: boolean; 
    student: ActiveStudent | null; 
    students?: ActiveStudent[]; 
    message: string 
  }>({
    isOpen: false,
    student: null,
    students: [],
    message: 'Tolong fokus pada lembar soal Anda. Sistem mendeteksi aktivitas mencurigakan!'
  });

  // Clock state
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(d.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage whenever the students state updates
  useEffect(() => {
    try {
      window.localStorage.setItem('cbt-merdeka-active-students', JSON.stringify(students));
    } catch (error) {
      console.error("Failed to save student progress to localStorage", error);
    }
  }, [students]);

  // Synchronize student progress by polling localStorage every 5 seconds
  useEffect(() => {
    const syncInterval = setInterval(() => {
      try {
        const stored = window.localStorage.getItem('cbt-merdeka-active-students');
        if (stored) {
          const parsed = JSON.parse(stored) as ActiveStudent[];
          
          setStudents(prevStudents => {
            // Compare string representations to prevent infinite React loops
            if (JSON.stringify(prevStudents) !== JSON.stringify(parsed)) {
              console.log("[POLLING] Synchronized student progress with localStorage.");
              return parsed;
            }
            return prevStudents;
          });
        }
      } catch (error) {
        console.error("Failed to poll student progress from localStorage", error);
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, []);

  // Helper to add logs cleanly
  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    const d = new Date();
    const timeStr = d.toTimeString().split(' ')[0];
    const newLog: LogEntry = {
      id: `l-${Date.now()}-${Math.random()}`,
      time: timeStr,
      message,
      type
    };
    setLogs(prev => {
      const updated = [newLog, ...prev];
      return updated.slice(0, 50); // limit to 50 logs
    });
  }, []);

  // Simulated live updates (simulating real students clicking questions and trigger event violations)
  useEffect(() => {
    if (isFeedPaused) return;

    const interval = setInterval(() => {
      setStudents(prevStudents => {
        const updated = prevStudents.map(student => {
          // Finished students do not advance
          if (student.status === 'finished' || student.status === 'blocked' || student.status === 'reset') {
            return student;
          }

          // Random rolls to trigger events
          const roll = Math.random();

          // 1. Progress update (Most common event)
          if (roll < 0.25) {
            if (student.answeredQuestions < student.totalQuestions) {
              const newAnswered = student.answeredQuestions + 1;
              const hasCompleted = newAnswered === student.totalQuestions;
              
              if (hasCompleted) {
                // Add success log
                addLog(`SUCCESS: ${student.fullName} (${student.class}) telah menyelesaikan semua soal ujian ${student.examTitle}!`, 'success');
                return {
                  ...student,
                  answeredQuestions: newAnswered,
                  status: 'finished',
                  timeLeftMinutes: 0
                };
              } else {
                // Add regular log
                addLog(`${student.fullName} menjawab Soal #${newAnswered} di ${student.examTitle}.`, 'info');
                return {
                  ...student,
                  answeredQuestions: newAnswered
                };
              }
            }
          }

          // 2. Doubtful toggle
          if (roll >= 0.25 && roll < 0.35) {
            const doubtfulDiff = Math.random() > 0.5 ? 1 : -1;
            const newDoubtful = Math.max(0, student.doubtfulQuestions + doubtfulDiff);
            return {
              ...student,
              doubtfulQuestions: newDoubtful
            };
          }

          // 3. Cheating/Violation trigger (Tab switches)
          if (roll >= 0.35 && roll < 0.42) {
            const newViolations = student.violationsCount + 1;
            let newStatus = student.status;
            let logType: LogEntry['type'] = 'warn';
            let msgStr = `WARNING: ${student.fullName} (${student.class}) terdeteksi meninggalkan halaman ujian (Frekuensi: ${newViolations}x).`;

            if (newViolations >= 10) {
              newStatus = 'blocked';
              logType = 'alert';
              msgStr = `ALERT MANDIRI: Akses ujian ${student.fullName} DIBLOKIR otomatis karena pelanggaran berulang melebihi batas proktor!`;
            } else if (newViolations >= 4) {
              newStatus = 'warned';
              logType = 'warn';
            }

            addLog(msgStr, logType);

            return {
              ...student,
              violationsCount: newViolations,
              status: newStatus
            };
          }

          // 4. Stuck / network lagging
          if (roll >= 0.42 && roll < 0.46) {
            const isLagging = student.status === 'active';
            if (isLagging) {
              addLog(`Sinyal ${student.fullName} tidak stabil / Koneksi terputus sementara.`, 'warn');
              return {
                ...student,
                status: 'stuck'
              };
            } else if (student.status === 'stuck') {
              addLog(`Koneksi ${student.fullName} kembali terhubung dan pulih.`, 'info');
              return {
                ...student,
                status: 'active'
              };
            }
          }

          // 5. Normal decrease of time left
          if (roll > 0.95) {
            return {
              ...student,
              timeLeftMinutes: Math.max(1, student.timeLeftMinutes - 1)
            };
          }

          return student;
        });

        return updated;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isFeedPaused, addLog]);

  // Handler functions for proctor action buttons
  const triggerWarnStudent = (student: ActiveStudent) => {
    setWarnModalInfo({
      isOpen: true,
      student,
      message: 'Anda terdeteksi mengalihkan tab halaman ujian. Harap fokus pada soal Anda! Pelanggaran berikutnya akan memblokir akses ujian secara otomatis.'
    });
  };

  const submitWarningMessage = () => {
    if (!warnModalInfo.student && (!warnModalInfo.students || warnModalInfo.students.length === 0)) return;
    const { student, students: targetStudents, message } = warnModalInfo;

    if (targetStudents && targetStudents.length > 0) {
      const targetIds = targetStudents.map(s => s.id);
      setStudents(prev => prev.map(s => {
        if (targetIds.includes(s.id)) {
          return { ...s, status: 'warned' };
        }
        return s;
      }));

      targetStudents.forEach(s => {
        addLog(`PROKTOR (Massal): Peringatan tertulis dikirim ke ${s.fullName} (${s.class}): "${message}"`, 'warn');
      });

      setSelectedStudentIds([]);
    } else if (student) {
      setStudents(prev => prev.map(s => {
        if (s.id === student.id) {
          return { ...s, status: 'warned' };
        }
        return s;
      }));

      addLog(`PROKTOR: Peringatan tertulis dikirim ke ${student.fullName} (${student.class}): "${message}"`, 'warn');
    }

    setWarnModalInfo({ isOpen: false, student: null, students: [], message: '' });
  };

  // Mass action handlers
  const handleBatchWarn = () => {
    const selectedStudentsList = students.filter(s => selectedStudentIds.includes(s.id) && s.status !== 'finished' && s.status !== 'blocked');
    if (selectedStudentsList.length === 0) {
      alert("Tidak ada siswa terpilih yang dalam status aktif / bisa diberikan teguran.");
      return;
    }
    setWarnModalInfo({
      isOpen: true,
      student: null,
      students: selectedStudentsList,
      message: 'Anda terdeteksi mengalihkan tab halaman ujian. Harap fokus pada soal Anda! Pelanggaran berikutnya akan memblokir akses ujian secara otomatis.'
    });
  };

  const handleBatchForceSubmit = () => {
    const selectedStudentsList = students.filter(s => selectedStudentIds.includes(s.id) && s.status !== 'finished');
    if (selectedStudentsList.length === 0) {
      alert("Tidak ada siswa terpilih yang sedang aktif mengerjakan ujian.");
      return;
    }
    const confirmation = window.confirm(`Apakah Anda yakin ingin memaksakan pengumpulan ujian untuk ${selectedStudentsList.length} siswa terpilih secara massal? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmation) return;

    setStudents(prev => prev.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return {
          ...s,
          status: 'finished',
          answeredQuestions: s.totalQuestions,
          timeLeftMinutes: 0
        };
      }
      return s;
    }));

    selectedStudentsList.forEach(s => {
      addLog(`PROKTOR (Massal): Memaksa pengumpulan ujian ${s.examTitle} milik ${s.fullName}.`, 'alert');
    });

    setSelectedStudentIds([]);
  };

  const handleBatchResetSession = () => {
    const selectedStudentsList = students.filter(s => selectedStudentIds.includes(s.id));
    if (selectedStudentsList.length === 0) return;

    const confirmation = window.confirm(`Apakah Anda yakin ingin mereset sesi pengerjaan untuk ${selectedStudentsList.length} siswa terpilih secara massal?`);
    if (!confirmation) return;

    setStudents(prev => prev.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return {
          ...s,
          status: 'reset',
          answeredQuestions: 0,
          doubtfulQuestions: 0,
          violationsCount: 0,
          timeLeftMinutes: 45
        };
      }
      return s;
    }));

    selectedStudentsList.forEach(s => {
      addLog(`PROKTOR (Massal): Mereset sesi pengerjaan ${s.fullName} (${s.class}).`, 'success');
    });

    setSelectedStudentIds([]);
  };

  const handleBatchToggleBlock = () => {
    const selectedStudentsList = students.filter(s => selectedStudentIds.includes(s.id));
    if (selectedStudentsList.length === 0) return;

    const allBlocked = selectedStudentsList.every(s => s.status === 'blocked');
    const actionBlock = !allBlocked;

    const confirmation = window.confirm(
      actionBlock 
        ? `Apakah Anda yakin ingin memblokir akses ujian untuk ${selectedStudentsList.length} siswa terpilih secara massal?`
        : `Apakah Anda yakin ingin membuka kunci akses ujian untuk ${selectedStudentsList.length} siswa terpilih secara massal?`
    );
    if (!confirmation) return;

    setStudents(prev => prev.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return {
          ...s,
          status: actionBlock ? 'blocked' : 'active'
        };
      }
      return s;
    }));

    selectedStudentsList.forEach(s => {
      if (actionBlock) {
        addLog(`PROKTOR (Massal): Memblokir akses ujian ${s.fullName} secara manual karena tindakan pengawasan massal.`, 'alert');
      } else {
        addLog(`PROKTOR (Massal): Membuka kunci akses ujian ${s.fullName} kembali aktif secara manual.`, 'success');
      }
    });

    setSelectedStudentIds([]);
  };

  const handleForceSubmit = (student: ActiveStudent) => {
    const confirmation = window.confirm(`Apakah Anda yakin ingin memaksakan pengumpulan ujian untuk ${student.fullName}? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmation) return;

    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          status: 'finished',
          answeredQuestions: s.totalQuestions,
          timeLeftMinutes: 0
        };
      }
      return s;
    }));

    addLog(`PROKTOR: Memaksa pengumpulan ujian ${student.examTitle} milik ${student.fullName} dihentikan secara sepihak.`, 'alert');
  };

  const handleResetSession = (student: ActiveStudent) => {
    const confirmation = window.confirm(`Reset sesi pengerjaan ${student.fullName}? Hal ini akan mengembalikan ke status Siap Login Semula dan melepas blokir.`);
    if (!confirmation) return;

    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          status: 'reset',
          answeredQuestions: 0,
          doubtfulQuestions: 0,
          violationsCount: 0,
          timeLeftMinutes: 45
        };
      }
      return s;
    }));

    addLog(`PROKTOR: Mereset sesi pengerjaan ${student.fullName} (${student.class}). Silakan siswa masuk kembali.`, 'success');
  };

  const handleToggleBlock = (student: ActiveStudent) => {
    const isToBlock = student.status !== 'blocked';
    
    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          status: isToBlock ? 'blocked' : 'active'
        };
      }
      return s;
    }));

    if (isToBlock) {
      addLog(`PROKTOR: Memblokir akses ujian ${student.fullName} secara manual karena pelanggaran berat!`, 'alert');
    } else {
      addLog(`PROKTOR: Membuka kunci (unblock) akses ujian ${student.fullName} kembali aktif.`, 'success');
    }
  };

  // Filter implementation
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Translate status to keywords for easier search matching
      const statusMap: Record<string, string[]> = {
        active: ['aktif', 'online', 'active', 'lancar'],
        warned: ['peringatan', 'terkirim', 'warned', 'tegur'],
        stuck: ['kendala', 'sinyal', 'stuck', 'lagging', 'macet'],
        finished: ['selesai', 'finished', 'dikirim', 'complete', 'kumpul'],
        blocked: ['banned', 'dikunci', 'blocked', 'blokir', 'ditangguhkan'],
        reset: ['belum mulai', 'reset', 'siap']
      };
      const statusKeywords = statusMap[student.status] || [];

      const matchSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          statusKeywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchExam = selectedExamFilter === 'all' || student.examTitle === selectedExamFilter;
      
      let matchStatus = true;
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'violating') {
          matchStatus = student.violationsCount > 0 && student.status !== 'finished';
        } else {
          matchStatus = student.status === selectedStatusFilter;
        }
      }

      return matchSearch && matchExam && matchStatus;
    });
  }, [students, searchQuery, selectedExamFilter, selectedStatusFilter]);

  // Unique exams list for filters
  const filterExamsList = useMemo(() => {
    return Array.from(new Set(students.map(s => s.examTitle)));
  }, [students]);

  // Analytics Metrics calculations
  const metrics = useMemo(() => {
    const totalCount = students.length;
    const activeRunning = students.filter(s => s.status === 'active' || s.status === 'warned' || s.status === 'stuck').length;
    const finishedCount = students.filter(s => s.status === 'finished').length;
    const blockedCount = students.filter(s => s.status === 'blocked').length;
    const totalViolating = students.filter(s => s.violationsCount > 5 && s.status !== 'finished').length;

    // Average answering percentage across running students
    const runningStudents = students.filter(s => s.status !== 'finished' && s.status !== 'reset');
    const avgProgress = runningStudents.length > 0 
      ? Math.round((runningStudents.reduce((sum, s) => sum + (s.answeredQuestions / s.totalQuestions), 0) / runningStudents.length) * 100)
      : 100;

    return {
      totalCount,
      activeRunning,
      finishedCount,
      blockedCount,
      totalViolating,
      avgProgress
    };
  }, [students]);

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      
      {/* Top Controller Widget and Real-Time Info Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Info & Live Connection status */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-150 dark:border-slate-800/80 shadow-md flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg relative shrink-0">
              <Radio className="w-6 h-6 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
              </span>
            </div>
            
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Gerbang Sinkronisasi Proktor</h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded-md">LIVE REAKTIF</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-sm">
                Protokol pengawasan real-time mendeteksi perpindahan halaman, durasi pengerjaan, dan riwayat klik siswa secara langsung.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0 pl-4 border-l border-slate-100 dark:border-slate-800/80">
            <div className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5 uppercase">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Jam Server Proktor
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-indigo-400 tracking-tighter font-mono mt-1">
              {currentTimeStr} <span className="text-xs text-slate-400 font-sans font-bold">WIB</span>
            </div>
          </div>
        </div>

        {/* Rapid Simulation Control widget */}
        <div className="glass-card bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">Simulator Aliran</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${isFeedPaused ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isFeedPaused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`} />
              {isFeedPaused ? 'PAUSED' : 'STREAMING'}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-[150px]">
              Aliran simulasi data siswa mengisi lembar soal dan keluar tab secara real-time.
            </p>
            <Button
              id="btn-stream-toggle"
              onClick={() => setIsFeedPaused(!isFeedPaused)}
              variant="secondary"
              className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border-none transition-colors ${
                isFeedPaused 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-450' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isFeedPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" /> RESUME
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" /> FREEZE
                </>
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* Highlights KPI Cards (KPI Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        
        <div className="glass-card bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Siswa Diawasi</div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{metrics.totalCount}</span>
            <span className="text-xs font-bold text-slate-400">Siswa</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-400 to-slate-500 h-full w-[100%]" />
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Sesi Aktif</div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{metrics.activeRunning}</span>
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400/80 animate-pulse">● ONLINE</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${(metrics.activeRunning / metrics.totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Ujian Selesai</div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{metrics.finishedCount}</span>
            <span className="text-xs font-bold text-slate-400">/ {metrics.totalCount} Selesai</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-indigo-505 bg-indigo-600 h-full transition-all duration-500" 
              style={{ width: `${(metrics.finishedCount / metrics.totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="glass-card bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Ujian Diblokir</div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-450 tracking-tight">{metrics.blockedCount}</span>
            <span className="text-xs font-bold text-rose-500">DIKUNCI</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-rose-600 h-full transition-all duration-500" 
              style={{ width: `${(metrics.blockedCount / metrics.totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="col-span-2 md:col-span-4 lg:col-span-1 glass-card bg-indigo-500/5 dark:bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm flex flex-col justify-between">
          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Rata Kemajuan</div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-indigo-700 dark:text-indigo-350 tracking-tight">{metrics.avgProgress}%</span>
            <span className="text-xs font-bold text-indigo-550 dark:text-indigo-400/80">Rata-rata Terjawab</span>
          </div>
          <div className="w-full bg-indigo-500/20 dark:bg-indigo-900/40 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full transition-all duration-500" 
              style={{ width: `${metrics.avgProgress}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Core Section: Table and Active Log Console */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Active Students List (Table - 3 cols width) */}
        <div className="xl:col-span-3 space-y-4">
                   {/* Filters controls bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-900/60 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                id="search-students"
                type="text" 
                placeholder="Cari nama, kelas, status (mis. aktif, kendala, selesai) atau mata ujian..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-xs font-bold py-3 pl-10 pr-4 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-400 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1 sm:pt-0">
              
              {/* Exam title filter selection */}
              <div className="relative">
                <select 
                  id="filter-exam"
                  value={selectedExamFilter}
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-xs font-bold py-3 pl-3 pr-8 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Semua Mata Ujian</option>
                  {filterExamsList.map((exam, i) => (
                    <option key={i} value={exam}>{exam}</option>
                  ))}
                </select>
              </div>

              {/* Status filter selection */}
              <div className="relative">
                <select 
                  id="filter-status"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-xs font-bold py-3 pl-3 pr-8 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">🟢 online / Aktif</option>
                  <option value="warned">🟡 Terkirim Peringatan</option>
                  <option value="stuck">🟠 Kendala Sinyal</option>
                  <option value="violating">🔴 Sedang Melanggar</option>
                  <option value="blocked">⛔ Dibanned / Dikunci</option>
                  <option value="finished">🔵 Selesai Ujian</option>
                </select>
              </div>

            </div>
          </div>

          {/* Batch Actions Bar */}
          {selectedStudentIds.length > 0 && (
            <div className="bg-indigo-605/10 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xs shrink-0">
                  {selectedStudentIds.length}
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest">Tindakan Massal Proktor</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-none mt-1">{selectedStudentIds.length} siswa terpilih dari daftar.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                <Button
                  id="btn-batch-warn"
                  onClick={handleBatchWarn}
                  variant="secondary"
                  className="py-2 px-3 bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-none rounded-xl text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> TEGURAN MASAL
                </Button>
                <Button
                  id="btn-batch-force-submit"
                  onClick={handleBatchForceSubmit}
                  variant="danger"
                  className="py-2 px-3 bg-rose-600/15 text-rose-600 hover:bg-rose-600/25 border-none rounded-xl text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> PAKSA KUMPUL MASAL
                </Button>
                <Button
                  id="btn-batch-block"
                  onClick={handleBatchToggleBlock}
                  variant="secondary"
                  className="py-2 px-3 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-none rounded-xl text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> BLOKIR/BUKA MASAL
                </Button>
                <Button
                  id="btn-batch-reset"
                  onClick={handleBatchResetSession}
                  variant="secondary"
                  className="py-2 px-3 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-none rounded-xl text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> RESET MASAL
                </Button>
                <button
                  id="btn-batch-clear"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-2 font-black tracking-wide uppercase"
                >
                  BATAL
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="glass-card bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-4.5 px-6 w-12 text-center">
                      <input 
                        id="checkbox-select-all"
                        type="checkbox"
                        checked={filteredStudents.length > 0 && filteredStudents.every(student => selectedStudentIds.includes(student.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allFilteredIds = filteredStudents.map(student => student.id);
                            setSelectedStudentIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                          } else {
                            const allFilteredIds = filteredStudents.map(student => student.id);
                            setSelectedStudentIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                      />
                    </th>
                    <th className="py-4.5 px-6">Identitas Siswa / Kelas</th>
                    <th className="py-4.5 px-6">Nama Ujian / Durasi</th>
                    <th className="py-4.5 px-6 text-center">Rincian Progress</th>
                    <th className="py-4.5 px-6">Inspeksi Keamanan</th>
                    <th className="py-4.5 px-6 text-right">Menu Proktor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-bold">
                  <AnimatePresence initial={false}>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => {
                        // Render detailed stylized progress bar percentages
                        const answeredPct = Math.round((student.answeredQuestions / student.totalQuestions) * 100);
                        const doubtfulPct = Math.round((student.doubtfulQuestions / student.totalQuestions) * 100);
                        const unansweredPct = 100 - answeredPct - doubtfulPct;
                        const isSelected = selectedStudentIds.includes(student.id);

                        return (
                          <motion.tr 
                            key={student.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layout
                            className={`transition-all text-slate-700 dark:text-slate-250 cursor-default group ${
                              isSelected 
                                ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30' 
                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/30'
                            }`}
                          >
                            
                            {/* Row Selection Checkbox */}
                            <td className="py-5 px-6 text-center w-12 shrink-0">
                              <input 
                                id={`checkbox-select-student-${student.id}`}
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds(prev => [...prev, student.id]);
                                  } else {
                                    setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                              />
                            </td>
                            
                            {/* Student Info */}
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  <img 
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.fullName}`} 
                                    alt="Siswa" 
                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800"
                                  />
                                  <span className={`absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 ${
                                    student.status === 'active' ? 'bg-emerald-500' :
                                    student.status === 'warned' ? 'bg-amber-400 animate-pulse' :
                                    student.status === 'stuck' ? 'bg-orange-400 animate-bounce' :
                                    student.status === 'finished' ? 'bg-indigo-650' :
                                    student.status === 'blocked' ? 'bg-rose-600' :
                                    'bg-slate-300'
                                  }`} />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="font-extrabold text-sm text-slate-850 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-teal-400 transition-colors duration-200">{student.fullName}</div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                                    <span>Kelas: <strong className="text-slate-600 dark:text-slate-400">{student.class}</strong></span>
                                    <span>•</span>
                                    <span>IP: {student.ipAddress}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Active Exam and Times */}
                            <td className="py-5 px-6">
                              <div className="space-y-1 max-w-[200px]">
                                <div className="text-xs font-black truncate text-slate-800 dark:text-slate-200">{student.examTitle}</div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                                  <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400/80" />
                                  {student.status === 'finished' ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">Selesai Dikirim</span>
                                  ) : student.status === 'reset' ? (
                                    <span className="text-slate-400">Belum Mulai</span>
                                  ) : (
                                    <span>Sisa: <strong className="text-slate-600 dark:text-slate-400">{student.timeLeftMinutes} m</strong></span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Answer Progress Percentage Bar */}
                            <td className="py-5 px-6">
                              <div className="flex flex-col items-center justify-center space-y-1.5 max-w-[150px] mx-auto w-full">
                                <div className="flex justify-between w-full text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                  <span>{student.answeredQuestions} / {student.totalQuestions} Soal</span>
                                  <span className="text-slate-600 dark:text-slate-300 font-extrabold">{answeredPct}%</span>
                                </div>
                                
                                {/* Tri-color bar segments: Answered, Doubtful, Remaining */}
                                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full flex overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                                  <div 
                                    className="bg-emerald-500 h-full transition-all duration-500" 
                                    style={{ width: `${answeredPct}%` }}
                                    title={`Terjawab: ${student.answeredQuestions} soal`}
                                  />
                                  <div 
                                    className="bg-amber-400 h-full transition-all duration-0" 
                                    style={{ width: `${doubtfulPct}%` }}
                                    title={`Ragu-Ragu: ${student.doubtfulQuestions} soal`}
                                  />
                                  <div 
                                    className="h-full bg-transparent transition-all duration-500" 
                                    style={{ width: `${unansweredPct}%` }}
                                    title={`Belum Terisi`}
                                  />
                                </div>
                                
                                {student.doubtfulQuestions > 0 && (
                                  <span className="text-[8.5px] bg-amber-500/10 text-amber-700 dark:text-amber-450 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                                    ⚠️ {student.doubtfulQuestions} RAGU
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Threat Status Violations Checks */}
                            <td className="py-5 px-6">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  {student.violationsCount > 5 ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-450 text-[10px] font-black uppercase tracking-wide">
                                      <ShieldAlert className="w-3.5 h-3.5" /> KRITIS ({student.violationsCount}x)
                                    </span>
                                  ) : student.violationsCount > 0 ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-450 text-[10px] font-black uppercase tracking-wide">
                                      <AlertTriangle className="w-3.5 h-3.5" /> INDIKASI ({student.violationsCount}x)
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-450 text-[10px] font-black uppercase tracking-wide">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> AMAN (0x)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider truncate max-w-[130px]">
                                  {student.browser}
                                </div>
                              </div>
                            </td>

                            {/* Proctor Operations (Actions Grid for Student) */}
                            <td className="py-5 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {student.status !== 'finished' && student.status !== 'blocked' && (
                                  <button
                                    onClick={() => triggerWarnStudent(student)}
                                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                                    title="Kirim Peringatan"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                )}

                                {student.status !== 'finished' && (
                                  <button
                                    onClick={() => handleForceSubmit(student)}
                                    className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                                    title="Beri Sanksi & Paksa Kumpul"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleToggleBlock(student)}
                                  className={`p-2 rounded-lg ${
                                    student.status === 'blocked' 
                                      ? 'bg-rose-500 text-white hover:bg-rose-600' 
                                      : 'bg-rose-50 dark:bg-rose-550/15 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/10'
                                  } transition-colors`}
                                  title={student.status === 'blocked' ? 'Aktifkan Kembali' : 'Blokir Sementara'}
                                >
                                  {student.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={() => handleResetSession(student)}
                                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-805 dark:text-slate-400 dark:hover:bg-slate-705 transition-colors"
                                  title="Reset Sesi"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>

                              </div>
                            </td>

                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                          <AlertCircle className="w-8 h-8 text-slate-350 dark:text-slate-650 mx-auto mb-3" />
                          Tidak ada siswa aktif yang cocok dengan kriteria pencarian / filter Anda.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Proctor Activity Log Console Feed (1 col weight) */}
        <div className="xl:col-span-1 space-y-4">
          
          <div className="glass-card bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-900 shadow-md h-full flex flex-col justify-between relative overflow-hidden">
            {/* Gloss grid header overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500" />
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-teal-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Live Activity Feed</h3>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] font-black text-slate-55s hover:text-indigo-400 hover:bg-slate-900 px-2 py-1 rounded transition-colors uppercase tracking-widest text-slate-400"
              >
                Clear
              </button>
            </div>

            {/* The scrolling text log screen */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[480px] font-mono text-[10px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-850">
              <AnimatePresence initial={false}>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0 }}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                        log.type === 'alert' 
                          ? 'bg-rose-950/40 border-rose-900/50 text-rose-350' 
                          : log.type === 'warn' 
                          ? 'bg-amber-950/40 border-amber-900/50 text-amber-300' 
                          : log.type === 'success' 
                          ? 'bg-emerald-950/40 border-emerald-950/55 text-emerald-300' 
                          : log.type === 'system' 
                          ? 'bg-indigo-950/40 border-indigo-900/50 text-indigo-300' 
                          : 'bg-slate-900/60 border-slate-900 text-slate-430 text-slate-300'
                      }`}
                    >
                      <span className="opacity-40 shrink-0 font-bold font-sans">[{log.time}]</span>
                      <div className="flex-1 text-[10px] leading-relaxed break-words font-semibold">{log.message}</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-600 italic">
                    Konsol kosong. Menunggu aktivitas ujian siswa...
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-900 text-[9px] text-slate-500 font-bold flex items-center justify-between shrink-0">
              <span>Sinyal Kontrol Terkumpul</span>
              <span>Port: Intern - Auto/Vite</span>
            </div>
          </div>

        </div>

      </div>

      {/* Warning Text Writer Dialog Modal (Simulated message dispatch) */}
      {warnModalInfo.isOpen && (warnModalInfo.student || (warnModalInfo.students && warnModalInfo.students.length > 0)) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-white">
          <div className="w-full max-w-md glass-card bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">Kirim Teguran Proktor</h3>
                <p className="text-[10px] text-slate-505 dark:text-slate-400 font-medium leading-normal">
                  Peringatan akan tampil di tengah layar siswa dengan efek blur latar belakang.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Penerima Ujian</label>
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-xs">
                {warnModalInfo.students && warnModalInfo.students.length > 0 ? (
                  <div className="w-full">
                    <strong className="text-slate-800 dark:text-white block">{warnModalInfo.students.length} Siswa Terpilih</strong>
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-1.5 max-h-24 overflow-y-auto font-bold space-y-0.5 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50 p-2 rounded-lg">
                      {warnModalInfo.students.map((s, i) => (
                        <div key={s.id} className="py-1 flex justify-between items-center">
                          <span>{i+1}. {s.fullName}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-extrabold">{s.class}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : warnModalInfo.student ? (
                  <>
                    <div>
                      <strong className="text-slate-800 dark:text-white">{warnModalInfo.student.fullName}</strong>
                      <span className="text-slate-400 text-[10px] ml-1.5">{warnModalInfo.student.class}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-black text-slate-500 uppercase">
                      {warnModalInfo.student.examTitle.split(' ').slice(-1)[0]}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="warning-message" className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Isi Pesan Teguran</label>
              <textarea 
                id="warning-message"
                value={warnModalInfo.message}
                onChange={(e) => setWarnModalInfo(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                placeholder="Tulis peringatan untuk siswa..."
                className="w-full bg-slate-50 dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold placeholder-slate-400 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                id="btn-warn-cancel"
                onClick={() => setWarnModalInfo({ isOpen: false, student: null, students: [], message: '' })}
                variant="secondary"
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 border-none rounded-xl text-slate-700 dark:text-slate-300"
              >
                Batal
              </Button>
              <Button 
                id="btn-warn-submit"
                onClick={submitWarningMessage}
                variant="danger"
                className="flex-1 py-3 text-[10px] bg-indigo-600 hover:bg-indigo-500 border-none transition-colors rounded-xl font-black uppercase tracking-widest text-white"
              >
                Kirim Peringatan
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamMonitoring;
