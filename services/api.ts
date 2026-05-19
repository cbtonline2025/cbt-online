
import { User, Role, StudentData, Question, QuestionType, Exam, QuestionMediaType } from '../types';

// --- Initial Data ---
const initialNISNData: { [key: string]: StudentData } = {
  '0012345678': {
    nisn: '0012345678',
    fullName: 'Ahmad Prasetyo',
    class: 'XII-IPA-1',
    school: 'SMA Negeri 1 Jakarta',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
  },
  '0087654321': {
    nisn: '0087654321',
    fullName: 'Budi Santoso',
    class: 'IX-B',
    school: 'SMP Negeri 2 Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
  },
};

const initialUsers: User[] = [
  { id: 'user-1', username: '0012345678', fullName: 'Ahmad Prasetyo', role: Role.STUDENT, details: initialNISNData['0012345678'] },
  { id: 'user-2', username: '0087654321', fullName: 'Budi Santoso', role: Role.STUDENT, details: initialNISNData['0087654321'] },
  { id: 'user-teacher-1', username: 'guru_ipa', fullName: 'Dr. Citra Dewi', role: Role.TEACHER },
  { id: 'user-admin-1', username: 'proktor_utama', fullName: 'Admin Utama', role: Role.ADMIN },
];

const initialQuestions: Question[] = [
    // Fase F (SMA) - Fisika
    { id: 'q1', type: QuestionType.MULTIPLE_CHOICE, mediaType: QuestionMediaType.TEXT, content: 'Sebuah benda bergerak dengan kecepatan konstan 5 m/s. Berapa jarak yang ditempuh benda tersebut setelah 10 detik?', subject: 'Fisika', phase: 'F', options: [{id: 'q1o1', text: '25 m'}, {id: 'q1o2', text: '50 m'}, {id: 'q1o3', text: '100 m'}, {id: 'q1o4', text: '10 m'}, {id: 'q1o5', text: '5 m'}], correctAnswer: 'q1o2' },
    { id: 'q2', type: QuestionType.MULTIPLE_CHOICE, mediaType: QuestionMediaType.TEXT, content: 'Hukum II Newton menyatakan bahwa percepatan sebuah benda berbanding lurus dengan...', subject: 'Fisika', phase: 'F', options: [{id: 'q2o1', text: 'Massa benda'}, {id: 'q2o2', text: 'Kecepatan benda'}, {id: 'q2o3', text: 'Gaya total yang bekerja pada benda'}, {id: 'q2o4', text: 'Volume benda'}, {id: 'q2o5', text: 'Waktu'}], correctAnswer: 'q2o3' },
    { id: 'q3', type: QuestionType.ESSAY, mediaType: QuestionMediaType.TEXT, content: 'Jelaskan secara singkat prinsip kerja transformator step-up!', subject: 'Fisika', phase: 'F', correctAnswer: 'Transformator step-up bekerja berdasarkan prinsip induksi elektromagnetik. Ia memiliki jumlah lilitan sekunder lebih banyak daripada lilitan primer, sehingga menaikkan tegangan (voltase) sambil menurunkan arus.' },
    // Fase D (SMP) - IPA
    { id: 'q4', type: QuestionType.MULTIPLE_CHOICE, mediaType: QuestionMediaType.TEXT, content: 'Proses perubahan wujud dari cair menjadi gas disebut...', subject: 'IPA', phase: 'D', options: [{id: 'q4o1', text: 'Mencair'}, {id: 'q4o2', text: 'Membeku'}, {id: 'q4o3', text: 'Menguap'}, {id: 'q4o4', text: 'Menyublim'}], correctAnswer: 'q4o3' },
    { id: 'q5', type: QuestionType.MULTIPLE_CHOICE, mediaType: QuestionMediaType.TEXT, content: 'Bagian tumbuhan yang berfungsi untuk menyerap air dan mineral dari dalam tanah adalah...', subject: 'IPA', phase: 'D', options: [{id: 'q5o1', text: 'Daun'}, {id: 'q5o2', text: 'Batang'}, {id: 'q5o3', text: 'Bunga'}, {id: 'q5o4', text: 'Akar'}], correctAnswer: 'q5o4' },
    { id: 'q6', type: QuestionType.ESSAY, mediaType: QuestionMediaType.TEXT, content: 'Sebutkan 3 contoh sumber energi terbarukan!', subject: 'IPA', phase: 'D', correctAnswer: 'Contoh sumber energi terbarukan antara lain: energi matahari (surya), energi angin, energi air (hidroelektrik), energi panas bumi (geotermal), dan biomassa.' },
    { id: 'q7', type: QuestionType.MULTIPLE_CHOICE, mediaType: QuestionMediaType.TEXT, content: 'Planet yang dikenal sebagai "Planet Merah" adalah...', subject: 'IPA', phase: 'D', options: [{id: 'q7o1', text: 'Venus'}, {id: 'q7o2', text: 'Mars'}, {id: 'q7o3', text: 'Jupiter'}, {id: 'q7o4', text: 'Saturnus'}], correctAnswer: 'q7o2' },
    // Fase F (SMA) - Bahasa Inggris (Audio)
    { 
      id: 'q8', 
      type: QuestionType.MULTIPLE_CHOICE, 
      mediaType: QuestionMediaType.AUDIO,
      promptText: 'Listen to the conversation and answer the following question: What are the speakers mainly discussing?',
      content: 'https://drive.google.com/file/d/1Y2_tQ4hV_3f7g8hI5yL9xW3zV6n7o8kU/view?usp=sharing', // Example audio
      subject: 'Bahasa Inggris', 
      phase: 'F', 
      options: [
          {id: 'q8o1', text: 'Their holiday plans'}, 
          {id: 'q8o2', text: 'A difficult assignment'}, 
          {id: 'q8o3', text: 'The weather forecast'}, 
          {id: 'q8o4', text: 'A new movie release'},
          {id: 'q8o5', text: 'Weekend sports'}
      ], 
      correctAnswer: 'q8o2' 
    },
    // Fase D (SMP) - IPS (Video YouTube)
    { 
      id: 'q9', 
      type: QuestionType.ESSAY, 
      mediaType: QuestionMediaType.VIDEO,
      promptText: 'Tonton video "Tari Saman" berikut. Berdasarkan video tersebut, jelaskan filosofi utama di balik gerakan tarian tersebut!',
      content: 'https://www.youtube.com/watch?v=R_iMAEWkulA', 
      subject: 'IPS', 
      phase: 'D', 
      correctAnswer: 'Filosofi tari Saman antara lain kebersamaan, kekompakan, kedisiplinan, serta nilai-nilai keagamaan yang tercermin dalam gerakannya yang serempak dan cepat.'
    },
    // Fase F (SMA) - Biologi (Video Drive)
    { 
      id: 'q10', 
      type: QuestionType.MULTIPLE_CHOICE, 
      mediaType: QuestionMediaType.VIDEO,
      promptText: 'Perhatikan video proses pembelahan sel berikut. Fase apa yang sedang ditunjukkan pada menit ke 0:15?',
      content: 'https://drive.google.com/file/d/1X5_tP4hV_4f7g8hI5yL9xW3zV6n7o8kU/view', // Mock Drive Video
      subject: 'Biologi', 
      phase: 'F', 
      options: [
          {id: 'q10o1', text: 'Profase'}, 
          {id: 'q10o2', text: 'Metafase'}, 
          {id: 'q10o3', text: 'Anafase'}, 
          {id: 'q10o4', text: 'Telofase'}
      ], 
      correctAnswer: 'q10o2' 
    },
    // Fase F (SMA) - Bahasa Indonesia (Audio Drive)
    { 
      id: 'q11', 
      type: QuestionType.ESSAY, 
      mediaType: QuestionMediaType.AUDIO,
      promptText: 'Dengarkan pembacaan puisi berikut dengan seksama. Apa nada (tone) yang dominan dalam pembacaan puisi tersebut?',
      content: 'https://drive.google.com/file/d/1Z3_tQ4hV_4f7g8hI5yL9xW3zV6n7o8kV/preview', // Mock Drive Audio
      subject: 'Bahasa Indonesia', 
      phase: 'F', 
      correctAnswer: 'Nada yang dominan adalah melankolis dan penuh perenungan (kontemplatif).'
    },
    // Fase F (SMA) - Bahasa Inggris (Audio Drive) - Percakapan di Bandara
    { 
      id: 'q12', 
      type: QuestionType.MULTIPLE_CHOICE, 
      mediaType: QuestionMediaType.AUDIO,
      promptText: 'Listen to the announcement at the airport. What is the main reason for the flight delay?',
      content: 'https://drive.google.com/file/d/1A9_tB4hV_xX7g8hI5yL9xW3zV6n7o8kW/preview', // Mock Drive Audio
      subject: 'Bahasa Inggris', 
      phase: 'F', 
      options: [
          {id: 'q12o1', text: 'Technical problems with the aircraft'}, 
          {id: 'q12o2', text: 'Severe weather conditions'}, 
          {id: 'q12o3', text: 'Late arrival of the incoming flight'}, 
          {id: 'q12o4', text: 'A strike by airport personnel'}
      ], 
      correctAnswer: 'q12o2' 
    },
    // Fase F (SMA) - Geografi (Video YouTube) - Proses Erupsi Gunung Api
    { 
      id: 'q13', 
      type: QuestionType.ESSAY, 
      mediaType: QuestionMediaType.VIDEO,
      promptText: 'Simak video simulasi erupsi gunung api ini. Deskripsikan urutan kejadian mulai dari aktivitas magma hingga terjadinya aliran piroklastik!',
      content: 'https://www.youtube.com/watch?v=VB62O76fCQQ', 
      subject: 'Geografi', 
      phase: 'F', 
      correctAnswer: 'Aktivitas dimulai dengan peningkatan tekanan magma di dapur magma, diikuti munculnya gempa vulkanik. Selanjutnya terjadi letusan eksplosif yang melontarkan material vulkanik, dan diakhiri dengan runtuhnya kolom letusan yang membentuk aliran piroklastik (awan panas).'
    },
    // Fase D (SMP) - Seni Budaya (Video YouTube) - Tari Tradisional
    { 
      id: 'q14', 
      type: QuestionType.MULTIPLE_CHOICE, 
      mediaType: QuestionMediaType.VIDEO,
      promptText: 'Perhatikan gerakan tangan dan formasi dalam cuplikan pertunjukan tari ini. Berasal dari daerah manakah tari tersebut?',
      content: 'https://www.youtube.com/watch?v=F2o_S7_kP6A', 
      subject: 'Seni Budaya', 
      phase: 'D', 
      options: [
          {id: 'q14o1', text: 'Aceh'}, 
          {id: 'q14o2', text: 'Bali'}, 
          {id: 'q14o3', text: 'Sumatera Barat'}, 
          {id: 'q14o4', text: 'Papua'}
      ], 
      correctAnswer: 'q14o2' 
    },
    // Fase D (SMP) - IPA (Audio Drive) - Identifikasi Suara Burung
    { 
      id: 'q15', 
      type: QuestionType.MULTIPLE_CHOICE, 
      mediaType: QuestionMediaType.AUDIO,
      promptText: 'Dengarkan rekaman suara burung berikut. Ini adalah kicauan khas dari burung habitat hutan tropis Indonesia, yaitu...',
      content: 'https://drive.google.com/file/d/1C7_tD4hV_yY7g8hI5yL9xW3zV6n7o8kX/preview', // Mock Drive Audio
      subject: 'IPA', 
      phase: 'D', 
      options: [
          {id: 'q15o1', text: 'Burung Merpati'}, 
          {id: 'q15o2', text: 'Burung Cendrawasih'}, 
          {id: 'q15o3', text: 'Burung Jalak Bali'}, 
          {id: 'q15o4', text: 'Burung Gagak'}
      ], 
      correctAnswer: 'q15o3' 
    },
];

// --- Local Storage Keys ---
const USERS_STORAGE_KEY = 'cbt-merdeka-users';
const NISN_STORAGE_KEY = 'cbt-merdeka-nisn';
const QUESTIONS_STORAGE_KEY = 'cbt-merdeka-questions';

// --- Data Hydration ---
const loadData = <T,>(key: string, initialData: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        // If no item, set it and return initial data
        window.localStorage.setItem(key, JSON.stringify(initialData));
        return initialData;
    } catch (error) {
        console.error(`Error interacting with localStorage for key "${key}"`, error);
        return initialData;
    }
};

// --- Exported Data (Mutable) ---
export let mockUsers: User[] = loadData(USERS_STORAGE_KEY, initialUsers);
export let mockNISNData: { [key: string]: StudentData } = loadData(NISN_STORAGE_KEY, initialNISNData);
export let mockQuestions: Question[] = loadData(QUESTIONS_STORAGE_KEY, initialQuestions);

// --- Data Persistence Functions ---
const saveUsers = () => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers));
        localStorage.setItem(NISN_STORAGE_KEY, JSON.stringify(mockNISNData));
    } catch (error) {
        console.error("Error saving user data to localStorage", error);
    }
};

const saveQuestions = () => {
     try {
        localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(mockQuestions));
    } catch (error) {
        console.error("Error saving question data to localStorage", error);
    }
};


export const mockExams: Exam[] = [
    { id: 'exam-fisika-1', title: 'Ujian Akhir Semester Fisika', subject: 'Fisika', phase: 'F', durationMinutes: 90, questionIds: ['q1', 'q2', 'q3', 'q10'] },
    { id: 'exam-ipa-1', title: 'Latihan ANBK IPA', subject: 'IPA', phase: 'D', durationMinutes: 60, questionIds: ['q4', 'q5', 'q6', 'q7', 'q9'] },
    { id: 'exam-bing-1', title: 'Listening Comprehension', subject: 'Bahasa Inggris', phase: 'F', durationMinutes: 45, questionIds: ['q8', 'q11'] }
];

// Mock API functions
export const checkNISNData = async (nisn: string): Promise<User | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.username === nisn);
            resolve(user || null);
        }, 300);
    });
};

export const fetchNISNData = async (nisn: string): Promise<StudentData | null> => {
    console.log(`Searching for NISN: ${nisn}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockNISNData[nisn] || null);
        }, 500);
    });
};

export const registerNewStudent = async (studentData: StudentData): Promise<{user: User | null, error?: string}> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingUser = mockUsers.find(u => u.username === studentData.nisn);
            if (existingUser) {
                resolve({ user: null, error: 'Pengguna dengan NISN ini sudah terdaftar.' });
                return;
            }

            const newStudentUser: User = {
                id: `user-${Date.now()}`,
                username: studentData.nisn,
                fullName: studentData.fullName,
                role: Role.STUDENT,
                details: studentData,
            };
            mockUsers.push(newStudentUser);
            mockNISNData[studentData.nisn] = studentData;
            saveUsers();
            resolve({ user: newStudentUser });
        }, 300);
    });
};


export const fetchExamDetails = async (examId: string): Promise<{exam: Exam, questions: Question[]} | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const exam = mockExams.find(e => e.id === examId);
            if (!exam) {
                resolve(null);
                return;
            }
            const questions = mockQuestions.filter(q => exam.questionIds.includes(q.id));
            resolve({ exam, questions });
        }, 500);
    });
};

export const addQuestions = async (newQuestions: Question[]): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            mockQuestions.push(...newQuestions);
            saveQuestions();
            console.log('New questions added:', newQuestions);
            console.log('Total questions now:', mockQuestions.length);
            resolve(true);
        }, 300);
    });
};

export const fetchQuestionById = async (id: string): Promise<Question | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const question = mockQuestions.find(q => q.id === id);
            resolve(question || null);
        }, 300);
    });
};

export const updateQuestion = async (updatedQuestion: Question): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockQuestions.findIndex(q => q.id === updatedQuestion.id);
            if (index !== -1) {
                mockQuestions[index] = updatedQuestion;
                saveQuestions();
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    });
};
