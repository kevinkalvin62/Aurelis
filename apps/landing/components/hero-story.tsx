"use client";

import { motion, useReducedMotion } from "motion/react";

const thoughts = [
  ["¿Cuál sigue?", "left-[7%] top-[15%] md:left-[9%] md:top-[18%]"],
  ["Creo que esa no era la última.", "right-[5%] top-[27%] text-right md:right-[8%] md:top-[14%]"],
  ["¿Quién tiene la buena?", "left-[8%] top-[42%] md:left-[29%] md:top-[41%]"],
  ["¿La hacemos en Sol?", "right-[7%] top-[54%] text-right md:right-[21%] md:top-[38%]"],
  ["Espérenme tantito…", "bottom-[19%] left-[8%] md:bottom-[21%] md:left-[12%]"],
] as const;

export function HeroStory() {
  const reduceMotion = useReducedMotion();
  return (
    <section
      className="relative min-h-[112svh] overflow-hidden bg-[#090807]"
      aria-labelledby="hero-title"
    >
      <motion.div
        className="hero-room absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0.42, scale: 1.025 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{ duration: 4.5, ease: "easeOut" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,8,7,.3),rgba(17,17,17,.16)_45%,#111_100%)]" />
      <h1 id="hero-title" className="sr-only">
        Antes del primer acorde
      </h1>
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { opacity: [1, 1, 0] }}
        transition={{ duration: 9, times: [0, 0.78, 1], ease: "easeInOut" }}
      >
        {thoughts.map(([thought, position], index) => (
          <motion.p
            key={thought}
            className={`text-cream absolute max-w-[18ch] font-serif text-[clamp(1.25rem,2vw,1.85rem)] leading-snug italic drop-shadow-2xl ${position}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: reduceMotion ? 0 : 0.8 + index * 1.25 }}
          >
            {thought}
          </motion.p>
        ))}
      </motion.div>
      <motion.div
        className="absolute inset-x-5 bottom-[12vh] z-10 mx-auto max-w-6xl text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: reduceMotion ? 0 : 9.2 }}
      >
        <p className="text-cream font-serif text-[clamp(2.7rem,7.4vw,7rem)] leading-[.95] tracking-[-.03em]">
          El ensayo todavía no empieza.
        </p>
        <p className="text-muted mx-auto mt-8 max-w-3xl text-[clamp(1.05rem,2vw,1.55rem)] leading-relaxed">
          Pero la música ya dejó de ser lo importante.
        </p>
      </motion.div>
      <a
        href="#aurelis"
        className="text-muted hover:text-cream focus-visible:outline-accent absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 text-[.68rem] font-semibold tracking-[.22em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-8"
      >
        Seguir <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
