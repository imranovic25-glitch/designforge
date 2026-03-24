import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useInView } from "motion/react";

interface RevealProps {
  children: ReactNode;
  /** Extra Tailwind / CSS class names applied to the wrapper */
  className?: string;
  /** Delay before the animation starts (seconds) */
  delay?: number;
  /** How far below the viewport edge to start (negative = earlier) */
  margin?: string;
  /** Override the wrapper's inline styles */
  style?: CSSProperties;
  /** By default the animation fires once. Set false to repeat on re-entry. */
  once?: boolean;
  /** When true, children are only mounted once the element enters the viewport.
   *  This ensures inner animations fire at the right moment instead of on mount. */
  lazy?: boolean;
}

/**
 * Light scroll-reveal wrapper.
 * Wraps any content in a motion.div that fades up from a slight offset
 * when it enters the viewport. Uses Framer Motion's useInView so it
 * integrates naturally with the existing animation system.
 */
export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  margin = "-60px",
  style,
  once = true,
  lazy = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: margin as `${number}px` });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={style}
    >
      {lazy && !inView ? <div style={{ minHeight: "20rem" }} /> : children}
    </motion.div>
  );
}

/**
 * Convenience wrapper that staggers a list of children by `stagger` seconds.
 */
export function StaggeredReveal({
  children,
  className = "",
  stagger = 0.08,
  margin = "-60px",
}: {
  children: ReactNode[];
  className?: string;
  stagger?: number;
  margin?: string;
}) {
  return (
    <>
      {(children as ReactNode[]).map((child, i) => (
        <RevealOnScroll key={i} delay={i * stagger} margin={margin} className={className}>
          {child}
        </RevealOnScroll>
      ))}
    </>
  );
}
