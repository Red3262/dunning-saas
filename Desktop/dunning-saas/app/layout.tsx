import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dunning SaaS",
  description: "Enterprise payment recovery engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen border-t-[8px] border-cobalt">
        {children}
      </body>
    </html>
  );
}