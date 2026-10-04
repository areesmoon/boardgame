// File: app/dashboard/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { logout, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Plus,
  Play,
  LogOut,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  HelpCircle,
  Wand2,
  X,
  Loader2,
  Dices,
} from "lucide-react";
import { seedQuranHadisTemplate } from "@/lib/seedData";
import GameGuideModal from "@/components/GameGuideModal";

interface RoomInfo {
  id: string;
  code: string;
  templateId: string;
}

interface GameTemplate {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp | null;
  cardsCount?: number;
  questionTimer?: number;
  penaltyTimer?: number;
  roomCode?: string;
  roomId?: string;
}

// Dictionary Topik Kurikulum Per Kelas (Di luar komponen)
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  "Kelas X SMA/MA": [
    "Bab Otentisitas Al-Qur'an & Kehujahan Hadis",
    "Unsur-Unsur Hadis: Sanad, Matan, dan Rawi",
    "Hukum Bacaan Tajwid: Nun Mati, Tanwin & Mim Mati",
    "Menjaga Toleransi & Ukhuwah Islamiyah (Q.S. Al-Hujurat: 10-13)",
    "Memahami Hadis Mutawatir & Hadis Ahad",
  ],
  "Kelas XI SMA/MA": [
    "Hukum Tajwid: Mad Far'i & Waqaf",
    "Perilaku Taat, Kompetisi dalam Kebaikan & Etos Kerja",
    "Toleransi & Kerukunan Beragama (Q.S. Yunus: 40-41)",
    "Memahami Pembagian Hadis Shahih, Hasan & Dha'if",
    "Menerapkan Prinsip-Prinsip Muamalah dalam Islam",
  ],
  "Kelas XII SMA/MA": [
    "Berpikir Kritis & Cerdas Memahami Ayat Alam Semesta (Q.S. Ali 'Imran: 190-191)",
    "Musyawarah & Saling Menasihati dalam Kebajikan",
    "Hari Akhir / Kiamat & Hikmah Beriman kepada Qada dan Qadar",
    "Pernikahan & Hukum Keluarga dalam Islam",
  ],
  "SMP/MTs": [
    "Hukum Bacaan Qalqalah & Ra",
    "Meneladani Sifat-Sifat Mulia Asmaul Husna",
    "Jujur, Amanah & Istiqamah dalam Kehidupan Sehari-hari",
    "Tata Cara Shalat Berjamaah & Shalat Jumat",
  ],
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // State Templates & Loading
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  // State Modal Buku Petunjuk
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // State Modal AI Quiz Generator
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>("");
  const [aiGrade, setAiGrade] = useState<string>("Kelas X SMA/MA");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      fetchTemplatesAndRooms();
    }
  }, [user, loading, router]);

  // Fetch Template & Room PIN Terkait
  const fetchTemplatesAndRooms = async () => {
    if (!user) return;
    try {
      // 1. Fetch Template Milik Guru
      const qTemplates = query(
        collection(db, "templates"),
        where("authorId", "==", user.uid)
      );
      const snapTemplates = await getDocs(qTemplates);

      // 2. Fetch Room Aktif Guru
      const qRooms = query(
        collection(db, "rooms"),
        where("hostId", "==", user.uid)
      );
      const snapRooms = await getDocs(qRooms);
      const activeRooms: Record<string, RoomInfo> = {};

      snapRooms.docs.forEach((d) => {
        const data = d.data();
        activeRooms[data.templateId] = {
          id: d.id,
          code: data.code,
          templateId: data.templateId,
        };
      });

      // Combine Template & PIN Room
      const list = snapTemplates.docs.map((docSnap) => {
        const data = docSnap.data();
        const tplId = docSnap.id;
        const room = activeRooms[tplId];

        return {
          id: tplId,
          title: (data.title as string) || "Template Tanpa Judul",
          authorId: (data.authorId as string) || "",
          authorName: (data.authorName as string) || "Guru",
          createdAt: (data.createdAt as Timestamp) || null,
          cardsCount: data.cardsCount || 0,
          questionTimer: data.questionTimer || 60,
          penaltyTimer: data.penaltyTimer || 30,
          roomCode: room?.code || undefined,
          roomId: room?.id || undefined,
        } as GameTemplate;
      });

      setTemplates(list);
    } catch (err: unknown) {
      console.error("Error fetching templates and rooms:", err);
    }
  };

  // 1. Fungsi Acak Topik langsung meminta AI yang memilihkan
  const handleRandomizeTopic = () => {
    setAiTopic("🎲 Otomatis Acak Topik oleh AI");
  };

  // Buat Template Baru Manual
  const handleCreateTemplate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    setIsCreating(true);
    try {
      const docRef = await addDoc(collection(db, "templates"), {
        title: newTitle.trim(),
        authorId: user.uid,
        authorName: user.displayName || "Guru",
        questionTimer: 60,
        penaltyTimer: 30,
        createdAt: serverTimestamp(),
        cardsCount: 0,
      });
      setNewTitle("");
      await fetchTemplatesAndRooms();
      router.push(`/dashboard/template/${docRef.id}`);
    } catch (err: unknown) {
      console.error("Gagal membuat template:", err);
      alert("Gagal membuat template baru");
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Handler Submit ke API
  const handleGenerateAiQuiz = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Jika berisi penanda acak atau kosong, kirim "RANDOM" ke API Backend
    const isRandom = !aiTopic.trim() || aiTopic.includes("Otomatis Acak Topik");
    const topicPayload = isRandom ? "RANDOM" : aiTopic.trim();

    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicPayload, gradeLevel: aiGrade }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat soal via AI");

      // Simpan Header Template ke Firestore
      const templateRef = await addDoc(collection(db, "templates"), {
        title: data.title,
        authorId: user.uid,
        authorName: user.displayName || "Guru PAI",
        questionTimer: data.questionTimer || 60,
        penaltyTimer: data.penaltyTimer || 30,
        cardsCount: data.cards?.length || 0,
        createdAt: serverTimestamp(),
      });

      // Simpan Seluruh Kartu
      if (data.cards && Array.isArray(data.cards)) {
        for (const card of data.cards) {
          await addDoc(collection(db, "cards"), {
            templateId: templateRef.id,
            type: card.type,
            content: card.content,
            options: card.options || [],
            correctAnswer: card.correctAnswer || "A",
            value: card.value || 1,
            createdAt: serverTimestamp(),
          });
        }
      }

      alert(`Berhasil! Template "${data.title}" berisi ${data.cards?.length || 0} kartu berhasil diracik oleh AI.`);
      setIsAiModalOpen(false);
      setAiTopic("");
      await fetchTemplatesAndRooms();
    } catch (err: any) {
      console.error("Error AI Generator:", err);
      alert("Gagal AI Generator: " + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Import Contoh Template Al-Qur'an Hadis Statis
  const handleImportSeed = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedQuranHadisTemplate(user.uid, user.displayName || "Guru Al-Qur'an Hadis");
      await fetchTemplatesAndRooms();
    } catch (err) {
      console.error("Gagal mengimpor contoh:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Hapus Template & Room Terkait
  const handleDeleteTemplate = async (templateId: string, title: string, roomId?: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus template "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, "templates", templateId));
      if (roomId) {
        await deleteDoc(doc(db, "rooms", roomId));
      }
      await fetchTemplatesAndRooms();
    } catch (err: unknown) {
      console.error("Gagal menghapus template:", err);
      alert("Gagal menghapus template");
    }
  };

  // Generate / Reset PIN Room
  const handleGenerateOrResetPin = async (templateId: string, existingRoomId?: string) => {
    if (!user) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      if (existingRoomId) {
        await updateDoc(doc(db, "rooms", existingRoomId), {
          code: newCode,
          status: "waiting",
          currentTurn: 0,
          players: [],
        });
      } else {
        await addDoc(collection(db, "rooms"), {
          code: newCode,
          templateId: templateId,
          hostId: user.uid,
          status: "waiting",
          currentTurn: 0,
          players: [],
          createdAt: serverTimestamp(),
        });
      }
      await fetchTemplatesAndRooms();
    } catch (err: unknown) {
      console.error("Gagal mengatur PIN room:", err);
      alert("Gagal membuat/mereset PIN room");
    }
  };

  // Salin PIN ke Clipboard
  const handleCopyPin = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPin(code);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600 font-medium">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Dashboard Guru</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tombol Buku Petunjuk */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <HelpCircle className="w-4 h-4" /> Buku Petunjuk
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-8">

        {/* SECTION 1: FORM BUAT TEMPLATE MANUAL & AI GENERATOR */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Buat Bank Soal Baru
              </h2>
              <p className="text-xs text-slate-500">
                Buat template secara manual atau racik otomatis menggunakan AI
              </p>
            </div>

            {/* Tombol Pemicu AI Generator */}
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              <Wand2 className="w-4 h-4" /> ✨ Generate Soal via AI
            </button>
          </div>

          <form onSubmit={handleCreateTemplate} className="flex gap-3 pt-1">
            <input
              type="text"
              placeholder="Contoh: Kuis PAI Kelas X - Bab Tajwid & Otentisitas Hadis"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isCreating ? "Menyimpan..." : "Buat Manual"}
            </button>
          </form>
        </section>

        {/* SECTION 2: DAFTAR TEMPLATE & TOMBOL IMPORT EXAMPLE */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              Daftar Template Bank Soal ({templates.length})
            </h2>

            <button
              type="button"
              onClick={handleImportSeed}
              disabled={isSeeding}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSeeding ? "Mengimpor..." : "+ Import Contoh Al-Qur'an Hadis"}
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm space-y-2">
              <p className="font-semibold text-slate-700">Belum ada template bank soal.</p>
              <p className="text-xs">
                Buat template manual di atas, klik <strong>Generate Soal via AI</strong>, atau gunakan <strong>Import Contoh</strong>!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base leading-snug">
                          {tpl.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>{tpl.cardsCount || 0} Kartu Soal</span>
                          <span>•</span>
                          <span>Timer: {tpl.questionTimer || 60}s / {tpl.penaltyTimer || 30}s</span>
                        </div>
                      </div>

                      {/* Tombol Hapus Template */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.title, tpl.roomId)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* BADGE PIN ROOM SISWA */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          PIN Siswa Saat Ini
                        </span>
                        {tpl.roomCode ? (
                          <span className="font-mono font-black text-lg text-emerald-600">
                            {tpl.roomCode}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Belum ada PIN
                          </span>
                        )}
                      </div>

                      {tpl.roomCode ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyPin(tpl.roomCode!)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold flex items-center gap-1 transition-all"
                            title="Salin PIN Siswa"
                          >
                            {copiedPin === tpl.roomCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            {copiedPin === tpl.roomCode ? "Tersalin!" : "Copas"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateOrResetPin(tpl.id, tpl.roomId)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-all"
                            title="Reset PIN Baru"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateOrResetPin(tpl.id)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold transition-all"
                        >
                          + Buat PIN
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard/template/${tpl.id}`)}
                      className="flex-1 py-2 text-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Edit Soal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!tpl.roomCode) {
                          handleGenerateOrResetPin(tpl.id);
                        } else {
                          router.push(`/play/${tpl.roomCode}`);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Masuk Game
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL GENERATE SOAL AI (GEMINI) */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 w-full max-w-md rounded-3xl p-6 text-white space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">AI Quiz Generator</h3>
                  <p className="text-[11px] text-indigo-300">Meracik bank soal otomatis via Gemini AI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateAiQuiz} className="space-y-4">
              {/* Pilihan Tingkat Kelas */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  1. Tingkat Kelas / Target Siswa
                </label>
                <select
                  value={aiGrade}
                  onChange={(e) => {
                    setAiGrade(e.target.value);
                    setAiTopic(""); // Reset topik saat jenjang berubah
                  }}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Kelas X SMA/MA">Kelas X SMA/MA</option>
                  <option value="Kelas XI SMA/MA">Kelas XI SMA/MA</option>
                  <option value="Kelas XII SMA/MA">Kelas XII SMA/MA</option>
                  <option value="SMP/MTs">SMP/MTs</option>
                </select>
              </div>

              {/* Input Topik / Bab Materi */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    2. Topik / Bab Materi
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeTopic}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800 transition-all hover:bg-indigo-900"
                  >
                    <Dices className="w-3.5 h-3.5" /> Acak Topik
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Ketik topik atau klik 'Acak Topik' di atas..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  *Jika dikosongkan, AI akan memilihkan bab materi terbaik untuk {aiGrade}.
                </span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-indigo-300">Komposisi yang akan dibuatkan Gemini AI:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                  <li>5 Soal Pilihan Ganda Standar (+100 Pts)</li>
                  <li>2 Soal HOTS / High Risk (+200 Pts / Mundur Petak)</li>
                  <li>2 Kartu Tantangan Praktik / Hafalan</li>
                  <li>1 Kartu Bonus Keberuntungan</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isGeneratingAi}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sedang Meracik Soal dengan AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Template Soal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Component Modal Buku Petunjuk */}
      <GameGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}