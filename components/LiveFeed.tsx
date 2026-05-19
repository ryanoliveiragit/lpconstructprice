"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../lib/ThemeContext";

const MATERIALS = [
  "Cimento CP2 50kg", "Areia grossa m³", "Tijolo furado un",
  "Cal hidratada 20kg", "Tinta branca 18L", "Ferro 10mm 12m",
  "Telha cerâmica un", "Argamassa 20kg", "Cano PVC 100mm 3m",
  "Madeira pinus 6m", "Bloco concreto un", "Prego 17×27 kg",
  "Parafuso 3/8 cento", "Tinta acrílica 3,6L", "Impermeabilizante 18L",
];
const SUPPLIERS = [
  "Leroy Merlin", "C&C", "Telhanorte", "Quero-Quero",
  "MateriaisOnline", "Depósito Norte", "BRMateriais", "ObraFácil",
];

let _id = 100;
function rnd(n: number) { return Math.floor(Math.random() * n); }
function makeItem() {
  const base = 14 + Math.random() * 90;
  const saving = 2 + Math.random() * 18;
  return {
    id: _id++,
    material: MATERIALS[rnd(MATERIALS.length)],
    supplier: SUPPLIERS[rnd(SUPPLIERS.length)],
    price: `R$ ${base.toFixed(2).replace(".", ",")}`,
    saving: `R$ ${saving.toFixed(2).replace(".", ",")}`,
    ago: `${rnd(55) + 2}min`,
  };
}

export default function LiveFeedSection() {
  const C = useTheme();
  const [items, setItems] = useState(() => Array.from({ length: 7 }, makeItem));
  const [total, setTotal] = useState(18_427);

  useEffect(() => {
    const iv = setInterval(() => {
      setItems(prev => [makeItem(), ...prev.slice(0, 8)]);
      setTotal(t => t + rnd(9) + 1);
    }, 1900);
    return () => clearInterval(iv);
  }, []);

  return (
    <section style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-16 items-start">

          {/* Feed panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}>
            <div className="rounded-2xl overflow-hidden" style={{ background: C.s1, border: `1px solid ${C.borderHi}` }}>

              {/* Bar */}
              <div className="px-4 py-3 flex items-center gap-3"
                style={{ background: C.s2, borderBottom: `1px solid ${C.border}` }}>
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: C.or }} />
                <span className="font-mono text-xs" style={{ color: C.muted }}>
                  coleta ao vivo · 23 lojas
                </span>
                <motion.span
                  key={total}
                  initial={{ color: C.orLt }}
                  animate={{ color: C.faint }}
                  transition={{ duration: 2 }}
                  className="ml-auto font-mono text-xs tabular-nums">
                  {total.toLocaleString("pt-BR")} preços
                </motion.span>
              </div>

              {/* Stream */}
              <div style={{ minHeight: 360 }}>
                <AnimatePresence mode="popLayout">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -24 }}
                      animate={{ opacity: Math.max(0.15, 1 - idx * 0.11), y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-4 py-3 flex items-center gap-3"
                      style={{ borderBottom: `1px solid ${C.border}` }}>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs truncate" style={{ color: C.text }}>{item.material}</p>
                        <p className="font-mono text-[10px]" style={{ color: C.faint }}>
                          {item.supplier} · {item.ago} atrás
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono text-xs font-bold" style={{ color: C.orLt }}>{item.price}</p>
                        <p className="font-mono text-[9px]" style={{ color: C.grn }}>↓ {item.saving}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8 lg:pt-1">

            <div>
              <p className="font-mono text-xs flex items-center gap-2 mb-4" style={{ color: C.muted }}>
                <span>//</span><span className="uppercase tracking-widest">Sempre ativo</span>
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
                style={{ letterSpacing: "-0.025em", color: C.text }}>
                Preços atualizados<br />
                <span style={{ color: C.orLt }}>enquanto você trabalha.</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                O motor roda em segundo plano — sem abrir nada, sem ligar para ninguém.
                Quando você precisar de um preço, ele já está lá.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Preços coletados hoje", value: total.toLocaleString("pt-BR"), live: true },
                { label: "Lojas monitoradas",     value: "23",   live: false },
                { label: "Frequência",             value: "2h",   live: false },
                { label: "Na cotação",             value: "< 3s", live: false },
              ].map(({ label, value, live }) => (
                <div key={label} className="p-4 rounded-xl"
                  style={{ background: C.s1, border: `1px solid ${C.borderHi}` }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>
                    {label}
                  </p>
                  <motion.p
                    key={value}
                    initial={live ? { opacity: 0.5, y: -3 } : {}}
                    animate={live ? { opacity: 1, y: 0 } : {}}
                    className="font-bold tabular-nums text-xl"
                    style={{ color: C.orLt, letterSpacing: "-0.02em" }}>
                    {value}
                  </motion.p>
                </div>
              ))}
            </div>

            {/* progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs" style={{ color: C.muted }}>
                <span>// varredura em andamento</span>
                <motion.span
                  key={total % 100}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  style={{ color: C.orLt }}>
                  {total % 100}%
                </motion.span>
              </div>
              <div className="h-px rounded-full overflow-hidden" style={{ background: C.borderHi }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${total % 100}%` }}
                  transition={{ duration: 0.6 }}
                  style={{ background: C.or, boxShadow: `0 0 8px ${C.or}80` }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
