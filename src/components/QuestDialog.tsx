import { useEffect, useMemo, useState } from 'react';
import { Subject, Difficulty } from '../store/useAppStore';
import { getQuestions, Question } from '../data/questions';
import { playSound } from '../lib/audio';
import { Card } from './Card';
import { Button } from './Button';
import { XCircle, MessageCircle, CheckCircle2, XCircle as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'intro' | 'questions' | 'result';

export function QuestDialog({
  subject,
  difficulty = 'Easy',
  questionCount = 7,
  passPercent = 0.6,
  onClose,
  onComplete,
}: {
  subject: Subject;
  difficulty?: Difficulty;
  questionCount?: number;
  passPercent?: number;
  onClose: () => void;
  onComplete: (args: { score: number; total: number; passed: boolean }) => void;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const questions = useMemo(() => getQuestions(subject, difficulty, questionCount), [subject, difficulty, questionCount]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setPhase('intro');
    setIdx(0);
    setSelected(null);
    setScore(0);
    setIsCorrect(null);
  }, [subject, difficulty, questionCount]);

  const current: Question | null = questions[idx] ?? null;
  const total = questions.length;

  const handlePick = (opt: string) => {
    if (!current || selected) return;
    const ok = opt === current.correctAnswer;
    setSelected(opt);
    setIsCorrect(ok);
    if (ok) setScore((s) => s + 1);
    playSound(ok ? 'success' : 'error');
  };

  const next = () => {
    setSelected(null);
    setIsCorrect(null);
    if (idx >= total - 1) {
      setPhase('result');
    } else {
      setIdx((i) => i + 1);
    }
  };

  const passed = total > 0 ? score / total >= passPercent : false;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0ddf5] bg-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#e0ddf5] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#5c4ce5]" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">NPC Quest</div>
                <div className="text-xl font-extrabold text-slate-800">{subject} Challenge</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
              <XCircle className="w-6 h-6" />
            </Button>
          </div>

          <div className="px-6 py-6 bg-white">
            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div key="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h3 className="text-2xl font-extrabold text-[#5c4ce5] mb-2">Quest: Help the NPC!</h3>
                  <p className="text-slate-600 font-medium mb-6">
                    Answer {total} questions. Pass score: {Math.round(passPercent * 100)}%+
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setPhase('questions')} className="flex-1">
                      Start Quest
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Maybe later
                    </Button>
                  </div>
                </motion.div>
              )}

              {phase === 'questions' && current && (
                <motion.div key="q" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-slate-500">
                      Question {idx + 1} / {total}
                    </div>
                    <div className="text-sm font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                      Score: {score}
                    </div>
                  </div>

                  <div className="bg-[#f8f7ff] border border-[#e0ddf5] rounded-3xl p-6 mb-5">
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">{current.text}</div>
                  </div>

                  <div className="grid gap-3">
                    {current.options.map((opt) => {
                      const isPicked = selected === opt;
                      const isAns = opt === current.correctAnswer;
                      let cls = 'bg-white border-2 border-[#e0ddf5] hover:border-[#5c4ce5] text-slate-800';
                      if (selected) {
                        if (isAns) cls = 'bg-green-500 border-green-600 text-white';
                        else if (isPicked) cls = 'bg-red-500 border-red-600 text-white';
                        else cls = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                      }
                      return (
                        <button
                          key={opt}
                          disabled={!!selected}
                          onClick={() => handlePick(opt)}
                          className={`p-4 rounded-2xl text-lg font-bold text-left transition-colors ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-500">
                      {selected ? (isCorrect ? 'Correct!' : 'Try again next time.') : 'Pick an answer'}
                    </div>
                    <Button onClick={next} disabled={!selected}>
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {phase === 'result' && (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-3 mb-4">
                    {passed ? (
                      <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                        <XIcon className="w-7 h-7 text-red-600" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-500">Quest Result</div>
                      <div className="text-2xl font-extrabold text-slate-800">{passed ? 'Quest Complete!' : 'Quest Failed'}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-6">
                    <div className="text-lg font-bold text-slate-800">Score: {score} / {total}</div>
                    <div className="text-slate-500 font-semibold">Need {Math.round(passPercent * 100)}%+ to unlock the gate.</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        onComplete({ score, total, passed });
                      }}
                      variant={passed ? 'secondary' : 'outline'}
                    >
                      {passed ? 'Unlock Gate' : 'Try Later'}
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

