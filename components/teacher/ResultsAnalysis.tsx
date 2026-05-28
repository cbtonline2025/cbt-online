import React, { useState, useEffect } from 'react';
import { 
  Award, 
  User, 
  Clock, 
  FileText, 
  Bot, 
  ChevronRight, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ThumbsUp, 
  CornerDownRight,
  BookOpen,
  XCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeEssayAnswer } from '../../services/geminiService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { jsPDF } from 'jspdf';

interface MockEssaySubmission {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  examTitle: string;
  subject: string;
  questionId: string;
  questionContent: string;
  rubricText: string;
  studentAnswer: string;
  status: 'evaluated' | 'unevaluated';
  score: number;
  scoresDetail: {
    conceptUnderstanding: number;
    completeness: number;
    accuracy: number;
  };
  strengths: string[];
  weaknesses: string[];
  constructiveFeedback: string;
}

const INITIAL_SUBMISSIONS: MockEssaySubmission[] = [
  {
    id: "sub-1",
    studentId: "user-1",
    studentName: "Ahmad Prasetyo",
    class: "XII-IPA-1",
    examTitle: "Ujian Akhir Semester Fisika",
    subject: "Fisika",
    questionId: "q3",
    questionContent: "Jelaskan secara singkat prinsip kerja transformator step-up!",
    rubricText: "Transformator step-up bekerja berdasarkan prinsip induksi elektromagnetik. Ia memiliki jumlah lilitan sekunder lebih banyak daripada lilitan primer, sehingga menaikkan tegangan (voltase) sambil menurunkan arus.",
    studentAnswer: "Prinsipnya pakai induksi elektromagnetik. Transformator step-up punya lilitan sekunder yang jumlahnya jauh lebih banyak daripada lilitan di bagian primer. Karena perbandingan lilitan sekundernya lebih banyak, maka tegangan (voltase) yang dihasilkan di kumparan sekunder juga menjadi lebih tinggi atau naik. Sementara itu, arusnya akan turun demi menjaga daya tetap seimbang.",
    status: "evaluated",
    score: 95,
    scoresDetail: {
      conceptUnderstanding: 100,
      completeness: 90,
      accuracy: 95
    },
    strengths: [
      "Menyebutkan prinsip induksi elektromagnetik secara tepat.",
      "Menjelaskan jumlah lilitan sekunder lebih banyak dibandingkan lilitan primer.",
      "Menghubungkan kenaikan tegangan dengan penurunan arus untuk menjaga efisiensi daya."
    ],
    weaknesses: [
      "Hasil perumusan matematis singkat terkait perbadingan Ns > Np dapat ditambahkan untuk memperkuat argumen murni."
    ],
    constructiveFeedback: "Excellent! Pemikiran kritis yang luar biasa. Siswa sangat memahami dinamika hukum kemagnetan dan mampu memformulasikannya dengan runut dan bahasa yang ilmiah."
  },
  {
    id: "sub-2",
    studentId: "user-2",
    studentName: "Budi Santoso",
    class: "IX-B",
    examTitle: "Latihan ANBK IPA",
    subject: "IPA",
    questionId: "q6",
    questionContent: "Sebutkan 3 contoh sumber energi terbarukan!",
    rubricText: "Contoh sumber energi terbarukan antara lain: energi matahari (surya), energi angin, energi air (hidroelektrik), energi panas bumi (geotermal), dan biomassa.",
    studentAnswer: "Energi matahari, gas alam cair, dan batubara bersih yang tidak merusak alam.",
    status: "unevaluated",
    score: 0,
    scoresDetail: {
      conceptUnderstanding: 0,
      completeness: 0,
      accuracy: 0
    },
    strengths: [],
    weaknesses: [],
    constructiveFeedback: ""
  },
  {
    id: "sub-3",
    studentId: "user-1",
    studentName: "Ahmad Prasetyo",
    class: "XII-IPA-1",
    examTitle: "Latihan ANBK IPA",
    subject: "IPA",
    questionId: "q6",
    questionContent: "Sebutkan 3 contoh sumber energi terbarukan!",
    rubricText: "Contoh sumber energi terbarukan antara lain: energi matahari (surya), energi angin, energi air (hidroelektrik), energi panas bumi (geotermal), dan biomassa.",
    studentAnswer: "1. Energi surya atau matahari yang memakai sel surya.\n2. Energi angin yang memanfaatkan turbin atau kincir angin.\n3. Energi hidroelektrik atau air dari bendungan.",
    status: "unevaluated",
    score: 0,
    scoresDetail: {
      conceptUnderstanding: 0,
      completeness: 0,
      accuracy: 0
    },
    strengths: [],
    weaknesses: [],
    constructiveFeedback: ""
  },
  {
    id: "sub-4",
    studentId: "user-2",
    studentName: "Budi Santoso",
    class: "IX-B",
    examTitle: "Ujian Akhir Semester Fisika",
    subject: "Fisika",
    questionId: "q3",
    questionContent: "Jelaskan secara singkat prinsip kerja transformator step-up!",
    rubricText: "Transformator step-up bekerja berdasarkan prinsip induksi elektromagnetik. Ia memiliki jumlah lilitan sekunder lebih banyak daripada lilitan primer, sehingga menaikkan tegangan (voltase) sambil menurunkan arus.",
    studentAnswer: "Transformator step-up itu buat naikin tegangan listrik. Kumparan sekunder lilitannya sengaja dibikin banyak dibanding kumparan primer. Jadi otomatis voltasenya ikut naik gede.",
    status: "unevaluated",
    score: 0,
    scoresDetail: {
      conceptUnderstanding: 0,
      completeness: 0,
      accuracy: 0
    },
    strengths: [],
    weaknesses: [],
    constructiveFeedback: ""
  },
  {
    id: "sub-5",
    studentId: "user-2",
    studentName: "Budi Santoso",
    class: "IX-B",
    examTitle: "Simulasi Ujian Multimedia (AKM)",
    subject: "Seni dan Seni Suara",
    questionId: "q18",
    questionContent: "Saksikan dokumenter kebudayaan berikut ini secara seksama. Analisis dan paparkan minimal 3 tantangan pelestarian seni tradisional di era digital modern berdasarkan kesimpulan dari video tersebut!",
    rubricText: "Tantangan pelestarian seni tradisional antara lain: 1) Kurangnya minat generasi muda terhadap seni kebudayaan, 2) Komparasi persaingan ketat dengan konten hiburan digital modern global, dan 3) Minimnya wadah pertunjukan fisik di lingkungan urban.",
    studentAnswer: "Anak-anak sekarang malas belajar tari daerah, lebih suka main game online dan tiktok. Juga kurang modal buat bikin panggung seni tradisi.",
    status: "unevaluated",
    score: 0,
    scoresDetail: {
      conceptUnderstanding: 0,
      completeness: 0,
      accuracy: 0
    },
    strengths: [],
    weaknesses: [],
    constructiveFeedback: ""
  }
];

const ResultsAnalysis: React.FC = () => {
  const STORAGE_KEY = 'cbt-merdeka-essay-submissions';

  // State Management
  const [submissions, setSubmissions] = useState<MockEssaySubmission[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('Semua');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  
  // Scoring parameters editable by teacher (Human-in-the-loop control)
  const [editableScore, setEditableScore] = useState<number>(0);
  const [editableDetails, setEditableDetails] = useState({
    conceptUnderstanding: 0,
    completeness: 0,
    accuracy: 0
  });
  const [editableStrengths, setEditableStrengths] = useState<string[]>([]);
  const [editableWeaknesses, setEditableWeaknesses] = useState<string[]>([]);
  const [editableFeedback, setEditableFeedback] = useState<string>('');
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  // Load from localStorage on Mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MockEssaySubmission[];
        setSubmissions(parsed);
        if (parsed.length > 0) {
          setSelectedSubId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse submissions, falling back to initial mock", e);
        setSubmissions(INITIAL_SUBMISSIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
        setSelectedSubId(INITIAL_SUBMISSIONS[0].id);
      }
    } else {
      setSubmissions(INITIAL_SUBMISSIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      if (INITIAL_SUBMISSIONS.length > 0) {
        setSelectedSubId(INITIAL_SUBMISSIONS[0].id);
      }
    }
  }, []);

  // Sync edits when active submission changes or gets evaluated
  const currentSub = submissions.find(s => s.id === selectedSubId);

  useEffect(() => {
    if (currentSub) {
      setEditableScore(currentSub.score);
      setEditableDetails({
        conceptUnderstanding: currentSub.scoresDetail?.conceptUnderstanding || 0,
        completeness: currentSub.scoresDetail?.completeness || 0,
        accuracy: currentSub.scoresDetail?.accuracy || 0
      });
      setEditableStrengths(currentSub.strengths || []);
      setEditableWeaknesses(currentSub.weaknesses || []);
      setEditableFeedback(currentSub.constructiveFeedback || '');
    }
  }, [selectedSubId, currentSub]);

  // Handle live calculation of aggregate score if detail sliders change
  const handleSliderChange = (key: 'conceptUnderstanding' | 'completeness' | 'accuracy', val: number) => {
    const newDetails = { ...editableDetails, [key]: val };
    setEditableDetails(newDetails);
    
    // Weighted final score calculation (equal weighing)
    const avgScore = Math.round((newDetails.conceptUnderstanding + newDetails.completeness + newDetails.accuracy) / 3);
    setEditableScore(avgScore);
  };

  // Run secure server-side AI rubrics scoring using gemini-3.5-flash
  const handleAIAnalyze = async () => {
    if (!currentSub) return;

    setIsAnalyzing(true);
    setAnalysisProgress('Menghubungi AI Asesor Sekolah...');
    
    const progressTexts = [
      'Menghubungi AI Asesor Kulon Progo...',
      'Membaca kunci jawaban / rubrik pendidik...',
      'Menganalisis koherensi sintaksis jawaban siswa...',
      'Menghitung skor pemahaman konsep...',
      'Merumuskan umpan balik konstruktif...'
    ];

    let textIdx = 0;
    const interval = setInterval(() => {
      if (textIdx < progressTexts.length) {
        setAnalysisProgress(progressTexts[textIdx]);
        textIdx++;
      }
    }, 1200);

    try {
      const result = await analyzeEssayAnswer(
        currentSub.studentAnswer,
        currentSub.rubricText,
        currentSub.studentName,
        currentSub.examTitle,
        currentSub.questionContent
      );

      clearInterval(interval);

      if (result.error) {
        alert(`Ulasan AI terkendala: ${result.error}. Silakan coba kembali.`);
        setIsAnalyzing(false);
        return;
      }

      // Populate interactive workspace state with actual structured data from AI!
      setEditableScore(result.score);
      setEditableDetails({
        conceptUnderstanding: result.scoresDetail.conceptUnderstanding,
        completeness: result.scoresDetail.completeness,
        accuracy: result.scoresDetail.accuracy
      });
      setEditableStrengths(result.strengths);
      setEditableWeaknesses(result.weaknesses);
      setEditableFeedback(result.constructiveFeedback);

    } catch (err: any) {
      clearInterval(interval);
      alert(`Gagal menganalisis: ${err.message || err}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  // Save evaluations back to memory and localStorage
  const handleSaveEvaluation = () => {
    if (!currentSub) return;

    const updated = submissions.map(sub => {
      if (sub.id === currentSub.id) {
        return {
          ...sub,
          status: 'evaluated' as const,
          score: editableScore,
          scoresDetail: editableDetails,
          strengths: editableStrengths,
          weaknesses: editableWeaknesses,
          constructiveFeedback: editableFeedback
        };
      }
      return sub;
    });

    setSubmissions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Filter & Search Logics
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'Semua' || sub.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  // Extract unique subjects
  const subjectsList = ['Semua', ...Array.from(new Set(submissions.map(s => s.subject)))];

  // Print Beautiful Evaluation Certificate via PDF using jsPDF
  const handlePrintPDF = () => {
    if (!currentSub) return;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    let y = 14;

    // Header border block
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 0, 210, 6, "F");

    // Corporate Title Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("RAPOR TINJAUAN JAWABAN ESAI DIGITAL", 15, y);
    
    y += 5;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Asesmen Interaktif Terintegrasi AI - CBT Kurikulum Merdeka", 15, y);

    y += 5;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, y, 195, y);

    // Two column student / assessment card metadata
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text("DATA PESERTA DIDIK", 15, y);
    doc.text("MATRIKS KELAYAKAN UTAMA", 110, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Nama Lengkap", 15, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(`: ${currentSub.studentName}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Mata Pelajaran", 110, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(`: ${currentSub.subject}`, 142, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Kelas/Fase", 15, y);
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${currentSub.class}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Sesi Ujian", 110, y);
    doc.setTextColor(15, 23, 42);
    doc.text(`: ${currentSub.examTitle}`, 142, y);

    y += 5;
    doc.setDrawColor(241, 245, 249);
    doc.line(15, y, 195, y);

    // Render original Question
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(79, 70, 229);
    doc.text("SOAL ESAI YANG DIUJIKAN", 15, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const qLines = doc.splitTextToSize(currentSub.questionContent, 180);
    qLines.forEach((line: string) => {
      doc.text(line, 15, y);
      y += 4;
    });

    // Render teacher rubric
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 116, 144); // cyan-700
    doc.text("PEDOMAN / RUBRIK JAWABAN STANDAR:", 15, y);

    y += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const rLines = doc.splitTextToSize(currentSub.rubricText, 180);
    rLines.forEach((line: string) => {
      doc.text(line, 15, y);
      y += 3.8;
    });

    y += 2;
    doc.setDrawColor(241, 245, 249);
    doc.line(15, y, 195, y);

    // Render Student Answer
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text("JAWABAN DARI MAHASISWA / SISWA:", 15, y);

    y += 4.5;
    doc.setFont("helvetica", "italic");
    doc.setTextColor(15, 23, 42);
    const saLines = doc.splitTextToSize(`"${currentSub.studentAnswer}"`, 180);
    saLines.forEach((line: string) => {
      doc.text(line, 15, y);
      y += 3.8;
    });

    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);

    // Visual score block
    y += 5;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(15, y, 180, 24, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 24, 3, 3, "S");

    y += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229);
    doc.text(`SKOR AKHIR ESAI: ${editableScore} / 100`, 22, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Detail Sub-Skor:  Konsep: ${editableDetails.conceptUnderstanding}  |  Kelengkapan: ${editableDetails.completeness}  |  Akurasi: ${editableDetails.accuracy}`, 22, y + 6);

    // Write evaluated status in PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(16, 185, 129);
    doc.text("VERIFIED / APPROVED", 188, y, { align: 'right' });

    // Strong lists and improvement recommendations on next chunk
    y += 22;

    const checkPageBreak = (needed: number) => {
      if (y + needed > 275) {
        doc.addPage();
        y = 20;
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 210, 4, "F");
      }
    };

    if (editableStrengths.length > 0) {
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(16, 185, 129); // green
      doc.text("KEKUATAN JAWABAN SISWA (STRENGTHS):", 15, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      editableStrengths.forEach(str => {
        const wrapStr = doc.splitTextToSize(`* ${str}`, 175);
        wrapStr.forEach((l: string) => {
          doc.text(l, 18, y);
          y += 3.8;
        });
      });
      y += 2;
    }

    if (editableWeaknesses.length > 0) {
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(220, 38, 38); // red
      doc.text("CELAH PERBAIKAN (WEAKNESSES):", 15, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      editableWeaknesses.forEach(weak => {
        const wrapWeak = doc.splitTextToSize(`* ${weak}`, 175);
        wrapWeak.forEach((l: string) => {
          doc.text(l, 18, y);
          y += 3.8;
        });
      });
      y += 2;
    }

    if (editableFeedback) {
      checkPageBreak(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(79, 70, 229); // indigo
      doc.text("REKOMENDASI BIMBINGAN AKADEMIK:", 15, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const fbLines = doc.splitTextToSize(editableFeedback, 175);
      fbLines.forEach((line: string) => {
        doc.text(line, 18, y);
        y += 3.8;
      });
      y += 5;
    }

    // Signature stamp
    checkPageBreak(25);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Yogyakarta, ${dateStr}`, 155, y);
    y += 4;
    doc.text("Pemeriksa Akademik,", 155, y);
    y += 15;
    doc.line(155, y, 195, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Sistem CBT Kurikulum Merdeka", 155, y);

    // Save PDF
    const safeStudentName = currentSub.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Ulasan_AI_Esai_${safeStudentName}.pdf`);
  };

  return (
    <div className="w-full text-slate-800 dark:text-slate-100 p-2 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
            <Bot className="w-5 h-5" />
            <span className="text-xs font-black tracking-widest uppercase">Pemberdayaan AI Asesor</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Analisis Rubrik Esai AI</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ukur pemahaman kognitif siswa dalam pengerjaan soal esai berbantuan LLM nasional Kurikulum Merdeka.
          </p>
        </div>
        
        {currentSub && (
          <Button 
            onClick={handlePrintPDF} 
            variant="secondary" 
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-100 dark:border-indigo-800/40 rounded-xl py-2 px-4 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </Button>
        )}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar - Submissions Roster */}
        <div className="lg:col-span-4 glass-card bg-white/40 dark:bg-slate-900/45 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-md">
          <div className="mb-6">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Daftar Pengumpulan Siswa</h3>
            
            {/* Search Input */}
            <div className="relative mb-4">
              <input 
                type="text"
                placeholder="Cari siswa atau subjek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-medium"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* Subject Filters */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-2">
              {subjectsList.map(subj => (
                <button
                  key={subj}
                  onClick={() => setFilterSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    filterSubject === subj 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredSubmissions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <XCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Tidak ada pengumpulan sesuai kriteria.</p>
              </div>
            ) : (
              filteredSubmissions.map(sub => {
                const isSelected = sub.id === selectedSubId;
                const isRated = sub.status === 'evaluated';
                
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                      isSelected 
                      ? 'bg-gradient-to-br from-indigo-500/10 to-sky-500/15 border-indigo-500/40 dark:border-indigo-400/50 shadow-inner' 
                      : 'bg-white/50 dark:bg-slate-950/20 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{sub.subject}</span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub.studentName}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                        isRated 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isRated ? `${sub.score} Poin` : 'Belum'}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate mb-2">
                       {sub.examTitle}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded text-[9px] text-slate-500 dark:text-slate-400">{sub.class}</span>
                      <div className="flex items-center gap-1">
                        <span>Lihat Rubrik</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane - Evaluator Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {currentSub ? (
            <div className="space-y-6">
              
              {/* Workspace Header Panel */}
              <div className="glass-card bg-white/40 dark:bg-slate-900/45 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{currentSub.studentName}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-400 font-semibold items-center">
                      <span className="text-indigo-500 dark:text-indigo-400">{currentSub.class}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span>{currentSub.examTitle}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                    currentSub.status === 'evaluated'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {currentSub.status === 'evaluated' ? 'Sudah Dinilai' : 'Menunggu Nilai'}
                  </span>
                </div>
              </div>

              {/* Rubric and Student Answer Canvas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Rubric guidelines */}
                <div className="bg-amber-50/20 dark:bg-slate-900/30 border border-amber-200/30 dark:border-amber-500/10 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-400">
                    <BookOpen className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase tracking-wider">Soal & Rubrik Pendidik</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Isi Soal Esai</span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed mt-1">
                        {currentSub.questionContent}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Pedoman Kunci Jawaban</span>
                      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-500/10 text-xs text-amber-800 dark:text-amber-300 p-4 rounded-2xl leading-relaxed mt-1.5 font-medium">
                        {currentSub.rubricText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Answer */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/40 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-sky-400">
                      <FileText className="w-5 h-5" />
                      <h4 className="text-sm font-black uppercase tracking-wider">Jawaban Esai Siswa</h4>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Teks Diketik Siswa</span>
                    <p className="text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed mt-2 p-4 bg-white dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      "{currentSub.studentAnswer}"
                    </p>
                  </div>

                  <div className="pt-6">
                    <Button 
                      onClick={handleAIAnalyze} 
                      disabled={isAnalyzing} 
                      className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 text-white rounded-2xl py-3 px-6 text-xs uppercase font-black tracking-widest hover:shadow-lg transition-transform hover:-translate-y-0.5 duration-300 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner className="w-4 h-4 text-white" />
                          <span>Mengevaluasi...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Bot className="w-4 h-4 text-white" />
                          <span>Asesmen Instan AI Gemini</span>
                        </div>
                      )}
                    </Button>
                    
                    {isAnalyzing && (
                      <p className="text-center font-bold text-[10px] text-indigo-600 dark:text-indigo-400 animate-pulse mt-2.5 uppercase tracking-widest">
                        {analysisProgress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Assessment Panel (Interactive Workspace once analyzed/saved) */}
              <div className="glass-card bg-white/40 dark:bg-slate-900/45 border border-slate-200/50 dark:border-white/5 rounded-3xl p-6 shadow-md space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-200/45 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Sliders className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase tracking-wider">Hasil Rubrik Komparatif</h4>
                  </div>
                  
                  {isAnalyzing && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Menghitung...</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Left Column: Grade dials and sliders */}
                  <div className="md:col-span-5 flex flex-col justify-center items-center p-6 bg-slate-50/50 dark:bg-slate-950/25 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Nilai Akhir Konsolidasi</span>
                    <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-indigo-600/30 mb-3 bg-white dark:bg-slate-950 shadow-sm">
                      <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{editableScore}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">skor skala 0 - 100</span>
                    <p className="text-[10.5px] font-medium text-slate-500 leading-relaxed max-w-[190px] mt-3">
                      Tekan tombol AI atau geser sumbu di samping untuk menyesuaikan perolehan poin.
                    </p>
                  </div>

                  {/* Right Column: Editable metric sliders */}
                  <div className="md:col-span-7 space-y-5">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Bobot Penilaian</h5>
                    
                    {/* Concept Understanding */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>Pemahaman Konsep</span>
                        <span>{editableDetails.conceptUnderstanding} Pt</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={editableDetails.conceptUnderstanding}
                        onChange={(e) => handleSliderChange('conceptUnderstanding', parseInt(e.target.value))}
                        className="w-full accent-indigo-600 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Seberapa akurat penarikan inti materi sains/faktual.</p>
                    </div>

                    {/* Completeness */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>Kelengkapan Argumentasi</span>
                        <span>{editableDetails.completeness} Pt</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={editableDetails.completeness}
                        onChange={(e) => handleSliderChange('completeness', parseInt(e.target.value))}
                        className="w-full accent-sky-500 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Banyaknya poin kunci standar pengajaran tercakup.</p>
                    </div>

                    {/* Accuracy of technical details */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span>Akurasi & Istilah Teknis</span>
                        <span>{editableDetails.accuracy} Pt</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={editableDetails.accuracy}
                        onChange={(e) => handleSliderChange('accuracy', parseInt(e.target.value))}
                        className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Kebenaran istilah ilmiah/bahasa terhindar dari miskonsepsi.</p>
                    </div>

                  </div>
                </div>

                {/* Checklist Bullet Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  
                  {/* Strengths list */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">Kekuatan Jawaban (Strengths)</span>
                    </div>

                    <div className="space-y-2">
                      {editableStrengths.length === 0 ? (
                        <p className="text-xs text-slate-400 italic font-semibold">Tarik analisis AI untuk mendata kekuatan.</p>
                      ) : (
                        editableStrengths.map((st, i) => (
                          <div key={i} className="flex gap-2 items-start text-xs text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{st}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Weaknesses list */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-wider">Celah Koreksi (Weaknesses)</span>
                    </div>

                    <div className="space-y-2">
                      {editableWeaknesses.length === 0 ? (
                        <p className="text-xs text-slate-400 italic font-semibold">Tarik analisis AI untuk mendata kelemahan.</p>
                      ) : (
                        editableWeaknesses.map((wk, i) => (
                          <div key={i} className="flex gap-2 items-start text-xs text-slate-600 dark:text-slate-300">
                            <CornerDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{wk}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Substantive constructive feedback */}
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Ulasan bimbingan Guru (Constructive Feedback)</span>
                  <textarea
                    rows={3}
                    value={editableFeedback}
                    onChange={(e) => setEditableFeedback(e.target.value)}
                    placeholder="Tulis saran bimbingan atau analisis otomatis dari AI akan mendarat di sini setelah menekan tombol AI..."
                    className="w-full text-xs font-medium p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 mt-2 leading-relaxed"
                  />
                </div>

                {/* Output controls */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {showSaveSuccess && (
                      <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 animate-bounce">
                        ✔ Hasil Disimpan ke Buku Nilai!
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSaveEvaluation} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-6 text-xs uppercase font-black tracking-wider transition hover:shadow-md"
                    >
                      Simpan Penilaian
                    </Button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 dark:text-slate-500 glass-card bg-white/40 dark:bg-slate-900/40 border p-12 rounded-3xl">
              <User className="w-12 h-12 mx-auto mb-4 text-indigo-500 animate-pulse" />
              <h3 className="text-lg font-black text-slate-700 dark:text-white">Tidak Ada Pengumpulan Terpilih</h3>
              <p className="text-xs max-w-sm mx-auto mt-2 text-slate-500 leading-relaxed font-semibold">
                Silakan pilih salah satu kartu nama siswa di panel kiri untuk membuka lembar kerja rubrik.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResultsAnalysis;
