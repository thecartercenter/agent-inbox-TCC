import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThreadsProvider } from "@/components/agent-inbox/contexts/ThreadContext";
import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar, AppSidebarTrigger } from "@/components/app-sidebar";

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
        <React.Suspense fallback={<div>Loading (layout)...</div>}>
          <Toaster />
          <ThreadsProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex flex-row w-full min-h-full pt-6 pl-6 gap-6">
                <AppSidebarTrigger isOutside={true} />
                <div className="min-w-full h-full bg-white rounded-tl-[58px]">
                  {children}
                </div>
              </main>
            </SidebarProvider>
          </ThreadsProvider>
        </React.Suspense>
      </body>
    </html>
  );
}
