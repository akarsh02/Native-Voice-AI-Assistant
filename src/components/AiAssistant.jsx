import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Radar Assistant. I can help you analyze unusual options, insider activity, and even find free parking. How can I assist you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState('AIzaSyB-QUm5m49OSv3dX-GU-JGuujMEX-kiJrk'); // Using the same key from mobile for demo
  
  const chatSession = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are The Radar's built-in AI intelligence. You have access to real-time-style modules for Stock Options Flow (unusual volume), Insider Trading (SEC filings), and Free Parking data. \n\n1. Be analytical, professional, and slightly futuristic.\n2. Help users find 'weird' data patterns.\n3. Keep responses concise and formatted for a dashboard UI.\n4. If asked about parking, provide helpful tips for finding free spots in major cities."
      });
      chatSession.current = model.startChat({
        history: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      });
    }
  }, [apiKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMsg = inputText;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputText('');
    setIsProcessing(true);

    try {
      if (chatSession.current) {
        const result = await chatSession.current.sendMessage(userMsg);
        const responseText = result.response.text();
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "API Key not configured correctly. Please check connection." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I hit a network error. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full gap-4 max-w-4xl mx-auto">
      {/* AI Header */}
      <div className="glass p-6 bg-gradient-to-br from-purple-500/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center pulsate">
             <Bot size={28} color="white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Radar Intelligence</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">GEMINI-2.5-FLASH ACTIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 text-[10px] font-black tracking-tighter text-[#A855F7] border-purple-500/20 uppercase">
          Neural-Link: OK
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass overflow-hidden flex flex-col p-4 bg-black/20">
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 pb-4">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl flex flex-col gap-1
                  ${msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'glass text-zinc-200 rounded-tl-none border-white/5'}
                `}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'user' ? <UserIcon size={12} /> : <Sparkles size={12} className="text-purple-400" />}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                      {msg.role === 'user' ? 'You' : 'Radar AI'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isProcessing && (
            <div className="flex justify-start">
               <div className="glass p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                 <div className="flex gap-1">
                   <div className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce" />
                   <div className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                 </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex gap-3">
          <button 
            onClick={toggleListening}
            className={`h-12 w-12 glass flex items-center justify-center transition-all
              ${isListening ? 'bg-red-500/20 text-red-500 pulsate' : 'text-zinc-500 hover:text-white'}
            `}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <div className="flex-1 glass flex items-center px-4 gap-3 focus-within:border-purple-500/40 transition-all">
            <input 
              type="text" 
              placeholder="Ask anything about the radars or your habits..." 
              className="bg-transparent border-none outline-none flex-1 text-sm font-medium py-3"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isProcessing}
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={isProcessing || !inputText.trim()}
            className="h-12 px-6 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 hover:brightness-110 active:scale-95 transition-all text-white font-bold flex items-center gap-2"
          >
             <Send size={18} />
             <span className="hidden md:inline">Ask Assistant</span>
          </button>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {[
          { text: "Analyze NVDA unusual flow", icon: <Zap size={14} /> },
          { text: "Where is free parking in SF?", icon: <MapPin size={14} /> }
        ].map((p, i) => (
           <button 
             key={i} 
             onClick={() => setInputText(p.text)}
             className="glass p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between text-left group"
           >
             <span>{p.text}</span>
             <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
           </button>
        ))}
      </div>
    </div>
  );
};

export default AiAssistant;
