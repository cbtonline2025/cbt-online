import React, { useState } from 'react';
import { Clock, BookOpen, Layers, Settings, CheckCircle2, AlertTriangle, Hourglass, ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import { Exam } from '../../types';
import { mockExams, updateExamDuration, deleteMultipleExams } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { motion, AnimatePresence } from 'motion/react';

const ExamSettings: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>(mockExams);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [durationType, setDurationType] = useState<'per-exam' | 'per-question'>('per-exam');
    const [durationMinutes, setDurationMinutes] = useState<number>(60);
    const [durationSecondsPerQuestion, setDurationSecondsPerQuestion] = useState<number>(60);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
    const [isBulkDeletingConfirmOpen, setIsBulkDeletingConfirmOpen] = useState(false);

    const handleBulkDeleteExams = async () => {
        try {
            const success = await deleteMultipleExams(selectedExamIds);
            if (success) {
                setExams(prev => prev.filter(e => !selectedExamIds.includes(e.id)));
                setSelectedExamIds([]);
            } else {
                alert("Gagal menghapus ujian terpilih.");
            }
        } catch (error) {
            console.error("Gagal menghapus ujian massal:", error);
        } finally {
            setIsBulkDeletingConfirmOpen(false);
        }
    };

    const handleOpenSettings = (exam: Exam) => {
        setSelectedExam(exam);
        setDurationType(exam.durationType || 'per-exam');
        setDurationMinutes(exam.durationMinutes || 60);
        setDurationSecondsPerQuestion(exam.durationSecondsPerQuestion || 60);
        setSuccessMessage(null);
    };

    const handleSave = async () => {
        if (!selectedExam) return;
        setIsSaving(true);
        try {
            const success = await updateExamDuration(
                selectedExam.id,
                durationType,
                durationMinutes,
                durationSecondsPerQuestion
            );
            if (success) {
                // Update local list
                setExams(prev => prev.map(e => e.id === selectedExam.id ? {
                    ...e,
                    durationType,
                    durationMinutes,
                    durationSecondsPerQuestion
                } : e));
                setSuccessMessage("Pengaturan durasi ujian berhasil disimpan!");
                setTimeout(() => {
                    setSelectedExam(null);
                    setSuccessMessage(null);
                }, 1500);
            } else {
                alert("Gagal memperbarui pengaturan ujian.");
            }
        } catch (error) {
            console.error("Error saving exam settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 mb-6">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        Pengaturan Durasi & Sesi Ujian
                    </h3>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                        Sesuaikan tipe durasi ujian secara global (per-ujian) atau berikan pembatasan waktu per butir soal (per-soal).
                    </p>
                </div>
            </div>

            {/* Bulk Select & Delete Action Bar */}
            {exams.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={exams.length > 0 && exams.every(e => selectedExamIds.includes(e.id))}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedExamIds(exams.map(ex => ex.id));
                                    } else {
                                        setSelectedExamIds([]);
                                    }
                                }}
                                className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                            />
                            Pilih Semua Sesi Ujian ({exams.length} Paket)
                        </label>
                        
                        {selectedExamIds.length > 0 && (
                            <span className="text-[11px] bg-indigo-50 dark:bg-indigo-950/55 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-black border border-indigo-150/30 dark:border-indigo-900/30 animate-pulse">
                                {selectedExamIds.length} Terpilih
                            </span>
                        )}
                    </div>

                    {selectedExamIds.length > 0 && (
                        <Button
                            type="button"
                            onClick={() => setIsBulkDeletingConfirmOpen(true)}
                            className="w-full sm:w-auto py-2.5 px-4 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/10 active:scale-[0.98] flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer border border-rose-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                            Hapus {selectedExamIds.length} Sesi Ujian Terpilih
                        </Button>
                    )}
                </div>
            )}

            {exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] w-full">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/30 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Belum Ada Sesi Ujian</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                        Anda dapat membuat paket/sesi ujian baru dari Bank Soal di bawah menu navigasi utama.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam, index) => {
                        const isPerQuestion = exam.durationType === 'per-question';
                        return (
                            <motion.div
                                key={exam.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                                
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedExamIds.includes(exam.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setSelectedExamIds(prev => 
                                                        checked ? [...prev, exam.id] : prev.filter(id => id !== exam.id)
                                                    );
                                                }}
                                                className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer transition-colors"
                                            />
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150/30 dark:border-indigo-900/30">
                                                Fase {exam.phase}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-150/30 dark:border-emerald-900/30">
                                                {exam.subject}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                                        {exam.title}
                                    </h4>

                                    <div className="space-y-3 my-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-550 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-400" /> Jumlah Soal</span>
                                            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{exam.questionIds.length} butir</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-550 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5"><Hourglass className="w-4 h-4 text-slate-400" /> Tipe Durasi</span>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] uppercase font-black tracking-wider ${isPerQuestion ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                                                {isPerQuestion ? 'Per Butir Soal' : 'Per Sesi Ujian'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-550 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Durasi Aktif</span>
                                            <span className="font-mono text-slate-800 dark:text-slate-200 font-black">
                                                {isPerQuestion 
                                                    ? `${exam.durationSecondsPerQuestion || 60} Detik / Soal` 
                                                    : `${exam.durationMinutes} Menit`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleOpenSettings(exam)}
                                    className="w-full mt-4 rounded-xl py-3 font-bold text-xs uppercase tracking-widest bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-850 dark:hover:bg-indigo-600/20 dark:hover:text-indigo-400 border dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Konfigurasi Durasi</span>
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Slide up settings modal */}
            <AnimatePresence>
                {selectedExam && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-800 dark:text-white"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/25">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                            Ubah Aturan Durasi Ujian
                                        </h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                                            {selectedExam.title}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedExam(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {successMessage ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-8 text-center"
                                    >
                                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-450">{successMessage}</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Selector Type Cards */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">Tipe Konfigurasi Durasi</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setDurationType('per-exam')}
                                                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${durationType === 'per-exam' ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-505 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-transparent border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-950/20'}`}
                                                >
                                                    <Hourglass className="h-5 w-5 mb-2" />
                                                    <span className="block font-black text-xs uppercase tracking-wider">Per Sesi Ujian</span>
                                                    <span className="block text-[10px] mt-1 opacity-85 font-medium">Batas waktu global untuk semua soal.</span>
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    onClick={() => setDurationType('per-question')}
                                                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${durationType === 'per-question' ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-505 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-transparent border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-950/20'}`}
                                                >
                                                    <Clock className="h-5 w-5 mb-2" />
                                                    <span className="block font-black text-xs uppercase tracking-wider">Per Butir Soal</span>
                                                    <span className="block text-[10px] mt-1 opacity-85 font-medium">Batas waktu individual per-butir soal.</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inputs Container */}
                                        <motion.div 
                                            layout
                                            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800"
                                        >
                                            {durationType === 'per-exam' ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-3"
                                                >
                                                    <Input
                                                        id="durationMinutes"
                                                        label="Batas Waktu Sesi (Menit)"
                                                        type="number"
                                                        value={durationMinutes}
                                                        onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                                                        placeholder="Contoh: 90"
                                                    />
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                        *Siswa memiliki total durasi pengerjaan tertulis untuk menyelesaikan semua {selectedExam?.questionIds.length || 0} soal.
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-3"
                                                >
                                                    <Input
                                                        id="durationSeconds"
                                                        label="Batas Waktu per-Soal (Detik)"
                                                        type="number"
                                                        value={durationSecondsPerQuestion}
                                                        onChange={(e) => setDurationSecondsPerQuestion(Math.max(5, parseInt(e.target.value) || 0))}
                                                        placeholder="Contoh: 60"
                                                    />
                                                    <p className="text-[10px] text-orange-500 dark:text-orange-400 font-bold flex items-start gap-1">
                                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                        <span>Timer tersendiri akan berjalan per nomor. Jika habis, siswa otomatis dialihkan ke nomor berikutnya.</span>
                                                    </p>
                                                </motion.div>
                                            )}
                                        </motion.div>

                                        {/* Prompt Details Summary info */}
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
                                            <BookOpen className="w-5 h-5 shrink-0" />
                                            <div>
                                                <p className="font-bold">Estimasi Total Pengerjaan Ujian</p>
                                                <p className="text-[10px] opacity-90 mt-0.5">
                                                    {durationType === 'per-exam'
                                                        ? `Siswa memiliki waktu maksimal ${durationMinutes} menit.`
                                                        : `Total estimasi maksimal: ${Math.ceil(((selectedExam?.questionIds.length || 0) * durationSecondsPerQuestion) / 60)} menit (${selectedExam?.questionIds.length || 0} soal x ${durationSecondsPerQuestion} detik).`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedExam(null)}
                                                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="py-2.5 px-6 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-505 shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
                                            >
                                                {isSaving ? "Menyimpan..." : "Simpan Aturan"}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Delete Confirmation Modal */}
            <AnimatePresence>
                {isBulkDeletingConfirmOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-800 dark:text-white"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 dark:text-white"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 flex-shrink-0 animate-pulse">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                            Konfirmasi Hapus Massal Paket Ujian
                                        </h3>
                                        <p className="text-xs text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                            Menghapus {selectedExamIds.length} Sesi Ujian Sekaligus
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-650 dark:text-slate-300 mb-6 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                                    Apakah Anda yakin ingin menghapus <span className="font-bold text-rose-600 dark:text-rose-400">{selectedExamIds.length} ujian terpilih</span> secara massal? Tindakan ini akan menghapus semua paket ujian terpilih dan konfigurasinya secara permanen dan tidak dapat dibatalkan.
                                </p>
                                
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsBulkDeletingConfirmOpen(false)}
                                        className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <Button
                                        onClick={handleBulkDeleteExams}
                                        className="py-2.5 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 active:scale-[0.98] cursor-pointer"
                                    >
                                        Ya, Hapus Semua ({selectedExamIds.length})
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExamSettings;
