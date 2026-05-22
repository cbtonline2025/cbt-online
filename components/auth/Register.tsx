import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { StudentData } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { motion } from 'motion/react';
import { UserPlus, User, BookOpen, School, MapPin, Globe } from 'lucide-react';

interface RegisterProps {
    onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginClick }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<StudentData, 'nisn'>>({
    fullName: '',
    class: '',
    school: '',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
  });

  const { registerStudent } = useContext(AuthContext);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() || 
      !formData.class.trim() || 
      !formData.school.trim() ||
      !formData.city.trim() ||
      !formData.province.trim()
    ) {
        alert("Semua field wajib diisi.");
        return;
    }

    setIsSubmitting(true);
    try {
        const studentPayload: StudentData = { 
            ...formData,
        };

        registerStudent(studentPayload);
    } catch (err) {
        console.error("Registration error:", err);
        alert("Terjadi kesalahan saat registrasi.");
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
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">Silakan lengkapi data diri Anda untuk membuat akun CBT gratis</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-normal text-slate-400">
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
            </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full !mt-10 py-5 text-sm font-bold tracking-[0.1em] rounded-2xl shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all bg-emerald-600 hover:bg-emerald-500 text-white" 
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
