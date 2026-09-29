"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import SpinWheel from "@/components/SpinWheel";
import CardModal from "@/components/CardModal";
import { Trophy, Gift, Flame, AlertTriangle, HelpCircle, Shield, SkipForward, RotateCcw, Check, X } from "lucide-react";

interface Player {
  id: string;
  name: string;
  position: number;
  score: number;
  color: string;
}

interface RoomData {
  id: string;
  code: string;
  templateId: string;
  hostId: string;
  status: string;
  currentTurn: number;
  players: Player[];
  activeCardType?: string | null;
}

interface CardData {
  id?: string;
  type: string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  value?: number;
}

const getTileType = (tileNumber: number): "bonus" | "penalty" | "challenge" | "question" => {
  if ([5, 12, 18, 25].includes(tileNumber)) return "bonus";       // Petak Hijau
  if ([3, 9, 17, 24, 28].includes(tileNumber)) return "penalty";  // Petak Merah
  if ([7, 14, 21, 27].includes(tileNumber)) return "challenge";   // Petak Oranye
  return "question";                                              // Petak Biru
};

const getTileStyle = (type: string, hasPlayers: boolean) => {
  const base = "aspect-square rounded-2xl p-2 relative flex flex-col justify-between border-2 transition-all duration-500 ease-out shadow-inner";
  
  if (hasPlayers) {
    return `${base} border-white bg-indigo-900/90 ring-4 ring-indigo-500/50 scale-110 z-20 shadow-xl animate-pulse`;
  }

  switch (type) {
    case "bonus":
      return `${base} bg-emerald-950/70 border-emerald-500/60 text-emerald-300 hover:border-emerald-400`;
    case "penalty":
      return `${base} bg-red-950/70 border-red-500/60 text-red-300 hover:border-red-400`;
    case "challenge":
      return `${base} bg-orange-950/70 border-orange-500/60 text-orange-300 hover:border-orange-400`;
    default:
      return `${base} bg-blue-950/70 border-blue-500/60 text-blue-300 hover:border-blue-400`;
  }
};

export default function PlayRoomPage() {
  const params = useParams();
  const roomCode = params.roomId as string;
  const { user } = useAuth(); // Ambil data guru yang sedang login

  // State Room & Player
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null);

  // State Card & Status Animasi
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [templateCards, setTemplateCards] = useState<CardData[]>([]);
  const [isMoving, setIsMoving] = useState<boolean>(false);

  // Cek apakah user saat ini adalah Pembuat Room (Guru)
  const isHost = Boolean(user && roomData && user.uid === roomData.hostId);

  // 1. Realtime Listener Room Data dari Firestore
  useEffect(() => {
    if (!roomCode) return;

    const q = query(collection(db, "rooms"), where("code", "==", roomCode));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const docData = docSnap.data() as Omit<RoomData, "id">;
        setRoomData({ id: docSnap.id, ...docData });

        // Jika Guru mereset activeCardType (setelah memberi nilai), otomatis tutup modal tim
        if (docData.activeCardType === null) {
          setActiveCard(null);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Otomatis tandai sebagai Joined jika Guru membuka room buatannya
  useEffect(() => {
    if (isHost && !isJoined) {
      setIsJoined(true);
    }
  }, [isHost, isJoined]);

  // 2. Fetch Bank Soal/Kartu berdasarkan Template ID Room
  useEffect(() => {
    if (roomData?.templateId) {
      const fetchCards = async () => {
        try {
          const q = query(
            collection(db, "cards"),
            where("templateId", "==", roomData.templateId)
          );
          const snap = await getDocs(q);
          const cardsList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CardData));
          setTemplateCards(cardsList);
        } catch (err: unknown) {
          console.error("Gagal mengambil bank soal:", err);
        }
      };
      fetchCards();
    }
  }, [roomData?.templateId]);

  // 3. Handler Join Game Siswa
  const handleJoinGame = async (e: FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomData) return;

    const currentPlayers = roomData.players || [];
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerName,
      position: 0,
      score: 0,
      color: colors[currentPlayers.length % colors.length],
    };

    const updatedPlayers = [...currentPlayers, newPlayer];

    await updateDoc(doc(db, "rooms", roomData.id), {
      players: updatedPlayers,
    });

    setMyPlayerIndex(currentPlayers.length);
    setIsJoined(true);
  };

  // 4. Handler Eksekusi Spin Wheel / Langkah dengan Jeda Animasi
  const handleStepRolled = async (steps: number) => {
    if (!roomData || myPlayerIndex === null || isMoving) return;

    setIsMoving(true);

    const updatedPlayers = [...roomData.players];
    const player = updatedPlayers[myPlayerIndex];

    const newPosition = Math.min(player.position + steps, 30);
    player.position = newPosition;

    await updateDoc(doc(db, "rooms", roomData.id), {
      players: updatedPlayers,
    });

    setTimeout(async () => {
      const landedTileType = getTileType(newPosition);
      const matchingCards = templateCards.filter((c) => c.type === landedTileType);

      let chosenCard: CardData | null = null;
      if (matchingCards.length > 0) {
        chosenCard = matchingCards[Math.floor(Math.random() * matchingCards.length)];
      } else if (templateCards.length > 0) {
        chosenCard = templateCards[Math.floor(Math.random() * templateCards.length)];
      }

      if (chosenCard) {
        setActiveCard(chosenCard);

        // Update activeCardType ke Firestore agar Guru melihat indikator Tantangan
        await updateDoc(doc(db, "rooms", roomData.id), {
          activeCardType: chosenCard.type,
        });
      } else {
        await passToNextTurn();
      }
      setIsMoving(false);
    }, 800);
  };

  // 5. Handler Eksekusi Jawaban/Aksi dari CardModal (Dijalankan Tim)
  const handleAnswerSubmit = async ({
    isCorrect,
    value,
    type,
  }: {
    isCorrect: boolean;
    value: number;
    type: string;
  }) => {
    if (!roomData) return;

    const updatedPlayers = [...roomData.players];
    const targetIdx = myPlayerIndex !== null ? myPlayerIndex : roomData.currentTurn;
    const player = updatedPlayers[targetIdx];

    if (player) {
      if (type === "question" && isCorrect) {
        player.score += 100;
      } else if (type === "bonus") {
        player.score += (value * 10) || 50;
      } else if (type === "penalty") {
        player.position = Math.max(0, player.position - (value || 1));
      }
    }

    const nextTurn = (roomData.currentTurn + 1) % (updatedPlayers.length || 1);

    await updateDoc(doc(db, "rooms", roomData.id), {
      players: updatedPlayers,
      currentTurn: nextTurn,
      activeCardType: null,
    });

    setActiveCard(null);
  };

  // KONTROL GURU: Penilaian Tantangan (Diakses dari Control Panel Host)
  const handleHostJudgeChallenge = async (passed: boolean) => {
    if (!roomData || roomData.players.length === 0) return;

    const updatedPlayers = [...roomData.players];
    const currentPlayer = updatedPlayers[roomData.currentTurn];

    if (currentPlayer && passed) {
      currentPlayer.score += 100; // Tambahkan +100 poin jika Guru menyatakan BERHASIL
    }

    const nextTurn = (roomData.currentTurn + 1) % roomData.players.length;

    // Reset activeCardType ke null -> Popup di HP tim otomatis tertutup
    await updateDoc(doc(db, "rooms", roomData.id), {
      players: updatedPlayers,
      currentTurn: nextTurn,
      activeCardType: null,
    });
  };

  // KONTROL HOST: Oper Giliran Paksa (Skip Turn)
  const passToNextTurn = async () => {
    if (!roomData || roomData.players.length === 0) return;
    const nextTurn = (roomData.currentTurn + 1) % roomData.players.length;
    await updateDoc(doc(db, "rooms", roomData.id), {
      currentTurn: nextTurn,
      activeCardType: null,
    });
  };

  // KONTROL HOST: Reset Game (Kembalikan ke Petak 0)
  const handleResetGame = async () => {
    if (!roomData || !confirm("Apakah Anda yakin ingin mereset posisi seluruh pemain?")) return;
    const resetPlayers = roomData.players.map((p) => ({ ...p, position: 0, score: 0 }));
    await updateDoc(doc(db, "rooms", roomData.id), {
      players: resetPlayers,
      currentTurn: 0,
      activeCardType: null,
    });
  };

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-medium">
        Menghubungkan ke Room Game...
      </div>
    );
  }

  // --- SCREEN 1: FORM JOIN GAME SISWA ---
  if (!isJoined && !isHost) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6 text-center text-white">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-indigo-400">Masuk Game Arena</h1>
            <p className="text-xs text-slate-400">
              PIN Room:{" "}
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                {roomCode}
              </span>
            </p>
          </div>

          <form onSubmit={handleJoinGame} className="space-y-4">
            <input
              type="text"
              placeholder="Masukkan Nama / Kelompok..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
              required
            />
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30"
            >
              Bergabung Ke Permainan
            </button>
          </form>
        </div>
      </main>
    );
  }

  const isMyTurn = myPlayerIndex !== null && roomData.currentTurn === myPlayerIndex;

  // --- SCREEN 2: ARENA BOARD GAME REALTIME ---
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 flex flex-col gap-6 max-w-6xl mx-auto pb-28">
      {/* Game Navbar Status */}
      <header className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              KODE ROOM
            </span>
            <h2 className="text-xl font-black font-mono text-indigo-400">{roomCode}</h2>
          </div>
          {isHost && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" /> HOST / GURU
            </span>
          )}
        </div>

        {/* Legend Warna Petak Papan */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1 text-blue-400"><HelpCircle className="w-3 h-3"/> Soal</span>
          <span className="flex items-center gap-1 text-orange-400"><Flame className="w-3 h-3"/> Tantangan</span>
          <span className="flex items-center gap-1 text-emerald-400"><Gift className="w-3 h-3"/> Bonus</span>
          <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-3 h-3"/> Konsekuensi</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            GILIRAN MAIN
          </span>
          <p className="text-sm font-bold text-emerald-400 animate-pulse">
            {roomData.players[roomData.currentTurn]?.name || "-"}
            {isMyTurn && " (Giliranmu!)"}
          </p>
        </div>
      </header>

      {/* Main Game Grid & Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Visualisasi Papan Game Grid 30 Petak Berwarna */}
        <div className="md:col-span-2 bg-slate-900 p-5 rounded-3xl border border-slate-800 grid grid-cols-5 sm:grid-cols-6 gap-2.5 shadow-inner">
          {Array.from({ length: 30 }).map((_, idx) => {
            const tileNumber = idx + 1;
            const tileType = getTileType(tileNumber);
            const playersOnTile = roomData.players?.filter((p) => p.position === tileNumber);
            const hasPlayers = Boolean(playersOnTile && playersOnTile.length > 0);

            return (
              <div
                key={tileNumber}
                className={getTileStyle(tileType, hasPlayers)}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-black opacity-80">{tileNumber}</span>
                  {tileType === "bonus" && <Gift className="w-3 h-3 text-emerald-400 opacity-70" />}
                  {tileType === "penalty" && <AlertTriangle className="w-3 h-3 text-red-400 opacity-70" />}
                  {tileType === "challenge" && <Flame className="w-3 h-3 text-orange-400 opacity-70" />}
                </div>
                
                {/* Pion Pemain */}
                <div className="flex flex-wrap gap-1.5 z-10 mt-1">
                  {playersOnTile?.map((p) => (
                    <div
                      key={p.id}
                      className="w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-500 scale-125 animate-bounce"
                      style={{ backgroundColor: p.color }}
                      title={`${p.name} (Petak ${p.position})`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Controls & Leaderboard */}
        <div className="space-y-6">
          <SpinWheel onSpinEnd={handleStepRolled} disabled={!isMyTurn || activeCard !== null || isMoving} />

          {/* Scoreboard Realtime */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Scoreboard Realtime
            </h3>
            <div className="space-y-2.5">
              {roomData.players?.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-all ${
                    idx === roomData.currentTurn
                      ? "bg-indigo-950/90 border-indigo-500 font-bold shadow-md"
                      : "bg-slate-800/40 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/50"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-white">{p.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-slate-300">Petak {p.position}</div>
                    <div className="text-[10px] text-amber-400 font-bold">{p.score || 0} Pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING HOST CONTROL BAR (KHUSUS GURU) */}
      {isHost && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 px-6 py-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 z-40">
          
          {/* JIKA KARTU TANTANGAN SEDANG AKTIF: TAMPILKAN TOMBOL PENILAIAN TANTANGAN KHUSUS GURU */}
          {roomData.activeCardType === "challenge" ? (
            <div className="flex items-center gap-2.5 bg-amber-950/70 p-2 rounded-xl border border-amber-500/50">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1 px-2">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> Penilaian Tantangan ({roomData.players[roomData.currentTurn]?.name || "Kelompok"}):
              </span>
              <button
                onClick={() => handleHostJudgeChallenge(false)}
                className="flex items-center gap-1 text-xs font-bold bg-red-600/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-all shadow-md"
              >
                <X className="w-3.5 h-3.5" /> Gagal (0 Pts)
              </button>
              <button
                onClick={() => handleHostJudgeChallenge(true)}
                className="flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-all shadow-md"
              >
                <Check className="w-3.5 h-3.5" /> Berhasil (+100 Pts)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold border-r border-slate-800 pr-4">
              <Shield className="w-4 h-4" /> Control Panel Host
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={passToNextTurn}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700 transition-all"
            >
              <SkipForward className="w-3.5 h-3.5 text-indigo-400" /> Skip Giliran
            </button>
            <button
              onClick={handleResetGame}
              className="flex items-center gap-1.5 text-xs font-bold text-red-300 bg-red-950/50 hover:bg-red-900/80 px-3 py-2 rounded-xl border border-red-800/60 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Game
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Card Modal */}
      {activeCard && (
        <CardModal
          card={activeCard}
          isCurrentPlayer={isMyTurn}
          isHost={isHost}
          onClose={() => setActiveCard(null)}
          onAnswerSubmit={handleAnswerSubmit}
        />
      )}
    </div>
  );
}