import type { Platform } from "@/src/lib/community-types";
import { Smartphone, Globe, Monitor, Layers } from "lucide-react";

const CONFIG: Record<Platform, { icon: typeof Globe; label: string; color: string; bg: string }> = {
  android: { icon: Smartphone, label: "Android", color: "text-green-400", bg: "bg-green-500/10" },
  ios: { icon: Smartphone, label: "iOS", color: "text-blue-400", bg: "bg-blue-500/10" },
  web: { icon: Globe, label: "Web", color: "text-violet-400", bg: "bg-violet-500/10" },
  desktop: { icon: Monitor, label: "Desktop", color: "text-amber-400", bg: "bg-amber-500/10" },
  "cross-platform": { icon: Layers, label: "Cross", color: "text-pink-400", bg: "bg-pink-500/10" },
};

export function PlatformBadge({ platform, size = "sm" }: { platform: Platform; size?: "sm" | "md" }) {
  const c = CONFIG[platform];
  const Icon = c.icon;
  const isSmall = size === "sm";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-medium ${c.bg} ${c.color} ${
      isSmall ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-1"
    }`}>
      <Icon size={isSmall ? 11 : 13} />
      {c.label}
    </span>
  );
}
