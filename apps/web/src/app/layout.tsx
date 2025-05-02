import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

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
		<ClerkProvider appearance={{ baseTheme: dark }}>
			<TRPCReactProvider>
				<html suppressHydrationWarning lang="en">
					<body>
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							{children}
						</ThemeProvider>
					</body>
				</html>
			</TRPCReactProvider>
		</ClerkProvider>
	);
}
