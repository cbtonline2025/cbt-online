import React, { useState } from 'react';
import { BookOpen, Cloud, Cpu, FileSpreadsheet, Globe, HelpCircle, HardDrive, KeyRound, MessageSquareCode, Sparkles, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';

const DeploymentGuide: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-12">
      {/* Intro section */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/20 rounded-full blur-2xl -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            ARSITEKTUR MODERN & MANDIRI
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none">CBT Merdeka Cloud & Panduan Distribusi Massal</h2>
          <p className="text-sm md:text-base text-indigo-100 max-w-3xl font-medium leading-relaxed">
            Didesain khusus untuk sekolah di seluruh Indonesia dengan konsep <span className="font-bold underline text-white">Full Serverless & client-centric</span>. Aplikasi ini tidak membebani server pusat saat ribuan siswa login bersamaan, sehingga kebal terhadap server down dan 100% GRATIS selamanya.
          </p>
        </div>
      </div>

      {/* Grid: Columns explaining system strength & capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-3xl border border-indigo-50 dark:border-white/5 shadow-md flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs mb-3">1. Arsitektur Serverless</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
              Berbeda dengan CBT tradisional yang rentan crash saat diakses massal, CBT Merdeka memproses seluruh pengerjaan soal dan penilaian AI langsung di peramban (browser) masing-masing siswa secara terdistribusi.
            </p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-emerald-50 dark:border-white/5 shadow-md flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs mb-3">2. Hosting 100% Gratis</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
              Karena aplikasi ini berupa Single Page Application (SPA), Anda bisa mempublikasikannya secara instan di cloud statis gratis seperti GitHub Pages, Vercel, Netlify, atau Cloudflare Pages dengan bandwidth tak terbatas.
            </p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-fuchsia-100 dark:border-white/5 shadow-md flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 text-fuchsia-500">
              <HardDrive className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs mb-3">3. Penyimpanan Luar Jaringan</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
              Data pengerjaan siswa ter-backup otomatis setiap detik ke enkripsi Local Storage browser siswa. Jika sinyal mati atau laptop mati mendadak, pengerjaan dapat dilanjutkan instan tanpa kehilangan progres jawaban!
            </p>
          </div>
        </div>
      </div>

      {/* Guide Tab Accordions */}
      <div className="space-y-10">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white pb-3 border-b-2 border-indigo-500/20 mb-6 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-500" />
            Langkah Deploy Gratis Selamanya (Vercel & GitHub)
          </h3>
          
          <div className="space-y-6">
            <div className="bg-white/40 dark:bg-slate-900/20 p-8 rounded-3xl border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">A</span>
                <h4 className="font-black text-slate-800 dark:text-white text-base">Metode Tercepat: Deploy Menggunakan Vercel (Hanya 2 Menit)</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold pl-11">
                Vercel adalah platform cloud berkecepatan tinggi gratis yang ideal untuk aplikasi React/Vite ini.
              </p>
              <ol className="list-decimal pl-16 space-y-3.5 text-xs text-slate-600 dark:text-slate-350 font-bold">
                <li>Instal Git dan buat akun gratis di <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">GitHub.com <ExternalLink className="w-3.5 h-3.5" /></a>.</li>
                <li>Buat repositori baru di GitHub dengan nama misalnya <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">cbt-kurikulum-merdeka</code>.</li>
                <li>Hubungkan dan unggah seluruh berkas kode folder proyek CBT ini ke repositori GitHub Anda.</li>
                <li>Pergi ke <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1">Vercel.com <ExternalLink className="w-3.5 h-3.5" /></a> dan buat akun (koneksikan langsung dengan akun GitHub Anda).</li>
                <li>Klik tombol <strong className="text-slate-800 dark:text-white font-black">"Add New Project"</strong>, pilih repositori <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">cbt-kurikulum-merdeka</code> yang baru dibuat.</li>
                <li>Pada pilihan build commands, biarkan standar (Vite mendeteksi otomatis run build) kemudian klik <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">"Deploy"</strong>.</li>
                <li>Dalam 45 detik, aplikasi Anda sudah online! Sebarkan link URL yang diberikan Vercel (misal: <code className="text-amber-600 dark:text-amber-400 font-mono">https://cbt-mu.vercel.app</code>) kepada seluruh siswa Anda.</li>
              </ol>
            </div>

            <div className="bg-white/40 dark:bg-slate-900/20 p-8 rounded-3xl border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">B</span>
                <h4 className="font-black text-slate-800 dark:text-white text-base">Metode Alternatif: GitHub Pages (100% Native dengan Github)</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold pl-11">
                Metode ini sangat fleksibel untuk didistribusikan langsung dari dashboard repositori Anda.
              </p>
              <ol className="list-decimal pl-16 space-y-3.5 text-xs text-slate-600 dark:text-slate-350 font-bold">
                <li>Buka repositori Anda di GitHub.</li>
                <li>Navigasikan ke tab <strong className="text-slate-800 dark:text-white font-black">"Settings"</strong> &gt; <strong className="text-slate-800 dark:text-white font-black">"Pages"</strong> di kolom navigasi sebelah kiri mendatar.</li>
                <li>Di bawah menu <strong className="text-slate-800 dark:text-white font-black">Build and deployment</strong>, pada pilihan Source pilih <strong className="text-indigo-600 dark:text-indigo-300">GitHub Actions</strong>.</li>
                <li>Gunakan atau biarkan build workflow standar menyelesaikan proses deploy static assets otomatis ke CDN global GitHub Pages secara instan!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* SOP Pelaksanaan Ujian (Standard Operating Procedure) */}
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white pb-3 border-b-2 border-emerald-500/20 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Alur Pelaksanaan Ujian (SOP) Guru & Siswa
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-sm mb-4">1</div>
              <h5 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider mb-2">Desain & Impor Soal</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                Guru masuk ke panel Proktor / Teacher, mengimpor bank soal dari file Excel (template standard CBT). Soal berisi pilihan ganda, naskah esai, audio listening, atau video klip interaktif.
              </p>
            </div>

            <div className="bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-sm mb-4">2</div>
              <h5 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider mb-2">Registrasi Siswa</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                Siswa membuka link aplikasi di handphone atau laptop masing-masing. Mereka menekan tombol daftar, mengisi biodata nama, kelas, dan sekolah. Sistem instan menghasilkan kode PIN & Username unik.
              </p>
            </div>

            <div className="bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-sm mb-4">3</div>
              <h5 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider mb-2">Pengerjaan Ujian</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                Siswa login dengan kredensial tersebut, memilih paket ujian aktif, dan mengerjakannya. Mode ujian sudah dilengkapi dengan pengingat penanda ragu-ragu dan autosave.
              </p>
            </div>

            <div className="bg-white/30 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center font-black text-sm mb-4">4</div>
              <h5 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider mb-2">Rekapitulasi Nilai</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                Kembali ke Portal Guru, klik menu Analisis Hasil AI untuk melihat detail skor siswa instan, hasil jawaban esai yang dinilai cerdas oleh model AI, lalu mengekspor naskah Excel/CSV untuk Dapodik.
              </p>
            </div>
          </div>
        </div>

        {/* Excel layout help card */}
        <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-indigo-500/5 border-2 border-emerald-500/20 p-8 rounded-[2.5rem] shadow-lg flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-600 rounded-3xl flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-9 h-9" />
          </div>
          <div className="space-y-2 flex-1 text-center md:text-left">
            <h4 className="font-black text-slate-800 dark:text-white text-lg">Format Impor Excel Fleksibel & Case-Sensitive</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
              Membuat bank soal dalam hitungan detik! Cukup buat file Excel (.xlsx) dengan kolom judul di baris pertama berupa: <code className="text-emerald-600 font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-black">content</code>, <code className="text-emerald-600 font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-black">type</code> (Pilihan Ganda / Esai), <code className="text-emerald-600 font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-black">subject</code>, <code className="text-emerald-600 font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-black">phase</code> (D/E/F), dan <code className="text-emerald-600 font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-black">correctAnswer</code>. Unggah file tersebut dan semua soal akan langsung tersinkronisasi tanpa kendala database!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentGuide;
