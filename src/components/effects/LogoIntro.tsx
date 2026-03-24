import { useEffect } from "react";

// LogoIntro removed — homepage uses built-in hero fade-in animation instead.
export function LogoIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => { onDone(); }, [onDone]);
  return null;
}
