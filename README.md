# 🎲 Educational Board Game Engine

A real-time, interactive, and customizable digital board game engine built for interactive classroom learning. Designed to support any educational subject (General/Multi-subject) with dynamic question card management and turn-based online gameplay.

---

## 🌟 Key Features

* **Multi-Subject CMS (Dashboard Guru):** Teachers can create, edit, and manage custom game templates and card decks (Questions, Challenges, Bonuses, Penalties).
* **Real-time Gameplay:** Instant turn-based game updates powered by Firebase Firestore listeners (`onSnapshot`).
* **Ethical & Inclusive Design:** Replaces traditional dice with an interactive **Spin Wheel / Step Generator** to keep gameplay engaging and free from dice-related controversy.
* **Seamless Authentication:** Simple Google Sign-In for teachers and quick 6-digit PIN room access for students (no registration required for players).
* **Responsive Board UI:** Built with Tailwind CSS for smooth cross-device accessibility (Mobile, Tablet, and Desktop).

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS + Lucide Icons
* **Database & Auth:** Firebase (Firestore & Google Auth)
* **Effects:** Canvas Confetti

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have Node.js (v18 or higher) installed on your system.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/your-username/boardgame.git](https://github.com/your-username/boardgame.git)
cd boardgame
npm install

```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your Firebase configurations:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

```

### 4. Running the Development Server

Start the local development server:

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 📁 Project Structure

```text
boardgame/
├── app/
│   ├── layout.js              # Root Layout & Auth Provider
│   ├── page.js                 # Landing Page / Join Room Form
│   ├── login/
│   │   └── page.js             # Teacher Login (Google Auth)
│   ├── dashboard/
│   │   ├── page.js             # Teacher Dashboard (Template & Room List)
│   │   └── template/
│   │       └── [id]/page.js    # Card Deck CRUD Editor
│   └── play/[roomId]/
│       └── page.js             # Real-time Board Game Arena
├── components/
│   ├── SpinWheel.jsx           # Interactive Step Generator
│   ├── BoardGrid.jsx           # Dynamic Board Game Canvas/Grid
│   └── CardModal.jsx           # Pop-up Modal for Active Cards
├── context/
│   └── AuthContext.js          # Firebase Authentication State
└── lib/
    └── firebase.js             # Firebase Client Configuration

```

---

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE). Developed by Sensoft Network.