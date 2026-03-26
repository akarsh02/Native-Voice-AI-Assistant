import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const mockInsiders = [
  { id: 1, ticker: 'AMZN', name: 'Bezos Jeff', role: 'Director', type: 'SELL', amount: '$1.2B', price: '$178.50' },
  { id: 2, ticker: 'COIN', name: 'Armstrong Brian', role: 'CEO', type: 'SELL', amount: '$45M', price: '$245.10' },
  { id: 3, ticker: 'PLTR', name: 'Karp Alex', role: 'CEO', type: 'BUY', amount: '$12M', price: '$24.50' },
  { id: 4, ticker: 'SNOW', name: 'Ramaswamy Sridhar', role: 'CEO', type: 'BUY', amount: '$5M', price: '$165.20' },
  { id: 5, ticker: 'META', name: 'Zuckerberg Mark', role: 'CEO', type: 'SELL', amount: '$650M', price: '$505.40' },
];

const InsiderRadar = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Highlight */}
      <div className="glass p-8 bg-gradient-to-r from-blue-500/5 to-transparent relative overflow-hidden">
        <div className="flex flex-col gap-4 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF]">Insider Intelligence</span>
          <h2 className="text-3xl font-bold tracking-tight">Large-Scale Insider Activity Detected</h2>
          <p className="max-w-xl text-zinc-500">
            Scanning SEC Form 4 filings in real-time. Major executives are currently dumping growth stocks 
            while quietly accumulating value plays. 
          </p>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs font-medium">9.2B Selling Volume (24h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs font-medium">1.4B Buying Volume (24h)</span>
            </div>
          </div>
        </div>
        <Users size={120} className="absolute right-0 top-0 text-white/[0.03] -mr-10 -mt-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockInsiders.map((insider, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={insider.id}
            className="glass p-6 hover:border-white/20 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center 
                ${insider.type === 'BUY' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}
              `}>
                {insider.type === 'BUY' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg mono tracking-tighter">{insider.ticker}</span>
                  <span className="text-[10px] text-zinc-500 uppercase border border-white/10 px-1 rounded">{insider.role}</span>
                </div>
                <p className="text-sm font-medium text-white">{insider.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xl font-bold mono ${insider.type === 'BUY' ? 'ticker-green' : 'ticker-red'}`}>
                {insider.type === 'BUY' ? '+' : '-'}{insider.amount}
              </p>
              <p className="text-xs text-zinc-500 font-medium">Price: {insider.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InsiderRadar;
