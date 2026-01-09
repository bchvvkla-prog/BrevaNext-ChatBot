import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BrevaNext | AI Automation & Chatbots",
  description:
    "BrevaNext provides AI automation, chatbots, analytics, and enterprise AI solutions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* WEBSITE CONTENT */}
        {children}

        {/* FLOATING CHATBOT */}
        <ChatWidget />
      </body>
    </html>
  );
}
