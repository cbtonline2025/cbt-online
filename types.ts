
export enum Role {
  STUDENT = 'Siswa',
  TEACHER = 'Guru',
  ADMIN = 'Proktor',
}

export enum View {
    LOGIN,
    REGISTER,
    CONFIRM_DATA,
    STUDENT_DASHBOARD,
    TEACHER_DASHBOARD,
    ADMIN_DASHBOARD,
    EXAM_SESSION,
    EXAM_END_SCREEN,
}

export interface StudentData {
  nisn?: string;
  username?: string;
  fullName: string;
  class: string; // e.g., 'X-A', 'VII-B'
  school: string;
  city: string;
  province: string;
  password?: string;
}

export interface User {
  id: string;
  username: string; // For students, username is generated or NISN
  fullName: string;
  role: Role;
  password?: string;
  details?: StudentData | any; // More specific types for teacher/admin can be added
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'Pilihan Ganda',
  ESSAY = 'Esai',
}

export enum QuestionMediaType {
  TEXT = 'Teks',
  AUDIO = 'Audio',
  VIDEO = 'Video',
}

export interface QuestionOption {
    id: string;
    text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  mediaType?: QuestionMediaType; // Default to TEXT if not present
  promptText?: string; // Text accompanying media, e.g., "Listen to the audio..."
  content: string; // For TEXT, it's the question. For media, it's the URL.
  options?: QuestionOption[];
  correctAnswer: string; // For MC, option id. For Essay, key points.
  phase: 'D' | 'E' | 'F';
  subject: string;
}

export interface Exam {
    id: string;
    title: string;
    subject: string;
    phase: 'D' | 'E' | 'F';
    durationMinutes: number;
    questionIds: string[];
    durationType?: 'per-exam' | 'per-question';
    durationSecondsPerQuestion?: number;
}

export interface StudentAnswer {
    questionId: string;
    answer: string; // optionId for MC, text for Essay
    isDoubtful: boolean;
}

export interface ExamResult {
    examId: string;
    studentId: string;
    score: number;
    answers: StudentAnswer[];
    startedAt: Date;
    finishedAt: Date;
}
