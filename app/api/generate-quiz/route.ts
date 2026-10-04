// File: app/api/generate-quiz/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export function POST(req: Request) {
  return (async () => {
    try {
      const { topic, gradeLevel } = await req.json();

      // Logika pengacakan topik oleh AI jika topic kosong atau "RANDOM"
      const isRandomTopic = !topic || topic.trim() === "" || topic === "RANDOM";
      
      const topicInstruction = isRandomTopic
        ? `PILIHKAN SECARA ACAK 1 bab/topik materi Al-Qur'an Hadis atau PAI yang sangat relevan dan standar untuk ${gradeLevel || "SMA/MA"}. Pastikan topiknya spesifik (misal: Tajwid, Otentisitas Hadis, Asmaul Husna, atau Muamalah).`
        : `Gunakan topik/bab materi berikut: "${topic}".`;

      const prompt = `Kamu adalah seorang ahli kurikulum Pendidikan Agama Islam (PAI) dan Al-Qur'an Hadis. 
Buatkan satu set bank soal interaktif untuk Digital Board Game berdasarkan ketentuan berikut:
- Target Jenjang: "${gradeLevel || "SMA/MA"}"
- Instruksi Topik: ${topicInstruction}

Ketentuan Kartu yang Harus Dibuat:
1. Buat total 10 kartu dengan komposisi:
   - 5 Kartu Pertanyaan Pilihan Ganda biasa (type: "question")
   - 2 Kartu Zona Risiko Tinggi / HOTS (type: "penalty") -> Soal analisis mendalam berisiko tinggi
   - 2 Kartu Tantangan Praktik/Hafalan di depan kelas (type: "challenge")
   - 1 Kartu Bonus Keberuntungan (type: "bonus")
2. Soal harus memiliki 4 pilihan jawaban (A, B, C, D) untuk type "question" dan "penalty".
3. Tentukan Kunci Jawaban Benar ("A", "B", "C", atau "D").
4. Untuk type "penalty", beri nilai hukuman mundur petak (value: 1 - 3).
5. Sebutkan rekomendasi batas waktu berpikir (questionTimer = 60, penaltyTimer = 30).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Judul lengkap template soal (sertakan nama bab/topiknya)" },
              questionTimer: { type: Type.INTEGER, description: "Default timer petak biru (detik)" },
              penaltyTimer: { type: Type.INTEGER, description: "Default timer petak merah (detik)" },
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { 
                      type: Type.STRING, 
                      description: "Jenis kartu: 'question', 'penalty', 'challenge', atau 'bonus'" 
                    },
                    content: { type: Type.STRING, description: "Isi teks pertanyaan atau instruksi tantangan" },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Array 4 opsi jawaban [A, B, C, D] (kosongkan jika challenge/bonus)",
                    },
                    correctAnswer: { type: Type.STRING, description: "Huruf kunci jawaban: 'A', 'B', 'C', atau 'D'" },
                    value: { type: Type.INTEGER, description: "Nilai efek poin/hukuman mundur petak (1-3)" },
                  },
                  required: ["type", "content", "value"],
                },
              },
            },
            required: ["title", "questionTimer", "penaltyTimer", "cards"],
          },
        },
      });

      const jsonResult = JSON.parse(response.text || "{}");
      return NextResponse.json(jsonResult);
    } catch (error: any) {
      console.error("Error generating quiz with Gemini:", error);
      return NextResponse.json(
        { error: "Gagal membuat soal otomatis via AI: " + (error.message || String(error)) },
        { status: 500 }
      );
    }
  })();
}