// File: components/GameGuideModal.tsx
"use client";
import { useState } from "react";
import {
  BookOpen,
  X,
  HelpCircle,
  Flame,
  Gift,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Timer,
  Pencil,
  PlusCircle,
  Wand2,
  Dices,
} from "lucide-react";

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameGuideModal({ isOpen, onClose }: GameGuideModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "editor" | "tiles" | "roles" | "scoring"
  >("overview");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 text-white space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white">Buku Petunjuk Permainan</h2>
              <p className="text-xs text-slate-400">Panduan Edukatif Digital Board Game PAI & Al-Qur'an Hadis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "overview", label: "Alur Game" },
            { id: "editor", label: "Kelola Template & AI" },
            { id: "tiles", label: "Jenis Petak & Timer" },
            { id: "roles", label: "Peran Guru & Siswa" },
            { id: "scoring", label: "Sistem Skor & Pemenang" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300 pr-2">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-indigo-400">1. Aturan Dasar Permainan</h3>
              <p>
                Digital Board Game ini dirancang untuk pembelajaran kolaboratif berbasis kelompok di kelas. Permainan menggunakan papan 30 petak dan Roda Putar (*Spin Wheel*) sebagai penentu langkah secara *turn-based realtime*.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Guru memilih, membuat manual, atau **meracik otomatis via AI** Template Soal dari Dashboard, lalu membuat Room Game.</li>
                <li>Guru membagikan **Kode PIN Room** ke siswa/kelompok.</li>
                <li>Siswa bergabung melalui HP/Laptop masing-masing. Nama tim otomatis tersimpan jika halaman ter-refresh (*Persistence*).</li>
                <li>Setiap kelompok memutar Roda Putar saat gilirannya tiba untuk menjalankan pion di papan.</li>
                <li>Mendarat di petak berwarna akan memicu kartu pertanyaan, tantangan aksi, bonus, atau zona risiko tinggi.</li>
              </ul>
            </div>
          )}

          {/* TAB 2: EDITOR & TEMPLATE MANAGEMENT */}
          {activeTab === "editor" && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-indigo-400">2. Membuat & Mengedit Bank Soal (AI & Editor Template)</h3>
              <p>
                Guru dapat membuat bank soal dengan 3 metode praktis dari Dashboard:
              </p>

              <div className="space-y-2.5">
                {/* Generasi Otomatis via AI */}
                <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-indigo-400" /> ✨ AI Quiz Generator (Gemini):
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Klik tombol <strong>"✨ Generate Soal via AI"</strong> di Dashboard:
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5 text-[10px] text-slate-300">
                    <li>Pilih tingkat kelas (SMP/MTs, Kelas X, XI, atau XII SMA/MA).</li>
                    <li>Ketik topik spesifik, ATAU tekan tombol <strong><Dices className="w-3 h-3 inline text-indigo-400" /> Acak Topik</strong> agar AI memilihkan materi kurikulum secara otomatis.</li>
                    <li>Dalam 3-5 detik, Gemini AI akan meracik 10 kartu soal komplit (5 Soal Standar, 2 HOTS Risiko Tinggi, 2 Tantangan Hafalan, & 1 Bonus).</li>
                  </ul>
                </div>

                {/* Manual & Import Seed */}
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" /> Pembuatan Manual & Import Contoh:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Guru bisa membuat template kosong secara manual atau menekan tombol <strong>"+ Import Contoh Al-Qur'an Hadis"</strong> untuk mengunduh template bawaan siap pakai.
                  </p>
                </div>

                {/* Editor & Timer */}
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Pencil className="w-4 h-4" /> Edit Kartu & Custom Timer:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Di halaman Editor Template (`/dashboard/template/[id]`), Guru dapat mengubah isi soal, kunci jawaban, efek langkah/mundur petak, serta durasi timer global (Default: Biru 60s & Merah 30s).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TILES & TIMERS */}
          {activeTab === "tiles" && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-indigo-400">3. Jenis Petak, Kartu & Mekanisme Timer</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {/* Petak Biru */}
                <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl flex gap-3 items-start">
                  <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-300">Petak Biru (Kartu Pertanyaan):</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pilihan ganda dengan Timer <strong>60 detik</strong>. Menjawab <strong>Benar = +100 Poin</strong>. Menjawab <strong>Salah / Kehabisan Waktu = 0 Poin</strong> (posisi aman).
                    </p>
                  </div>
                </div>

                {/* Petak Oranye */}
                <div className="p-3 bg-orange-950/40 border border-orange-500/40 rounded-xl flex gap-3 items-start">
                  <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-orange-300">Petak Oranye (Kartu Tantangan):</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aksi/hafalan langsung di depan kelas (Tanpa Timer). Guru memberikan penilaian langsung dari Host Control Panel (<strong>Berhasil = +100 Poin</strong>).
                    </p>
                  </div>
                </div>

                {/* Petak Hijau */}
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex gap-3 items-start">
                  <Gift className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300">Petak Hijau (Kartu Bonus):</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Klaim apresiasi instan (<strong>+50 s.d. +100 Poin Bonus</strong>) tanpa perlu menjawab soal.
                    </p>
                  </div>
                </div>

                {/* Petak Merah */}
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-300">Petak Merah (Zona Risiko Tinggi - High Risk, High Reward):</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Siswa menentukan strategi kelompok:
                    </p>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-[10px] text-slate-300">
                      <li><strong>Cari Aman (Lewati):</strong> Bebas risiko, 0 poin tambahan, posisi pion aman.</li>
                      <li><strong>Ambil Risiko (Tantangan HOTS):</strong> Timer ketat <strong>30 detik</strong> berdetak! Jawab benar dapet <strong>+200 Poin Bonus</strong>. Jika salah/kehabisan waktu, pion <strong>Mundur Petak</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROLES */}
          {activeTab === "roles" && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-indigo-400">4. Peran Guru & Siswa</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Peran Guru (Floating Host Control Panel):
                  </span>
                  <p className="text-slate-300">
                    Guru bertindak sebagai moderator & penilai utama melalui Floating Control Bar di bagian bawah layar arena game:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
                    <li>Memberikan penilaian Tantangan Oranye (Tombol <strong>Berhasil +100 Pts</strong> / <strong>Gagal 0 Pts</strong>).</li>
                    <li>Mengoper giliran main jika ada tim berhalangan (<strong>Skip Giliran</strong>).</li>
                    <li>Mengembalikan seluruh posisi pion ke petak awal (<strong>Reset Game</strong>).</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Peran Siswa / Kelompok:
                  </span>
                  <p className="text-slate-300">
                    Memutar Roda Putar saat gilirannya tiba, berdiskusi menentukan strategi risiko & jawaban soal sebelum timer habis, serta menampilkan hafalan/praktik di depan kelas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCORING */}
          {activeTab === "scoring" && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-indigo-400">5. Sistem Skor & Penentuan Pemenang</h3>
              <p>
                Perolehan skor dihitung otomatis oleh sistem dan dapat dipantau secara langsung melalui **Scoreboard Realtime** di sidebar.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Soal Standar Benar:</strong> +100 Poin.</li>
                <li><strong>Tantangan Disetujui Guru:</strong> +100 Poin.</li>
                <li><strong>Sukses Ambil Risiko (Soal HOTS):</strong> +200 Poin Bonus.</li>
                <li><strong>Kartu Bonus:</strong> +50 s.d. +100 Poin.</li>
                <li><strong>Penentuan Pemenang:</strong> Kelompok yang pertama kali mencapai Petak 30, ATAU kelompok yang mengumpulkan <strong>Poin Tertinggi</strong> saat durasi/sesi permainan selesai.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="pt-3 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
}