import React from 'react';
import { RoastMessage } from '../types';
import { Copy, Share2, Flame } from 'lucide-react';

interface RoastOutputProps {
  message: RoastMessage;
  onShare: (text: string) => void;
}

export const RoastOutput: React.FC<RoastOutputProps> = ({ message, onShare }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAi = message.role === 'ai';

  if (!isAi) return null;

  return (
    <div className="w-full animate-fade-in-up">
      <div className="relative group bg-gradient-to-br from-roast-card to-[#2a1010] p-6 rounded-2xl border border-roast-red/20 shadow-lg shadow-roast-red/5">
        <div className="absolute -top-3 -left-3 bg-roast-dark border border-roast-red p-2 rounded-full">
            <Flame className="text-roast-red w-6 h-6 animate-pulse-fast" />
        </div>
        
        <div className="mb-4">
          <h3 className="text-roast-red font-black uppercase text-xs tracking-widest mb-2">The Verdict</h3>
          <p className="text-lg md:text-xl text-gray-100 leading-relaxed font-medium whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
                <Copy size={14} />
                {copied ? 'COPIED!' : 'COPY'}
            </button>
            <button 
                onClick={() => onShare(message.content)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-roast-orange transition-colors"
            >
                <Share2 size={14} />
                SHARE
            </button>
        </div>
      </div>
    </div>
  );
};