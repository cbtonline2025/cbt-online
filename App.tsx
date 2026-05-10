
import React, { useState, useCallback, useMemo } from 'react';
import { User, Role, View, StudentData, ExamResult } from './types';
import { mockUsers, registerNewStudent } from './services/api';
import AuroraBackground from './components/layout/AuroraBackground';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ConfirmData from './components/auth/ConfirmData';
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ExamInterface from './components/student/ExamInterface';
import ExamEndScreen from './components/student/ExamEndScreen';
import ThemeToggle from './components/ui/ThemeToggle';
import Logo from './components/ui/Logo';

export const AuthContext = React.createContext<{
  user: User | null;
  login: (username: string, role: Role) => void;
  logout: () => void;
  registerStudent: (studentData: StudentData) => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  registerStudent: () => {},
});

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [tempStudentData, setTempStudentData] = useState<StudentData | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [lastExamResult, setLastExamResult] = useState<ExamResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const login = useCallback((username: string, role: Role) => {
    const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.role === role);
    if (user) {
      setCurrentUser(user);
      switch(user.role) {
        case Role.STUDENT:
          setCurrentView(View.STUDENT_DASHBOARD);
          break;
        case Role.TEACHER:
          setCurrentView(View.TEACHER_DASHBOARD);
          break;
        case Role.ADMIN:
          setCurrentView(View.ADMIN_DASHBOARD);
          break;
      }
    } else {
      // In a real app, you would show an error message.
      console.error("Login failed");
      alert("Login Gagal! Pastikan username dan peran Anda benar.");
    }
  }, []);

  const registerStudent = useCallback(async (studentData: StudentData) => {
    const result = await registerNewStudent(studentData);
    if (result.user) {
        setTempStudentData(studentData);
        setCurrentView(View.CONFIRM_DATA);
    } else {
        alert(result.error || 'Terjadi kesalahan saat registrasi.');
    }
  }, []);


  const confirmRegistration = useCallback(() => {
    setTempStudentData(null);
    setCurrentView(View.LOGIN);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setActiveExamId(null);
    setLastExamResult(null);
    setCurrentView(View.LOGIN);
  }, []);

  const startExam = useCallback((examId: string) => {
    setActiveExamId(examId);
    setCurrentView(View.EXAM_SESSION);
  }, []);

  const finishExam = useCallback((result: ExamResult) => {
    setLastExamResult(result);
    setActiveExamId(null);
    setCurrentView(View.EXAM_END_SCREEN);
  }, []);
  
  const returnToDashboard = useCallback(() => {
      setLastExamResult(null);
      if(currentUser?.role === Role.STUDENT) {
          setCurrentView(View.STUDENT_DASHBOARD);
      } else {
          logout(); // Fallback to login if something is wrong
      }
  }, [currentUser, logout]);


  const authContextValue = useMemo(() => ({
    user: currentUser,
    login,
    logout,
    registerStudent,
  }), [currentUser, login, logout, registerStudent]);

  const renderContent = () => {
    switch (currentView) {
      case View.LOGIN:
        return <Login onRegisterClick={() => setCurrentView(View.REGISTER)} />;
      case View.REGISTER:
        return <Register onLoginClick={() => setCurrentView(View.LOGIN)} />;
      case View.CONFIRM_DATA:
        return tempStudentData && <ConfirmData studentData={tempStudentData} onConfirm={confirmRegistration} />;
      
      case View.STUDENT_DASHBOARD:
        return currentUser && <StudentDashboard user={currentUser} onStartExam={startExam} logout={logout} />;
      case View.TEACHER_DASHBOARD:
        return currentUser && <TeacherDashboard user={currentUser} logout={logout} />;
      case View.ADMIN_DASHBOARD:
        return currentUser && <AdminDashboard user={currentUser} logout={logout} />;
        
      case View.EXAM_SESSION:
        return activeExamId && <ExamInterface examId={activeExamId} onFinishExam={finishExam} />;
      case View.EXAM_END_SCREEN:
        return lastExamResult && <ExamEndScreen result={lastExamResult} onReturnToDashboard={returnToDashboard} />;

      default:
        return <Login onRegisterClick={() => setCurrentView(View.REGISTER)} />;
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className={`relative min-h-screen w-full bg-gray-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <AuroraBackground />
        
        {/* Global Header */}
        <header className="relative z-20 w-full px-6 py-4 flex justify-between items-center bg-white/10 dark:bg-slate-950/20 backdrop-blur-md border-b border-white/20 dark:border-white/5">
          <Logo showAuthor={true} />
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        </header>

        <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          {renderContent()}
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
