import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import { MapPin, Calendar, Tag, Phone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemMatch } from "@/services/aiService";

interface PosterGeneratorProps {
  item: ItemMatch;
  itemUrl: string;
}

export function PosterGenerator({ item, itemUrl }: PosterGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [posterHeight, setPosterHeight] = useState(842);

  // Measure actual height of the poster in case content expands it beyond A4
  useEffect(() => {
    if (!posterRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPosterHeight(entry.contentRect.height);
      }
    });
    observer.observe(posterRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate the scale ratio so the 595px poster fits in the current modal/screen width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const availableWidth = containerWidth - 32; // leave 16px padding on sides
        if (availableWidth < 595) {
          setScale(availableWidth / 595);
        } else {
          setScale(1);
        }
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(itemUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      setIsGenerating(true);
      // Use html-to-image instead of html2canvas because it uses the browser's native rendering engine via SVG <foreignObject>.
      // This natively supports modern CSS color functions like `oklch` which Tailwind v4 uses and html2canvas crashes on.
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 2, // High resolution
        cacheBust: true, // Fixes CORS caching issues automatically
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `FindEka-${item.type.toUpperCase()}-${item.name || "Item"}.png`;
      link.click();
    } catch (err) {
      console.error("Error generating poster:", err);
      alert("Failed to generate poster. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isLost = item.type.toLowerCase() === "lost";
  const dateStr = item.date_lost || item.date_found || item.date || new Date(item.created_at || Date.now()).toLocaleDateString();

  return (
    <div className="flex flex-col items-center">
      {/* Poster Preview Area */}
      <div 
        ref={containerRef}
        className="w-full flex justify-center bg-slate-100 rounded-xl overflow-hidden"
        style={{ height: `${(posterHeight * scale) + 64}px`, paddingTop: '32px' }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '595px' }}>
          <div
            ref={posterRef}
            className="relative shadow-xl overflow-hidden flex flex-col flex-shrink-0"
            style={{ width: "595px", minHeight: "842px", height: "auto", transformOrigin: "top center", backgroundColor: "#ffffff" }} // A4 min dimensions, expands if content is long
          >
          {/* Header Bar */}
          <div className="py-5 text-center" style={{ backgroundColor: isLost ? '#dc2626' : '#059669' }}>
            <h1 className="text-5xl font-black tracking-widest uppercase m-0" style={{ color: '#ffffff' }}>
              {isLost ? "LOST ITEM" : "FOUND ITEM"}
            </h1>
          </div>

          {/* Image */}
          <div className="w-full h-80 relative flex-shrink-0 border-b-4" style={{ backgroundColor: '#e2e8f0', borderColor: '#0f172a' }}>
            <img
              src={item.image_url ? `${item.image_url}?t=${Date.now()}` : "https://placehold.co/800x600/e2e8f0/64748b?text=No+Image"}
              alt={item.name || item.title}
              className="w-full h-full object-contain"
              crossOrigin="anonymous" // IMPORTANT for html2canvas
            />
          </div>

          {/* Details Section */}
          <div className="p-8 flex-1 flex flex-col">
            <h2 className="text-4xl font-extrabold mb-4 leading-tight line-clamp-2" style={{ color: '#0f172a' }}>
              {item.name || item.title}
            </h2>
            
            <div className="space-y-3 mb-6 text-lg font-medium">
              <div className="flex items-center" style={{ color: '#334155' }}>
                <MapPin className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: '#64748b' }} />
                <span className="truncate">{item.location || "Unknown Location"}</span>
              </div>
              <div className="flex items-center" style={{ color: '#334155' }}>
                <Calendar className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: '#64748b' }} />
                <span className="truncate">{dateStr}</span>
              </div>
              {item.color && (
                <div className="flex items-center" style={{ color: '#334155' }}>
                  <Tag className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: '#64748b' }} />
                  <span className="truncate">{item.color}</span>
                </div>
              )}
            </div>

            <p className="text-xl mb-6 leading-relaxed flex-1" style={{ color: '#475569' }}>
              {item.description}
            </p>

            {/* Footer with QR */}
            <div className="mt-auto border-t pt-5 flex items-center justify-between" style={{ borderColor: '#e2e8f0' }}>
              <div className="pr-4">
                <p className="text-base font-bold mb-2" style={{ color: '#1e293b' }}>
                  Scan to view details or contact:
                </p>
                <div className="flex items-center text-lg font-bold mb-2" style={{ color: '#334155' }}>
                  <Phone className="w-5 h-5 mr-2" />
                  {item.phone || "No phone provided"}
                </div>
                <p className="text-sm truncate w-64" style={{ color: '#64748b' }}>
                  {itemUrl.replace(/^https?:\/\//, '')}
                </p>
              </div>
              <div className="flex-shrink-0 p-2 rounded-xl border shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                <QRCodeSVG value={itemUrl} size={96} level="M" includeMargin={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Action Area */}
      <div className="mt-6 flex flex-col items-center w-full max-w-[400px] gap-3">
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg shadow-lg"
        >
          {isGenerating ? "Generating Poster..." : "Download High-Res Poster"}
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="w-full h-12 text-slate-700 hover:bg-slate-100 shadow-sm border-slate-200"
        >
          {isCopied ? (
            <Check className="w-5 h-5 mr-2 text-emerald-600" />
          ) : (
            <Copy className="w-5 h-5 mr-2" />
          )}
          {isCopied ? "Link Copied!" : "Copy Link to Poster"}
        </Button>
        <p className="text-xs text-slate-500 text-center mt-1">
          Download or share this link to help find this item.
        </p>
      </div>
    </div>
  );
}
