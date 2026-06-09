import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreativeFlow AI",
  description:
    "Marketing intelligence — creative angles, ad copy, and creative briefs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Icon font used by the design system */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
