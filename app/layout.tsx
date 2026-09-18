import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Board Game Engine - Educational Platform",
  description: "Interactive classroom digital board game engine",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-50 text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}