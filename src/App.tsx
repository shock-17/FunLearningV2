/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { useAppStore, Subject, Difficulty } from './store/useAppStore';

import { Landing } from './views/Landing';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { KidSelectionScreens } from './views/KidSelectionScreens';
import { Gameplay } from './views/Gameplay';
import { StoryMap } from './views/StoryMap';
import { QuestMode } from './views/QuestMode';
import { computeStars, getStoryLevels } from './lib/story';

type AppView =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'kid_subject'
  | 'kid_difficulty'
  | 'kid_config'
  | 'gameplay'
  | 'story_map'
  | 'story_level'
  | 'quest_mode';

export default function App() {
  const { isParentAuthenticated, activeKidId, checkAuth, completeStoryLevel, storyProgress } = useAppStore();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    checkAuth().finally(() => setIsInitializing(false));
  }, []);

  // Game config state
  const [subject, setSubject] = useState<Subject>('Math');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [qCount, setQCount] = useState<number>(10);
  const [storyLevel, setStoryLevel] = useState<number>(1);

  // Authentication routing safety
  useEffect(() => {
    if (currentView === 'dashboard' && !isParentAuthenticated) {
      setCurrentView('login');
    }
  }, [currentView, isParentAuthenticated]);

  useEffect(() => {
    if (isParentAuthenticated && currentView === 'login') {
      setCurrentView('dashboard');
    }
  }, [isParentAuthenticated, currentView]);

  const activeStoryUnlocked = useMemo(() => {
    return (storyProgress[subject]?.unlocked_level ?? 1);
  }, [storyProgress, subject]);

  // View handler
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing onNavigate={setCurrentView} />;
      
      case 'login':
        return (
          <Login 
            onBack={() => setCurrentView('landing')} 
          />
        );
      
      case 'dashboard':
        return (
           <Dashboard
             onPlay={() => setCurrentView('kid_subject')}
             onStory={() => setCurrentView('story_map')}
             onQuestWorld={() => setCurrentView('quest_mode')}
           />
        );

      case 'kid_subject':
         if (!activeKidId) {
           setCurrentView('dashboard');
           return null;
         }
         return <KidSelectionScreens 
            step="subject" 
            onBack={() => setCurrentView('dashboard')}
            onSelectSubject={(s) => { setSubject(s); setCurrentView('kid_difficulty'); }}
            onSelectDifficulty={() => {}}
            onStartConfigured={() => {}}
         />;

      case 'kid_difficulty':
         return <KidSelectionScreens 
            step="difficulty" 
            onBack={() => setCurrentView('kid_subject')}
            onSelectSubject={() => {}}
            onSelectDifficulty={(d) => {
               setDifficulty(d);
               if (d === 'Easy') {
                 setCurrentView('kid_config');
               } else {
                 setCurrentView('gameplay');
               }
            }}
            onStartConfigured={() => {}}
         />;

      case 'kid_config':
         return <KidSelectionScreens 
            step="config" 
            onBack={() => setCurrentView('kid_difficulty')}
            onSelectSubject={() => {}}
            onSelectDifficulty={() => {}}
            onStartConfigured={(c) => { setQCount(c); setCurrentView('gameplay'); }}
         />;

      case 'story_map':
        if (!activeKidId) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <StoryMap
            onBack={() => setCurrentView('dashboard')}
            onStartLevel={({ subject: s, level }) => {
              setSubject(s);
              setStoryLevel(level);
              const lvlCfg = getStoryLevels(s, 10).find((l) => l.level === level);
              setDifficulty(lvlCfg?.difficulty ?? 'Easy');
              setQCount(lvlCfg?.questionCount ?? 10);
              setCurrentView('story_level');
            }}
          />
        );

      case 'story_level': {
        const lvlCfg = getStoryLevels(subject, 10).find((l) => l.level === storyLevel);
        return (
          <Gameplay
            subject={subject}
            difficulty={lvlCfg?.difficulty ?? difficulty}
            qCount={lvlCfg?.questionCount ?? qCount}
            storyMeta={{
              mode: 'story',
              level: storyLevel,
              unlockedLevel: activeStoryUnlocked,
              passPercent: lvlCfg?.passPercent ?? 0.6,
            }}
            onFinish={async ({ score, total, passPercent }) => {
              if (activeKidId) {
                const stars = computeStars(score, total, passPercent);
                await completeStoryLevel({ kidId: activeKidId, subject, level: storyLevel, stars });
              }
              setCurrentView('story_map');
            }}
          />
        );
      }

      case 'gameplay':
         return <Gameplay 
           subject={subject} 
           difficulty={difficulty} 
           qCount={qCount} 
           onFinish={() => setCurrentView('dashboard')}
         />;

      case 'quest_mode':
        return <QuestMode onBack={() => setCurrentView('dashboard')} />;
         
      default:
        return <Landing onNavigate={setCurrentView} />;
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen bg-[#f4f3ff] flex items-center justify-center font-bold text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f3ff] text-slate-800 font-sans selection:bg-[#c3bbf7] selection:text-[#5c4ce5]">
      {renderView()}
    </div>
  );
}

