export type QuestionType = 'multiple-choice' | 'text-area' | 'slider';
export type QuestionCategory = 'direct' | 'abstract' | 'stress-test';

export interface Question {
  id: string;
  type: QuestionType;
  category: QuestionCategory;
  questionTitle: string;
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1_abstract_box',
    type: 'text-area',
    category: 'abstract',
    questionTitle: 'You find a heavy, locked box deep in the woods. What is your immediate, unfiltered first thought?'
  },
  {
    id: 'q2_direct_failure',
    type: 'multiple-choice',
    category: 'direct',
    questionTitle: 'When a major project suddenly fails, where does your mind instinctively look first?',
    options: ['The systemic flaws', 'The team\'s execution', 'My own blind spots', 'Unpredictable market forces']
  },
  {
    id: 'q3_stress_chaos',
    type: 'slider',
    category: 'stress-test',
    questionTitle: 'How do you physically and mentally react to sudden, chaotic changes in a rigid plan?',
    minLabel: 'Absolute Paralysis',
    maxLabel: 'Deep Excitement'
  },
  {
    id: 'q4_direct_motivation',
    type: 'multiple-choice',
    category: 'direct',
    questionTitle: 'If you had to choose one primary driver for your ambition, what is it?',
    options: ['Unrestricted Freedom', 'Legacy and Impact', 'Financial Empire', 'Mastery of Craft']
  },
  {
    id: 'q5_abstract_money',
    type: 'text-area',
    category: 'abstract',
    questionTitle: 'A stranger hands you $10,000 in cash with no rules or strings attached. What is the very first thing you do within the next hour?'
  },
  {
    id: 'q6_stress_public',
    type: 'slider',
    category: 'stress-test',
    questionTitle: 'Rate your comfort level with public, spectacular failure in front of your peers.',
    minLabel: 'Terrified',
    maxLabel: 'Indifferent'
  },
  {
    id: 'q7_direct_role',
    type: 'multiple-choice',
    category: 'direct',
    questionTitle: 'In a group of highly competent strangers, what role do you naturally assume?',
    options: ['The Visionary Leader', 'The Silent Observer', 'The Master Strategist', 'The Executioner']
  },
  {
    id: 'q8_abstract_door',
    type: 'text-area',
    category: 'abstract',
    questionTitle: 'You discover a hidden, unmarked door in the house you have lived in for years. Before you open it, what do you assume is behind it?'
  },
  {
    id: 'q9_stress_routine',
    type: 'slider',
    category: 'stress-test',
    questionTitle: 'How long can you tolerate doing the exact same repetitive task before your brain rebels?',
    minLabel: 'Minutes',
    maxLabel: 'Years'
  },
  {
    id: 'q10_direct_game',
    type: 'multiple-choice',
    category: 'direct',
    questionTitle: 'Which game aligns closest with your worldview?',
    options: ['Chess (Pure strategy)', 'Poker (Calculated risk & bluffing)', 'Monopoly (Resource accumulation)', 'D&D (Collaborative storytelling)']
  },
  {
    id: 'q11_abstract_skill',
    type: 'text-area',
    category: 'abstract',
    questionTitle: 'If you could instantly upload one completely useless, non-monetizable skill into your brain, what would it be?'
  },
  {
    id: 'q12_stress_delegation',
    type: 'slider',
    category: 'stress-test',
    questionTitle: 'How comfortable are you handing over 100% control of a project with your name on it to someone else?',
    minLabel: 'Impossible',
    maxLabel: 'Effortless'
  },
  {
    id: 'q13_direct_learning',
    type: 'multiple-choice',
    category: 'direct',
    questionTitle: 'How do you prefer to absorb complex, difficult information?',
    options: ['Reading manuals end-to-end', 'Breaking things and fixing them', 'Watching an expert do it', 'Debating it with a peer']
  },
  {
    id: 'q14_abstract_lie',
    type: 'text-area',
    category: 'abstract',
    questionTitle: 'What is a comforting lie you find yourself occasionally repeating to justify staying in your comfort zone?'
  },
  {
    id: 'q15_stress_micromanagement',
    type: 'slider',
    category: 'stress-test',
    questionTitle: 'What is your internal reaction to being micromanaged by someone less competent than you?',
    minLabel: 'Quiet Resentment',
    maxLabel: 'Vocal Rebellion'
  },
  {
    id: 'q16_direct_todo',
    type: 'multiple-choice',
    category: 'direct',
    questionTitle: 'You wake up to an impossibly large to-do list. How do you attack it?',
    options: ['Do the hardest thing first', 'Knock out small tasks for momentum', 'Delegate everything I can immediately', 'Rewrite the list and prioritize']
  },
  {
    id: 'q17_abstract_room',
    type: 'text-area',
    category: 'abstract',
    questionTitle: 'Describe the physical characteristics of a room where you feel your absolute most powerful and focused.'
  },
  {
    id: 'q18_stress_conflict',
    type: 'slider',
    category: 'stress-test',
    questionTitle: 'How do you handle direct, aggressive confrontation regarding a decision you made?',
    minLabel: 'Avoid & Deflect',
    maxLabel: 'Engage & Escalate'
  },
  {
    id: 'q19_direct_environment',
    type: 'multiple-choice',
    category: 'direct',
    questionTitle: 'What type of working environment drains your energy the fastest?',
    options: ['Rigid corporate bureaucracy', 'Chaotic, structureless startups', 'Total isolation', 'Constant social interaction']
  },
  {
    id: 'q20_abstract_manifesto',
    type: 'text-area',
    category: 'abstract',
    questionTitle: 'Write a definitive, one-sentence manifesto for how you intend to operate for the next five years of your life.'
  }
];