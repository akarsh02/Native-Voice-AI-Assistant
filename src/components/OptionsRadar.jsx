import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Percent, TrendingUp, Info } from 'lucide-react';

const mockOptions = [
  { id: 1, ticker: 'TSLA', type: 'CALL', strike: 220, expiry: '2026-04-17', vol_oi: 12.4, value: '$2.4M', sentiment: 'Bullish' },
  { id: 2, ticker: 'AAPL', type: 'PUT', strike: 185, expiry: '2026-03-28', vol_oi: 8.7, value: '$1.8M', sentiment: 'Bearish' },
  { id: 3, ticker: 'NVDA', type: 'CALL', strike: 950, expiry: '2026-05-15', vol_oi: 15.2, value: '$8.9M', sentiment: 'Mega Bullish' },
  { id: 4, ticker: 'AMD', type: 'CALL', strike: 180, expiry: '2026-04-10', vol_oi: 6.1, value: '$1.2M', sentiment: 'Bullish' },
  { id: 5, ticker: 'META', type: 'PUT', strike: 480, expiry: '2026-04-03', vol_oi: 9.3, value: '$3.5M', sentiment: 'Bearish' },
];

const OptionsRadar = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Unusual Flow', value: '$24.5B', icon: <TrendingUp size={20} />, color: '#00FF41' },
          { label: 'Bullish Sentiment', value: '68%', icon: <Percent size={20} />, color: '#00E5FF' },
          { label: 'Daily Scan Count', value: '14,204', icon: <MousePointer2 size={20} />, color: '#FFD700' },
        ].map((stat, idx) => (
          <div key={idx} className="glass p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold mono tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="glass overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <h3 className="font-bold flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-[#00FF41] animate-pulse" />
             LIVE OPTIONS FLOW
           </h3>
           <button className="text-zinc-500 hover:text-white transition-colors">
              <Info size={16} />
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <tr>
                <th className="p-4 border-b border-white/5">Ticker</th>
                <th className="p-4 border-b border-white/5">Type</th>
                <th className="p-4 border-b border-white/5">Strike</th>
                <th className="p-4 border-b border-white/5">Expiry</th>
                <th className="p-4 border-b border-white/5">Vol/OI</th>
                <th className="p-4 border-b border-white/5">Total Value</th>
                <th className="p-4 border-b border-white/5">Sentiment</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {mockOptions.map((opt, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={opt.id} 
                  className="hover:bg-white/5 transition-colors group border-b border-white/5"
                >
                  <td className="p-4 font-bold mono text-white group-hover:text-[#00FF41] transition-colors">{opt.ticker}</td>
                  <td className={`p-4 ${opt.type === 'CALL' ? 'ticker-green' : 'ticker-red'}`}>{opt.type}</td>
                  <td className="p-4 mono">${opt.strike}</td>
                  <td className="p-4 text-zinc-400">{opt.expiry}</td>
                  <td className="p-4 mono text-[#00E5FF]">{opt.vol_oi}x</td>
                  <td className="p-4 font-bold">{opt.value}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider
                      ${opt.sentiment.includes('Bullish') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}
                    `}>
                      {opt.sentiment}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OptionsRadar;
