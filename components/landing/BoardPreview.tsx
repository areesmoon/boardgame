"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Flame, Gift, HelpCircle, Trophy } from "lucide-react";

// Sama dengan pemetaan petak di app/play/[roomId]/page.tsx
const getTileType = (n: number): "bonus" | "penalty" | "challenge" | "question" => {
  if ([5, 12, 18, 25].includes(n)) return "bonus";
  if ([3, 9, 17, 24, 28].includes(n)) return "penalty";
  if ([7, 14, 21, 27].includes(n)) return "challenge";
  return "question";
};

const TILE_STYLE = {
  question: "bg-blue-950/70 border-blue-500/50 text-blue-300",
  penalty: "bg-red-950/70 border-red-500/50 text-red-300",
  challenge: "bg-orange-950/70 border-orange-500/50 text-orange-300",
  bonus: "bg-emerald-950/70 border-emerald-500/50 text-emerald-300",
} as const;

const TILE_ICON = {
  question: HelpCircle,
  penalty: AlertTriangle,
  challenge: Flame,
  bonus: Gift,
} as const;

const TOKENS = [
  { name: "Tim A", color: "#ef4444", start: 4 },
  { name: "Tim B", color: "#3b82f6", start: 11 },
  { name: "Tim C", color: "#10b981", start: 19 },
];

export default function BoardPreview() {
  const [game, setGame] = useState({
    positions: TOKENS.map((t) => t.start),
    turn: 0,
    lastRoll: 3,
  });
  const { positions, turn, lastRoll } = game;

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const id = setInterval(() => {
      const steps = Math.floor(Math.random() * 4) + 1; // sama seperti SpinWheel (1-4)
      setGame((g) => {
        const next = [...g.positions];
        next[g.turn] = next[g.turn] + steps > 30 ? 1 : next[g.turn] + steps;
        return { positions: next, turn: (g.turn + 1) % TOKENS.length, lastRoll: steps };
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const activeTeam = (turn + TOKENS.length - 1) % TOKENS.length;
  const activeTile = getTileType(positions[activeTeam]);
  const ActiveIcon = TILE_ICON[activeTile];

  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-indigo-600/30 via-fuchsia-500/10 to-emerald-500/20 blur-3xl rounded-[3rem]" aria-hidden />

      <div className="relative bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl">
        {/* Header mini */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Kode Room</p>
            <p className="font-mono font-black text-indigo-400 text-lg leading-none">482913</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Giliran</p>
            <p className="text-sm font-bold" style={{ color: TOKENS[turn].color }}>
              {TOKENS[turn].name}
            </p>
          </div>
        </div>

        {/* Papan 30 petak */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2" aria-hidden>
          {Array.from({ length: 30 }, (_, i) => {
            const n = i + 1;
            const type = getTileType(n);
            const Icon = n === 30 ? Trophy : TILE_ICON[type];
            const here = TOKENS.filter((_, ti) => positions[ti] === n);
            return (
              <div
                key={n}
                className={`aspect-square rounded-lg sm:rounded-xl border p-1 relative flex flex-col justify-between transition-all duration-500 ${
                  n === 30
                    ? "bg-amber-950/70 border-amber-400/60 text-amber-300"
                    : TILE_STYLE[type]
                } ${here.length ? "ring-2 ring-white/70 scale-105 z-10" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[8px] sm:text-[10px] font-black opacity-70">{n}</span>
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-80" />
                </div>
                <div className="flex gap-0.5 flex-wrap">
                  {here.map((t) => (
                    <span
                      key={t.name}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white shadow animate-bounce"
                      style={{ backgroundColor: t.color }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div className="mt-4 flex items-center justify-between gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg border ${TILE_STYLE[activeTile]}`}>
              <ActiveIcon className="w-4 h-4" />
            </span>
            <p className="text-xs text-slate-300 truncate">
              <span className="font-bold" style={{ color: TOKENS[activeTeam].color }}>
                {TOKENS[activeTeam].name}
              </span>{" "}
              mendarat di petak {positions[activeTeam]}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-1 rounded-lg">
            +{lastRoll} langkah
          </span>
        </div>
      </div>
    </div>
  );
}
