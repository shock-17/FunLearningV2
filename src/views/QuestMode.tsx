import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Subject } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowLeft, Settings } from 'lucide-react';
import { QuestDialog } from '../components/QuestDialog';
import { computeStars } from '../lib/story';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

type QuestNpcInteract = { npcId: Subject };

export function QuestMode({ onBack }: { onBack: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<any>(null);

  const { activeKidId, storyProgress, fetchStoryProgress, completeStoryLevel } = useAppStore();
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);

  const [activeNpc, setActiveNpc] = useState<Subject | null>(null);
  const [showTools, setShowTools] = useState(false);

  useEffect(() => {
    if (activeKidId) fetchStoryProgress(activeKidId);
  }, [activeKidId]);

  const getUnlockedLevel = useCallback((subject: Subject) => {
    return useAppStore.getState().storyProgress[subject]?.unlocked_level ?? 1;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const mount = async () => {
      if (!containerRef.current) return;

      // Lazy-load Phaser chunk
      const mod = await import('../game/QuestGame');
      if (cancelled) return;

      const game = new mod.QuestGame({
        parent: containerRef.current,
        getUnlockedLevel,
        onNpcInteract: (e: QuestNpcInteract) => {
          setActiveNpc(e.npcId);
        },
      });
      gameRef.current = game;
    };

    mount();
    return () => {
      cancelled = true;
      try {
        gameRef.current?.destroy?.();
      } catch {
        // ignore
      }
      gameRef.current = null;
    };
  }, [getUnlockedLevel]);

  // When progress updates, resync gate visibility.
  useEffect(() => {
    try {
      gameRef.current?.syncGates?.();
    } catch {
      // ignore
    }
  }, [storyProgress]);

  if (!activeKidId) {
    return (
      <div className="min-h-screen bg-[#f4f3ff] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-extrabold text-[#5c4ce5] mb-2">Pick a kid profile first</h2>
          <p className="text-slate-600 font-medium mb-6">Go back to the dashboard and select a kid.</p>
          <Button onClick={onBack} className="w-full">
            Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ff] pt-20 pb-10">
      <Header
        leftAction={
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        }
        rightAction={
          <Button variant="ghost" size="icon" onClick={() => setShowTools(true)} aria-label="Tools">
            <Settings className="w-6 h-6" />
          </Button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#5c4ce5] mb-2">Quest World</h1>
          <p className="text-slate-600 font-medium">
            Walk up to an NPC and press <span className="font-extrabold">E</span> to get a quest. Pass to unlock the gate.
          </p>
        </motion.div>

        <Card className="p-0 overflow-hidden">
          <div className="bg-white p-3 border-b border-[#e0ddf5] flex items-center justify-between">
            <div className="text-sm font-bold text-slate-500">Controls: ← → to move • ↑ to jump • E to talk</div>
            <div className="text-sm font-extrabold text-slate-700">
              Unlocked: M{getUnlockedLevel('Math')} • E{getUnlockedLevel('English')} • Z{getUnlockedLevel('Mandarin')}
            </div>
          </div>
          <div ref={containerRef} className="w-full aspect-[16/9] bg-[#f4f3ff]" />
        </Card>
      </main>

      {activeNpc && (
        <QuestDialog
          subject={activeNpc}
          difficulty="Easy"
          questionCount={7}
          passPercent={0.6}
          onClose={() => setActiveNpc(null)}
          onComplete={async ({ score, total, passed }) => {
            setActiveNpc(null);
            if (!passed) return;

            // MVP: completing the NPC quest counts as story level 1 for that subject.
            const stars = computeStars(score, total, 0.6);
            await completeStoryLevel({ kidId: activeKidId, subject: activeNpc, level: 1, stars });
            await fetchStoryProgress(activeKidId);
          }}
        />
      )}

      {showTools && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowTools(false)}>
          <div onClick={(e) => e.stopPropagation()} className={cn("w-full max-w-md bg-white rounded-3xl border border-[#e0ddf5] shadow-lg p-6")}>
            <div className="text-xl font-extrabold text-[#5c4ce5] mb-4">Quest World Tools</div>

            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div>
                <div className="font-bold text-slate-800">Sound</div>
                <div className="text-sm text-slate-500">Turn effects on/off</div>
              </div>
              <Button variant={soundEnabled ? 'secondary' : 'outline'} size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowTools(false)}>Close</Button>
              <Button
                onClick={() => {
                  const ok = window.confirm('Exit Quest World?');
                  if (ok) onBack();
                }}
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

