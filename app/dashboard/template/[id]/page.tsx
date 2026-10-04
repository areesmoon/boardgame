// app/dashboard/template/[id]/page.tsx
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
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  Plus,
  Trash2,
  HelpCircle,
  Flame,
  Gift,
  AlertTriangle,
  FlameKindling,
  Timer,
  Save,
  Pencil,
  X,
} from "lucide-react";

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
  questionTimer?: number;
  penaltyTimer?: number;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const templateId = params.id as string;
  const router = useRouter();
  const { user, loading } = useAuth();

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State Pengaturan Timer Template
  const [questionTimer, setQuestionTimer] = useState<number>(60);
  const [penaltyTimer, setPenaltyTimer] = useState<number>(30);
  const [isSavingTimer, setIsSavingTimer] = useState<boolean>(false);

  // Form State Kartu (Tambah & Edit)
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
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
      // Fetch Template Info & Timer Settings
      const tplDoc = await getDoc(doc(db, "templates", templateId));
      if (tplDoc.exists()) {
        const rawData = tplDoc.data();
        
        setTemplate({
          id: tplDoc.id,
          title: rawData.title || "",
          authorId: rawData.authorId || "",
          questionTimer: rawData.questionTimer || 60,
          penaltyTimer: rawData.penaltyTimer || 30,
        });

        setQuestionTimer(rawData.questionTimer || 60);
        setPenaltyTimer(rawData.penaltyTimer || 30);
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

  // 1. Simpan Pengaturan Durasi Timer Template
  const handleSaveTimerSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!templateId) return;

    setIsSavingTimer(true);
    try {
      await updateDoc(doc(db, "templates", templateId), {
        questionTimer: Number(questionTimer) || 60,
        penaltyTimer: Number(penaltyTimer) || 30,
      });
      alert("Pengaturan durasi timer berhasil disimpan!");
    } catch (err) {
      console.error("Gagal menyimpan timer:", err);
      alert("Gagal menyimpan durasi timer.");
    } finally {
      setIsSavingTimer(false);
    }
  };

  // Reset Form Input Kartu
  const resetCardForm = () => {
    setEditingCardId(null);
    setCardType("question");
    setContent("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setCardValue(1);
  };

  // Muat Data Kartu ke Form saat Mode Edit
  const handleStartEditCard = (card: CardData) => {
    setEditingCardId(card.id);
    setCardType(card.type);
    setContent(card.content);
    setCardValue(card.value || 1);

    if (card.options && card.options.length >= 2) {
      setOptionA(card.options[0] || "");
      setOptionB(card.options[1] || "");
      setOptionC(card.options[2] || "");
      setOptionD(card.options[3] || "");
    } else {
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
    }
    setCorrectAnswer(card.correctAnswer || "A");
  };

  // 2. Tambah ATAU Update Kartu
  const handleSaveCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const cardPayload: any = {
        templateId,
        type: cardType,
        content,
        value: Number(cardValue) || 1,
      };

      if (cardType === "question" || cardType === "penalty") {
        cardPayload.options = [optionA, optionB, optionC, optionD];
        cardPayload.correctAnswer = correctAnswer;
      } else {
        cardPayload.options = [];
        cardPayload.correctAnswer = null;
      }

      if (editingCardId) {
        // Mode Update Kartu Eksisting
        await updateDoc(doc(db, "cards", editingCardId), cardPayload);
      } else {
        // Mode Tambah Kartu Baru
        cardPayload.createdAt = serverTimestamp();
        await addDoc(collection(db, "cards"), cardPayload);
      }

      resetCardForm();
      await fetchTemplateAndCards();
    } catch (err: unknown) {
      console.error("Gagal menyimpan kartu:", err);
      alert("Gagal menyimpan data kartu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Hapus Kartu
  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu ini?")) return;
    try {
      await deleteDoc(doc(db, "cards", cardId));
      if (editingCardId === cardId) {
        resetCardForm();
      }
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
          type="button"
          onClick={() => router.push("/dashboard")}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-slate-800 text-lg">
            {template?.title || "Editor Template"}
          </h1>
          <p className="text-xs text-slate-500">Kelola Bank Kartu Soal & Pengaturan Timer ({cards.length} Kartu)</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar Kiri: Pengaturan Timer & Form Kartu */}
        <div className="space-y-6">
          
          {/* PANEL 1: PENGATURAN DURASI TIMER TEMPLATE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Timer className="w-4 h-4 text-amber-500" /> Pengaturan Durasi Timer
            </h2>

            <form onSubmit={handleSaveTimerSettings} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block flex items-center justify-between">
                  <span>Petak Biru (Soal Standar)</span>
                  <span className="text-[10px] text-blue-600 font-semibold">Default 60s</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={questionTimer}
                    onChange={(e) => setQuestionTimer(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <span className="text-xs text-slate-500 font-medium">detik</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block flex items-center justify-between">
                  <span>Petak Merah (Zona Risiko)</span>
                  <span className="text-[10px] text-red-600 font-semibold">Default 30s</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={penaltyTimer}
                    onChange={(e) => setPenaltyTimer(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <span className="text-xs text-slate-500 font-medium">detik</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingTimer}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingTimer ? "Menyimpan..." : "Simpan Durasi Timer"}
              </button>
            </form>
          </div>

          {/* PANEL 2: FORM TAMBAH / EDIT KARTU */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {editingCardId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-600" /> Edit Kartu
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-indigo-600" /> Tambah Kartu Baru
                  </>
                )}
              </h2>
              {editingCardId && (
                <button
                  type="button"
                  onClick={resetCardForm}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"
                >
                  <X className="w-3 h-3" /> Batal
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4">
              {/* Tipe Kartu */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Tipe Kartu</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="question">Pertanyaan (Petak Biru)</option>
                  <option value="challenge">Tantangan (Petak Oranye)</option>
                  <option value="bonus">Bonus (Petak Hijau)</option>
                  <option value="penalty">Zona Risiko Tinggi (Petak Merah)</option>
                </select>
              </div>

              {/* Isi Konten Soal / Instruksi */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Isi Pertanyaan / Instruksi</label>
                <textarea
                  rows={3}
                  placeholder={
                    cardType === "penalty"
                      ? "Tuliskan soal HOTS untuk zona risiko tinggi..."
                      : "Tuliskan pertanyaan, instruksi tantangan, atau efek bonus..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Form Pilihan Ganda (Khusus Tipe Question & Penalty) */}
              {(cardType === "question" || cardType === "penalty") && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-600 block">
                    Pilihan Jawaban {cardType === "penalty" && "(Soal Risiko)"}
                  </label>
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

              {/* Nilai Efek (Mundur Petak / Nilai Poin Multiplier) */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  {cardType === "penalty"
                    ? "Hukuman Mundur Petak (Jika Salah)"
                    : cardType === "bonus"
                    ? "Jumlah Petak Ekstra / Multiplier Poin"
                    : "Nilai Bobot Kartu"}
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={cardValue}
                  onChange={(e) => setCardValue(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 ${
                  editingCardId ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
                } text-white font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-50`}
              >
                {isSubmitting ? "Menyimpan..." : editingCardId ? "Update Kartu" : "Simpan Kartu"}
              </button>
            </form>
          </div>

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
                  className={`bg-white p-4 rounded-2xl border ${
                    editingCardId === c.id ? "border-amber-500 ring-2 ring-amber-500/20" : "border-slate-200"
                  } shadow-sm flex items-start justify-between gap-4 transition-all`}
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
                          <FlameKindling className="w-3 h-3 text-red-600" /> Zona Risiko (Mundur -{c.value})
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">{c.content}</p>

                    {(c.type === "question" || c.type === "penalty") && c.options && c.options.length > 0 && (
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

                  {/* Tombol Aksi: Edit & Hapus */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditCard(c)}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Edit Kartu Ini"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(c.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus Kartu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}