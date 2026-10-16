"use client";

import { useMotionValueEvent, useReducedMotion, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  from: { src: string; alt: string };
  to: { src: string; alt: string };
  /** 0 → shows `from`, 1 → shows `to`. */
  progress: MotionValue<number>;
  className?: string;
};

/**
 * Two background-free portraits joined by a liquid seam that rises with
 * `progress`. The seam is fbm noise, refracts both images, and glows in the
 * accent colour. The cursor drags a small ripple through the picture.
 * Images are fitted whole (never cropped) and stand on the bottom edge.
 * Falls back to a plain crossfade without WebGL or with reduced motion.
 */
export function LiquidPortrait({ from, to, progress, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [fade, setFade] = useState(0);
  const state = useRef({ progress: progress.get(), mx: 0.5, my: 0.5, hover: 0, hoverTarget: 0 });

  useMotionValueEvent(progress, "change", (v) => {
    state.current.progress = v;
    if (!ready) setFade(v);
  });

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const program = createProgram(gl, VERT, FRAG);
    if (!program) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uTexA = u("uTexA");
    const uTexB = u("uTexB");
    const uProgress = u("uProgress");
    const uTime = u("uTime");
    const uMouse = u("uMouse");
    const uHover = u("uHover");
    const uRes = u("uRes");
    const uImgRes = u("uImgRes");
    const uAccent = u("uAccent");
    gl.uniform1i(uTexA, 0);
    gl.uniform1i(uTexB, 1);

    let disposed = false;
    let raf = 0;
    let visible = true;
    let imgW = 1;
    let imgH = 1;
    const textures: WebGLTexture[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const readAccent = () => {
      const c = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      const [r, g, b] = hexToRgb(c);
      gl.uniform3f(uAccent, r, g, b);
    };

    const start = performance.now();
    const render = () => {
      if (disposed) return;
      const s = state.current;
      s.hover += (s.hoverTarget - s.hover) * 0.06;
      resize();
      gl.uniform1f(uProgress, s.progress);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, s.mx, s.my);
      gl.uniform1f(uHover, s.hover);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (visible) raf = requestAnimationFrame(render);
    };

    Promise.all([loadImage(from.src), loadImage(to.src)])
      .then((imgs) => {
        if (disposed) return;
        imgs.forEach((img, i) => {
          const tex = gl.createTexture()!;
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          // Premultiplied upload, so linear filtering never bleeds the transparent pixels' colour into the edge.
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          textures.push(tex);
        });
        imgW = imgs[0].naturalWidth;
        imgH = imgs[0].naturalHeight;
        gl.uniform2f(uImgRes, imgW, imgH);
        readAccent();
        render();
        setReady(true);
      })
      .catch(() => {});

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && textures.length) raf = requestAnimationFrame(render);
    });
    io.observe(canvas);

    const themeObserver = new MutationObserver(readAccent);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObserver.disconnect();
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [from.src, to.src, reduce]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    state.current.mx = (e.clientX - r.left) / r.width;
    state.current.my = 1 - (e.clientY - r.top) / r.height;
    state.current.hoverTarget = 1;
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={() => (state.current.hoverTarget = 0)}
    >
      {/* Real images stay in the DOM: first paint, fallback, and alt text. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={from.src}
        alt={from.alt}
        fetchPriority="high"
        className="absolute inset-y-0 left-[7%] h-full w-[86%] object-contain object-bottom"
        style={{ opacity: ready ? 0 : 1 - fade }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={to.src}
        alt={to.alt}
        className="absolute inset-y-0 left-[7%] h-full w-[86%] object-contain object-bottom"
        style={{ opacity: ready ? 0 : fade }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}

const VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uProgress;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec2 uRes;
uniform vec2 uImgRes;
uniform vec3 uAccent;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// Contain the image in a centred box 86% as wide as the canvas, standing on the
// bottom edge, so arms never reach the card's sides even while it scales up.
// Returns uv in image space; outside 0..1 = no image.
const float BOX = 0.86;
vec2 fit(vec2 uv) {
  float rs = uRes.x * BOX / uRes.y, ri = uImgRes.x / uImgRes.y;
  vec2 size = rs > ri ? vec2(ri / rs * BOX, 1.0) : vec2(BOX, rs / ri);
  vec2 origin = vec2(0.5 - size.x * 0.5, 0.0);
  return (uv - origin) / size;
}

vec4 sampleImg(sampler2D tex, vec2 p) {
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return vec4(0.0);
  return texture2D(tex, p);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // Cursor ripple
  vec2 d = (uv - uMouse) * vec2(aspect, 1.0);
  float dist = length(d);
  float ripple = sin(dist * 46.0 - uTime * 5.0) * exp(-dist * 7.0) * uHover;
  uv += normalize(d + 1e-5) * ripple * 0.006;

  // Liquid seam rising from the bottom
  float t = uTime * 0.08;
  float n = fbm(uv * vec2(2.2, 3.0) + vec2(t, -t * 1.4));
  float field = uv.y * 0.62 + n * 0.38;
  float w = 0.06;
  float p = uProgress * (1.0 + 2.0 * w) - w;
  float m = 1.0 - smoothstep(p - w, p + w, field);

  // Refraction concentrated on the seam
  float band = pow(1.0 - abs(m * 2.0 - 1.0), 1.5);
  vec2 flow = vec2(fbm(uv * 4.0 + t) - 0.5, 0.6) * band;
  vec2 uvA = fit(uv - flow * 0.05);
  vec2 uvB = fit(uv + flow * 0.05);

  // Slight chromatic split inside the seam
  float ca = band * 0.006;
  vec4 a = sampleImg(uTexA, uvA);
  vec4 b = sampleImg(uTexB, uvB);
  a.r = sampleImg(uTexA, uvA + vec2(ca, 0.0)).r;
  a.b = sampleImg(uTexA, uvA - vec2(ca, 0.0)).b;
  b.r = sampleImg(uTexB, uvB + vec2(ca, 0.0)).r;
  b.b = sampleImg(uTexB, uvB - vec2(ca, 0.0)).b;

  vec4 col = mix(a, b, m);

  // Accent glow where the two meet, only on the figure itself
  float rim = smoothstep(0.7, 1.0, band) * step(0.001, uProgress) * step(uProgress, 0.999) * col.a;
  // Colours are premultiplied: scale the tint by alpha.
  col.rgb = mix(col.rgb, uAccent * col.a, rim * 0.45);
  col.rgb += rim * 0.06 * col.a;

  gl_FragColor = col;
}
`;

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const v = compile(gl.VERTEX_SHADER, vs);
  const f = compile(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
