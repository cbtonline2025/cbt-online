
import React, { useMemo } from 'react';
import { ExamResult, User, QuestionType, Question } from '../../types';
import { QUOTES } from '../../constants';
import Button from '../ui/Button';
import { jsPDF } from 'jspdf';
import { mockExams, mockQuestions } from '../../services/api';
import { Download } from 'lucide-react';

interface ExamEndScreenProps {
  result: ExamResult;
  user?: User | null;
  onReturnToDashboard: () => void;
}

const ExamEndScreen: React.FC<ExamEndScreenProps> = ({ result, user, onReturnToDashboard }) => {
  const quote = useMemo(() => {
    let quoteCategory;
    if (result.score >= 80) {
      quoteCategory = QUOTES.HIGH_PERFORMANCE;
    } else if (result.score >= 50) {
      quoteCategory = QUOTES.MEDIUM_PERFORMANCE;
    } else {
      quoteCategory = QUOTES.LOW_PERFORMANCE;
    }
    return quoteCategory[Math.floor(Math.random() * quoteCategory.length)];
  }, [result.score]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const studentName = user?.fullName || 'Siswa CBT';
    const studentNisn = user?.details?.nisn || user?.username || '-';
    const studentClass = user?.details?.class || '-';
    const studentSchool = user?.details?.school || 'Sekolah CBT';
    const studentCity = user?.details?.city || '-';

    const exam = mockExams.find(e => e.id === result.examId);
    const examTitle = exam ? exam.title : 'Ujian CBT';
    const examSubject = exam ? exam.subject : '-';
    const examPhase = exam ? exam.phase : '-';

    // Safe date format
    const formatDate = (dateInput: Date | string) => {
      if (!dateInput) return '-';
      const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return dateObj.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    let y = 14;

    // TOP decorative line
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, 210, 6, "F");

    // HEADER SURAT
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("LAPORAN HASIL ASESMEN DIGITAL", 15, y);
    
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text("Sistem CBT Kurikulum Merdeka - Laporan Hasil Individu", 15, y);

    y += 5;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, y, 195, y);

    // STUDENT & EXAM INFO SECTION (2 COLUMNS)
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("DATA PESERTA DIDIK", 15, y);
    doc.text("INFORMASI ASESMEN", 110, y);

    // Left Column
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Nama Lengkap", 15, y);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont("helvetica", "bold");
    doc.text(`: ${studentName}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Mata Pelajaran", 110, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(`: ${examSubject}`, 138, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("NISN", 15, y);
    doc.setTextColor(30, 41, 59);
    doc.text(`: ${studentNisn}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Judul Ujian", 110, y);
    doc.setTextColor(30, 41, 59);
    doc.text(`: ${examTitle}`, 138, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Kelas / Fase", 15, y);
    doc.setTextColor(30, 41, 59);
    doc.text(`: ${studentClass} (Fase ${examPhase})`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Waktu Mulai", 110, y);
    doc.setTextColor(30, 41, 59);
    doc.text(`: ${formatDate(result.startedAt)}`, 138, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Sekolah", 15, y);
    doc.setTextColor(30, 41, 59);
    doc.text(`: ${studentSchool}`, 42, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Waktu Selesai", 110, y);
    doc.setTextColor(30, 41, 59);
    doc.text(`: ${formatDate(result.finishedAt)}`, 138, y);

    y += 7;
    doc.setDrawColor(241, 245, 249);
    doc.line(15, y, 195, y);

    // SCORE & STATS BANNER CARD
    y += 5;
    doc.setFillColor(248, 250, 252); // slate-50 background rounded
    doc.roundedRect(15, y, 180, 26, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 26, 3, 3, "S");

    // Compute stats
    let numberCorrect = 0;
    let totalQuestionsCount = result.answers.length;
    let multipleChoiceCount = 0;
    let essayCount = 0;

    result.answers.forEach(ans => {
      const q = mockQuestions.find(question => question.id === ans.questionId);
      if (q) {
        if (q.type === QuestionType.MULTIPLE_CHOICE) {
          multipleChoiceCount++;
          if (q.correctAnswer === ans.answer) {
            numberCorrect++;
          }
        } else {
          essayCount++;
        }
      }
    });

    const isPassed = result.score >= 75;
    const scoreColor = isPassed ? [16, 185, 129] : (result.score >= 50 ? [245, 158, 11] : [239, 68, 68]);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`NILAI AKHIR: ${result.score.toFixed(1)} / 100`, 20, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(isPassed ? 16 : 220, isPassed ? 185 : 95, isPassed ? 129 : 95);
    const passStatusText = isPassed ? "KOMPETEN (LULUS)" : (result.score >= 50 ? "REMEDIAL (CUKUP)" : "REMEDIAL (KURANG)");
    // Alignment to right inside card
    doc.text(passStatusText, 190, y, { align: 'right' });

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    
    let subStatsDetail = `Total Jawaban: ${totalQuestionsCount}`;
    if (multipleChoiceCount > 0) {
      subStatsDetail += `   |   Pilihan Ganda Benar: ${numberCorrect} dari ${multipleChoiceCount} soal`;
    }
    if (essayCount > 0) {
      subStatsDetail += `   |   Esai: ${essayCount} Soal (Menunggu penilaian rubrik guru)`;
    }
    doc.text(subStatsDetail, 20, y);

    // DETAIL JAWABAN SECTION
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("ANALISIS BUTIR JAWABAN PESERTA DIDIK", 15, y);

    y += 3;
    doc.setDrawColor(99, 102, 241); // Indigo theme line
    doc.line(15, y, 195, y);

    // Helpers to write question analysis and handle pagination nicely
    const getOptionLetterAndText = (question: Question, optionId: string): string => {
      if (!question.options) return optionId || '-';
      const index = question.options.findIndex(opt => opt.id === optionId);
      if (index !== -1) {
        const letter = ['A', 'B', 'C', 'D', 'E'][index];
        return `${letter}. ${question.options[index].text}`;
      }
      return optionId || '-';
    };

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > 275) {
        doc.addPage();
        // Decorator top line for next pages too
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, 210, 4, "F");

        y = 15;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Laporan Analisis Hasil Ujian - ${studentName} (${examTitle})`, 15, y);
        
        y += 2;
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y, 195, y);
        y += 8;
      }
    };

    y += 8;

    result.answers.forEach((ans, index) => {
      const q = mockQuestions.find(question => question.id === ans.questionId);
      if (!q) return;

      const qNumText = `${index + 1}. `;
      const qTypeLabel = `[${q.type}]`;
      const qContentText = q.content || '';
      
      // Calculate how much space this question will take on page
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      const questionLines = doc.splitTextToSize(`${qNumText}${qTypeLabel} ${qContentText}`, 180);
      const questionBlockHeight = questionLines.length * 4.2;

      let studentAnsText = '';
      let correctAnsText = '';
      let isAnswerCorrect = false;

      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        studentAnsText = ans.answer ? getOptionLetterAndText(q, ans.answer) : 'Tidak dijawab';
        correctAnsText = getOptionLetterAndText(q, q.correctAnswer);
        isAnswerCorrect = ans.answer === q.correctAnswer;
      } else {
        studentAnsText = ans.answer ? ans.answer : 'Tidak diisi';
        correctAnsText = q.correctAnswer || '';
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const studentAnsLines = doc.splitTextToSize(`Jawaban Anda: ${studentAnsText}`, 170);
      const studentAnsBlockHeight = studentAnsLines.length * 3.8;

      let correctAnsLines: string[] = [];
      let correctAnsBlockHeight = 0;
      if (q.type === QuestionType.ESSAY) {
        correctAnsLines = doc.splitTextToSize(`Panduan Koreksi / Rubrik: ${correctAnsText}`, 170);
        correctAnsBlockHeight = correctAnsLines.length * 3.8;
      } else {
        correctAnsLines = doc.splitTextToSize(`Kunci Jawaban: ${correctAnsText}`, 170);
        correctAnsBlockHeight = correctAnsLines.length * 3.8;
      }

      const totalRequiredHeight = questionBlockHeight + studentAnsBlockHeight + correctAnsBlockHeight + 11; // including spacing

      // Check page break before rendering
      checkPageBreak(totalRequiredHeight);

      // 1. Draw Question Number and Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(`${qNumText}`, 15, y);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241); // indigo-500 for type
      doc.text(`${qTypeLabel} `, 20, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      
      // Print first line with padding
      const restOfFirstLine = questionLines[0].substring(qTypeLabel.length + 1);
      doc.text(restOfFirstLine, 20 + doc.getTextWidth(qTypeLabel) + 1, y);

      // Print subsequent lines
      for(let i = 1; i < questionLines.length; i++) {
        y += 4.2;
        doc.text(questionLines[i], 15, y);
      }

      // 2. Draw Student Answer
      y += 5.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      
      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        if (isAnswerCorrect) {
          doc.setTextColor(16, 185, 129); // emerald-600
          doc.setFont("helvetica", "bold");
          doc.text("✔ ", 18, y);
          doc.setFont("helvetica", "normal");
        } else {
          doc.setTextColor(239, 68, 68); // red-500
          doc.setFont("helvetica", "bold");
          doc.text("✘ ", 18, y);
          doc.setFont("helvetica", "normal");
        }
      } else {
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("✎ ", 18, y);
      }

      // Print first line of student answer
      const firstLineLabel = "Jawaban Siswa: ";
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text(firstLineLabel, 22, y);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      // Clean up label from lines
      doc.text(studentAnsLines[0].substring(14), 22 + doc.getTextWidth(firstLineLabel), y);

      for (let i = 1; i < studentAnsLines.length; i++) {
        y += 3.8;
        doc.text(studentAnsLines[i], 22, y);
      }

      // 3. Draw Correct Answer / Guide
      y += 4.2;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      const guideLabel = q.type === QuestionType.MULTIPLE_CHOICE ? "Kunci Jawaban: " : "Panduan Rubrik/Kunci: ";
      doc.text(guideLabel, 22, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(correctAnsLines[0].substring(q.type === QuestionType.MULTIPLE_CHOICE ? 15 : 26), 22 + doc.getTextWidth(guideLabel), y);

      for (let i = 1; i < correctAnsLines.length; i++) {
        y += 3.8;
        doc.text(correctAnsLines[i], 22, y);
      }

      // Draw light spacing border
      y += 6;
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y, 195, y);
      y += 6;
    });

    // SIGNATURE BLOCK
    checkPageBreak(32);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    
    const cityText = studentCity && studentCity !== '-' ? studentCity : "Jakarta";
    const dateToday = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    doc.text(`${cityText}, ${dateToday}`, 150, y); y += 4;
    doc.text("Mengetahui,", 150, y); y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Proktor / Guru Mata Pelajaran,", 150, y);
    
    y += 18; // space for physical sign
    doc.line(150, y, 190, y); y += 4;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("NIP / Tanda Tangan Proktor", 150, y);

    // Save final document
    const cleanStudentName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Hasil_Ujian_${cleanStudentName}_${result.examId}.pdf`);
  };

  return (
    <div className="w-full max-w-2xl text-center bg-white/20 dark:bg-slate-800/40 backdrop-blur-2xl p-8 rounded-2xl shadow-lg border border-white/30 dark:border-slate-700/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-emerald-500 dark:text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Ujian Telah Selesai</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">Terima kasih telah menyelesaikan ujian. Jawaban Anda telah berhasil disimpan.</p>

      <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg italic mb-6">
        <p className="text-lg text-slate-700 dark:text-slate-200">"{quote}"</p>
      </div>

      <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl mb-6 border border-slate-200/50 dark:border-slate-800/80">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold mb-1">Skor Diperoleh</span>
        <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{result.score.toFixed(1)} <span className="text-base text-slate-400 font-bold">/ 100</span></span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 my-6">
        Anda dapat mengunduh salinan laporan hasil ujian Anda di bawah ini sebagai dokumen resmi atau membiarkannya disimpan di sistem.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button onClick={handleDownloadPDF} variant="secondary" className="flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Unduh Laporan PDF
        </Button>
        <Button onClick={onReturnToDashboard}>
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
};

export default ExamEndScreen;
