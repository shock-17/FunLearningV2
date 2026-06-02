import { Subject, Difficulty } from '../store/useAppStore';
import { Card } from '../components/Card';
import { ArrowLeft, BookOpen, Calculator, Globe, LayoutList, Trophy } from 'lucide-react';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'motion/react';

export function KidSelectionScreens({ 
  step, 
  onBack, 
  onSelectSubject, 
  onSelectDifficulty,
  onStartConfigured
}: { 
  step: 'subject' | 'difficulty' | 'config';
  onBack: () => void;
  onSelectSubject: (s: Subject) => void;
  onSelectDifficulty: (d: Difficulty) => void;
  onStartConfigured: (qCount: number) => void;
}) {

  return (
    <div className="min-h-[100dvh] bg-[#f4f3ff] flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 z-50">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-8 h-8" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {step === 'subject' && (
          <motion.div 
             key="subject"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="w-full max-w-4xl"
          >
            <h2 className="text-4xl font-extrabold text-center text-[#5c4ce5] mb-12 drop-shadow-sm">Choose Your Subject!</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { s: 'Math' as Subject, ic: Calculator, cl: 'text-blue-500', bg: 'bg-blue-100', bgHover: 'hover:bg-blue-50' },
                { s: 'English' as Subject, ic: BookOpen, cl: 'text-green-500', bg: 'bg-green-100', bgHover: 'hover:bg-green-50' },
                { s: 'Mandarin' as Subject, ic: Globe, cl: 'text-red-500', bg: 'bg-red-100', bgHover: 'hover:bg-red-50' },
              ].map(cfg => (
                <Card 
                  key={cfg.s} 
                  onClick={() => onSelectSubject(cfg.s)}
                  className={`flex flex-col items-center p-12 transition-colors ${cfg.bgHover} border-2 border-transparent hover:border-${cfg.cl.split('-')[1]}-200`}
                >
                  <div className={`w-24 h-24 rounded-full ${cfg.bg} flex items-center justify-center mb-8 shadow-sm`}>
                    <cfg.ic className={`w-12 h-12 ${cfg.cl}`} />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{cfg.s}</span>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'difficulty' && (
          <motion.div 
             key="diff"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="w-full max-w-4xl"
          >
            <h2 className="text-4xl font-extrabold text-center text-[#5c4ce5] mb-12 drop-shadow-sm">How tough are you today?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { d: 'Easy' as Difficulty, icon: '😊', desc: 'No timer, infinite lives' },
                { d: 'Medium' as Difficulty, icon: '🤔', desc: '15 questions, quick timer' },
                { d: 'Hard' as Difficulty, icon: '🔥', desc: '10 questions, 3 lives!' },
              ].map(cfg => (
                <Card 
                  key={cfg.d} 
                  onClick={() => onSelectDifficulty(cfg.d)}
                  className="flex flex-col items-center p-10 text-center border-2 border-[#e0ddf5] hover:border-[#5c4ce5]"
                >
                  <div className="text-6xl mb-6">{cfg.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{cfg.d}</h3>
                  <p className="text-slate-500">{cfg.desc}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'config' && (
           <motion.div 
             key="config"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="w-full max-w-md mx-auto"
           >
              <Card className="p-10 text-center">
                <h2 className="text-3xl font-extrabold text-[#5c4ce5] mb-6">Easy Mode</h2>
                <p className="text-lg text-slate-600 mb-8">How many questions do you want to play?</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[5, 10, 15, 20].map(n => (
                    <Button key={n} variant="outline" size="lg" onClick={() => onStartConfigured(n)}>
                      {n} Questions
                    </Button>
                  ))}
                </div>
              </Card>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
