import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Increase JSON payload limits for large PDF base64 files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Secure Server-side Gemini Exam Parsing API
app.post("/api/gemini/parse-exam", async (req, res) => {
  try {
    const { type, text, fileBase64, assignedSubject, defaultPhase } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "Konfigurasi API Key (GEMINI_API_KEY) tidak ditemukan di server. Silakan hubungi administrator atau proktor utama." 
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let systemInstruction = `Anda adalah asisten AI profesional untuk sistem CBT (Computer Based Test) berdasarkan standar BSKAP Kurikulum Merdeka di Indonesia.
Tugas Anda adalah memproses dokumen ujian (bisa berupa teks mentah atau dokumen PDF) dan mengubahnya secara otomatis menjadi daftar soal yang valid terstruktur dalam JSON.

Jenis Ujian / Tipe Soal yang Harus Anda Dukung & Deteksi Secara Otomatis:
1. "Pilihan Ganda":
   - Soal pilihan ganda klasik dengan satu jawaban benar.
   - Tetapkan list of "options" dengan format: [{ "id": "a", "text": "..." }, { "id": "b", "text": "..." }, ...] menggunakan id beralfabet kecil ("a", "b", "c", "d", "e").
   - Kembalikan "correctAnswer" berupa ID alfabet opsi jawaban tersebut (misal "a" atau "b").
2. "Pilihan Ganda Kompleks":
   - Siswa dapat memilih satu atau lebih jawaban benar (multiselect).
   - Tetapkan list of "options" beralfabet seperti pilihan ganda biasa (A, B, C, D, E).
   - Tentukan daftar semua kunci jawaban benar dan simpan indeks 0-based di dalam array "correctAnswersList" (misalnya [0, 2] jika jawaban benar adalah A dan C).
3. "Menjodohkan":
   - Menghubungkan premis/pernyataan di sisi kiri dengan jawaban yang benar di sisi kanan.
   - Simpan daftar pasangannya pada array "matchingPairs" berisi objek-objek: { "premise": "Kiri/Soal", "response": "Kanan/Jawaban Pasangannya" }.
4. "Mengurutkan":
   - Mengatur serangkaian tahapan, kronologi, atau istilah ke urutan logis yang benar.
   - Simpan urutan yang BENAR dari atas ke bawah pada array string "orderItems" (misalnya ["Langkah 1", "Langkah 2", "Langkah 3"]).
5. "Pernyataan Benar-Salah":
   - Berisi tabel berisi satu atau beberapa sub-pernyataan yang masing-masing harus ditentukan Benar (true) atau Salah (false).
   - Simpan pada array "statements" berisi entitas: { "id": "s1", "text": "Isi pernyataan", "correct": true/false }.
6. "Esai":
   - Pertanyaan esai bebas.
   - Set "options" menjadi kosong atau null.
   - Isi "correctAnswer" dengan garis besar petunjuk penskoran, kata kunci, atau contoh jawaban ideal untuk bahan koreksi AI.

Aturan Penting Konversi:
- Tipe soal ("type") pada JSON WAJIB berupa salah satu string dari: "Pilihan Ganda", "Pilihan Ganda Kompleks", "Menjodohkan", "Mengurutkan", "Pernyataan Benar-Salah", atau "Esai".
- Jika disediakan filter subjek default "${assignedSubject || ''}", gunakan nilai ini untuk properti "subject" guna memastikan konsistensi. Jika tidak, ambil dari dokumen ujian.
- Nilai"phase" (Fase) harus berupa "D" (SMP), "E" (SMA Kelas X), "F" (SMA Kelas XI/XII). Default ke: "${defaultPhase || 'F'}".
- Toleransi tinggi terhadap penomoran yang tidak berurutan, tanda baca, tata letak baris baru, atau kesalahan kecil OCR pada dokumen PDF. Tangkap pesan dan substansi soal ujian secara sempurna 100%.`;

    let contentParts: any[] = [];

    if (type === 'pdf') {
      if (!fileBase64) {
        return res.status(400).json({ error: "File base64 PDF wajib dikirimkan." });
      }
      
      // Clean up base64 prefix if exists
      const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, "");

      contentParts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: cleanBase64
        }
      });
      contentParts.push({
        text: "Ekstrak seluruh soal ujian dari file PDF terlampir dan konversikan menjadi format JSON sesuai skema yang telah ditentukan."
      });
    } else {
      if (!text || text.trim() === '') {
        return res.status(400).json({ error: "Konten teks dari file Word (docx) wajib dikirimkan." });
      }
      contentParts.push({
        text: `Berikut adalah teks hasil ekstraksi dari file Word (docx):
\n\n=== AWAL TEKS ===\n${text}\n=== AKHIR TEKS ===\n
Ekstrak seluruh soal ujian dari teks di atas dan konversikan menjadi format JSON sesuai skema yang telah ditentukan.`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Tipe soal, wajib bernilai salah satu dari: 'Pilihan Ganda', 'Pilihan Ganda Kompleks', 'Menjodohkan', 'Mengurutkan', 'Pernyataan Benar-Salah', atau 'Esai'."
                  },
                  content: {
                    type: Type.STRING,
                    description: "Teks pertanyaan utama."
                  },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "ID opsi beralfabet kecil, contoh: a, b, c, d, e" },
                        text: { type: Type.STRING, description: "Isi teks opsi tersebut secara lengkap" }
                      },
                      required: ["id", "text"]
                    },
                    description: "Daftar opsi jawaban untuk pilihan ganda / pg kompleks (bisa kosong jika menjodohkan/mengurutkan/pernyataan/esai)."
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "Kunci jawaban default (wajib diisi untuk Pilihan Ganda berupa id opsi, atau untuk Esai berupa pedoman jawaban. Boleh dikosongkan untuk jenis lainnya)."
                  },
                  correctAnswersList: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: "Daftar indeks opsi benar (0-based, misal [0, 2] untuk opsi A dan C) khusus untuk Pilihan Ganda Kompleks."
                  },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        premise: { type: Type.STRING, description: "Butir pernyataan di lajur kiri" },
                        response: { type: Type.STRING, description: "Butir jawaban di lajur kanan" }
                      },
                      required: ["premise", "response"]
                    },
                    description: "Daftar pasangan lajur kiri & kanan khusus tipe soal Menjodohkan."
                  },
                  orderItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar butir-butir urutan kronologis yang urutannya sudah BENAR khusus tipe Mengurutkan."
                  },
                  statements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: "ID berseri seperti s1, s2, s3" },
                        text: { type: Type.STRING, description: "Pernyataan yang dinilai" },
                        correct: { type: Type.BOOLEAN, description: "Penetapan kebenaran pernyataan (true jika Benar, false jika Salah)" }
                      },
                      required: ["id", "text", "correct"]
                    },
                    description: "Daftar pernyataan Benar/Salah khusus tipe Pernyataan Benar-Salah."
                  },
                  phase: {
                    type: Type.STRING,
                    description: "Fase kurikulum merdeka: 'D', 'E', atau 'F'"
                  },
                  subject: {
                    type: Type.STRING,
                    description: "Nama Mapel / Mata Pelajaran, misalnya: Fisika, Matematika"
                  }
                },
                required: ["type", "content", "phase", "subject"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Kesalahan saat memproses file ujian via Gemini AI:", error);
    res.status(500).json({ 
      error: "Gagal memproses dokumen ujian menggunakan Gemini AI: " + (error.message || error) 
    });
  }
});

// Vite Middleware & Static Assets Handler
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CBT Server] Berjalan pada port ${PORT}`);
  });
}

bootstrap();
