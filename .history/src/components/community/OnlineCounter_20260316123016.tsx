import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { subscribeToCommunityPresence } from "@/src/lib/community-store";
import { useAuth } from "@/src/lib/auth";

export function OnlineCounter() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const unsub = subscribeToCommunityPresence(user?.id ?? null, setCount);
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
}
