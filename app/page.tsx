"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  motion, AnimatePresence, useInView,
  useMotionValue, useTransform, useSpring, animate,
  type PanInfo,
} from "framer-motion";
import {
  ArrowRight, CheckCircle, ChevronDown,
  Menu, X, TrendingDown, Moon, Sun, ChevronLeft, Zap,
} from "lucide-react";
import { DARK, LIGHT } from "../lib/colors";
import { ThemeContext, useTheme } from "../lib/ThemeContext";
import {
  stagger, item, slideLeft,
  menuVariant, faqVariant,
  breatheAnimate, blobAnimate, blobAnimate2,
} from "../lib/animations";
import GlobeSection        from "../components/GlobeSection";
import ParallelRaceSection  from "../components/ParallelRace";
import LiveFeedSection      from "../components/LiveFeed";
import PriceHeatmapSection  from "../components/PriceHeatmap";

// ── Scroll reveal ─────────────────────────────────────────────
function Reveal({
  children, delay = 0, className, style,
}: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-72px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── Counter ───────────────────────────────────────────────────
function AnimatedCounter({
  target, suffix = "", decimals = 0, prefix = "",
}: {
  target: number; suffix?: string; decimals?: number; prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    prefix +
    (decimals > 0
      ? v.toFixed(decimals).replace(".", ",")
      : Math.round(v).toString()) +
    suffix
  );
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(count, target, { duration: 1.4, ease: "easeOut" });
    return () => ctrl.stop();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps
  return <motion.span ref={ref}>{display}</motion.span>;
}

// ── Chip ──────────────────────────────────────────────────────
type BadgeType = "or" | "grn" | "dim";
function Chip({ label, type = "dim" }: { label: string; type?: BadgeType }) {
  const C = useTheme();
  const map: Record<BadgeType, { bg: string; border: string; color: string }> = {
    or:  { bg: C.orDim,     border: `${C.or}28`,  color: C.orLt },
    grn: { bg: C.grnDim,    border: `${C.grn}28`, color: C.grn  },
    dim: { bg: "#ffffff08", border: C.borderHi,   color: C.muted },
  };
  const s = map[type];
  return (
    <span className="inline-block font-mono text-xs px-2 py-0.5 rounded-sm"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, letterSpacing: "0.02em" }}>
      {label}
    </span>
  );
}

// ── SectionTag ────────────────────────────────────────────────
function SectionTag({ children }: { children: React.ReactNode }) {
  const C = useTheme();
  return (
    <p className="font-mono text-xs mb-3 flex items-center gap-2" style={{ color: C.muted }}>
      <span>//</span>
      <span className="uppercase tracking-widest">{children}</span>
    </p>
  );
}

// ── BrowserFrame ──────────────────────────────────────────────
function BrowserFrame({
  src, alt, url, light, className, glow = false,
}: {
  src: string; alt: string; url?: string; light?: boolean; className?: string; glow?: boolean;
}) {
  const C = useTheme();
  return (
    <div className={`rounded-2xl overflow-hidden w-full ${className ?? ""}`}
      style={{
        border: `1px solid ${light ? "#d4d4d4" : C.borderHi}`,
        boxShadow: light
          ? "0 48px 120px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)"
          : glow
          ? `0 48px 140px rgba(0,0,0,0.85), 0 0 80px ${C.or}14, 0 4px 20px rgba(0,0,0,0.5)`
          : "0 48px 120px rgba(0,0,0,0.80), 0 4px 20px rgba(0,0,0,0.4)",
      }}>
      <div className="flex items-center gap-3 px-4 py-2.5"
        style={{ background: light ? "#efefef" : C.s2, borderBottom: `1px solid ${light ? "#d4d4d4" : C.border}` }}>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="flex-1 px-3 py-1 rounded-md" style={{ background: light ? "#e0e0e0" : C.s3 }}>
          <span className="font-mono text-xs" style={{ color: light ? "#999" : C.faint }}>
            {url ?? "app.construprice.com.br"}
          </span>
        </div>
      </div>
      <img src={src} alt={alt} className="w-full block"
        style={{ aspectRatio: "16/9", objectFit: "cover", objectPosition: "top" }} />
    </div>
  );
}

// ── TiltCard ──────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 160, damping: 20 });
  const sy = useSpring(my, { stiffness: 160, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width  / 2) / r.width);
    my.set((e.clientY - r.top  - r.height / 2) / r.height);
  }
  function onLeave() { mx.set(0); my.set(0); }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative ${className ?? ""}`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

// ── FloatingBadge ─────────────────────────────────────────────
function FloatingBadge({
  children, style, delay = 0.55,
}: {
  children: React.ReactNode; style?: React.CSSProperties; delay?: number;
}) {
  const C = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.88 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute z-10 pointer-events-none"
      style={{ ...style, transform: `${style?.transform ?? ""} translateZ(28px)` }}
    >
      <div className="px-3.5 py-2.5 rounded-xl"
        style={{
          background: "rgba(8,8,8,0.88)",
          border: `1px solid ${C.borderHi}`,
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.04)",
        }}>
        {children}
      </div>
    </motion.div>
  );
}

// ── Carousel ──────────────────────────────────────────────────
const SLIDES = [
  { dark: "/app.png",       light: "/appwhite.png",      step: "01", title: "Descreva o que precisa",       desc: "Digite qualquer material em linguagem normal. O Agente IA identifica os itens, entende abreviações e monta a cotação automaticamente." },
  { dark: "/chat1.png",     light: "/chat1white.png",     step: "02", title: "IA refina a busca",            desc: "Quando falta informação, o agente pergunta marca e especificação. Você responde como se fosse uma conversa — sem formulário." },
  { dark: "/chat2.png",     light: "/chat2.png",          step: "03", title: "Escolha os fornecedores",      desc: "Selecione quais fornecedores consultar. O sistema acessa cada um com login salvo, em paralelo, sem você precisar entrar em cada site." },
  { dark: "/result1.png",   light: "/result1white.png",   step: "04", title: "Compare todos os preços",      desc: "Todos os resultados em uma tela só. Menor preço destacado. Compre direto pelo link — sem sair da plataforma." },
  { dark: "/catalogo1.png", light: "/catalogowhite1.png", step: "05", title: "Catálogo sempre atualizado",   desc: "Catálogo completo com preços atualizados de cada fornecedor a cada 2 horas. Filtre, compare e exporte." },
];

function AppCarousel({ white }: { white: boolean }) {
  const C = useTheme();
  const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [autoplay.current]
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const slide = SLIDES[idx];

  return (
    <div id="como-funciona">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded-sm"
              style={{ background: C.orDim, border: `1px solid ${C.or}28`, color: C.orLt }}>
              {slide.step} / 0{SLIDES.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={idx}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: C.text, letterSpacing: "-0.02em" }}>
                {slide.title}
              </h3>
              <p className="text-sm mt-1.5 max-w-lg" style={{ color: C.muted }}>{slide.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex gap-2 shrink-0 mt-1">
          {[{ fn: prev, flip: false }, { fn: next, flip: true }].map(({ fn, flip }) => (
            <motion.button key={String(flip)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={fn} className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ border: `1px solid ${C.borderHi}`, color: C.muted, background: C.s1 }}>
              <ChevronLeft size={16} style={flip ? { transform: "rotate(180deg)" } : undefined} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Peek: overflow visible mas clip no pai */}
      <div style={{ overflow: "hidden", margin: "0 -24px", padding: "0 24px" }}>
        <div ref={emblaRef} style={{ overflow: "visible", cursor: "grab" }}>
          <div style={{ display: "flex", gap: 20 }}>
            {SLIDES.map((s, i) => (
              <div
                key={i}
                onClick={() => goTo(i)}
                style={{
                  flex: "0 0 92%",
                  minWidth: 0,
                  transition: "opacity 0.35s, transform 0.35s",
                  opacity: i === idx ? 1 : 0.28,
                  transform: i === idx ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
                  cursor: i === idx ? "grab" : "pointer",
                }}
              >
                <BrowserFrame
                  src={white ? s.light : s.dark}
                  alt={s.title}
                  light={white && s.light !== s.dark}
                  glow={i === idx && !white}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center mt-6">
        {SLIDES.map((_, i) => (
          <motion.button key={i} onClick={() => goTo(i)}
            animate={{ width: i === idx ? 20 : 6, background: i === idx ? C.or : C.faint }}
            transition={{ duration: 0.3 }}
            style={{ height: 6, borderRadius: 99, flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}

// ── Search skeleton ───────────────────────────────────────────
function SearchSkeleton() {
  const C = useTheme();
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const QUERY = "cimento cp2 50kg";
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 0) {
      if (typed < QUERY.length) t = setTimeout(() => setTyped(n => n + 1), 70);
      else t = setTimeout(() => setPhase(1), 500);
    } else if (phase === 1) {
      t = setTimeout(() => setPhase(2), 2000);
    } else {
      t = setTimeout(() => { setPhase(0); setTyped(0); }, 3500);
    }
    return () => clearTimeout(t);
  }, [phase, typed]);

  const providers = [
    { name: "Casa & Obra",     price: "R$ 35,50", best: true  },
    { name: "MateriaisOnline", price: "R$ 37,20", best: false },
    { name: "Depósito Norte",  price: "R$ 38,90", best: false },
    { name: "BRMateriais",     price: "R$ 39,40", best: false },
    { name: "ObraFácil",       price: "R$ 40,10", best: false },
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: C.s1, border: `1px solid ${C.borderHi}` }}>
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{ background: C.s2, borderBottom: `1px solid ${C.border}` }}>
        <span className="w-1.5 h-1.5 rounded-full"
          style={{ background: phase === 2 ? C.grn : C.or, animation: phase === 1 ? "pulse 1s ease-in-out infinite" : "none" }} />
        <span className="font-mono text-xs" style={{ color: C.muted }}>
          {phase === 0 ? "aguardando busca..." : phase === 1 ? "buscando em 5 fornecedores..." : "5 resultados · menor preço encontrado"}
        </span>
      </div>
      <div className="px-4 pt-4 pb-3">
        <div className="px-3 py-2 rounded-lg"
          style={{ background: C.s2, border: `1px solid ${phase === 1 ? C.or + "50" : C.borderHi}` }}>
          <span className="font-mono text-xs" style={{ color: C.text, display: "block", minHeight: "1rem" }}>
            {QUERY.slice(0, typed)}
            {phase === 0 && <span className="animate-blink" style={{ color: C.or }}>|</span>}
          </span>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-1.5" style={{ minHeight: 192 }}>
        {phase === 0 && (
          <div className="flex items-center justify-center h-36">
            <span className="font-mono text-xs" style={{ color: C.faint }}>// aguardando...</span>
          </div>
        )}
        {phase === 1 && providers.map((_, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: C.s2 }}>
            <div className="rounded animate-pulse" style={{ height: 10, width: `${52 + i * 14}px`, background: C.faint }} />
            <div className="rounded animate-pulse" style={{ height: 10, width: 44, background: C.faint }} />
          </div>
        ))}
        {phase === 2 && providers.map((r, i) => (
          <motion.div key={r.name}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{ background: r.best ? C.grnDim : C.s2, border: `1px solid ${r.best ? C.grn + "28" : "transparent"}` }}>
            <span className="font-mono text-xs" style={{ color: r.best ? C.grn : C.muted }}>{r.name}</span>
            <span className="font-mono text-xs font-bold" style={{ color: r.best ? C.grn : C.muted }}>{r.price}</span>
          </motion.div>
        ))}
      </div>
      {phase === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="px-4 py-2.5 flex items-center gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <CheckCircle size={12} style={{ color: C.grn }} />
          <span className="font-mono text-xs" style={{ color: C.grn }}>economia de R$ 4,60 vs. maior preço</span>
        </motion.div>
      )}
    </div>
  );
}

// ── ROI Calculator ────────────────────────────────────────────
function ROICalculator() {
  const C = useTheme();
  const [spend, setSpend] = useState(50000);
  const savings  = Math.round(spend * 0.062);
  const yearly   = savings * 12;
  const daily    = Math.round(savings / 30);
  const roi      = savings / 247;
  const payback  = Math.max(1, Math.round(247 / (savings / 30)));
  const pct      = ((spend - 10000) / (500000 - 10000)) * 100;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.borderHi}` }}>

      {/* Top bar */}
      <div className="px-8 py-3.5 flex items-center gap-3"
        style={{ background: C.s2, borderBottom: `1px solid ${C.border}` }}>
        <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.or }} />
        <span className="font-mono text-xs" style={{ color: C.muted }}>calculadora de retorno</span>
        <span className="ml-auto font-mono text-[10px]" style={{ color: C.muted }}>
          base: 6,2% de redução documentada
        </span>
      </div>

      {/* Slider — full width */}
      <div className="px-8 py-8" style={{ background: C.s1, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>
              Gasto mensal em materiais
            </p>
            <div className="flex items-end gap-2">
              <motion.span key={spend} initial={{ opacity: 0.3, y: -6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12 }}
                className="font-bold tabular-nums" style={{ fontSize: "2.6rem", lineHeight: 1, letterSpacing: "-0.045em", color: C.text }}>
                R$ {spend >= 1000 ? `${(spend / 1000).toFixed(0)}k` : spend.toLocaleString("pt-BR")}
              </motion.span>
              <span className="font-mono text-sm mb-1" style={{ color: C.muted }}>/mês</span>
            </div>
          </div>
          {/* Quick picks */}
          <div className="hidden sm:flex gap-1.5">
            {[20000, 50000, 100000, 250000].map(v => (
              <button key={v} onClick={() => setSpend(v)}
                className="font-mono text-[10px] px-2.5 py-1 rounded-md transition-colors"
                style={{
                  background: spend === v ? C.s3 : "transparent",
                  border: `1px solid ${spend === v ? C.borderHi : "transparent"}`,
                  color: spend === v ? C.muted : C.faint,
                }}>
                {v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>
        </div>
        {/* Track */}
        <div className="relative">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.s3 }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
              transition={{ duration: 0.08 }}
              style={{ background: `linear-gradient(90deg, ${C.or}, ${C.orLt})` }} />
          </div>
          <input type="range" min={10000} max={500000} step={5000}
            value={spend} onChange={e => setSpend(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "100%" }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[10px]" style={{ color: C.muted }}>R$ 10k</span>
          <span className="font-mono text-[10px]" style={{ color: C.muted }}>R$ 500k</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid md:grid-cols-[1.35fr_1fr]">

        {/* Left — savings breakdown */}
        <div className="p-8" style={{ borderRight: `1px solid ${C.border}` }}>
          <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: C.muted }}>
            Sua economia com ConstruPrice
          </p>

          {/* Primary — monthly */}
          <div className="mb-6">
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: C.muted }}>por mês</p>
            <motion.p key={savings} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              className="font-bold tabular-nums"
              style={{ fontSize: "3.6rem", lineHeight: 1, letterSpacing: "-0.045em", color: C.grn }}>
              R$ {savings.toLocaleString("pt-BR")}
            </motion.p>
          </div>

          {/* Secondary row */}
          <div className="grid grid-cols-3 gap-2.5 mb-7">
            {[
              { label: "/ dia",   value: `R$ ${daily.toLocaleString("pt-BR")}`, color: C.orLt },
              { label: "/ ano",   value: `R$ ${Math.round(yearly / 1000)}k`,    color: C.orLt },
              { label: "payback", value: `${payback}d`,                           color: C.text },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: C.s2, border: `1px solid ${C.borderHi}` }}>
                <p className="font-mono text-[9px] uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>
                  {label}
                </p>
                <motion.p key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className="font-bold tabular-nums text-sm" style={{ color, letterSpacing: "-0.02em" }}>
                  {value}
                </motion.p>
              </div>
            ))}
          </div>

          {/* Distribution bar */}
          <div className="mb-7">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>
                Distribuição do gasto
              </span>
              <span className="font-mono text-[9px]" style={{ color: C.grn }}>
                6,2% economizados
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: C.s3 }}>
              <motion.div
                animate={{ width: `${(savings / spend) * 100}%` }}
                transition={{ duration: 0.25 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${C.or}, ${C.grn})` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="font-mono text-[9px]" style={{ color: C.muted }}>custo mantido (93,8%)</span>
              <span className="font-mono text-[9px]" style={{ color: C.grn }}>
                R$ {savings.toLocaleString("pt-BR")} poupados
              </span>
            </div>
          </div>

          <motion.a href="http://wa.me/5511945319510" target="_blank" rel="noopener noreferrer" whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold"
            style={{ background: C.or, color: "#fff", boxShadow: `0 4px 20px ${C.or}35` }}>
            Começar grátis agora <ArrowRight size={13} />
          </motion.a>
        </div>

        {/* Right — ROI callout */}
        <div className="p-8 flex flex-col gap-6" style={{ background: C.s1 }}>

          {/* ROI multiplier */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>
              ROI sobre o plano Pro
            </p>
            <div className="flex items-end gap-1.5 mb-1">
              <motion.span key={Math.round(roi)} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="font-bold tabular-nums"
                style={{ fontSize: "4.8rem", lineHeight: 1, letterSpacing: "-0.05em", color: C.orLt }}>
                {roi.toFixed(0)}×
              </motion.span>
            </div>
            <p className="font-mono text-[10px]" style={{ color: C.muted }}>
              para cada R$ 1 investido
            </p>
          </div>

          {/* Cost vs savings rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl"
              style={{ background: C.s2, border: `1px solid ${C.borderHi}` }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>
                Custo Pro
              </span>
              <span className="font-mono text-sm font-bold" style={{ color: C.muted }}>R$ 247/mês</span>
            </div>
            <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl"
              style={{ background: `${C.grn}0d`, border: `1px solid ${C.grn}22` }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.grn }}>
                Economia
              </span>
              <motion.span key={savings} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
                className="font-mono text-sm font-bold" style={{ color: C.grn }}>
                R$ {savings.toLocaleString("pt-BR")}/mês
              </motion.span>
            </div>
          </div>

          {/* Spacer + trust note */}
          <div className="mt-auto p-4 rounded-xl"
            style={{ background: `${C.or}0a`, border: `1px solid ${C.or}20` }}>
            <p className="font-mono text-[10px] leading-relaxed" style={{ color: C.muted }}>
              O plano se paga em{" "}
              <motion.span key={payback} initial={{ color: C.muted }} animate={{ color: C.orLt }}
                transition={{ duration: 0.3 }}
                style={{ fontWeight: 700 }}>
                {payback} {payback === 1 ? "dia" : "dias"}
              </motion.span>{" "}
              — e você lucra o resto do mês.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar({ white, onToggle }: { white: boolean; onToggle: () => void }) {
  const C = useTheme();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? `${C.bg}f2` : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
      }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between" style={{ height: 60 }}>
        <motion.a href="#" className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.or }}>
            <TrendingDown size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm" style={{ color: C.text }}>ConstruPrice</span>
        </motion.a>

        <div className="hidden md:flex items-center gap-7">
          {[["Produto", "#produto"], ["Como funciona", "#como-funciona"], ["Planos", "#planos"], ["ROI", "#roi"]].map(([l, h]) => (
            <a key={l} href={h} className="text-sm transition-colors" style={{ color: C.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>{l}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <motion.button onClick={onToggle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs"
            style={{ border: `1px solid ${C.borderHi}`, color: C.muted, background: C.s1 }}>
            <AnimatePresence mode="wait">
              <motion.span key={white ? "moon" : "sun"}
                initial={{ rotate: -80, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1   }}
                exit={{    rotate:  80, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }} style={{ display: "flex" }}>
                {white ? <Moon size={12} /> : <Sun size={12} />}
              </motion.span>
            </AnimatePresence>
            {white ? "Escuro" : "Claro"}
          </motion.button>
          <a href="#" className="text-sm" style={{ color: C.muted }}>Entrar</a>
          <motion.a href="http://wa.me/5511945319510" target="_blank" rel="noopener noreferrer" whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.96 }}
            className="text-sm px-4 py-1.5 rounded-lg font-medium"
            style={{ background: C.or, color: "#fff" }}>
            Começar grátis
          </motion.a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} style={{ color: C.muted }}>
          <AnimatePresence mode="wait">
            <motion.span key={open ? "x" : "menu"}
              initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }}
              transition={{ duration: 0.14 }} style={{ display: "flex" }}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div variants={menuVariant} initial="hidden" animate="visible" exit="exit"
            className="md:hidden px-6 pb-5 space-y-3 overflow-hidden"
            style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
            {["Produto", "Como funciona", "Planos", "ROI"].map(l => (
              <a key={l} href="#" className="block py-2 text-sm" style={{ color: C.muted }}
                onClick={() => setOpen(false)}>{l}</a>
            ))}
            <a href="http://wa.me/5511945319510" target="_blank" rel="noopener noreferrer" className="block text-center py-2.5 rounded-lg text-sm font-medium"
              style={{ background: C.or, color: "#fff" }}>Começar grátis</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const C = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <motion.button className="w-full flex items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)} whileHover={{ x: 2 }} transition={{ duration: 0.12 }}>
        <span className="text-sm font-medium pr-8" style={{ color: C.text }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}
          style={{ color: C.muted, flexShrink: 0, display: "flex" }}>
          <ChevronDown size={15} />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div variants={faqVariant} initial="hidden" animate="visible" exit="exit" style={{ overflow: "hidden" }}>
            <p className="pb-5 text-sm leading-relaxed" style={{ color: C.muted }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Feature list ──────────────────────────────────────────────
function FeatureList({ items }: { items: string[] }) {
  const C = useTheme();
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((f, i) => (
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
  );
}

// ── Hero: ambient background ─────────────────────────────────
function HeroGrid() {
  const C = useTheme();
  return (
    <>
      {/* Soft centered glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse 70% 60% at 65% 45%, ${C.or}0d 0%, transparent 70%)`,
      }} />
      {/* Subtle dot grid — static, no animation */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `radial-gradient(${C.faint} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 65% 45%, black 20%, transparent 80%)",
        maskImage: "radial-gradient(ellipse 80% 80% at 65% 45%, black 20%, transparent 80%)",
        opacity: 0.6,
      }} />
    </>
  );
}

// ── Hero: Flow Skeleton Animation ────────────────────────────
function SkLine({ w, h = 8, dim = false }: { w: string | number; h?: number; dim?: boolean }) {
  const C = useTheme();
  return (
    <div style={{ width: w, height: h, borderRadius: 3, flexShrink: 0, background: dim ? C.border : C.faint }} />
  );
}

const FLOW_STEPS = ["Pesquisa", "Fornecedores", "Produtos", "Catálogo", "Compra"] as const;
const HERO_QUERY = "cimento cp2 50kg";

function FlowPhaseSearch({ typed }: { typed: number }) {
  const C = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        Nova cotação
      </span>
      <div style={{ background: C.s2, border: `1px solid ${C.borderHi}`, borderRadius: 8, padding: "9px 12px" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: C.text }}>
          {HERO_QUERY.slice(0, typed)}
          <span style={{ borderRight: `1.5px solid ${C.muted}`, marginLeft: 1 }}>&nbsp;</span>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", border: `1px solid ${C.faint}`, flexShrink: 0 }} />
          <SkLine w="48%" dim />
        </div>
        {typed > 7 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", border: `1px solid ${C.faint}`, flexShrink: 0 }} />
            <SkLine w="62%" dim />
          </motion.div>
        )}
        {typed > 13 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.muted, flexShrink: 0 }} />
            <span style={{ fontFamily: "monospace", fontSize: 10, color: C.muted }}>Agente IA identificou 1 item</span>
          </motion.div>
        )}
        {typed === HERO_QUERY.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.muted, flexShrink: 0 }} />
            <span style={{ fontFamily: "monospace", fontSize: 10, color: C.muted }}>Consultando 4 fornecedores...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FlowPhaseSuppliers() {
  const C = useTheme();
  const list = ["Casa & Obra", "MateriaisOnline", "Depósito Norte", "BRMateriais", "ObraFácil"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        Selecionar fornecedores
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {list.map((name, i) => (
          <motion.div key={name}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.09, duration: 0.28 }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 7, border: `1px solid ${C.borderHi}`, background: C.s2 }}>
            <motion.div
              initial={{ background: "transparent" }}
              animate={{ background: i < 4 ? C.faint : "transparent" }}
              transition={{ delay: i * 0.09 + 0.45, duration: 0.2 }}
              style={{ width: 12, height: 12, borderRadius: 3, border: `1px solid ${C.faint}`, flexShrink: 0 }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 11, color: i < 4 ? C.muted : C.faint }}>{name}</span>
            <div style={{ marginLeft: "auto" }}><SkLine w={32} h={6} dim /></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FlowPhaseProducts() {
  const C = useTheme();
  const rows = [
    { name: "Casa & Obra",     pw: "20%" },
    { name: "MateriaisOnline", pw: "22%" },
    { name: "Depósito Norte",  pw: "21%" },
    { name: "BRMateriais",     pw: "19%" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
          Resultados — 4 fornecedores
        </span>
        <SkLine w={44} h={6} dim />
      </div>
      <div style={{ display: "flex", gap: 6, padding: "2px 10px" }}>
        {["Fornecedor", "Produto", "Preço", ""].map((label, i) => (
          <div key={i} style={{ flex: i === 1 ? 2 : 1 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((r, i) => (
          <motion.div key={r.name}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.28 }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 7, border: `1px solid ${i === 0 ? C.muted : C.borderHi}`, background: i === 0 ? C.s3 : C.s2 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: i === 0 ? C.text : C.muted, flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{r.name}</span>
            <div style={{ flex: 2 }}><SkLine w="75%" h={7} dim={i !== 0} /></div>
            <div style={{ flex: 1 }}><SkLine w={r.pw} h={7} dim={i !== 0} /></div>
            <div style={{ padding: "2px 7px", borderRadius: 4, border: `1px solid ${i === 0 ? C.muted : C.borderHi}`, fontFamily: "monospace", fontSize: 9, color: i === 0 ? C.text : C.faint }}>
              {i === 0 ? "melhor" : "ver"}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FlowPhaseCatalog() {
  const C = useTheme();
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ width: 76, flexShrink: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <SkLine w="90%" h={7} />
        {["Cimento", "Areia", "Tijolo", "Ferro", "Tinta"].map((cat, i) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 6px", borderRadius: 5, background: i === 0 ? C.s3 : "transparent", border: `1px solid ${i === 0 ? C.borderHi : "transparent"}` }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: i === 0 ? C.muted : C.faint, flexShrink: 0 }} />
            <span style={{ fontFamily: "monospace", fontSize: 9, color: i === 0 ? C.muted : C.faint }}>{cat}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07, duration: 0.24 }}
            style={{ border: `1px solid ${C.borderHi}`, borderRadius: 7, padding: 8, background: C.s2, display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ height: 28, background: C.faint, borderRadius: 4 }} />
            <SkLine w="80%" h={6} />
            <SkLine w="50%" h={6} dim />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FlowPhasePurchase() {
  const C = useTheme();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        Confirmação de compra
      </span>
      <div style={{ display: "flex", gap: 10, padding: 10, border: `1px solid ${C.borderHi}`, borderRadius: 8, background: C.s2 }}>
        <div style={{ width: 38, height: 38, background: C.faint, borderRadius: 6, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, justifyContent: "center" }}>
          <SkLine w="70%" h={7} />
          <SkLine w="44%" h={6} dim />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, justifyContent: "center" }}>
          <SkLine w={42} h={8} />
          <span style={{ fontFamily: "monospace", fontSize: 9, color: C.faint }}>× 50 un</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "6px 0", borderTop: `1px solid ${C.border}` }}>
        {["Subtotal", "Frete estimado", "Total"].map((label, i) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: i === 2 ? C.muted : C.faint }}>{label}</span>
            <SkLine w={i === 2 ? 54 : 38} h={i === 2 ? 8 : 6} dim={i !== 2} />
          </div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 8, border: `1px solid ${C.muted}`, background: C.s3, fontFamily: "monospace", fontSize: 11, color: C.text, letterSpacing: "0.04em" }}>
        Confirmar compra
        <span style={{ color: C.muted }}>→</span>
      </motion.div>
    </div>
  );
}

function AILiveTerminal() {
  const C = useTheme();
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (phase !== 0) return;
    if (typed < HERO_QUERY.length) {
      const t = setTimeout(() => setTyped(n => n + 1), 65);
      return () => clearTimeout(t);
    }
  }, [phase, typed]);

  useEffect(() => {
    const durations = [HERO_QUERY.length * 65 + 1300, 2400, 2600, 2600, 3200];
    const t = setTimeout(() => {
      setPhase(p => {
        const next = (p + 1) % FLOW_STEPS.length;
        if (next === 0) setTyped(0);
        return next;
      });
    }, durations[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div style={{
      background: C.s1, border: `1px solid ${C.borderHi}`, borderRadius: 18,
      overflow: "hidden", position: "relative",
      boxShadow: `0 0 0 1px ${C.borderHi}, 0 40px 100px rgba(0,0,0,0.7), 0 0 80px ${C.or}0a`,
    }}>
      {/* Top glow */}
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 1, zIndex: 5, pointerEvents: "none",
        background: `linear-gradient(90deg,transparent,${C.or}55,transparent)`,
      }} />

      {/* Browser chrome */}
      <div style={{ background: C.s2, borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block" }} />
          ))}
        </div>
        <div style={{ flex: 1, background: C.s3, borderRadius: 6, padding: "4px 10px" }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: C.faint }}>app.construprice.com.br</span>
        </div>
      </div>

      {/* Flow step indicator */}
      <div style={{ padding: "14px 16px 8px", display: "flex", alignItems: "center" }}>
        {FLOW_STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `1px solid ${i <= phase ? C.muted : C.border}`,
                background: i === phase ? C.s3 : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.4s",
              }}>
                <span style={{ fontFamily: "monospace", fontSize: 8, color: i <= phase ? C.text : C.faint }}>{i + 1}</span>
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 8, color: i <= phase ? C.muted : C.faint, whiteSpace: "nowrap", transition: "color 0.4s" }}>
                {label}
              </span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1, marginBottom: 14,
                background: i < phase ? C.muted : C.border,
                transition: "background 0.5s",
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Phase content */}
      <div style={{ padding: "6px 16px 18px", minHeight: 248 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {phase === 0 && <FlowPhaseSearch typed={typed} />}
            {phase === 1 && <FlowPhaseSuppliers />}
            {phase === 2 && <FlowPhaseProducts />}
            {phase === 3 && <FlowPhaseCatalog />}
            {phase === 4 && <FlowPhasePurchase />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const [white, setWhite] = useState(false);
  const C = white ? LIGHT : DARK;

  return (
    <ThemeContext.Provider value={C}>
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif",
      transition: "background 0.3s, color 0.3s" }}>
      <Navbar white={white} onToggle={() => setWhite(w => !w)} />

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="min-h-screen flex items-center relative overflow-hidden" style={{ paddingTop: 60 }}>
        <HeroGrid />

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-[1fr_1.15fr] gap-16 items-center"
          style={{ position: "relative", zIndex: 1, paddingTop: "5rem", paddingBottom: "5rem" }}>

          {/* ── LEFT ── */}
          <motion.div variants={stagger} initial="hidden" animate="visible">

            {/* Badge */}
            <motion.div variants={item} className="mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ background: C.s2, border: `1px solid ${C.borderHi}` }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.or, flexShrink: 0 }} />
                <span className="font-mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.05em" }}>
                  Agente IA · tempo real
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item}
              className="font-bold mb-4"
              style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.6rem)", lineHeight: 1.12, letterSpacing: "-0.035em" }}>
              Suas cotações,<br />
              <span style={{ color: C.orLt }}>sem ligações nem prints.</span>
            </motion.h1>

            <motion.p variants={item} className="mb-7"
              style={{ color: C.muted, fontSize: "0.875rem", lineHeight: 1.6, maxWidth: 300 }}>
              O agente busca em todos os seus fornecedores ao mesmo tempo e entrega o menor preço.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-2.5 mb-8">
              <motion.a href="http://wa.me/5511945319510" target="_blank" rel="noopener noreferrer"
                whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
                style={{ background: C.or, color: "#fff" }}>
                Começar grátis <ArrowRight size={13} />
              </motion.a>
              <motion.a href="#roi"
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
                style={{ border: `1px solid ${C.borderHi}`, color: C.muted }}>
                Ver quanto economizo
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="flex gap-6 pt-5"
              style={{ borderTop: `1px solid ${C.border}` }}>
              {[
                { value: <AnimatedCounter target={6.2} decimals={1} suffix="%" />, label: "custo de materiais" },
                { value: <AnimatedCounter target={8} suffix="h" />, label: "economizadas/mês" },
                { value: "< 3s", label: "por cotação", accent: true },
              ].map(({ value, label, accent }, i) => (
                <div key={i}>
                  <p className="font-bold mb-0.5" style={{ color: accent ? C.orLt : C.text, fontSize: "1.25rem", letterSpacing: "-0.03em" }}>
                    {value}
                  </p>
                  <p style={{ color: C.faint, fontSize: "0.7rem" }}>{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Terminal ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            {/* Soft halo */}
            <div style={{
              position: "absolute", inset: -48, borderRadius: 48,
              background: `radial-gradient(ellipse at 50% 40%, ${C.or}0e 0%, transparent 60%)`,
              pointerEvents: "none",
            }} />
            <AILiveTerminal />
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
          background: `linear-gradient(to bottom, transparent, ${C.bg})`,
          pointerEvents: "none", zIndex: 2,
        }} />
      </section>

      {/* ── GLOBE SECTION ────────────────────────────────────── */}
      <GlobeSection />

      {/* ── PARALLEL RACE ────────────────────────────────────── */}
      <ParallelRaceSection />

      {/* ── PRICE HEATMAP ────────────────────────────────────── */}
      <PriceHeatmapSection />

      {/* ── SOCIAL PROOF ─────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-xs font-mono uppercase tracking-widest text-center mb-7" style={{ color: C.faint }}>
            Construtoras e empreiteiras que economizam com ConstruPrice
          </p>
          <div className="overflow-hidden">
            <div className="flex gap-14 animate-marquee" style={{ width: "max-content" }}>
              {[...Array(2)].flatMap(() =>
                ["Construtora Alpha", "Empreiteira Beta", "Grupo Delta Obras", "SupriMax", "MDE Engenharia", "Obras & Cia", "Construções Silva", "Engenharia Nunes"].map(n => (
                  <span key={Math.random()} className="text-sm font-medium whitespace-nowrap" style={{ color: C.faint }}>{n}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CAROUSEL "COMO FUNCIONA" ──────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Reveal>
            <SectionTag>Como funciona</SectionTag>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ letterSpacing: "-0.025em" }}>
              Veja o ConstruPrice em ação.
            </h2>
            <p className="text-sm mb-12" style={{ color: C.muted }}>
              Do pedido ao menor preço — tudo em menos de 3 segundos.
            </p>
          </Reveal>
          <Reveal delay={0.1}><AppCarousel white={white} /></Reveal>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      {/* overflow:hidden clips the image bleed at the section edge */}
      <section id="produto" className="overflow-hidden" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-28">

          {/* 01 — text left · image bleeds RIGHT */}
          <div className="flex flex-col md:flex-row gap-16 items-center mb-32 pb-32"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <Reveal className="md:w-[38%] shrink-0">
              <p className="font-mono text-xs mb-3 flex items-center gap-3" style={{ color: C.muted }}>
                <span>01 / 04</span><span className="w-10 h-px inline-block" style={{ background: C.faint }} /><span>Agente IA</span>
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight" style={{ letterSpacing: "-0.025em" }}>
                Descreva em linguagem<br /><span style={{ color: C.orLt }}>normal o que precisa.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: C.muted }}>
                O Agente IA entende o que você escreve, pergunta marca e medida quando precisa,
                e monta a cotação completa — sem formulário, sem lista rígida.
              </p>
              <FeatureList items={["Entende abreviações e nomes populares dos materiais", "Pergunta o que falta para montar a busca perfeita", "Monta a lista inteira de uma só vez"]} />
            </Reveal>
            {/* flex-1 + marginRight negativo sangra a imagem para fora do container */}
            <Reveal delay={0.15} className="flex-1 min-w-0" style={{ marginRight: "-10vw" }}>
              <div style={{ perspective: "1400px" }}>
                <TiltCard>
                  <BrowserFrame src={white ? "/chat1white.png" : "/chat1.png"} alt="Agente IA refinando a busca" light={white} glow />
                  <FloatingBadge style={{ bottom: 24, left: 24 }}>
                    <p className="font-mono text-[10px] mb-0.5" style={{ color: C.faint }}>Agente IA</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.grn }}>✓ 1 item identificado · 2s</p>
                  </FloatingBadge>
                  <FloatingBadge style={{ top: 56, right: 24 }} delay={0.72}>
                    <p className="font-mono text-[10px] mb-0.5" style={{ color: C.faint }}>Cotação pronta</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.orLt }}>4 fornecedores</p>
                  </FloatingBadge>
                </TiltCard>
              </div>
            </Reveal>
          </div>

          {/* 02 — text right · image bleeds LEFT */}
          <div className="flex flex-col md:flex-row-reverse gap-16 items-center mb-32 pb-32"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <Reveal className="md:w-[38%] shrink-0">
              <p className="font-mono text-xs mb-3 flex items-center gap-3" style={{ color: C.muted }}>
                <span>02 / 04</span><span className="w-10 h-px inline-block" style={{ background: C.faint }} /><span>Comparação</span>
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight" style={{ letterSpacing: "-0.025em" }}>
                Todos os fornecedores.<br /><span style={{ color: C.orLt }}>Uma tela só.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: C.muted }}>
                Todos os resultados comparados na mesma tela. Menor preço em destaque.
                Você decide na hora — sem abrir um site diferente para cada fornecedor.
              </p>
              <FeatureList items={["Menor preço destacado automaticamente", "Compra direto pelo link — sem sair da plataforma", "Comparação de até 5 fornecedores em paralelo"]} />
            </Reveal>
            <Reveal delay={0.15} className="flex-1 min-w-0" style={{ marginLeft: "-10vw" }}>
              <div style={{ perspective: "1400px" }}>
                <TiltCard>
                  <BrowserFrame src={white ? "/result1white.png" : "/result1.png"} alt="Resultados com comparação" light={white} glow />
                  <FloatingBadge style={{ bottom: 24, right: 24 }}>
                    <p className="font-mono text-[10px] mb-0.5" style={{ color: C.faint }}>Casa &amp; Obra</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.grn }}>↓ R$ 4,60 mais barato</p>
                  </FloatingBadge>
                  <FloatingBadge style={{ top: 56, left: 24 }} delay={0.72}>
                    <p className="font-mono text-[10px] mb-0.5" style={{ color: C.faint }}>Resultado</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.orLt }}>5 fornecedores comparados</p>
                  </FloatingBadge>
                </TiltCard>
              </div>
            </Reveal>
          </div>

          {/* 03 — text left · image bleeds RIGHT */}
          <div className="flex flex-col md:flex-row gap-16 items-center mb-32 pb-32"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <Reveal className="md:w-[38%] shrink-0">
              <p className="font-mono text-xs mb-3 flex items-center gap-3" style={{ color: C.muted }}>
                <span>03 / 04</span><span className="w-10 h-px inline-block" style={{ background: C.faint }} /><span>Fornecedores</span>
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight" style={{ letterSpacing: "-0.025em" }}>
                Conecte os fornecedores<br /><span style={{ color: C.orLt }}>que você já usa.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: C.muted }}>
                O agente consulta apenas quem você configurou — com login salvo,
                sem precisar entrar em cada site. Nenhum fornecedor precisa instalar nada.
              </p>
              <FeatureList items={["Login salvo por fornecedor — acessa automaticamente", "Suporte a sites que exigem autenticação", "Nenhum acordo prévio com os fornecedores necessário"]} />
            </Reveal>
            <Reveal delay={0.15} className="flex-1 min-w-0" style={{ marginRight: "-10vw" }}>
              <div style={{ perspective: "1400px" }}>
                <TiltCard>
                  <BrowserFrame src="/chat2.png" alt="Seleção de fornecedores" light={false} glow />
                  <FloatingBadge style={{ bottom: 24, left: 24 }}>
                    <p className="font-mono text-[10px] mb-0.5" style={{ color: C.faint }}>Acessando</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.orLt }}>23 fornecedores · login salvo</p>
                  </FloatingBadge>
                  <FloatingBadge style={{ top: 56, right: 24 }} delay={0.72}>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.grn }}>✓ sem acordo prévio</p>
                  </FloatingBadge>
                </TiltCard>
              </div>
            </Reveal>
          </div>

          {/* 04 — text right · image bleeds LEFT */}
          <div className="flex flex-col md:flex-row-reverse gap-16 items-center">
            <Reveal className="md:w-[38%] shrink-0">
              <p className="font-mono text-xs mb-3 flex items-center gap-3" style={{ color: C.muted }}>
                <span>04 / 04</span><span className="w-10 h-px inline-block" style={{ background: C.faint }} /><span>Catálogo</span>
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight" style={{ letterSpacing: "-0.025em" }}>
                Catálogo completo<br /><span style={{ color: C.orLt }}>com preços reais.</span>
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: C.muted }}>
                Todos os seus materiais com preços atualizados de cada fornecedor.
                Filtre, compare e exporte — sem planilha manual.
              </p>
              <FeatureList items={["Preços atualizados automaticamente a cada 2 horas", "Filtros por categoria, fornecedor e faixa de preço", "Histórico de preços para negociar melhor"]} />
            </Reveal>
            <Reveal delay={0.15} className="flex-1 min-w-0" style={{ marginLeft: "-10vw" }}>
              <div style={{ perspective: "1400px" }}>
                <TiltCard>
                  <BrowserFrame src={white ? "/catalogowhite1.png" : "/catalogo1.png"} alt="Catálogo de materiais" light={white} glow />
                  <FloatingBadge style={{ bottom: 24, right: 24 }}>
                    <p className="font-mono text-[10px] mb-0.5" style={{ color: C.faint }}>Última atualização</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.orLt }}>↻ há 12 min · automático</p>
                  </FloatingBadge>
                  <FloatingBadge style={{ top: 56, left: 24 }} delay={0.72}>
                    <p className="font-mono text-[10px] mb-0.5" style={{ color: C.faint }}>Catálogo</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: C.orLt }}>3.241 preços indexados</p>
                  </FloatingBadge>
                </TiltCard>
              </div>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ── LIVE FEED ────────────────────────────────────────── */}
      <LiveFeedSection />

      {/* ── ROI ──────────────────────────────────────────────── */}
      <section id="roi" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <Reveal>
            <SectionTag>Calculadora de ROI</SectionTag>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ letterSpacing: "-0.025em" }}>
              Quanto você economiza?
            </h2>
            <p className="text-sm mb-12" style={{ color: C.muted }}>
              Calcule o retorno com base no seu gasto mensal em materiais.
            </p>
          </Reveal>
          <Reveal delay={0.1}><ROICalculator /></Reveal>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="planos" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Reveal>
            <SectionTag>Planos</SectionTag>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ letterSpacing: "-0.025em" }}>Comece grátis</h2>
            <p className="text-sm mb-14" style={{ color: C.muted }}>Sem cartão de crédito. Cancele quando quiser.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Free", price: "R$ 0", per: "/mês", delay: 0,
                desc: "Para conhecer a plataforma.", cta: "Começar grátis", highlight: false,
                features: ["15 cotações/mês", "2 fornecedores", "1 usuário", "Catálogo básico"],
              },
              {
                name: "Pro", price: "R$ 247", per: "/mês", delay: 0.08,
                desc: "Para equipes que cotam todo dia. ROI médio de 15× sobre o plano.",
                cta: "Assinar Pro", highlight: true, badge: "Mais popular",
                features: ["Cotações ilimitadas", "5 fornecedores em paralelo", "Normalização automática", "Até 10 usuários", "Agente IA para cotação", "Histórico completo", "Suporte prioritário"],
              },
              {
                name: "Enterprise", price: "Consulta", per: "", delay: 0.16,
                desc: "Para grandes operações e redes de obras.", cta: "Falar com vendas", highlight: false,
                features: ["Tudo do Pro", "White-label", "Usuários ilimitados", "SLA garantido", "Onboarding dedicado"],
              },
            ].map(({ name, price, per, desc, cta, highlight, badge, features, delay }) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                animate={highlight ? breatheAnimate : undefined}
                whileHover={{ y: -4 }}
                className="relative flex flex-col p-7 rounded-xl"
                style={{ background: highlight ? C.s2 : C.s1, border: `1px solid ${highlight ? C.or + "40" : C.borderHi}` }}>
                {badge && (
                  <span className="absolute -top-3 left-6 font-mono text-xs px-2.5 py-1 rounded-sm"
                    style={{ background: C.or, color: "#fff" }}>{badge}</span>
                )}
                <div className="mb-6">
                  <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: C.muted }}>{name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-3xl font-bold" style={{ color: C.text, letterSpacing: "-0.03em" }}>{price}</span>
                    {per && <span className="text-sm mb-0.5" style={{ color: C.muted }}>{per}</span>}
                  </div>
                  <p className="text-sm" style={{ color: C.muted }}>{desc}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: C.muted }}>
                      <CheckCircle size={13} style={{ color: C.grn, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.a href="http://wa.me/5511945319510" target="_blank" rel="noopener noreferrer" whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}
                  className="block text-center py-2.5 rounded-lg text-sm font-medium"
                  style={highlight ? { background: C.or, color: "#fff" } : { border: `1px solid ${C.borderHi}`, color: C.text }}>
                  {cta}
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-3xl mx-auto px-6 py-24">
          <Reveal>
            <SectionTag>FAQ</SectionTag>
            <h2 className="text-3xl font-bold mb-12 tracking-tight" style={{ letterSpacing: "-0.025em" }}>
              Dúvidas frequentes
            </h2>
          </Reveal>
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {[
              { q: "Os fornecedores precisam se integrar?", a: "Não. O ConstruPrice acessa os sites dos fornecedores como um comprador normal, sem necessidade de API, acordo prévio ou qualquer configuração do lado deles." },
              { q: "Os preços são atualizados em tempo real?", a: "Atualização automática a cada 2 horas. Cada nova cotação também aciona uma atualização. Cache de 30 min para buscas repetidas." },
              { q: "Funciona com fornecedores que exigem login?", a: "Sim. Você cadastra as credenciais e o sistema mantém a sessão ativa para acesso automático." },
              { q: "Como funciona o plano Free?", a: "Até 15 cotações/mês com 2 fornecedores em paralelo. Sem cartão de crédito. Faça upgrade a qualquer momento." },
              { q: "Qual o retorno real para minha empresa?", a: "Para uma obra com R$50k/mês em materiais, a economia documentada de 6,2% representa R$3.100/mês — 12× o custo do plano Pro. Use nossa calculadora para simular seu caso específico." },
            ].map(i => <FAQItem key={i.q} {...i} />)}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <a href="#" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: C.or }}>
                <TrendingDown size={12} color="#fff" strokeWidth={2.5} />
              </div>
              <span className="font-medium text-sm" style={{ color: C.text }}>ConstruPrice</span>
            </a>
            <div className="flex flex-wrap gap-7">
              {["Produto", "Planos", "ROI", "Blog", "Privacidade", "Termos"].map(l => (
                <a key={l} href="#" className="text-sm transition-colors" style={{ color: C.muted }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>{l}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6"
            style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="font-mono text-xs" style={{ color: C.muted }}>© 2025 ConstruPrice</p>
            <p className="font-mono text-xs" style={{ color: C.muted }}>Cotação de material de construção em tempo real</p>
          </div>
        </div>
      </footer>
    </div>
    </ThemeContext.Provider>
  );
}
