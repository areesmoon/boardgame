"use client";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ArrowLeft, Plus, Trash2, HelpCircle, Flame, Gift, AlertTriangle } from "lucide-react";

interface CardData {
  id: string;
  templateId: string;
  type: "question" | "challenge" | "bonus" | "penalty" | string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  value?: number;
}

interface TemplateData {
  id: string;
  title: string;
  authorId: string;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const templateId = params.id as string;
  const router = useRouter();
  const { user, loading } = useAuth();

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State untuk Kartu Baru
  const [cardType, setCardType] = useState<string>("question");
  const [content, setContent] = useState<string>("");
  const [optionA, setOptionA] = useState<string>("");
  const [optionB, setOptionB] = useState<string>("");
  const [optionC, setOptionC] = useState<string>("");
  const [optionD, setOptionD] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<string>("A");
  const [cardValue, setCardValue] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user && templateId) {
      fetchTemplateAndCards();
    }
  }, [user, loading, templateId, router]);

  const fetchTemplateAndCards = async () => {
    setIsLoading(true);
    try {
      // Fetch Template Info
      const tplDoc = await getDoc(doc(db, "templates", templateId));
      if (tplDoc.exists()) {
        setTemplate({ id: tplDoc.id, ...tplDoc.data() } as TemplateData);
      }

      // Fetch All Cards in this Template
      const q = query(collection(db, "cards"), where("templateId", "==", templateId));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CardData));
      setCards(list);
    } catch (err: unknown) {
      console.error("Error loading template data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const newCardPayload: Omit<CardData, "id"> & { createdAt: any } = {
        templateId,
        type: cardType,
        content,
        value: Number(cardValue) || 1,
        createdAt: serverTimestamp(),
      };

      if (cardType === "question") {
        newCardPayload.options = [optionA, optionB, optionC, optionD];
        newCardPayload.correctAnswer = correctAnswer;
      }

      await addDoc(collection(db, "cards"), newCardPayload);

      // Reset Form
      setContent("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");
      setCardValue(1);

      await fetchTemplateAndCards();
    } catch (err: unknown) {
      console.error("Gagal menambah kartu:", err);
      alert("Gagal menambahkan kartu baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu ini?")) return;
    try {
      await deleteDoc(doc(db, "cards", cardId));
      await fetchTemplateAndCards();
    } catch (err: unknown) {
      console.error("Gagal menghapus kartu:", err);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">
        Memuat Editor Soal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-slate-800 text-lg">
            {template?.title || "Editor Template"}
          </h1>
          <p className="text-xs text-slate-500">Kelola Bank Kartu Soal & Tantangan ({cards.length} Kartu)</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Tambah Kartu Baru */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" /> Tambah Kartu Baru
          </h2>

          <form onSubmit={handleAddCard} className="space-y-4">
            {/* Tipe Kartu */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Tipe Kartu</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="question">Pertanyaan (Pilihan Ganda)</option>
                <option value="challenge">Tantangan (Praktik/Hafalan)</option>
                <option value="bonus">Bonus (Tambah Poin/Langkah)</option>
                <option value="penalty">Konsekuensi (Mundur Petak)</option>
              </select>
            </div>

            {/* Isi Konten Soal / Instruksi */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Isi Pertanyaan / Instruksi</label>
              <textarea
                rows={3}
                placeholder="Tuliskan pertanyaan, instruksi tantangan, atau efek bonus..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            {/* Form Pilihan Ganda (Khusus Question) */}
            {cardType === "question" && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-600 block">Pilihan Jawaban</label>
                <input
                  type="text"
                  placeholder="Opsi A"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Opsi B"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Opsi C"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Opsi D"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Kunci Jawaban Benar</label>
                  <select
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            )}

            {/* Nilai Efek (Mundur Petak / Tambahan Poin) */}
            {(cardType === "bonus" || cardType === "penalty") && (
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  {cardType === "penalty" ? "Jumlah Petak Mundur" : "Jumlah Petak Ekstra"}
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={cardValue}
                  onChange={(e) => setCardValue(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Kartu"}
            </button>
          </form>
        </div>

        {/* Daftar Kartu Terdaftar */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-slate-800 text-base">Daftar Kartu Terdaftar</h2>

          {cards.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
              Belum ada kartu di dalam template ini. Tambahkan kartu pertama kamu di sebelah kiri!
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {c.type === "question" && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> Pertanyaan
                        </span>
                      )}
                      {c.type === "challenge" && (
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Tantangan
                        </span>
                      )}
                      {c.type === "bonus" && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <Gift className="w-3 h-3" /> Bonus (+{c.value})
                        </span>
                      )}
                      {c.type === "penalty" && (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Konsekuensi (-{c.value})
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{c.content}</p>

                    {c.type === "question" && c.options && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                        {c.options.map((opt, i) => {
                          const label = ["A", "B", "C", "D"][i];
                          const isCorrect = label === c.correctAnswer;
                          return (
                            <div
                              key={i}
                              className={`p-1.5 rounded-lg border ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-800"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              {label}. {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCard(c.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Hapus Kartu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}