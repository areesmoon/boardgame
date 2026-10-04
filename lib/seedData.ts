// File: lib/seedData.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const seedQuranHadisTemplate = async (userUid: string, userName: string) => {
  try {
    // 1. Buat Template Utama beserta Default Timer
    const templateRef = await addDoc(collection(db, "templates"), {
      title: "Al-Qur'an Hadis Class X - Bab Otentisitas Al-Qur'an & Hadis",
      authorId: userUid,
      authorName: userName,
      questionTimer: 60, // Default 60 detik untuk petak biru
      penaltyTimer: 30,  // Default 30 detik untuk petak merah
      createdAt: serverTimestamp(),
      cardsCount: 10,
    });

    const templateId = templateRef.id;

    // 2. Daftar Kartu Soal & Tantangan
    const cardsData = [
      // --- KARTU PERTANYAAN (Pilihan Ganda) ---
      {
        templateId,
        type: "question",
        content: "Apa arti dari kata 'Al-Qur'an' secara bahasa menurut pendapat yang paling kuat?",
        options: ["Bacaan atau yang dibaca", "Petunjuk hidup", "Tulisan yang indah", "Kumpulan hukum"],
        correctAnswer: "A",
        value: 1,
      },
      {
        templateId,
        type: "question",
        content: "Hadis yang diriwayatkan oleh sekelompok penyeru/perawi yang sangat banyak dan mustahil sepakat untuk berdusta dinamakan hadis...",
        options: ["Ahad", "Mutawatir", "Hasan", "Dha'if"],
        correctAnswer: "B",
        value: 1,
      },
      {
        templateId,
        type: "question",
        content: "Sebab-sebab turunnya suatu ayat Al-Qur'an dalam sejarah Islam dikenal dengan istilah...",
        options: ["Nasikh Mansukh", "Asbabul Wurud", "Asbabun Nuzul", "Makkiyah Madaniyah"],
        correctAnswer: "C",
        value: 1,
      },
      {
        templateId,
        type: "question",
        content: "Berikut ini yang merupakan salah satu syarat kesahihan sanad sebuah hadis adalah...",
        options: ["Perawinya terkenal kaya", "Sanadnya bersambung (Muttashil)", "Matannya sangat panjang", "Ditulis di abad ke-5"],
        correctAnswer: "B",
        value: 1,
      },

      // --- KARTU TANTANGAN (Praktik / Setor Hafalan) ---
      {
        templateId,
        type: "challenge",
        content: "TANTANGAN: Bacalkan Q.S. Al-Hujurat ayat 13 beserta artinya dengan tartil di depan guru/kelompok!",
        options: [],
        correctAnswer: null,
        value: 2,
      },
      {
        templateId,
        type: "challenge",
        content: "TANTANGAN: Sebutkan 4 kitab hadis utama (Kutubut Tis'ah) beserta pengarangnya!",
        options: [],
        correctAnswer: null,
        value: 2,
      },

      // --- KARTU BONUS ---
      {
        templateId,
        type: "bonus",
        content: "BONUS KHUSUS: Kelompokmu menunjukkan keaktifan luar biasa dalam menyimak materi. Maju 2 petak ekstra & +50 Poin!",
        options: [],
        correctAnswer: null,
        value: 2,
      },
      {
        templateId,
        type: "bonus",
        content: "KEBERUNTUNGAN: Mendapat Kartu Bebas Hukuman! Dapatkan tambahan +100 Poin gratis.",
        options: [],
        correctAnswer: null,
        value: 1,
      },

      // --- KARTU KONSEKUENSI / ZONA RISIKO TINGGI (HIGH RISK, HIGH REWARD) ---
      {
        templateId,
        type: "penalty",
        content: "[TANTANGAN HOTS RISIKO TINGGI]: Mengapa Hadis Mutawatir dikategorikan sebagai ilmu Qath'i (pasti benar)? Analisis alasannya!",
        options: [
          "Karena perawinya banyak di tiap tingkatan sanad dan mustahil sepakat berdusta",
          "Karena ditulis langsung oleh Nabi Muhammad SAW secara pribadi",
          "Karena hanya diriwayatkan oleh sahabat yang bergelar Khulafaur Rasyidin",
          "Karena sanadnya tidak perlu diperiksa keilmuannya lagi"
        ],
        correctAnswer: "A",
        value: 1,
      },
      {
        templateId,
        type: "penalty",
        content: "[TANTANGAN HOTS RISIKO TINGGI]: Apa konsekuensi ilmiah jika sebuah hadis memiliki cacat tersembunyi ('Illah) pada sanadnya?",
        options: [
          "Derajat hadis turun dari Shahih menjadi Dha'if / Munqathi'",
          "Hadis tersebut otomatis naik menjadi Mutawatir",
          "Hadis tersebut berubah status menjadi ayat Al-Qur'an",
          "Hadis tetap dianggap Shahih mutlak tanpa catatan"
        ],
        correctAnswer: "A",
        value: 2,
      },
    ];

    // 3. Simpan Semua Kartu ke Firestore
    for (const card of cardsData) {
      await addDoc(collection(db, "cards"), {
        ...card,
        createdAt: serverTimestamp(),
      });
    }

    alert("Berhasil mengimpor Template Al-Qur'an Hadis beserta 10 Kartu Soal!");
  } catch (err) {
    console.error("Gagal menanam seed data:", err);
    alert("Gagal mengimpor data!");
  }
};