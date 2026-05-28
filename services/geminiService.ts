export interface EssayAnalysisResponse {
  score: number;
  scoresDetail: {
    conceptUnderstanding: number;
    completeness: number;
    accuracy: number;
  };
  strengths: string[];
  weaknesses: string[];
  constructiveFeedback: string;
  error?: string;
}

export const analyzeEssayAnswer = async (
  studentAnswer: string,
  correctAnswerKey: string,
  studentName?: string,
  examTitle?: string,
  questionContent?: string
): Promise<EssayAnalysisResponse> => {
  try {
    const response = await fetch("/api/gemini/analyze-essay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentName: studentName || "Siswa",
        examTitle: examTitle || "Asesmen Esai Kurikulum Merdeka",
        questionContent: questionContent || "Pertanyaan Esai",
        rubricText: correctAnswerKey,
        studentAnswer: studentAnswer,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Gagal menghubungi AI di server.");
    }

    const data = await response.json();
    return data as EssayAnalysisResponse;
  } catch (error: any) {
    console.error("Error calling analyze-essay API:", error);
    return {
      score: 0,
      scoresDetail: {
        conceptUnderstanding: 0,
        completeness: 0,
        accuracy: 0,
      },
      strengths: [],
      weaknesses: [],
      constructiveFeedback: `Ulasan bimbingan AI tidak dapat diselesaikan saat ini: ${error.message || error}`,
      error: error.message || String(error),
    };
  }
};
