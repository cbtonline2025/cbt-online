import React, { useState, useRef, useContext } from 'react';
import * as XLSX from 'xlsx';
import { User, StudentData, Role } from '../../types';
import { 
  mockUsers, deleteStudentUser, addBulkStudents,
  addTeacherOrAdminUser, deleteTeacherOrAdminUser 
} from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Upload, Trash2, Search, Download, 
  CheckCircle, AlertCircle, RefreshCw, FileSpreadsheet,
  GraduationCap, ClipboardList, MapPin, School, ShieldAlert,
  ShieldCheck, BookOpen, UserCog, Key
} from 'lucide-react';
import { AuthContext } from '../../App';


const StudentManager: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [activeManagerTab, setActiveManagerTab] = useState<'students' | 'teachers'>('students');

    // Force component state update when mockUsers changes
    const [students, setStudents] = useState<User[]>(() => 
        mockUsers.filter(u => u.role === 'Siswa')
    );
    const [users, setUsers] = useState<User[]>(() => [...mockUsers]);

    const [searchTerm, setSearchTerm] = useState('');
    const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isTeacherManualOpen, setIsTeacherManualOpen] = useState(false);
    
    // Manual Student Form State
    const [manualStudent, setManualStudent] = useState<Partial<StudentData>>({
        nisn: '',
        fullName: '',
        class: '',
        password: '',
        school: '',
        city: '',
        province: ''
    });

    // Manual Teacher Form State
    const [manualTeacher, setManualTeacher] = useState({
        username: '',
        fullName: '',
        password: '',
        role: Role.TEACHER,
        subject: 'Fisika'
    });

    // File processing states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importResult, setImportResult] = useState<{
        success: number;
        error: number;
        duplicates: string[];
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshStudentList = () => {
        setStudents(mockUsers.filter(u => u.role === 'Siswa'));
        setUsers([...mockUsers]);
    };

    // Filtered students
    const filteredStudents = students.filter(student => {
        const query = searchTerm.toLowerCase();
        return (
            student.fullName.toLowerCase().includes(query) ||
            student.username.toLowerCase().includes(query) ||
            (student.details?.class?.toLowerCase() || '').includes(query)
        );
    });

    // Filtered teachers/admins
    const filteredTeachersAndAdmins = users.filter(usr => {
        if (usr.role === 'Siswa') return false;
        const query = teacherSearchTerm.toLowerCase();
        return (
            usr.fullName.toLowerCase().includes(query) ||
            usr.username.toLowerCase().includes(query) ||
            (usr.details?.subject?.toLowerCase() || '').includes(query) ||
            usr.role.toLowerCase().includes(query)
        );
    });

    // Handle Teacher Submit
    const handleTeacherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualTeacher.username || !manualTeacher.fullName) {
            alert('Nama Lengkap dan Username wajib diisi.');
            return;
        }

        const result = addTeacherOrAdminUser({
            username: manualTeacher.username,
            fullName: manualTeacher.fullName,
            password: manualTeacher.password,
            role: manualTeacher.role,
            subject: manualTeacher.role === Role.TEACHER ? manualTeacher.subject : 'Semua Mapel'
        });

        if (result.success) {
            alert(result.message);
            setManualTeacher({
                username: '',
                fullName: '',
                password: '',
                role: Role.TEACHER,
                subject: 'Fisika'
            });
            setIsTeacherManualOpen(false);
            refreshStudentList();
        } else {
            alert(result.message);
        }
    };

    // Handle Teacher Delete
    const handleDeleteTeacherOrAdmin = (username: string, fullName: string) => {
        if (currentUser && currentUser.username === username) {
            alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
            return;
        }
        if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${fullName} (${username})?`)) {
            const wasDeleted = deleteTeacherOrAdminUser(username);
            if (wasDeleted) {
                refreshStudentList();
            } else {
                alert('Gagal menghapus pengguna.');
            }
        }
    };

    // Handle Manual Add
    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualStudent.fullName || !manualStudent.class) {
            alert('Nama Lengkap dan Kelas wajib diisi.');
            return;
        }

        const username = manualStudent.nisn?.trim() || Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const rawPassword = manualStudent.password?.trim() || Math.floor(100000 + Math.random() * 900000).toString();

        const result = addBulkStudents([{
            nisn: username,
            username: username,
            fullName: manualStudent.fullName.trim(),
            class: manualStudent.class.trim(),
            school: manualStudent.school?.trim() || 'SMA Negeri 1 Jakarta',
            city: manualStudent.city?.trim() || 'Jakarta',
            province: manualStudent.province?.trim() || 'DKI Jakarta',
            password: rawPassword
        }]);

        if (result.successCount > 0) {
            alert('Siswa berhasil ditambahkan secara manual!');
            setManualStudent({
                nisn: '',
                fullName: '',
                class: '',
                password: '',
                school: '',
                city: '',
                province: ''
            });
            setIsManualOpen(false);
            refreshStudentList();
        } else if (result.duplicates.length > 0) {
            alert(`Siswa gagal ditambahkan karena username/NISN "${username}" sudah digunakan.`);
        } else {
            alert('Terjadi kesalahan saat menambahkan siswa.');
        }
    };

    // Handle Delete
    const handleDeleteStudent = (username: string, fullName: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus siswa ${fullName} (${username})?`)) {
            const wasDeleted = deleteStudentUser(username);
            if (wasDeleted) {
                refreshStudentList();
            } else {
                alert('Gagal menghapus siswa.');
            }
        }
    };

    // Download EXCEL Template
    const handleDownloadTemplate = () => {
        try {
            const header = ['username', 'fullName', 'password', 'class', 'school', 'city', 'province'];
            const sampleData = [
                ['0012345678', 'Ahmad Prasetyo', 'akm_f23', 'XII-MIPA-1', 'SMA Negeri 1 Jakarta', 'Jakarta Pusat', 'DKI Jakarta'],
                ['0087654321', 'Aisyah Putri', 'pin7788', 'XI-IPS-2', 'SMA Negeri 1 Jakarta', 'Jakarta Pusat', 'DKI Jakarta'],
                ['user_demo_01', 'Budi Santoso', 'sandi123', 'X-A', 'SMA Negeri 1 Jakarta', 'Jakarta Pusat', 'DKI Jakarta']
            ];
            
            const wsData = [header, ...sampleData];
            const worksheet = XLSX.utils.aoa_to_sheet(wsData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Format Impor Siswa");
            
            // Set column widths
            worksheet['!cols'] = [
                { wch: 15 }, // username
                { wch: 25 }, // fullName
                { wch: 15 }, // password
                { wch: 12 }, // class
                { wch: 25 }, // school
                { wch: 15 }, // city
                { wch: 15 }  // province
            ];

            XLSX.writeFile(workbook, "format_impor_siswa_cbt.xlsx");
        } catch (err: any) {
            alert("Gagal mengunduh template: " + err.message);
        }
    };

    // Drag and Drop files
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    // Parse Excel File
    const processFile = (file: File) => {
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            setErrorMessage('Format berkas tidak valid. Harap gunakan file berekstensi .xlsx atau .xls');
            setSelectedFile(null);
            setImportResult(null);
            return;
        }

        setSelectedFile(file);
        setErrorMessage(null);
        setImportResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Get row data
                const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];
                if (rawData.length === 0) {
                    throw new Error('Berkas Excel kosong atau tidak memiliki baris data.');
                }

                // Header validation (checking required headers)
                const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
                const required = ['username', 'fullName', 'class'];
                const missing = required.filter(h => !headerRow.includes(h));

                if (missing.length > 0) {
                    throw new Error(`Kolom wajib tidak ditemukan: ${missing.join(', ')}. Pastikan baris pertama berisi header kolom.`);
                }

                // Map into StudentData structure
                const studentsToImport: StudentData[] = rawData.map(row => ({
                    nisn: String(row.username || row.nisn || '').trim(),
                    username: String(row.username || '').trim(),
                    fullName: String(row.fullName || row.name || row.nama || '').trim(),
                    class: String(row.class || row.kelas || '').trim(),
                    password: String(row.password || row.sandi || row.pin || '').trim() || undefined,
                    school: String(row.school || row.sekolah || '').trim() || undefined,
                    city: String(row.city || row.kota || '').trim() || undefined,
                    province: String(row.province || row.provinsi || '').trim() || undefined,
                })).filter(s => s.username && s.fullName);

                if (studentsToImport.length === 0) {
                    throw new Error('Tidak ada baris data siswa yang valid untuk diimpor.');
                }

                // Save to simulated storage
                const result = addBulkStudents(studentsToImport);
                setImportResult({
                    success: result.successCount,
                    error: result.errorCount,
                    duplicates: result.duplicates
                });
                
                refreshStudentList();
            } catch (err: any) {
                setErrorMessage(err.message || 'Gagal memproses file Excel.');
                setSelectedFile(null);
            }
        };
        reader.onerror = () => {
            setErrorMessage('Gagal membaca file dari penyimpanan.');
        };
        reader.readAsArrayBuffer(file);
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setImportResult(null);
        setErrorMessage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Tab Swapping Header for Proctor */}
            {currentUser?.role === 'Proktor' && (
                <div className="flex bg-white/80 dark:bg-slate-950/40 shadow-sm p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 max-w-sm">
                    <button
                        onClick={() => setActiveManagerTab('students')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                            activeManagerTab === 'students'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>SISWA ({students.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveManagerTab('teachers')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                            activeManagerTab === 'teachers'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <UserCog className="w-4 h-4" />
                        <span>GURU & ADM ({users.filter(u => u.role !== 'Siswa').length})</span>
                    </button>
                </div>
            )}

            {/* Conditionally Render TAB: Students or TAB: Teachers */}
            {(activeManagerTab === 'students' || currentUser?.role !== 'Proktor') ? (
                <div className="space-y-8">
                    {/* Header section with Stats */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/25 rounded-2xl flex items-center justify-center border-2 border-indigo-500/20 shadow-inner">
                                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Registrasi Siswa</h1>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Total Terdaftar: {students.length} Siswa</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <Button 
                                variant="secondary" 
                                onClick={() => setIsManualOpen(!isManualOpen)}
                                className="rounded-2xl border-none bg-white/60 dark:bg-slate-800/60 shadow-sm flex items-center gap-2 font-bold py-3.5 px-6 shrink-0"
                            >
                                <UserPlus className="w-4 h-4 text-indigo-500" />
                                <span>TAMBAH MANDIRI</span>
                            </Button>
                            <Button 
                                onClick={handleDownloadTemplate}
                                className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-white flex items-center gap-2 font-black py-3.5 px-6 shrink-0"
                            >
                                <Download className="w-4 h-4" />
                                <span className="tracking-wider font-bold">UNDUH FORMAT EXCEL</span>
                            </Button>
                        </div>
                    </div>

                    {/* Manual Form Area (Dropdown drawer with slick height animation) */}
                    <AnimatePresence>
                        {isManualOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <form onSubmit={handleManualSubmit} className="bg-white/40 dark:bg-slate-900/40 p-8 rounded-3xl border border-white/60 dark:border-white/5 space-y-6 shadow-sm">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider pl-1 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-emerald-500" />
                                        Formulir Input Siswa Baru
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap *</label>
                                            <Input 
                                                type="text"
                                                placeholder="Contoh: Ahmad Fadillah"
                                                value={manualStudent.fullName || ''}
                                                onChange={(e) => setManualStudent({...manualStudent, fullName: e.target.value})}
                                                required
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Username / NISN *</label>
                                            <Input 
                                                type="text"
                                                placeholder="Gunakan angka unik (NISN)"
                                                value={manualStudent.nisn || ''}
                                                onChange={(e) => setManualStudent({...manualStudent, nisn: e.target.value, username: e.target.value})}
                                                required
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Kelas *</label>
                                            <Input 
                                                type="text"
                                                placeholder="Contoh: XII-IPA-1 atau IX-B"
                                                value={manualStudent.class || ''}
                                                onChange={(e) => setManualStudent({...manualStudent, class: e.target.value})}
                                                required
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Sandi / PIN Akun</label>
                                            <Input 
                                                type="text"
                                                placeholder="Dikosongkan untuk acak"
                                                value={manualStudent.password || ''}
                                                onChange={(e) => setManualStudent({...manualStudent, password: e.target.value})}
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-1.5"><School className="w-3 h-3" /> Asal Sekolah</label>
                                            <Input 
                                                type="text"
                                                placeholder="SMA Negeri 1 Jakarta"
                                                value={manualStudent.school || ''}
                                                onChange={(e) => setManualStudent({...manualStudent, school: e.target.value})}
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Kota</label>
                                            <Input 
                                                type="text"
                                                placeholder="Jakarta Pusat"
                                                value={manualStudent.city || ''}
                                                onChange={(e) => setManualStudent({...manualStudent, city: e.target.value})}
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Provinsi</label>
                                            <Input 
                                                type="text"
                                                placeholder="DKI Jakarta"
                                                value={manualStudent.province || ''}
                                                onChange={(e) => setManualStudent({...manualStudent, province: e.target.value})}
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                                        <Button 
                                            variant="secondary" 
                                            type="button" 
                                            onClick={() => setIsManualOpen(false)}
                                            className="rounded-xl"
                                        >
                                            Batal
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                        >
                                            Simpan Registrasi Siswa
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Drag & Drop Excel Import Workspace */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* File Upload Box */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                Impor Masal via Excel (.xlsx / .xls)
                            </label>
                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed p-8 rounded-3xl min-h-[220px] flex flex-col items-center justify-center text-center transition-all duration-300 relative ${
                                    isDragging 
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]' 
                                        : selectedFile 
                                            ? 'border-emerald-500 bg-emerald-500/5 dark:border-emerald-500/40' 
                                            : 'border-slate-300/80 dark:border-slate-700/80 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/10'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".xlsx,.xls"
                                    className="hidden" 
                                />
                                
                                {selectedFile ? (
                                    <div className="space-y-4">
                                        <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[280px]">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                                            >
                                                Ganti Berkas
                                            </button>
                                            <span className="text-slate-300">|</span>
                                            <button 
                                                onClick={handleClearFile}
                                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 cursor-pointer w-full h-full" onClick={() => fileInputRef.current?.click()}>
                                        <div className="mx-auto w-12 h-12 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/10">
                                            <Upload className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                                Pilih Berkas Excel Siswa
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-bold mt-1 max-w-[280px] mx-auto leading-relaxed">
                                                Seret dan letakkan lembar Excel di area ini atau klik untuk memilih file (.xlsx / .xls)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live Processing Summary / Instructions */}
                        <div className="space-y-4 justify-between flex flex-col">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                                    Status Pemrosesan Impor
                                </label>
                                <div className="bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/60 dark:border-white/5 min-h-[220px] flex flex-col justify-center">
                                    {importResult ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                                                <CheckCircle className="w-5 h-5 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-black">Data Berhasil Dimuat!</p>
                                                    <p className="text-[10px] font-bold opacity-80 uppercase mt-0.5">Siswa Baru Terdaftar: {importResult.success} Akun</p>
                                                </div>
                                            </div>
                                            
                                            {importResult.duplicates.length > 0 && (
                                                <div className="flex items-start gap-3 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 text-amber-800 dark:text-amber-300">
                                                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-black">Terdeteksi Duplikasi ({importResult.duplicates.length} Baris):</p>
                                                        <p className="text-[9px] font-mono leading-relaxed opacity-90 mt-1 max-h-[60px] overflow-y-auto custom-scrollbar">
                                                            NISN/Username telah terdaftar: {importResult.duplicates.join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : errorMessage ? (
                                        <div className="flex items-center gap-3 bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20 text-rose-800 dark:text-rose-400">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-black">Kegagalan Unggah Berkas</p>
                                                <p className="text-[10px] font-bold opacity-90 mt-0.5">{errorMessage}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-400">
                                            <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-800 mx-auto mb-3" />
                                            <p className="text-xs font-bold uppercase tracking-wider">Menunggu Berkas Excel</p>
                                            <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto mt-1 leading-normal">
                                                Unggah format berkas yang sesuai instruksi. CBT akan langsung menyegarkan database lokal secara dinamis.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List and Search of current students */}
                    <div className="space-y-4 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                                Database Registrasi Siswa ({filteredStudents.length})
                            </h3>
                            
                            <div className="w-full md:w-80">
                                <Input 
                                    placeholder="Cari nama, NISN, atau kelas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    icon={<Search className="w-4 h-4 text-slate-400" />}
                                    className="rounded-2xl py-3 border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40"
                                />
                            </div>
                        </div>

                        {filteredStudents.length > 0 ? (
                            <div className="bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/40 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                <th className="py-4.5 px-6">Nama Lengkap</th>
                                                <th className="py-4.5 px-6">Username / NISN</th>
                                                <th className="py-4.5 px-6">Kelas</th>
                                                <th className="py-4.5 px-6">Password / PIN</th>
                                                <th className="py-4.5 px-6">Asal Sekolah</th>
                                                <th className="py-4.5 px-6 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/20 dark:divide-slate-850/50 text-xs font-semibold text-slate-700 dark:text-slate-350">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                            <span className="text-[10px] font-black text-indigo-500">{student.fullName[0]}</span>
                                                        </div>
                                                        {student.fullName}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <code className="font-mono bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg border border-indigo-150 dark:border-indigo-800/10">
                                                            {student.username}
                                                        </code>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="font-bold text-slate-600 dark:text-slate-400">
                                                            {student.details?.class || 'Umum'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-55/10 dark:bg-emerald-900/10 py-1 px-2.5 rounded-lg border border-emerald-500/10">
                                                            {student.password || 'Terproteksi'}
                                                        </code>
                                                    </td>
                                                    <td className="py-4 px-6 italic text-slate-400 dark:text-slate-500">
                                                        {student.details?.school || 'SMA Negeri 1 Jakarta'}
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button 
                                                            onClick={() => handleDeleteStudent(student.username, student.fullName)}
                                                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all hover:scale-105 active:scale-95"
                                                            title="Hapus berkas siswa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50/30 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <Users className="w-12 h-12 text-slate-300 dark:text-slate-800 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Tidak ada data siswa ditemukan</p>
                                <p className="text-xs text-slate-400">Harap ketikkan nama atau kelas lain, atau lakukan impor masal.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Header section with Stats */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/25 rounded-2xl flex items-center justify-center border-2 border-indigo-500/20 shadow-inner">
                                <UserCog className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Guru & Admin</h2>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Guru: {users.filter(u => u.role === 'Guru').length} | Proktor: {users.filter(u => u.role === 'Proktor').length}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <Button 
                                onClick={() => setIsTeacherManualOpen(!isTeacherManualOpen)}
                                className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-white flex items-center gap-2 font-black py-3.5 px-6 shrink-0"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="tracking-wider">TAMBAH AKSES BARU</span>
                            </Button>
                        </div>
                    </div>

                    {/* Manual Form Area */}
                    <AnimatePresence>
                        {isTeacherManualOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <form onSubmit={handleTeacherSubmit} className="bg-white/40 dark:bg-slate-900/40 p-8 rounded-3xl border border-white/60 dark:border-white/5 space-y-6 shadow-sm">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider pl-1 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-indigo-500" />
                                        Formulir Akses Pendidik Baru
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap *</label>
                                            <Input 
                                                type="text"
                                                placeholder="Contoh: Drs. Hermawan"
                                                value={manualTeacher.fullName}
                                                onChange={(e) => setManualTeacher({...manualTeacher, fullName: e.target.value})}
                                                required
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Username / ID Login *</label>
                                            <Input 
                                                type="text"
                                                placeholder="Contoh: hermawan12"
                                                value={manualTeacher.username}
                                                onChange={(e) => setManualTeacher({...manualTeacher, username: e.target.value})}
                                                required
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Sandi / PIN Akun</label>
                                            <Input 
                                                type="text"
                                                placeholder="Dikosongkan untuk acak"
                                                value={manualTeacher.password}
                                                onChange={(e) => setManualTeacher({...manualTeacher, password: e.target.value})}
                                                className="rounded-xl border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-800/50 font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Hak Akses / Peran</label>
                                            <select 
                                                value={manualTeacher.role} 
                                                onChange={(e) => setManualTeacher({...manualTeacher, role: e.target.value as any})}
                                                className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-850 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-bold"
                                            >
                                                <option value={Role.TEACHER}>Guru (Akses Mapel Terbatas)</option>
                                                <option value={Role.ADMIN}>Proktor (Akses Admin Utama)</option>
                                            </select>
                                        </div>
                                        {manualTeacher.role === Role.TEACHER && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> Mata Pelajaran Yang Diampu</label>
                                                <select 
                                                    value={manualTeacher.subject} 
                                                    onChange={(e) => setManualTeacher({...manualTeacher, subject: e.target.value})}
                                                    className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-850 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 font-bold"
                                                >
                                                    <option value="Fisika font-bold">Fisika</option>
                                                    <option value="IPA">IPA</option>
                                                    <option value="Bahasa Inggris">Bahasa Inggris</option>
                                                    <option value="Biologi">Biologi</option>
                                                    <option value="Geografi">Geografi</option>
                                                    <option value="IPS">IPS</option>
                                                    <option value="Seni Budaya">Seni Budaya</option>
                                                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                                                    <option value="Semua Mapel">Semua Mapel</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                                        <Button 
                                            variant="secondary" 
                                            type="button" 
                                            onClick={() => setIsTeacherManualOpen(false)}
                                            className="rounded-xl"
                                        >
                                            Batal
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                                        >
                                            Simpan Akses Baru
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* List and Search */}
                    <div className="space-y-4 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                                Akses Guru & Proktor ({filteredTeachersAndAdmins.length})
                            </h3>
                            
                            <div className="w-full md:w-80">
                                <Input 
                                    placeholder="Cari nama, username, atau mapel..."
                                    value={teacherSearchTerm}
                                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                                    icon={<Search className="w-4 h-4 text-slate-400" />}
                                    className="rounded-2xl py-3 border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40"
                                />
                            </div>
                        </div>

                        {filteredTeachersAndAdmins.length > 0 ? (
                            <div className="bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/40 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                <th className="py-4.5 px-6">Nama Lengkap</th>
                                                <th className="py-4.5 px-6">Username Login</th>
                                                <th className="py-4.5 px-6">Hak Akses / Peran</th>
                                                <th className="py-4.5 px-6">Mata Pelajaran (Mapel)</th>
                                                <th className="py-4.5 px-6">Sandi / PIN Akun</th>
                                                <th className="py-4.5 px-6 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/20 dark:divide-slate-850/50 text-xs font-semibold text-slate-700 dark:text-slate-350">
                                            {filteredTeachersAndAdmins.map((usr) => (
                                                <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                            <span className="text-[10px] font-black text-indigo-500">{usr.fullName[0]}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{usr.fullName}</p>
                                                            {currentUser?.username === usr.username && (
                                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wide">Aktif (Anda)</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <code className="font-mono bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg border border-indigo-150 dark:border-indigo-800/10">
                                                            {usr.username}
                                                        </code>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {usr.role === 'Proktor' ? (
                                                            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">
                                                                <ShieldCheck className="w-3 h-3" /> PROKTOR
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">
                                                                <BookOpen className="w-3 h-3" /> GURU
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="font-bold text-slate-600 dark:text-slate-400">
                                                            {usr.details?.subject || 'Semua Mapel'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <code className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-55/10 dark:bg-emerald-900/10 py-1 px-2.5 rounded-lg border border-emerald-500/10">
                                                            {usr.password || 'Terproteksi'}
                                                        </code>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button 
                                                            disabled={currentUser?.username === usr.username}
                                                            onClick={() => handleDeleteTeacherOrAdmin(usr.username, usr.fullName)}
                                                            className={`p-2 rounded-xl transition-all ${
                                                                currentUser?.username === usr.username 
                                                                    ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-500 hover:scale-105 active:scale-95'
                                                            }`}
                                                            title="Hapus akun pendidik"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-50/30 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <Users className="w-12 h-12 text-slate-300 dark:text-slate-800 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Tidak ada pengampu atau proktor ditemukan</p>
                                <p className="text-xs text-slate-400">Harap ketikkan kata kunci lain.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentManager;
