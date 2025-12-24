
import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="masonry-grid w-full">
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="masonry-item rounded-2xl bg-white/5 animate-pulse"
          style={{ height: [200, 300, 250, 400][i % 4] + 'px' }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
