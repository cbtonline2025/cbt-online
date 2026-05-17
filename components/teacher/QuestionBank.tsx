
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

                if (manualMediaFile) {
                    // File based media
                    content = ''; // will be filled by base64 below
                    promptText = mediaPrompt || `Media: ${manualMediaFile.name}`;
                } else {
                    // URL based media
                    if (!mediaUrl) {
                        throw new Error(`URL Media ${newQuestion.mediaType} wajib diisi.`);
                    }
                    if (!mediaPrompt) {
                        throw new Error('Teks pengantar media wajib diisi.');
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
                    
                    // Check for required headers before parsing rows
                    const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
                    const requiredHeaders = ['content', 'type', 'subject', 'phase', 'correctAnswer'];
                    const missingHeaders = requiredHeaders.filter(h => !headerRow?.includes(h));
                    
                    if (missingHeaders.length > 0) {
                        throw new Error(`File Excel tidak memiliki kolom yang diwajibkan: ${missingHeaders.join(', ')}. Harap pastikan nama kolom di baris pertama sudah benar.`);
                    }

                    const json = XLSX.utils.sheet_to_json(worksheet) as any[];

                    if (json.length === 0) {
                        throw new Error("File Excel terbaca, namun tidak ditemukan baris data soal di bawah baris judul (header).");
                    }

                    const parsedQuestions: Question[] = json.map((row, index) => {
                        const rowNum = index + 2; // +1 for 0-indexing, +1 for header row
                        
                        // 1. Periksa Kelengkapan Field Wajib
                        const mandatoryFields = ['content', 'type', 'subject', 'phase', 'correctAnswer'];
                        for (const field of mandatoryFields) {
                            const val = row[field];
                            if (val === undefined || val === null || String(val).trim() === '') {
                                throw new Error(`[BARIS ${rowNum}] Kolom '${field}' tidak boleh kosong atau hanya berisi spasi. Field wajib: content, type, subject, phase, correctAnswer.`);
                            }
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
                            throw new Error(`[BARIS ${rowNum}] Tipe Soal '${typeInput}' tidak valid. Harus 'Pilihan Ganda' atau 'Esai'.`);
                        }

                        // 3. Validasi Fase
                        const phase = String(row['phase']).trim().toUpperCase();
                        if (!['D', 'E', 'F'].includes(phase)) {
                            throw new Error(`[BARIS ${rowNum}] Fase '${phase}' tidak valid. Harus 'D', 'E', atau 'F'.`);
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
                            subject: String(row['subject']).trim(),
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
                            
                            // 6. Validasi Kunci Jawaban
                            const correctLetter = String(row['correctAnswer']).trim().toUpperCase();
                            if (!possibleOptions.includes(correctLetter)) {
                                throw new Error(`[BARIS ${rowNum}] Kunci Jawaban '${correctLetter}' tidak valid. Gunakan huruf A, B, C, D, atau E.`);
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
                    const questionsText = fullProcessedText.split(/\n\s*(?=\d+\.\s)/).filter(q => q.trim().length > 15);
                    
                    if (questionsText.length === 0) {
                        throw new Error("Tidak ada soal yang ditemukan. Pastikan soal menggunakan penomoran standar (1. Soal...)");
                    }

                    const parsedQuestions: Question[] = questionsText.map((qText, index) => {
                        const questionNum = index + 1;
                        
                        // 1. Ekstrak Metadata
                        const subjectMatch = qText.match(/\[(SUBJEK|SUBJECT|MAPEL)\s*:\s*([^\]]*)\]/i);
                        const phaseMatch = qText.match(/\[(FASE|PHASE)\s*:\s*([^\]]*)\]/i);
                        const typeMatch = qText.match(/\[(TIPE|TYPE)\s*:\s*([^\]]*)\]/i);
                        const mediaTypeMatch = qText.match(/\[(MEDIA_TYPE|TIPE_MEDIA|MEDIA)\s*:\s*([^\]]*)\]/i);
                        const mediaUrlMatch = qText.match(/\[(MEDIA_URL|URL|LINK|CONTENT)\s*:\s*([^\]]*)\]/i);
                        const explicitPromptMatch = qText.match(/\[(PROMPT_TEXT|PROMPT|INSTRUKSI|PENGANTAR|PERTANYAAN|SOAL)\s*:\s*([^\]]*)\]/i);

                        // 2. Validasi & Normalisasi Metadata Wajib
                        const subject = subjectMatch && subjectMatch[2] ? subjectMatch[2].trim() : '';
                        if (!subject) {
                            throw new Error(`[SOAL ${questionNum}] Metadata [SUBJEK] (Mapel) wajib ada dan tidak boleh kosong. Contoh: [SUBJEK: Matematika]`);
                        }

                        const phaseRaw = phaseMatch && phaseMatch[2] ? phaseMatch[2].trim().toUpperCase() : '';
                        if (!phaseRaw) {
                            throw new Error(`[SOAL ${questionNum}] Metadata [FASE] wajib ada. Contoh: [FASE: F]`);
                        }
                        if (!['D', 'E', 'F'].includes(phaseRaw)) {
                            throw new Error(`[SOAL ${questionNum}] Fase "${phaseRaw}" tidak valid. Harus D, E, atau F.`);
                        }
                        const phase = phaseRaw as 'D' | 'E' | 'F';

                        // 3. Tipe Media & URL
                        let mediaType = QuestionMediaType.TEXT;
                        if (mediaTypeMatch && mediaTypeMatch[2]) {
                            const mTypeRaw = mediaTypeMatch[2].trim().toLowerCase();
                            if (mTypeRaw === 'audio' || mTypeRaw.includes('audio')) mediaType = QuestionMediaType.AUDIO;
                            else if (mTypeRaw === 'video' || mTypeRaw.includes('video')) mediaType = QuestionMediaType.VIDEO;
                            else if (mTypeRaw === 'teks' || mTypeRaw.includes('text') || mTypeRaw === 'text') mediaType = QuestionMediaType.TEXT;
                            // Jika ada tag tapi isinya aneh, default ke TEXT atau throw? User minta handle kosong.
                        }

                        let mediaUrl = '';
                        if (mediaType !== QuestionMediaType.TEXT) {
                            mediaUrl = mediaUrlMatch && mediaUrlMatch[2] ? mediaUrlMatch[2].trim() : '';
                            if (!mediaUrl) {
                                throw new Error(`[SOAL ${questionNum}] URL Media wajib ada untuk tipe ${mediaType}. Tambahkan [MEDIA_URL: http://...]`);
                            }
                        }

                        // 4. Ekstrak Konten Utama (Teks Soal / Instruksi)
                        const qTextClean = qText.replace(/\[(SUBJEK|SUBJECT|MAPEL|FASE|PHASE|TIPE|TYPE|MEDIA_TYPE|TIPE_MEDIA|MEDIA|MEDIA_URL|URL|LINK|CONTENT|PROMPT_TEXT|PROMPT|INSTRUKSI|PENGANTAR|PERTANYAAN|SOAL):.*?\]/gi, '').trim();
                        const contentMatch = qTextClean.match(/^\d+\.\s([\s\S]*?)(?=\s*\n[A-E]\.|\s*\nKUNCI:|$)/);
                        const extractedBody = contentMatch ? contentMatch[1].trim() : '';

                        let content = '';
                        let promptText: string | undefined = undefined;

                        if (mediaType === QuestionMediaType.TEXT) {
                            content = extractedBody;
                            if (!content || content.length < 3) {
                                throw new Error(`[SOAL ${questionNum}] Konten pertanyaan teks terlalu pendek atau kosong.`);
                            }
                        } else {
                            content = mediaUrl;
                            const pText = explicitPromptMatch && explicitPromptMatch[2] ? explicitPromptMatch[2].trim() : extractedBody;
                            promptText = pText || '';
                            if (!promptText || promptText.length < 3) {
                                throw new Error(`[SOAL ${questionNum}] Soal media wajib memiliki teks pertanyaan/instruksi.`);
                            }
                        }

                        // 5. Opsi & Kunci
                        const optionsMatches = [...qText.matchAll(/([A-E])\.\s(.*?)(?=\s*\n[A-E]\.|\nKUNCI:|\s*\[|$)/gs)];
                        const rawOptions = optionsMatches.map((match) => ({
                            letter: match[1].toUpperCase(),
                            text: match[2].trim()
                        })).filter(opt => opt.text !== '');

                        let type: QuestionType;
                        if (typeMatch && typeMatch[2]) {
                            const typeRaw = typeMatch[2].trim().toLowerCase();
                            if (typeRaw === 'pilihan ganda' || typeRaw.includes('choice')) type = QuestionType.MULTIPLE_CHOICE;
                            else if (typeRaw === 'esai' || typeRaw === 'essay') type = QuestionType.ESSAY;
                            else type = rawOptions.length > 0 ? QuestionType.MULTIPLE_CHOICE : QuestionType.ESSAY;
                        } else {
                            type = rawOptions.length > 0 ? QuestionType.MULTIPLE_CHOICE : QuestionType.ESSAY;
                        }

                        let correctAnswer = '';
                        let finalOptions: QuestionOption[] | undefined = undefined;

                        if (type === QuestionType.MULTIPLE_CHOICE) {
                            if (rawOptions.length < 2) {
                                throw new Error(`[SOAL ${questionNum}] Soal Pilihan Ganda minimal butuh 2 opsi (A, B, ...).`);
                            }
                            const kunciMatch = qText.match(/KUNCI\s*:\s*([A-E])/i);
                            if (!kunciMatch) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban (KUNCI: A/B/...) tidak ditemukan.`);
                            }
                            const correctLetter = kunciMatch[1].toUpperCase();
                            const matchingOpt = rawOptions.find(opt => opt.letter === correctLetter);
                            if (!matchingOpt) {
                                throw new Error(`[SOAL ${questionNum}] Kunci "${correctLetter}" merujuk pada opsi yang kosong.`);
                            }
                            finalOptions = rawOptions.map((opt, i) => ({ 
                                id: `imported-${Date.now()}-${index}-o${i + 1}`, 
                                text: opt.text 
                            }));
                            correctAnswer = finalOptions[rawOptions.findIndex(opt => opt.letter === correctLetter)].id;
                        } else {
                            const essayMatch = qText.match(/KUNCI\s*:\s*([\s\S]*?)(?=\s*\n\[|$)/i);
                            correctAnswer = essayMatch && essayMatch[1] ? essayMatch[1].trim() : '';
                            if (!correctAnswer || correctAnswer.length < 3) {
                                throw new Error(`[SOAL ${questionNum}] Kunci jawaban esai wajib ada dan valid (minimal 3 karakter).`);
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
                            subject, 
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
            {selectedQuestionId ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <QuestionDetail 
                        questionId={selectedQuestionId} 
                        onBack={() => setSelectedQuestionId(null)} 
                    />
                </div>
            ) : (
                <>
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
                                        {importMessage.type === 'success' ? 'Impor Berhasil' : 'Terjadi Kesalahan'}
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
                                <li><strong>Excel (.xlsx):</strong> Kolom <code>content</code> (atau <code>pertanyaan</code>/<code>soal</code>) diisi teks soal. Kolom <code>mediaType</code> (opsional) diisi "Teks".</li>
                                <li><strong>Word (.docx):</strong> Gunakan penomoran (contoh: <code>1. Soal ini...</code>). Setiap soal WAJIB memiliki tag <code>[SUBJEK: ...]</code> dan <code>[FASE: ...]</code>.</li>
                            </ul>
                             <p><strong>Format Audio/Video:</strong></p>
                            <ul>
                                <li><strong>Excel (.xlsx):</strong> Kolom <code>mediaType</code> diisi "Audio" atau "Video". Kolom <code>mediaUrl</code> (atau <code>url</code>/<code>link</code>) diisi link media. Kolom <code>promptText</code> (atau <code>pengantar</code>) diisi teks instruksi.</li>
                                <li><strong>Word (.docx):</strong> Tambahkan tag <code>[MEDIA_TYPE: Video]</code> dan <code>[MEDIA_URL: http://...]</code>. Gunakan <code>[PROMPT_TEXT: ...]</code> jika ingin memisahkan instruksi dari konten utama.</li>
                            </ul>
                            <p className="text-[10px] opacity-75 mt-2 italic">
                                * Berbagai sinonim didukung (contoh: [SUBJECT], [MAPEL], [URL], [INSTRUKSI]) untuk kemudahan penulisan.
                            </p>
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
                                    placeholder="Tulis pertanyaan teks di sini..."
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
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teks Pengantar / Pertanyaan</label>
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
                        {addMessage && (
                            <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${addMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                {addMessage.type === 'success' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-base mb-1">
                                        {addMessage.type === 'success' ? 'Simpan Berhasil' : 'Terjadi Kesalahan'}
                                    </h4>
                                    <p className="text-current opacity-90 text-sm">{addMessage.text}</p>
                                </div>
                            </div>
                        )}
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

                <div className="max-h-96 overflow-y-auto bg-white/30 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                    {filteredQuestions.length > 0 ? (
                        <ul className="space-y-3">
                            {[...filteredQuestions].reverse().map((q, revIndex) => {
                                const originalIndex = filteredQuestions.length - 1 - revIndex;
                                const displayIndex = filteredQuestions.length - originalIndex;
                                
                                return (
                                    <li key={q.id} className="group flex items-stretch bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-200 overflow-hidden">
                                        <button 
                                            onClick={() => setSelectedQuestionId(q.id)}
                                            className="flex-grow text-left p-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                            title="Klik untuk melihat detail soal"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                                                    #{displayIndex}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                                    {q.subject} • Fase {q.phase}
                                                </span>
                                                {q.mediaType !== QuestionMediaType.TEXT && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        {q.mediaType === QuestionMediaType.VIDEO ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15L4 14.414V9.586L5.586 9H10l5 5v5l-5-4H5.586z" /></svg>
                                                        )}
                                                        {q.mediaType}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-800 dark:text-slate-200 line-clamp-2 text-sm">
                                                {q.mediaType === QuestionMediaType.TEXT ? q.content : q.promptText}
                                            </p>
                                        </button>
                                        <div className="flex flex-col border-l border-slate-200 dark:border-slate-700/50">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingQuestionId(q.id); }}
                                                className="p-4 h-full flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                                title="Edit Soal"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
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
        </>
    )}
</div>
    );
};

export default QuestionBank;
