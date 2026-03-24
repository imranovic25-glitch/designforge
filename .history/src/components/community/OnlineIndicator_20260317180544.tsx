export function OnlineIndicator({ size = "sm" }: { size?: "sm" | "md" }) {
  const dotSize = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  const pingSize = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";

  return (
    <span className={`relative flex ${dotSize}`}>
      <span className={`animate-ping absolute inline-flex ${pingSize} rounded-full bg-emerald-400 opacity-75`} />
      <span className={`relative inline-flex rounded-full ${dotSize} bg-emerald-500 border-2 border-[#111]`} />
    </span>
  );
}
