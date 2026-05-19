"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

// ── Geometry ──────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const NUM_DOTS = 1200;
const NUM_PARTICLES = 60;

// orange accent RGB from C.or (#f97316)
const OR = 249, OG = 115, OB = 22;

function fibonacciSphere(n: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = GOLDEN * i;
    pts.push([r * Math.cos(t), y, r * Math.sin(t)]);
  }
  return pts;
}

const GLOBE_DOTS = fibonacciSphere(NUM_DOTS);

function rotY(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}
function rotX(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a), s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}
function project(x: number, y: number, z: number, depth: number, scale: number) {
  const w = depth / (depth + z * 0.5);
  return { sx: x * w * scale, sy: y * w * scale, sz: z };
}

interface Particle {
  theta: number; phi: number; r: number;
  vTheta: number; vPhi: number; vR: number;
  size: number; alpha: number;
}
function mkParticles(): Particle[] {
  return Array.from({ length: NUM_PARTICLES }, () => ({
    theta: Math.random() * TAU,
    phi: Math.random() * Math.PI,
    r: 1.15 + Math.random() * 0.5,
    vTheta: (Math.random() - 0.5) * 0.005,
    vPhi: (Math.random() - 0.5) * 0.003,
    vR: (Math.random() - 0.5) * 0.0012,
    size: 1.0 + Math.random() * 1.8,
    alpha: 0.35 + Math.random() * 0.55,
  }));
}

// ── Canvas ────────────────────────────────────────────────────────────────────

function GlobeCanvas({ metricsLatency }: { metricsLatency: number }) {
  const C = useTheme();
  const bgRef = useRef(C.bg);
  useEffect(() => { bgRef.current = C.bg; }, [C.bg]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const stateRef = useRef({
    rot: 0,
    tilt: 0.28,
    scan: 0,
    litDots: new Float32Array(NUM_DOTS),
    particles: mkParticles(),
    // drag / inertia
    isDragging: false,
    lastX: 0,
    lastY: 0,
    vRot: 0,    // velocity
    vTilt: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Resize ──
    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width || 480;
      canvas.height = rect.height || 480;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    // ── Mouse drag ──
    function onMouseDown(e: MouseEvent) {
      const st = stateRef.current;
      st.isDragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
      st.vRot = 0;
      st.vTilt = 0;
      if (canvas) canvas.style.cursor = "grabbing";
    }
    function onMouseMove(e: MouseEvent) {
      const st = stateRef.current;
      if (!st.isDragging) return;
      const dx = e.clientX - st.lastX;
      const dy = e.clientY - st.lastY;
      st.vRot = dx * 0.006;
      st.vTilt = dy * 0.006;
      st.rot += st.vRot;
      st.tilt = Math.max(-1.2, Math.min(1.2, st.tilt + st.vTilt));
      st.lastX = e.clientX;
      st.lastY = e.clientY;
    }
    function onMouseUp() {
      stateRef.current.isDragging = false;
      if (canvas) canvas.style.cursor = "grab";
    }

    // ── Touch drag ──
    function onTouchStart(e: TouchEvent) {
      const st = stateRef.current;
      st.isDragging = true;
      st.lastX = e.touches[0].clientX;
      st.lastY = e.touches[0].clientY;
      st.vRot = 0;
      st.vTilt = 0;
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const st = stateRef.current;
      if (!st.isDragging) return;
      const dx = e.touches[0].clientX - st.lastX;
      const dy = e.touches[0].clientY - st.lastY;
      st.vRot = dx * 0.006;
      st.vTilt = dy * 0.006;
      st.rot += st.vRot;
      st.tilt = Math.max(-1.2, Math.min(1.2, st.tilt + st.vTilt));
      st.lastX = e.touches[0].clientX;
      st.lastY = e.touches[0].clientY;
    }
    function onTouchEnd() {
      stateRef.current.isDragging = false;
    }

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    canvas.style.cursor = "grab";

    // ── Draw loop ──
    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.37;
      const depth = 720;
      const st = stateRef.current;

      ctx.clearRect(0, 0, W, H);

      // Background radial
      const isLight = bgRef.current === "#fafafa";
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.85);
      bg.addColorStop(0, `rgba(${OR},${OG},${OB},0.06)`);
      bg.addColorStop(0.55, isLight ? "#f0f0f0" : "#0f0f0f");
      bg.addColorStop(1, bgRef.current);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Auto-rotate + inertia
      if (!st.isDragging) {
        st.rot += 0.0028;        // constant auto-spin
        st.vRot *= 0.92;         // friction
        st.vTilt *= 0.92;
        st.rot += st.vRot;
        st.tilt = Math.max(-1.2, Math.min(1.2, st.tilt + st.vTilt));
      }
      st.scan += 0.013;

      // ── Rings ──
      const rings = [
        { tilt: 0.28,  rF: 1.22, spd: 0.40, a: 0.28 },
        { tilt: -0.52, rF: 1.14, spd: -0.55, a: 0.20 },
        { tilt: 1.05,  rF: 1.30, spd: 0.18,  a: 0.16 },
      ];
      rings.forEach(ring => {
        const rRot = st.rot * ring.spd;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rRot);
        const rx = ring.rF * R;
        const ry = rx * Math.abs(Math.cos(ring.tilt));
        ctx.strokeStyle = `rgba(${OR},${OG},${OB},${ring.a})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, ring.tilt * 0.25, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        // node
        const na = rRot * 0.9 + st.rot;
        const nx = Math.cos(na) * rx;
        const ny = Math.sin(na) * ry * Math.sign(Math.cos(ring.tilt));
        ctx.fillStyle = `rgba(${OR},${OG},${OB},0.9)`;
        ctx.shadowColor = `rgba(${OR},${OG},${OB},0.8)`;
        ctx.shadowBlur = 9;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // ── Decay lit ──
      for (let i = 0; i < NUM_DOTS; i++) st.litDots[i] *= 0.92;

      // ── Compute dots ──
      type Dot = { sx: number; sy: number; sz: number; bf: number; lit: number };
      const dots: Dot[] = new Array(NUM_DOTS);
      for (let i = 0; i < NUM_DOTS; i++) {
        let [x, y, z] = GLOBE_DOTS[i];
        [x, y, z] = rotY(x, y, z, st.rot);
        [x, y, z] = rotX(x, y, z, st.tilt);
        // scan hit
        const da = Math.atan2(x, z);
        const sn = ((st.scan % TAU) + TAU) % TAU;
        const dn = ((da % TAU) + TAU) % TAU;
        let diff = Math.abs(dn - sn);
        if (diff > Math.PI) diff = TAU - diff;
        if (diff < 0.11) st.litDots[i] = Math.max(st.litDots[i], 1 - diff / 0.11);
        const p = project(x, y, z, depth, R);
        dots[i] = { sx: p.sx, sy: p.sy, sz: p.sz, bf: (z + 1) * 0.5, lit: st.litDots[i] };
      }
      dots.sort((a, b) => a.sz - b.sz);

      // ── Draw dots: white base, orange when lit ──
      for (const d of dots) {
        const lit = d.lit;
        // Size: slightly larger for visibility
        const sz = 0.7 + d.bf * 1.3 + (lit > 0.4 ? 0.9 : 0);

        const dotBase = isLight ? 0 : 255;
        if (lit > 0.05) {
          const rr = Math.round(dotBase + (OR - dotBase) * lit);
          const gg = Math.round(dotBase + (OG - dotBase) * lit);
          const bb = Math.round(dotBase + (OB - dotBase) * lit);
          const alpha = 0.30 + d.bf * 0.40 + lit * 0.55;
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${alpha.toFixed(2)})`;
          ctx.shadowColor = `rgba(${OR},${OG},${OB},0.9)`;
          ctx.shadowBlur = 4 + lit * 12;
        } else {
          const alpha = (isLight ? 0.22 : 0.07) + d.bf * (isLight ? 0.55 : 0.38);
          ctx.fillStyle = `rgba(${dotBase},${dotBase},${dotBase},${alpha.toFixed(2)})`;
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(cx + d.sx, cy + d.sy, Math.max(0.5, sz), 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ── Scan beam glow ──
      const bx = Math.cos(st.scan) * R * 0.96;
      const beam = ctx.createLinearGradient(cx + bx - 4, cy - R, cx + bx - 4, cy + R);
      beam.addColorStop(0, "transparent");
      beam.addColorStop(0.25, `rgba(${OR},${OG},${OB},0.07)`);
      beam.addColorStop(0.5,  `rgba(${OR},${OG},${OB},0.20)`);
      beam.addColorStop(0.75, `rgba(${OR},${OG},${OB},0.07)`);
      beam.addColorStop(1, "transparent");
      ctx.fillStyle = beam;
      ctx.fillRect(cx + bx - 6, cy - R * 1.05, 12, R * 2.1);

      // ── Particles (orange glowing dots) ──
      for (const p of st.particles) {
        p.theta += p.vTheta; p.phi += p.vPhi; p.r += p.vR;
        if (p.r > 1.65) p.vR = -Math.abs(p.vR);
        if (p.r < 1.1)  p.vR =  Math.abs(p.vR);
        const sp = Math.sin(p.phi);
        let px = sp * Math.cos(p.theta) * p.r;
        let py = Math.cos(p.phi) * p.r;
        let pz = sp * Math.sin(p.theta) * p.r;
        [px, py, pz] = rotY(px, py, pz, st.rot * 0.25);
        [px, py, pz] = rotX(px, py, pz, st.tilt);
        const pp = project(px, py, pz, depth, R);
        const depA = (pz + 1.65) / 2.65;
        ctx.fillStyle = `rgba(${OR},${OG},${OB},${(p.alpha * depA * 0.75).toFixed(2)})`;
        ctx.shadowColor = `rgba(${OR},${OG},${OB},0.6)`;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(cx + pp.sx, cy + pp.sy, p.size * 0.65, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ── Outer halo ──
      const halo = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.55);
      halo.addColorStop(0, `rgba(${OR},${OG},${OB},0.00)`);
      halo.addColorStop(0.5, `rgba(${OR},${OG},${OB},0.05)`);
      halo.addColorStop(1, `rgba(${OR},${OG},${OB},0.00)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.55, 0, TAU);
      ctx.fill();

      // ── Drag hint: cursor ring when dragging ──
      if (st.isDragging) {
        ctx.strokeStyle = `rgba(${OR},${OG},${OB},0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 8, 0, TAU);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ touchAction: "none", userSelect: "none" }} />;
}

// ── Section ───────────────────────────────────────────────────────────────────

interface Metrics { latency: number; collected: number; stores: number; scanPct: number }

export default function GlobeSection() {
  const C = useTheme();
  const [metrics, setMetrics] = useState<Metrics>({
    latency: 118, collected: 3_241, stores: 23, scanPct: 42,
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setMetrics(prev => ({
        latency: 72 + Math.floor(Math.random() * 110),
        collected: prev.collected + Math.floor(Math.random() * 14 + 2),
        stores: 23,
        scanPct: (prev.scanPct + (Math.random() > 0.55 ? 1 : 0)) % 100,
      }));
    }, 800);
    return () => clearInterval(iv);
  }, []);

  const features = [
    "Consulta simultânea em dezenas de fornecedores",
    "Login automático — sem abrir nenhum site manualmente",
    "Dados atualizados a cada 2 horas no catálogo",
    "Menor preço identificado automaticamente",
  ];

  const stats = [
    { label: "LATÊNCIA MÉDIA",    value: `${metrics.latency}ms`,                    warn: metrics.latency > 180 },
    { label: "PREÇOS COLETADOS",  value: metrics.collected.toLocaleString("pt-BR"), warn: false },
    { label: "LOJAS MONITORADAS", value: `${metrics.stores}`,                       warn: false },
    { label: "SCAN ATIVO",        value: `${metrics.scanPct}%`,                     warn: false },
  ];

  return (
    <section style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* ── Left ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <p className="font-mono text-xs flex items-center gap-2" style={{ color: C.muted }}>
              <span>//</span><span className="uppercase tracking-widest">Motor de scraping</span>
            </p>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ letterSpacing: "-0.025em", color: C.text }}>
                Seus fornecedores,<br />
                <span style={{ color: C.orLt }}>varridos em segundos.</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: C.muted, maxWidth: 380 }}>
                O motor de scraping do ConstruPrice acessa cada fornecedor em paralelo,
                coleta preços em tempo real e entrega o resultado sem esforço manual.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {features.map((f, i) => (
                <motion.div key={f}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-2.5">
                  <CheckCircle size={14} style={{ color: C.grn, flexShrink: 0, marginTop: 1 }} />
                  <span className="text-sm" style={{ color: C.muted }}>{f}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {stats.map(s => (
                <div key={s.label} className="rounded-lg p-4"
                  style={{ background: C.s1, border: `1px solid ${C.borderHi}` }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>
                    {s.label}
                  </p>
                  <motion.p key={s.value}
                    initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                    className="font-bold tabular-nums text-xl"
                    style={{ color: s.warn ? "#fbbf24" : C.orLt, letterSpacing: "-0.02em" }}>
                    {s.value}
                  </motion.p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs" style={{ color: C.muted }}>
                <span>// varredura global</span>
                <motion.span key={metrics.scanPct} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
                  style={{ color: C.orLt }}>{metrics.scanPct}%</motion.span>
              </div>
              <div className="h-px rounded-full overflow-hidden" style={{ background: C.borderHi }}>
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${metrics.scanPct}%` }} transition={{ duration: 0.6 }}
                  style={{ background: C.or, boxShadow: `0 0 8px ${C.or}80` }} />
              </div>
            </div>
          </motion.div>

          {/* ── Right: globe ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-2xl"
              style={{
                height: 460,
                background: C.bg,
                border: `1px solid ${C.borderHi}`,
                boxShadow: `0 0 80px ${C.or}10`,
              }}>
              <GlobeCanvas metricsLatency={metrics.latency} />

              {/* Drag hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>
                  arraste para girar
                </p>
              </div>

              {/* Top-left */}
              <div className="absolute top-4 left-4 space-y-0.5 pointer-events-none">
                <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>
                  ConstruPrice · Scraper
                </p>
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full" style={{ background: C.or }} />
                  <span className="font-mono text-xs font-medium" style={{ color: C.orLt }}>Scraping ativo</span>
                </div>
              </div>

              {/* Top-right */}
              <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute top-4 right-4 text-right pointer-events-none">
                <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>Latência</p>
                <p className="font-mono text-sm font-bold tabular-nums" style={{ color: C.orLt }}>
                  {metrics.latency}ms
                </p>
              </motion.div>

              {/* Store labels */}
              {["Leroy Merlin", "C&C", "Telhanorte", "Quero Quero"].map((store, i) => (
                <motion.div key={store}
                  className="absolute font-mono pointer-events-none"
                  style={{
                    fontSize: 10, color: C.muted,
                    top: `${22 + i * 17}%`,
                    ...(i % 2 === 0 ? { right: 12 } : { left: 12 }),
                  }}
                  animate={{ opacity: [0.15, 0.55, 0.15] }}
                  transition={{ duration: 2 + i * 0.6, repeat: Infinity, delay: i * 0.8 }}>
                  {store}
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
