import { useState, useMemo } from 'react';
import { useAppStore, ChildAvatar, Subject } from '../store/useAppStore';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AvatarIcon } from '../components/AvatarIcon';
import { motion } from 'motion/react';
import { Plus, Play, Trash2, LogOut, BookOpen, Gamepad2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Dashboard({
  onPlay,
  onStory,
  onQuestWorld
}: {
  onPlay: () => void;
  onStory: () => void;
  onQuestWorld: () => void;
}) {
  const { profiles, scoreHistory, addProfile, deleteProfile, logout, setActiveKid } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<ChildAvatar>('fox');
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');

  const handleCreate = () => {
    if (newName.trim()) {
      addProfile(newName.trim(), newAvatar);
      setNewName('');
      setShowAddForm(false);
    }
  };

  const handlePlay = (id: string) => {
    setActiveKid(id);
    onPlay();
  };

  const handleStory = (id: string) => {
    setActiveKid(id);
    onStory();
  };

  const handleQuestWorld = (id: string) => {
    setActiveKid(id);
    onQuestWorld();
  };

  // Process data for graph view: average score percentage per subject per kid
  const graphData = useMemo(() => {
    return profiles.map(kid => {
      const kidScores = scoreHistory.filter(s => s.kid_id === kid.id);
      
      const getAvg = (sub: Subject) => {
        const subs = kidScores.filter(s => s.subject === sub);
        if (subs.length === 0) return 0;
        const totalPct = subs.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0);
        return Math.round(totalPct / subs.length);
      };

      return {
        name: kid.name,
        Math: getAvg('Math'),
        English: getAvg('English'),
        Mandarin: getAvg('Mandarin'),
      };
    });
  }, [profiles, scoreHistory]);

  return (
    <div className="min-h-screen bg-[#f4f3ff] pt-20 pb-12">
      <Header 
        rightAction={<Button variant="ghost" onClick={logout}><LogOut className="w-5 h-5 mr-2"/> Logout</Button>} 
      />

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-12">
        
        {/* Profile Grid */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#5c4ce5]">Kid Profiles</h2>
            {profiles.length < 5 && !showAddForm && (
              <Button onClick={() => setShowAddForm(true)} variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Kid
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map(p => (
              <Card key={p.id} className="flex flex-col items-center p-8 relative group">
                <button 
                  onClick={() => deleteProfile(p.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <AvatarIcon avatar={p.avatar} size="xl" className="mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-6">{p.name}</h3>
                <div className="w-full space-y-3">
                  <Button className="w-full" onClick={() => handleQuestWorld(p.id)} variant="primary">
                    <Gamepad2 className="w-4 h-4 mr-2" /> Quest World
                  </Button>
                  <Button className="w-full" onClick={() => handleStory(p.id)} variant="secondary">
                    <BookOpen className="w-4 h-4 mr-2" /> Story Mode
                  </Button>
                  <Button className="w-full" onClick={() => handlePlay(p.id)}>
                    <Play className="w-4 h-4 mr-2 fill-current" /> Quick Play
                  </Button>
                </div>
              </Card>
            ))}

            {showAddForm && (
               <Card className="flex flex-col p-6 border-2 border-dashed border-[#5c4ce5]/30">
                  <h3 className="text-lg font-bold mb-4 text-[#5c4ce5]">New Profile</h3>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    placeholder="Kid's Name"
                    className="w-full px-4 py-2 border rounded-xl mb-4 bg-slate-50"
                  />
                  <div className="flex justify-between mb-6">
                    {(['fox', 'bear', 'rabbit', 'owl', 'turtle'] as ChildAvatar[]).map(a => (
                      <button 
                         key={a} 
                         onClick={() => setNewAvatar(a)}
                         className={`p-2 rounded-full ${newAvatar === a ? 'ring-2 ring-[#5c4ce5] bg-[#e0ddf5]' : 'opacity-50 hover:opacity-100'}`}
                      >
                        <AvatarIcon avatar={a} size="sm" />
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1" onClick={handleCreate} disabled={!newName.trim()}>Save</Button>
                    <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  </div>
               </Card>
            )}

            {profiles.length === 0 && !showAddForm && (
              <div className="col-span-full text-center py-12 text-slate-500">
                 No profiles yet. Add your first kid to get started!
              </div>
            )}
          </div>
        </section>

        {/* Progress Tracking */}
        {profiles.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#5c4ce5]">Progress Tracking</h2>
              <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                 <button 
                   onClick={() => setViewMode('graph')}
                   className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${viewMode === 'graph' ? 'bg-[#e0ddf5] text-[#5c4ce5]' : 'text-slate-500'}`}
                 >
                   Graph
                 </button>
                 <button 
                   onClick={() => setViewMode('table')}
                   className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${viewMode === 'table' ? 'bg-[#e0ddf5] text-[#5c4ce5]' : 'text-slate-500'}`}
                 >
                   Table
                 </button>
              </div>
            </div>

            <Card className="p-2 py-8 md:p-8 min-h-[400px]">
              {scoreHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Play some games to see progress data!
                </div>
              ) : viewMode === 'graph' ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="name" type="category" fontWeight="bold" />
                      <Tooltip formatter={(val) => `${val}% Avg`} cursor={{fill: 'transparent'}} />
                      <Legend />
                      <Bar dataKey="Math" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                      <Bar dataKey="English" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={15} />
                      <Bar dataKey="Mandarin" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={15} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="pb-3 text-slate-500">Date</th>
                        <th className="pb-3 text-slate-500">Kid</th>
                        <th className="pb-3 text-slate-500">Subject</th>
                        <th className="pb-3 text-slate-500">Difficulty</th>
                        <th className="pb-3 text-slate-500 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                       {scoreHistory.map(s => {
                         const kid = profiles.find(p => p.id === s.kid_id);
                         return (
                          <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 text-sm text-slate-600">{new Date(s.date).toLocaleDateString()}</td>
                            <td className="py-3 font-semibold">{kid?.name || 'Unknown'}</td>
                            <td className="py-3 text-sm">{s.subject}</td>
                            <td className="py-3 text-sm">{s.difficulty}</td>
                            <td className="py-3 font-bold text-right text-[#5c4ce5]">{s.score}/{s.total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
