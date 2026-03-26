import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Plus, 
  Trash2, 
  BarChart3, 
  Calendar as CalendarIcon,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const HabitTracker = () => {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('radar_habits');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Deep Work (2h)', completedDays: ['2026-03-25', '2026-03-26'], streak: 2 },
      { id: 2, name: 'Exercise', completedDays: ['2026-03-26'], streak: 1 },
      { id: 3, name: 'Reading', completedDays: [], streak: 0 },
    ];
  });
  
  const [newHabitName, setNewHabitName] = useState('');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    localStorage.setItem('radar_habits', JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      completedDays: [],
      streak: 0
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const toggleHabit = (id) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const isCompletedToday = habit.completedDays.includes(today);
        let newDays;
        if (isCompletedToday) {
          newDays = habit.completedDays.filter(d => d !== today);
        } else {
          newDays = [...habit.completedDays, today];
        }
        
        // Simple streak calculation (mocked for demo, normally would check consecutive days)
        const newStreak = isCompletedToday ? habit.streak - 1 : habit.streak + 1;
        
        return { ...habit, completedDays: newDays, streak: Math.max(0, newStreak) };
      }
      return habit;
    }));
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // Mock data for graphs
  const chartData = [
    { day: 'Mon', completion: 60 },
    { day: 'Tue', completion: 80 },
    { day: 'Wed', completion: 45 },
    { day: 'Thu', completion: 90 },
    { day: 'Fri', completion: 70 },
    { day: 'Sat', completion: 100 },
    { day: 'Sun', completion: 85 },
  ];

  return (
    <div className="flex flex-col gap-6 h-full pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habit List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass p-4 flex gap-3">
            <input 
              type="text" 
              placeholder="Add new habit... (e.g. 'Daily Coding')" 
              className="bg-transparent border-none outline-none flex-1 text-sm font-medium px-2"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            />
            <button 
              onClick={addHabit}
              className="h-10 w-10 glass flex items-center justify-center hover:bg-white/10 transition-colors rounded-xl text-[#00FF41]"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {habits.map((habit) => (
                <motion.div 
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleHabit(habit.id)}
                      className="transition-transform active:scale-95"
                    >
                      {habit.completedDays.includes(today) ? (
                        <CheckCircle2 size={24} color="#00FF41" />
                      ) : (
                        <Circle size={24} className="text-zinc-600 group-hover:text-zinc-400" />
                      )}
                    </button>
                    <div>
                      <h4 className={`font-bold ${habit.completedDays.includes(today) ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Flame size={12} color="#FFD700" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{habit.streak} DAY STREAK</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats & Graphs */}
        <div className="flex flex-col gap-6">
          <div className="glass p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#00E5FF] flex items-center gap-2">
                <BarChart3 size={14} /> Weekly Performance
              </h3>
            </div>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717A', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.completion >= 80 ? '#00FF41' : '#00E5FF'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Monthly Consistency</span>
                <span className="font-bold text-[#00FF41]">84%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  className="h-full bg-[#00FF41]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 glass bg-gradient-to-br from-[#FFD700]/10 to-transparent border-[#FFD700]/20">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                 <CalendarIcon size={20} color="#FFD700" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">Streak Milestone</p>
                 <h4 className="text-sm font-bold">5 Days Away from Diamond</h4>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
