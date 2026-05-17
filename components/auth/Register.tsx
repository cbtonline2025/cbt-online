
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { StudentData } from '../../types';
import { fetchNISNData, mockUsers } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { motion } from 'motion/react';
import { UserPlus, Search, User, BookOpen, School, MapPin, Globe, ChevronRight } from 'lucide-react';

interface RegisterProps {
    onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginClick }) => {
  const [nisn, setNisn] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [nisnError, setNisnError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<StudentData, 'nisn'>>({
    fullName: '',
    class: '',
    school: '',
    city: '',
    province: '',
  });

  const { registerStudent } = useContext(AuthContext);

  const handleNisnSearch = async () => {
    const trimmedNisn = nisn.trim();
    setNisnError(null);

    if (!trimmedNisn || trimmedNisn.length !== 10) {
      setNisnError("NISN harus 10 digit.");
      return;
    }

    setIsSearching(true);

    try {
        // Check if already registered in mockUsers
        const isDuplicate = mockUsers.some(u => u.username === trimmedNisn);
        if (isDuplicate) {
            setNisnError("NISN ini sudah terdaftar. Silakan masuk.");
            setIsSearching(false);
            return;
        }

        const data = await fetchNISNData(trimmedNisn);
        if (data) {
          setFormData({
            fullName: data.fullName,
            class: data.class,
            school: data.school,
            city: data.city,
            province: data.province,
          });
        } else {
          alert("Data NISN tidak ditemukan. Silakan isi data secara manual.");
        }
    } catch (error) {
        console.error("Search error:", error);
    } finally {
        setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNisn = nisn.trim();
    setNisnError(null);

    if(!trimmedNisn || Object.values(formData).some(val => (val as string).trim() === '')) {
        alert("Semua field wajib diisi.");
        return;
    }

    if (trimmedNisn.length !== 10) {
        setNisnError("NISN harus 10 digit.");
        return;
    }

    setIsSubmitting(true);
    try {
        // Final check before submission to prevent duplicate NISN
        // We check both the mockUsers array directly and use the service check
        const isDuplicate = mockUsers.some(u => u.username === trimmedNisn);
        
        if (isDuplicate) {
            setNisnError("NISN ini sudah terdaftar. Silakan masuk.");
            setIsSubmitting(false);
            return;
        }

        const studentPayload: StudentData = { 
            ...formData,
            nisn: trimmedNisn, // Explicitly trimming before registerStudent call
        };

        registerStudent(studentPayload);
    } catch (err) {
        console.error("Registration error:", err);
        alert("Terjadi kesalahan saat validasi NISN.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-xl glass-card p-10 relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500" />
      
      <div className="mb-10 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-[1.5rem] flex items-center justify-center mb-5 shadow-inner">
          <UserPlus className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Registrasi Siswa</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">Silakan lengkapi data diri Anda untuk memulai</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Identitas Nasional</label>
            <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                      id="nisn"
                      value={nisn}
                      onChange={(e) => {
                          setNisn(e.target.value);
                          if (nisnError) setNisnError(null);
                      }}
                      placeholder="Masukkan 10 digit NISN"
                      maxLength={10}
                      icon={<Search className="w-5 h-5 mr-1" />}
                      required
                      className={nisnError ? 'border-red-500 dark:border-red-900/50' : 'rounded-2xl'}
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleNisnSearch} 
                  disabled={isSearching} 
                  className="h-[68px] px-6 rounded-2xl flex items-center justify-center min-w-[100px]"
                >
                    {isSearching ? <Spinner size="small" /> : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">CARI</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                </Button>
            </div>
            {nisnError && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-red-500 dark:text-red-400 font-bold uppercase tracking-wider px-2"
                >
                  {nisnError}
                </motion.p>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed border-slate-100 dark:border-slate-800/50">
            <Input 
              id="fullName" 
              name="fullName" 
              label="Nama Lengkap" 
              value={formData.fullName} 
              onChange={handleInputChange} 
              icon={<User className="w-4 h-4" />}
              placeholder="Sesuai Akta/Ijazah"
              required 
            />
            <Input 
              id="class" 
              name="class" 
              label="Kelas" 
              placeholder="Contoh: XII MIPA 1" 
              value={formData.class} 
              onChange={handleInputChange} 
              icon={<BookOpen className="w-4 h-4" />}
              required 
            />
            <Input 
              id="school" 
              name="school" 
              label="Asal Sekolah" 
              value={formData.school} 
              onChange={handleInputChange} 
              icon={<School className="w-4 h-4" />}
              placeholder="Nama Instansi"
              required 
            />
            <Input 
              id="city" 
              name="city" 
              label="Kota/Kabupaten" 
              value={formData.city} 
              onChange={handleInputChange} 
              icon={<MapPin className="w-4 h-4" />}
              placeholder="Domisili"
              required 
            />
        </div>
        <Input 
          id="province" 
          name="province" 
          label="Provinsi" 
          value={formData.province} 
          onChange={handleInputChange} 
          icon={<Globe className="w-4 h-4" />}
          placeholder="Wilayah"
          required 
        />
        
        <Button 
          type="submit" 
          className="w-full !mt-10 py-5 text-sm font-bold tracking-[0.1em] rounded-2xl shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all bg-emerald-600 hover:bg-emerald-500" 
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner size="small" /> : 'BUAT AKUN SISWA'}
        </Button>
      </form>
      
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-10 font-medium">
        Sudah memiliki akun?{' '}
        <button onClick={onLoginClick} className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline transition-all">
          Masuk Sekarang
        </button>
      </p>
    </motion.div>
  );
};

export default Register;
