"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gamepad2, UserCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/play/${roomCode.trim()}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6">
      {/* Top Bar / Login Guru Link */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full py-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-200 text-sm">Board Game Engine</span>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-slate-300 hover:text-white transition-all"
        >
          <UserCheck className="w-4 h-4 text-indigo-400" /> Portal Guru
        </Link>
      </header>

      {/* Main Hero Section / Join Room Form */}
      <div className="max-w-md w-full mx-auto text-center space-y-8 my-auto">
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Masuk Permainan
          </h1>
          <p className="text-sm text-slate-400">
            Masukkan 6 digit PIN Room yang diberikan oleh gurumu untuk mulai bermain.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            placeholder="KODE PIN (Contoh: 123456)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full p-4 bg-slate-900 border-2 border-slate-800 rounded-2xl text-center font-mono text-xl font-bold tracking-widest text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all uppercase"
            required
          />

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            Gabung Game <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4">
        Platform Media Pembelajaran Interaktif &copy; {new Date().getFullYear()}
      </footer>
    </main>
  );
}