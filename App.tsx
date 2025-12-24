
import React, { useState, useEffect, useCallback } from 'react';
import { ApodData, AppTab } from './types';
import { nasaService } from './services/nasaService';
import Background from './components/Background';
import NavBar from './components/NavBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import ApodDetail from './components/ApodDetail';
import ApodCard from './components/ApodCard';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.HOME);
  const [apods, setApods] = useState<ApodData[]>([]);
  const [randomApods, setRandomApods] = useState<ApodData[]>([]);
  const [searchResults, setSearchResults] = useState<ApodData[]>([]);
  const [favorites, setFavorites] = useState<ApodData[]>(() => {
    const saved = localStorage.getItem('cosmos_pins');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedApod, setSelectedApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  
  // Explore states
  const [keywordQuery, setKeywordQuery] = useState('');
  const [exploreDate, setExploreDate] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    localStorage.setItem('cosmos_pins', JSON.stringify(favorites));
  }, [favorites]);

  const fetchInitialData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const dates = nasaService.getRecentBatch(10, offset);
      const results = await Promise.all(
        dates.map(date => nasaService.getByDate(date).catch(() => null))
      );
      const validResults = results.filter(r => r !== null) as ApodData[];
      setApods(prev => [...prev, ...validResults]);
    } catch (err) {
      setError('Stellar transmission interrupted.');
    } finally {
      setLoading(false);
    }
  }, [offset]);

  const fetchRandomData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const results = await nasaService.getRandom(10);
      setRandomApods(prev => [...prev, ...results]);
    } catch (err) {
      setError('Stellar coordinates failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKeywordSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keywordQuery.trim()) return;
    
    setIsSearching(true);
    setLoading(true);
    setError(null);
    try {
      const results = await nasaService.searchLibrary(keywordQuery);
      setSearchResults(results);
    } catch (err) {
      setError('Search failed. The cosmos is vast and sometimes silent.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDate = async () => {
    if (!exploreDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await nasaService.getByDate(exploreDate);
      setSelectedApod(data);
    } catch (err: any) {
      setError(err.message || 'Error navigating to that date.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === AppTab.HOME && apods.length === 0) fetchInitialData();
    if (currentTab === AppTab.RANDOM && randomApods.length === 0) fetchRandomData();
  }, [currentTab, apods.length, randomApods.length, fetchInitialData, fetchRandomData]);

  const toggleFavorite = (apod: ApodData) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.date === apod.date);
      if (exists) return prev.filter(f => f.date !== apod.date);
      return [apod, ...prev];
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 300 && !loading) {
      if (currentTab === AppTab.HOME) setOffset(prev => prev + 10);
      else if (currentTab === AppTab.RANDOM) fetchRandomData();
    }
  };

  const renderExploreTab = () => {
    if (isSearching && searchResults.length > 0) {
      return (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">Results for "{keywordQuery}"</h2>
            <button 
              onClick={() => { setIsSearching(false); setSearchResults([]); }}
              className="text-blue-400 text-xs font-bold uppercase tracking-widest"
            >
              Clear Search
            </button>
          </div>
          <div className="masonry-grid pb-32">
            {searchResults.map((item, idx) => (
              <ApodCard key={`${item.date}-${idx}`} data={item} onClick={setSelectedApod} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-start min-h-[80vh] pt-4 animate-fade-in max-w-lg mx-auto pb-32">
        {/* Visual Header */}
        <div className="relative mb-12 text-center">
           <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full" />
           <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Discovery Hub</h2>
           <p className="text-white/40 text-sm">Navigate the infinite archives of NASA</p>
        </div>

        {/* 1. Keyword Search (Prominent) */}
        <section className="w-full space-y-3 mb-12">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">
            Search NASA Library
          </label>
          <form onSubmit={handleKeywordSearch} className="relative group">
            <input 
              type="text"
              placeholder="Mars, Galaxies, Apollo 11..."
              value={keywordQuery}
              onChange={(e) => setKeywordQuery(e.target.value)}
              className="w-full bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 py-5 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xl"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 aspect-square bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center text-white transition-all active:scale-90"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </section>

        {/* Separator Decor */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

        {/* 2. Date Picker (Secondary) */}
        <section className="w-full space-y-4 mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
              Target APOD Date
            </label>
          </div>
          
          <div className="flex flex-col gap-3">
            <input 
              type="date"
              value={exploreDate}
              max={new Date().toISOString().split('T')[0]}
              min="1995-06-16"
              onChange={(e) => setExploreDate(e.target.value)}
              className="w-full bg-neutral-800/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
            <button 
              onClick={handleSearchDate}
              disabled={!exploreDate || loading}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 text-white font-bold text-xs tracking-widest uppercase transition-all"
            >
              {loading && !isSearching ? 'Initiating Jump...' : 'Find APOD'}
            </button>
          </div>
        </section>

        {/* 3. Random Button (Last) */}
        <button 
          onClick={() => setCurrentTab(AppTab.RANDOM)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-[0.3em] hover:from-blue-600/20 hover:to-purple-600/20 transition-all active:scale-95"
        >
          — Start Random Voyage —
        </button>
      </div>
    );
  };

  const renderContent = () => {
    let displayList: ApodData[] = [];

    switch (currentTab) {
      case AppTab.HOME:
        displayList = apods;
        break;
      case AppTab.RANDOM:
        displayList = randomApods;
        break;
      case AppTab.FAVORITES:
        displayList = favorites;
        break;
      case AppTab.EXPLORE:
        return renderExploreTab();
    }

    if (displayList.length === 0 && !loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8 animate-fade-in">
          <p className="text-white/30 text-sm italic">This sector of space appears empty.</p>
          {currentTab === AppTab.FAVORITES && (
            <button onClick={() => setCurrentTab(AppTab.HOME)} className="mt-6 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Discover More
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="masonry-grid pb-32">
        {displayList.map((apod, idx) => (
          <ApodCard key={`${apod.date}-${idx}`} data={apod} onClick={setSelectedApod} />
        ))}
        {loading && <LoadingSkeleton />}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <Background />
      <main className="h-screen overflow-y-auto no-scrollbar" onScroll={handleScroll}>
        <div className="max-w-7xl mx-auto px-4 pt-12">
          <header className="mb-10 flex justify-between items-end">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </div>
                <h1 className="font-orbitron text-2xl font-bold tracking-tighter text-white uppercase leading-none">CosmosPin</h1>
              </div>
              <p className="text-white/40 text-[9px] tracking-[0.4em] uppercase font-bold mt-1">Visual Galactic Archive</p>
            </div>
            {currentTab === AppTab.HOME && <div className="hidden md:block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-bold text-white/60 uppercase tracking-widest">Day {offset / 10 + 1}</div>}
          </header>

          {error && (
            <div className="mb-8 p-5 rounded-[24px] bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </span>
              <button onClick={() => { setError(null); fetchInitialData(); }} className="bg-red-500/20 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[10px]">Retry</button>
            </div>
          )}

          {renderContent()}
        </div>
      </main>
      <NavBar currentTab={currentTab} setTab={setCurrentTab} />
      {selectedApod && <ApodDetail apod={selectedApod} onClose={() => setSelectedApod(null)} onToggleFavorite={toggleFavorite} isFavorite={favorites.some(f => f.date === selectedApod.date)} />}
    </div>
  );
};

export default App;
