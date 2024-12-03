import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThreadsProvider } from "@/components/agent-inbox/contexts/ThreadContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Inbox",
  description: "Agent Inbox UX by LangChain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThreadsProvider>
          {children}
          <Toaster />
        </ThreadsProvider>
      </body>
    </html>
  );
}
