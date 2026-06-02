import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from '../components/Button';
import { BookOpen, Calculator, Globe } from 'lucide-react';
import { Header } from '../components/Header';

export function Landing({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 1.15]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-[#f4f3ff] text-slate-800 font-sans overflow-x-hidden">
      <Header rightAction={<Button variant="outline" size="sm" onClick={() => onNavigate('login')}>Parent Login</Button>} />

      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div
           style={{ scale }}
           className="absolute inset-0 bg-gradient-to-br from-[#dcd7fcdb] to-[#b1f2e6cb] z-0"
        >
          {/* Subtle pattern background since we don't have a real video */}
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%235c4ce5\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </motion.div>
        
        <motion.div style={{ opacity }} className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#5c4ce5] tracking-tight mb-6">
            Make learning an adventure.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-10 font-medium leading-relaxed">
            Short, gamified challenges your kids will love.<br/>
            Progress tracking you can trust.
          </p>
          <Button size="lg" onClick={() => onNavigate('login')}>Get Started for Free</Button>
        </motion.div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center text-[#5c4ce5] mb-12">Three Core Subjects</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Math', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-100' },
            { name: 'English', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-100' },
            { name: 'Mandarin', icon: Globe, color: 'text-red-500', bg: 'bg-red-100' },
          ].map((subj) => (
            <div key={subj.name} className="bg-white rounded-[2rem] p-8 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`w-20 h-20 mx-auto rounded-full ${subj.bg} flex items-center justify-center mb-6`}>
                <subj.icon className={`w-10 h-10 ${subj.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{subj.name}</h3>
              <p className="text-slate-500">Perfectly spaced questions customized for your child's learning stage.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
