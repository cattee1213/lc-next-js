import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "next",
  description: "next.js + langchain + siliconflow",
};

const menuList = [
  { name: "Home", path: "/" },
  { name: "Simple Chat", path: "/simple-chat" },
  { name: "Custom LLM Chat", path: "/custom-llm-chat" },
  { name: "LangGraph", path: "/langgraph" },
];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
      >
        <header className="w-full h-16 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center gap-8">
            {menuList.map((menu) => (
              <a
                key={menu.path}
                href={menu.path}
                className="text-gray-600 hover:text-black"
              >
                {menu.name}
              </a>
            ))}
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
