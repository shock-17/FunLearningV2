import { useEffect, useMemo, useState } from 'react';
import { playSound } from '../lib/audio';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Subject, useAppStore } from '../store/useAppStore';
import { getStoryLevels } from '../lib/story';
import { ArrowLeft, Lock, Play, Star } from 'lucide-react';
import { motion } from 'motion/react';

export function StoryMap({
  onBack,
  onStartLevel,
}: {
  onBack: () => void;
  onStartLevel: (args: { subject: Subject; level: number }) => void;
}) {
  const { activeKidId, storyProgress, fetchStoryProgress } = useAppStore();
  const [activeSubject, setActiveSubject] = useState<Subject>('Math');

  useEffect(() => {
    if (activeKidId) fetchStoryProgress(activeKidId);
  }, [activeKidId]);

  const progress = storyProgress[activeSubject];
  const unlockedLevel = progress?.unlocked_level ?? 1;

  const levels = useMemo(() => getStoryLevels(activeSubject, 10), [activeSubject]);

  const subjects: Subject[] = ['Math', 'English', 'Mandarin'];

  return (
    <div className="min-h-screen bg-[#f4f3ff] pt-20 pb-12">
      <Header
        leftAction={
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        }
        rightAction={null}
      />

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#5c4ce5] mb-2">Story Mode</h1>
          <p className="text-slate-600 font-medium">
            Clear each level to unlock the next. Switch subjects anytime.
          </p>
        </motion.div>

        <section className="flex flex-wrap gap-3">
          {subjects.map((s) => (
            <Button
              key={s}
              variant={activeSubject === s ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveSubject(s);
                playSound('click');
              }}
            >
              {s}
            </Button>
          ))}
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((lvl) => {
              const locked = lvl.level > unlockedLevel;
              return (
                <Card
                  key={lvl.level}
                  className={locked ? 'opacity-70 cursor-not-allowed' : ''}
                  onClick={locked ? undefined : () => {
                    playSound('click');
                    onStartLevel({ subject: activeSubject, level: lvl.level });
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-slate-500">Level {lvl.level}</div>
                      <div className="text-2xl font-extrabold text-slate-800">{lvl.title}</div>
                      <div className="mt-2 text-slate-600">{lvl.blurb}</div>
                    </div>
                    <div className="shrink-0">
                      {locked ? (
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-slate-400" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#e0ddf5] flex items-center justify-center">
                          <Play className="w-6 h-6 text-[#5c4ce5]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-500">
                      {lvl.difficulty} • {lvl.questionCount} puzzles
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-bold">{progress?.total_stars ?? 0}</span>
                    </div>
                  </div>

                  {!locked && (
                    <div className="mt-4">
                      <Button className="w-full" onClick={() => {
                        playSound('click');
                        onStartLevel({ subject: activeSubject, level: lvl.level });
                      }}>
                        Start Level {lvl.level}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

