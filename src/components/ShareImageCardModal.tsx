import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Share2, Download, Copy, Check, Upload, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";

export interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  bookTitle: string;
  dateStr: string;
  isSlateTheme?: boolean;
}

interface BackgroundTemplate {
  id: string;
  name: string;
  url: string;
  type: "preset" | "custom";
  gradientFallback: [string, string, string];
  accentColor: string;
}

const PRESET_TEMPLATES: BackgroundTemplate[] = [
  {
    id: "golden-dawn",
    name: "Golden Dawn",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80",
    type: "preset",
    gradientFallback: ["#1e1b4b", "#431407", "#78350f"],
    accentColor: "#fef08a"
  },
  {
    id: "mist-pines",
    name: "Mist & Pines",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    type: "preset",
    gradientFallback: ["#022c22", "#064e3b", "#0f766e"],
    accentColor: "#6ee7b7"
  },
  {
    id: "celestial-night",
    name: "Celestial Night",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    type: "preset",
    gradientFallback: ["#090d16", "#0f172a", "#1e1b4b"],
    accentColor: "#a5f3fc"
  },
  {
    id: "parchment-grace",
    name: "Parchment",
    url: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80",
    type: "preset",
    gradientFallback: ["#292524", "#44403c", "#78350f"],
    accentColor: "#fde68a"
  },
  {
    id: "ocean-sunset",
    name: "Ocean Horizon",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    type: "preset",
    gradientFallback: ["#0c4a6e", "#134e4a", "#831843"],
    accentColor: "#bae6fd"
  },
  {
    id: "botanical-light",
    name: "Soft Dew",
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
    type: "preset",
    gradientFallback: ["#14532d", "#164e63", "#365314"],
    accentColor: "#bbf7d0"
  }
];

export const ShareImageCardModal: React.FC<ShareCardProps> = ({
  isOpen,
  onClose,
  initialText,
  bookTitle,
  dateStr,
  isSlateTheme = true
}) => {
  const [quoteText, setQuoteText] = useState(initialText);
  const [reflectionText, setReflectionText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<BackgroundTemplate>(PRESET_TEMPLATES[0]);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1">("9:16");
  const [customImage, setCustomImage] = useState<string | null>(null);
  
  const [isSharing, setIsSharing] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [copiedTextSuccess, setCopiedTextSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial text whenever modal opens or initialText changes
  useEffect(() => {
    if (initialText) {
      setQuoteText(initialText.trim());
    }
  }, [initialText, isOpen]);

  // Check if browser supports Native File Web Sharing
  useEffect(() => {
    const checkShareSupport = async () => {
      if (typeof navigator !== "undefined" && navigator.canShare && typeof File !== "undefined") {
        try {
          const testFile = new File(["test"], "test.png", { type: "image/png" });
          const supportsFiles = navigator.canShare({ files: [testFile] });
          setCanNativeShare(supportsFiles);
        } catch {
          setCanNativeShare(false);
        }
      } else {
        setCanNativeShare(false);
      }
    };
    checkShareSupport();
  }, []);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Handle Custom Image Upload
  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          setCustomImage(result);
          const customTpl: BackgroundTemplate = {
            id: "custom-user-img",
            name: "Custom Image",
            url: result,
            type: "custom",
            gradientFallback: ["#0f172a", "#1e293b", "#334155"],
            accentColor: "#38bdf8"
          };
          setSelectedTemplate(customTpl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Render Engine
  const renderCanvas = useCallback(
    async (targetCanvas: HTMLCanvasElement, isHighRes: boolean = true) => {
      const ctx = targetCanvas.getContext("2d");
      if (!ctx) return;

      // Define width & height
      const width = isHighRes ? (aspectRatio === "9:16" ? 1080 : 1080) : (aspectRatio === "9:16" ? 360 : 360);
      const height = isHighRes ? (aspectRatio === "9:16" ? 1920 : 1080) : (aspectRatio === "9:16" ? 640 : 360);

      targetCanvas.width = width;
      targetCanvas.height = height;

      // 1. Draw Background
      const bgUrl = selectedTemplate.id === "custom-user-img" && customImage ? customImage : selectedTemplate.url;

      const drawGradientFallback = () => {
        const [c1, c2, c3] = selectedTemplate.gradientFallback;
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, c1);
        grad.addColorStop(0.5, c2);
        grad.addColorStop(1, c3);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      };

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise<void>((resolve) => {
          img.onload = () => {
            // Center Crop (Object-fit: cover)
            const imgAspect = img.width / img.height;
            const canvasAspect = width / height;
            let renderW = width;
            let renderH = height;
            let offsetX = 0;
            let offsetY = 0;

            if (imgAspect > canvasAspect) {
              renderW = height * imgAspect;
              offsetX = (width - renderW) / 2;
            } else {
              renderH = width / imgAspect;
              offsetY = (height - renderH) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
            resolve();
          };
          img.onerror = () => {
            drawGradientFallback();
            resolve();
          };
          img.src = bgUrl;
        });
      } catch {
        drawGradientFallback();
      }

      // 2. Dark Scrim / Vignette Overlay for Contrast
      const scrim = ctx.createLinearGradient(0, 0, 0, height);
      scrim.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      scrim.addColorStop(0.3, "rgba(0, 0, 0, 0.65)");
      scrim.addColorStop(0.7, "rgba(0, 0, 0, 0.85)");
      scrim.addColorStop(1, "rgba(0, 0, 0, 0.95)");
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, width, height);

      // Subtle border frame
      const framePadding = width * 0.04;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = isHighRes ? 2 : 1;
      ctx.strokeRect(framePadding, framePadding, width - framePadding * 2, height - framePadding * 2);

      // 3. Top Decorative Header (App Brand / Quote Icon)
      const topY = height * 0.08;
      ctx.fillStyle = selectedTemplate.accentColor || "#fde047";
      ctx.font = `bold ${isHighRes ? 32 : 14}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("✦  DAILY DEVOTIONAL REFLECTION  ✦", width / 2, topY);

      // 4. Draw Main Quote
      const contentPadding = width * 0.1;
      const maxTextWidth = width - contentPadding * 2;

      // Dynamic Font Scaling based on text length & aspect ratio
      const cleanQuote = `“${quoteText.replace(/^[“"]|[”"]$/g, "")}”`;
      let fontSize = isHighRes 
        ? (cleanQuote.length > 280 ? 38 : cleanQuote.length > 180 ? 46 : 56)
        : (cleanQuote.length > 280 ? 13 : cleanQuote.length > 180 ? 15 : 18);

      if (aspectRatio === "1:1") {
        fontSize = Math.floor(fontSize * 0.82);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = `normal ${fontSize}px Georgia, serif`;
      ctx.textAlign = "center";

      // Text wrapping function
      const wrapText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(" ");
        let line = "";
        const lines: string[] = [];

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + " ";
          } else {
            line = testLine;
          }
        }
        lines.push(line.trim());

        let currentY = startY;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], x, currentY);
          currentY += lineHeight;
        }
        return currentY;
      };

      const quoteLineHeight = fontSize * 1.45;
      // Calculate total text height to center vertically
      const tempWords = cleanQuote.split(" ");
      let lineCount = 1;
      let tempLine = "";
      for (let w = 0; w < tempWords.length; w++) {
        const testL = tempLine + tempWords[w] + " ";
        if (ctx.measureText(testL).width > maxTextWidth && w > 0) {
          lineCount++;
          tempLine = tempWords[w] + " ";
        } else {
          tempLine = testL;
        }
      }
      const totalQuoteHeight = lineCount * quoteLineHeight;
      const quoteStartY = (height - totalQuoteHeight) / 2 - (reflectionText ? height * 0.05 : 0);

      const afterQuoteY = wrapText(cleanQuote, width / 2, quoteStartY, maxTextWidth, quoteLineHeight);

      // 5. Draw User Personal Reflection (if entered)
      if (reflectionText.trim()) {
        const reflY = afterQuoteY + (isHighRes ? 40 : 14);
        
        // Reflection Divider
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = isHighRes ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.35, reflY);
        ctx.lineTo(width * 0.65, reflY);
        ctx.stroke();

        const reflFontSize = isHighRes ? 32 : 11;
        ctx.font = `italic ${reflFontSize}px Georgia, serif`;
        ctx.fillStyle = selectedTemplate.accentColor || "#bae6fd";
        
        const reflText = `My Reflection: "${reflectionText.trim()}"`;
        wrapText(reflText, width / 2, reflY + (isHighRes ? 45 : 15), maxTextWidth, reflFontSize * 1.4);
      }

      // 6. Draw Bottom Attribution & Date
      const bottomY = height - (isHighRes ? 110 : 36);

      // Subtle separator line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = isHighRes ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, bottomY - (isHighRes ? 35 : 12));
      ctx.lineTo(width * 0.8, bottomY - (isHighRes ? 35 : 12));
      ctx.stroke();

      ctx.fillStyle = "#f1f5f9";
      ctx.font = `bold ${isHighRes ? 28 : 10}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(bookTitle.toUpperCase(), width / 2, bottomY);

      ctx.fillStyle = "rgba(203, 213, 225, 0.8)";
      ctx.font = `${isHighRes ? 22 : 8}px monospace`;
      ctx.fillText(`${dateStr.toUpperCase()} • ELLEN G. WHITE ESTATE`, width / 2, bottomY + (isHighRes ? 32 : 11));
    },
    [quoteText, reflectionText, selectedTemplate, aspectRatio, customImage, bookTitle, dateStr]
  );

  // Re-render preview canvas whenever inputs change
  useEffect(() => {
    if (isOpen && previewCanvasRef.current) {
      renderCanvas(previewCanvasRef.current, false);
    }
  }, [isOpen, renderCanvas]);

  if (!isOpen) return null;

  // Primary Action: Share to Socials OR Download & Copy
  const handlePrimaryShareAction = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      // 1. Render high-resolution canvas
      const highResCanvas = document.createElement("canvas");
      await renderCanvas(highResCanvas, true);

      // 2. Convert to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        highResCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.95);
      });

      if (!blob) {
        showToast("Failed generating card image. Please try again.");
        setIsSharing(false);
        return;
      }

      const file = new File([blob], `devotional-${dateStr.toLowerCase().replace(/\s+/g, "-")}.jpg`, {
        type: "image/jpeg"
      });

      const fullShareText = reflectionText.trim()
        ? `"${quoteText}"\n\nMy Reflection: ${reflectionText}\n\n— ${bookTitle} (${dateStr})`
        : `"${quoteText}"\n\n— ${bookTitle} (${dateStr})`;

      // 3. Try Native Web Share API if supported with files
      if (canNativeShare && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Devotional - ${bookTitle}`,
            text: fullShareText,
            files: [file]
          });
          showToast("Shared successfully!");
        } catch (err: any) {
          // Gracefully ignore AbortError (user cancelled share dialog)
          if (err.name !== "AbortError") {
            console.warn("Native share error:", err);
            // Fallback to direct download
            downloadCardImage(blob, fullShareText);
          }
        }
      } else {
        // Fallback for Desktop / Unsupported file sharing
        downloadCardImage(blob, fullShareText);
      }
    } catch (e) {
      console.error("Error during share generation:", e);
      showToast("Could not generate card image.");
    } finally {
      setIsSharing(false);
    }
  };

  // Helper: Download Image + Copy Text Fallback
  const downloadCardImage = async (blob: Blob, shareText: string) => {
    try {
      // Download image file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devotional-card-${dateStr.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Copy text to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopiedTextSuccess(true);
        setTimeout(() => setCopiedTextSuccess(false), 3000);
      }

      showToast("Card downloaded & text copied to clipboard!");
    } catch (err) {
      console.error("Download fallback error:", err);
      showToast("Card downloaded!");
    }
  };

  // Dedicated Copy Text Only Action
  const handleCopyTextOnly = async () => {
    const fullText = reflectionText.trim()
      ? `"${quoteText}"\n\nMy Reflection: ${reflectionText}\n\n— ${bookTitle} (${dateStr})`
      : `"${quoteText}"\n\n— ${bookTitle} (${dateStr})`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedTextSuccess(true);
      showToast("Reflection text copied to clipboard!");
      setTimeout(() => setCopiedTextSuccess(false), 2500);
    } catch {
      showToast("Failed to copy text.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Hidden high-res canvas ref for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input for Custom Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomUpload}
        accept="image/*"
        className="hidden"
      />

      <div 
        className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col lg:flex-row ${
          isSlateTheme 
            ? "bg-slate-900 border-cyan-500/30 text-slate-100 shadow-cyan-950/50" 
            : "bg-stone-900 border-amber-900/40 text-stone-100 shadow-stone-950/50"
        }`}
      >
        
        {/* LEFT COLUMN: Live Visual Card Preview */}
        <div className={`lg:w-1/2 p-4 sm:p-6 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r ${
          isSlateTheme ? "border-slate-800 bg-slate-950/50" : "border-stone-800 bg-black/40"
        }`}>
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center space-x-1.5">
              <Sparkles size={14} className="animate-pulse text-cyan-400" />
              <span>Card Live Preview</span>
            </span>

            {/* Aspect Ratio Selector Pills */}
            <div className="flex items-center space-x-1 bg-slate-800/80 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setAspectRatio("9:16")}
                className={`px-2 py-1 rounded-md transition-all font-bold ${
                  aspectRatio === "9:16" 
                    ? "bg-cyan-500 text-slate-950 shadow-sm" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                9:16 Story
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("1:1")}
                className={`px-2 py-1 rounded-md transition-all font-bold ${
                  aspectRatio === "1:1" 
                    ? "bg-cyan-500 text-slate-950 shadow-sm" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1:1 Square
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative w-full flex items-center justify-center my-auto py-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[50vh] sm:max-h-[55vh] flex items-center justify-center bg-slate-950">
              <canvas 
                ref={previewCanvasRef} 
                className="max-h-[50vh] sm:max-h-[55vh] object-contain rounded-2xl" 
              />
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-400 text-center mt-2">
            Formatted for Instagram Stories, Reels, iMessage & Social Posts
          </p>
        </div>

        {/* RIGHT COLUMN: Customizer Controls & Actions */}
        <div className="lg:w-1/2 p-4 sm:p-6 flex flex-col justify-between space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-display text-lg font-bold">Share Reflection as Image</h3>
              <p className="text-xs font-mono text-slate-400">{bookTitle} • {dateStr}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Controls Scroll Area */}
          <div className="space-y-4">
            
            {/* 1. Selected Devotional Quote Text */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                Passage / Quote:
              </label>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                rows={3}
                className="w-full text-xs font-serif leading-relaxed p-3 rounded-xl bg-slate-950/80 border border-slate-700/60 focus:border-cyan-400 focus:outline-none text-slate-100 resize-none"
                placeholder="Devotional passage quote..."
              />
            </div>

            {/* 2. Optional Personal Reflection Input */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Add Your Personal Reflection (Optional):</span>
                <span className="text-[10px] text-slate-400 font-normal">Appears on card</span>
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={2}
                placeholder="Write a prayer, thought, or takeaway to include on your card..."
                className="w-full text-xs font-sans leading-normal p-3 rounded-xl bg-slate-950/80 border border-slate-700/60 focus:border-cyan-400 focus:outline-none text-cyan-200 placeholder:text-slate-500 resize-none"
              />
            </div>

            {/* 3. Background Image Carousel / Selector */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-2">
                Choose Aesthetic Background Theme:
              </label>
              
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {/* Upload Custom Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`shrink-0 w-16 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all ${
                    selectedTemplate.id === "custom-user-img"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 scale-105"
                      : "border-slate-700 hover:border-slate-500 bg-slate-950/40 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Upload custom image from device"
                >
                  <Upload size={16} className="mb-1" />
                  <span className="text-[9px] font-mono font-bold text-center leading-tight">
                    {customImage ? "Custom" : "Upload"}
                  </span>
                </button>

                {/* Preset Templates */}
                {PRESET_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate.id === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`shrink-0 w-16 h-20 rounded-xl overflow-hidden relative border-2 transition-all ${
                        isSelected 
                          ? "border-cyan-400 ring-2 ring-cyan-400/30 scale-105 shadow-lg" 
                          : "border-transparent opacity-75 hover:opacity-100 hover:scale-100"
                      }`}
                    >
                      <img
                        src={tpl.url}
                        alt={tpl.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          // Fallback to color gradient if thumbnail fails
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div 
                        className="absolute inset-0 -z-10"
                        style={{
                          background: `linear-gradient(135deg, ${tpl.gradientFallback[0]}, ${tpl.gradientFallback[1]})`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                        <span className="text-[8px] font-mono font-bold text-white truncate w-full text-center">
                          {tpl.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            
            {/* Toast Notification Banner */}
            {toastMsg && (
              <div className="bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-mono py-1.5 px-3 rounded-xl text-center animate-in fade-in duration-150">
                {toastMsg}
              </div>
            )}

            {/* Primary Action Button: Native Share OR Download & Copy */}
            <button
              type="button"
              onClick={handlePrimaryShareAction}
              disabled={isSharing}
              className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
                isSharing
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : isSlateTheme
                    ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-[0.99]"
                    : "bg-amber-700 hover:bg-amber-800 text-white shadow-amber-900/30 active:scale-[0.99]"
              }`}
            >
              {isSharing ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-cyan-300" />
                  <span>Generating Card Image...</span>
                </>
              ) : canNativeShare ? (
                <>
                  <Share2 size={16} className="text-white" />
                  <span>SHARE TO SOCIALS</span>
                </>
              ) : (
                <>
                  <Download size={16} className="text-white" />
                  <Copy size={14} className="text-cyan-200" />
                  <span>DOWNLOAD CARD & COPY TEXT</span>
                </>
              )}
            </button>

            {/* Secondary Actions Row */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyTextOnly}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 hover:text-white font-mono text-[10px] font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                {copiedTextSuccess ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">TEXT COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-slate-400" />
                    <span>COPY TEXT ONLY</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-[10px] font-bold transition-all"
              >
                CLOSE
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
