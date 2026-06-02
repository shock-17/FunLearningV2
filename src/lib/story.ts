import type { Subject, Difficulty } from '../store/useAppStore';

export interface StoryLevel {
  level: number;
  title: string;
  blurb: string;
  subject: Subject;
  difficulty: Difficulty;
  questionCount: number;
  passPercent: number; // 0..1
}

function mk(subject: Subject, level: number): StoryLevel {
  // Simple ramp: early levels easy & short, later levels harder / timed.
  if (level <= 3) {
    return {
      subject,
      level,
      title: `Level ${level}`,
      blurb: 'Solve the puzzle to move forward!',
      difficulty: 'Easy',
      questionCount: 5 + level * 2,
      passPercent: 0.6,
    };
  }
  if (level <= 6) {
    return {
      subject,
      level,
      title: `Level ${level}`,
      blurb: 'Keep going—your adventure is getting tougher.',
      difficulty: 'Medium',
      questionCount: 10 + (level - 3) * 2,
      passPercent: 0.65,
    };
  }
  return {
    subject,
    level,
    title: `Level ${level}`,
    blurb: 'Final stretch! Focus and answer carefully.',
    difficulty: 'Hard',
    questionCount: 10,
    passPercent: 0.7,
  };
}

export function getStoryLevels(subject: Subject, maxLevels = 10): StoryLevel[] {
  return Array.from({ length: maxLevels }).map((_, idx) => mk(subject, idx + 1));
}

export function computeStars(score: number, total: number, passPercent: number): number {
  if (total <= 0) return 0;
  const pct = score / total;
  if (pct < passPercent) return 0;
  if (pct >= 0.9) return 3;
  if (pct >= 0.75) return 2;
  return 1;
}

