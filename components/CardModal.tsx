// File: components/CardModal.tsx
"use client";
import { useState, useEffect } from "react";
import { HelpCircle, Flame, Gift, AlertTriangle, CheckCircle, XCircle, PackageOpen, ShieldAlert, ShieldCheck, Shield, FlameKindling, Timer } from "lucide-react";

interface CardData {
  id?: string;
  type: "question" | "challenge" | "bonus" | "penalty" | string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  value?: number;
}

interface CardModalProps {
  card: CardData | null;
  onClose: () => void;
  onAnswerSubmit: (result: { isCorrect: boolean; value: number; type: string; skippedRisk?: boolean }) => void;
  isCurrentPlayer: boolean;
  isHost?: boolean;
  questionTimer?: number;
  penaltyTimer?: number;
}

export default function CardModal({
  card,
  onClose,
  onAnswerSubmit,
  isCurrentPlayer,
  isHost = false,
  questionTimer = 60,
  penaltyTimer = 30,
}: CardModalProps) {
  const [isOpening, setIsOpening] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // State pilihan strategi khusus Petak Risiko (Penalty)
  const [riskDecision, setRiskDecision] = useState<"pending" | "accepted" | "skipped">("pending");

  // State Hitung Mundur Timer
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Initializer saat modal kartu terbuka
  useEffect(() => {
    if (card) {
      setIsOpening(true);
      setRiskDecision("pending");
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setIsTimerRunning(false);

      const timer = setTimeout(() => {
        setIsOpening(false);
        
        // Inisialisasi Timer Berdasarkan Tipe Kartu
        if (card.type === "question") {
          const duration = questionTimer || 60;
          setTimeLeft(duration);
          setTotalTime(duration);
          setIsTimerRunning(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [card, questionTimer]);

  // Inisialisasi Timer Khusus Petak Merah saat Pemain Memilih "Ambil Risiko"
  useEffect(() => {
    if (card?.type === "penalty" && riskDecision === "accepted" && !isAnswered) {
      const duration = penaltyTimer || 30;
      setTimeLeft(duration);
      setTotalTime(duration);
      setIsTimerRunning(true);
    }
  }, [card?.type, riskDecision, isAnswered, penaltyTimer]);

  // Loop Hitung Mundur
  useEffect(() => {
    if (!isTimerRunning || isAnswered || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isAnswered, timeLeft]);

  if (!card) return null;

  // Handler jika waktu berpikir habis (Timeout)
  const handleTimeout = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);

    // Kirim hasil timeout ke parent setelah jeda singkat
    setTimeout(() => {
      onAnswerSubmit({
        isCorrect: false,
        value: card.value || 1,
        type: card.type,
        skippedRisk: false,
      });
      onClose();
    }, 1500);
  };

  const handleChooseAnswer = (option: string) => {
    if (!isCurrentPlayer || isAnswered) return;
    
    setIsTimerRunning(false);
    setSelectedOption(option);
    const correct = option === card.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
  };

  const handleFinishModal = () => {
    onAnswerSubmit({
      isCorrect,
      value: card.value || 1,
      type: card.type,
      skippedRisk: riskDecision === "skipped",
    });
    onClose();
  };

  const handleSkipRisk = () => {
    setIsTimerRunning(false);
    setRiskDecision("skipped");
    onAnswerSubmit({
      isCorrect: true,
      value: 0,
      type: "penalty",
      skippedRisk: true,
    });
    onClose();
  };

  const getTheme = () => {
    switch (card.type) {
      case "bonus":
        return {
          title: "Kartu Bonus",
          icon: Gift,
          badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          accentColor: "text-emerald-400",
          boxBorder: "border-emerald-500",
        };
      case "penalty":
        return {
          title: "Zona Risiko Tinggi (High Risk, High Reward)",
          icon: AlertTriangle,
          badgeBg: "bg-red-500/20 text-red-400 border-red-500/40",
          accentColor: "text-red-400",
          boxBorder: "border-red-500",
        };
      case "challenge":
        return {
          title: "Kartu Tantangan (Penilaian Guru)",
          icon: Flame,
          badgeBg: "bg-orange-500/20 text-orange-400 border-orange-500/40",
          accentColor: "text-orange-400",
          boxBorder: "border-orange-500",
        };
      default:
        return {
          title: "Kartu Pertanyaan",
          icon: HelpCircle,
          badgeBg: "bg-blue-500/20 text-blue-400 border-blue-500/40",
          accentColor: "text-blue-400",
          boxBorder: "border-blue-500",
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  // Persentase & Warna Bar Timer
  const timerPercentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const getTimerColor = () => {
    if (timerPercentage > 50) return "bg-emerald-500";
    if (timerPercentage > 20) return "bg-amber-500";
    return "bg-red-500 animate-pulse";
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {isOpening ? (
        <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center gap-4">
          <PackageOpen className="w-16 h-16 text-amber-400 animate-bounce" />
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white tracking-wide">Membuka Petak Misteri...</h3>
            <p className="text-xs text-indigo-300">Menyiapkan kartu soal/tantangan...</p>
          </div>
        </div>
      ) : (
        <div className={`bg-slate-900 border-2 ${theme.boxBorder} w-full max-w-md rounded-3xl p-6 text-white space-y-5 shadow-2xl animate-in fade-in zoom-in duration-300`}>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border ${theme.badgeBg}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-black text-base ${theme.accentColor}`}>{theme.title}</h3>
                <p className="text-[11px] text-slate-400">
                  {card.type === "challenge"
                    ? "Tunjukkan aksi/hafalanmu di depan kelas!"
                    : card.type === "penalty"
                    ? "Pilih strategi: Cari aman atau ambil risiko berhadiah besar!"
                    : isCurrentPlayer
                    ? "Giliranmu mengeksekusi kartu ini!"
                    : "Pemain lain sedang menjawab..."}
                </p>
              </div>
            </div>

            {/* VISUAL COUNTER TIMER DINGIN */}
            {isTimerRunning && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl font-mono text-xs font-black text-amber-400 shrink-0">
                <Timer className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* VISUAL PROGRESS BAR TIMER */}
          {isTimerRunning && (
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden -mt-2">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${getTimerColor()}`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          )}

          {/* Isi Konten */}
          <div className="space-y-4">

            {/* JIKA PETAK MERAH DAN BELUM MEMILIH STRATEGI */}
            {card.type === "penalty" && riskDecision === "pending" ? (
              <div className="space-y-4 py-1">
                <div className="bg-red-950/40 p-4 rounded-2xl border border-red-500/30 text-center space-y-1">
                  <p className="text-sm font-bold text-red-300">
                    Kamu Mendarat di Zona Risiko Tinggi!
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pilih keputusan kelompokmu untuk giliran ini:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={handleSkipRisk}
                    disabled={!isCurrentPlayer}
                    className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left rounded-2xl transition-all flex items-center justify-between disabled:opacity-50"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-blue-400" /> Cari Aman (Lewati)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tanpa risiko hukuman, tetapi tidak mendapat poin bonus.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800">0 Pts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskDecision("accepted")}
                    disabled={!isCurrentPlayer}
                    className="p-4 bg-red-950/60 hover:bg-red-900/80 border border-red-500/60 text-left rounded-2xl transition-all flex items-center justify-between shadow-lg shadow-red-950/50 disabled:opacity-50"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-red-300 flex items-center gap-1.5">
                        <FlameKindling className="w-4 h-4 text-amber-400" /> Ambil Risiko (Tantangan HOTS)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Timer <strong className="text-amber-300">{penaltyTimer}s</strong>. Jawab benar: <strong className="text-emerald-400">+200 Pts</strong>. Salah/Timeout: Mundur {card.value || 1} petak.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800">+200 Pts</span>
                  </button>
                </div>
              </div>
            ) : (
              /* KONTEN SOAL BIASA / SOAL RISIKO YANG SUDAH DITERIMA */
              <>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 shadow-inner">
                  <p className="text-sm font-medium leading-relaxed text-slate-100">
                    {card.content}
                  </p>
                </div>

                {/* Opsi Pilihan Ganda */}
                {(card.type === "question" || card.type === "penalty") && card.options && card.options.length > 0 && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {["A", "B", "C", "D"].map((label, idx) => {
                      const optionText = card.options ? card.options[idx] : undefined;
                      if (!optionText) return null;

                      let btnStyle = "bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-200";
                      
                      if (isAnswered) {
                        if (label === card.correctAnswer) {
                          btnStyle = "bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold shadow-md shadow-emerald-950";
                        } else if (label === selectedOption) {
                          btnStyle = "bg-red-950/90 border-red-500 text-red-200 shadow-md shadow-red-950";
                        }
                      }

                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleChooseAnswer(label)}
                          disabled={!isCurrentPlayer || isAnswered}
                          className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span><strong className="mr-1.5">{label}.</strong> {optionText}</span>
                          {isAnswered && label === card.correctAnswer && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                          {isAnswered && label === selectedOption && label !== card.correctAnswer && <XCircle className="w-4 h-4 text-red-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tombol Eksekusi Berdasarkan Tipe Kartu */}
          <div className="pt-2 border-t border-slate-800">
            {card.type === "challenge" ? (
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/80 text-center space-y-1">
                <p className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Lakukan Tantangan Sekarang!
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Performakan aksi/hafalanmu di depan kelas. Guru akan memberikan penilaian dari Control Panel Host.
                </p>
              </div>
            ) : card.type === "penalty" ? (
              /* EKSEKUSI SOAL RISIKO SETELAH DIJAWAB / TIMEOUT */
              riskDecision === "accepted" && isAnswered ? (
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl border text-center text-xs font-bold flex items-center justify-center gap-2 ${
                    isCorrect 
                      ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300" 
                      : "bg-red-950/80 border-red-500/60 text-red-300"
                  }`}>
                    {isCorrect ? (
                      <>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span>Jawaban Benar! Kamu Dapet Bonus +200 Poin!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span>{timeLeft === 0 ? "Waktu Habis!" : "Jawaban Salah!"} Dikenakan Konsekuensi.</span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishModal}
                    className={`w-full py-3.5 ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold text-xs rounded-xl transition-all shadow-lg`}
                  >
                    {isCorrect ? "Klaim Bonus (+200 Pts) & Selesai" : `Terima Hukuman (Mundur ${card.value || 1} Petak)`}
                  </button>
                </div>
              ) : null
            ) : card.type === "question" ? (
              isAnswered ? (
                <button
                  type="button"
                  onClick={handleFinishModal}
                  className={`w-full py-3.5 ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold text-xs rounded-xl transition-all shadow-lg`}
                >
                  {isCorrect ? "Jawaban Benar! Selesai Giliran" : "Jawaban Salah / Waktu Habis"}
                </button>
              ) : null
            ) : (
              <button
                type="button"
                onClick={handleFinishModal}
                disabled={!isCurrentPlayer && !isHost}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30"
              >
                Mengerti & Selesai Giliran
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}