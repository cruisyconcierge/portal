import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, AlertCircle,
  LogOut, CheckCircle2, Navigation, Ship, Anchor, Waves, Info
} from 'lucide-react';

/**
 * CRUISY TRAVEL AMBASSADOR PORTAL
 * Refined Brand Identity: Russo One, Pacifico, Roboto
 * Palette: Southernmost Buoy (Red, Yellow, Black) + Cruisy Teal
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const WP_BASE_URL = 'https://cruisytravel.com';
const CPT_SLUG = 'itinerary';
const BRAND_BLUE = '#34a4b8';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  
  const [profile, setProfile] = useState({
    fullName: '',
    slug: '', 
    bio: 'Travel Enthusiast & Cruisy Ambassador',
    destination: 'Key West',
    email: '',
    password: ''
  });
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem('cruisy_session');
    if (savedSession) {
      const data = JSON.parse(savedSession);
      setProfile(data.profile);
      setSelectedIds(data.selectedIds || []);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('cruisy_session', JSON.stringify({ profile, selectedIds }));
    }
  }, [profile, selectedIds, isLoggedIn]);

  const fetchItineraries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/${CPT_SLUG}?per_page=100&_embed`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      
      const mapped = data.map(item => ({
        id: item.id,
        name: item.title?.rendered || 'Untitled Activity',
        category: item.acf?.category || 'General',
        destination: item.acf?.destination_tag || 'Key West',
        price: item.acf?.price ? `$${item.acf.price}` : 'View Pricing',
        duration: item.acf?.duration || 'Varies',
        bookingUrl: item.acf?.booking_url || item.link,
        img: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '🚢'
      }));
      setItineraries(mapped);
    } catch (err) {
      setError(`Sync Error: ${err.message}. Check WordPress CORS settings.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchItineraries();
  }, [isLoggedIn]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (profile.fullName && profile.slug) setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('setup');
  };

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getAffiliateLink = (originalUrl) => {
    const ref = profile.slug || 'ambassador';
    const connector = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${connector}asn=cruisyconcierge&asn-ref=${ref}`;
  };

  // --- LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-roboto flex items-center justify-center relative p-4">
        {/* Full Screen Tropical Background */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[10%] brightness-[50%]"
          style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

        <div className="relative z-10 max-w-md w-full animate-in">
          {/* Buoy Branding Card */}
          <div className="bg-black rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-4 border-zinc-800 overflow-hidden">
            {/* The Buoy Accent Strip */}
            <div className="h-6 flex">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#34a4b8]" />
            </div>

            <div className="p-10 space-y-8">
              <div className="text-center">
                <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-16 mx-auto mb-2" alt="Cruisy" />
                <h1 className="flex flex-col items-center">
                  <span className="font-pacifico text-4xl text-[#34a4b8] lowercase">cruisy</span>
                  <span className="font-russo text-2xl text-yellow-400 tracking-[0.2em] uppercase">Ambassador</span>
                </h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Affiliate Access Gate</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase ml-3">Full Name</label>
                    <input 
                      required
                      className="w-full p-4 rounded-2xl bg-white border-2 border-zinc-800 focus:border-[#34a4b8] text-black font-bold outline-none transition-all"
                      placeholder="e.g. Nubia Garcia"
                      value={profile.fullName}
                      onChange={e => setProfile({...profile, fullName: e.target.value})}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase ml-3">Username / URL Slug</label>
                  <input 
                    required
                    className="w-full p-4 rounded-2xl bg-white border-2 border-zinc-800 focus:border-yellow-400 text-black font-bold outline-none transition-all"
                    placeholder="e.g. capt-nubia"
                    value={profile.slug}
                    onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase ml-3">Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full p-4 rounded-2xl bg-white border-2 border-zinc-800 focus:border-red-600 text-black font-bold outline-none transition-all"
                    placeholder="••••••••"
                    value={profile.password}
                    onChange={e => setProfile({...profile, password: e.target.value})}
                  />
                </div>
                
                <button className="w-full bg-[#34a4b8] hover:bg-white hover:text-black text-white py-5 rounded-3xl font-russo text-xl shadow-xl transition-all flex items-center justify-center gap-3 mt-6">
                  {authMode === 'login' ? 'ENTER PORTAL' : 'SET SAIL'}
                  <Anchor size={20} />
                </button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-zinc-500 hover:text-yellow-400 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  {authMode === 'login' ? "Register New Ambassador" : "Back to Login"}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-8 text-center text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">90 Miles to Cuba | Cruisy Travel Affiliate Network</p>
        </div>
      </div>
    );
  }

  // --- INTERNAL APP ---
  return (
    <div className="min-h-screen font-roboto text-slate-200 bg-[#020617] relative">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.2] pointer-events-none grayscale-[20%]"
        style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }}
      />
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 px-8 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="flex items-center gap-4">
          <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-12" alt="Cruisy" />
          <div className="flex flex-col ml-1">
            <span className="font-pacifico text-2xl text-[#34a4b8] leading-none lowercase">cruisy</span>
            <span className="font-russo text-[11px] text-yellow-400 tracking-[0.2em] leading-none uppercase">Ambassador</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-white/60">ACTIVE: {profile.slug.toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* BUOY PROGRESS BAR */}
      <div className="w-full h-2 flex bg-zinc-900">
        <div className={`h-full flex-1 transition-all duration-700 ${activeTab === 'setup' ? 'bg-[#34a4b8] shadow-[0_0_15px_rgba(52,164,184,0.5)]' : 'bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-700 ${activeTab === 'experiences' ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-700 ${activeTab === 'preview' ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-700 ${activeTab === 'submit' ? 'bg-[#34a4b8] shadow-[0_0_15px_rgba(52,164,184,0.5)]' : 'bg-zinc-800'}`} />
      </div>

      <main className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
          {[
            { id: 'setup', icon: User, label: 'Profile', color: 'text-[#34a4b8]' },
            { id: 'experiences', icon: Palmtree, label: 'Experiences', color: 'text-yellow-400' },
            { id: 'preview', icon: Eye, label: 'Preview', color: 'text-white' },
            { id: 'submit', icon: Send, label: 'Go Live', color: 'text-[#34a4b8]' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-5 px-8 py-6 rounded-3xl font-bold transition-all text-left group
                ${activeTab === tab.id 
                  ? 'bg-white/10 shadow-2xl border border-white/20' 
                  : 'hover:bg-white/5 opacity-40 hover:opacity-100'
                }`}
            >
              <tab.icon size={22} className={activeTab === tab.id ? tab.color : 'text-slate-500'} />
              <span className={`font-russo uppercase tracking-[0.15em] text-sm ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* WORKSPACE */}
        <div className="lg:col-span-9">
          
          {/* PROFILE FORM */}
          {activeTab === 'setup' && (
            <div className="p-10 rounded-[3rem] border border-white/10 bg-slate-900/40 backdrop-blur-md animate-in">
              <h2 className="text-3xl font-russo mb-2 flex items-center gap-4 text-[#34a4b8]">
                <Anchor /> Profile Setup
              </h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Configure your public-facing ambassador profile</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1">Display Name</label>
                  <input 
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-[#34a4b8] outline-none transition-all text-white font-bold"
                    value={profile.fullName}
                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1">Reference ID</label>
                  <div className="w-full p-5 rounded-3xl bg-white/5 border border-white/5 text-white/30 font-black tracking-widest uppercase">
                    {profile.slug}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1">Home Market</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {DESTINATIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setProfile({...profile, destination: d})}
                        className={`p-4 rounded-2xl border text-[10px] font-black transition-all uppercase tracking-tighter
                          ${profile.destination === d 
                            ? 'bg-[#34a4b8] border-[#34a4b8] text-white shadow-xl' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[11px] font-black text-white/50 uppercase tracking-widest ml-1">Short Bio</label>
                  <textarea 
                    rows="4"
                    className="w-full p-6 rounded-[2rem] bg-white/5 border border-white/10 focus:border-[#34a4b8] outline-none transition-all text-sm leading-relaxed text-white font-roboto"
                    value={profile.bio}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* EXPERIENCE SELECTION */}
          {activeTab === 'experiences' && (
            <div className="space-y-8 animate-in">
              <div className="flex items-center justify-between bg-slate-900/40 p-8 rounded-[3rem] border border-white/10 backdrop-blur-md">
                <div>
                  <h2 className="text-3xl font-russo mb-1 flex items-center gap-4 text-yellow-400">
                    <Ship /> Experiences
                  </h2>
                  <p className="text-xs text-white/40 font-black uppercase tracking-[0.3em]">Showing Itineraries in {profile.destination}</p>
                </div>
                {loading && <Loader2 className="animate-spin text-yellow-400" />}
              </div>

              {error && (
                <div className="p-6 bg-red-900/20 border border-red-600 text-red-500 rounded-3xl flex items-center gap-4">
                  <AlertCircle size={28} /> 
                  <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {itineraries
                  .filter(exp => exp.destination === profile.destination)
                  .map((itinerary) => (
                    <div 
                      key={itinerary.id}
                      onClick={() => toggleExperience(itinerary.id)}
                      className={`group relative overflow-hidden rounded-[2.5rem] border-2 transition-all cursor-pointer p-6 flex gap-6
                        ${selectedIds.includes(itinerary.id) 
                          ? 'border-yellow-400 bg-yellow-400/5 shadow-2xl' 
                          : 'border-white/5 bg-slate-900/30 hover:border-white/20'}`}
                    >
                      <div className="w-24 h-24 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden relative shadow-2xl border border-white/5">
                        {itinerary.img.length > 5 ? (
                          <img src={itinerary.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-20 text-4xl font-russo uppercase">Cruisy</div>
                        )}
                        {selectedIds.includes(itinerary.id) && (
                          <div className="absolute inset-0 bg-yellow-400/90 flex items-center justify-center text-black font-black">
                            <CheckCircle2 size={40}/>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black bg-white/10 px-3 py-1 rounded-full uppercase mb-2 inline-block text-white/60 tracking-widest">{itinerary.category}</span>
                        <h4 className="font-russo text-sm leading-tight pr-6 text-white group-hover:text-yellow-400 transition-colors uppercase tracking-tight">{itinerary.name}</h4>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <p className="text-xs font-russo text-yellow-400">{itinerary.price}</p>
                          <p className="text-[10px] text-white/30 font-bold uppercase">{itinerary.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* BUOY PREVIEW */}
          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start animate-in">
              <div className="md:col-span-6 flex justify-center">
                <div className="w-[330px] h-[680px] bg-zinc-950 rounded-[4rem] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-[12px] border-zinc-900 relative">
                  <div className="w-full h-full bg-white rounded-[3rem] overflow-y-auto relative flex flex-col text-slate-900 scrollbar-hide font-roboto">
                    {/* Buoy Head */}
                    <div className="h-4 bg-red-600" /><div className="h-4 bg-yellow-400" />
                    
                    <div className="bg-[#0c0c0c] text-white p-12 text-center relative overflow-hidden">
                      <div className="absolute top-4 left-4 opacity-[0.03] font-russo text-5xl leading-none uppercase pointer-events-none">90 MILES<br/>CUBA</div>
                      
                      <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-6 border-4 border-[#34a4b8] flex items-center justify-center text-3xl overflow-hidden shadow-2xl relative z-10 font-russo">
                        {profile.fullName?.charAt(0) || 'C'}
                      </div>
                      <h3 className="font-russo text-2xl tracking-[0.1em] uppercase relative z-10 leading-none">{profile.fullName || 'AMBASSADOR'}</h3>
                      <div className="inline-block px-5 py-2 bg-yellow-400 text-black text-[10px] font-black rounded-full my-6 uppercase tracking-widest relative z-10">
                        {profile.destination} Expert
                      </div>
                      <p className="text-[12px] opacity-70 leading-relaxed font-medium relative z-10 font-roboto">{profile.bio}</p>
                    </div>
                    
                    <div className="p-6 space-y-4 flex-1 bg-slate-50">
                      {selectedIds.map(id => {
                        const it = itineraries.find(i => i.id === id);
                        if (!it) return null;
                        return (
                          <div key={id} className="p-5 bg-white border border-slate-200 rounded-3xl flex items-center justify-between shadow-sm hover:translate-x-1 transition-transform">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden text-xs font-russo uppercase opacity-40">Cruisy</div>
                              <div>
                                <p className="text-[12px] font-bold leading-none text-slate-800 uppercase tracking-tight">{it.name}</p>
                                <p className="text-[10px] text-[#34a4b8] font-black mt-2 uppercase tracking-tighter">{it.price}</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                          </div>
                        );
                      })}
                      
                      {selectedIds.length > 0 && (
                        <button className="w-full bg-[#34a4b8] text-white py-6 rounded-3xl font-russo text-sm shadow-2xl mt-8 tracking-[0.2em] uppercase">
                          BOOK EXPERIENCES
                        </button>
                      )}
                    </div>
                    
                    <div className="py-10 flex flex-col items-center opacity-30 grayscale">
                      <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-6" />
                    </div>
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-20" />
                </div>
              </div>

              <div className="md:col-span-6 space-y-8">
                <div className="p-10 rounded-[3rem] bg-slate-900/40 border border-white/10 backdrop-blur-md shadow-2xl">
                  <h3 className="text-2xl font-russo text-yellow-400 mb-10 flex items-center gap-4 uppercase tracking-tighter">
                    <Share2 size={28} /> Tracking Logic
                  </h3>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Public Ambassador URL</label>
                      <div className="p-6 bg-black border border-white/10 rounded-3xl flex items-center gap-6">
                        <div className="flex-1 text-sm font-black text-[#34a4b8] truncate tracking-widest uppercase">cruisytravel.com/{profile.slug}</div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(`https://cruisytravel.com/${profile.slug}`); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} 
                          className="bg-white text-black px-8 py-3 rounded-2xl font-russo text-[10px] uppercase hover:bg-yellow-400 transition-colors"
                        >
                          {copyStatus ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-8 bg-black/40 border border-white/5 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Info size={16} />
                        <h4 className="font-russo text-xs uppercase tracking-widest">Cruisy Tracking Engine</h4>
                      </div>
                      <p className="text-[12px] text-white/50 leading-relaxed font-roboto">
                        Your affiliate ID is hardwired to every booking link. When travelers click "Book," we automatically append: 
                        <span className="text-white font-bold block mt-2 font-mono bg-black/60 p-3 rounded-xl border border-white/5">?asn-ref={profile.slug}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT PAGE */}
          {activeTab === 'submit' && (
            <div className="max-w-xl mx-auto text-center space-y-12 animate-in pt-12">
              <div className="w-28 h-28 bg-[#34a4b8]/10 rounded-full flex items-center justify-center mx-auto border-2 border-[#34a4b8] text-[#34a4b8]">
                <Send size={48} className="animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-russo text-white uppercase tracking-tight leading-none">Finalize Portal</h2>
                <p className="text-white/40 font-black uppercase text-xs tracking-[0.4em]">Publish your curated Key West itineraries</p>
              </div>

              <div className="bg-slate-900/60 p-12 rounded-[4rem] border border-white/10 text-left space-y-8 shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Selected Experiences</span>
                  <span className="font-russo text-3xl text-yellow-400">{selectedIds.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Home Port</span>
                  <span className="font-russo text-xl text-white uppercase tracking-tighter">{profile.destination}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Affiliate ID</span>
                  <span className="font-mono text-[#34a4b8] text-sm font-black uppercase tracking-widest">{profile.slug}</span>
                </div>
              </div>

              <button 
                onClick={() => alert("Cruisy HQ Notified! We will verify your curated profile and publish it within 72 hours.")} 
                className="w-full bg-[#34a4b8] hover:bg-white hover:text-black text-white py-7 rounded-[3rem] font-russo text-2xl shadow-2xl transition-all uppercase tracking-[0.2em]"
              >
                REQUEST GO-LIVE
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 py-20 border-t border-white/5 text-center relative z-10 bg-black/20">
        <div className="flex items-center justify-center gap-6 mb-8 opacity-40">
          <div className="h-3 w-3 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
          <div className="h-3 w-3 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
          <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          <div className="h-3 w-3 rounded-full bg-[#34a4b8] shadow-[0_0_15px_rgba(52,164,184,0.8)]" />
        </div>
        <p className="text-[11px] font-russo uppercase tracking-[0.5em] text-white/30">Southernmost Ambassador Network</p>
        <p className="text-[9px] text-white/10 mt-4 uppercase tracking-widest font-black">Powered by Cruisy Travel Logistics</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&family=Pacifico&family=Russo+One&display=swap');
        
        .font-pacifico { font-family: 'Pacifico', cursive; }
        .font-russo { font-family: 'Russo One', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}} />
    </div>
  );
}
