
import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is configured in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const analyzeEssayAnswer = async (
  studentAnswer: string,
  correctAnswerKey: string
): Promise<string> => {
  if (!API_KEY) {
    return "Analisis AI tidak tersedia. Kunci API tidak ditemukan.";
  }

  const model = "gemini-3-flash-preview";
  const prompt = `
    Anda adalah seorang asisten guru yang ahli dalam menganalisis jawaban esai siswa.
    Tugas Anda adalah membandingkan jawaban siswa dengan kunci jawaban yang diberikan dan memberikan analisis singkat.

    Kunci Jawaban (Poin-poin Penting):
    ---
    ${correctAnswerKey}
    ---

    Jawaban Siswa:
    ---
    ${studentAnswer}
    ---

    Analisis Anda (dalam 2-3 kalimat):
    Berikan evaluasi singkat mengenai kesesuaian jawaban siswa dengan kunci jawaban.
    Sebutkan poin-poin penting yang sudah dijawab dengan benar dan poin-poin yang mungkin terlewat atau kurang tepat.
    Gunakan bahasa yang konstruktif.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    if (response && response.text) {
        return response.text;
    }
    return "Gagal mendapatkan analisis dari AI.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Terjadi kesalahan saat menghubungi layanan analisis AI.";
  }
};
