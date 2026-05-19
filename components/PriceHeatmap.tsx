"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";

const CATEGORIES = ["Cimento", "Areia", "Tijolo", "Ferro", "Tinta", "Madeira"] as const;
type Cat = typeof CATEGORIES[number];

const BASE_PRICES: Record<Cat, { item: string; unit: string; base: number }[]> = {
  Cimento: [
    { item: "CP2 50kg",   unit: "sc",  base: 35.50 },
    { item: "CP5 50kg",   unit: "sc",  base: 38.90 },
    { item: "CPIII 50kg", unit: "sc",  base: 41.20 },
    { item: "Branco 50kg",unit: "sc",  base: 52.00 },
  ],
  Areia: [
    { item: "Grossa m³",  unit: "m³",  base: 120.00 },
    { item: "Média m³",   unit: "m³",  base: 112.00 },
    { item: "Fina m³",    unit: "m³",  base: 105.00 },
    { item: "Lavada m³",  unit: "m³",  base: 145.00 },
  ],
  Tijolo: [
    { item: "Furado 8f",  unit: "un",  base: 0.68 },
    { item: "Furado 9f",  unit: "un",  base: 0.82 },
    { item: "Maciço",     unit: "un",  base: 0.55 },
    { item: "Aparente",   unit: "un",  base: 1.20 },
  ],
  Ferro: [
    { item: "CA50 10mm",  unit: "barra", base: 48.50 },
    { item: "CA50 12mm",  unit: "barra", base: 68.00 },
    { item: "CA50 8mm",   unit: "barra", base: 31.90 },
    { item: "CA60 5mm",   unit: "barra", base: 18.40 },
  ],
  Tinta: [
    { item: "Acrílica 18L",   unit: "bd", base: 142.00 },
    { item: "PVA 18L",        unit: "bd", base: 89.00  },
    { item: "Esmalte 3,6L",   unit: "lt", base: 48.00  },
    { item: "Massa corrida 25kg", unit: "bd", base: 62.00 },
  ],
  Madeira: [
    { item: "Pinus 6m",    unit: "pç", base: 24.90 },
    { item: "Eucalipto 6m",unit: "pç", base: 19.50 },
    { item: "MDF 15mm",    unit: "m²", base: 68.00 },
    { item: "OSB 11mm",    unit: "m²", base: 52.00 },
  ],
};

const SUPPLIERS_SHORT = ["LM", "C&C", "TN", "QQ", "MO"];
const FULL_NAMES: Record<string, string> = {
  LM: "Leroy Merlin", "C&C": "C&C", TN: "Telhanorte",
  QQ: "Quero-Quero", MO: "MateriaisOnline",
};

function genPrices(base: number) {
  return SUPPLIERS_SHORT.map(s => {
    const noise = base * (0.92 + Math.random() * 0.20);
    return parseFloat(noise.toFixed(2));
  });
}

function buildGrid(cat: Cat) {
  return BASE_PRICES[cat].map(row => ({
    ...row,
    prices: genPrices(row.base),
  }));
}

function fmt(n: number) {
  return n >= 100
    ? `R$${Math.round(n)}`
    : `R$${n.toFixed(2).replace(".", ",")}`;
}

export default function PriceHeatmapSection() {
  const C = useTheme();
  const [cat,  setCat]  = useState<Cat>("Cimento");
  const [grid, setGrid] = useState(() => buildGrid("Cimento"));
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);
  const [ticking, setTicking] = useState(true);

  // Refresh prices every 3s to simulate live updates
  useEffect(() => {
    if (!ticking) return;
    const iv = setInterval(() => {
      setGrid(prev => prev.map(row => ({
        ...row,
        prices: row.prices.map(p => parseFloat((p * (0.985 + Math.random() * 0.032)).toFixed(2))),
      })));
    }, 2800);
    return () => clearInterval(iv);
  }, [ticking]);

  function selectCat(c: Cat) {
    setCat(c);
    setGrid(buildGrid(c));
    setHover(null);
  }

  // heat: 0 = best (green), 1 = worst (red-ish), returns rgba string
  function heatColor(value: number, min: number, max: number, opacity = 1) {
    if (max === min) return `rgba(80,80,80,${opacity})`;
    const t = (value - min) / (max - min);
    if (t < 0.15) return `rgba(34,197,94,${opacity})`;         // best
    if (t < 0.45) return `rgba(134,197,94,${opacity * 0.7})`; // above avg
    if (t < 0.75) return `rgba(249,115,22,${opacity * 0.5})`; // below avg
    return `rgba(239,68,68,${opacity * 0.7})`;                  // worst
  }

  return (
    <section style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 py-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono text-xs flex items-center gap-2 mb-3" style={{ color: C.muted }}>
              <span>//</span><span className="uppercase tracking-widest">mapa de preços</span>
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ letterSpacing: "-0.025em", color: C.text }}>
              Compare por<br />
              <span style={{ color: C.orLt }}>fornecedor e produto.</span>
            </h2>
          </div>

          {/* live toggle */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={ticking ? { opacity: [1, 0.3, 1] } : { opacity: 0.3 }}
              transition={{ duration: 1.2, repeat: ticking ? Infinity : 0 }}
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: ticking ? C.or : C.faint }} />
            <button
              onClick={() => setTicking(t => !t)}
              className="font-mono text-xs"
              style={{ color: ticking ? C.orLt : C.faint }}>
              {ticking ? "ao vivo" : "pausado"}
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(c => (
            <motion.button
              key={c}
              onClick={() => selectCat(c)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-3.5 py-1.5 rounded-lg font-mono text-xs transition-colors"
              style={{
                background: cat === c ? C.s3 : C.s1,
                border: `1px solid ${cat === c ? C.or + "50" : C.borderHi}`,
                color: cat === c ? C.orLt : C.muted,
              }}>
              {c}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${C.borderHi}` }}>

            {/* Column headers */}
            <div className="grid bg-opacity-50"
              style={{
                display: "grid",
                gridTemplateColumns: `1fr repeat(${SUPPLIERS_SHORT.length}, 1fr)`,
                background: C.s2,
                borderBottom: `1px solid ${C.border}`,
              }}>
              <div className="px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.faint }}>
                  Produto / {cat}
                </span>
              </div>
              {SUPPLIERS_SHORT.map(s => (
                <div key={s} className="px-2 py-2.5 text-center">
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {grid.map((row, ri) => {
              const min = Math.min(...row.prices);
              const max = Math.max(...row.prices);
              return (
                <div
                  key={row.item}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `1fr repeat(${SUPPLIERS_SHORT.length}, 1fr)`,
                    borderBottom: ri < grid.length - 1 ? `1px solid ${C.border}` : "none",
                    background: hover?.row === ri ? C.s2 + "80" : "transparent",
                  }}>

                  {/* Item name */}
                  <div className="px-4 py-3">
                    <p className="font-mono text-xs" style={{ color: C.text }}>{row.item}</p>
                    <p className="font-mono text-[9px]" style={{ color: C.faint }}>{row.unit}</p>
                  </div>

                  {/* Price cells */}
                  {row.prices.map((price, ci) => {
                    const isBest = price === min;
                    const isHovered = hover?.row === ri && hover?.col === ci;
                    return (
                      <motion.div
                        key={ci}
                        onMouseEnter={() => setHover({ row: ri, col: ci })}
                        onMouseLeave={() => setHover(null)}
                        whileHover={{ scale: 1.06 }}
                        className="px-2 py-3 flex items-center justify-center cursor-default relative"
                        style={{
                          background: isHovered ? heatColor(price, min, max, 0.25) : heatColor(price, min, max, 0.12),
                        }}>
                        <motion.span
                          key={price}
                          initial={{ opacity: 0.4 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="font-mono text-xs font-semibold"
                          style={{ color: isBest ? C.grn : C.muted }}>
                          {fmt(price)}
                        </motion.span>
                        {isBest && (
                          <span className="absolute top-1 right-1 w-1 h-1 rounded-full"
                            style={{ background: C.grn }} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Legend + tooltip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {[
              { color: "rgba(34,197,94,0.8)", label: "Menor preço" },
              { color: "rgba(249,115,22,0.6)", label: "Médio" },
              { color: "rgba(239,68,68,0.7)", label: "Maior" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="font-mono text-[10px]" style={{ color: C.faint }}>{label}</span>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {hover && (
              <motion.p
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs"
                style={{ color: C.muted }}>
                {FULL_NAMES[SUPPLIERS_SHORT[hover.col]]} ·{" "}
                <span style={{ color: C.orLt }}>
                  {fmt(grid[hover.row].prices[hover.col])} / {grid[hover.row].unit}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
