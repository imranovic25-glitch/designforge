import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

interface CommunityScreenshotProps {
  src: string;
  alt: string;
  wrapperClassName?: string;
  imageClassName?: string;
  fallbackTitle?: string;
  fallbackHint?: string;
}

export function CommunityScreenshot({
  src,
  alt,
  wrapperClassName = "",
  imageClassName = "",
  fallbackTitle = "Image unavailable",
  fallbackHint = "The screenshot could not be loaded.",
}: CommunityScreenshotProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] ${wrapperClassName}`}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/45">
            <ImageOff size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">{fallbackTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-white/40">{fallbackHint}</p>
          </div>
        </div>
      )}
    </div>
  );
}