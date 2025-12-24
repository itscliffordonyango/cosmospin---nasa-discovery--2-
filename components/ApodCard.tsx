
import React from 'react';
import { ApodData } from '../types';

interface ApodCardProps {
  data: ApodData;
  onClick: (data: ApodData) => void;
}

const ApodCard: React.FC<ApodCardProps> = ({ data, onClick }) => {
  const isVideo = data.media_type === 'video';

  return (
    <div 
      className="masonry-item relative group cursor-pointer overflow-hidden rounded-2xl animate-fade-in"
      onClick={() => onClick(data)}
    >
      <div className="relative aspect-auto">
        {isVideo ? (
          <div className="aspect-video bg-neutral-900 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <img 
            src={data.url} 
            alt={data.title}
            className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        )}
        
        {/* Overlay Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
          <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight">
            {data.title}
          </h3>
          <p className="text-white/60 text-[10px] mt-1 font-orbitron">
            {data.date}
          </p>
        </div>

        {/* Minimal Static Info (Mobile visible) */}
        <div className="absolute bottom-2 right-2 md:hidden">
          <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white">
            {isVideo ? 'VIDEO' : 'IMAGE'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApodCard;
