"use client";
import { useState, useEffect } from "react";
import { HelpCircle, Flame, Gift, AlertTriangle, CheckCircle, XCircle, PackageOpen, ShieldAlert } from "lucide-react";

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
  onAnswerSubmit: (result: { isCorrect: boolean; value: number; type: string }) => void;
  isCurrentPlayer: boolean;
  isHost?: boolean; // Parameter opsional jika pengguna adalah Guru/Host
}

export default function CardModal({
  card,
  onClose,
  onAnswerSubmit,
  isCurrentPlayer,
  isHost = false,
}: CardModalProps) {
  const [isOpening, setIsOpening] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  useEffect(() => {
    if (card) {
      setIsOpening(true);
      const timer = setTimeout(() => setIsOpening(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [card]);

  if (!card) return null;

  const handleChooseAnswer = (option: string) => {
    if (!isCurrentPlayer || isAnswered) return;
    
    setSelectedOption(option);
    const correct = option === card.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
  };

  // Handler khusus penilaian Tantangan (ACC / Fail)
  const handleChallengeVerdict = (passed: boolean) => {
    onAnswerSubmit({
      isCorrect: passed,
      value: passed ? (card.value || 2) : 0,
      type: "challenge",
    });
    onClose();
  };

  const handleFinishModal = () => {
    onAnswerSubmit({
      isCorrect,
      value: card.value || 1,
      type: card.type,
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
          title: "Kartu Konsekuensi",
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
        <div className={`bg-slate-900 border-2 ${theme.boxBorder} w-full max-w-md rounded-3xl p-6 text-white space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300`}>
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className={`p-2.5 rounded-2xl border ${theme.badgeBg}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-black text-lg ${theme.accentColor}`}>{theme.title}</h3>
              <p className="text-xs text-slate-400">
                {card.type === "challenge"
                  ? "Tunjukkan aksi/hafalanmu di depan kelas!"
                  : isCurrentPlayer
                  ? "Giliranmu mengeksekusi kartu ini!"
                  : "Pemain lain sedang menjawab..."}
              </p>
            </div>
          </div>

          {/* Isi Konten */}
          <div className="space-y-4">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 shadow-inner">
              <p className="text-sm font-medium leading-relaxed text-slate-100">
                {card.content}
              </p>
            </div>

            {/* Opsi Pilihan Ganda */}
            {card.type === "question" && card.options && card.options.length > 0 && (
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
          </div>

          {/* Tombol Eksekusi Berdasarkan Tipe Kartu */}
          <div className="pt-2 border-t border-slate-800">
            {/* KARTU TANTANGAN: TIM MEMBACA INSTRUKSI, PENILAIAN DIAMBIL ALIH GURU DARI CONTROL PANEL */}
            {card.type === "challenge" ? (
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/80 text-center space-y-1">
                <p className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Lakukan Tantangan Sekarang!
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Performakan aksi/hafalanmu di depan kelas. Guru akan memberikan penilaian dari Control Panel Host.
                </p>
              </div>
            ) : card.type === "question" ? (
              isAnswered && (
                <button
                  onClick={handleFinishModal}
                  className={`w-full py-3.5 ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold text-xs rounded-xl transition-all shadow-lg`}
                >
                  {isCorrect ? "Jawaban Benar! Selesai Giliran" : "Jawaban Salah! Selesai Giliran"}
                </button>
              )
            ) : (
              <button
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