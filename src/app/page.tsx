import ImageProcessor from "@/components/ImageProcessor";

export default function Home() {
  return (
    <main>
      <header>
        <span className="badge">Next.js + AI</span>
        <h1>AI Image Processing Studio</h1>
        <p>
          Upload a photo, describe the visual vibe you want, and let our AI-inspired pipeline apply cinematic
          adjustments. Everything runs instantly in your browser.
        </p>
      </header>

      <ImageProcessor />
    </main>
  );
}
