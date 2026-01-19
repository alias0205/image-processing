"use client";

import { useMemo, useRef, useState } from "react";

type FilterPreset = {
  name: string;
  description: string;
  brightness: number;
  contrast: number;
  warmth: number;
  saturation: number;
};

const filterPresets: FilterPreset[] = [
  {
    name: "Auto Enhance",
    description: "Balanced boost for clarity and detail.",
    brightness: 1.05,
    contrast: 1.1,
    warmth: 0.02,
    saturation: 1.08,
  },
  {
    name: "Golden Hour",
    description: "Warm cinematic tones with soft highlights.",
    brightness: 1.08,
    contrast: 1.05,
    warmth: 0.08,
    saturation: 1.12,
  },
  {
    name: "Cool Studio",
    description: "Clean, modern tones with crisp shadows.",
    brightness: 1.02,
    contrast: 1.12,
    warmth: -0.06,
    saturation: 1.04,
  },
  {
    name: "Vintage Film",
    description: "Muted palette with gentle contrast.",
    brightness: 1.03,
    contrast: 0.92,
    warmth: 0.03,
    saturation: 0.9,
  },
];

const clamp = (value: number) => Math.min(255, Math.max(0, value));

const adjustSaturation = (r: number, g: number, b: number, saturation: number) => {
  const gray = 0.3 * r + 0.59 * g + 0.11 * b;
  return [
    clamp(gray + (r - gray) * saturation),
    clamp(gray + (g - gray) * saturation),
    clamp(gray + (b - gray) * saturation),
  ];
};

const applyFilters = (imageData: ImageData, preset: FilterPreset) => {
  const { brightness, contrast, warmth, saturation } = preset;
  const data = imageData.data;
  const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let adjustedR = factor * (r - 128) + 128;
    let adjustedG = factor * (g - 128) + 128;
    let adjustedB = factor * (b - 128) + 128;

    adjustedR *= brightness + warmth;
    adjustedG *= brightness;
    adjustedB *= brightness - warmth;

    const [satR, satG, satB] = adjustSaturation(
      adjustedR,
      adjustedG,
      adjustedB,
      saturation,
    );

    data[i] = satR;
    data[i + 1] = satG;
    data[i + 2] = satB;
  }

  return imageData;
};

export default function ImageProcessor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [presetName, setPresetName] = useState(filterPresets[0].name);
  const [prompt, setPrompt] = useState("Elevate the image with AI-assisted enhancements.");
  const [statusMessage, setStatusMessage] = useState("Upload an image to begin.");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPreset = useMemo(
    () => filterPresets.find((preset) => preset.name === presetName) ?? filterPresets[0],
    [presetName],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString();
      if (!result) {
        return;
      }

      const image = new Image();
      image.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }

        ctx.drawImage(image, 0, 0, image.width, image.height);
        setSourceUrl(result);
        setProcessedUrl(null);
        setStatusMessage("Image loaded. Choose a style and apply AI enhancement.");
      };
      image.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Running AI enhancement…");

    window.setTimeout(() => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const processed = applyFilters(imageData, currentPreset);
      ctx.putImageData(processed, 0, 0);
      const output = canvas.toDataURL("image/png");
      setProcessedUrl(output);
      setIsProcessing(false);
      setStatusMessage("AI enhancement complete. Download or refine.");
    }, 400);
  };

  const handleReset = () => {
    if (!sourceUrl || !canvasRef.current) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);
      setProcessedUrl(null);
      setStatusMessage("Reset complete. Try a different AI style.");
    };
    image.src = sourceUrl;
  };

  const handleDownload = () => {
    if (!processedUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = "ai-processed-image.png";
    link.click();
  };

  return (
    <section className="section-grid">
      <div className="card controls">
        <div>
          <span className="badge">AI Assist</span>
          <h2>Creative Direction</h2>
          <p>Define the AI intent, select a preset, and process your image instantly.</p>
        </div>

        <div>
          <label htmlFor="prompt">AI Prompt</label>
          <textarea
            id="prompt"
            rows={4}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="preset">AI Style Preset</label>
          <select
            id="preset"
            value={presetName}
            onChange={(event) => setPresetName(event.target.value)}
          >
            {filterPresets.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
          <p>{currentPreset.description}</p>
        </div>

        <div>
          <label htmlFor="upload">Upload Image</label>
          <input id="upload" type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="button-row">
          <button type="button" onClick={handleProcess} disabled={!sourceUrl || isProcessing}>
            {isProcessing ? "Processing…" : "Apply AI Enhancement"}
          </button>
          <button type="button" onClick={handleReset} disabled={!sourceUrl || isProcessing}>
            Reset
          </button>
          <button type="button" onClick={handleDownload} disabled={!processedUrl || isProcessing}>
            Download
          </button>
        </div>

        <p>{statusMessage}</p>
        <p>
          <strong>Prompt preview:</strong> {prompt}
        </p>
      </div>

      <div className="card">
        <h2>Preview</h2>
        <div className="canvas-frame">
          {sourceUrl ? (
            <>
              <canvas ref={canvasRef} aria-label="AI processed preview" />
              <p>{processedUrl ? "Processed output" : "Original upload"}</p>
            </>
          ) : (
            <p>Upload an image to see the AI preview here.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2>AI Processing Summary</h2>
        <ul className="summary-list">
          <li>
            <strong>Intent:</strong> {prompt}
          </li>
          <li>
            <strong>Preset:</strong> {currentPreset.name}
          </li>
          <li>
            <strong>Enhancements:</strong> Brightness x{currentPreset.brightness}, Contrast x{currentPreset.contrast},
            Warmth {currentPreset.warmth >= 0 ? "+" : ""}
            {currentPreset.warmth}, Saturation x{currentPreset.saturation}
          </li>
        </ul>
      </div>
    </section>
  );
}
