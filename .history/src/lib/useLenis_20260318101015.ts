import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Initialises a Lenis smooth-scroll instance tied to the component lifecycle.
 * Mount this once at the root layout level so it persists across page routes.
 *
 * Settings are intentionally conservative ("light hybrid") — inertia is gentle,
 * duration is short, so the site feels polished rather than floaty.
 */

// Module-level ref so Layout can call scrollToTopInstant() without prop-drilling.
let _lenis: Lenis | null = null;

/**
 * Instantly jump to the top of the page in a way that is compatible with
 * Lenis' internal scroll state. Calling window.scrollTo() while Lenis is
 * active causes a visible flash because Lenis continues from its own stored
 * position. This function resets Lenis itself.
 */
export function scrollToTopInstant() {
  if (_lenis) {
    _lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0 });
  }
}

/**
 * Stop Lenis from intercepting scroll events. Used on pages that manage
 * their own scroll containers (e.g. the 3-column community layout).
 */
export function stopLenis() {
  _lenis?.stop();
}

/**
 * Re-enable Lenis after it was stopped.
 */
export function startLenis() {
  _lenis?.start();
}

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,       // seconds for one "scroll impulse" to settle
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    _lenis = lenis;

    let rafId: number;

    function onFrame(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(onFrame);
    }

    rafId = requestAnimationFrame(onFrame);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      _lenis = null;
    };
  }, []);
}
