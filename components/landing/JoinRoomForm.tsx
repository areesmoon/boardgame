"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";

export default function JoinRoomForm({ compact = false }: { compact?: boolean }) {
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  const handleJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = roomCode.trim();
    if (code) router.push(`/play/${code}`);
  };

  return (
    <form
      onSubmit={handleJoin}
      className={`w-full ${compact ? "flex flex-col sm:flex-row gap-3" : "space-y-3"}`}
    >
      <label className="relative block flex-1">
        <span className="sr-only">PIN Room</span>
        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          placeholder="PIN 6 digit"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ""))}
          className="w-full pl-12 pr-4 py-4 bg-slate-950/80 border-2 border-slate-800 rounded-2xl font-mono text-xl font-bold tracking-[0.35em] text-emerald-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          required
        />
      </label>

      <button
        type="submit"
        disabled={roomCode.length < 6}
        className={`${compact ? "sm:w-auto" : ""} w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group`}
      >
        Gabung Game
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
