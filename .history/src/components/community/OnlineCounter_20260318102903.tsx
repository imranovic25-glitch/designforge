import { useEffect, useState, useRef, memo } from "react";
import { Users } from "lucide-react";
import { subscribeToCommunityPresence } from "@/src/lib/community-store";
import { useAuth } from "@/src/lib/auth";

export const OnlineCounter = memo(function OnlineCounter() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  const prevCountRef = useRef(0);

  useEffect(() => {
    const unsub = subscribeToCommunityPresence(user?.id ?? null, (newCount) => {
      if (newCount !== prevCountRef.current) {
        prevCountRef.current = newCount;
        setCount(newCount);
      }
    });
    return unsub;
  }, [user?.id]);

  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <Users size={14} className="text-white/40" />
      <span className="text-white/50 tabular-nums">
        <span className="text-emerald-400 font-medium">{count}</span> online
      </span>
    </div>
  );
});
