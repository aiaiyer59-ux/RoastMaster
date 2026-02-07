import React, { useState, useRef, useEffect } from 'react';
import { generateRoast } from './services/geminiService';
import { RoastMessage, RoastTone, LoadingState } from './types';
import { SpiceSlider } from './components/SpiceSlider';
import { RoastOutput } from './components/RoastOutput';
import { Send, X, Zap, Image as ImageIcon, Target } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<RoastMessage[]>([]);
  const [targetText, setTargetText] = useState('');
  const [contextText, setContextText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [tone, setTone] = useState<RoastTone>('witty');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingState]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRoast = async () => {
    if ((!targetText.trim() && !contextText.trim()) && !selectedImage) return;

    // Combine target and context for display and prompt
    let fullPrompt = "";
    if (targetText.trim()) fullPrompt += `Target: ${targetText.trim()}. `;
    if (contextText.trim()) fullPrompt += `${contextText.trim()}`;

    const userMsg: RoastMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: fullPrompt.trim() || "Roast this image.",
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoadingState('analyzing');
    
    // Reset inputs
    setTargetText('');
    setContextText('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      setTimeout(async () => {
        setLoadingState('roasting');
        try {
          const roastText = await generateRoast(userMsg.content, currentImage || undefined, { tone });
          
          const aiMsg: RoastMessage = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: roastText,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
           const errorMsg: RoastMessage = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: "I broke trying to comprehend your request. Even AI has limits.",
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, errorMsg]);
        } finally {
          setLoadingState('idle');
        }
      }, 800);
      
    } catch (error) {
      setLoadingState('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRoast();
    }
  };

  const shareRoast = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'RoastMaster AI Result',
        text: `RoastMaster AI destroyed me: "${text}"`,
        url: window.location.href
      }).catch(console.error);
    } else {
        alert("Sharing not supported on this browser, but the roast is copied!");
    }
  };

  return (
    <div className="min-h-screen bg-roast-dark text-white flex flex-col items-center font-sans">
      {/* Header */}
      <header className="w-full p-4 flex flex-col items-center border-b border-white/5 bg-roast-dark/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2">
           <div className="bg-gradient-to-tr from-roast-red to-roast-orange p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,42,42,0.5)]">
             <Zap className="text-white fill-white" size={20} />
           </div>
           <h1 className="text-xl md:text-2xl font-black tracking-tighter italic">
             ROAST<span className="text-roast-red">MASTER</span>
           </h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 w-full max-w-2xl p-4 flex flex-col gap-6 overflow-y-auto pb-64 md:pb-56">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-8 text-center opacity-70">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4 animate-pulse">
                <span className="text-3xl">💀</span>
            </div>
            <h2 className="text-lg font-bold mb-2">Prepare for Destruction</h2>
            <p className="text-gray-400 text-sm max-w-xs">
              Select a tone, enter a target, and I'll do the rest.
              Warning: "Emotional Damage" mode is not for the faint of heart.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
                <div className="bg-gray-800 text-gray-100 p-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-gray-700">
                    {msg.image && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-gray-600">
                            <img src={msg.image} alt="User upload" className="max-w-full max-h-64 object-cover" />
                        </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
            ) : (
                <RoastOutput message={msg} onShare={shareRoast} />
            )}
          </div>
        ))}

        {loadingState !== 'idle' && (
             <div className="flex flex-col gap-2 items-start animate-fade-in">
                <div className="flex items-center gap-2 text-roast-orange text-xs font-bold uppercase tracking-widest">
                    <span className="animate-spin">⚙️</span>
                    {loadingState === 'analyzing' ? 'Scanning for insecurities...' : 'Formulating verbal assault...'}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="w-full max-w-2xl p-3 fixed bottom-0 z-40 bg-gradient-to-t from-roast-dark via-roast-dark to-transparent pt-10">
        <SpiceSlider level={tone} onChange={setTone} />

        <div className="bg-roast-card/95 backdrop-blur-xl border border-gray-700 rounded-2xl p-3 shadow-2xl flex flex-col gap-3">
            
            {/* Image Preview */}
            {selectedImage && (
                <div className="relative w-fit mx-1">
                    <img src={selectedImage} alt="Preview" className="h-16 w-auto rounded-lg border border-roast-orange/50" />
                    <button 
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-roast-red text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    >
                        <X size={10} />
                    </button>
                </div>
            )}

            {/* Inputs Container */}
            <div className="flex flex-col gap-2">
                {/* Target Input */}
                <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2 border border-white/5">
                    <Target size={16} className="text-gray-500" />
                    <input
                        type="text"
                        value={targetText}
                        onChange={(e) => setTargetText(e.target.value)}
                        placeholder="Who/What are we roasting? (e.g. My Boss, This Code)"
                        className="bg-transparent w-full text-sm text-white placeholder-gray-500 outline-none"
                    />
                </div>

                {/* Main Content Input */}
                <div className="flex items-end gap-2">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-gray-400 hover:text-roast-orange hover:bg-white/5 rounded-xl transition-colors"
                        title="Upload Image"
                    >
                        <ImageIcon size={22} />
                    </button>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                    />

                    <textarea
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedImage ? "Add context..." : "Add details, context, or notes..."}
                        className="flex-1 bg-transparent text-white placeholder-gray-500 text-base resize-none outline-none py-2.5 max-h-32 scrollbar-hide"
                        rows={1}
                    />

                    <button 
                        onClick={handleRoast}
                        disabled={((!targetText.trim() && !contextText.trim()) && !selectedImage) || loadingState !== 'idle'}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                            ((!targetText.trim() && !contextText.trim()) && !selectedImage) || loadingState !== 'idle'
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-roast-red text-white shadow-[0_0_15px_rgba(255,42,42,0.4)] hover:shadow-[0_0_25px_rgba(255,42,42,0.6)] hover:scale-105 active:scale-95'
                        }`}
                    >
                        <Send size={20} className={loadingState !== 'idle' ? 'hidden' : 'block'} fill="currentColor" />
                        {loadingState !== 'idle' && (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}