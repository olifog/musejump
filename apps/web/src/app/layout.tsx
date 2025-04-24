import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/client";

export const metadata: Metadata = {
  title: "musejump",
  description: "skip and loop the good bits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html lang="en">
          <body className="bg-gray-900">{children}</body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
