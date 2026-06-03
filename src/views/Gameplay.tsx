import { useState, useEffect, useRef } from 'react';
import { Subject, Difficulty, useAppStore } from '../store/useAppStore';
import { getQuestions, Question } from '../data/questions';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { playSound } from '../lib/audio';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Clock, ArrowRight, XCircle, CheckCircle2, Settings, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';

export function Gameplay({ 
  subject, 
  difficulty, 
  qCount, 
  onFinish,
  storyMeta
}: { 
  subject: Subject;
  difficulty: Difficulty;
  qCount: number;
  onFinish: ((args: { score: number; total: number; passPercent: number }) => void) | (() => void);
  storyMeta?: { mode: 'story'; level: number; unlockedLevel: number; passPercent: number };
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(difficulty === 'Hard' ? 3 : null);
  const [timeLeft, setTimeLeft] = useState(difficulty === 'Easy' ? null : 60);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'completed'>('playing');
  const [showSettings, setShowSettings] = useState(false);

  const addScore = useAppStore(state => state.addScore);
  const activeKidId = useAppStore(state => state.activeKidId);
  const soundEnabled = useAppStore(state => state.soundEnabled);
  const setSoundEnabled = useAppStore(state => state.setSoundEnabled);

  // Initialize
  useEffect(() => {
    const totalQ = difficulty === 'Easy' ? qCount : (difficulty === 'Medium' ? 15 : 10);
    setQuestions(getQuestions(subject, difficulty, totalQ));
  }, [subject, difficulty, qCount]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft === null || selectedAnswer) return;
    
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, gameState, selectedAnswer]);

  const handleTimeout = () => {
    playSound('error');
    setSelectedAnswer('TIMEOUT');
    setIsCorrect(false);
    
    if (difficulty === 'Hard') {
      const newLives = (lives || 0) - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => endGame('gameover'), 2000);
      }
    }
  };

  const handleAnswerClick = (opt: string) => {
    if (selectedAnswer !== null) return; // Prevent double clicking

    const correct = opt === questions[currentIndex].correctAnswer;
    setSelectedAnswer(opt);
    setIsCorrect(correct);
    
    playSound(correct ? 'success' : 'error');

    if (correct) {
      setScore(s => s + 1);
    } else {
      if (difficulty === 'Hard') {
        const newLives = (lives || 0) - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setTimeout(() => endGame('gameover'), 2000);
          return;
        }
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex >= questions.length - 1) {
      endGame('completed');
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      if (difficulty !== 'Easy') setTimeLeft(60);
    }
  };

  const endGame = (state: 'gameover' | 'completed') => {
    setGameState(state);
    const totalQ = questions.length;
    const finalScore = score;
    
    // Save to store
    if (activeKidId) {
      addScore({
        kidId: activeKidId,
        subject,
        difficulty,
        score: finalScore, // Add correct if last step
        total: totalQ
      });
    }

    if (state === 'completed' && (finalScore / totalQ) >= 0.6) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  if (questions.length === 0) return <div className="min-h-screen bg-[#f4f3ff] flex items-center justify-center">Loading...</div>;

  const currentQ = questions[currentIndex];

  if (gameState !== 'playing') {
    const total = questions.length;
    const passPercent = storyMeta?.passPercent ?? 0.6;
    const passThreshold = score / total >= passPercent;
    return (
      <div className="min-h-screen bg-[#f4f3ff] flex items-center justify-center p-4 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <Card className="p-12 items-center flex flex-col text-center">
             <h1 className="text-5xl mb-6">
               {(gameState === 'completed' && passThreshold) ? '🎉' : '😕'}
             </h1>
             <h2 className="text-3xl font-extrabold text-[#5c4ce5] mb-4">
               {gameState === 'completed' 
                 ? (passThreshold ? 'Great Job!' : 'Nice Try!') 
                 : 'Game Over!'}
             </h2>
             <p className="text-2xl font-bold text-slate-700 mb-2">Score: {score} / {total}</p>
             <p className="text-slate-500 font-semibold mb-8">Pass: {Math.round(passPercent * 100)}%+</p>
             <Button
               size="lg"
               className="w-full"
               onClick={() => {
                 if (typeof onFinish === 'function') {
                   // Story mode wants score/total
                   (onFinish as any)({ score, total, passPercent });
                 }
               }}
             >
               Return
             </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ff] flex flex-col pt-8 px-4 pb-4">
      {/* HUD */}
      <header className="max-w-4xl w-full mx-auto flex justify-between items-center mb-12 bg-white p-4 rounded-3xl shadow-sm border border-[#e0ddf5]">
        <div className="flex items-center gap-3">
          <div className="font-bold text-[#5c4ce5] text-lg bg-[#e0ddf5] px-4 py-2 rounded-xl">
            Q: {currentIndex + 1} / {questions.length}
          </div>
          {storyMeta?.mode === 'story' && (
            <div className="text-sm font-extrabold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
              Story • L{storyMeta.level}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          {difficulty === 'Hard' && lives !== null && (
            <div className="flex text-red-500 gap-1 items-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} className={`w-8 h-8 ${i < lives ? 'fill-current' : 'opacity-30'}`} />
              ))}
            </div>
          )}
          {timeLeft !== null && (
            <div className={`flex items-center text-xl font-bold px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-orange-100 text-orange-600'}`}>
              <Clock className="w-6 h-6 mr-2" />
              {timeLeft}s
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} aria-label="Settings">
            <Settings className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Play Area */}
      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="min-h-[200px] bg-white rounded-[2rem] shadow-sm border border-[#e0ddf5] flex items-center justify-center p-8 mb-8">
              <h2 className="text-3xl md:text-5xl font-bold text-center text-slate-800 tracking-tight leading-tight">
                {currentQ.text}
              </h2>
            </div>
            
            <div className="grid gap-4 mt-auto">
              {currentQ.options.map(opt => {
                let btnClass = "bg-white text-slate-800 border-2 border-[#e0ddf5] hover:border-[#5c4ce5]";
                if (selectedAnswer) {
                  if (opt === currentQ.correctAnswer) {
                     btnClass = "bg-green-500 text-white border-green-600";
                  } else if (opt === selectedAnswer) {
                     btnClass = "bg-red-500 text-white border-red-600";
                  } else {
                     btnClass = "bg-slate-100 text-slate-400 border-slate-200 opacity-50";
                  }
                }

                return (
                  <button 
                    key={opt}
                    onClick={() => handleAnswerClick(opt)}
                    disabled={selectedAnswer !== null}
                    className={`p-6 rounded-2xl text-2xl font-bold text-left transition-all ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback Banner */}
        <div className="h-24 mt-6">
          <AnimatePresence>
            {selectedAnswer && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-6 rounded-2xl flex justify-between items-center text-white shadow-lg ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
              >
                <div className="flex items-center text-2xl font-bold">
                  {isCorrect ? <CheckCircle2 className="w-8 h-8 mr-3" /> : <XCircle className="w-8 h-8 mr-3" />}
                  {isCorrect ? 'Correct! 🎉' : 'Incorrect! 😕'}
                </div>
                <Button variant="outline" className="bg-white text-slate-800 border-none hover:bg-slate-100" onClick={nextQuestion}>
                  Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={cn("w-full max-w-md bg-white rounded-3xl border border-[#e0ddf5] shadow-lg p-6")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-[#5c4ce5]">Game Tools</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)} aria-label="Close">
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div>
                    <div className="font-bold text-slate-800">Sound</div>
                    <div className="text-sm text-slate-500">Turn effects on/off</div>
                  </div>
                  <Button
                    variant={soundEnabled ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const ok = window.confirm('Exit this game? Your progress for this run will be lost.');
                      if (ok) (onFinish as any)({ score: 0, total: questions.length, passPercent: storyMeta?.passPercent ?? 0.6 });
                    }}
                  >
                    <Home className="w-5 h-5 mr-2" /> Exit
                  </Button>
                  <Button onClick={() => setShowSettings(false)}>Back to Game</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
