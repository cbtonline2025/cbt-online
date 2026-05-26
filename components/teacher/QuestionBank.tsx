
import React, { useState, useRef, useMemo, useContext, useEffect } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { FileText, Video, Music, Edit, Eye, Search, Filter, RefreshCw, Download, CheckCircle2, AlertCircle, HelpCircle, Info, X, Check, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Question, QuestionType, QuestionOption, QuestionMediaType } from '../../types';
import { addQuestions, mockQuestions, deleteQuestion, deleteMultipleQuestions } from '../../services/api';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import QuestionDetail from './QuestionDetail';
import EditQuestionModal from './EditQuestionModal';
import { motion, AnimatePresence } from 'motion/react';
import { AuthContext } from '../../App';


const TabButton: React.FC<{ name: string; activeTab: string; setActiveTab: (name: string) => void; children: React.ReactNode }> = ({ name, activeTab, setActiveTab, children }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
            activeTab === name
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border-b-2 border-transparent'
        }`}
    >
        {children}
    </button>
);

const QuestionBank: React.FC = () => {
    const { user } = useContext(AuthContext);

    const assignedSubject = useMemo(() => {
        if (user && user.role === 'Guru' && user.details?.subject && user.details.subject !== 'Semua Mapel') {
            return user.details.subject;
        }
        return '';
    }, [user]);

    const [activeTab, setActiveTab ] = useState('import');
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
    const [isBulkDeletingConfirmOpen, setIsBulkDeletingConfirmOpen] = useState(false);

    // States for Help Guide Modal
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [activeHelpTab, setActiveHelpTab] = useState<'word' | 'excel' | 'tips'>('word');

    // State for importing
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error', text: string, count?: number, fileName?: string } | null>(null);
    const [questions, setQuestions] = useState<Question[]>(mockQuestions);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for manual add
    const [newQuestion, setNewQuestion] = useState({
        content: '',
        mediaType: QuestionMediaType.TEXT,
        mediaUrl: '',
        promptText: '',
        type: QuestionType.MULTIPLE_CHOICE,
        subject: assignedSubject || '',
        phase: 'F' as 'D' | 'E' | 'F',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correctAnswerIndex: 0,
        essayAnswer: ''
    });

    const [isAdding, setIsAdding] = useState(false);
    const [manualMediaFile, setManualMediaFile] = useState<File | null>(null);
    const manualFileInputRef = useRef<HTMLInputElement>(null);
    const [addMessage, setAddMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // State for filtering
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(() => assignedSubject || 'all');
    const [selectedPhase, setSelectedPhase] = useState('all');

    useEffect(() => {
        if (assignedSubject) {
            setNewQuestion(prev => ({ ...prev, subject: assignedSubject }));
            setSelectedSubject(assignedSubject);
        }
    }, [assignedSubject]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
            setImportMessage(null);
        }
    };

    const handleManualFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            // Basic size check (e.g., 2MB limit for localStorage safety)
            if (file.size > 2 * 1024 * 1024) {
                setAddMessage({ type: 'error', text: 'Ukuran file terlalu besar (maks 2MB untuk penyimpanan lokal). Saran: Gunakan URL dari Google Drive atau YouTube.' });
                return;
            }
            setManualMediaFile(file);
            setAddMessage(null);
            
            // Auto fill mediaUrl as a placeholder/visual cue
            handleNewQuestionChange('mediaUrl', `File: ${file.name}`);
        }
    };

    const handleSelectFileClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleClearFile = () => {
        setSelectedFile(null);
        setImportMessage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearManualFile = () => {
        setManualMediaFile(null);
        handleNewQuestionChange('mediaUrl', '');
        if (manualFileInputRef.current) {
            manualFileInputRef.current.value = '';
        }
    };

    const handleQuestionUpdated = (updatedQuestion: Question) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === updatedQuestion.id ? updatedQuestion : q
            )
        );
        // Also update in detail view if it's the same question
        if(selectedQuestionId === updatedQuestion.id){
            setSelectedQuestionId(null); // force re-render or handle state better
            setTimeout(() => setSelectedQuestionId(updatedQuestion.id), 0);
        }
    };

    const handleDownloadWordTemplate = async () => {
        try {
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "TEMPLATE FORMAT IMPOR SOAL - CBT KURIKULUM MERDEKA",
                                        bold: true,
                                        size: 28, // 14pt
                                        color: "1E293B"
                                    })
                                ],
                                heading: HeadingLevel.HEADING_1,
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 300 }
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "PETUNJUK IMPOR SOAL PENTING:",
                                        bold: true,
                                        color: "4F46E5"
                                    })
                                ],
                                spacing: { before: 200, after: 100 }
                            }),
                            new Paragraph({ text: "1. Setiap soal wajib diawali dengan angka penomoran diikuti tanda titik atau kurung tutup (contoh: 1. atau 1))." }),
                            new Paragraph({ text: "2. Masukkan metadata [SUBJEK: Nama Mapel] dan [FASE: D/E/F] di bawah teks soal pada baris baru." }),
                            new Paragraph({ text: "3. Untuk multimedia, opsional tambahkan [MEDIA: Audio/Video] dan [URL: https://...] di baris baru." }),
                            new Paragraph({ text: "4. Opsi pilihan ganda diawali huruf A s/d E diikuti titik atau kurung tutup (contoh: A. Pilihan A)." }),
                            new Paragraph({ text: "5. Tulis kunci di baris terakhir dengan format \"KUNCI: A\" (untuk Pilihan Ganda) atau \"KUNCI: Pedoman Jawaban\" (untuk Esai)." }),
                            new Paragraph({ text: "6. Jika tidak menyertakan opsi pilihan ganda (A, B, C...), soal otomatis dideteksi sebagai soal Esai." }),
                            new Paragraph({ text: "--------------------------------------------------------", spacing: { before: 200, after: 200 } }),

                            // Soal 1
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "1. Apa yang dimaksud dengan Pancasila sebagai dasar negara?", bold: true })
                                ],
                                spacing: { before: 150 }
                            }),
                            new Paragraph({ text: "[SUBJEK: Pendidikan Pancasila]" }),
                            new Paragraph({ text: "[FASE: F]" }),
                            new Paragraph({ text: "A. Dasar negara Indonesia dan sumber dari segala sumber hukum" }),
                            new Paragraph({ text: "B. Lambang negara dan lagu kebangsaan saja" }),
                            new Paragraph({ text: "C. Program kerja pemerintah dalam pembangunan nasional" }),
                            new Paragraph({ text: "D. Nama pulau terbesar di wilayah kedaulatan nusantara" }),
                            new Paragraph({ text: "E. Peraturan daerah tingkat provinsi DKI Jakarta" }),
                            new Paragraph({ text: "KUNCI: A", spacing: { after: 200 } }),

                            // Soal 2
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "2. Perhatikan video penjelasan astronomi berikut secara saksama. Mengapa planet Jupiter memiliki daya gravitasi yang sangat besar?", bold: true })
                                ],
                                spacing: { before: 150 }
                            }),
                            new Paragraph({ text: "[SUBJEK: Fisika]" }),
                            new Paragraph({ text: "[FASE: F]" }),
                            new Paragraph({ text: "[MEDIA: Video]" }),
                            new Paragraph({ text: "[URL: https://www.youtube.com/watch?v=VBhIOpC3Irs]" }),
                            new Paragraph({ text: "A. Karena massa dan ukurannya yang sangat masif dibanding planet lain" }),
                            new Paragraph({ text: "B. Karena letaknya sangat dekat dari matahari" }),
                            new Paragraph({ text: "C. Karena memiliki jumlah cincin es yang sangat tebal" }),
                            new Paragraph({ text: "D. Karena atmosfernya tidak mengandung helium" }),
                            new Paragraph({ text: "E. Karena mengitari matahari lebih cepat" }),
                            new Paragraph({ text: "KUNCI: A", spacing: { after: 200 } }),

                            // Soal 3
                            new Paragraph({
                                children: [
                                    new TextRun({ text: "3. Sebutkan 3 contoh sumber energi terbarukan yang potensial dikembangkan di Indonesia beserta pemanfaatannya!", bold: true })
                                ],
                                spacing: { before: 150 }
                            }),
                            new Paragraph({ text: "[SUBJEK: IPA]" }),
                            new Paragraph({ text: "[FASE: D]" }),
                            new Paragraph({ text: "[TIPE: Esai]" }),
                            new Paragraph({ text: "KUNCI: Contoh energi terbarukan di Indonesia: 1) Energi Surya (pemanfaatan sel surya/PLTS), 2) Energi Air (pembangunan PLTA skala mikrohidro), dan 3) Geotermal/panas bumi (pembangkit listrik di daerah vulkanik).", spacing: { after: 200 } })
                        ]
                    }
                ]
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "template_impor_soal_word.docx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            alert("Gagal mengunduh template Word: " + err.message);
        }
    };

    const handleDownloadExcelTemplate = () => {
        try {
            const headers = [
                'content', 'type', 'subject', 'phase', 
                'optionA', 'optionB', 'optionC', 'optionD', 'optionE', 
                'correctAnswer', 'mediaType', 'mediaUrl', 'promptText'
            ];
            
            const data = [
                {
                    content: "Sebuah benda bergerak dengan kecepatan konstan 5 m/s. Berapa jarak yang ditempuh benda tersebut setelah 10 detik?",
                    type: "Pilihan Ganda",
                    subject: "Fisika",
                    phase: "F",
                    optionA: "25 m",
                    optionB: "50 m",
                    optionC: "100 m",
                    optionD: "10 m",
                    optionE: "5 m",
                    correctAnswer: "B",
                    mediaType: "Teks",
                    mediaUrl: "",
                    promptText: ""
                },
                {
                    content: "https://www.youtube.com/watch?v=VBhIOpC3Irs",
                    type: "Pilihan Ganda",
                    subject: "Fisika",
                    phase: "F",
                    optionA: "Karena massa dan ukurannya yang sangat masif dibanding planet lain",
                    optionB: "Karena letaknya sangat dekat dari matahari",
                    optionC: "Karena cincin es",
                    optionD: "Karena gas saja",
                    optionE: "Karena revolusi",
                    correctAnswer: "A",
                    mediaType: "Video",
                    mediaUrl: "https://www.youtube.com/watch?v=VBhIOpC3Irs",
                    promptText: "Perhatikan video penjelasan astronomi berikut secara saksama. Mengapa planet Jupiter memiliki gravitasi sangat besar?"
                },
                {
                    content: "Sebutkan 3 contoh sumber energi terbarukan yang potensial dikembangkan di Indonesia!",
                    type: "Esai",
                    subject: "IPA",
                    phase: "D",
                    optionA: "",
                    optionB: "",
                    optionC: "",
                    optionD: "",
                    optionE: "",
                    correctAnswer: "1. Energi Air (pembangkit listrik), 2. Energi Panas Bumi (panas bumi), 3. Energi Matahari (sel surya).",
                    mediaType: "Teks",
                    mediaUrl: "",
                    promptText: ""
                }
            ];

            const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template Soal");
            XLSX.writeFile(workbook, "template_impor_soal_excel.xlsx");
        } catch (err: any) {
            alert("Gagal mengunduh template Excel: " + err.message);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            setImportMessage({ type: 'error', text: 'Silakan pilih file terlebih dahulu.' });
            return;
        }
        setIsParsing(true);
        setImportMessage(null);

        try {
            let newQuestions: Question[] = [];
            if (selectedFile.name.endsWith('.xlsx')) {
                newQuestions = await parseXLSX(selectedFile);
            } else if (selectedFile.name.endsWith('.docx')) {
                newQuestions = await parseDOCX(selectedFile);
            } else {
                throw new Error('Format file tidak didukung. Gunakan .xlsx atau .docx');
            }

            if (newQuestions.length > 0) {
                await addQuestions(newQuestions);
                setQuestions(prev => [...prev, ...newQuestions]);
                setImportMessage({ 
                    type: 'success', 
                    text: `Berhasil! ${newQuestions.length} soal baru telah ditambahkan ke bank soal Anda.`,
                    count: newQuestions.length,
                    fileName: selectedFile.name
                });
            } else {
                setImportMessage({ type: 'error', text: 'Tidak ada soal yang dapat diimpor dari file. Periksa format file Anda.' });
            }
        } catch (error: any) {
            setImportMessage({ type: 'error', text: `Gagal mengimpor: ${error.message}` });
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) {
               fileInputRef.current.value = '';
            }
            setSelectedFile(null);
        }
    };

    const handleNewQuestionChange = (field: keyof typeof newQuestion, value: any) => {
        setNewQuestion(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index] = { text: value };
        handleNewQuestionChange('options', updatedOptions);
    };

    const handleAddOption = () => {
    if (newQuestion.type === QuestionType.MULTIPLE_CHOICE && newQuestion.options.length < 5) {
        const updatedOptions = [...newQuestion.options, { text: '' }];
        handleNewQuestionChange('options', updatedOptions);
    }
  };

  const handleRemoveOptionManual = (indexToRemove: number) => {
    if (newQuestion.options.length > 2) {
        const updatedOptions = newQuestion.options.filter((_, index) => index !== indexToRemove);
        
        // Adjust correct answer index if needed
        let newCorrectIndex = newQuestion.correctAnswerIndex;
        if (newCorrectIndex === indexToRemove) {
            newCorrectIndex = 0;
        } else if (newCorrectIndex > indexToRemove) {
            newCorrectIndex--;
        }
        
        setNewQuestion(prev => ({
            ...prev,
            options: updatedOptions,
            correctAnswerIndex: newCorrectIndex
        }));
    }
  };

    const handleAddQuestion = async () => {
        setAddMessage(null);
        setIsAdding(true);

        try {
            // 1. Basic Field Validation (Content, Subject, Phase)
            const subject = (newQuestion.subject || '').trim();
            const phase = (newQuestion.phase || '').trim();
            
            if (!subject) {
                throw new Error('Mata pelajaran (subjek) wajib diisi.');
            }
            if (!phase) {
                throw new Error('Fase (D/E/F) wajib dipilih.');
            }

            // Media specific content validation
            let content = '';
            let promptText = '';

            if (newQuestion.mediaType === QuestionMediaType.TEXT) {
                const textContent = (newQuestion.content || '').trim();
                if (!textContent) {
                    throw new Error('Konten soal teks wajib diisi.');
                }
                content = textContent;
            } else {
                const mediaUrl = (newQuestion.mediaUrl || '').trim();
                const mediaPrompt = (newQuestion.promptText || '').trim();

                if (!mediaPrompt) {
                    throw new Error('Teks pengantar (promptText) wajib diisi ketika tipe konten adalah Audio atau Video.');
                }

                if (manualMediaFile) {
                    // File based media
                    content = ''; // will be filled by base64 below
                    promptText = mediaPrompt;
                } else {
                    // URL based media
                    if (!mediaUrl) {
                        throw new Error(`URL Media ${newQuestion.mediaType} wajib diisi.`);
                    }
                    content = mediaUrl;
                    promptText = mediaPrompt;
                }
            }

            const questionToAdd: Question = {
                id: `manual-${Date.now()}`,
                content: content,
                type: newQuestion.type,
                mediaType: newQuestion.mediaType,
                subject: subject,
                phase: phase as 'D' | 'E' | 'F',
                correctAnswer: '',
                options: [],
            };

            // Handle file to base64 if needed
            if (newQuestion.mediaType !== QuestionMediaType.TEXT && manualMediaFile) {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(manualMediaFile);
                });
                questionToAdd.content = await base64Promise;
                questionToAdd.promptText = promptText;
            } else if (newQuestion.mediaType !== QuestionMediaType.TEXT) {
                questionToAdd.promptText = promptText;
            }

            // 2. Type Specific Validation (Pilihan Ganda vs Esai)
            if (newQuestion.type === QuestionType.MULTIPLE_CHOICE) {
                // Filter non-empty options
                const validOptions = newQuestion.options.filter(opt => opt.text && opt.text.trim() !== '');
                
                if (validOptions.length < 2) {
                    throw new Error('Soal pilihan ganda minimal harus memiliki 2 opsi jawaban yang valid (tidak kosong).');
                }

                // Check if the selected correct answer is actually one of the valid options
                const selectedOption = newQuestion.options[newQuestion.correctAnswerIndex];
                if (!selectedOption || !selectedOption.text || selectedOption.text.trim() === '') {
                    throw new Error('Kunci jawaban yang dipilih tidak boleh kosong. Silakan pilih opsi yang berisi teks.');
                }
                
                // Map to proper QuestionOption format
                questionToAdd.options = validOptions.map((opt, i) => ({ 
                    id: `${questionToAdd.id}-o${i+1}`, 
                    text: opt.text.trim() 
                }));
                
                // Find correct answer ID in the processed options
                const correctOptionText = selectedOption.text.trim();
                const finalCorrectOption = questionToAdd.options.find(opt => opt.text === correctOptionText);

                if (!finalCorrectOption) {
                    throw new Error('Gagal mencocokkan kunci jawaban dengan opsi. Pastikan opsi jawaban tidak duplikat.');
                }
                questionToAdd.correctAnswer = finalCorrectOption.id;

            } else { // QuestionType.ESSAY
                const essayAns = (newQuestion.essayAnswer || '').trim();
                if (!essayAns) {
                    throw new Error('Kunci jawaban esai wajib diisi.');
                }
                questionToAdd.correctAnswer = essayAns;
                delete questionToAdd.options;
            }

            // 3. Commit the change
            await addQuestions([questionToAdd]);
            setQuestions(prev => [questionToAdd, ...prev]);
            setAddMessage({ type: 'success', text: 'Soal berhasil ditambahkan ke bank soal!' });

            // Reset form
            setNewQuestion({
                content: '', 
                mediaType: QuestionMediaType.TEXT, 
                mediaUrl: '', 
                promptText: '',
                type: QuestionType.MULTIPLE_CHOICE, 
                subject: '', 
                phase: 'F',
                options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                correctAnswerIndex: 0, 
                essayAnswer: ''
            });
            setManualMediaFile(null);
            if (manualFileInputRef.current) {
                manualFileInputRef.current.value = '';
            }

        } catch (error: any) {
            setAddMessage({ type: 'error', text: error.message });
        } finally {
            setIsAdding(false);
        }
    };

    const uniqueSubjects = useMemo(() => {
        if (assignedSubject) {
            return [assignedSubject];
        }
        const subjects = new Set(questions.map(q => q.subject));
        return ['all', ...Array.from(subjects).sort()];
    }, [questions, assignedSubject]);

    const subjectCounts = useMemo(() => {
        return questions.reduce((acc, q) => {
            acc[q.subject] = (acc[q.subject] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            if (assignedSubject && q.subject.toLowerCase() !== assignedSubject.toLowerCase()) {
                return false;
            }
            const contentToSearch = q.mediaType === QuestionMediaType.TEXT ? q.content : q.promptText || '';
            const searchMatch = contentToSearch.toLowerCase().includes(searchQuery.toLowerCase());
            const subjectMatch = selectedSubject === 'all' || q.subject === selectedSubject;
            const phaseMatch = selectedPhase === 'all' || q.phase === selectedPhase;
            return searchMatch && subjectMatch && phaseMatch;
        });
    }, [questions, searchQuery, selectedSubject, selectedPhase, assignedSubject]);
    
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedSubject(assignedSubject || 'all');
        setSelectedPhase('all');
    };

    const handleDeleteQuestion = async (id: string) => {
        try {
            const success = await deleteQuestion(id);
            if (success) {
                setQuestions(prev => prev.filter(q => q.id !== id));
                setSelectedQuestionIds(prev => prev.filter(sid => sid !== id));
            }
        } catch (error) {
            console.error("Gagal menghapus soal", error);
        } finally {
            setDeletingQuestionId(null);
        }
    };
    
    const handleBulkDeleteQuestions = async () => {
        try {
            const success = await deleteMultipleQuestions(selectedQuestionIds);
            if (success) {
                setQuestions(prev => prev.filter(q => !selectedQuestionIds.includes(q.id)));
                setSelectedQuestionIds([]);
            }
        } catch (error) {
            console.error("Gagal menghapus soal massal", error);
        } finally {
            setIsBulkDeletingConfirmOpen(false);
        }
    };
    
    const handleExportToCSV = () => {
        if (filteredQuestions.length === 0) {
            alert("Tidak ada soal untuk diekspor.");
            return;
        }

        const escapeCSV = (str: string) => `"${String(str).replace(/"/g, '""')}"`;

        const headers = [
            'id', 'content', 'type', 'subject', 'phase', 
            'optionA', 'optionB', 'optionC', 'optionD', 'optionE', 
            'correctAnswer'
        ];

        const rows = filteredQuestions.map(q => {
            const row: { [key: string]: string } = {
                id: q.id,
                content: q.content,
                type: q.type,
                subject: q.subject,
                phase: q.phase,
            };

            if (q.type === QuestionType.MULTIPLE_CHOICE && q.options) {
                const optionLetters = ['A', 'B', 'C', 'D', 'E'];
                q.options.forEach((opt, index) => {
                    row[`option${optionLetters[index]}`] = opt.text;
                });
                
                const correctIndex = q.options.findIndex(opt => opt.id === q.correctAnswer);
                row.correctAnswer = correctIndex !== -1 ? optionLetters[correctIndex] : '';
            } else { // Essay
                row.correctAnswer = q.correctAnswer;
            }
            
            return headers.map(header => escapeCSV(row[header] || '')).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bank_soal_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportToExcel = () => {
        if (filteredQuestions.length === 0) {
            alert("Tidak ada soal untuk diekspor.");
            return;
        }

        const dataRows = filteredQuestions.map(q => {
            const row: any = {
                id: q.id,
                content: q.content,
                type: q.type,
                subject: q.subject,
                phase: q.phase,
            };

            if (q.type === QuestionType.MULTIPLE_CHOICE && q.options) {
                const optionLetters = ['A', 'B', 'C', 'D', 'E'];
                q.options.forEach((opt, index) => {
                    row[`option${optionLetters[index]}`] = opt.text;
                });
                
                const correctIndex = q.options.findIndex(opt => opt.id === q.correctAnswer);
                row.correctAnswer = correctIndex !== -1 ? optionLetters[correctIndex] : '';
            } else { // Essay
                row.correctAnswer = q.correctAnswer;
            }
            return row;
        });

        const headers = [
            'id', 'content', 'type', 'subject', 'phase', 
            'optionA', 'optionB', 'optionC', 'optionD', 'optionE', 
            'correctAnswer'
        ];

        const worksheet = XLSX.utils.json_to_sheet(dataRows, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Soal");
        XLSX.writeFile(workbook, `bank_soal_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const handleExportToWord = () => {
        if (filteredQuestions.length === 0) {
            alert("Tidak ada soal untuk diekspor.");
            return;
        }

        const docChildren: any[] = [
            new Paragraph({
                text: "KARTU SOAL & DATA BANK SOAL - CBT",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: `Hasil Ekspor Otomatis | Tanggal: ${new Date().toLocaleDateString('id-ID')} | Jumlah Soal: ${filteredQuestions.length}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        ];

        filteredQuestions.forEach((q, idx) => {
            // Header No. Soal
            docChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `SOAL NO. ${idx + 1} (${q.type === QuestionType.MULTIPLE_CHOICE ? 'PILIHAN GANDA' : 'ESAI'})`, bold: true, color: "4F46E5" }),
                        new TextRun({ text: `  |  Mata Pelajaran: ${q.subject}  |  Fase: ${q.phase}`, italics: true, color: "6B7280" }),
                    ],
                    spacing: { before: 200, after: 100 }
                })
            );

            // Konten Pertanyaan
            docChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: q.content, size: 24 })
                    ],
                    spacing: { after: 150 }
                })
            );

            // Opsional Media
            if (q.mediaType && q.mediaUrl) {
                docChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `[Lampiran Media: ${q.mediaType} (${q.mediaUrl})]`, italics: true, color: "2563EB" })
                        ],
                        spacing: { after: 100 }
                    })
                );
            }

            // Opsi Jawaban (Pilihan Ganda) atau Kunci Esai
            if (q.type === QuestionType.MULTIPLE_CHOICE && q.options) {
                const letters = ['A', 'B', 'C', 'D', 'E'];
                q.options.forEach((opt, oIdx) => {
                    const isCorrect = opt.id === q.correctAnswer;
                    docChildren.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: `   ${letters[oIdx]}. `, bold: true }),
                                new TextRun({ text: opt.text, size: 22 }),
                                isCorrect ? new TextRun({ text: "  [Kunci Jawaban]", bold: true, color: "10B981" }) : null
                            ].filter(Boolean) as any[],
                            spacing: { after: 80 }
                        })
                    );
                });
            } else {
                docChildren.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Kunci Jawaban Esai: ", bold: true, color: "10B981" }),
                            new TextRun({ text: q.correctAnswer || "-", italics: true })
                        ],
                        spacing: { after: 150 }
                    })
                );
            }

            // Separator Line
            docChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "_________________________________________________________________________________",
                            color: "E5E7EB"
                        })
                    ],
                    spacing: { after: 200 }
                })
            );
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: docChildren,
            }]
        });

        Packer.toBlob(doc).then(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `bank_soal_${new Date().toISOString().slice(0, 10)}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(err => {
            alert("Gagal mengekspor bank data ke Word: " + err.message);
        });
    };

    const parseXLSX = (file: File): Promise<Question[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    
                    // Check for required headers before parsing rows
                    const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
                    if (!headerRow) {
                        throw new Error("File Excel kosong atau tidak memiliki baris header.");
                    }
                    const requiredHeaders = ['content', 'type', 'subject', 'phase', 'correctAnswer'];
                    const missingHeaders = requiredHeaders.filter(h => !headerRow?.includes(h));
                    
                    if (missingHeaders.length > 0) {
                        throw new Error(`File Excel tidak memiliki kolom yang diwajibkan: ${missingHeaders.join(', ')}. Harap pastikan nama kolom di baris pertama sudah benar (case-sensitive).`);
                    }

                    const rawJson = XLSX.utils.sheet_to_json(worksheet) as any[];
                    // Filter out completely empty rows
                    const json = rawJson.filter(row => {
                        return Object.values(row).some(val => val !== undefined && val !== null && String(val).trim() !== '');
                    });

                    if (json.length === 0) {
                        throw new Error("File Excel terbaca, namun tidak ditemukan baris data soal yang terisi di bawah baris judul (header).");
                    }

                    const isValidHttpUrl = (str: string) => {
                        try {
                            const u = new URL(str.trim());
                            return u.protocol === 'http:' || u.protocol === 'https:';
                        } catch (_) {
                            return false;
                        }
                    };

                    const parsedQuestions: Question[] = json.map((row, index) => {
                        const rowNum = index + 2; // +1 for 0-indexing, +1 for header row
                        
                        // 1. Periksa Kelengkapan Field Wajib
                        if (!row['content'] || String(row['content']).trim() === '') {
                             throw new Error(`[BARIS ${rowNum}] Konten soal (kolom 'content') tidak boleh kosong.`);
                        }
                        if (!row['type'] || String(row['type']).trim() === '') {
                             throw new Error(`[BARIS ${rowNum}] Tipe soal (kolom 'type') wajib diisi ('Pilihan Ganda' atau 'Esai').`);
                        }

                        let subjectVal = String(row['subject'] || '').trim();
                        if (assignedSubject) {
                            if (subjectVal && subjectVal.toLowerCase() !== assignedSubject.toLowerCase()) {
                                throw new Error(`[BARIS ${rowNum}] Anda hanya diperbolehkan mengimpor soal untuk mata pelajaran "${assignedSubject}". Berkas Excel berisi "${subjectVal}".`);
                            }
                            subjectVal = assignedSubject;
                        } else {
                            if (!row['subject'] || String(row['subject']).trim() === '') {
                                 throw new Error(`[BARIS ${rowNum}] Mata pelajaran (kolom 'subject') wajib diisi.`);
                            }
                        }

                        if (!row['phase'] || String(row['phase']).trim() === '') {
                             throw new Error(`[BARIS ${rowNum}] Fase (kolom 'phase') wajib diisi ('D', 'E', atau 'F').`);
                        }
                        if (row['correctAnswer'] === undefined || row['correctAnswer'] === null || String(row['correctAnswer']).trim() === '') {
                             throw new Error(`[BARIS ${rowNum}] Kunci jawaban (kolom 'correctAnswer') wajib diisi.`);
                        }

                        // 2. Validasi Tipe Soal
                        const typeInput = String(row['type']).trim();
                        let type: QuestionType;
                        const isPilihanGandaString = typeInput.toLowerCase() === 'pilihan ganda' || typeInput.toLowerCase() === 'multiple choice' || typeInput === QuestionType.MULTIPLE_CHOICE;
                        const isEsaiString = typeInput.toLowerCase() === 'esai' || typeInput.toLowerCase() === 'essay' || typeInput === QuestionType.ESSAY;

                        if (isPilihanGandaString) {
                            type = QuestionType.MULTIPLE_CHOICE;
                        } else if (isEsaiString) {
                            type = QuestionType.ESSAY;
                        } else {
                            throw new Error(`[BARIS ${rowNum}] Tipe Soal '${typeInput}' tidak didukung. Gunakan 'Pilihan Ganda' atau 'Esai'.`);
                        }

                        // 3. Validasi Fase
                        const phase = String(row['phase']).trim().toUpperCase();
                        if (!['D', 'E', 'F'].includes(phase)) {
                            throw new Error(`[BARIS ${rowNum}] Fase '${phase}' tidak valid. Pilihan yang tersedia: D, E, atau F.`);
                        }

                        // 3b. Validasi Mata Pelajaran (subject)
                        if (subjectVal.length < 2) {
                             throw new Error(`[BARIS ${rowNum}] Mata pelajaran (kolom 'subject') harus berupa teks minimal 2 karakter.`);
                        }

                        // 4. Normalisasi & Validasi Tipe Media
                        let mediaType = QuestionMediaType.TEXT;
                        const mediaTypeVal = row['mediaType'] || row['media_type'] || row['tipe_media'] || row['media'];
                        if (mediaTypeVal) {
                            const mTypeInput = String(mediaTypeVal).trim().toLowerCase();
                            if (mTypeInput === 'audio' || mTypeInput.includes('audio')) {
                                mediaType = QuestionMediaType.AUDIO;
                            } else if (mTypeInput === 'video' || mTypeInput.includes('video')) {
                                mediaType = QuestionMediaType.VIDEO;
                            } else if (mTypeInput === 'teks' || mTypeInput === 'text' || mTypeInput.includes('text')) {
                                mediaType = QuestionMediaType.TEXT;
                            } else {
                                throw new Error(`[BARIS ${rowNum}] Tipe Media '${mediaTypeVal}' tidak dikenali. Gunakan: Teks, Audio, atau Video.`);
                            }
                        }

                        // 5. Tentukan Content & Prompt Text berdasarkan Media Type
                        let finalContent = '';
                        const promptTextVal = row['promptText'] || row['prompt_text'] || row['prompt'] || row['instruction'] || row['instruksi'] || row['pengantar'] || row['pertanyaan'] || row['soal'];
                        let finalPromptText = promptTextVal ? String(promptTextVal).trim() : undefined;
                        
                        if (mediaType === QuestionMediaType.TEXT) {
                            const textVal = row['content'] || row['question'] || row['pertanyaan'] || row['soal'];
                            if (!textVal || String(textVal).trim() === '') {
                                throw new Error(`[BARIS ${rowNum}] Kolom 'content' (atau pertanyaan/soal) wajib diisi untuk soal tipe teks.`);
                            }
                            finalContent = String(textVal).trim();
                        } else {
                            // Untuk media, content adalah URL.
                            // Mendukung kolom: mediaUrl, media_url, url, link, content (jika isinya URL)
                            const mediaUrlVal = row['mediaUrl'] || row['media_url'] || row['url'] || row['link'] || row['video_url'] || row['audio_url'];
                            const backupUrl = row['content'];
                            
                            const actualUrl = mediaUrlVal || (backupUrl && (String(backupUrl).startsWith('http') || String(backupUrl).startsWith('https')) ? backupUrl : null);
                            
                            if (!actualUrl || String(actualUrl).trim() === '') {
                                throw new Error(`[BARIS ${rowNum}] URL Media wajib diisi (gunakan kolom 'mediaUrl', 'url', 'link' atau 'content' dengan link yang valid).`);
                            }
                            finalContent = String(actualUrl).trim();

                            // Validasi format URL media
                            if (!isValidHttpUrl(finalContent)) {
                                throw new Error(`[BARIS ${rowNum}] URL Media ('${finalContent}') tidak valid. Harap berikan URL lengkap dengan protokol HTTP atau HTTPS (seperti Google Drive atau YouTube).`);
                            }
                            
                            // Jika promptText masih kosong atau sama dengan URL, coba cari dari kolom lain
                            if (!finalPromptText || finalPromptText === finalContent) {
                                const contentAsPrompt = row['content'] || row['question'] || row['pertanyaan'] || row['soal'];
                                if (contentAsPrompt && String(contentAsPrompt).trim() !== finalContent) {
                                    finalPromptText = String(contentAsPrompt).trim();
                                }
                            }
                            
                            if (!finalPromptText || finalPromptText.trim().length < 2) {
                                throw new Error(`[BARIS ${rowNum}] Soal media wajib memiliki instruksi/pertanyaan (gunakan kolom 'promptText', 'content', atau 'pertanyaan').`);
                            }
                        }

                        const question: Question = {
                            id: `imported-${Date.now()}-${index}`,
                            content: finalContent,
                            type,
                            mediaType,
                            promptText: finalPromptText,
                            subject: subjectVal,
                            phase: phase as 'D' | 'E' | 'F',
                            correctAnswer: String(row['correctAnswer']).trim(),
                            options: [],
                        };

                        if (question.type === QuestionType.MULTIPLE_CHOICE) {
                            // 5. Validasi Opsi Jawaban (Minimal 2 valid)
                            const possibleOptions = ['A', 'B', 'C', 'D', 'E'];
                            question.options = possibleOptions
                                .map((opt, i) => {
                                    const optText = row[`option${opt}`];
                                    return { 
                                        id: `${question.id}-o${i + 1}`, 
                                        text: optText ? String(optText).trim() : '' 
                                    };
                                })
                                .filter(opt => opt.text !== '');

                            if (question.options.length < 2) {
                                throw new Error(`[BARIS ${rowNum}] Soal Pilihan Ganda harus memiliki minimal 2 opsi (di kolom optionA, optionB, dst) yang tidak kosong.`);
                            }

                            // Cek teks opsi duplikat
                            const optionTexts = question.options.map(opt => opt.text);
                            const duplicatedOption = optionTexts.find((text, idx) => optionTexts.indexOf(text) !== idx);
                            if (duplicatedOption) {
                                throw new Error(`[BARIS ${rowNum}] Teks opsi jawaban tidak boleh duplikat (Ditemukan duplikasi teks: "${duplicatedOption}").`);
                            }
                            
                            // 6. Validasi Kunci Jawaban
                            const correctLetter = String(row['correctAnswer']).trim().toUpperCase();
                            if (!possibleOptions.includes(correctLetter)) {
                                throw new Error(`[BARIS ${rowNum}] Kunci Jawaban '${correctLetter}' tidak valid. Gunakan huruf tunggal A, B, C, D, atau E.`);
                            }

                            // Pastikan kunci merujuk pada kolom yang berisi teks
                            const optValueForLetter = row[`option${correctLetter}`];
                            if (!optValueForLetter || String(optValueForLetter).trim() === '') {
                                throw new Error(`[BARIS ${rowNum}] Kunci '${correctLetter}' merujuk pada kolom 'option${correctLetter}' yang kosong. Harap isi teks pada kolom tersebut.`);
                            }

                            const correctOptionText = String(optValueForLetter).trim();
                            const finalCorrectOption = question.options.find(opt => opt.text === correctOptionText);

                            if (!finalCorrectOption) {
                                throw new Error(`[BARIS ${rowNum}] Sinkronisasi kunci gagal. Pastikan tidak ada duplikasi teks pada opsi.`);
                            }
                            question.correctAnswer = finalCorrectOption.id;
                        } else {
                            // 7. Validasi Kunci Jawaban Esai
                            const essayAns = String(row['correctAnswer']).trim();
                            if (essayAns.length < 3) {
                                throw new Error(`[BARIS ${rowNum}] Kunci Jawaban Esai ("${essayAns}") terlalu pendek. Harap berikan jawaban pedoman yang lebih lengkap.`);
                            }
                            question.correctAnswer = essayAns;
                        }
                        return question;
                    });
                    resolve(parsedQuestions);
                } catch (err: any) { reject(err); }
            };
            reader.onerror = reject; reader.readAsArrayBuffer(file);
        });
    };
    
    const parseDOCX = (file: File): Promise<Question[]> => {
         return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                 try {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    const { value: text } = await mammoth.extractRawText({ arrayBuffer });
                    if (!text || text.trim().length < 10) {
                        throw new Error("Format teks dalam file Word tidak dapat dibaca atau file kosong. Pastikan file berisi teks soal yang benar.");
                    }

                    // Split dengan memastikan nomor soal tetap ada di awal setiap elemen
                    const fullProcessedText = "\n" + text.trim();
                    const questionsText = fullProcessedText.split(/\n\s*(?=\d+[\.\)]\s)/).filter(q => q.trim().length > 15);
                    
                    if (questionsText.length === 0) {
                        throw new Error("Tidak ada soal yang ditemukan. Pastikan soal menggunakan penomoran standar (1. Soal...)");
                    }

                    const isValidHttpUrl = (str: string) => {
                        try {
                            const u = new URL(str.trim());
                            return u.protocol === 'http:' || u.protocol === 'https:';
                        } catch (_) {
                            return false;
                        }
                    };

                    const parsedQuestions: Question[] = questionsText.map((qText, index) => {
                        const questionNum = index + 1;
                        
                        // Helper to extract metadata from tags like [TAG: value]
                        const extractTag = (tags: string[]) => {
                            for (const tag of tags) {
                                const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const regex = new RegExp(`\\[${escapedTag}\\s*:\\s*([^\\]]+)\\]`, 'i');
                                const match = qText.match(regex);
                                if (match && match[1]) return match[1].trim();
                            }
                            return '';
                        };

                        // 1. Ekstrak Metadata
                        const subject = extractTag(['SUBJEK', 'SUBJECT', 'MAPEL']);
                        const phaseRaw = extractTag(['FASE', 'PHASE']).toUpperCase();
                        const typeRaw = extractTag(['TIPE', 'TYPE', 'QUESTION_TYPE']).toLowerCase();
                        const mediaTypeRaw = extractTag(['MEDIA_TYPE', 'TIPE_MEDIA', 'MEDIA']).toLowerCase();
                        const mediaUrl = extractTag(['MEDIA_URL', 'URL', 'LINK', 'CONTENT_URL']);
                        const explicitPrompt = extractTag(['PROMPT_TEXT', 'PROMPT', 'INSTRUKSI', 'PENGANTAR', 'TEKS_PENGANTAR', 'PERTANYAAN', 'SOAL']);

                        // 2. Validasi & Normalisasi Metadata Wajib
                        let finalSubject = subject;
                        if (assignedSubject) {
                            if (subject && subject.toLowerCase() !== assignedSubject.toLowerCase()) {
                                throw new Error(`[SOAL ${questionNum}] Anda hanya diperbolehkan mengimpor soal untuk mata pelajaran "${assignedSubject}". File Word berisi "${subject}".`);
                            }
                            finalSubject = assignedSubject;
                        } else if (!finalSubject) {
                            throw new Error(`[SOAL ${questionNum}] Metadata [SUBJEK] tidak ditemukan. Pastikan ada tag seperti [SUBJEK: Nama Mapel] di dalam soal.`);
                        }

                        if (finalSubject.length < 2) {
                            throw new Error(`[SOAL ${questionNum}] Metadata [SUBJEK] harus berupa teks minimal 2 karakter.`);
                        }

                        if (!phaseRaw) {
                            throw new Error(`[SOAL ${questionNum}] Metadata [FASE] tidak ditemukan. Tambahkan tag [FASE: D/E/F] untuk menentukan jenjang soal.`);
                        }

                        if (!['D', 'E', 'F'].includes(phaseRaw)) {
                            throw new Error(`[SOAL ${questionNum}] Fase '${phaseRaw}' tidak valid. Gunakan 'D', 'E', atau 'F' (Contoh: [FASE: F]).`);
                        }
                        const phase = phaseRaw as 'D' | 'E' | 'F';

                        // 3. Tentukan Tipe Media
                        let mediaType = QuestionMediaType.TEXT;
                        if (mediaTypeRaw) {
                            if (mediaTypeRaw.includes('audio')) {
                                mediaType = QuestionMediaType.AUDIO;
                            } else if (mediaTypeRaw.includes('video') || mediaTypeRaw.includes('youtube')) {
                                mediaType = QuestionMediaType.VIDEO;
                            } else if (mediaTypeRaw.includes('teks') || mediaTypeRaw.includes('text')) {
                                mediaType = QuestionMediaType.TEXT;
                            } else {
                                throw new Error(`[SOAL ${questionNum}] Tipe Media '${mediaTypeRaw}' tidak dikenali. Gunakan: Teks, Audio, atau Video.`);
                            }
                        } else if (mediaUrl && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be'))) {
                            // Auto-detect YouTube as video
                            mediaType = QuestionMediaType.VIDEO;
                        }

                        // 4. Validasi Media URL jika tipe Audio/Video
                        if (mediaType !== QuestionMediaType.TEXT) {
                            if (!mediaUrl || mediaUrl.trim() === '') {
                                throw new Error(`[SOAL ${questionNum}] URL Media wajib ada untuk tipe ${mediaType}. Tambahkan tag [URL: http://...] atau [MEDIA_URL: http://...]`);
                            }
                            if (!isValidHttpUrl(mediaUrl)) {
                                throw new Error(`[SOAL ${questionNum}] URL Media ('${mediaUrl}') tidak valid. Harap sertakan link lengkap dengan protokol HTTP atau HTTPS (seperti Google Drive atau YouTube).`);
                            }
                        }

                        // 5. Ekstrak Konten Utama (Teks Soal / Instruksi)
                        // Hapus semua metadata tags untuk mendapatkan isi pertanyaan murni
                        const qTextClean = qText.replace(/\[[a-zA-Z0-9_]+\s*:\s*[^\]]*\]/gi, '').trim();
                        
                        // Regex untuk mengambil teks soal setelah nomor (e.g., "1. Bla bla bla") 
                        // hingga sebelum opsi (A., B., ...) atau KUNCI:
                        const contentMatch = qTextClean.match(/^\d+[\.\)]\s*([\s\S]*?)(?=\s*\n\s*[A-E][\.\)]|\s*\n\s*KUNCI:|$)/);
                        const extractedBody = contentMatch ? contentMatch[1].trim() : '';

                        let content = '';
                        let promptText: string | undefined = undefined;

                        if (mediaType === QuestionMediaType.TEXT) {
                            content = extractedBody;
                            if (!content || content.length < 3) {
                                throw new Error(`[SOAL ${questionNum}] Konten pertanyaan teks tidak ditemukan atau terlalu pendek.`);
                            }
                        } else {
                            content = mediaUrl;
                            // Gunakan explicitPrompt jika ada, jika tidak gunakan body teks soal
                            promptText = explicitPrompt || extractedBody;
                            if (!promptText || promptText.length < 2) {
                                throw new Error(`[SOAL ${questionNum}] Soal berbasis media (${mediaType}) wajib memiliki instruksi atau teks pengantar.`);
                            }
                        }

                        // 6. Opsi & Kunci
                        const optionsMatches = [...qText.matchAll(/([A-E])[\.\)]\s(.*?)(?=\s*\n\s*[A-E][\.\)]|\s*\n\s*KUNCI:|\s*\[|$)/gs)];
                        const rawOptions = optionsMatches.map((match) => ({
                            letter: match[1].toUpperCase(),
                            text: match[2].trim()
                        })).filter(opt => opt.text !== '');

                        let type: QuestionType;
                        if (typeRaw) {
                            if (typeRaw.includes('choice') || typeRaw.includes('ganda')) {
                                type = QuestionType.MULTIPLE_CHOICE;
                            } else if (typeRaw.includes('esai') || typeRaw.includes('essay')) {
                                type = QuestionType.ESSAY;
                            } else {
                                throw new Error(`[SOAL ${questionNum}] Tipe soal '${typeRaw}' tidak dikenali. Gunakan [TIPE: Pilihan Ganda] atau [TIPE: Esai] atau biarkan kosong untuk deteksi otomatis.`);
                            }
                        } else {
                            // Auto-detect based on presence of options if [TIPE] is missing
                            type = rawOptions.length > 0 ? QuestionType.MULTIPLE_CHOICE : QuestionType.ESSAY;
                        }

                        let correctAnswer = '';
                        let finalOptions: QuestionOption[] | undefined = undefined;

                        if (type === QuestionType.MULTIPLE_CHOICE) {
                            if (rawOptions.length < 2) {
                                throw new Error(`[SOAL ${questionNum}] Soal Pilihan Ganda minimal butuh 2 opsi (A, B, C, ...). Periksa format penulisan opsi.`);
                            }

                            // Cek teks opsi duplikat
                            const optionTexts = rawOptions.map(opt => opt.text);
                            const duplicatedOption = optionTexts.find((text, idx) => optionTexts.indexOf(text) !== idx);
                            if (duplicatedOption) {
                                throw new Error(`[SOAL ${questionNum}] Teks opsi jawaban tidak boleh duplikat (Ditemukan duplikasi teks: "${duplicatedOption}").`);
                            }

                            const kunciTag = extractTag(['KUNCI', 'JAWABAN', 'KEY', 'CORRECT_ANSWER']).toUpperCase();
                            const kunciInlineMatch = qText.match(/KUNCI\s*:\s*([A-E])/i);
                            const correctLetter = kunciTag || (kunciInlineMatch ? kunciInlineMatch[1].toUpperCase() : '');

                            if (!correctLetter) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban (A/B/...) tidak ditemukan. Gunakan [KUNCI: A] atau "KUNCI: A" di akhir soal.`);
                            }
                            
                            const matchingOpt = rawOptions.find(opt => opt.letter === correctLetter);
                            if (!matchingOpt) {
                                throw new Error(`[SOAL ${questionNum}] Kunci "${correctLetter}" merujuk pada opsi yang tidak ada atau kosong.`);
                            }
                            finalOptions = rawOptions.map((opt, i) => ({ 
                                id: `imported-${Date.now()}-${index}-o${i + 1}`, 
                                text: opt.text 
                             }));
                            correctAnswer = finalOptions[rawOptions.findIndex(opt => opt.letter === correctLetter)].id;
                        } else {
                            const kunciTag = extractTag(['KUNCI', 'JAWABAN', 'ANSWER_KEY', 'KEY']);
                            const essayInlineMatch = qText.match(/KUNCI\s*:\s*([\s\S]*?)(?=\s*\n\[|$)/i);
                            correctAnswer = kunciTag || (essayInlineMatch ? essayInlineMatch[1].trim() : '');
                            
                            if (!correctAnswer || correctAnswer.length < 3) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban esai wajib ada. Gunakan [KUNCI: ...] atau "KUNCI: ..." di akhir soal.`);
                            }
                        }

                        return { 
                            id: `imported-${Date.now()}-${index}`, 
                            content, 
                            options: finalOptions, 
                            type, 
                            mediaType,
                            promptText,
                            correctAnswer, 
                            subject: finalSubject, 
                            phase 
                        } as Question;
                    });
                    resolve(parsedQuestions);
                } catch (err: any) { reject(err); }
            };
            reader.onerror = reject; reader.readAsArrayBuffer(file);
        });
    };

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {selectedQuestionId ? (
                    <motion.div 
                        key="question-detail"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <QuestionDetail 
                            questionId={selectedQuestionId} 
                            onBack={() => setSelectedQuestionId(null)} 
                        />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="question-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {editingQuestionId && (
                            <EditQuestionModal
                                questionId={editingQuestionId}
                                onClose={() => setEditingQuestionId(null)}
                                onQuestionUpdated={handleQuestionUpdated}
                            />
                        )}
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Bank Soal</h2>


                    <div className="flex border-b border-white/20 dark:border-slate-700/50 mb-6">
                        <TabButton name="import" activeTab={activeTab} setActiveTab={setActiveTab}>Impor Massal</TabButton>
                        <TabButton name="add" activeTab={activeTab} setActiveTab={setActiveTab}>Tambah Manual</TabButton>
                    </div>
                    
                    {activeTab === 'import' && (
                        <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg relative overflow-hidden group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Impor Soal Baru</h3>
                            <button 
                                onClick={() => { setShowHelpModal(true); setActiveHelpTab('word'); }}
                                type="button" 
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-350 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-900/30 rounded-xl transition-all duration-200 hover:scale-103 shadow-sm hover:shadow active:scale-97 cursor-pointer"
                            >
                                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Panduan Format</span>
                            </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">Unggah file .docx atau .xlsx untuk menambahkan soal secara massal.</p>
                        
                        <input 
                            id="file-input" 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            onChange={handleFileChange} 
                            accept=".docx,.xlsx" 
                        />
                        
                        <div className={`p-4 border-2 border-dashed rounded-lg transition-colors ${selectedFile ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-400/50 dark:border-slate-600/50 hover:border-indigo-400'}`}>
                            {selectedFile ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 dark:text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{selectedFile.name}</span>
                                    </div>
                                    <button onClick={handleClearFile} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2.5">Seret & lepas file di sini, atau</p>
                                    <div className="flex items-center justify-center flex-wrap gap-2.5">
                                        <Button type="button" variant="secondary" onClick={handleSelectFileClick} className="shadow-sm">
                                            Pilih Berkas...
                                        </Button>
                                        
                                        <div className="relative group/tooltip">
                                            <button 
                                                type="button"
                                                onClick={() => { setShowHelpModal(true); setActiveHelpTab('word'); }}
                                                className="px-4 py-2.5 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 border border-slate-300/60 dark:border-slate-700 flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                                            >
                                                <HelpCircle className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                                                <span>Panduan Impor</span>
                                            </button>
                                            
                                            {/* Beautiful Tooltip Content */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-30 text-left text-xs pointer-events-none">
                                                <div className="font-extrabold text-indigo-400 mb-1.5 flex items-center gap-1">
                                                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span>Petunjuk Cepat Impor</span>
                                                </div>
                                                <p className="text-slate-300 leading-relaxed mb-2 font-medium">
                                                    Mendukung format <strong className="text-white">Word (.docx)</strong> & <strong className="text-white">Excel (.xlsx)</strong> sesuai template resmi.
                                                </p>
                                                <div className="text-[10px] text-slate-400 flex flex-col gap-1 border-t border-slate-800 pt-1.5">
                                                    <div>• Word: Gunakan nomor urut (contoh: 1., 2.) & tag [SUBJEK: ...]</div>
                                                    <div>• Excel: Gunakan header kolom lower-case dari template</div>
                                                    <span className="text-indigo-300 font-bold mt-1 inline-block">Klik tombol ini untuk panduan visual interaktif!</span>
                                                </div>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button onClick={handleImport} disabled={isParsing || !selectedFile} className="mt-4 w-full flex justify-center items-center gap-2">
                            {isParsing && <Spinner size="small" />}
                            {isParsing ? 'Sedang Mengimpor...' : 'Impor Sekarang'}
                        </Button>

                        <div className="mt-6 pt-6 border-t border-slate-200/40 dark:border-slate-700/50">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                                <Download className="w-4 h-4 text-indigo-500" />
                                Template Format Impor
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Unduh template acuan untuk mempermudah penyusunan soal massal:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button 
                                    onClick={handleDownloadWordTemplate}
                                    type="button"
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/30 transition-all active:scale-[0.98] cursor-pointer shadow-sm hover:shadow"
                                    title="Unduh format Microsoft Word (.docx)"
                                >
                                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                    Template Word (.docx)
                                </button>
                                <button 
                                    onClick={handleDownloadExcelTemplate}
                                    type="button"
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30 transition-all active:scale-[0.98] cursor-pointer shadow-sm hover:shadow"
                                    title="Unduh format Microsoft Excel (.xlsx)"
                                >
                                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                    Template Excel (.xlsx)
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Panduan Format Impor
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">Format Microsoft Excel (.xlsx)</h4>
                                <ul className="space-y-2 text-xs leading-relaxed">
                                    <li className="flex gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span>Gunakan header kolom di baris pertama: <code className="bg-white dark:bg-slate-800 px-1 rounded border border-indigo-100 dark:border-indigo-800">content</code>, <code className="bg-white dark:bg-slate-800 px-1 rounded border border-indigo-100 dark:border-indigo-800">type</code>, <code className="bg-white dark:bg-slate-800 px-1 rounded border border-indigo-100 dark:border-indigo-800">subject</code>, <code className="bg-white dark:bg-slate-800 px-1 rounded border border-indigo-100 dark:border-indigo-800">phase</code>.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span><strong>Metadata:</strong> Contoh subjek <code className="text-emerald-600 dark:text-emerald-400 font-bold">[SUBJEK: Matematika]</code> dan fase <code className="text-emerald-600 dark:text-emerald-400 font-bold">[FASE: F]</code>.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span>Opsi jawaban di kolom <code className="bg-white dark:bg-slate-800 px-1 rounded border border-indigo-100 dark:border-indigo-800">optionA</code> s/d <code className="bg-white dark:bg-slate-800 px-1 rounded border border-indigo-100 dark:border-indigo-800">optionE</code>.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-4 bg-sky-50/50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800/50">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-3">Format Microsoft Word (.docx)</h4>
                                <div className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg font-mono text-[10px] mb-3 border border-sky-100/50 dark:border-sky-800/30 space-y-3">
                                    <div>
                                        1. Apa yang dimaksud dengan pancasila?<br/>
                                        <span className="text-indigo-500">[SUBJEK: PKN]</span><br/>
                                        <span className="text-indigo-500">[FASE: F]</span><br/>
                                        A. Dasar negara Indonesia<br/>
                                        B. Lagu kebangsaan<br/>
                                        KUNCI: A
                                    </div>
                                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                        2. Perhatikan video penjelasan astronomi berikut secara saksama. Mengapa planet Jupiter memiliki gravitasi sangat besar?<br/>
                                        <span className="text-indigo-500">[SUBJEK: Fisika]</span><br/>
                                        <span className="text-indigo-500">[FASE: F]</span><br/>
                                        <span className="text-indigo-500">[MEDIA: Video]</span><br/>
                                        <span className="text-indigo-500">[URL: https://www.youtube.com/watch?v=VBhIOpC3Irs]</span><br/>
                                        A. Karena massa dan ukurannya yang sangat masif<br/>
                                        B. Karena letaknya sangat dekat dari matahari<br/>
                                        KUNCI: A
                                    </div>
                                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                                        3. Dengarkan materi audio listening bahasa inggris berikut. Apa pesan utama yang disampaikan oleh pembicara?<br/>
                                        <span className="text-indigo-500">[SUBJEK: Bahasa Inggris]</span><br/>
                                        <span className="text-indigo-500">[FASE: D]</span><br/>
                                        <span className="text-indigo-500">[MEDIA: Audio]</span><br/>
                                        <span className="text-indigo-500">[URL: https://drive.google.com/file/d/1t87Yv9U7Z80Ym6Vn7U9oE0_p3Xn8L2tY/view]</span><br/>
                                        A. Pentingnya menjaga keragaman hayati hutan hujan tropis<br/>
                                        B. Cara cepat mempelajari pemrograman web modern<br/>
                                        KUNCI: A
                                    </div>
                                </div>
                                <ul className="space-y-2 text-xs leading-relaxed">
                                    <li className="flex gap-2">
                                        <span className="text-sky-500 font-bold">•</span>
                                        <span>Setiap soal wajib menggunakan nomor (1., 2., dst).</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sky-500 font-bold">•</span>
                                        <span>Gunakan tag dalam kurung siku untuk metadata di baris baru.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-sky-500 font-bold">•</span>
                                        <span>Dukungan penuh untuk tipe media <code className="bg-white/60 dark:bg-slate-850 px-1.2 py-0.5 rounded text-[10px] font-bold">[MEDIA: Audio]</code> atau <code className="bg-white/60 dark:bg-slate-850 px-1.2 py-0.5 rounded text-[10px] font-bold">[MEDIA: Video]</code> disertai <code className="bg-white/60 dark:bg-slate-850 px-1.2 py-0.5 rounded text-[10px] font-bold">[URL: ...]</code> (YouTube atau file publik Google Drive).</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-4 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Berbagai sinonim tag seperti [MAPEL] atau [URL] juga didukung secara otomatis.
                        </p>
                    </div>
                </div>

                {importMessage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`rounded-2xl border-2 p-6 mb-8 shadow-xl transition-all ${
                        importMessage.type === 'success' 
                        ? 'bg-emerald-50/90 border-emerald-500/40 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:text-emerald-100 shadow-emerald-500/5' 
                        : 'bg-rose-50/90 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/50 dark:text-rose-300 shadow-rose-500/5'
                    }`}
                  >
                    {importMessage.type === 'success' ? (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0 shadow-inner">
                                    <CheckCircle2 className="w-8 h-8 font-black" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-lg md:text-xl tracking-tight text-emerald-800 dark:text-emerald-300">
                                        🎉 Impor Berhasil! {importMessage.count || 0} Soal Telah Berhasil Ditambahkan
                                    </h4>
                                    <p className="text-sm font-medium opacity-90 leading-relaxed">
                                        Sebanyak <strong className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-base">{importMessage.count || 0} butir soal</strong> dari dokumen Anda telah sukses diidentifikasi, diproses, dan dimasukkan ke dalam Bank Soal CBT.
                                    </p>
                                    {importMessage.fileName && (
                                        <div className="mt-2.5 flex items-center gap-2 text-xs font-mono bg-emerald-500/10 dark:bg-emerald-500/15 py-1 px-3 rounded-lg border border-emerald-500/10 dark:border-emerald-500/20 w-max text-emerald-700 dark:text-emerald-400">
                                            <span className="font-sans font-semibold text-emerald-800/70 dark:text-emerald-300/60">Sumber:</span>
                                            {importMessage.fileName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 rounded-2xl border border-emerald-500/20 shrink-0 min-w-[180px] text-center shadow-sm">
                                <div>
                                    <div className="text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                                        +{importMessage.count || 0}
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/70 dark:text-emerald-300/70 mt-0.5">
                                        Soal Ditambahkan
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 w-full">
                                    <button
                                        onClick={() => {
                                            const element = document.getElementById('search');
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }}
                                        className="w-full py-1.5 px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                        Lihat Daftar Soal
                                    </button>
                                    <button
                                        onClick={() => setImportMessage(null)}
                                        className="w-full py-1 px-3 text-[11px] font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-emerald-800 dark:text-emerald-400 transition-colors cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-base md:text-lg text-rose-800 dark:text-rose-300 tracking-tight">
                                        Proses Impor Gagal
                                    </h4>
                                    <p className="text-sm font-medium opacity-90 leading-relaxed">
                                        {importMessage.text}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setImportMessage(null)}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                  </motion.div>
                )}
            </>
            )}

            {activeTab === 'add' && (
                 <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg mb-8">
                     <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Tambah Soal Manual</h3>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipe Konten</label>
                            <select 
                                value={newQuestion.mediaType} 
                                onChange={(e) => handleNewQuestionChange('mediaType', e.target.value as QuestionMediaType)} 
                                className="w-full md:w-1/3 bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                            >
                                <option value={QuestionMediaType.TEXT}>Teks</option>
                                <option value={QuestionMediaType.AUDIO}>Audio</option>
                                <option value={QuestionMediaType.VIDEO}>Video</option>
                            </select>
                        </div>

                        {newQuestion.mediaType === QuestionMediaType.TEXT ? (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Konten Pertanyaan</label>
                                <textarea
                                    placeholder="Tulis pertanyaan atau narasi soal teks di sini secara detail. Contoh: Berdasarkan siklus hidrologi, jelaskan peran evaporasi dalam pembentukan awan."
                                    rows={4}
                                    value={newQuestion.content}
                                    onChange={(e) => handleNewQuestionChange('content', e.target.value)}
                                    className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 p-3 focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                />
                            </div>
                        ) : (
                            <div className='space-y-6 pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-2'>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                                    <div className="md:col-span-12">
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <div className="flex-grow w-full">
                                                <Input 
                                                    label={`URL Media ${newQuestion.mediaType}`}
                                                    value={newQuestion.mediaUrl} 
                                                    onChange={(e) => handleNewQuestionChange('mediaUrl', e.target.value)} 
                                                    placeholder={`Masukkan URL ${newQuestion.mediaType} (contoh: YouTube, Google Drive, atau link langsung)...`}
                                                    disabled={!!manualMediaFile}
                                                    className="!mb-0"
                                                />
                                            </div>
                                            
                                            <div className="flex items-center gap-4 w-full md:w-auto self-end h-11">
                                                <div className="flex-shrink-0 text-slate-400 font-bold text-xs uppercase hidden md:block">Atau</div>
                                                <div className="md:hidden w-full flex items-center gap-2">
                                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-grow"></div>
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Atau</span>
                                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-grow"></div>
                                                </div>

                                                <div className="flex-shrink-0 w-full md:w-auto">
                                                    <input 
                                                        type="file" 
                                                        ref={manualFileInputRef} 
                                                        className="hidden" 
                                                        onChange={handleManualFileChange}
                                                        accept={newQuestion.mediaType === QuestionMediaType.AUDIO ? "audio/*" : "video/*"}
                                                    />
                                                    {manualMediaFile ? (
                                                        <Button type="button" variant="secondary" onClick={handleClearManualFile} className="w-full flex items-center justify-center gap-2 whitespace-nowrap">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            Hapus File
                                                        </Button>
                                                    ) : (
                                                        <Button type="button" variant="secondary" onClick={() => manualFileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 whitespace-nowrap">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                                                            Unggah File
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-[10px] text-slate-500 italic">
                                            Tips: Gunakan URL YouTube atau Google Drive (yang dipublikasikan) untuk video berdurasi panjang agar loading lebih cepat.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teks Pengantar (promptText) <span className="text-rose-500">*</span></label>
                                    <textarea
                                        placeholder={`Tulis instruksi atau pertanyaan yang akan muncul di atas media ${newQuestion.mediaType.toLowerCase()}...`}
                                        rows={3}
                                        value={newQuestion.promptText}
                                        onChange={(e) => handleNewQuestionChange('promptText', e.target.value)}
                                        className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 p-3 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-medium"
                                    />
                                </div>

                                {/* Media Preview for Manual Add */}
                                {(manualMediaFile || (newQuestion.mediaUrl && newQuestion.mediaUrl.trim().length > 5)) && (
                                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pratinjau Media</span>
                                        </div>
                                        <div className="flex justify-center bg-black/5 dark:bg-black/20 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                                            {newQuestion.mediaType === QuestionMediaType.AUDIO ? (
                                                <div className="w-full p-6 flex flex-col items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                                    <p className="text-xs text-slate-500 mb-2">{manualMediaFile ? manualMediaFile.name : 'Media URL Audio'}</p>
                                                    <div className="text-[10px] text-amber-500 italic bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                                        Media akan diputar di panel siswa saat ujian berlangsung.
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-video flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-8">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                    <p className="text-xs font-mono text-slate-500 break-all text-center max-w-xs">{manualMediaFile ? manualMediaFile.name : newQuestion.mediaUrl}</p>
                                                    <div className="mt-4 text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                                                        Siap Diintegrasikan
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                       
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <Input 
                                label="Mata Pelajaran" 
                                placeholder="Contoh: Matematika, Fisika, Bahasa Indonesia, atau Seni Budaya..." 
                                value={newQuestion.subject} 
                                onChange={(e) => handleNewQuestionChange('subject', e.target.value)} 
                                disabled={!!assignedSubject}
                            />
                           <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fase</label>
                                <select value={newQuestion.phase} onChange={(e) => handleNewQuestionChange('phase', e.target.value)} className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500">
                                    <option value="D">Fase D (SMP)</option>
                                    <option value="E">Fase E (SMA)</option>
                                    <option value="F">Fase F (SMA)</option>
                                </select>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipe Soal</label>
                                <select value={newQuestion.type} onChange={(e) => handleNewQuestionChange('type', e.target.value)} className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500">
                                    <option value={QuestionType.MULTIPLE_CHOICE}>Pilihan Ganda</option>
                                    <option value={QuestionType.ESSAY}>Esai</option>
                                </select>
                           </div>
                        </div>

                        {newQuestion.type === QuestionType.MULTIPLE_CHOICE && (
                            <div className="pt-4 border-t border-white/20 dark:border-slate-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-lg font-semibold">Opsi Jawaban</h4>
                                    {newQuestion.options.length < 5 && (
                                        <button 
                                            type="button" 
                                            onClick={handleAddOption}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                            Tambah Opsi
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {newQuestion.options.map((opt, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <input type="radio" name="correctAnswer" checked={newQuestion.correctAnswerIndex === index} onChange={() => handleNewQuestionChange('correctAnswerIndex', index)} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"/>
                                            <span className="font-semibold text-slate-600 dark:text-slate-300 w-4">{String.fromCharCode(65 + index)}.</span>
                                            <Input label="" placeholder={`Teks Opsi ${String.fromCharCode(65 + index)}`} value={opt.text} onChange={(e) => handleOptionChange(index, e.target.value)} className="flex-grow !mb-0"/>
                                            {newQuestion.options.length > 2 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveOptionManual(index)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Hapus Opsi"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {newQuestion.type === QuestionType.ESSAY && (
                            <div className="pt-4 border-t border-white/20 dark:border-slate-700/50">
                                <h4 className="text-lg font-bold mb-1 text-slate-800 dark:text-white">Kunci Jawaban Esai</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    Masukkan poin-poin kunci, kata kunci, atau contoh jawaban ideal. Teks ini merupakan <strong>pedoman utama bagi sistem AI</strong> untuk membandingkan, memberikan skor secara objektif, dan menyusun umpan balik yang konstruktif berdasarkan jawaban siswa.
                                </p>
                                <textarea
                                    placeholder="Contoh: Menyebutkan prinsip induksi elektromagnetik, perbandingan jumlah lilitan primer dan sekunder..."
                                    rows={3}
                                    value={newQuestion.essayAnswer}
                                    onChange={(e) => handleNewQuestionChange('essayAnswer', e.target.value)}
                                    className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 p-3 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                        <Button 
                            onClick={handleAddQuestion} 
                            disabled={isAdding || !newQuestion.subject || newQuestion.subject.trim().length === 0} 
                            className="w-full md:w-auto flex justify-center items-center gap-2"
                        >
                            {isAdding && <Spinner size="small" />}
                            {isAdding ? "Menyimpan..." : "Simpan Soal"}
                        </Button>
                        {addMessage && (
                            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                                addMessage.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400' 
                                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-400'
                            }`}>
                                {addMessage.type === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm mb-0.5">
                                        {addMessage.type === 'success' ? 'Simpan Berhasil' : 'Terjadi Kesalahan'}
                                    </h4>
                                    <p className="text-xs opacity-90 leading-relaxed">{addMessage.text}</p>
                                </div>
                            </div>
                        )}
                     </div>
                 </div>
            )}

            <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                     <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Daftar Soal ({filteredQuestions.length})</h3>
                     <div className="flex flex-wrap gap-2">
                         <Button onClick={handleExportToExcel} variant="secondary" className="py-2 px-4 text-sm flex items-center gap-2 border border-emerald-500/30 hover:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20">
                            <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            Ekspor Excel (.xlsx)
                         </Button>
                         <Button onClick={handleExportToWord} variant="secondary" className="py-2 px-4 text-sm flex items-center gap-2 border border-blue-500/30 hover:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/20">
                            <FileText className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                            Ekspor Word (.docx)
                         </Button>
                         <Button onClick={handleExportToCSV} variant="secondary" className="py-2 px-4 text-sm flex items-center gap-2 border border-slate-500/30 hover:border-slate-500">
                            <Download className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                            Ekspor CSV
                         </Button>
                     </div>
                </div>
                
                <div className="bg-white/30 dark:bg-slate-900/50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                             <Input 
                                label="Cari Soal" 
                                id="search"
                                placeholder="Ketik kata kunci konten..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label htmlFor="subject-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mata Pelajaran</label>
                            <select id="subject-filter" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500">
                                {uniqueSubjects.map(sub => (
                                    <option key={sub} value={sub}>
                                        {sub === 'all' 
                                            ? `Semua Mapel (${questions.length} Soal)` 
                                            : `${sub} (${subjectCounts[sub] || 0} Soal)`
                                        }
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="phase-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fase</label>
                            <select id="phase-filter" value={selectedPhase} onChange={(e) => setSelectedPhase(e.target.value)} className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500">
                                <option value="all">Semua Fase</option>
                                <option value="D">Fase D</option>
                                <option value="E">Fase E</option>
                                <option value="F">Fase F</option>
                            </select>
                        </div>
                    </div>
                    <div className='mt-4 flex justify-end'>
                        <Button onClick={handleResetFilters} variant="secondary" className='py-2 px-4 text-sm'>Reset Filter</Button>
                    </div>
                </div>

                {/* Bulk Select & Delete Action Bar */}
                {filteredQuestions.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mb-5 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-205 border-slate-200/60 dark:border-slate-800 shadow-sm animate-fade-in">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={filteredQuestions.length > 0 && filteredQuestions.every(q => selectedQuestionIds.includes(q.id))}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            const filteredIds = filteredQuestions.map(q => q.id);
                                            setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...filteredIds])));
                                        } else {
                                            const filteredIds = filteredQuestions.map(q => q.id);
                                            setSelectedQuestionIds(prev => prev.filter(id => !filteredIds.includes(id)));
                                        }
                                    }}
                                    className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
                                />
                                Pilih Semua ({filteredQuestions.length} Soal Sesuai Filter)
                            </label>
                            
                            {selectedQuestionIds.length > 0 && (
                                <span className="text-[11px] bg-indigo-50 dark:bg-indigo-950/55 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-black border border-indigo-150/30 dark:border-indigo-900/30">
                                    {selectedQuestionIds.length} Terpilih
                                </span>
                            )}
                        </div>

                        {selectedQuestionIds.length > 0 && (
                            <Button
                                type="button"
                                onClick={() => setIsBulkDeletingConfirmOpen(true)}
                                className="w-full sm:w-auto py-2 px-4 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/10 active:scale-[0.98] flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer border border-rose-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus {selectedQuestionIds.length} Soal Terpilih
                            </Button>
                        )}
                    </div>
                )}

                <div className="max-h-[600px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/50 shadow-inner custom-scrollbar">
                    {filteredQuestions.length > 0 ? (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {[...filteredQuestions].reverse().map((q, revIndex) => {
                                    const originalIndex = filteredQuestions.length - 1 - revIndex;
                                    const displayIndex = filteredQuestions.length - originalIndex;
                                    
                                    return (
                                        <motion.div
                                            key={q.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: revIndex * 0.05 }}
                                            className="group flex items-stretch bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[1.5rem] border border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-500/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_10px_25px_-5px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/20 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
                                        >
                                            {/* Selection Checkbox */}
                                            <div className="flex items-center pl-5 pr-1 select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedQuestionIds.includes(q.id)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSelectedQuestionIds(prev => 
                                                            checked ? [...prev, q.id] : prev.filter(id => id !== q.id)
                                                        );
                                                    }}
                                                    className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer transition-colors"
                                                />
                                            </div>

                                            <button 
                                                onClick={() => setSelectedQuestionId(q.id)}
                                                className="flex-grow text-left p-5 pl-3 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                                title="Klik untuk melihat detail soal"
                                            >
                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                    <span className="text-[11px] font-black bg-indigo-600 dark:bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-indigo-500/20">
                                                        #{displayIndex}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/80 px-2 py-1 rounded-lg">
                                                        {q.subject}
                                                    </span>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-lg">
                                                        Fase {q.phase}
                                                    </span>
                                                    
                                                    {q.mediaType !== QuestionMediaType.TEXT && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm shadow-amber-500/10">
                                                            {q.mediaType === QuestionMediaType.VIDEO ? (
                                                                <Video className="w-3 h-3" />
                                                            ) : (
                                                                <Music className="w-3 h-3" />
                                                            )}
                                                            {q.mediaType}
                                                        </span>
                                                    )}
                                                    
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                                                        q.type === QuestionType.MULTIPLE_CHOICE 
                                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40' 
                                                        : 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/40'
                                                    }`}>
                                                        {q.type === QuestionType.MULTIPLE_CHOICE ? 'Pilihan Ganda' : 'Esai'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-grow">
                                                        <p className="text-slate-900 dark:text-white font-bold line-clamp-2 leading-relaxed text-sm md:text-base transition-colors duration-300">
                                                            {q.mediaType === QuestionMediaType.TEXT ? q.content : q.promptText}
                                                        </p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                                                        <Eye className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </button>
                                            
                                            <div className="flex flex-col border-l border-slate-100 dark:border-slate-700/50 min-w-[3.5rem]">
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setEditingQuestionId(q.id); }}
                                                    className="flex-grow p-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all border-b border-slate-100 dark:border-slate-700/50"
                                                    title="Edit Soal"
                                                >
                                                    <Edit className="h-4.5 w-4.5" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedQuestionId(q.id); }}
                                                    className="flex-grow p-3.5 flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all border-b border-slate-100 dark:border-slate-700/50"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="h-4.5 w-4.5" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setDeletingQuestionId(q.id); }}
                                                    className="flex-grow p-3.5 flex items-center justify-center text-slate-400 hover:text-rose-650 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                                                    title="Hapus Soal"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/40 dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-slate-400" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Tidak ada soal yang cocok</h4>
                            <p className="text-slate-500 dark:text-slate-500 max-w-xs mx-auto">Coba ubah kata kunci atau filter Anda untuk menemukan apa yang Anda cari.</p>
                            <Button onClick={handleResetFilters} variant="secondary" className="mt-8">
                                Reset Pencarian
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )}
</AnimatePresence>

            {/* HELPER GUIDE MODAL */}
            <AnimatePresence>
                {showHelpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
                        onClick={() => setShowHelpModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.35 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
                                        <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Panduan Format Impor Bank Soal</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-normal">Ikuti panduan berikut agar berkas soal langsung terbaca sempurna oleh sistem</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Sub-Tabs */}
                            <div className="flex bg-slate-100/60 dark:bg-slate-950/40 p-1 border-b border-slate-100/60 dark:border-slate-850 px-6">
                                <button
                                    onClick={() => setActiveHelpTab('word')}
                                    className={`flex items-center gap-2 py-3 px-4 text-xs font-bold rounded-xl transition-all border-b-2 border-transparent ${
                                        activeHelpTab === 'word'
                                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    <span>Format Word (.docx)</span>
                                </button>
                                <button
                                    onClick={() => setActiveHelpTab('excel')}
                                    className={`flex items-center gap-2 py-3 px-4 text-xs font-bold rounded-xl transition-all border-b-2 border-transparent ${
                                        activeHelpTab === 'excel'
                                            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                                    <span>Format Excel (.xlsx)</span>
                                </button>
                                <button
                                    onClick={() => setActiveHelpTab('tips')}
                                    className={`flex items-center gap-2 py-3 px-4 text-xs font-bold rounded-xl transition-all border-b-2 border-transparent ${
                                        activeHelpTab === 'tips'
                                            ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    <Info className="w-4 h-4 text-amber-500" />
                                    <span>Tips & Validasi Soal</span>
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-6 overflow-y-auto space-y-6 flex-grow custom-scrollbar text-left">
                                {activeHelpTab === 'word' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200 text-xs leading-relaxed">
                                            <p className="font-extrabold text-indigo-700 dark:text-indigo-400 mb-1">💡 Penggunaan Cepat:</p>
                                            Penyusunan format Word sangat fleksibel, mirip dengan membuat lembar ujian biasa. Pastikan untuk menuliskan butir pertanyaan secara urut menggunakan penomoran standar.
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Contoh Layout */}
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Struktur Teks Dokumen Word</h4>
                                                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 font-mono text-[10px] leading-relaxed select-all">
                                                    <div>1. Apa singkatan dari CBT dalam ujian daring?<br/>
                                                    <span className="text-indigo-500">[SUBJEK: Informatika]</span><br/>
                                                    <span className="text-indigo-500">[FASE: F]</span><br/>
                                                    A. Computer Based Test<br/>
                                                    B. Central Business Tool<br/>
                                                    C. Common Basic Technology<br/>
                                                    KUNCI: A</div>
                                                    
                                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                                                        2. Perhatikan video pembelajaran tentang mekanika Newton berikut. Mengapa apel jatuh ke bumi?<br/>
                                                        <span className="text-indigo-500">[SUBJEK: Fisika]</span><br/>
                                                        <span className="text-indigo-500">[FASE: F]</span><br/>
                                                        <span className="text-indigo-500">[MEDIA: Video]</span><br/>
                                                        <span className="text-indigo-500">[URL: https://www.youtube.com/watch?v=VBhIOp]</span><br/>
                                                        A. Karena adanya gaya gravitasi bumi<br/>
                                                        B. Karena magnet bumi sangat kuat<br/>
                                                        KUNCI: A
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Aturan Main */}
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Aturan Wajib Microsoft Word</h4>
                                                <ul className="space-y-3 text-xs">
                                                    <li className="flex items-start gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3" /></div>
                                                        <div>
                                                            <strong className="text-slate-900 dark:text-white font-bold">Penomoran Soal:</strong> Setiap butir soal harus menggunakan nomor diikuti titik (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">1.</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">2.</code>, dst) di awal baris pertanyaan.
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3" /></div>
                                                        <div>
                                                            <strong className="text-slate-900 dark:text-white font-bold">Opsi Pilihan:</strong> Opsi wajib diletakkan di baris baru dengan struktur abjad (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">A.</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">B.</code>, dst).
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3" /></div>
                                                        <div>
                                                            <strong className="text-slate-900 dark:text-white font-bold">Metadata Tag:</strong> Tag subjek, fase, dan multimedia opsional diletakkan di dalam tanda kurung siku seperti <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">[SUBJEK: ...]</code> di bawah pertanyaan atau baris baru.
                                                        </div>
                                                    </li>
                                                    <li className="flex items-start gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3" /></div>
                                                        <div>
                                                            <strong className="text-slate-900 dark:text-white font-bold">Jawaban Kunci:</strong> Tuliskan kunci jawaban menggunakan penanda <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">KUNCI: A</code> pada baris setelah pilihan jawaban selesai.
                                                        </div>
                                                    </li>
                                                </ul>

                                                <button 
                                                    onClick={handleDownloadWordTemplate}
                                                    type="button"
                                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Unduh Template Word (.docx)</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeHelpTab === 'excel' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed">
                                            <p className="font-extrabold text-emerald-700 dark:text-emerald-400 mb-1">📘 Struktur Kolom Spreadsheet:</p>
                                            Metode impor Excel sangat cocok untuk bank soal besar. Kolom-kolom di baris pertama (header) harus ditulis persis menggunakan huruf kecil agar sistem dapat melakukan pencocokan database secara dinamis.
                                        </div>

                                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 dark:text-slate-400">
                                                        <th className="p-3">Nama Kolom <span className="text-rose-500">*</span></th>
                                                        <th className="p-3">Tipe/Format</th>
                                                        <th className="p-3">Keterangan & Contoh</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">content</td>
                                                        <td className="p-3 text-[11px] text-slate-400">Teks Bebas</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350">Teks isi butir pertanyaan (contoh: "Hasil dari 5 + 3 adalah...")</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">type</td>
                                                        <td className="p-3 text-[11px] text-slate-400">Pilihan atau Teks</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350">Isi dengan <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">Pilihan Ganda</code> atau <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">Esai</code></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">subject</td>
                                                        <td className="p-3 text-[11px] text-slate-400">Nama Mapel</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350">Mata pelajaran. Contoh: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">Matematika</code></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">phase</td>
                                                        <td className="p-3 text-[11px] text-slate-400 font-sans">Satu Huruf</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350">Harus berupa salah satu: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">D</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">E</code>, atau <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">F</code></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">optionA-E</td>
                                                        <td className="p-3 text-[11px] text-slate-400 font-sans">Opsi Pilihan</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350 font-sans">Pisahkan opsi di masing-masing kolom (<code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">optionA</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">optionB</code>, dst)</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold font-sans">correctAnswer</td>
                                                        <td className="p-3 text-[11px] text-slate-400 font-sans">Index atau Huruf</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350 font-sans font-sans">Tuliskan index angka (<code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">0</code> untuk A, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">1</code> untuk B, dst) atau teks opsi yang benar.</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-500">mediaType</td>
                                                        <td className="p-3 text-[11px] text-slate-400 font-sans">Pilihan</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350 font-sans">Isi dengan <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">Teks</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">Gambar</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">Audio</code>, atau <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-[10px]">Video</code> jika ada stimulus.</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-3 font-mono text-indigo-500">mediaUrl</td>
                                                        <td className="p-3 text-[11px] text-slate-400 font-sans">URL Link</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-350 font-sans">Tautan multimedia penunjang soal (misalnya link YouTube atau Drive)</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <button 
                                            onClick={handleDownloadExcelTemplate}
                                            type="button"
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Unduh Template Excel (.xlsx)</span>
                                        </button>
                                    </div>
                                )}

                                {activeHelpTab === 'tips' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs leading-relaxed">
                                        <div className="bg-amber-50/40 dark:bg-amber-950/15 p-4 rounded-2xl border border-amber-100/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 font-medium">
                                            <p className="font-extrabold text-amber-700 dark:text-amber-450 mb-1 flex items-center gap-1.5">
                                                <AlertCircle className="w-4 h-4" />
                                                Petunjuk Penting Menolak Kegagalan Unggah:
                                            </p>
                                            Sebelum mengunggah, bacalah rangkuman validasi di bawah ini untuk mengantisipasi kesalahan analisis parser otomatis.
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Tips Do's */}
                                            <div className="space-y-3 bg-indigo-50/25 dark:bg-indigo-950/5 p-5 rounded-2xl border border-indigo-100/30 dark:border-indigo-900/10">
                                                <h4 className="font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-2 font-sans"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Praktik Terbaik (Do)</h4>
                                                <ul className="space-y-2.5 text-slate-600 dark:text-slate-300">
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-emerald-500 font-bold">•</span>
                                                        <span>Pastikan subject dan fase tertulis jelas agar mapel tidak kosong.</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-emerald-500 font-bold">•</span>
                                                        <span>Simpan file dokumen dalam folder yang mudah diakses dan jangan ganti tipenya menjadi manual.</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-emerald-500 font-bold">•</span>
                                                        <span>Gunakan link YouTube publik yang valid untuk format multimedia stimulus Video.</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-emerald-500 font-bold">•</span>
                                                        <span>Untuk Esai, kosongkan bagian opsi pilihan pada file Excel dan tentukan Kunci dengan teks penjelasan jawaban.</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Errors Don'ts */}
                                            <div className="space-y-3 bg-rose-50/25 dark:bg-rose-950/5 p-5 rounded-2xl border border-rose-100/30 dark:border-rose-900/10">
                                                <h4 className="font-extrabold text-rose-700 dark:text-rose-450 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-500" /> Hindari Kesalahan (Don't)</h4>
                                                <ul className="space-y-2.5 text-slate-600 dark:text-slate-300">
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-rose-500 font-bold">•</span>
                                                        <span>Jangan gunakan format tabel kompleks di dalam lembar Word (.docx). Buatlah teks paragraf polos yang bersih.</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-rose-500 font-bold">•</span>
                                                        <span>Jangan menambahkan simbol lain di depan nomor pertanyaan seperti lingkaran bullet atau strip.</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-rose-500 font-bold">•</span>
                                                        <span>Jangan merubah nama header kolom Excel menjadi huruf besar/kapital (e.g. jgn ganti <code className="bg-slate-100 dark:bg-slate-800 text-rose-500 rounded px-1 font-mono">content</code>).</span>
                                                    </li>
                                                    <li className="flex items-start gap-1.5">
                                                        <span className="text-rose-500 font-bold">•</span>
                                                        <span>Jangan menutup tanda kurung tag metadata seperti <code className="bg-slate-100 dark:bg-slate-800 rounded px-1 font-mono">[SUBJEK: Fisika]</code> dengan tanda kurung biasa.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end">
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    type="button"
                                    className="px-5 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow cursor-pointer"
                                >
                                    Saya Mengerti, Tutup Panduan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingQuestionId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-250/80 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 flex-shrink-0 animate-pulse">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                            Konfirmasi Hapus Soal
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Tindakan ini tidak dapat dibatalkan
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                    Apakah Anda yakin ingin menghapus soal ini dari bank soal? Soal ini akan dihapus secara permanen dari sistem.
                                </p>
                                
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDeletingQuestionId(null)}
                                        className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <Button
                                        onClick={() => handleDeleteQuestion(deletingQuestionId)}
                                        className="py-2.5 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 active:scale-[0.98]"
                                    >
                                        Ya, Hapus
                                    </Button>
                                </div>
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-250/80 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 flex-shrink-0 animate-pulse">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                            Konfirmasi Hapus Massal
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Menghapus {selectedQuestionIds.length} soal sekaligus
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                                    Apakah Anda yakin ingin menghapus <span className="font-bold text-rose-600 dark:text-rose-450">{selectedQuestionIds.length} soal</span> terpilih dari bank soal secara massal? Tindakan ini akan menghapus semua soal terpilih secara permanen dari sistem dan tidak dapat dibatalkan.
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
                                        onClick={handleBulkDeleteQuestions}
                                        className="py-2.5 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 active:scale-[0.98]"
                                    >
                                        Ya, Hapus Semua ({selectedQuestionIds.length})
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

export default QuestionBank;
