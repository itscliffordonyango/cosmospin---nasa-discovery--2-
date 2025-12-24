
import React from 'react';
import { AppTab } from '../types';

interface NavBarProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentTab, setTab }) => {
  const tabs = [
    { id: AppTab.HOME, label: 'Feed', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: AppTab.EXPLORE, label: 'Explore', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: AppTab.RANDOM, label: 'Random', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: AppTab.FAVORITES, label: 'Saved', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
              currentTab === tab.id ? 'text-white' : 'text-white/40'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            {currentTab === tab.id && (
              <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
