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
  ExternalLink,
} from "lucide-react";
import { seedQuranHadisTemplate } from "@/lib/seedData";

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
  roomCode?: string;
  roomId?: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

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
      // 1. Fetch Template
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
          ...data,
          roomCode: room?.code || undefined,
          roomId: room?.id || undefined,
        } as GameTemplate;
      });

      setTemplates(list);
    } catch (err: unknown) {
      console.error("Error fetching templates and rooms:", err);
    }
  };

  // Buat Template Baru
  const handleCreateTemplate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    setIsCreating(true);
    try {
      const docRef = await addDoc(collection(db, "templates"), {
        title: newTitle,
        authorId: user.uid,
        authorName: user.displayName || "Guru",
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

  const handleImportSeed = async () => {
    if (!user) return;
    setIsSeeding(true);
    await seedQuranHadisTemplate(user.uid, user.displayName || "Guru Al-Qur'an Hadis");
    await fetchTemplatesAndRooms();
    setIsSeeding(false);
  };

  // Generate / Reset PIN Room
  const handleGenerateOrResetPin = async (templateId: string, existingRoomId?: string) => {
    if (!user) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      if (existingRoomId) {
        // Reset/Update PIN yang sudah ada
        await updateDoc(doc(db, "rooms", existingRoomId), {
          code: newCode,
          status: "waiting",
          currentTurn: 0,
          players: [],
        });
      } else {
        // Buat Room Baru jika belum ada
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
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Dashboard Guru</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Form Buat Template */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Buat Template Game Baru
          </h2>
          <form onSubmit={handleCreateTemplate} className="flex gap-3">
            <input
              type="text"
              placeholder="Contoh: Kuis Matematika / Al-Qur'an Hadis Kelas X"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />{" "}
              {isCreating ? "Menyimpan..." : "Buat Template"}
            </button>
          </form>
        </section>

        {/* Daftar Template + Tombol Import Contoh */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              Daftar Template Bank Soal
            </h2>
            
            <button
              onClick={handleImportSeed}
              disabled={isSeeding}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSeeding ? "Mengimpor..." : "+ Import Contoh Al-Qur'an Hadis"}
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
              Belum ada template. Buat template manual di atas atau klik tombol <strong>Import Contoh</strong>!
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
                      <h3 className="font-bold text-slate-800 text-base">
                        {tpl.title}
                      </h3>
                    </div>

                    {/* BADGE AREA PIN ROOM SISWA */}
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
                            onClick={() => handleGenerateOrResetPin(tpl.id, tpl.roomId)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-all"
                            title="Reset PIN Baru"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
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
                      onClick={() => router.push(`/dashboard/template/${tpl.id}`)}
                      className="flex-1 py-2 text-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Edit Soal
                    </button>
                    <button
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
    </div>
  );
}