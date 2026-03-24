/* ═══════════════════════════════════════════════════════════════════════
 * LiquidHero — WebGL-powered liquid / metaball simulation that renders
 * organic, flowing blobs behind the hero text.  No external deps —
 * pure canvas + requestAnimationFrame.
 *
 * The blobs use a metaball field rendered in a fragment shader for
 * buttery-smooth 60 fps performance.
 * ═══════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";

/* ── Shader source ──────────────────────────────────────────────────── */

const VERT = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform float u_time;
  uniform vec2  u_resolution;
  uniform float u_dpr;

  #define NUM_BLOBS 8

  // Smooth, organic movement — each blob orbits a unique Lissajous path
  vec2 blobPos(int i, float t) {
    float fi = float(i);
    float speed = 0.35 + fi * 0.08;
    float rx = 0.30 + fi * 0.04;
    float ry = 0.25 + fi * 0.045;
    return vec2(
      0.5 + rx * sin(t * speed + fi * 1.7),
      0.5 + ry * cos(t * speed * 0.8 + fi * 2.3)
    );
  }

  float blobRadius(int i, float t) {
    float fi = float(i);
    float base = 0.11 + fi * 0.014;
    return base + 0.02 * sin(t * 0.7 + fi * 3.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.x *= u_resolution.x / u_resolution.y;  // aspect correction

    float field = 0.0;
    float t = u_time;

    for (int i = 0; i < NUM_BLOBS; i++) {
      vec2 p = blobPos(i, t);
      p.x *= u_resolution.x / u_resolution.y;
      float r = blobRadius(i, t);
      float d = length(uv - p);
      field += (r * r) / (d * d + 0.0001);
    }

    // Threshold → smooth edge
    float edge = smoothstep(1.4, 2.8, field);

    // Colour: white-to-translucent with vivid blue-violet shift in the thickest blobs
    float core = smoothstep(3.0, 5.5, field);
    vec3 col = mix(
      vec3(1.0, 1.0, 1.0),                 // outer glow — pure white
      vec3(0.78, 0.82, 1.0),               // inner core — richer cool blue
      core
    );

    // Luminance modulation — glow fades toward edge (brighter overall)
    float alpha = edge * (0.09 + 0.09 * core);

    // Vignette to keep corners clean
    vec2 center = vec2(0.5 * u_resolution.x / u_resolution.y, 0.5);
    float vig = 1.0 - smoothstep(0.3, 0.85, length(uv - center));
    alpha *= vig;

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ── Component ──────────────────────────────────────────────────────── */

export function LiquidHero({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) return;

    /* ── compile helpers ─────────────────────────────────── */
    function compile(src: string, type: number) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = compile(VERT, gl.VERTEX_SHADER);
    const fs = compile(FRAG, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* ── full-screen quad ────────────────────────────────── */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    /* ── uniforms ────────────────────────────────────────── */
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uDpr = gl.getUniformLocation(prog, "u_dpr");

    /* ── resize handling ─────────────────────────────────── */
    const dpr = Math.min(window.devicePixelRatio, 2);
    function resize() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ── blend for additive-alpha compositing ────────────── */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive glow

    /* ── render loop ─────────────────────────────────────── */
    const start = performance.now();
    function frame() {
      const t = (performance.now() - start) / 1000;
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform1f(uTime, t);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uDpr, dpr);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * LiquidDrops — Pure-CSS animated liquid drops that float and morph.
 * Used as a lighter-weight decorative layer alongside the WebGL canvas.
 * ═══════════════════════════════════════════════════════════════════════ */

const DROPS: {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  opacity: number;
}[] = [
  { size: 340, x: "15%", y: "20%", delay: 0, duration: 9, opacity: 0.09 },
  { size: 260, x: "70%", y: "35%", delay: 1, duration: 11, opacity: 0.07 },
  { size: 200, x: "40%", y: "65%", delay: 2, duration: 8, opacity: 0.08 },
  { size: 180, x: "85%", y: "15%", delay: 0.5, duration: 10, opacity: 0.06 },
  { size: 300, x: "55%", y: "50%", delay: 1.5, duration: 12, opacity: 0.08 },
  { size: 140, x: "25%", y: "75%", delay: 2.5, duration: 7, opacity: 0.07 },
];

export function LiquidDrops({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {DROPS.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full liquid-drop-float"
          style={{
            width: d.size,
            height: d.size,
            left: d.x,
            top: d.y,
            opacity: d.opacity,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8), rgba(200,210,255,0.3) 50%, transparent 70%)`,
            filter: `blur(${d.size * 0.35}px)`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * LiquidRipple — A single SVG circle with a "drip" animation that
 * expands and fades out (think water drop hitting a surface).
 * Used around the hero heading to start a "droplet" moment.
 * ═══════════════════════════════════════════════════════════════════════ */

const RIPPLES = [
  { delay: 0, scale: 1, opacity: 0.18 },
  { delay: 0.6, scale: 1.6, opacity: 0.13 },
  { delay: 1.4, scale: 2.2, opacity: 0.08 },
];

export function LiquidRipple({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}>
      {RIPPLES.map((r, i) => (
        <div
          key={i}
          className="absolute w-[400px] h-[400px] rounded-full border border-white/10 liquid-ripple-expand"
          style={{
            animationDelay: `${r.delay}s`,
            "--ripple-scale": r.scale,
            "--ripple-opacity": r.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
