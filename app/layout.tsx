import type { Metadata } from "next";
import "./globals.css";
import ClientBody from "./components/ClientBody";

export const metadata: Metadata = {
  title: "AI图片处理中心",
  description: "强大、高效的图片处理解决方案，包括图片压缩、抠图去背景、图片识别和AI生图等功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClientBody>{children}</ClientBody>
    </html>
  );
}
