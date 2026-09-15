import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ghi chú của tôi",
  description: "Không gian ghi chú riêng tư, đơn giản và an toàn.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
