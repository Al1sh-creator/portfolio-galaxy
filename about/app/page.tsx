"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

// ---- EMOJI CONFETTI ----
const CONFETTI = ["✦", "✧", "❋", "◈", "⬡", "◇", "✿", "❀", "⊹", "✺"];
const FloatingDots = () => {
  const [dots, setDots] = useState<any[]>([]);
  useEffect(() => {
    setDots(
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 12 + 6,
        color: [
          "var(--color-warm-yellow)",
          "var(--color-warm-pink)",
          "var(--color-warm-green)",
          "var(--color-warm-blue)",
          "var(--color-warm-orange)",
          "var(--color-warm-purple)",
        ][Math.floor(Math.random() * 6)],
        dur: Math.random() * 4 + 4,
        del: Math.random() * 4,
        char: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
      }))
    );
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute select-none font-bold opacity-20"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: d.size,
            color: d.color,
            animationName: "float-slow",
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.del}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        >
          {d.char}
        </span>
      ))}
    </div>
  );
};

// ---- STICKY HEADER ----
const Nav = () => (
  <nav className="fixed top-0 w-full z-50 px-6 py-4 mix-blend-multiply pointer-events-none">
    <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-auto">
      <a
        href="https://portfolio-galaxy-five.vercel.app/"
        className="group flex items-center gap-2 font-bold text-sm tracking-wide text-[var(--color-muted)] hover:text-[var(--color-warm-orange)] transition-colors"
        style={{ fontFamily: "var(--font-hand)", fontSize: "1.1rem" }}
      >
        <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
        back to the galaxy
      </a>
      <span
        className="text-xs text-[var(--color-muted)] opacity-60"
        style={{ fontFamily: "var(--font-hand)", fontSize: "1rem" }}
      >
        currently vibing ☀️
      </span>
    </div>
  </nav>
);

// ---- HIGHLIGHT MARKER ----
const Mark = ({ children, color = "#facc15" }: { children: React.ReactNode; color?: string }) => (
  <span
    style={{
      background: `linear-gradient(120deg, ${color}33 0%, ${color}88 100%)`,
      paddingInline: "4px",
      borderRadius: "4px",
    }}
  >
    {children}
  </span>
);

// ---- FACT CARD ----
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
    whileHover={{ y: -6, rotate: rotate * 0.5, scale: 1.02 }}
    className="fun-card p-6 md:p-8 flex flex-col gap-3 cursor-default select-none"
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
      style={{ background: accent + "22" }}
    >
      {emoji}
    </div>
    <h3
      className="text-xl font-black leading-tight"
      style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
    >
      {title}
    </h3>
    <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
      {desc}
    </p>
    <div
      className="w-8 h-1 rounded-full mt-auto"
      style={{ background: accent }}
    />
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
}: {
  year: string;
  title: string;
  desc: string;
  emoji: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-6 group"
  >
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-110 transition-transform"
        style={{ background: "var(--color-warm-yellow)", color: "var(--color-ink)" }}
      >
        {emoji}
      </div>
      <div className="w-0.5 flex-1 rounded-full" style={{ background: "rgba(26,18,8,0.08)", minHeight: "40px" }} />
    </div>
    <div className="pb-10">
      <span
        className="text-xs font-bold tracking-widest uppercase mb-1 block"
        style={{ color: "var(--color-warm-orange)", fontFamily: "var(--font-body)" }}
      >
        {year}
      </span>
      <h3
        className="text-xl font-black mb-1"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {desc}
      </p>
    </div>
  </motion.div>
);

// ---- MAIN PAGE ----
export default function Home() {
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
      className="relative min-h-screen pb-32 overflow-x-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      <FloatingDots />
      <Nav />

      {/* ===== HERO ===== */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-6 pt-24">
        {/* background blobs */}
        <div className="blob w-80 h-80 top-10 -left-20 opacity-40" style={{ background: "var(--color-warm-pink)" }} />
        <div className="blob w-96 h-96 bottom-0 right-0 opacity-30" style={{ background: "var(--color-warm-blue)" }} />
        <div className="blob w-60 h-60 top-1/2 left-1/2 opacity-20" style={{ background: "var(--color-warm-yellow)" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* photo + badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative inline-block mb-8"
          >
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 mx-auto"
              style={{ borderColor: "var(--color-warm-orange)", boxShadow: "6px 8px 0 rgba(249,115,22,0.2)" }}
            >
              <img src="/hero.png" alt="Alish" className="w-full h-full object-cover scale-125 origin-top" />
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 text-3xl"
            >
              👋
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-3 -left-4 text-2xl"
            >
              ✨
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
            hey there, I'm
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
            }}
          >
            Alish
            <span style={{ color: "var(--color-warm-orange)" }}>.</span>
          </motion.h1>

          {/* tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
          >
            I <Mark color="#f97316">build things for the internet</Mark> and get way too excited
            about ideas at 2am. Sometimes they're brilliant. Sometimes they're not.{" "}
            <Mark color="#facc15">Always worth trying.</Mark>
          </motion.p>

          {/* scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex flex-col items-center gap-2"
          >
            <span style={{ fontFamily: "var(--font-hand)", color: "var(--color-muted)", fontSize: "1.1rem" }}>
              scroll to know me better
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-2xl"
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
            className="text-3xl md:text-4xl font-black mb-6"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            The short story
            <span
              style={{ fontFamily: "var(--font-hand)", color: "var(--color-warm-orange)", fontSize: "2rem", marginLeft: "8px" }}
            >
              (the fun version)
            </span>
          </h2>

          <div
            className="space-y-5 text-lg leading-relaxed"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
          >
            <p>
              I'm Alish — a <Mark color="#f97316">creator, tinkerer, and enthusiastic overthinker</Mark> from
              India. I got into building things for the web because I couldn't find what I
              imagined, so I just… made it myself. Turns out that's a pretty good superpower.
            </p>
            <p>
              I care a lot about how things{" "}
              <Mark color="#86efac">feel</Mark> — not just how they work. That push you get when
              a button presses satisfyingly, the way a page should breathe as you scroll — I
              obsess over all of it.
            </p>
            <p>
              Outside of screens I'm probably reading something dense, down a YouTube rabbit
              hole about{" "}
              <Mark color="#facc15">orbital mechanics or anime theory</Mark>, or attempting
              to understand the universe one Wikipedia article at a time.
            </p>
            <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.25rem", color: "var(--color-ink)" }}>
              Basically: curious by nature, creative by choice, and caffeinated by necessity. ☕
            </p>
          </div>
        </motion.div>
      </section>

      {/* ===== BANNER 1 ===== */}
      <Banner
        text="currently obsessing over — space   good coffee   clean interfaces   rabbit holes"
        bg="var(--color-warm-yellow)"
        textColor="var(--color-ink)"
      />

      {/* ===== THINGS I DO ===== */}
      <section className="relative w-full max-w-5xl mx-auto px-6 pb-24">
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
            What I actually do
          </h2>
          <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem", color: "var(--color-muted)" }}>
            (without the boring buzzwords)
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FactCard
            emoji="🎨"
            title="Make things look alive"
            desc="I care deeply about motion, rhythm, and the feeling a screen gives you. If it doesn't feel magical, I'm not done yet."
            accent="var(--color-warm-pink)"
            rotate={-1.5}
            delay={0}
          />
          <FactCard
            emoji="🧠"
            title="Connect the dots"
            desc="I have a weird brain that links ideas across different worlds — whether that's physics, design, storytelling, or software."
            accent="var(--color-warm-purple)"
            rotate={1}
            delay={0.1}
          />
          <FactCard
            emoji="🛠️"
            title="Build from scratch"
            desc="Templates are fine but starting from a blank canvas is where the magic happens. I love building things that didn't exist before."
            accent="var(--color-warm-orange)"
            rotate={-1}
            delay={0.2}
          />
          <FactCard
            emoji="📚"
            title="Read & absorb"
            desc="From philosophy to astrophysics to UX theory — I'm always reading something. Knowledge is the most fun thing to collect."
            accent="var(--color-warm-blue)"
            rotate={1.5}
            delay={0.3}
          />
          <FactCard
            emoji="🌙"
            title="Think at 2am"
            desc="Some of my best ideas come at completely unreasonable hours. I've learned to keep notes because morning-me forgets everything."
            accent="var(--color-warm-yellow)"
            rotate={-0.5}
            delay={0.4}
          />
          <FactCard
            emoji="🚀"
            title="Ship things"
            desc="I believe a good idea sitting in Notion is just a sad idea. If I'm excited about something, I build it and put it out there."
            accent="var(--color-warm-green)"
            rotate={2}
            delay={0.5}
          />
        </div>
      </section>

      {/* ===== INTERESTS / PILLS ===== */}
      <section className="relative w-full max-w-4xl mx-auto px-6 pb-24">
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
            Things I love
          </h2>
          <p
            className="mb-10"
            style={{ fontFamily: "var(--font-hand)", color: "var(--color-muted)", fontSize: "1.15rem" }}
          >
            ask me about any of these and I'll talk for hours
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "🌌 Space & Astrophysics", color: "#93c5fd" },
              { label: "🎌 Anime & Manga", color: "#f9a8d4" },
              { label: "☕ Coffee rituals", color: "#f97316" },
              { label: "🎵 Indie & Lo-fi", color: "#c4b5fd" },
              { label: "🔭 Orbital Mechanics", color: "#86efac" },
              { label: "📖 Philosophy", color: "#facc15" },
              { label: "🎮 Game Design Theory", color: "#fca5a5" },
              { label: "🌿 Slow mornings", color: "#86efac" },
              { label: "🧩 Puzzles & Patterns", color: "#93c5fd" },
              { label: "🎨 Type & Color Theory", color: "#f9a8d4" },
              { label: "🌙 Late-night ideas", color: "#c4b5fd" },
              { label: "📡 Science fiction", color: "#fca5a5" },
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
        text="I make stuff ✦ I break stuff ✦ I fix stuff ✦ I ship stuff ✦ I repeat"
        bg="var(--color-warm-coral)"
        textColor="#fff"
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
            How I got here
          </h2>
          <p style={{ fontFamily: "var(--font-hand)", fontSize: "1.2rem", color: "var(--color-muted)" }}>
            my (very honest) origin story
          </p>
        </motion.div>

        <div>
          <TimelineEntry
            year="Age 10"
            emoji="🖥️"
            title="First encounter with a computer"
            desc="Dad let me use his PC. I immediately broke the screensaver settings. Was very proud of this achievement."
            delay={0}
          />
          <TimelineEntry
            year="A bit later"
            emoji="🎮"
            title="Became obsessed with 'how things work'"
            desc="Spent more time in game menus than actually playing. Always curious about what was happening behind the scenes."
            delay={0.1}
          />
          <TimelineEntry
            year="The big click"
            emoji="💡"
            title="Discovered I could build things"
            desc="Made my first clumsy webpage. It was terrible. But it was mine — and that feeling was completely addictive."
            delay={0.2}
          />
          <TimelineEntry
            year="Down the rabbit hole"
            emoji="🌀"
            title="Learned by doing (and by breaking things)"
            desc="Tutorials, YouTube, trial and error, Stack Overflow at midnight. The classic curriculum of every self-taught creator."
            delay={0.3}
          />
          <TimelineEntry
            year="Now"
            emoji="🌟"
            title="Building things I'm actually proud of"
            desc="Every project teaches me something. The goal is always to make something that someone else looks at and says — wait, how did they do that?"
            delay={0.4}
          />
        </div>
      </section>

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
          <div className="blob w-48 h-48 -top-8 -right-8 opacity-30" style={{ background: "var(--color-warm-yellow)" }} />
          <div className="blob w-40 h-40 -bottom-8 -left-8 opacity-30" style={{ background: "var(--color-warm-pink)" }} />

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-6"
            >
              👾
            </motion.div>
            <h2
              className="text-4xl md:text-6xl font-black mb-5 leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Let's make something
              <br />
              <span style={{ color: "var(--color-warm-orange)" }}>worth talking about.</span>
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
            >
              Whether you have a wild idea, a collaboration in mind, or just want to talk about
              the best anime of the last decade — my door is open.
            </p>

            <motion.a
              href="https://portfolio-galaxy-five.vercel.app/"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-black text-lg text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--color-warm-orange), #fb923c)",
                boxShadow: "0 6px 30px rgba(249,115,22,0.35)",
                fontFamily: "var(--font-body)",
                textDecoration: "none",
              }}
            >
              Say hello ✦
            </motion.a>

            <p
              className="mt-6 text-sm"
              style={{ fontFamily: "var(--font-hand)", color: "var(--color-muted)", fontSize: "1rem" }}
            >
              I respond quickly and I'm genuinely excited to hear from you 🙂
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
