"use client";
import { useState } from "react";
import { Dices } from "lucide-react";

interface SpinWheelProps {
  onSpinEnd: (steps: number) => void;
  disabled?: boolean;
}

export default function SpinWheel({ onSpinEnd, disabled = false }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  const handleSpin = () => {
    if (disabled || isSpinning) return;

    setIsSpinning(true);
    setSelectedNum(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomStep = Math.floor(Math.random() * 4) + 1;
      setSelectedNum(randomStep);
      count++;

      if (count > 20) {
        clearInterval(interval);
        const finalStep = Math.floor(Math.random() * 4) + 1;
        setSelectedNum(finalStep);
        setIsSpinning(false);
        onSpinEnd(finalStep);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-inner">
        {selectedNum !== null ? selectedNum : <Dices className="w-8 h-8 text-indigo-400" />}
      </div>
      <button
        onClick={handleSpin}
        disabled={disabled || isSpinning}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
      >
        {isSpinning ? "Mewujud Langkah..." : "Putar Langkah (1-4)"}
      </button>
    </div>
  );
}