"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import MagicDuelCanvas from "../components/MagicDuelCanvas";

// Removed FloatingDots to rely on MagicDuelCanvas

// ---- STICKY HEADER ----
const Nav = () => {
  const [isMarauder, setIsMarauder] = useState(false);
  useEffect(() => {
    if (isMarauder) {
      document.documentElement.setAttribute("data-theme", "marauder");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isMarauder]);

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4 pointer-events-none transition-colors duration-500">
      <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-auto">
        <a
          href="https://portfolio-galaxy-five.vercel.app/"
          className="group flex items-center gap-2 font-bold text-sm tracking-wide text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors"
          style={{ fontFamily: "var(--font-hand)", fontSize: "1.1rem" }}
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
          back to the galaxy
        </a>
        <button
          onClick={() => setIsMarauder(!isMarauder)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-sm border hover:scale-105 transition-transform"
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: "1.1rem",
            background: isMarauder ? '#0d0b08' : 'var(--color-parchment)',
            color: 'var(--color-gold)',
            borderColor: 'rgba(201,168,76,0.3)',
          }}
        >
          {isMarauder ? "🗺️ Marauder's Map" : "⚡ Lumos"}
        </button>
      </div>
    </nav>
  );
};

// ---- GOLDEN SNITCH CURSOR ----
const OrbitalCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setAngle((prev) => (prev + 0.04) % (Math.PI * 2));
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const r = 35;
  const orbitX = mousePos.x + Math.cos(angle) * r;
  const orbitY = mousePos.y + Math.sin(angle) * r;

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-[100] hidden md:block">
      <motion.div
        className="absolute text-lg"
        animate={{ x: orbitX - 10, y: orbitY - 10 }}
        transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.1 }}
        style={{ filter: "drop-shadow(0 0 6px rgba(201,168,76,0.5))" }}
      >
        ⚡
      </motion.div>
    </div>
  );
};

// ---- SCROLL PROGRESS (WAND TRAIL) ----
const BrainwaveProgress = () => {
  const { scrollYProgress } = useScroll();
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="fixed top-[70px] left-0 w-full h-4 z-40 pointer-events-none opacity-60 hidden md:block">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 20">
        <motion.path
          d="M0,10 L10,10 L15,0 L20,20 L25,5 L30,15 L35,10 L100,10"
          vectorEffect="non-scaling-stroke"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
};

// ---- HIGHLIGHT MARKER ----
const Mark = ({ children, color = "#c9a84c" }: { children: React.ReactNode; color?: string }) => (
  <span
    style={{
      background: `linear-gradient(120deg, ${color}22 0%, ${color}55 100%)`,
      paddingInline: "4px",
      borderRadius: "2px",
      borderBottom: `1px solid ${color}66`,
    }}
  >
    {children}
  </span>
);

// ---- FACT CARD (3D GRIMOIRE) ----
const FactCard = ({
  emoji,
  title,
  desc,
  accent,
  rotate = 0,
  delay = 0,
}: {
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  rotate?: number;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40, rotate: rotate - 2 }}
    whileInView={{ opacity: 1, y: 0, rotate }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
    className="grimoire-card w-full h-[280px] md:h-[320px] cursor-default select-none"
  >
    <div className="grimoire-inner">
      {/* Front of the Card (Closed Book / Crest) */}
      <div className="grimoire-front fun-card p-6 md:p-8 flex items-center justify-center border-2 border-[var(--color-silver)] opacity-80 bg-[rgba(10,15,25,0.8)]">
        <div className="text-6xl opacity-30 animate-pulse" style={{ color: accent, filter: `drop-shadow(0 0 10px ${accent})` }}>
          ✦
        </div>
        <div className="absolute inset-0 border-[4px] border-[var(--color-silver)] opacity-10 m-4 rounded-sm border-double"></div>
      </div>

      {/* Back of the Card (The Secret Content) */}
      <div className="grimoire-back fun-card p-6 md:p-8 flex flex-col gap-3 justify-center items-center text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2"
          style={{ background: accent + "22", border: `1px solid ${accent}44`, boxShadow: `0 0 20px ${accent}44` }}
        >
          {emoji}
        </div>
        <h3
          className="text-xl md:text-2xl font-black leading-tight animate-text-glow"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          {title}
        </h3>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {desc}
        </p>
      </div>
    </div>
  </motion.div>
);

// ---- QUOTE BANNER ----
const Banner = ({ text, bg, textColor }: { text: string; bg: string; textColor: string }) => (
  <div
    className="w-[110%] -ml-[5%] overflow-hidden py-4 my-16 shadow-sm"
    style={{ background: bg, transform: "rotate(-1.5deg)" }}
  >
    <div className="animate-marquee whitespace-nowrap" style={{ fontFamily: "var(--font-hand)", fontSize: "1.6rem", color: textColor }}>
      {Array(8).fill(`${text} &nbsp;&nbsp;&nbsp;`).join("")}
    </div>
  </div>
);

// ---- HOBBY PILL ----
const Pill = ({
  children,
  color,
  delay = 0,
}: {
  children: React.ReactNode;
  color: string;
  delay?: number;
}) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.35, delay, ease: [0.34, 1.56, 0.64, 1] }}
    whileHover={{ scale: 1.08 }}
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold cursor-default"
    style={{ background: color + "22", color: "var(--color-ink)", border: `1.5px solid ${color}44`, fontFamily: "var(--font-body)" }}
  >
    {children}
  </motion.span>
);

// ---- TIMELINE ENTRY ----
const TimelineEntry = ({
  year,
  title,
  desc,
  emoji,
  delay = 0,
  alignRight = false,
}: {
  year: string;
  title: string;
  desc: string;
  emoji: string;
  delay?: number;
  alignRight?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: alignRight ? 50 : -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
    className={`flex w-full mb-8 ${alignRight ? "justify-end" : "justify-start"}`}
  >
    <div className={`manga-panel manga-lines p-6 md:p-8 max-w-md ${alignRight ? "rotate-1" : "-rotate-1"}`}>
      <div className="flex gap-4 items-start relative z-10">
        <div
          className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-[var(--color-ink)] bg-[var(--color-bg)]"
        >
          {emoji}
        </div>
        <div>
          <span
            className="text-xs font-black tracking-widest uppercase mb-1 block bg-[var(--color-ink)] text-[var(--color-bg)] inline-block px-2 py-0.5 transform -skew-x-12"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {year}
          </span>
          <h3
            className="text-xl md:text-2xl font-black mb-2 leading-tight uppercase"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            {title}
          </h3>
          <p className="text-sm leading-relaxed font-bold" style={{ color: "var(--color-muted)" }}>
            {desc}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

// ---- DESK SANDBOX ----
const DeskSandbox = ({ onFindHorcrux, foundHorcruxes }: { onFindHorcrux: (id: string) => void, foundHorcruxes: string[] }) => {
  const constraintsRef = useRef(null);
  
    const items = [
    { emoji: "🍜", label: "Maggi", size: "text-6xl", top: "10%", left: "10%" },
    { emoji: "⚽", label: "Football", size: "text-5xl", top: "20%", left: "70%" },
    { emoji: "🏏", label: "Cricket", size: "text-5xl", top: "60%", left: "20%" },
    { emoji: "📚", label: "Science", size: "text-6xl", top: "50%", left: "80%" },
    { emoji: "🪐", label: "Planet", size: "text-7xl", top: "70%", left: "50%" },
  ];

  return (
    <section className="relative w-full max-w-4xl mx-auto px-6 py-24 cursor-crosshair">
      {/* Horcrux 2 */}
      <Horcrux id="ring" onFind={onFindHorcrux} found={foundHorcruxes.includes("ring")} className="top-10 right-10" />

      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          My Desk
        </h2>
        <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem", color: "var(--color-muted)" }}>
          (grab things and throw them around)
        </p>
      </div>
      <motion.div 
        ref={constraintsRef} 
        className="w-full h-80 md:h-96 rounded-3xl border-4 overflow-hidden relative manga-lines"
        style={{ borderColor: "var(--color-ink)", backgroundColor: "var(--color-bg)", boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            whileDrag={{ scale: 1.2, cursor: "grabbing" }}
            className={`absolute cursor-grab select-none ${item.size} drop-shadow-lg z-10 hover:z-20`}
            style={{ top: item.top, left: item.left }}
            title={item.label}
          >
            {item.emoji}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

// ---- HORCRUX COMPONENT ----
const Horcrux = ({ id, onFind, found, className }: { id: string, onFind: (id: string) => void, found: boolean, className: string }) => {
  if (found) return null;
  return (
    <motion.div
      whileHover={{ scale: 1.5, opacity: 1, filter: "drop-shadow(0 0 10px red)" }}
      className={`absolute cursor-pointer opacity-10 transition-all z-50 text-sm ${className}`}
      onClick={() => onFind(id)}
      title="A strange, cursed object..."
    >
      {id === "diary" ? "📓" : id === "ring" ? "💍" : "🐍"}
    </motion.div>
  );
};

// ---- MAIN PAGE ----
export default function Home() {
  const [activeSpell, setActiveSpell] = useState<string | null>(null);
  const [foundHorcruxes, setFoundHorcruxes] = useState<string[]>([]);

  const handleFindHorcrux = (id: string) => {
    if (!foundHorcruxes.includes(id)) {
      setFoundHorcruxes((prev) => [...prev, id]);
    }
  };

  useEffect(() => {
    let buffer = "";
    const handleKeyDown = (e: KeyboardEvent) => {
      buffer += e.key.toLowerCase();
      if (buffer.length > 10) buffer = buffer.slice(-10);

      if (buffer.includes("lumos")) {
        setActiveSpell("lumos");
        buffer = "";
        setTimeout(() => setActiveSpell(null), 3000);
      } else if (buffer.includes("avada")) {
        setActiveSpell("avada");
        buffer = "";
        setTimeout(() => setActiveSpell(null), 3000);
      } else if (buffer.includes("nox")) {
        setActiveSpell("nox");
        buffer = "";
        setTimeout(() => setActiveSpell(null), 3000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <main
      className="relative min-h-screen pb-32 overflow-x-hidden transition-colors duration-500"
      style={{ background: "var(--color-bg)" }}
    >
      <OrbitalCursor />
      <BrainwaveProgress />
      <MagicDuelCanvas />
      <Nav />

      {/* SPELL OVERLAYS */}
      <AnimatePresence>
        {activeSpell === "lumos" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="fixed inset-0 z-[999] pointer-events-none bg-white mix-blend-overlay"
          />
        )}
        {activeSpell === "avada" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="fixed inset-0 z-[999] pointer-events-none bg-green-500 mix-blend-color"
          />
        )}
        {activeSpell === "nox" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="fixed inset-0 z-[999] pointer-events-none bg-black"
          />
        )}
        {foundHorcruxes.length === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black bg-opacity-95 pointer-events-auto"
          >
            <h1 className="text-red-600 text-6xl font-black mb-4 animate-pulse" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 30px red" }}>
              THE DARK LORD RETURNS
            </h1>
            <p className="text-gray-400 text-xl font-mono mb-8">You found all the cursed fragments.</p>
            <button 
              onClick={() => setFoundHorcruxes([])}
              className="px-6 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-black transition-colors rounded-sm font-bold"
            >
              Obliviate
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HORCRUX HUD */}
      {foundHorcruxes.length > 0 && foundHorcruxes.length < 3 && (
        <div className="fixed top-20 right-6 z-50 text-red-500 font-mono text-sm opacity-50">
          Cursed fragments: {foundHorcruxes.length}/3
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-6 pt-24">
        {/* Horcrux 1 */}
        <Horcrux id="diary" onFind={handleFindHorcrux} found={foundHorcruxes.includes("diary")} className="top-32 left-10" />

        {/* background blobs */}
        <div className="blob w-80 h-80 top-10 -left-20 opacity-[0.03]" style={{ background: "var(--color-warm-green)" }} />
        <div className="blob w-96 h-96 bottom-0 right-0 opacity-[0.03]" style={{ background: "var(--color-warm-blue)" }} />
        <div className="blob w-60 h-60 top-1/2 left-1/2 opacity-[0.02]" style={{ background: "var(--color-silver)" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* photo + badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative inline-block mb-8"
          >
            <div
              className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 mx-auto"
              style={{ 
                borderColor: "var(--color-ink)", 
                boxShadow: "0 0 50px rgba(34,197,94,0.3), inset 0 0 30px rgba(59,130,246,0.5)",
                filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))"
              }}
            >
              <img src="/OIP.webp" alt="The Order" className="w-full h-full object-cover" />
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 text-3xl"
              style={{ filter: "drop-shadow(0 0 8px rgba(201,168,76,0.4))" }}
            >
              ⚡
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-3 -left-4 text-2xl"
            >
              ☽
            </motion.div>
          </motion.div>

          {/* greeting */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg mb-3"
            style={{ fontFamily: "var(--font-hand)", color: "var(--color-muted)", fontSize: "1.3rem" }}
          >
            I solemnly swear that I am up to no good...
          </motion.p>

          {/* name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="font-black leading-none mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(4rem, 14vw, 9rem)",
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
              textShadow: "0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(34,197,94,0.1)",
            }}
          >
            Alish
            <span style={{ color: "var(--color-gold)", textShadow: "0 0 20px var(--color-gold)" }}>.</span>
          </motion.h1>

          {/* tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--color-silver)", fontFamily: "var(--font-body)" }}
          >
            I <Mark color="var(--color-warm-green)">craft forbidden spells in code</Mark> and trade in
            rare anime artifacts after midnight. My letter from Hogwarts got lost,{" "}
            <Mark color="var(--color-warm-blue)">so I built my own wizarding world.</Mark>
          </motion.p>

          {/* scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <span style={{ fontFamily: "var(--font-hand)", color: "var(--color-gold-dim)", fontSize: "1.1rem" }}>
              unroll the scroll
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-2xl"
              style={{ color: "var(--color-gold-dim)" }}
            >
              ↓
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== THE SHORT STORY ===== */}
      <section className="relative w-full max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="fun-card p-8 md:p-12 relative overflow-hidden"
        >
          {/* decorative quote mark */}
          <div
            className="absolute -top-4 -left-2 text-[8rem] leading-none pointer-events-none select-none opacity-[0.06]"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            "
          </div>

          <h2
            className="text-3xl md:text-4xl font-black mb-6 animate-text-glow"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            The Classified Dossier
            <span
              style={{ fontFamily: "var(--font-hand)", color: "var(--color-gold)", fontSize: "2rem", marginLeft: "8px" }}
            >
              (ministry-approved)
            </span>
          </h2>

          <div
            className="space-y-5 text-lg leading-relaxed"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
          >
            <p>
              I&apos;m Alish — a <Mark color="var(--color-warm-green)">self-taught wizard of the digital arts</Mark> operating from an undisclosed location in India. My Hogwarts letter never came, so I taught myself the dark arts of web development, reverse-engineered every anime opening I could find, and started building things that probably shouldn&apos;t exist.
            </p>
            <p>
              I care deeply about how things{" "}
              <Mark color="var(--color-warm-green)">feel</Mark> — every scroll, every hover, every transition is a spell. If a page doesn&apos;t give you chills, the incantation is incomplete.
            </p>
            <p>
              When I&apos;m not conjuring code, I&apos;m surviving on <Mark color="var(--color-gold)">midnight Maggi rituals</Mark>, playing <Mark color="var(--color-warm-green)">football</Mark> or <Mark color="var(--color-warm-blue)">cricket</Mark> under suspicious circumstances, or decoding <Mark color="var(--color-warm-purple)">forbidden scientific scrolls</Mark>. My YouTube algorithm? A <Mark color="var(--color-crimson)">cursed pipeline of astrophysics and anime</Mark> that the Ministry would definitely investigate.
            </p>
            <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.25rem", color: "var(--color-gold)" }}>
              Mischief managed. ⚡
            </p>
          </div>
        </motion.div>
      </section>

      {/* ===== BANNER 1 ===== */}
      <Banner
        text="solemnly swearing ⚡ mischief managed ✦ accio code ◈ expecto patronum ☽ nox"
        bg="var(--color-gold)"
        textColor="var(--color-bg)"
      />

      {/* ===== THINGS I DO ===== */}
      <section className="relative w-full max-w-5xl mx-auto px-6 pb-24">
        {/* Horcrux 2 */}
        <Horcrux id="ring" onFind={handleFindHorcrux} found={foundHorcruxes.includes("ring")} className="-top-10 right-20" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-6xl font-black mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Known Abilities
          </h2>
          <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem", color: "var(--color-muted)" }}>
            (O.W.L. results pending)
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FactCard
            emoji="🪄"
            title="Cast spells in code"
            desc="Every line of code is an incantation. I craft interfaces that feel like stepping through Platform 9¾ — impossible until you believe."
            accent="var(--color-gold)"
            rotate={-1.5}
            delay={0}
          />
          <FactCard
            emoji="🧙"
            title="Operate from the shadows"
            desc="Like any good Slytherin, I work best when nobody's watching. My best ideas surface between midnight and dawn, fueled by forbidden knowledge."
            accent="var(--color-emerald)"
            rotate={1}
            delay={0.1}
          />
          <FactCard
            emoji="📜"
            title="Collect forbidden scrolls"
            desc="From obscure anime lore to quantum physics papers — my library would make Dumbledore nervous. Knowledge is the ultimate Horcrux."
            accent="var(--color-crimson)"
            rotate={-1}
            delay={0.2}
          />
          <FactCard
            emoji="⚗️"
            title="Brew potions (in JS)"
            desc="I mix frameworks, libraries, and sheer audacity into concoctions that shouldn't work — but somehow always do. Snape would be proud."
            accent="var(--color-warm-purple)"
            rotate={1.5}
            delay={0.3}
          />
          <FactCard
            emoji="🌙"
            title="Guard the night watch"
            desc="My most powerful spells are cast at 2AM. The Marauder's Map shows me at my desk, surrounded by empty Maggi packets and open tabs."
            accent="var(--color-gold-dim)"
            rotate={-0.5}
            delay={0.4}
          />
          <FactCard
            emoji="⚡"
            title="Deliver the prophecy"
            desc="Every project is a Horcrux — a piece of my soul shipped into the world. I build things that make people stop and whisper 'how?'"
            accent="var(--color-warm-blue)"
            rotate={2}
            delay={0.5}
          />
        </div>
      </section>

      {/* ===== INTERESTS / PILLS ===== */}
      <section className="relative w-full max-w-4xl mx-auto px-6 pb-24">
        {/* Horcrux 3 */}
        <Horcrux id="snake" onFind={handleFindHorcrux} found={foundHorcruxes.includes("snake")} className="-bottom-10 right-1/4" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="fun-card p-8 md:p-12 text-center"
        >
          <h2
            className="text-3xl md:text-5xl font-black mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Known Obsessions
          </h2>
          <p
            className="mb-10"
            style={{ fontFamily: "var(--font-hand)", color: "var(--color-muted)", fontSize: "1.15rem" }}
          >
            mention any of these and I&apos;ll monologue like a villain
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "⚡ Harry Potter Lore", color: "#c9a84c" },
              { label: "🎌 Anime & Manga", color: "#8b0000" },
              { label: "🍜 Midnight Maggi Rituals", color: "#c9a84c" },
              { label: "⚽ Football (Quidditch substitute)", color: "#4a7c59" },
              { label: "🏏 Cricket", color: "#4a6fa5" },
              { label: "📜 Forbidden Scientific Scrolls", color: "#6b4c9a" },
              { label: "🎵 Dark Academia Lo-fi", color: "#7b8794" },
              { label: "🔭 Astrophysics & Dark Matter", color: "#4a6fa5" },
              { label: "🧙 Dumbledore's Army", color: "#4a7c59" },
              { label: "🐍 Slytherin Ambitions", color: "#2d6a4f" },
              { label: "📖 Philosophy of Magic", color: "#c9a84c" },
              { label: "🗡️ Anime Villain Monologues", color: "#8b0000" },
              { label: "☽ Late-night Conspiracies", color: "#6b4c9a" },
              { label: "🪄 Wand Theory", color: "#c9a84c" },
              { label: "📡 Sci-fi & Isekai", color: "#7b8794" },
            ].map((p, i) => (
              <Pill key={i} color={p.color} delay={i * 0.04}>
                {p.label}
              </Pill>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== BANNER 2 ===== */}
      <Banner
        text="I conjure ✦ I curse ✦ I debug ✦ I deploy ✦ Mischief Managed"
        bg="var(--color-crimson)"
        textColor="var(--color-ink)"
      />

      {/* ===== ORIGIN STORY TIMELINE ===== */}
      <section className="relative w-full max-w-3xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2
            className="text-4xl md:text-5xl font-black mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            The Origin Arc
          </h2>
          <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem", color: "var(--color-muted)" }}>
            how the chosen one was forged
          </p>
        </motion.div>

        <div>
          <TimelineEntry
            year="Year One"
            emoji="⚡"
            title="Found a cursed computer"
            desc="Dad's PC. I touched the forbidden device. Immediately broke something. The sorting hat placed me in Slytherin that day."
            delay={0}
            alignRight={false}
          />
          <TimelineEntry
            year="The Awakening"
            emoji="👓"
            title="Discovered anime & the hidden world"
            desc="Stumbled into Naruto, then Death Note, then the entire anime multiverse. My YouTube history became classified information."
            delay={0.1}
            alignRight={true}
          />
          <TimelineEntry
            year="The Unbreakable Vow"
            emoji="🪄"
            title="Cast my first spell (wrote my first code)"
            desc="Made a webpage so ugly it could've been a Howler. But it was mine — and that feeling? Pure Felix Felicis."
            delay={0.2}
            alignRight={false}
          />
          <TimelineEntry
            year="The Forbidden Section"
            emoji="📜"
            title="Went deep into the dark arts"
            desc="React, Three.js, forbidden Stack Overflow threads at 3AM. The restricted section of the internet became my classroom."
            delay={0.3}
            alignRight={true}
          />
          <TimelineEntry
            year="Present Day"
            emoji="💀"
            title="The Dark Lord of Side Projects"
            desc="Every project is a Horcrux — a piece of my soul shipped into the world. The prophecy is being fulfilled, one commit at a time."
            delay={0.4}
            alignRight={false}
          />
        </div>
      </section>

      <DeskSandbox onFindHorcrux={handleFindHorcrux} foundHorcruxes={foundHorcruxes} />

      {/* ===== CONNECT CTA ===== */}
      <section className="relative w-full max-w-4xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="fun-card p-10 md:p-16 text-center relative overflow-hidden"
        >
          {/* blobs inside card */}
          <div className="blob w-48 h-48 -top-8 -right-8 opacity-15" style={{ background: "var(--color-gold)" }} />
          <div className="blob w-40 h-40 -bottom-8 -left-8 opacity-15" style={{ background: "var(--color-crimson)" }} />

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-6"
              style={{ filter: "drop-shadow(0 0 12px rgba(201,168,76,0.3))" }}
            >
              ⚡
            </motion.div>
            <h2
              className="text-4xl md:text-6xl font-black mb-5 leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Send an owl
              <br />
              <span style={{ color: "var(--color-gold)" }}>or a Patronus.</span>
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
            >
              Whether you have a forbidden collaboration in mind, want to debate
              the best anime villain, or just need someone for your Dumbledore&apos;s Army — I&apos;m in.
            </p>

            <motion.a
              href="https://portfolio-galaxy-five.vercel.app/"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-sm font-black text-lg shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--color-gold), #8b7535)",
                color: "var(--color-bg)",
                boxShadow: "0 6px 30px rgba(201,168,76,0.25)",
                fontFamily: "var(--font-body)",
                textDecoration: "none",
              }}
            >
              Accio Connection ✦
            </motion.a>

            <p
              className="mt-6 text-sm"
              style={{ fontFamily: "var(--font-hand)", color: "var(--color-muted)", fontSize: "1rem" }}
            >
              my owl responds quickly. no Howlers, I promise 🦉
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
