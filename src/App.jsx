import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Briefcase, 
  MapPin, 
  CheckCircle,
  Bell, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import OptionsRadar from './components/OptionsRadar';
import InsiderRadar from './components/InsiderRadar';
import ParkingRadar from './components/ParkingRadar';
import HabitTracker from './components/HabitTracker';
import AiAssistant from './components/AiAssistant';

const RadarSweep = () => (
  <motion.div 
    animate={{ left: ['-100%', '100%'] }}
    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    className="radar-sweep"
  />
);

const App = () => {
  const [activeTab, setActiveTab] = useState('options');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'options', name: 'Options Flow', icon: <Activity size={20} />, color: '#00FF41' },
    { id: 'insiders', name: 'Insider Trades', icon: <Briefcase size={20} />, color: '#00E5FF' },
    { id: 'parking', name: 'Free Parking', icon: <MapPin size={20} />, color: '#FFD700' },
    { id: 'habits', name: 'Habit Radar', icon: <CheckCircle size={20} />, color: '#A855F7' },
    { id: 'ai', name: 'Radar AI', icon: <Sparkles size={20} />, color: '#EAB308' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white">
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="glass h-full m-3 mr-0 flex flex-col items-center py-8 relative overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3 mb-12 px-4 w-full justify-start">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00FF41] to-[#00E5FF] flex items-center justify-center pulsate">
            <TrendingUp size={24} color="#000" strokeWidth={3} />
          </div>
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tighter"
            >
              THE RADAR
            </motion.h1>
          )}
        </div>

        <nav className="flex-1 w-full flex flex-col gap-2 px-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center w-full p-4 rounded-xl transition-all duration-300 relative group
                ${activeTab === tab.id ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}
              `}
            >
              <span style={{ color: activeTab === tab.id ? tab.color : 'inherit' }}>
                {tab.icon}
              </span>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-4 font-medium"
                >
                  {tab.name}
                </motion.span>
              )}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-current rounded-full"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto w-full px-3">
          <div className="p-4 glass rounded-2xl bg-gradient-to-b from-white/5 to-transparent">
             {isSidebarOpen ? (
               <div className="flex flex-col gap-2">
                 <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Premium Status</p>
                 <div className="flex items-center gap-2">
                   <ShieldCheck size={16} color="#00FF41" />
                   <span className="text-sm font-bold">RADAR-PRO</span>
                 </div>
               </div>
             ) : (
               <ShieldCheck size={20} color="#00FF41" className="mx-auto" />
             )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <header className="flex items-center justify-between p-4 mb-2">
           <div>
             <h2 className="text-2xl font-bold tracking-tight">
               {tabs.find(t => t.id === activeTab)?.name} Dashboard
             </h2>
             <p className="text-zinc-500 text-sm">System scanning live feeds... <span className="ticker-green mono">OK</span></p>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 glass px-4 py-2 text-sm font-medium">
               <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
               LIVE FEED
             </div>
             <button className="glass p-2 hover:bg-white/5 transition-colors">
               <Bell size={20} />
             </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto pr-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              {activeTab === 'options' && <OptionsRadar />}
              {activeTab === 'insiders' && <InsiderRadar />}
              {activeTab === 'parking' && <ParkingRadar />}
              {activeTab === 'habits' && <HabitTracker />}
              {activeTab === 'ai' && <AiAssistant />}
            </motion.div>
          </AnimatePresence>
        </main>

        <RadarSweep />

        {/* Pro Alert Popup */}
        <motion.div 
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-8 right-8 glass p-4 max-w-xs border-l-4 border-[#00FF41] z-50 bg-[#0A0A0B]/90 shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#00FF41]/10 rounded-lg">
              <AlertCircle size={20} color="#00FF41" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#00FF41]">Pro Alert</p>
              <h4 className="text-sm font-bold mt-1">Unusual Activity: $NVDA</h4>
              <p className="text-xs text-zinc-500 mt-1">Massive Call sweep detected. 12,000 contracts bought above ask.</p>
              <button className="mt-3 w-full py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#00FF41] transition-colors">
                 Upgrade for Alarms
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default App;
