import Link from "next/link";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Dices,
  Flame,
  Gamepad2,
  Gift,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Radio,
  Sparkles,
  Timer,
  Trophy,
  UserCheck,
  Users,
  Wand2,
} from "lucide-react";
import JoinRoomForm from "@/components/landing/JoinRoomForm";
import BoardPreview from "@/components/landing/BoardPreview";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Board Game Edukasi — Belajar Seru Lewat Permainan Papan Digital",
  description:
    "Ubah kelas jadi arena permainan. Guru membuat bank soal (atau diracik AI), siswa bergabung dengan PIN 6 digit, dan semua bermain real-time.",
};

const TILES = [
  {
    icon: HelpCircle,
    name: "Petak Soal",
    color: "Biru",
    desc: "Soal pilihan ganda dengan batas waktu. Jawab benar, tim dapat +100 poin.",
    cls: "from-blue-600/20 border-blue-500/40 text-blue-300",
    iconCls: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    icon: Flame,
    name: "Petak Tantangan",
    color: "Oranye",
    desc: "Praktik atau hafalan di depan kelas. Guru menilai langsung lulus atau tidak.",
    cls: "from-orange-600/20 border-orange-500/40 text-orange-300",
    iconCls: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  },
  {
    icon: AlertTriangle,
    name: "Zona Risiko (HOTS)",
    color: "Merah",
    desc: "Soal analisis tingkat tinggi. Berani ambil risiko? Benar +200, salah mundur petak.",
    cls: "from-red-600/20 border-red-500/40 text-red-300",
    iconCls: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  {
    icon: Gift,
    name: "Petak Bonus",
    color: "Hijau",
    desc: "Kartu keberuntungan yang langsung menambah poin tim. Siapa yang beruntung?",
    cls: "from-emerald-600/20 border-emerald-500/40 text-emerald-300",
    iconCls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
];

const FEATURES = [
  {
    icon: Wand2,
    title: "Bank Soal Diracik AI",
    desc: "Pilih jenjang & topik, AI menyusun 10 kartu lengkap — soal, tantangan, HOTS, dan bonus — dalam hitungan detik.",
  },
  {
    icon: Radio,
    title: "Real-time untuk Semua",
    desc: "Posisi pion, skor, dan giliran tersinkron otomatis di semua perangkat. Proyektor kelas & HP siswa selalu sama.",
  },
  {
    icon: Dices,
    title: "Spin Wheel, Bukan Dadu",
    desc: "Langkah ditentukan lewat putaran roda interaktif yang seru dan ramah untuk lingkungan sekolah.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Guru",
    desc: "Buat, edit, dan kelola template kartu untuk mata pelajaran apa pun. Satu template, bisa dimainkan berulang kali.",
  },
  {
    icon: Timer,
    title: "Timer Bisa Diatur",
    desc: "Atur durasi berpikir untuk petak soal dan zona risiko sesuai tingkat kesulitan kelasmu.",
  },
  {
    icon: KeyRound,
    title: "Tanpa Daftar Akun",
    desc: "Siswa cukup memasukkan PIN 6 digit dan nama tim. Langsung main, tanpa ribet.",
  },
];

const STEPS = [
  {
    who: "Guru",
    title: "Siapkan template kartu",
    desc: "Login dengan Google, buat template sendiri atau biarkan AI meracik bank soal sesuai materi.",
    icon: BookOpen,
  },
  {
    who: "Guru",
    title: "Bagikan PIN room",
    desc: "Generate PIN 6 digit, tampilkan papan di proyektor, dan minta siswa bergabung.",
    icon: Users,
  },
  {
    who: "Siswa",
    title: "Putar, jawab, menang!",
    desc: "Tiap tim memutar roda, mendarat di petak, menjawab kartu, dan berlomba mencapai petak 30.",
    icon: Trophy,
  },
];

export default function HomePage() {
  return (
    <main className={`${jakarta.className} min-h-screen bg-slate-950 text-white overflow-x-hidden`}>
      {/* Background ornamen */}
      <div className="pointer-events-none fixed inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative">
        {/* ===== NAVBAR ===== */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/40">
                <Gamepad2 className="w-5 h-5" />
              </span>
              <span className="font-extrabold tracking-tight">Board Game Edukasi</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <a href="#petak" className="hover:text-white transition-colors">Jenis Petak</a>
              <a href="#cara-main" className="hover:text-white transition-colors">Cara Main</a>
              <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            </div>

            <Link
              href="/login"
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-white/5 border border-white/10 hover:border-indigo-400/60 hover:bg-indigo-500/10 px-4 py-2 rounded-xl text-slate-200 transition-all"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" /> Portal Guru
            </Link>
          </nav>
        </header>

        {/* ===== HERO ===== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Media Pembelajaran Interaktif
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Ubah kelas jadi{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
                arena permainan
              </span>{" "}
              yang bikin semangat belajar.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Board game digital real-time untuk kelas. Siswa berlomba menjawab soal,
              menaklukkan tantangan, dan mengumpulkan poin — guru tinggal menyiapkan kartunya.
            </p>

            {/* Join card */}
            <div id="gabung" className="max-w-md bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl scroll-mt-24">
              <p className="text-sm font-bold text-slate-200 mb-1">Siswa? Langsung masuk.</p>
              <p className="text-xs text-slate-500 mb-4">Masukkan PIN Room dari gurumu.</p>
              <JoinRoomForm />
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Gratis untuk siswa</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Tanpa install</span>
              <span className="hidden sm:flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /> HP, tablet & laptop</span>
            </div>
          </div>

          <BoardPreview />
        </section>

        {/* ===== STATS ===== */}
        <section className="border-y border-white/5 bg-slate-900/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { k: "30", v: "Petak per papan" },
              { k: "4", v: "Jenis kartu" },
              { k: "1–4", v: "Langkah per putaran" },
              { k: "< 1 mnt", v: "Siap bermain" },
            ].map((s) => (
              <div key={s.v}>
                <p className="text-3xl sm:text-4xl font-extrabold text-white">{s.k}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== JENIS PETAK ===== */}
        <section id="petak" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28 scroll-mt-16">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-bold text-indigo-400 mb-3">Setiap petak punya cerita</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Empat jenis petak, empat cara menguji pemahaman.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TILES.map((t) => (
              <div
                key={t.name}
                className={`group relative rounded-3xl border bg-gradient-to-b to-slate-900/40 p-6 transition-all hover:-translate-y-1 ${t.cls}`}
              >
                <span className={`inline-flex p-3 rounded-2xl border mb-5 ${t.iconCls}`}>
                  <t.icon className="w-6 h-6" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Petak {t.color}</p>
                <h3 className="text-lg font-extrabold text-white mt-1 mb-2">{t.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CARA MAIN ===== */}
        <section id="cara-main" className="bg-slate-900/40 border-y border-white/5 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-sm font-bold text-emerald-400 mb-3">Cara main</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Dari persiapan sampai juara, cuma 3 langkah.
              </h2>
            </div>

            <ol className="grid md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-emerald-500/0" aria-hidden />
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative text-center px-4">
                  <div className="relative mx-auto w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-xl">
                    <s.icon className="w-8 h-8 text-indigo-300" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-indigo-600 text-xs font-extrabold flex items-center justify-center shadow-lg shadow-indigo-600/40">
                      {i + 1}
                    </span>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 ${
                      s.who === "Guru" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {s.who}
                  </span>
                  <h3 className="text-lg font-extrabold mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== FITUR ===== */}
        <section id="fitur" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-28 scroll-mt-16">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-bold text-fuchsia-400 mb-3">Dibuat untuk guru yang sibuk</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Semua yang dibutuhkan untuk kelas yang hidup.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 p-6 transition-colors"
              >
                <span className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-5">
                  <f.icon className="w-5 h-5" />
                </span>
                <h3 className="font-extrabold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-indigo-500/30 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 sm:p-12 lg:p-14">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="absolute -left-10 -bottom-20 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                  Siap bikin kelas berikutnya lebih seru?
                </h2>
                <p className="text-indigo-100/80 mb-8 max-w-md">
                  Masuk sebagai guru dengan akun Google, buat template pertamamu, dan mulai bermain hari ini juga.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-6 py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-colors group"
                >
                  Mulai sebagai Guru
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="bg-slate-950/40 backdrop-blur border border-white/15 rounded-3xl p-5 sm:p-6">
                <p className="text-sm font-bold mb-4">Sudah punya PIN dari guru?</p>
                <JoinRoomForm compact />
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              <span>Platform Media Pembelajaran Interaktif &copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="#petak" className="hover:text-slate-300">Jenis Petak</a>
              <a href="#cara-main" className="hover:text-slate-300">Cara Main</a>
              <Link href="/login" className="hover:text-slate-300">Portal Guru</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
