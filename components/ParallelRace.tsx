"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

const SUPPLIERS = ["Leroy Merlin", "C&C", "Telhanorte", "Quero-Quero", "MateriaisOnline"];
const PRICES    = ["R$ 35,50",     "R$ 37,20",  "R$ 38,80",  "R$ 39,40",  "R$ 41,10"];
const PAR_DUR   = [1800, 2200, 2500, 2100, 2700]; // ms each, all start at t=0
const SEQ_DUR   = 1400; // ms per bar, sequential
const SEQ_GAP   = 100;

const PAR_TOTAL = Math.max(...PAR_DUR);
const SEQ_TOTAL = SUPPLIERS.length * SEQ_DUR + (SUPPLIERS.length - 1) * SEQ_GAP;

function easeOut(t: number) {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

import type { Theme } from "../lib/colors";

interface ColProps {
  label: string;
  subtitle: string;
  progress: number[];
  done: boolean;
  totalSec: string;
  highlight: boolean;
  C: Theme;
}

function RaceColumn({ label, subtitle, progress, done, totalSec, highlight, C }: ColProps) {
  return (
    <div className="flex-1 min-w-0 rounded-xl p-5 space-y-4"
      style={{ background: C.s1, border: `1px solid ${highlight ? C.or + "38" : C.borderHi}` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs font-semibold" style={{ color: highlight ? C.orLt : C.muted }}>{label}</p>
          <p className="font-mono text-[10px]" style={{ color: C.faint }}>{subtitle}</p>
        </div>
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-sm font-bold px-2.5 py-1 rounded"
              style={{
                background: highlight ? C.orDim : "#ffffff08",
                color: highlight ? C.orLt : C.muted,
                border: `1px solid ${highlight ? C.or + "30" : C.borderHi}`,
              }}>
              {totalSec}s
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        {SUPPLIERS.map((name, i) => {
          const p = progress[i];
          const finished = p >= 0.999;
          const best = i === 0;
          return (
            <div key={name}>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[10px]"
                  style={{ color: p > 0.01 ? (highlight ? C.text : C.muted) : C.faint }}>
                  {name}
                </span>
                <AnimatePresence>
                  {finished && (
                    <motion.span
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-mono text-[10px]"
                      style={{ color: best && highlight ? C.grn : C.muted }}>
                      {PRICES[i]}{best && highlight ? " ✓" : ""}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: C.s2 }}>
                <div style={{
                  height: "100%",
                  width: `${p * 100}%`,
                  borderRadius: 99,
                  background: best && highlight ? C.grn : highlight ? C.or : "#525252",
                  boxShadow: finished ? `0 0 6px ${best && highlight ? C.grn : highlight ? C.or : "#52525260"}60` : "none",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ParallelRaceSection() {
  const C = useTheme();
  const [parProg, setParProg] = useState<number[]>(SUPPLIERS.map(() => 0));
  const [seqProg, setSeqProg] = useState<number[]>(SUPPLIERS.map(() => 0));
  const [parDone, setParDone] = useState(false);
  const [seqDone, setSeqDone] = useState(false);
  const [running, setRunning] = useState(false);
  const rafRef   = useRef<number>(0);
  const startRef = useRef(0);

  function start() {
    cancelAnimationFrame(rafRef.current);
    setParProg(SUPPLIERS.map(() => 0));
    setSeqProg(SUPPLIERS.map(() => 0));
    setParDone(false);
    setSeqDone(false);
    setRunning(true);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      startRef.current = Date.now();

      function frame() {
        const t = Date.now() - startRef.current;

        // parallel: all bars grow simultaneously, each at its own pace
        setParProg(PAR_DUR.map(dur => easeOut(t / dur)));
        if (t >= PAR_TOTAL) setParDone(true);

        // sequential: each bar starts after the previous one finishes
        const seqOffsets = SUPPLIERS.map((_, i) => i * (SEQ_DUR + SEQ_GAP));
        setSeqProg(seqOffsets.map(offset => easeOut((t - offset) / SEQ_DUR)));

        if (t >= SEQ_TOTAL) {
          setSeqDone(true);
          setRunning(false);
          return;
        }

        rafRef.current = requestAnimationFrame(frame);
      }

      rafRef.current = requestAnimationFrame(frame);
    }));
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const speedup = (SEQ_TOTAL / PAR_TOTAL).toFixed(1);

  return (
    <section style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <p className="font-mono text-xs flex items-center justify-center gap-2 mb-3" style={{ color: C.muted }}>
            <span>//</span><span className="uppercase tracking-widest">velocidade</span>
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            style={{ letterSpacing: "-0.025em", color: C.text }}>
            Paralelo é{" "}
            <span style={{ color: C.orLt }}>{speedup}× mais rápido.</span>
          </motion.h2>
          <p className="text-sm" style={{ color: C.muted, maxWidth: 420, margin: "0 auto" }}>
            Outros sistemas consultam um fornecedor por vez. ConstruPrice acessa todos ao mesmo tempo.
            Clique e veja a diferença ao vivo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <RaceColumn
            label="⚡ ConstruPrice"
            subtitle="todos simultâneos"
            progress={parProg}
            done={parDone}
            totalSec={(PAR_TOTAL / 1000).toFixed(1)}
            highlight={true}
            C={C}
          />
          <RaceColumn
            label="🐢 Manual"
            subtitle="um por vez"
            progress={seqProg}
            done={seqDone}
            totalSec={(SEQ_TOTAL / 1000).toFixed(1)}
            highlight={false}
            C={C}
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={start}
            disabled={running}
            whileHover={!running ? { scale: 1.04 } : {}}
            whileTap={!running ? { scale: 0.96 } : {}}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: running ? C.s2 : C.or,
              color: running ? C.muted : "#fff",
              cursor: running ? "not-allowed" : "pointer",
              boxShadow: running ? "none" : `0 4px 20px ${C.or}35`,
            }}>
            <Play size={13} fill={running ? "none" : "currentColor"} />
            {running ? "Comparando..." : seqDone ? "Comparar novamente" : "Comparar velocidade"}
          </motion.button>

          <AnimatePresence>
            {seqDone && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs"
                style={{ color: C.muted }}>
                ConstruPrice terminou{" "}
                <span style={{ color: C.orLt }}>{speedup}× antes</span> — mesmo resultado, muito menos espera
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
