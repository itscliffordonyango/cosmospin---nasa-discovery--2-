
import React, { useState } from 'react';
import { ApodData } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ApodDetailProps {
  apod: ApodData;
  onClose: () => void;
  onToggleFavorite: (apod: ApodData) => void;
  isFavorite: boolean;
}

const ApodDetail: React.FC<ApodDetailProps> = ({ apod, onClose, onToggleFavorite, isFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const isVideo = apod.media_type === 'video';

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    }
    return url;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NASA APOD: ${apod.title}`,
          text: `Check out this cosmic discovery from ${apod.date}: ${apod.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(apod.hdurl || apod.url);
      alert('Link copied to clipboard!');
    }
  };

  const fetchAiInsight = async () => {
    if (aiInsight || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain this NASA Astronomy Picture of the Day to a curious person in a poetic and engaging way. Focus on the science but keep it accessible. 
        Title: ${apod.title}
        Description: ${apod.explanation}`,
        config: {
          systemInstruction: "You are a cosmic storyteller. Your goal is to make space exploration feel magical yet educational. Keep responses under 150 words.",
        },
      });
      setAiInsight(response.text || "The stars are silent today. Try again later.");
    } catch (err) {
      setAiInsight("Unable to connect to the cosmic archives at this time.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto no-scrollbar animate-fade-in flex flex-col">
      <div className="relative min-h-screen flex flex-col max-w-4xl mx-auto w-full">
        {/* Header Controls */}
        <div className="sticky top-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={() => onToggleFavorite(apod)}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/10 transition-colors ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-white'} active:scale-90`}
            >
              <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="flex-shrink-0 flex items-center justify-center bg-black/40 py-2">
          {isVideo ? (
            <div className="w-full aspect-video">
              <iframe 
                src={getEmbedUrl(apod.url)}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          ) : (
            <img 
              src={apod.hdurl || apod.url} 
              alt={apod.title}
              className="w-full h-auto max-h-[85vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            />
          )}
        </div>

        {/* Details Panel */}
        <div className="flex-1 bg-neutral-900/95 backdrop-blur-3xl p-6 rounded-t-[40px] mt-[-30px] border-t border-white/10 z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="max-w-2xl mx-auto pb-20">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-start mb-2">
              <p className="text-blue-400 text-[10px] font-orbitron tracking-[0.3em] uppercase">
                {apod.date}
              </p>
              {apod.media_type === 'image' && (
                <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">High Res</span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-6 leading-tight tracking-tight">
              {apod.title}
            </h1>

            {/* AI Insight Section */}
            <div className="mb-8 p-5 rounded-3xl bg-blue-500/5 border border-blue-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                 <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                 </svg>
               </div>
               
               <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                 </span>
                 Cosmic Insight
               </h3>
               
               {aiInsight ? (
                 <p className="text-blue-100/90 text-sm leading-relaxed italic animate-fade-in">
                   "{aiInsight}"
                 </p>
               ) : (
                 <button 
                   onClick={fetchAiInsight}
                   disabled={isAiLoading}
                   className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-sm font-semibold transition-all"
                 >
                   {isAiLoading ? (
                     <>
                       <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                       Summoning knowledge...
                     </>
                   ) : (
                     <>
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                       </svg>
                       Generate Stellar Summary
                     </>
                   )}
                 </button>
               )}
            </div>
            
            <div className="relative">
              <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Background</h4>
              <p className={`text-white/70 text-base leading-relaxed ${!isExpanded ? 'line-clamp-6' : ''}`}>
                {apod.explanation}
              </p>
              {!isExpanded && apod.explanation.length > 200 && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="mt-4 text-white text-xs font-bold uppercase tracking-wider border-b border-white/20 pb-0.5"
                >
                  Expand Full Text
                </button>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
               <div className="flex flex-col gap-1">
                 <span className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Credit</span>
                 <p className="text-white/60 text-sm">
                   {apod.copyright ? apod.copyright.replace(/\n/g, ' ') : 'Public Domain / NASA'}
                 </p>
               </div>
               
               <button 
                 onClick={() => window.open(apod.hdurl || apod.url, '_blank')}
                 className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:shadow-white/10"
               >
                 View High-Resolution Image
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApodDetail;
