import "./globals.css";

export const metadata = {
  title: "AI Image Studio",
  description: "AI-assisted image processing studio built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
