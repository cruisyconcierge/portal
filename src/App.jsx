import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, CircleAlert,
  LogOut, CircleCheck, Navigation, Ship, Anchor, Waves, Info, X, Settings, 
  Sun, Umbrella, Sunset, Compass, Sparkles
} from 'lucide-react';

/**
 * ADVISOR PORTAL - portal.cruisytravel.com
 * Theme: Island Lounge / Professional Coastal
 * Workflow: Manual Review (72-hour lead time)
 * Branding: Russo One / Pacifico
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const THEMES = [
  { id: 'tropical', label: 'Tropical', color: '#34a4b8', icon: Palmtree, bg: 'bg-emerald-50' },
  { id: 'summer', label: 'Summer', color: '#f59e0b', icon: Sun, bg: 'bg-amber-50' },
  { id: 'cruise', label: 'Cruise', color: '#1e3a8a', icon: Ship, bg: 'bg-blue-50' },
  { id: 'island', label: 'Island', color: '#10b981', icon: Umbrella, bg: 'bg-teal-50' },
  { id: 'vacation', label: 'Vacation', color: '#ec4899', icon: Sunset, bg: 'bg-rose-50' }
];

const WP_BASE_URL = 'https://cruisytravel.com';

// MODAL COMPONENT
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white">
      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-russo text-lg text-slate-800 uppercase tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
        {children}
      </div>
    </div>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('cruisy_current_session_slug') !== null);
  const [authMode, setAuthMode] = useState('login'); 
  const [activeModal, setActiveModal] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [copyStatus, setCopyStatus] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- STATE INITIALIZATION ---
  const [profile, setProfile] = useState(() => {
    const activeSlug = localStorage.getItem('cruisy_current_session_slug');
    if (activeSlug) {
      const saved = localStorage.getItem(`cruisy_user_${activeSlug}`);
      if (saved) return JSON.parse(saved).profile;
    }
    return { 
      fullName: '', 
      slug: '', 
      bio: 'Certified Travel Advisor with Cruisy Travel.', 
      destination: 'Key West', 
      password: '',
      theme: 'tropical'
    };
  });
  
  const [selectedIds, setSelectedIds] = useState(() => {
    const activeSlug = localStorage.getItem('cruisy_current_session_slug');
    if (activeSlug) {
      const saved = localStorage.getItem(`cruisy_user_${activeSlug}`);
      if (saved) return JSON.parse(saved).selectedIds || [];
    }
    return [];
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    if (isLoggedIn && profile.slug) {
      localStorage.setItem(`cruisy_user_${profile.slug}`, JSON.stringify({ profile, selectedIds }));
      localStorage.setItem('cruisy_current_session_slug', profile.slug);
    }
  }, [profile, selectedIds, isLoggedIn]);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (isLoggedIn) {
      const fetchItems = async () => {
        try {
          const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/itinerary?per_page=100&_embed`);
          if (res.ok) {
            const data = await res.json();
            setItineraries(data.map(item => ({
              id: item.id,
              name: item.title?.rendered || 'Untitled',
              category: item.acf?.category || 'Experiences',
              destinationTag: item.acf?.destination_tag || '',
              price: item.acf?.price ? `$${item.acf.price}` : 'Book Now',
              bookingUrl: item.acf?.booking_url || item.link,
              img: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
            })));
          }
        } catch (e) { console.error(e); }
      };
      fetchItems();
    }
  }, [isLoggedIn]);

  // --- ACTIONS ---
  const handleSubmission = () => {
    setLoading(true);
    // Simulating the submission to admin
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      if (!profile.fullName || !profile.slug) return alert("Required fields missing.");
      setIsLoggedIn(true);
    } else {
      const savedData = localStorage.getItem(`cruisy_user_${profile.slug}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setProfile(data.profile);
        setSelectedIds(data.selectedIds);
      }
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cruisy_current_session_slug');
    setProfile({ fullName: '', slug: '', bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '', theme: 'tropical' });
    setSelectedIds([]);
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    if (mode === 'signup') {
      setProfile({ fullName: '', slug: '', bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '', theme: 'tropical' });
      setSelectedIds([]);
    }
  };

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const activeTheme = THEMES.find(t => t.id === profile.theme) || THEMES[0];

  // --- VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center relative p-6 bg-slate-900">
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }} />
        <div className="relative z-10 max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
            <div className="pt-10 px-12 text-center">
              <h1 className="flex flex-col items-center justify-center">
                <span className="font-pacifico text-7xl text-slate-900 leading-[0.7] tracking-tighter">Cruisy</span>
                <span className="font-russo text-4xl text-[#34a4b8] uppercase mt-3 tracking-widest">travel</span>
              </h1>
              <p className="font-russo text-[10px] text-slate-500 tracking-[0.5em] uppercase mt-4 font-bold">Advisor Portal</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex bg-slate-900/10 p-1 rounded-2xl">
                <button onClick={() => switchAuthMode('login')} className={`flex-1 py-2 rounded-xl font-russo text-[10px] uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-600'}`}>Login</button>
                <button onClick={() => switchAuthMode('signup')} className={`flex-1 py-2 rounded-xl font-russo text-[10px] uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-600'}`}>Sign Up</button>
              </div>
              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <>
                    <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none font-bold text-slate-800 shadow-sm" placeholder="Display Name (e.g. Matt S.)" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                    <textarea className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800 font-medium text-sm shadow-sm" placeholder="Short Bio" rows="2" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
                  </>
                )}
                <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none font-bold text-slate-800 shadow-sm" placeholder="Advisor Username" value={profile.slug} onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                <input type="password" required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800 shadow-sm" placeholder="Password" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} />
                <button type="submit" disabled={loading} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo text-lg shadow-xl shadow-[#34a4b8]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'ENTER LOUNGE' : 'CREATE PORTAL')}
                  {!loading && <Ship size={20} />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-pacifico text-4xl text-slate-800 leading-none">Cruisy</span>
          <span className="font-russo text-3xl text-[#34a4b8] uppercase leading-none tracking-tighter">travel</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="font-russo text-[10px] text-slate-400 tracking-widest uppercase leading-none font-bold">Active Advisor</span>
            <span className="font-russo text-[#34a4b8] text-xl font-bold leading-none mt-1 uppercase tracking-tight">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-200"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <section className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none" style={{ color: activeTheme.color }}><Ship size={400} /></div>
            <div className="space-y-6 relative z-10 max-w-xl text-center md:text-left">
                <h2 className="text-5xl md:text-7xl font-russo text-slate-800 uppercase leading-[0.85] tracking-tight">Advisor<br/><span style={{ color: activeTheme.color }}>Control</span></h2>
                <p className="text-slate-500 font-medium text-lg md:text-xl">Preview your official page at <span className="font-bold underline" style={{ color: activeTheme.color }}>cruisytravel.com/{profile.slug}</span></p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                <button onClick={() => setActiveModal('profile')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <Settings style={{ color: activeTheme.color }} className="group-hover:rotate-45 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Page Settings</span>
                </button>
                <button onClick={() => setActiveModal('itinerary')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <Palmtree style={{ color: activeTheme.color }} className="group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Select Experiences</span>
                </button>
                <button onClick={() => setActiveModal('preview')} className="sm:col-span-2 p-8 rounded-[2.5rem] flex items-center justify-center gap-6 hover:brightness-105 transition-all shadow-xl group" style={{ backgroundColor: activeTheme.color }}>
                    <Eye className="text-white group-hover:scale-110 transition-transform" size={32} />
                    <div className="flex flex-col items-start">
                         <span className="font-russo text-xl text-white uppercase tracking-tight leading-none">Live View</span>
                         <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">Buoy Digital Card</span>
                    </div>
                </button>
            </div>
        </section>

        {/* STATS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeTheme.color}15`, color: activeTheme.color }}><MapPin size={28} /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Port</p><p className="font-russo text-lg uppercase">{profile.destination}</p></div>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeTheme.color}15`, color: activeTheme.color }}><CircleCheck size={28} /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Experiences</p><p className="font-russo text-lg uppercase">{selectedIds.length} Selected</p></div>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeTheme.color}15`, color: activeTheme.color }}><Compass size={28} /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Theme</p><p className="font-russo text-lg uppercase">{activeTheme.label}</p></div>
            </div>
        </section>
      </main>

      {/* MODALS */}
      {activeModal === 'profile' && (
        <Modal title="Page Identity & Theme" onClose={() => setActiveModal(null)}>
          <div className="space-y-6 pb-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Name</label>
              <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Profile Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {THEMES.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setProfile({...profile, theme: t.id})} 
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${profile.theme === t.id ? 'border-slate-800 bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                  >
                    <t.icon size={20} />
                    <span className="text-[9px] font-black uppercase">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Home Port</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DESTINATIONS.map(d => (
                  <button key={d} onClick={() => setProfile({...profile, destination: d})} className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${profile.destination === d ? 'bg-[#34a4b8] text-white border-[#34a4b8]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>{d}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Advisor Hook (Bio)</label>
              <textarea rows="3" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-800 shadow-sm focus:border-[#34a4b8]" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
            </div>

            <button onClick={() => setActiveModal(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-russo uppercase tracking-widest shadow-lg">Save Settings</button>
          </div>
        </Modal>
      )}

      {activeModal === 'itinerary' && (
        <Modal title="Curate Experiences" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold flex items-center gap-3">
               <Sparkles size={16} /> Curate the best of {profile.destination} for your guests.
            </div>
            {itineraries.filter(exp => exp.destinationTag?.toLowerCase().includes(profile.destination.toLowerCase()) || exp.name.toLowerCase().includes(profile.destination.toLowerCase())).map(itinerary => (
              <div key={itinerary.id} onClick={() => toggleExperience(itinerary.id)} className={`p-4 rounded-[2rem] border-2 flex items-center gap-5 cursor-pointer transition-all ${selectedIds.includes(itinerary.id) ? 'border-[#34a4b8] bg-[#34a4b8]/5' : 'border-slate-50 bg-white'}`}>
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200">
                  {itinerary.img ? <img src={itinerary.img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🚢</div>}
                  {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-[#34a4b8]/80 flex items-center justify-center text-white"><CircleCheck size={24} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-russo text-xs uppercase text-slate-800 truncate">{itinerary.name}</h4>
                  <p className="text-[#34a4b8] font-bold text-xs mt-1">{itinerary.price}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase mt-4 shadow-lg">Confirm Selections</button>
          </div>
        </Modal>
      )}

      {activeModal === 'preview' && (
        <Modal title="Live Preview" onClose={() => { setActiveModal(null); setIsSubmitted(false); }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            <div className="flex justify-center">
              <div className="w-[260px] h-[540px] bg-slate-900 rounded-[3rem] p-2 relative border-[6px] border-slate-800 shadow-xl">
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
                  {/* DYNAMIC THEME STRIPE */}
                  <div className="h-3 w-full" style={{ backgroundColor: activeTheme.color }} />
                  
                  <div className={`p-5 text-center ${activeTheme.bg}`}>
                    <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: activeTheme.color }}>
                       <activeTheme.icon size={24} />
                    </div>
                    <h5 className="font-russo text-lg uppercase text-slate-800 leading-tight">@{profile.slug}</h5>
                    <p className="text-[9px] font-black uppercase mt-1" style={{ color: activeTheme.color }}>{profile.fullName || 'Ambassador'}</p>
                    <p className="text-[9px] text-slate-500 italic mt-2 line-clamp-3 leading-relaxed">{profile.bio}</p>
                  </div>

                  <div className="px-4 py-2 border-y border-slate-50">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recommended Itineraries</p>
                  </div>

                  <div className="px-4 pb-4 space-y-2 overflow-y-auto scrollbar-hide flex-1 pt-3">
                    {selectedIds.length === 0 && <p className="text-center py-10 text-[10px] italic text-slate-300">No experiences selected yet.</p>}
                    {selectedIds.map(id => {
                      const it = itineraries.find(i => i.id === id);
                      if (!it) return null;
                      return (
                        <div key={id} className="p-2 bg-white border border-slate-100 rounded-xl flex items-center gap-2 shadow-sm group cursor-pointer transition-all hover:border-slate-300">
                           <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                             {it.img ? <img src={it.img} className="w-full h-full object-cover" /> : <Ship className="m-auto opacity-20" size={16} />}
                           </div>
                           <div className="flex-1 min-w-0">
                             <span className="text-[8px] font-bold text-slate-700 uppercase truncate block">{it.name}</span>
                             <span className="text-[7px] font-black text-[#34a4b8] uppercase tracking-tighter">{it.price}</span>
                           </div>
                           <ChevronRight size={10} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      );
                    })}
                    {selectedIds.length > 0 && (
                      <button className="w-full text-white py-3 rounded-xl font-russo text-[9px] uppercase mt-4 shadow-lg shadow-black/10" style={{ backgroundColor: activeTheme.color }}>
                         Book Full Itinerary
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-5 pb-10">
               {!isSubmitted ? (
                 <>
                   <div className="p-6 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100">
                     <h6 className="font-russo text-[10px] uppercase text-slate-400">Share Your Link</h6>
                     <div className="p-3 bg-white rounded-xl flex items-center gap-2 border border-slate-200 shadow-inner">
                       <div className="flex-1 text-[10px] font-bold text-[#34a4b8] truncate lowercase">cruisytravel.com/{profile.slug}</div>
                       <button onClick={() => { navigator.clipboard.writeText(`https://cruisytravel.com/${profile.slug}`); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} className="p-2 text-[#34a4b8] bg-[#34a4b8]/10 rounded-lg transition-all hover:bg-[#34a4b8]/20">
                         {copyStatus ? <CircleCheck size={14} /> : <Clipboard size={14} />}
                       </button>
                     </div>
                     <div className="p-4 bg-white/50 rounded-xl space-y-2 border border-dashed border-slate-200">
                       <p className="text-[10px] text-slate-500 leading-relaxed italic">
                         Your page logic is active. Every click includes <span className="font-bold text-[#34a4b8]">?asn-ref={profile.slug}</span> for FareHarbor tracking.
                       </p>
                     </div>
                   </div>

                   <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-4">
                      <div className="p-2 bg-amber-400 rounded-full h-fit text-white"><Info size={16} /></div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-900">Submission Notice</p>
                        <p className="text-[10px] text-amber-800 leading-relaxed">Publishing will notify the Cruisy Admin to create your live page. Standard setup time is <span className="font-bold">72 hours</span>.</p>
                      </div>
                   </div>

                   <button onClick={handleSubmission} disabled={loading} className="w-full bg-[#34a4b8] text-white py-6 rounded-[2.2rem] font-russo uppercase tracking-widest shadow-xl shadow-[#34a4b8]/20 flex items-center justify-center gap-3 active:scale-95 transition-all">
                      {loading ? <Loader2 className="animate-spin" size={24} /> : "Publish to Network"}
                   </button>
                 </>
               ) : (
                 <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/20">
                       <CircleCheck size={40} />
                    </div>
                    <div className="space-y-2">
                       <h4 className="font-russo text-xl text-emerald-900 uppercase">Profile Submitted!</h4>
                       <p className="text-xs text-emerald-700 leading-relaxed">The Cruisy Team has been notified. We will review your curation and publish <span className="font-bold italic">cruisytravel.com/{profile.slug}</span> within 72 hours.</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-emerald-100">
                       <p className="text-[10px] font-bold text-emerald-800 uppercase">What's Next?</p>
                       <p className="text-[9px] text-emerald-600 mt-1">You will receive an email confirmation once your official page is dived and docked on the main site.</p>
                    </div>
                    <button onClick={() => setActiveModal(null)} className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest hover:underline">Return to Dashboard</button>
                 </div>
               )}
            </div>
          </div>
        </Modal>
      )}

      <footer className="mt-20 py-20 bg-white border-t border-slate-100 text-center">
        <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-10 mx-auto opacity-30 grayscale mb-8" />
        <p className="text-[11px] font-russo uppercase tracking-[0.6em] text-slate-200 font-bold">Advisor Logistics Hub</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Russo+One&display=swap');
        .font-pacifico { font-family: 'Pacifico', cursive; }
        .font-russo { font-family: 'Russo One', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}
