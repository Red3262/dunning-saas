"use client"

import { useState } from "react"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type QuestionType = "multiple-choice" | "text-area" | "slider"

export interface Question {
  id: number
  questionTitle: string
  questionType: QuestionType
  subtitle?: string
  // multiple-choice
  options?: string[]
  multiSelect?: boolean
  // slider
  sliderMin?: number
  sliderMax?: number
  sliderMinLabel?: string
  sliderMaxLabel?: string
}

export type AnswerValue = string | string[] | number

export interface AssessmentAnswers {
  [questionId: number]: AnswerValue
}

// ─────────────────────────────────────────────
// Sample question data (8 of 20 — extend freely)
// ─────────────────────────────────────────────

export const questions: Question[] = [
  {
    id: 0,
    questionTitle: "How do you naturally operate?",
    questionType: "multiple-choice",
    subtitle: "Select all that resonate.",
    multiSelect: true,
    options: [
      "Working Alone",
      "Leading a Team",
      "Building Systems",
      "Solving Problems",
      "Creating Content",
      "Closing Deals",
      "Researching Deeply",
      "Moving Fast",
      "Teaching Others",
      "Designing Experiences",
    ],
  },
  {
    id: 1,
    questionTitle: "You find a locked box in the woods. What is your first thought?",
    questionType: "text-area",
    subtitle: "Answer instinctively. There is no correct response.",
  },
  {
    id: 2,
    questionTitle: "What energizes you most in work?",
    questionType: "multiple-choice",
    subtitle: "Pick up to three.",
    multiSelect: true,
    options: [
      "Autonomy",
      "Recognition",
      "Impact",
      "Mastery",
      "Wealth",
      "Community",
      "Freedom",
      "Legacy",
      "Innovation",
      "Stability",
    ],
  },
  {
    id: 3,
    questionTitle: "Describe a moment when time completely disappeared while you were working.",
    questionType: "text-area",
    subtitle: "Be specific. Generalities reveal nothing.",
  },
  {
    id: 4,
    questionTitle: "What do people consistently come to you for?",
    questionType: "multiple-choice",
    subtitle: "Select all that apply.",
    multiSelect: true,
    options: [
      "Advice",
      "Execution",
      "Clarity",
      "Creative Vision",
      "Technical Help",
      "Emotional Support",
      "Strategy",
      "Connections",
      "Motivation",
      "Problem Solving",
    ],
  },
  {
    id: 5,
    questionTitle: "If money were no object, how long would you work each day?",
    questionType: "slider",
    subtitle: "Drag to your honest answer.",
    sliderMin: 0,
    sliderMax: 12,
    sliderMinLabel: "0 hrs",
    sliderMaxLabel: "12+ hrs",
  },
  {
    id: 6,
    questionTitle: "What is the one sentence that captures your philosophy on work?",
    questionType: "text-area",
    subtitle: "Write the first thing that surfaces.",
  },
  {
    id: 7,
    questionTitle: "Which best describes your relationship with structure?",
    questionType: "multiple-choice",
    subtitle: "Choose one.",
    multiSelect: false,
    options: [
      "I create the systems, then live inside them",
      "I work best with zero constraints",
      "I thrive inside someone else's structure",
      "Structure is the enemy of genius",
      "I need light guardrails",
    ],
  },
]

const TOTAL_STEPS = 20

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface AssessmentFlowProps {
  onComplete: (answers: AssessmentAnswers) => void
  onBack: () => void
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function AssessmentFlow({ onComplete, onBack }: AssessmentFlowProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AssessmentAnswers>({})
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [visible, setVisible] = useState(true)

  const current = questions[step % questions.length]
  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100
  const isLastStep = step === TOTAL_STEPS - 1

  // ── Transitions ──────────────────────────

  function transitionTo(nextStep: number, dir: "forward" | "back") {
    setDirection(dir)
    setVisible(false)
    setTimeout(() => {
      setStep(nextStep)
      setVisible(true)
    }, 380)
  }

  function handleContinue() {
    if (isLastStep) {
      onComplete(answers)
    } else {
      transitionTo(step + 1, "forward")
    }
  }

  function handleBack() {
    if (step === 0) {
      onBack()
    } else {
      transitionTo(step - 1, "back")
    }
  }

  // ── Answer helpers ────────────────────────

  function setAnswer(val: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [step]: val }))
  }

  function toggleMultiOption(opt: string) {
    const existing = (answers[step] as string[]) ?? []
    const next = existing.includes(opt)
      ? existing.filter((v) => v !== opt)
      : [...existing, opt]
    setAnswer(next)
  }

  function selectSingleOption(opt: string) {
    setAnswer([opt])
  }

  // ── Can continue? ─────────────────────────

  const canContinue = (() => {
    const ans = answers[step]
    if (current.questionType === "multiple-choice") {
      return Array.isArray(ans) && ans.length > 0
    }
    if (current.questionType === "text-area") {
      return typeof ans === "string" && ans.trim().length > 0
    }
    if (current.questionType === "slider") {
      return typeof ans === "number"
    }
    return false
  })()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#fcfbf9" }}
    >
      {/* ── Top bar ── */}
      <header
        className="flex items-center gap-6 px-8 py-5 border-b"
        style={{ borderColor: "#e5e5e5", backgroundColor: "#fcfbf9" }}
      >
        {/* Logo */}
        <span
          className="font-serif italic font-bold shrink-0"
          style={{ color: "#171717", fontSize: "1.1rem" }}
        >
          NicheOS
        </span>

        {/* Progress track */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div
            className="relative h-px w-full overflow-hidden"
            style={{ backgroundColor: "#e5e5e5" }}
          >
            {/* Filled portion */}
            <div
              className="absolute left-0 top-0 h-full transition-all ease-premium"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "#4338ca",
                transitionDuration: "700ms",
              }}
            />
            {/* Segment markers */}
            {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-px h-2.5"
                style={{
                  left: `${((i + 1) / TOTAL_STEPS) * 100}%`,
                  backgroundColor:
                    i + 1 <= step ? "#4338ca" : "#e5e5e5",
                  transform: "translateX(-50%) translateY(-50%)",
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span
              className="font-mono uppercase"
              style={{
                color: "#4338ca",
                letterSpacing: "0.38em",
                fontSize: "9px",
              }}
            >
              {step + 1} / {TOTAL_STEPS}
            </span>
            <span
              className="font-mono uppercase"
              style={{
                color: "#d1d5db",
                letterSpacing: "0.35em",
                fontSize: "9px",
              }}
            >
              {Math.round(progressPercent)}% complete
            </span>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={handleBack}
          className="font-mono uppercase shrink-0 transition-colors ease-premium"
          style={{
            color: "#d1d5db",
            letterSpacing: "0.35em",
            fontSize: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#171717")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#d1d5db")
          }
        >
          &larr; Back
        </button>
      </header>

      {/* ── Question container ── */}
      <main
        className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto px-8 py-16 transition-all"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0) scale(1)"
            : direction === "forward"
            ? "translateY(28px) scale(0.99)"
            : "translateY(-28px) scale(0.99)",
          transitionDuration: "380ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Step label */}
        <p
          className="font-mono uppercase mb-5"
          style={{
            color: "#4338ca",
            letterSpacing: "0.45em",
            fontSize: "10px",
          }}
        >
          Question {step + 1}
        </p>

        {/* Title */}
        <h2
          className="font-serif font-bold text-balance mb-4"
          style={{
            color: "#171717",
            fontSize: "clamp(1.9rem, 4vw, 3.2rem)",
            lineHeight: "1.08",
            letterSpacing: "-0.025em",
          }}
        >
          {current.questionTitle}
        </h2>

        {current.subtitle && (
          <p
            className="font-sans mb-10"
            style={{ color: "#9ca3af", fontSize: "15px", lineHeight: "1.55" }}
          >
            {current.subtitle}
          </p>
        )}

        {/* ── MULTIPLE CHOICE ── */}
        {current.questionType === "multiple-choice" && (
          <MultipleChoice
            options={current.options ?? []}
            selected={(answers[step] as string[]) ?? []}
            multiSelect={current.multiSelect ?? true}
            onToggle={toggleMultiOption}
            onSelect={selectSingleOption}
          />
        )}

        {/* ── TEXT AREA ── */}
        {current.questionType === "text-area" && (
          <TextArea
            value={(answers[step] as string) ?? ""}
            onChange={(val) => setAnswer(val)}
          />
        )}

        {/* ── SLIDER ── */}
        {current.questionType === "slider" && (
          <SliderInput
            value={answers[step] as number}
            min={current.sliderMin ?? 0}
            max={current.sliderMax ?? 10}
            minLabel={current.sliderMinLabel ?? ""}
            maxLabel={current.sliderMaxLabel ?? ""}
            onChange={(val) => setAnswer(val)}
          />
        )}
      </main>

      {/* ── Footer nav ── */}
      <footer
        className="flex items-center justify-between px-8 py-5 border-t"
        style={{ borderColor: "#e5e5e5", backgroundColor: "#fcfbf9" }}
      >
        <span
          className="font-mono uppercase"
          style={{
            color: "#d1d5db",
            letterSpacing: "0.38em",
            fontSize: "10px",
          }}
        >
          {isLastStep ? "Final question" : `${TOTAL_STEPS - step - 1} remaining`}
        </span>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="font-mono uppercase rounded-full transition-all ease-premium"
          style={{
            backgroundColor: canContinue ? "#171717" : "#f3f4f6",
            color: canContinue ? "#fcfbf9" : "#d1d5db",
            letterSpacing: "0.28em",
            fontSize: "11px",
            padding: "14px 36px",
            border: "none",
            cursor: canContinue ? "pointer" : "not-allowed",
            transitionDuration: "300ms",
          }}
          onMouseEnter={(e) => {
            if (!canContinue) return
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = "#4338ca"
            el.style.transform = "translateY(-1px)"
          }}
          onMouseLeave={(e) => {
            if (!canContinue) return
            const el = e.currentTarget as HTMLButtonElement
            el.style.backgroundColor = "#171717"
            el.style.transform = "translateY(0)"
          }}
        >
          {isLastStep ? "Reveal My Niche \u2192" : "Continue \u2192"}
        </button>
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function MultipleChoice({
  options,
  selected,
  multiSelect,
  onToggle,
  onSelect,
}: {
  options: string[]
  selected: string[]
  multiSelect: boolean
  onToggle: (opt: string) => void
  onSelect: (opt: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => (multiSelect ? onToggle(opt) : onSelect(opt))}
            className="font-mono uppercase rounded-full border transition-all ease-premium"
            style={{
              fontSize: "10px",
              letterSpacing: "0.32em",
              padding: "12px 22px",
              backgroundColor: active ? "#171717" : "transparent",
              color: active ? "#fcfbf9" : "#9ca3af",
              borderColor: active ? "#171717" : "#e5e5e5",
              cursor: "pointer",
              transitionDuration: "220ms",
            }}
            onMouseEnter={(e) => {
              if (active) return
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = "#9ca3af"
              el.style.color = "#171717"
            }}
            onMouseLeave={(e) => {
              if (active) return
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = "#e5e5e5"
              el.style.color = "#9ca3af"
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function TextArea({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write freely..."
        rows={6}
        className="font-sans w-full border-b bg-transparent outline-none resize-none"
        style={{
          color: "#171717",
          fontSize: "18px",
          lineHeight: "1.65",
          borderColor: "#e5e5e5",
          caretColor: "#4338ca",
          paddingTop: "8px",
          paddingBottom: "16px",
        }}
      />
      {value.length > 0 && (
        <span
          className="font-mono absolute bottom-3 right-0 uppercase"
          style={{
            color: "#d1d5db",
            letterSpacing: "0.3em",
            fontSize: "9px",
          }}
        >
          {value.length} chars
        </span>
      )}
    </div>
  )
}

function SliderInput({
  value,
  min,
  max,
  minLabel,
  maxLabel,
  onChange,
}: {
  value: number | undefined
  min: number
  max: number
  minLabel: string
  maxLabel: string
  onChange: (val: number) => void
}) {
  const displayValue = value ?? min
  const percent = ((displayValue - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-8">
      {/* Value display */}
      <div className="flex flex-col">
        <span
          className="font-serif font-bold"
          style={{
            color: "#171717",
            fontSize: "4rem",
            lineHeight: "1",
            letterSpacing: "-0.04em",
          }}
        >
          {displayValue}
          <span
            className="font-sans font-normal"
            style={{ color: "#9ca3af", fontSize: "1.2rem", marginLeft: "8px" }}
          >
            {maxLabel.replace(/[0-9+]/g, "").trim()}
          </span>
        </span>
      </div>

      {/* Track + thumb */}
      <div className="relative flex flex-col gap-4">
        <div className="relative h-px w-full" style={{ backgroundColor: "#e5e5e5" }}>
          {/* filled */}
          <div
            className="absolute left-0 top-0 h-full transition-all ease-premium"
            style={{
              width: `${percent}%`,
              backgroundColor: "#4338ca",
              transitionDuration: "120ms",
            }}
          />
          {/* thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all ease-premium"
            style={{
              left: `${percent}%`,
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#171717",
              border: "3px solid #fcfbf9",
              boxShadow: "0 0 0 1px #171717",
              transitionDuration: "120ms",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Native input overlaid for interactivity */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={displayValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "24px", top: "-12px" }}
        />

        <div className="flex items-center justify-between">
          <span
            className="font-mono uppercase"
            style={{ color: "#d1d5db", letterSpacing: "0.35em", fontSize: "9px" }}
          >
            {minLabel}
          </span>
          <span
            className="font-mono uppercase"
            style={{ color: "#d1d5db", letterSpacing: "0.35em", fontSize: "9px" }}
          >
            {maxLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
