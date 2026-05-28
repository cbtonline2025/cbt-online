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

Aturan Penting Konversi:
1. Untuk tipe soal "Pilihan Ganda":
   - Ekstrak seluruh opsi jawaban yang ada.
   - Tetapkan list of options dengan model: [{ "id": "a", "text": "..." }, { "id": "b", "text": "..." }, ...] menggunakan id beralfabet kecil ("a", "b", "c", "d", "e").
   - Cari kunci jawaban yang dimaksud di dokumen (biasanya bertanda KUNCI, tebal, tanda *, atau di akhir soal). ` +
   `Nilai "correctAnswer" harus berupa ID alfabet opsi tersebut (misal "a" atau "b").
2. Untuk tipe soal "Esai":
   - Set "options" menjadi kosong atau null.
   - Kunci jawaban ("correctAnswer") harus berisi petunjuk penskoran atau jawaban esai ideal bagi sistem AI pemeriksa.
3. Untuk subjek / mata pelajaran ("subject"):
   - Jika disediakan filter subjek default "${assignedSubject || ''}", gunakan nilai ini untuk memastikan sinkronisasi. Jika tidak, ambil dari konteks teks dokumen ujian secara akurat.
4. Untuk Fase ("phase"):
   - Nilai fase harus berupa salah satu dari: "D" (SMP), "E" (SMA Kelas X), "F" (SMA Kelas XI & XII). Jika terdeteksi di luar itu atau tidak jelas, default ke: "${defaultPhase || 'F'}".
5. Bersikaplah toleran terhadap penomoran yang tidak berurutan, baris baru, atau format file yang berantakan. Tangkap keseluruhan maksud teks soal secara utuh.`;

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
                    description: "Tipe soal, wajib bernilai salah satu dari: 'Pilihan Ganda' atau 'Esai'"
                  },
                  content: {
                    type: Type.STRING,
                    description: "Pertanyaan atau seluruh teks permasalahan murni"
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
                    description: "Daftar opsi jawaban untuk pilihan ganda (kosongkan jika esai)"
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "Kunci jawaban. Jika Pilihan Ganda, wajib berupa ID alfabet dari opsi yang benar (misal 'a'). Jika Esai, isi petunjuk kunci jawaban dan parameter kelayakan skor."
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
                required: ["type", "content", "correctAnswer", "phase", "subject"]
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
