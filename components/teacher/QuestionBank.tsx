
import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Question, QuestionType, QuestionOption, QuestionMediaType } from '../../types';
import { addQuestions, mockQuestions } from '../../services/api';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Input from '../ui/Input';
import QuestionDetail from './QuestionDetail';
import EditQuestionModal from './EditQuestionModal';

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
    const [activeTab, setActiveTab] = useState('import');
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    // State for importing
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [questions, setQuestions] = useState<Question[]>(mockQuestions);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for manual add
    const [newQuestion, setNewQuestion] = useState({
        content: '',
        mediaType: QuestionMediaType.TEXT,
        mediaUrl: '',
        promptText: '',
        type: QuestionType.MULTIPLE_CHOICE,
        subject: '',
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
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedPhase, setSelectedPhase] = useState('all');


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
                setImportMessage({ type: 'success', text: `Berhasil! ${newQuestions.length} soal baru telah ditambahkan ke bank soal Anda.` });
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
            if (!newQuestion.subject || typeof newQuestion.subject !== 'string' || newQuestion.subject.trim().length === 0) {
                 throw new Error('Mata pelajaran wajib diisi dan tidak boleh hanya berisi spasi.');
            }

            const questionToAdd: Question = {
                id: `manual-${Date.now()}`,
                content: '',
                type: newQuestion.type,
                mediaType: newQuestion.mediaType,
                subject: newQuestion.subject.trim(),
                phase: newQuestion.phase,
                correctAnswer: '',
                options: [],
            };

            if (newQuestion.mediaType === QuestionMediaType.TEXT) {
                if (!newQuestion.content.trim()) throw new Error('Konten soal wajib diisi.');
                questionToAdd.content = newQuestion.content.trim();
            } else {
                if (manualMediaFile) {
                    // Convert file to Base64
                    const reader = new FileReader();
                    const base64Promise = new Promise<string>((resolve, reject) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(manualMediaFile);
                    });
                    questionToAdd.content = await base64Promise;
                    questionToAdd.promptText = newQuestion.promptText.trim() || `Media: ${manualMediaFile.name}`;
                } else {
                    if (!newQuestion.mediaUrl.trim()) throw new Error('URL Media wajib diisi.');
                    if (!newQuestion.promptText.trim()) throw new Error('Teks Pengantar Media wajib diisi.');
                    questionToAdd.content = newQuestion.mediaUrl.trim();
                    questionToAdd.promptText = newQuestion.promptText.trim();
                }
            }

            if (newQuestion.type === QuestionType.MULTIPLE_CHOICE) {
                const validOptions = newQuestion.options.filter(opt => opt.text.trim() !== '');
                if (validOptions.length < 2) {
                    throw new Error('Pilihan ganda harus memiliki minimal 2 opsi jawaban yang valid.');
                }
                if (newQuestion.options[newQuestion.correctAnswerIndex].text.trim() === '') {
                    throw new Error('Kunci jawaban yang dipilih tidak boleh kosong.');
                }
                
                questionToAdd.options = validOptions.map((opt, i) => ({ id: `${questionToAdd.id}-o${i+1}`, text: opt.text }));
                
                const correctOptionText = newQuestion.options[newQuestion.correctAnswerIndex].text;
                const newCorrectIndex = validOptions.findIndex(opt => opt.text === correctOptionText);

                if (newCorrectIndex === -1) {
                    throw new Error('Kunci jawaban yang dipilih tidak valid atau tidak diisi.');
                }
                questionToAdd.correctAnswer = questionToAdd.options[newCorrectIndex].id;

            } else { // Essay
                if (!newQuestion.essayAnswer.trim()) {
                    throw new Error('Kunci jawaban esai wajib diisi.');
                }
                questionToAdd.correctAnswer = newQuestion.essayAnswer.trim();
                delete questionToAdd.options;
            }

            await addQuestions([questionToAdd]);
            setQuestions(prev => [questionToAdd, ...prev]);
            setAddMessage({ type: 'success', text: 'Soal berhasil ditambahkan!' });

            // Reset form
            setNewQuestion({
                content: '', mediaType: QuestionMediaType.TEXT, mediaUrl: '', promptText: '',
                type: QuestionType.MULTIPLE_CHOICE, subject: '', phase: 'F',
                options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
                correctAnswerIndex: 0, essayAnswer: ''
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
        const subjects = new Set(questions.map(q => q.subject));
        return ['all', ...Array.from(subjects).sort()];
    }, [questions]);

    const subjectCounts = useMemo(() => {
        return questions.reduce((acc, q) => {
            acc[q.subject] = (acc[q.subject] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const contentToSearch = q.mediaType === QuestionMediaType.TEXT ? q.content : q.promptText || '';
            const searchMatch = contentToSearch.toLowerCase().includes(searchQuery.toLowerCase());
            const subjectMatch = selectedSubject === 'all' || q.subject === selectedSubject;
            const phaseMatch = selectedPhase === 'all' || q.phase === selectedPhase;
            return searchMatch && subjectMatch && phaseMatch;
        });
    }, [questions, searchQuery, selectedSubject, selectedPhase]);
    
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedSubject('all');
        setSelectedPhase('all');
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

    const parseXLSX = (file: File): Promise<Question[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet) as any[];

                    const parsedQuestions: Question[] = json.map((row, index) => {
                        const rowNum = index + 2;
                        const requiredFields = ['content', 'type', 'subject', 'phase', 'correctAnswer'];
                        
                        // 1. Periksa Kelengkapan Field Wajib
                        for (const field of requiredFields) {
                            const val = row[field];
                            if (val === undefined || val === null || String(val).trim() === '') {
                                throw new Error(`[BARIS ${rowNum}] Kolom '${field}' WAJIB DIISI namun ditemukan kosong. Harap lengkapi data pada file Excel Anda.`);
                            }
                        }

                        // 2. Normalisasi & Validasi Tipe Soal
                        const typeInput = String(row['type']).trim();
                        let type: QuestionType;
                        if (typeInput.toLowerCase() === 'pilihan ganda' || typeInput === QuestionType.MULTIPLE_CHOICE) {
                            type = QuestionType.MULTIPLE_CHOICE;
                        } else if (typeInput.toLowerCase() === 'esai' || typeInput === QuestionType.ESSAY) {
                            type = QuestionType.ESSAY;
                        } else {
                            throw new Error(`[BARIS ${rowNum}] Tipe Soal '${typeInput}' TIDAK VALID. Gunakan "Pilihan Ganda" atau "Esai" (tanpa tanda petik).`);
                        }

                        // 3. Validasi Fase
                        const phase = String(row['phase']).trim().toUpperCase();
                        if (!['D', 'E', 'F'].includes(phase)) {
                            throw new Error(`[BARIS ${rowNum}] Fase '${phase}' TIDAK VALID. Kurikulum Merdeka hanya mendukung Fase D, E, atau F.`);
                        }

                        // 4. Normalisasi & Validasi Tipe Media
                        let mediaType = QuestionMediaType.TEXT;
                        if (row['mediaType']) {
                            const mTypeInput = String(row['mediaType']).trim().toLowerCase();
                            if (mTypeInput === 'audio' || mTypeInput === 'video' || mTypeInput === 'teks' ||
                                Object.values(QuestionMediaType).some(v => v.toLowerCase() === mTypeInput)) {
                                
                                if (mTypeInput === 'audio' || mTypeInput.includes('audio')) mediaType = QuestionMediaType.AUDIO;
                                else if (mTypeInput === 'video' || mTypeInput.includes('video')) mediaType = QuestionMediaType.VIDEO;
                                else mediaType = QuestionMediaType.TEXT;
                            } else {
                                throw new Error(`[BARIS ${rowNum}] Tipe Media '${row['mediaType']}' tidak dikenali. Gunakan: Teks, Audio, atau Video.`);
                            }
                        }

                        const question: Question = {
                            id: `imported-${Date.now()}-${index}`,
                            content: String(row['content']).trim(),
                            type,
                            mediaType,
                            promptText: row['promptText'] ? String(row['promptText']).trim() : undefined,
                            subject: String(row['subject']).trim(),
                            phase: phase as 'D' | 'E' | 'F',
                            correctAnswer: String(row['correctAnswer']).trim(),
                            options: [],
                        };

                        if (question.type === QuestionType.MULTIPLE_CHOICE) {
                            // 5. Validasi Minimal 2 Opsi Jawaban
                            question.options = ['A', 'B', 'C', 'D', 'E']
                                .map((opt, i) => {
                                    const optText = row[`option${opt}`];
                                    return { 
                                        id: `${question.id}-o${i + 1}`, 
                                        text: optText ? String(optText).trim() : '' 
                                    };
                                })
                                .filter(opt => opt.text !== '');

                            if (question.options.length < 2) {
                                throw new Error(`[BARIS ${rowNum}] Soal Pilihan Ganda minimal harus memiliki 2 opsi. Harap isi setidaknya kolom 'optionA' dan 'optionB'.`);
                            }
                            
                            // 6. Validasi Kunci Jawaban (Format Huruf A-E)
                            const correctLetter = String(row['correctAnswer']).trim().toUpperCase();
                            if (!['A', 'B', 'C', 'D', 'E'].includes(correctLetter)) {
                                throw new Error(`[BARIS ${rowNum}] Kunci Jawaban '${correctLetter}' tidak valid. Untuk Pilihan Ganda, gunakan satu huruf: A, B, C, D, atau E.`);
                            }

                            // Pastikan kunci yang dipilih merujuk pada opsi yang ada isinya
                            const optValueForLetter = row[`option${correctLetter}`];
                            if (!optValueForLetter || String(optValueForLetter).trim() === '') {
                                throw new Error(`[BARIS ${rowNum}] Kunci '${correctLetter}' merujuk pada Opsi ${correctLetter} yang kosong. Harap isi teks pada kolom 'option${correctLetter}'.`);
                            }

                            const correctOptionText = String(optValueForLetter).trim();
                            const finalCorrectOption = question.options.find(opt => opt.text === correctOptionText);

                            if (!finalCorrectOption) {
                                throw new Error(`[BARIS ${rowNum}] Sinkronisasi Gagal: Tidak dapat menemukan teks opsi '${correctOptionText}' di daftar opsi yang diproses.`);
                            }
                            question.correctAnswer = finalCorrectOption.id;
                        } else {
                            // 7. Validasi Kunci Jawaban Esai
                            if (question.correctAnswer.length < 5) {
                                throw new Error(`[BARIS ${rowNum}] Kunci Jawaban Esai terlalu pendek (minimal 5 karakter). Berikan jawaban ideal yang cukup deskriptif untuk analisis AI.`);
                            }
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
                        throw new Error("File Word tampak kosong atau tidak terbaca.");
                    }

                    // Split dengan memastikan nomor soal tetap ada di awal setiap elemen
                    const fullProcessedText = "\n" + text.trim();
                    const questionsText = fullProcessedText.split(/\n\s*(?=\d+\.\s)/).filter(q => q.trim().length > 15);
                    
                    if (questionsText.length === 0) {
                        throw new Error("Tidak ada soal yang ditemukan. Pastikan soal menggunakan penomoran standar (1. Soal...)");
                    }

                    const parsedQuestions: Question[] = questionsText.map((qText, index) => {
                        const questionNum = index + 1;
                        
                        // 1. Ekstrak & Validasi Metadata (Subjek & Fase)
                        const subjectMatch = qText.match(/\[SUBJEK:\s*([^\]]+)\]/i);
                        const phaseMatch = qText.match(/\[FASE:\s*([^\]]+)\]/i);

                        if (!subjectMatch) {
                            throw new Error(`[SOAL ${questionNum}] Tag metadata [SUBJEK] tidak ditemukan. Format wajib: [SUBJEK: Nama Pelajaran]`);
                        }
                        const subject = subjectMatch[1].trim();
                        if (!subject) {
                            throw new Error(`[SOAL ${questionNum}] Nama pelajaran pada tag [SUBJEK] tidak boleh kosong.`);
                        }

                        if (!phaseMatch) {
                            throw new Error(`[SOAL ${questionNum}] Tag metadata [FASE] tidak ditemukan. Format wajib: [FASE: D/E/F]`);
                        }
                        const phase = phaseMatch[1].trim().toUpperCase();
                        if (!['D', 'E', 'F'].includes(phase)) {
                            throw new Error(`[SOAL ${questionNum}] Fase "${phase}" tidak valid. Kurikulum Merdeka hanya mendukung Fase D, E, atau F.`);
                        }

                        // 2. Ekstrak Info Media (Opsional)
                        const mediaTypeMatch = qText.match(/\[MEDIA_TYPE:\s*(.*?)\]/i);
                        const mediaUrlMatch = qText.match(/\[MEDIA_URL:\s*(.*?)\]/i);
                        let mediaType = QuestionMediaType.TEXT;
                        let content = '';
                        let promptText = '';

                        if (mediaTypeMatch) {
                            const mTypeRaw = mediaTypeMatch[1].trim().toLowerCase();
                            if (mTypeRaw === 'audio' || mTypeRaw.includes('audio')) mediaType = QuestionMediaType.AUDIO;
                            else if (mTypeRaw === 'video' || mTypeRaw.includes('video')) mediaType = QuestionMediaType.VIDEO;
                            else if (mTypeRaw === 'teks' || mTypeRaw.includes('text')) mediaType = QuestionMediaType.TEXT;
                            else throw new Error(`[SOAL ${questionNum}] Tipe media "${mTypeRaw}" tidak dikenali. Gunakan Teks, Audio, atau Video.`);
                        }

                        // 3. Ekstrak Konten Utama (Soal) - Bersihkan dari tag metadata agar tidak mengganggu regex
                        const qTextClean = qText.replace(/\[(SUBJEK|FASE|MEDIA_TYPE|MEDIA_URL):.*?\]/gi, '').trim();
                        const contentMatch = qTextClean.match(/^\d+\.\s([\s\S]*?)(?=\s*\n[A-E]\.|\s*\nKUNCI:|$)/);
                        const extractedContent = contentMatch ? contentMatch[1].trim() : '';

                        if (mediaType !== QuestionMediaType.TEXT) {
                            if (!mediaUrlMatch || !mediaUrlMatch[1].trim()) {
                                throw new Error(`[SOAL ${questionNum}] URL Media WAJIB ada jika tipe media adalah ${mediaType}. Tambahkan tag [MEDIA_URL: http://...]`);
                            }
                            content = mediaUrlMatch[1].trim();
                            promptText = extractedContent;
                            if (!promptText) throw new Error(`[SOAL ${questionNum}] Teks pengantar soal media (sebelum URL) tidak boleh kosong.`);
                        } else {
                            content = extractedContent;
                            if (!content) throw new Error(`[SOAL ${questionNum}] Konten teks soal tidak ditemukan. Pastikan format nomor soal benar (Contoh: 1. Apa itu...)`);
                        }

                        // 4. Ekstrak Opsi Jawaban
                        const optionsMatches = [...qText.matchAll(/([A-E])\.\s(.*?)(?=\s*\n[A-E]\.|\nKUNCI:|\s*\[|$)/gs)];
                        const options: QuestionOption[] = optionsMatches.map((match, i) => ({ 
                            id: `imported-${Date.now()}-${index}-o${i + 1}`, 
                            text: match[2].trim() 
                        }));
                        
                        const type = options.length > 0 ? QuestionType.MULTIPLE_CHOICE : QuestionType.ESSAY;
                        let correctAnswer = '';

                        if (type === QuestionType.MULTIPLE_CHOICE) {
                            // 5. Validasi Minimal 2 Opsi
                            if (options.length < 2) {
                                throw new Error(`[SOAL ${questionNum}] Soal Pilihan Ganda minimal harus memiliki 2 opsi (A. ... dan B. ...).`);
                            }
                            
                            // 6. Validasi Kunci Jawaban (MC)
                            const correctAnswerMatch = qText.match(/KUNCI:\s*([A-E])/i);
                            if (!correctAnswerMatch) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban pilihan ganda tidak ditemukan. Gunakan format "KUNCI: A" (tanpa tanda petik).`);
                            }
                            
                            const correctLetter = correctAnswerMatch[1].toUpperCase();
                            const correctIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(correctLetter);
                            if (correctIndex === -1 || !options[correctIndex]) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban "${correctLetter}" merujuk pada opsi yang tidak ada dalam dokumen.`);
                            }
                            correctAnswer = options[correctIndex].id;
                        } else {
                            // 7. Validasi Kunci Jawaban (Esai)
                            const essayAnswerMatch = qText.match(/KUNCI:\s*([\s\S]*?)(?=\s*\n\[|$)/i);
                            if (!essayAnswerMatch || !essayAnswerMatch[1].trim()) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban esai tidak ditemukan. Gunakan format "KUNCI: Teks Jawaban Ideal".`);
                            }
                            correctAnswer = essayAnswerMatch[1].trim();
                            if (correctAnswer.length < 5) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban esai terlalu pendek (minimal 5 karakter) untuk analisis AI.`);
                            }
                        }

                        const finalQuestion: Question = { 
                            id: `imported-${Date.now()}-${index}`, 
                            content, 
                            options: type === QuestionType.MULTIPLE_CHOICE ? options : undefined, 
                            type, 
                            mediaType,
                            promptText: mediaType !== QuestionMediaType.TEXT ? promptText : undefined,
                            correctAnswer, 
                            subject, 
                            phase: phase as 'D' | 'E' | 'F' 
                        };
                        return finalQuestion;
                    });
                    resolve(parsedQuestions);
                } catch (err: any) { reject(err); }
            };
            reader.onerror = reject; reader.readAsArrayBuffer(file);
        });
    };

    if (selectedQuestionId) {
        return <QuestionDetail questionId={selectedQuestionId} onBack={() => setSelectedQuestionId(null)} />;
    }

    return (
        <div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Impor Soal Baru</h3>
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
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Seret & lepas file di sini, atau</p>
                                    <Button type="button" variant="secondary" onClick={handleSelectFileClick}>
                                        Pilih File...
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Button onClick={handleImport} disabled={isParsing || !selectedFile} className="mt-4 w-full flex justify-center items-center gap-2">
                            {isParsing && <Spinner size="small" />}
                            {isParsing ? 'Sedang Mengimpor...' : 'Impor Sekarang'}
                        </Button>

                        {importMessage && (
                           <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${importMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                {importMessage.type === 'success' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-base mb-1">
                                        {importMessage.type === 'success' ? 'Impor Selesai' : 'Terjadi Kesalahan'}
                                    </h4>
                                    <p className="text-current opacity-90 text-sm">{importMessage.text}</p>
                                </div>
                           </div>
                        )}
                    </div>
                    <div className="bg-white/30 dark:bg-slate-900/50 p-6 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Petunjuk Format</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p><strong>Format Teks:</strong></p>
                            <ul>
                                <li><strong>Excel (.xlsx):</strong> Kolom <code>content</code> diisi teks soal. Kolom <code>mediaType</code> diisi "Teks".</li>
                                <li><strong>Word (.docx):</strong> Tulis soal seperti biasa. Setiap soal WAJIB memiliki tag <code>[SUBJEK: ...]</code> dan <code>[FASE: ...]</code>.</li>
                            </ul>
                             <p><strong>Format Audio/Video:</strong></p>
                            <ul>
                                <li><strong>Excel (.xlsx):</strong> Kolom <code>mediaType</code> diisi "Audio" atau "Video". Kolom <code>content</code> diisi URL media. Kolom <code>promptText</code> diisi teks pengantar.</li>
                                <li><strong>Word (.docx):</strong> Gunakan tag <code>[MEDIA_TYPE: Video]</code>, <code>[MEDIA_URL: http://...]</code>. Tag <code>[SUBJEK]</code> dan <code>[FASE]</code> tetap wajib ada di setiap soal.</li>
                            </ul>
                        </div>
                    </div>
                </div>
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
                                className="w-full md:w-1/3 bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value={QuestionMediaType.TEXT}>Teks</option>
                                <option value={QuestionMediaType.AUDIO}>Audio</option>
                                <option value={QuestionMediaType.VIDEO}>Video</option>
                            </select>
                        </div>

                        {newQuestion.mediaType === QuestionMediaType.TEXT ? (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Konten Soal (Teks)</label>
                                <textarea
                                    placeholder="Tulis konten soal di sini..."
                                    rows={4}
                                    value={newQuestion.content}
                                    onChange={(e) => handleNewQuestionChange('content', e.target.value)}
                                    className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 p-3 focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                />
                            </div>
                        ) : (
                            <div className='space-y-4 pt-2'>
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-grow w-full">
                                        <Input 
                                            label={`URL Media ${newQuestion.mediaType} (Google Drive / YouTube)`}
                                            value={newQuestion.mediaUrl} 
                                            onChange={(e) => handleNewQuestionChange('mediaUrl', e.target.value)} 
                                            placeholder="https://..."
                                            disabled={!!manualMediaFile}
                                        />
                                    </div>
                                    <div className="flex-shrink-0 mb-4">
                                        <input 
                                            type="file" 
                                            ref={manualFileInputRef} 
                                            className="hidden" 
                                            onChange={handleManualFileChange}
                                            accept={newQuestion.mediaType === QuestionMediaType.AUDIO ? "audio/*" : "video/*"}
                                        />
                                        {manualMediaFile ? (
                                            <Button type="button" variant="secondary" onClick={handleClearManualFile} className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                Hapus
                                            </Button>
                                        ) : (
                                            <Button type="button" variant="secondary" onClick={() => manualFileInputRef.current?.click()}>
                                                Unggah File
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teks Pengantar</label>
                                    <textarea
                                        placeholder={`Tulis teks pengantar untuk ${newQuestion.mediaType.toLowerCase()} di sini (misal: 'Perhatikan ${newQuestion.mediaType.toLowerCase()} berikut untuk menjawab...')`}
                                        rows={3}
                                        value={newQuestion.promptText}
                                        onChange={(e) => handleNewQuestionChange('promptText', e.target.value)}
                                        className="w-full bg-white/40 dark:bg-slate-800/50 border border-slate-300/80 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 p-3 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}
                       
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <Input label="Mata Pelajaran" value={newQuestion.subject} onChange={(e) => handleNewQuestionChange('subject', e.target.value)} />
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
                         {addMessage && <p className={`mt-4 text-sm font-medium p-3 rounded-lg ${addMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>{addMessage.text}</p>}
                     </div>
                 </div>
            )}

            <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                     <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Daftar Soal ({filteredQuestions.length})</h3>
                     <Button onClick={handleExportToCSV} variant="secondary" className="py-2 px-4 text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Ekspor ke CSV
                    </Button>
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
                                            ? `Semua Mapel (${questions.length})` 
                                            : `${sub} (${subjectCounts[sub] || 0})`
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

                <div className="max-h-96 overflow-y-auto bg-white/30 dark:bg-slate-900/50 p-4 rounded-lg">
                    {filteredQuestions.length > 0 ? (
                        <ul className="space-y-3">
                            {filteredQuestions.map((q, index) => (
                                <li key={q.id} className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/60 rounded-md text-sm hover:bg-white/80 dark:hover:bg-slate-800 transition-colors">
                                    <button 
                                        onClick={() => setSelectedQuestionId(q.id)}
                                        className="flex-grow text-left p-2"
                                    >
                                        <strong className="text-indigo-700 dark:text-indigo-400">{filteredQuestions.length - index}. ({q.subject} - {q.phase})</strong>
                                        <p className="mt-1 truncate text-slate-800 dark:text-slate-200">{q.mediaType === QuestionMediaType.TEXT ? q.content : q.promptText}</p>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingQuestionId(q.id); }}
                                        className="ml-4 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                                        title="Edit Soal"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                </li>
                            )).reverse()}
                        </ul>
                    ) : (
                        <div className="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <p className="mt-4 text-slate-600 dark:text-slate-400 font-semibold">Tidak ada soal yang cocok</p>
                            <p className="text-sm text-slate-500 dark:text-slate-500">Coba ubah kata kunci atau filter Anda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionBank;
