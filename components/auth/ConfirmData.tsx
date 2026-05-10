
import React from 'react';
import { StudentData } from '../../types';
import Button from '../ui/Button';

interface ConfirmDataProps {
  studentData: StudentData;
  onConfirm: () => void;
}

const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/20 dark:border-slate-700">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-slate-800 dark:text-white">{value}</span>
    </div>
);

const ConfirmData: React.FC<ConfirmDataProps> = ({ studentData, onConfirm }) => {
  return (
    <div className="w-full max-w-lg glass p-8 rounded-2xl">
      <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">Konfirmasi Data Peserta</h1>
      <p className="text-center text-slate-600 dark:text-slate-300 mb-8">Pastikan data di bawah ini sudah benar.</p>

      <div className="space-y-2 bg-white/20 dark:bg-slate-900/50 p-6 rounded-lg">
        <DataRow label="NISN" value={studentData.nisn} />
        <DataRow label="Nama Lengkap" value={studentData.fullName} />
        <DataRow label="Kelas" value={studentData.class} />
        <DataRow label="Asal Sekolah" value={studentData.school} />
        <DataRow label="Kota/Kabupaten" value={studentData.city} />
        <DataRow label="Provinsi" value={studentData.province} />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-amber-700 dark:text-yellow-300 mb-4 bg-amber-100/50 dark:bg-yellow-900/30 p-3 rounded-lg">Jika ada kesalahan data, silakan hubungi proktor atau lakukan registrasi ulang.</p>
        <Button onClick={onConfirm} className="w-full">
          Data Sudah Benar, Lanjutkan ke Login
        </Button>
      </div>
    </div>
  );
};

export default ConfirmData;
