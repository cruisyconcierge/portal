import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus, Moon, Sun,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, AlertCircle,
  LogOut, CheckCircle2, Navigation
} from 'lucide-react';

/**
 * CRUISY TRAVEL AMBASSADOR PORTAL - PRODUCTION VERSION
 * Configured for Vite + Vercel Deployment
 * WordPress CPT: itinerary
 * ACF: booking_url, price, duration, category, destination_tag
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const WP_BASE_URL = 'https://cruisytravel.com';
const CPT_SLUG = 'itinerary';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [darkMode, setDarkMode] = useState(true);
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

  // Persistence logic
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
    try {
      // Fetching from WP REST API
      const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/${CPT_SLUG}?per_page=100&_embed`);
      if (!response.ok) throw new Error('Failed to sync with Cruisy Travel database.');
      const data = await response.json();
      
      const mapped = data.map(item => ({
        id: item.id,
        name: item.title.rendered,
        category: item.acf?.category || 'General',
        destination: item.acf?.destination_tag || 'Key West',
        price: item.acf?.price ? `$${item.acf.price}` : 'View Pricing',
        duration: item.acf?.duration || 'Varies',
        bookingUrl: item.acf?.booking_url || item.link,
        img: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '🚢'
      }));
      
      setItineraries(mapped);
      setError(null);
    } catch (err) {
      setError("Sync Error: Please ensure REST API and CORS are enabled on your WordPress site.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchItineraries();
  }, [isLoggedIn]);

  const handleAuth = (e) => {
    e.preventDefault();
    if (profile.fullName && profile.slug) {
      setIsLoggedIn(true);
    }
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

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen font-sans flex items-center justify-center p-6 ${darkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-sm">
          <div className="text-center">
            <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-16 mx-auto mb-6" alt="Cruisy Logo" />
            <h1 className="text-3xl font-bold text-yellow-400 tracking-wider font-serif">AMBASSADOR GATE</h1>
            <p className="text-zinc-500 mt-2 text-xs uppercase tracking-widest font-bold">Key West Affiliate Hub</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <input 
                required
                placeholder="Full Name"
                className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-[#34a4b8] outline-none transition-all"
                value={profile.fullName}
                onChange={e => setProfile({...profile, fullName: e.target.value})}
              />
            )}
            <input 
              required
              placeholder="Username / Unique Slug"
              className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-[#34a4b8] outline-none transition-all"
              value={profile.slug}
              onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})}
            />
            <input 
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-[#34a4b8] outline-none transition-all"
              value={profile.password}
              onChange={e => setProfile({...profile, password: e.target.value})}
            />
            <button className="w-full bg-[#34a4b8] text-white py-4 rounded-xl font-black text-lg shadow-lg hover:brightness-110 transition-all">
              {authMode === 'login' ? 'ENTER PORTAL' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="text-center pt-4">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-yellow-400 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              {authMode === 'login' ? "New Ambassador? Join here" : "Return to Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER */}
      <nav className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-10" alt="Cruisy" />
          <div className="hidden md:block h-6 w-px bg-zinc-700 mx-2" />
          <span className="hidden md:block font-serif text-yellow-400 text-sm tracking-widest">AMBASSADOR: {profile.slug.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors">
            <LogOut size={16} /> <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </nav>

      {/* MULTI-BAND PROGRESS BAR (Buoy Colors) */}
      <div className="w-full h-2 flex">
        <div className={`h-full flex-1 transition-all duration-500 ${activeTab === 'setup' ? 'bg-red-600' : 'bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-500 ${activeTab === 'experiences' ? 'bg-yellow-400' : 'bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-500 ${activeTab === 'preview' ? 'bg-white' : 'bg-zinc-800'}`} />
        <div className={`h-full flex-1 transition-all duration-500 ${activeTab === 'submit' ? 'bg-[#34a4b8]' : 'bg-zinc-800'}`} />
      </div>

      <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0">
          {[
            { id: 'setup', icon: User, label: 'Profile', color: 'text-red-600' },
            { id: 'experiences', icon: Palmtree, label: 'Experiences', color: 'text-yellow-400' },
            { id: 'preview', icon: Eye, label: 'Live Preview', color: 'text-white' },
            { id: 'submit', icon: Send, label: 'Go Live', color: 'text-[#34a4b8]' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-left
                ${activeTab === tab.id ? 'bg-zinc-800 shadow-xl border-l-4 border-l-yellow-400' : 'hover:bg-zinc-900/50'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? tab.color : 'text-zinc-500'} />
              <div className="flex flex-col">
                <span className={`text-sm ${activeTab === tab.id ? 'text-white' : 'text-zinc-400'}`}>{tab.label}</span>
                <span className="text-[10px] opacity-40 uppercase tracking-tighter">Settings</span>
              </div>
            </button>
          ))}
        </div>

        {/* WORKSPACE */}
        <div className="lg:col-span-9">
          
          {activeTab === 'setup' && (
            <div className="p-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/30 animate-in">
              <h2 className="text-3xl font-serif mb-2 flex items-center gap-3">
                <User className="text-red-600" /> PROFILE HUB
              </h2>
              <p className="text-zinc-500 text-sm mb-8 uppercase tracking-widest font-bold">Configure your ambassador page</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Public Name</label>
                  <input 
                    className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-red-600 outline-none transition-all"
                    value={profile.fullName}
                    onChange={e => setProfile({...profile, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Tracking Slug</label>
                  <input className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 cursor-not-allowed" value={profile.slug} disabled />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Primary Destination</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DESTINATIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setProfile({...profile, destination: d})}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all
                          ${profile.destination === d ? 'bg-red-600 border-red-600' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Traveler Bio</label>
                  <textarea 
                    rows="4"
                    className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-red-600 outline-none transition-all"
                    value={profile.bio}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experiences' && (
            <div className="space-y-6 animate-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif mb-1 flex items-center gap-3">
                    <Palmtree className="text-yellow-400" /> ITINERARIES
                  </h2>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Market: {profile.destination}</p>
                </div>
                {loading && <Loader2 className="animate-spin text-yellow-400" />}
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-900 text-red-500 rounded-2xl flex items-center gap-3">
                  <AlertCircle size={20} /> <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itineraries
                  .filter(exp => exp.destination === profile.destination)
                  .map((itinerary) => (
                    <div 
                      key={itinerary.id}
                      onClick={() => toggleExperience(itinerary.id)}
                      className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer p-4 flex gap-4
                        ${selectedIds.includes(itinerary.id) ? 'border-yellow-400 bg-zinc-900 shadow-lg' : 'border-zinc-800 bg-black/40 hover:border-zinc-700'}`}
                    >
                      <div className="w-16 h-16 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden relative">
                        {itinerary.img.length > 5 ? <img src={itinerary.img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30">🚢</div>}
                        {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-yellow-400/80 flex items-center justify-center text-black font-bold"><CheckCircle2 size={24}/></div>}
                      </div>
                      <div className="flex-1">
                        <span className="text-[8px] font-black bg-zinc-800 px-2 py-0.5 rounded uppercase mb-1 inline-block text-zinc-400">{itinerary.category}</span>
                        <h4 className="font-bold text-sm leading-tight line-clamp-2">{itinerary.name}</h4>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs font-black text-yellow-400">{itinerary.price}</p>
                          <p className="text-[10px] text-zinc-500">{itinerary.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start animate-in">
              <div className="md:col-span-5 flex justify-center">
                <div className="w-[300px] h-[600px] bg-[#111] rounded-[3rem] p-3 shadow-2xl border-[8px] border-[#222] relative">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-y-auto relative flex flex-col text-slate-900 scrollbar-hide">
                    <div className="h-1.5 bg-red-600" /><div className="h-1.5 bg-yellow-400" />
                    <div className="bg-[#0c0c0c] text-white p-8 text-center">
                      <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-4 border-4 border-[#34a4b8] flex items-center justify-center text-2xl overflow-hidden shadow-lg shadow-[#34a4b8]/20">
                        {profile.fullName?.charAt(0) || '🌴'}
                      </div>
                      <h3 className="font-serif text-lg tracking-wider uppercase">{profile.fullName || 'Ambassador'}</h3>
                      <div className="inline-block px-3 py-1 bg-yellow-400 text-black text-[9px] font-black rounded-full mb-4">EXPERTO: {profile.destination.toUpperCase()}</div>
                      <p className="text-[10px] opacity-70 leading-relaxed px-4">{profile.bio}</p>
                    </div>
                    <div className="p-4 space-y-2 flex-1 bg-slate-50">
                      {selectedIds.map(id => {
                        const it = itineraries.find(i => i.id === id);
                        if (!it) return null;
                        return (
                          <div key={id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs overflow-hidden">
                                {it.img.length > 5 ? <img src={it.img} className="w-full h-full object-cover" /> : '📍'}
                              </div>
                              <p className="text-[10px] font-bold truncate w-32">{it.name}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-300" />
                          </div>
                        );
                      })}
                      <button className="w-full bg-[#34a4b8] text-white py-3 rounded-xl font-black shadow-lg mt-4 text-[10px] uppercase tracking-widest">RESERVAR AHORA</button>
                    </div>
                    <div className="py-4 flex flex-col items-center opacity-30 grayscale"><img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-4" /></div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 space-y-6">
                <div className="p-8 rounded-[2rem] bg-zinc-900/50 border border-zinc-800 shadow-xl">
                  <h3 className="text-xl font-serif text-yellow-400 mb-6 flex items-center gap-2"><Share2 size={20} /> TRACKING ENGINE</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-black border border-zinc-800 rounded-2xl flex items-center gap-3">
                      <div className="flex-1 text-xs font-mono text-zinc-400 truncate">cruisytravel.com/{profile.slug}</div>
                      <button onClick={() => { navigator.clipboard.writeText(`https://cruisytravel.com/${profile.slug}`); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs">
                        {copyStatus ? 'COPIED' : 'COPY'}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 italic">Affiliate ID <span className="text-[#34a4b8] font-bold">?asn-ref={profile.slug}</span> is automatically appended to all booking links.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submit' && (
            <div className="max-w-xl mx-auto text-center space-y-8 animate-in">
              <div className="w-20 h-20 bg-[#34a4b8]/10 rounded-full flex items-center justify-center mx-auto border-2 border-[#34a4b8] text-[#34a4b8]"><Send size={32} /></div>
              <h2 className="text-3xl font-serif text-white uppercase">Ready to go live?</h2>
              <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800 text-left space-y-4">
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span className="text-xs font-bold text-zinc-500 uppercase">Items</span><span className="font-bold text-yellow-400">{selectedIds.length}</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-2"><span className="text-xs font-bold text-zinc-500 uppercase">Tracking</span><span className="font-mono text-[#34a4b8]">{profile.slug}</span></div>
              </div>
              <button onClick={() => alert("Request sent to Cruisy Admin! You will be notified when your page is live.")} className="w-full bg-[#34a4b8] text-white py-5 rounded-3xl font-black text-xl shadow-2xl hover:scale-[1.02] transition-all">PUBLISH PORTAL</button>
            </div>
          )}
        </div>
      </main>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
