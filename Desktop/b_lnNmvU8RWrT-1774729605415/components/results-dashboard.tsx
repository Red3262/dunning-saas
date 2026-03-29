"use client"

import { useEffect, useState } from "react"
import type { AssessmentAnswers } from "./assessment-flow"

interface ResultsDashboardProps {
  answers: AssessmentAnswers
  onRestart: () => void
}

function deriveResult(answers: AssessmentAnswers) {
  const allTags = [
    ...((answers[0] as string[]) || []),
    ...((answers[2] as string[]) || []),
    ...((answers[4] as string[]) || []),
  ]

  const archetypes = [
    {
      name: "The Systems Architect",
      italic: "Systems",
      niche: "Operational consulting, SaaS tools, process automation businesses",
      strengths: ["Analytical precision", "Long-horizon thinking", "Zero-tolerance for inefficiency"],
      vulnerabilities: ["Paralysis by perfection", "Avoidance of ambiguity", "Under-marketing your work"],
      steps: [
        "Map the one system others in your industry consistently get wrong",
        "Build a minimal documented solution (a playbook or lightweight tool)",
        "Sell the outcome — not the process — to your first 5 clients",
      ],
      tags: ["Building Systems", "Solving Problems", "Researching Deeply"],
    },
    {
      name: "The Sovereign Builder",
      italic: "Sovereign",
      niche: "High-ticket coaching, brand consulting, personal development products",
      strengths: ["Magnetic authority", "Decisive conviction", "Ability to hold vision under pressure"],
      vulnerabilities: ["Difficulty delegating", "Conflating identity with business", "Resistance to feedback"],
      steps: [
        "Define the single transformation you create for clients in one sharp sentence",
        "Create one high-value offer priced above the market default",
        "Build one content channel that demonstrates your worldview weekly",
      ],
      tags: ["Leading a Team", "Autonomy", "Legacy", "Advice"],
    },
    {
      name: "The Alchemist",
      italic: "Alchemist",
      niche: "Creative agencies, brand strategy, content IP, transformational coaching",
      strengths: ["Pattern recognition across domains", "Synthesis of complex ideas", "Contagious creative energy"],
      vulnerabilities: ["Scattered focus", "Undervaluing your own output", "Chasing new ideas before finishing current ones"],
      steps: [
        "Pick one medium and one audience — eliminate all others for 90 days",
        "Document your creative process and turn it into a teachable framework",
        "Launch a premium product that packages your perspective, not just your skill",
      ],
      tags: ["Creating Content", "Innovation", "Clarity", "Creative Vision"],
    },
    {
      name: "The Connector",
      italic: "Connector",
      niche: "Community platforms, talent networks, event businesses, partnership consulting",
      strengths: ["Social fluency", "Institutional memory of relationships", "Ability to create belonging"],
      vulnerabilities: ["Over-giving without boundaries", "Difficulty monetizing connection", "Conflict avoidance"],
      steps: [
        "Identify the one community that lacks a trusted hub — and needs one",
        "Host a small high-signal gathering (digital or physical) around a specific theme",
        "Build a paid tier around access, curation, or introductions",
      ],
      tags: ["Working Alone", "Community", "Connections", "Emotional Support"],
    },
  ]

  let best = archetypes[0]
  let bestScore = -1

  for (const arch of archetypes) {
    const score = arch.tags.filter((t) => allTags.includes(t)).length
    if (score > bestScore) {
      bestScore = score
      best = arch
    }
  }

  return best
}

export function ResultsDashboard({ answers, onRestart }: ResultsDashboardProps) {
  const result = deriveResult(answers)
  const [visible, setVisible] = useState(false)
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>([false, false, false])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  function toggleStep(i: number) {
    setCheckedSteps((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#171717" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-6 border-b"
        style={{ borderColor: "rgba(252,251,249,0.08)" }}
      >
        <span
          className="font-serif italic font-bold"
          style={{ color: "#fcfbf9", fontSize: "1.1rem" }}
        >
          NicheOS
        </span>
        <button
          onClick={onRestart}
          className="font-mono uppercase transition-colors ease-premium"
          style={{
            color: "#6b7280",
            letterSpacing: "0.35em",
            fontSize: "11px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#fcfbf9")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#6b7280")
          }
        >
          &larr; Restart
        </button>
      </header>

      <div
        className="max-w-5xl mx-auto px-8 pb-24 transition-all ease-premium"
        style={{
          paddingTop: "5rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transitionDuration: "900ms",
        }}
      >
        {/* Archetype Banner */}
        <div className="mb-16">
          <p
            className="font-mono uppercase mb-5"
            style={{
              color: "#4338ca",
              letterSpacing: "0.5em",
              fontSize: "11px",
            }}
          >
            Your Archetype
          </p>

          <h1
            className="font-serif font-bold text-balance"
            style={{
              color: "#fcfbf9",
              fontSize: "clamp(3rem, 9vw, 7.5rem)",
              lineHeight: "0.9",
              letterSpacing: "-0.03em",
            }}
          >
            {result.name.split(result.italic)[0]}
            <em className="italic" style={{ color: "#a5b4fc" }}>
              {result.italic}
            </em>
            {result.name.split(result.italic)[1]}
          </h1>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px mb-16"
          style={{ backgroundColor: "rgba(252,251,249,0.08)" }}
        />

        {/* Grid: Niche + Strengths + Vulnerabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-px" style={{ backgroundColor: "rgba(252,251,249,0.08)" }}>
          <InfoCell
            label="Core Niche"
            content={result.niche}
            accent="#a5b4fc"
          />
          <InfoCell
            label="Psychological Strengths"
            content={null}
            accent="#6ee7b7"
          >
            <ul className="flex flex-col gap-2 mt-2">
              {result.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: "#6ee7b7" }}
                  />
                  <span
                    className="font-sans"
                    style={{
                      color: "rgba(252,251,249,0.75)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </InfoCell>
          <InfoCell
            label="Hidden Vulnerabilities"
            content={null}
            accent="#fca5a5"
          >
            <ul className="flex flex-col gap-2 mt-2">
              {result.vulnerabilities.map((v) => (
                <li key={v} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: "#fca5a5" }}
                  />
                  <span
                    className="font-sans"
                    style={{
                      color: "rgba(252,251,249,0.75)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {v}
                  </span>
                </li>
              ))}
            </ul>
          </InfoCell>
        </div>

        {/* Launch Checklist */}
        <div
          className="mt-16 border"
          style={{ borderColor: "rgba(252,251,249,0.08)" }}
        >
          <div
            className="px-8 py-6 border-b"
            style={{ borderColor: "rgba(252,251,249,0.08)" }}
          >
            <p
              className="font-mono uppercase"
              style={{
                color: "#4338ca",
                letterSpacing: "0.45em",
                fontSize: "11px",
              }}
            >
              Your 3-Step Launch Protocol
            </p>
          </div>

          {result.steps.map((step, i) => (
            <button
              key={i}
              onClick={() => toggleStep(i)}
              className="w-full text-left flex items-start gap-6 px-8 py-7 border-b transition-all ease-premium group"
              style={{
                borderColor: "rgba(252,251,249,0.06)",
                backgroundColor: checkedSteps[i]
                  ? "rgba(67,56,202,0.08)"
                  : "transparent",
                transitionDuration: "300ms",
                cursor: "pointer",
              }}
            >
              {/* Checkbox */}
              <div
                className="mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ease-premium"
                style={{
                  borderColor: checkedSteps[i] ? "#4338ca" : "rgba(252,251,249,0.2)",
                  backgroundColor: checkedSteps[i] ? "#4338ca" : "transparent",
                  transitionDuration: "300ms",
                }}
              >
                {checkedSteps[i] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L4 7L9 1"
                      stroke="#fcfbf9"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <p
                  className="font-mono uppercase mb-1"
                  style={{
                    color: "#4338ca",
                    letterSpacing: "0.4em",
                    fontSize: "10px",
                  }}
                >
                  Step {i + 1}
                </p>
                <p
                  className="font-serif"
                  style={{
                    color: checkedSteps[i]
                      ? "rgba(252,251,249,0.35)"
                      : "#fcfbf9",
                    fontSize: "1.15rem",
                    lineHeight: "1.5",
                    textDecoration: checkedSteps[i] ? "line-through" : "none",
                    transitionDuration: "300ms",
                  }}
                >
                  {step}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Restart CTA */}
        <div className="mt-14 flex items-center justify-between flex-wrap gap-6">
          <p
            className="font-sans"
            style={{ color: "rgba(252,251,249,0.35)", fontSize: "14px" }}
          >
            Results are generated from psychographic pattern matching, not generic advice.
          </p>
          <button
            onClick={onRestart}
            className="font-mono uppercase px-7 py-3 rounded-full border transition-all ease-premium"
            style={{
              color: "#fcfbf9",
              borderColor: "rgba(252,251,249,0.2)",
              letterSpacing: "0.3em",
              fontSize: "11px",
              background: "none",
              cursor: "pointer",
              transitionDuration: "300ms",
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                "#4338ca"
              ;(e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(252,251,249,0.2)"
              ;(e.currentTarget as HTMLButtonElement).style.color = "#fcfbf9"
            }}
          >
            Take It Again
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoCell({
  label,
  content,
  accent,
  children,
}: {
  label: string
  content: string | null
  accent: string
  children?: React.ReactNode
}) {
  return (
    <div
      className="px-8 py-8"
      style={{ backgroundColor: "rgba(252,251,249,0.03)" }}
    >
      <p
        className="font-mono uppercase mb-4"
        style={{
          color: accent,
          letterSpacing: "0.4em",
          fontSize: "10px",
          opacity: 0.8,
        }}
      >
        {label}
      </p>
      {content && (
        <p
          className="font-sans"
          style={{
            color: "rgba(252,251,249,0.75)",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          {content}
        </p>
      )}
      {children}
    </div>
  )
}
