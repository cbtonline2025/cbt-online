
import React, { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../../App';
import { StudentData } from '../../types';
import { fetchNISNData } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';

interface RegisterProps {
    onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginClick }) => {
  const [nisn, setNisn] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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
    if (!trimmedNisn || trimmedNisn.length !== 10) {
      alert("NISN harus 10 digit.");
      return;
    }
    setIsSearching(true);
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
    setIsSearching(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNisn = nisn.trim();
    if(Object.values(formData).some(val => (val as string).trim() === '') || !trimmedNisn) {
        alert("Semua field wajib diisi.");
        return;
    }
    registerStudent({ nisn: trimmedNisn, ...formData });
  };
  
  return (
    <div className="w-full max-w-lg glass p-8 rounded-2xl">
      <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">Registrasi Siswa</h1>
      <p className="text-center text-slate-600 dark:text-slate-300 mb-8">Buat akun untuk memulai ujian</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-end gap-2">
            <Input
                id="nisn"
                label="NISN (10 Digit)"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="0012345678"
                maxLength={10}
                required
            />
            <Button type="button" onClick={handleNisnSearch} disabled={isSearching} className="h-12">
                {isSearching ? <Spinner/> : 'Cari'}
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="fullName" name="fullName" label="Nama Lengkap" value={formData.fullName} onChange={handleInputChange} required />
            <Input id="class" name="class" label="Kelas" placeholder="Masukkan Kelas (Contoh: X-A, IX-B)" value={formData.class} onChange={handleInputChange} required />
            <Input id="school" name="school" label="Asal Sekolah" value={formData.school} onChange={handleInputChange} required />
            <Input id="city" name="city" label="Kota/Kabupaten" value={formData.city} onChange={handleInputChange} required />
        </div>
        <Input id="province" name="province" label="Provinsi" value={formData.province} onChange={handleInputChange} required />
        
        <Button type="submit" className="w-full !mt-6">
          Daftar
        </Button>
      </form>
      
      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
        Sudah punya akun?{' '}
        <button onClick={onLoginClick} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Masuk di sini
        </button>
      </p>
    </div>
  );
};

export default Register;
