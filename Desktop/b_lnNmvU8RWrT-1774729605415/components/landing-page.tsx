"use client"

import { useEffect, useRef, useState } from "react"

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div style={{ backgroundColor: "#171717" }}>
      {/* ── Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 transition-all"
        style={{
          backgroundColor:
            scrollY > 60 ? "rgba(23,23,23,0.92)" : "transparent",
          backdropFilter: scrollY > 60 ? "blur(12px)" : "none",
          borderBottom:
            scrollY > 60 ? "1px solid rgba(255,255,255,0.06)" : "none",
          transitionDuration: "500ms",
        }}
      >
        <span
          className="font-serif italic font-bold"
          style={{ color: "#fcfbf9", fontSize: "1.15rem", letterSpacing: "0.02em" }}
        >
          NicheOS
        </span>

        <nav className="hidden md:flex items-center gap-10">
          {["Process", "Archetypes", "About"].map((item) => (
            <a
              key={item}
              href="#"
              className="font-mono uppercase"
              style={{
                color: "rgba(252,251,249,0.5)",
                letterSpacing: "0.38em",
                fontSize: "10px",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#fcfbf9")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color =
                  "rgba(252,251,249,0.5)")
              }
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <span
            className="status-dot w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#22c55e" }}
          />
          <span
            className="font-mono uppercase"
            style={{
              color: "rgba(252,251,249,0.35)",
              letterSpacing: "0.35em",
              fontSize: "9px",
            }}
          >
            System Online
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", paddingTop: "80px" }}
      >
        {/* Mesh orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="mesh-orb-1 absolute rounded-full"
            style={{
              width: "80vw",
              height: "80vw",
              background:
                "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.06) 55%, transparent 100%)",
              top: "-25%",
              left: "-20%",
            }}
          />
          <div
            className="mesh-orb-2 absolute rounded-full"
            style={{
              width: "60vw",
              height: "60vw",
              background:
                "radial-gradient(circle, rgba(165,180,252,0.1) 0%, rgba(99,102,241,0.04) 55%, transparent 100%)",
              bottom: "-10%",
              right: "-10%",
            }}
          />
          {/* subtle grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl w-full">
          {/* eyebrow */}
          <div
            className="reveal flex items-center gap-3 mb-10"
            style={{ animationDelay: "0ms" }}
          >
            <span
              style={{
                display: "block",
                width: "28px",
                height: "1px",
                backgroundColor: "#4338ca",
              }}
            />
            <span
              className="font-mono uppercase"
              style={{
                color: "#4338ca",
                letterSpacing: "0.45em",
                fontSize: "10px",
              }}
            >
              Psychographic Intelligence Engine
            </span>
            <span
              style={{
                display: "block",
                width: "28px",
                height: "1px",
                backgroundColor: "#4338ca",
              }}
            />
          </div>

          {/* headline */}
          <h1
            className="reveal font-serif font-bold text-balance"
            style={{
              color: "#fcfbf9",
              fontSize: "clamp(3.2rem, 9.5vw, 9rem)",
              lineHeight: "0.9",
              letterSpacing: "-0.025em",
              animationDelay: "100ms",
            }}
          >
            Discover the Business
            <br />
            <em className="italic" style={{ color: "#a5b4fc" }}>
              You Were Wired
            </em>
            <br />
            to Build.
          </h1>

          {/* sub */}
          <p
            className="reveal font-sans mt-9 max-w-lg"
            style={{
              color: "rgba(252,251,249,0.45)",
              fontSize: "17px",
              lineHeight: "1.65",
              animationDelay: "200ms",
            }}
          >
            Our engine reads the psychological subtext behind your answers —
            not just what you say, but what it{" "}
            <em style={{ color: "rgba(252,251,249,0.7)" }}>reveals</em> — to
            surface the niche you were built for.
          </p>

          {/* CTA group */}
          <div
            className="reveal flex flex-col sm:flex-row items-center gap-4 mt-12"
            style={{ animationDelay: "320ms" }}
          >
            <button
              onClick={onStart}
              className="group relative overflow-hidden font-mono uppercase font-medium rounded-full transition-all ease-premium"
              style={{
                background: "#fcfbf9",
                color: "#171717",
                letterSpacing: "0.28em",
                fontSize: "12px",
                padding: "18px 48px",
                border: "none",
                cursor: "pointer",
                transitionDuration: "400ms",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = "#4338ca"
                el.style.color = "#fcfbf9"
                el.style.transform = "translateY(-2px)"
                el.style.boxShadow = "0 20px 60px rgba(67,56,202,0.45)"
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = "#fcfbf9"
                el.style.color = "#171717"
                el.style.transform = "translateY(0)"
                el.style.boxShadow = "none"
              }}
            >
              Start the Assessment
            </button>

            <button
              className="font-mono uppercase flex items-center gap-3"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(252,251,249,0.35)",
                letterSpacing: "0.35em",
                fontSize: "10px",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(252,251,249,0.7)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(252,251,249,0.35)")
              }
            >
              <span
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
              >
                ↓
              </span>
              See How It Works
            </button>
          </div>

          {/* trust strip */}
          <div
            className="reveal flex items-center gap-8 mt-16 flex-wrap justify-center"
            style={{ animationDelay: "440ms" }}
          >
            {[
              { value: "20", label: "Deep Questions" },
              { value: "7", label: "Archetypes" },
              { value: "3 min", label: "Average Time" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span
                  className="font-serif font-bold"
                  style={{
                    color: "#fcfbf9",
                    fontSize: "2rem",
                    lineHeight: "1",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="font-mono uppercase mt-1"
                  style={{
                    color: "rgba(252,251,249,0.3)",
                    letterSpacing: "0.38em",
                    fontSize: "9px",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: scrollY < 40 ? 1 : 0, transition: "opacity 400ms" }}
        >
          <div
            style={{
              width: "1px",
              height: "48px",
              background:
                "linear-gradient(to bottom, transparent, rgba(252,251,249,0.3))",
            }}
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ backgroundColor: "#fcfbf9", padding: "8rem 0" }}>
        <div className="max-w-6xl mx-auto px-8">
          {/* section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-8">
            <h2
              className="font-serif font-bold"
              style={{
                color: "#171717",
                fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
                lineHeight: "0.95",
                letterSpacing: "-0.025em",
              }}
            >
              How the
              <br />
              <em className="italic" style={{ color: "#4338ca" }}>
                Engine Works
              </em>
            </h2>
            <p
              className="font-sans max-w-xs"
              style={{ color: "#9ca3af", fontSize: "15px", lineHeight: "1.6" }}
            >
              Three precision phases. One definitive revelation about who you
              are as a business operator.
            </p>
          </div>

          {/* steps grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ border: "1px solid #e5e5e5" }}
          >
            {steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center justify-between mt-12 flex-wrap gap-6">
            <p
              className="font-mono uppercase"
              style={{
                color: "#9ca3af",
                letterSpacing: "0.4em",
                fontSize: "10px",
              }}
            >
              Takes 3 minutes &mdash; Lasts a lifetime
            </p>
            <button
              onClick={onStart}
              className="font-mono uppercase rounded-full transition-all ease-premium"
              style={{
                backgroundColor: "#171717",
                color: "#fcfbf9",
                letterSpacing: "0.28em",
                fontSize: "11px",
                padding: "14px 36px",
                border: "none",
                cursor: "pointer",
                transitionDuration: "350ms",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.backgroundColor = "#4338ca"
                el.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.backgroundColor = "#171717"
                el.style.transform = "translateY(0)"
              }}
            >
              Begin Assessment &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ── Archetype Ticker ── */}
      <section
        style={{
          backgroundColor: "#fcfbf9",
          borderTop: "1px solid #e5e5e5",
          borderBottom: "1px solid #e5e5e5",
          padding: "2.5rem 0",
          overflow: "hidden",
        }}
      >
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center gap-10 overflow-x-auto no-scrollbar">
            <span
              className="font-mono uppercase shrink-0"
              style={{
                color: "#d1d5db",
                letterSpacing: "0.4em",
                fontSize: "9px",
                paddingRight: "1rem",
                borderRight: "1px solid #e5e5e5",
              }}
            >
              Archetypes
            </span>
            {archetypes.map((a, i) => (
              <span
                key={i}
                className="font-serif italic shrink-0 font-bold"
                style={{
                  color: i % 3 === 1 ? "#4338ca" : "#171717",
                  fontSize: "clamp(1.2rem, 2vw, 1.75rem)",
                  letterSpacing: "-0.01em",
                  opacity: i % 3 === 2 ? 0.3 : 1,
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative"
        style={{ backgroundColor: "#171717", padding: "7rem 0 4rem" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(67,56,202,0.14) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-8">
          <blockquote
            className="font-serif font-bold text-balance mb-20"
            style={{
              color: "#fcfbf9",
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              lineHeight: "1.08",
              letterSpacing: "-0.025em",
              maxWidth: "780px",
            }}
          >
            &ldquo;The right niche isn&apos;t found.{" "}
            <em className="italic" style={{ color: "#a5b4fc" }}>
              It&apos;s revealed.
            </em>
            &rdquo;
          </blockquote>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t"
            style={{ borderColor: "rgba(252,251,249,0.08)" }}
          >
            {[
              { label: "Location", lines: ["Remote-first", "Global Distribution"] },
              { label: "Contact", lines: ["hello@nicheos.com", "Support portal"] },
              { label: "Links", lines: ["Privacy Policy", "Terms of Service"] },
            ].map((col) => (
              <div key={col.label}>
                <p
                  className="font-mono uppercase mb-5"
                  style={{ color: "#4338ca", letterSpacing: "0.4em", fontSize: "9px" }}
                >
                  {col.label}
                </p>
                {col.lines.map((line) => (
                  <p
                    key={line}
                    className="font-sans"
                    style={{
                      color: "rgba(252,251,249,0.4)",
                      fontSize: "14px",
                      lineHeight: "2",
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <p
            className="font-mono mt-14"
            style={{
              color: "rgba(252,251,249,0.15)",
              letterSpacing: "0.4em",
              fontSize: "9px",
            }}
          >
            &copy; 2026 NICHEOS &mdash; ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  )
}

function StepCard({
  step,
  index,
}: {
  step: { num: string; title: string; desc: string }
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative p-10 transition-all ease-premium"
      style={{
        backgroundColor: hovered ? "#171717" : "#fcfbf9",
        borderRight: index < 2 ? "1px solid #e5e5e5" : "none",
        transitionDuration: "500ms",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p
        className="font-mono uppercase mb-10"
        style={{
          color: hovered ? "#4338ca" : "#d1d5db",
          letterSpacing: "0.45em",
          fontSize: "10px",
          transitionDuration: "500ms",
        }}
      >
        {step.num}
      </p>
      <h3
        className="font-serif font-bold mb-4"
        style={{
          color: hovered ? "#fcfbf9" : "#171717",
          fontSize: "1.6rem",
          lineHeight: "1.15",
          letterSpacing: "-0.02em",
          transitionDuration: "500ms",
        }}
      >
        {step.title}
      </h3>
      <p
        className="font-sans"
        style={{
          color: hovered ? "rgba(252,251,249,0.5)" : "#9ca3af",
          fontSize: "15px",
          lineHeight: "1.65",
          transitionDuration: "500ms",
        }}
      >
        {step.desc}
      </p>

      {hovered && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ backgroundColor: "#4338ca" }}
        />
      )}
    </div>
  )
}

const steps = [
  {
    num: "01",
    title: "The Interrogation",
    desc: "Answer 20 direct, abstract, and unconventional questions — designed not to gather data, but to reveal instinct.",
  },
  {
    num: "02",
    title: "The AI Analysis",
    desc: "Our engine reads between the lines. Every answer carries subtext: personality, drive, and hidden strengths.",
  },
  {
    num: "03",
    title: "The Revelation",
    desc: "Receive your Business Archetype, core niche, psychological edge, and a 3-step launch roadmap.",
  },
]

const archetypes = [
  "The Sovereign Builder",
  "The Silent Strategist",
  "The Alchemist",
  "The Systems Architect",
  "The Storyteller",
  "The Disruptor",
  "The Connector",
]
