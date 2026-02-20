import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, CircleAlert,
  LogOut, CircleCheck, Navigation, Ship, Anchor, Waves, Info, X, Settings, 
  Sun, Umbrella, Sunset, Compass, Sparkles, Mail, BookOpen, Lightbulb, TrendingUp, Zap, ShieldCheck,
  AlertCircle, Layout, Fingerprint
} from 'lucide-react';

/**
 * CRUISY AMBASSADOR PROGRAM - portal.cruisytravel.com
 * Simplified Workflow: All-in-one setup followed by Copy and Send
 * Branding: Russo One / Pacifico / Teal #34a4b8
 * Constraints: No I references. No em dashes.
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
const LOGO_URL = 'https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png';

// MODAL COMPONENT
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white">
      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-russo text-lg text-slate-800 uppercase tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors border-none bg-transparent cursor-pointer">
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
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('cruisy_current_session_slug') !== null);
  const [authMode, setAuthMode] = useState('login'); 
  const [activeModal, setActiveModal] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [copyStatus, setCopyStatus] = useState(false);
  const [disclosureAgreed, setDisclosureAgreed] = useState(false);
  const [currentStep, setCurrentStep] = useState('preview'); // preview, disclosure, final

  // --- PROFILE STATE ---
  const [profile, setProfile] = useState(() => {
    const activeSlug = localStorage.getItem('cruisy_current_session_slug');
    if (activeSlug) {
      const saved = localStorage.getItem(`cruisy_user_${activeSlug}`);
      if (saved) {
        try {
          return JSON.parse(saved).profile;
        } catch (e) {
          console.error("Parse error", e);
        }
      }
    }
    return { 
      fullName: '', 
      slug: '', 
      email: '', 
      bio: '', 
      destination: 'Key West', 
      password: '',
      theme: 'tropical'
    };
  });
  
  const [selectedIds, setSelectedIds] = useState(() => {
    const activeSlug = localStorage.getItem('cruisy_current_session_slug');
    if (activeSlug) {
      const saved = localStorage.getItem(`cruisy_user_${activeSlug}`);
      if (saved) {
        try {
          return JSON.parse(saved).selectedIds || [];
        } catch (e) {
          console.error("Parse error", e);
        }
      }
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
  const fetchItineraries = async () => {
    setLoading(true);
    const endpoints = ['itinerary', 'itineraries'];
    let success = false;
    for (const slug of endpoints) {
      if (success) break;
      try {
        const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/${slug}?per_page=100&_embed`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const mapped = data.map(item => ({
              id: item.id,
              name: item.title?.rendered || 'Untitled Activity',
              category: item.acf?.category || 'Experiences',
              destinationTag: item.acf?.destination_tag || '',
              price: item.acf?.price ? `$${item.acf.price}` : 'Book Now',
              duration: item.acf?.duration || 'Flexible',
              bookingUrl: item.acf?.booking_url || item.link,
              img: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
            }));
            setItineraries(mapped);
            success = true;
          }
        }
      } catch (err) { console.warn(`Fetch on /${slug} failed:`, err); }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchItineraries();
  }, [isLoggedIn]);

  // --- ACTIONS ---
  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      if (!profile.fullName || !profile.slug || !profile.email) return alert("Please fill out your identity fields including your email.");
      setIsLoggedIn(true);
    } else {
      const savedData = localStorage.getItem(`cruisy_user_${profile.slug}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setProfile(data.profile);
        setSelectedIds(data.selectedIds || []);
      }
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cruisy_current_session_slug');
    setProfile({ fullName: '', slug: '', email: '', bio: '', destination: 'Key West', password: '', theme: 'tropical' });
    setSelectedIds([]);
  };

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- DATA PREPARATION FOR COPY ---
  const generateProfileTextBlock = () => {
    const experiencesList = selectedIds.map(id => {
      const it = itineraries.find(i => i.id === id);
      return `- ${it ? it.name : id}`;
    }).join('\n');

    return `CRUISY AMBASSADOR PROGRAM SUBMISSION
--------------------------------------
Travel Advisor Status: Cruisy Ambassador
Travel Advisor Name: ${profile.fullName || "Required Field Missing"}
Travel Advisor Email: ${profile.email || "Required Field Missing"}
Personal URL: cruisytravel.com/${profile.slug || "Required Field Missing"}
Base Port: ${profile.destination}
Selected Theme: ${profile.theme}

ADVISOR BIO:
${profile.bio || "No bio provided"}

SELECTED EXPERIENCES:
${experiencesList || "No experiences selected"}
--------------------------------------`;
  };

  const handleCopyToClipboard = () => {
    const text = generateProfileTextBlock();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const activeTheme = THEMES.find(t => t.id === profile.theme) || THEMES[0];

  // --- VIEWS ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center relative p-6 bg-slate-900">
        <div className="fixed inset-0 z-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }} />
        <div className="relative z-10 max-w-md w-full animate-in duration-700">
          <div className="bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
            <div className="pt-10 px-12 text-center">
              <div className="flex flex-col items-center justify-center mb-4">
                <img src={LOGO_URL} className="h-20 w-auto mb-2" alt="Logo" />
                <h1 className="font-russo text-4xl uppercase tracking-tighter leading-none">
                  Cruisy <span className="text-[#34a4b8]">Travel</span>
                </h1>
              </div>
              <p className="font-pacifico text-2xl text-[#34a4b8] -mt-1 mb-2">Cruisy Ambassador</p>
              <p className="font-russo text-[10px] text-slate-500 tracking-[0.5em] uppercase font-bold">Travel Advisor Portal</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex bg-slate-900/10 p-1 rounded-2xl">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-xl font-russo text-[10px] uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-600'}`}>Login</button>
                <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 rounded-xl font-russo text-[10px] uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-600'}`}>Sign Up</button>
              </div>
              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <>
                    <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none font-bold text-slate-800 shadow-sm" placeholder="Full Display Name" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                    <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none font-bold text-slate-800 shadow-sm" type="email" placeholder="Personal Email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                    <textarea className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800 font-medium text-sm shadow-sm" placeholder="Short Bio (Optional)" rows="2" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
                  </>
                )}
                <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none font-bold text-slate-800 shadow-sm" placeholder="Advisor Username" value={profile.slug} onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                <input type="password" required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800 shadow-sm" placeholder="Password" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} />
                <button type="submit" className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo text-lg shadow-xl shadow-[#34a4b8]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer border-none">
                   {authMode === 'login' ? 'ENTER LOUNGE' : 'JOIN NETWORK'}
                   <Ship size={20} />
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
          <img src={LOGO_URL} className="h-10 w-auto" alt="Logo" />
          <div className="flex items-center gap-2">
            <span className="font-russo text-2xl md:text-3xl text-slate-800 leading-none">Cruisy</span>
            <span className="font-russo text-2xl md:text-3xl text-[#34a4b8] uppercase leading-none tracking-tighter">travel</span>
          </div>
          <div className="hidden lg:block h-6 w-px bg-slate-200 mx-2" />
          <span className="hidden lg:block font-pacifico text-lg text-[#34a4b8] mt-1">Ambassador Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="font-russo text-[10px] text-slate-400 tracking-widest uppercase leading-none font-bold">Active Travel Advisor</span>
            <span className="font-russo text-[#34a4b8] text-xl font-bold leading-none mt-1 uppercase tracking-tight">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-200 cursor-pointer border-none"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-10 pb-40 space-y-12">
        
        {/* SECTION 1: IDENTITY & URL */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-white shadow-xl space-y-8 animate-in">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <div className="p-3 bg-[#34a4b8]/10 text-[#34a4b8] rounded-2xl"><Fingerprint size={28} /></div>
              <div>
                <h2 className="font-russo text-2xl uppercase text-slate-800">1. Profile Identity</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Define your professional presence</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Name</label>
                <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" placeholder="e.g. Jane Doe" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ambassador Username (URL Slug)</label>
                <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" placeholder="e.g. janetravels" value={profile.slug} onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                <p className="text-[10px] text-[#34a4b8] font-bold mt-2 px-1 italic leading-relaxed">
                   Your username will define your personal web address: <span className="underline">cruisytravel.com/{profile.slug || 'username'}</span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Personal Email</label>
                <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" type="email" placeholder="Required for contact button" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Primary Base Port</label>
                <select className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" value={profile.destination} onChange={e => setProfile({...profile, destination: e.target.value})}>
                  {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bio Hook (Short Introduction)</label>
                <textarea rows="3" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-800 font-medium shadow-sm focus:border-[#34a4b8]" placeholder="Tell guests why they should book with you..." value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
              </div>
           </div>
        </section>

        {/* SECTION 2: THEME */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-white shadow-xl space-y-8 animate-in">
           <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
              <div className="p-3 bg-[#34a4b8]/10 text-[#34a4b8] rounded-2xl"><Layout size={28} /></div>
              <div>
                <h2 className="font-russo text-2xl uppercase text-slate-800">2. Profile Theme</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Select your visual branding</p>
              </div>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setProfile({...profile, theme: t.id})} className={`p-5 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${profile.theme === t.id ? 'border-[#34a4b8] bg-[#34a4b8]/5 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
                  <t.icon size={24} style={{ color: profile.theme === t.id ? t.color : 'inherit' }} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
           </div>
        </section>

        {/* SECTION 3: EXPERIENCES */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-white shadow-xl space-y-8 animate-in">
           <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#34a4b8]/10 text-[#34a4b8] rounded-2xl"><Palmtree size={28} /></div>
                <div>
                  <h2 className="font-russo text-2xl uppercase text-slate-800">3. Curate Experiences</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Selected: {selectedIds.length}</p>
                </div>
              </div>
              <button onClick={() => { setActiveModal('preview'); setCurrentStep('preview'); }} className="hidden sm:flex items-center gap-2 bg-[#34a4b8] text-white px-6 py-3 rounded-xl font-russo text-xs shadow-lg hover:scale-105 transition-all border-none cursor-pointer"><Eye size={16} /> Preview Page</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itineraries.length > 0 ? itineraries
                .filter(exp => {
                  const port = profile.destination.toLowerCase();
                  return String(exp.destinationTag || '').toLowerCase().includes(port) || 
                         String(exp.name || '').toLowerCase().includes(port);
                })
                .map((itinerary) => (
                <div key={itinerary.id} onClick={() => toggleExperience(itinerary.id)} className={`p-4 rounded-[2rem] border-2 flex items-center gap-5 cursor-pointer transition-all ${selectedIds.includes(itinerary.id) ? 'border-[#34a4b8] bg-[#34a4b8]/5 shadow-sm' : 'border-slate-50 bg-white hover:border-slate-100'}`}>
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200 flex-shrink-0 shadow-inner">
                    {itinerary.img ? <img src={itinerary.img} className="w-full h-full object-cover" alt={itinerary.name} /> : <div className="w-full h-full flex items-center justify-center text-slate-300">🚢</div>}
                    {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-[#34a4b8]/80 flex items-center justify-center text-white"><CircleCheck size={24} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-black uppercase text-[#34a4b8] tracking-widest">{itinerary.category}</span>
                    <h4 className="font-bold text-xs truncate text-slate-800">{itinerary.name}</h4>
                    <p className="text-[#34a4b8] font-bold text-xs mt-1">{itinerary.price}</p>
                    </div>
                </div>
              )) : (
                <div className="md:col-span-2 py-10 text-center text-slate-400 italic">Connecting to Cruisy database...</div>
              )}
           </div>
        </section>

        {/* RESOURCE PROMPT */}
        <section onClick={() => setActiveModal('resources')} className="p-8 bg-slate-900 rounded-[3rem] border border-white flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer hover:brightness-110 transition-all shadow-xl">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#34a4b8] rounded-2xl flex items-center justify-center text-white shadow-lg"><BookOpen size={32} /></div>
              <div className="text-center md:text-left">
                <h4 className="font-russo text-white text-xl uppercase tracking-tight">Ambassador Toolkit</h4>
                <p className="text-slate-400 text-xs">Success stories, product updates, and growth tips for your travel business.</p>
              </div>
           </div>
           <ChevronRight className="text-[#34a4b8]" size={32} />
        </section>
      </main>

      {/* FIXED BOTTOM ACTION BAR */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-[90]">
         <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Check</p>
              <p className="font-russo text-sm text-slate-800 uppercase leading-none">{profile.fullName || 'New Advisor'} | {selectedIds.length} Selections</p>
            </div>
            <button 
               onClick={() => { setActiveModal('preview'); setCurrentStep('disclosure'); }}
               disabled={!profile.fullName || !profile.slug}
               className={`flex-1 md:flex-none px-12 py-5 rounded-2xl font-russo text-lg uppercase tracking-widest transition-all border-none cursor-pointer shadow-xl ${profile.fullName && profile.slug ? 'bg-[#34a4b8] text-white shadow-[#34a4b8]/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
               Finish and Send Setup Data
            </button>
         </div>
      </footer>

      {/* MODALS */}
      {activeModal === 'resources' && (
        <Modal title="Ambassador Toolkit" onClose={() => setActiveModal(null)}>
          <div className="space-y-6 pb-6 text-center">
            <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm mb-4">
              <h4 className="font-russo text-xl text-slate-900 uppercase mb-2">Grow Your Travel Business</h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">Discover our latest success stories and grab expert tips to grow your bookings.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl text-left"><div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><TrendingUp size={20} /></div><div><h5 className="font-russo text-xs uppercase text-slate-800">Success Stories</h5><p className="text-[10px] text-slate-400">See how our top partners maximize reach.</p></div></div>
              <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl text-left"><div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Zap size={20} /></div><div><h5 className="font-russo text-xs uppercase text-slate-800">Product Updates</h5><p className="text-[10px] text-slate-400">Latest itineraries and vault additions.</p></div></div>
              <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl text-left"><div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Lightbulb size={20} /></div><div><h5 className="font-russo text-xs uppercase text-slate-800">Growth Tips</h5><p className="text-[10px] text-slate-400">Pro strategies for sharing your link.</p></div></div>
            </div>
            <button onClick={() => window.open('https://cruisytravel.com/advisor-resources', '_blank')} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 cursor-pointer border-none"><ExternalLink size={20} /> Access Full Toolkit</button>
            <div className="pt-4 border-t border-slate-50"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Cruisy Travel Ambassador Hub</p></div>
          </div>
        </Modal>
      )}

      {activeModal === 'preview' && (
        <Modal title="Digital Advisor Preview" onClose={() => { setActiveModal(null); setCurrentStep('preview'); setDisclosureAgreed(false); }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-8">
            <div className="flex justify-center">
              <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-2 relative border-[8px] border-slate-800 shadow-xl shadow-black/40">
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
                  <div className="h-3 w-full" style={{ backgroundColor: activeTheme.color }} />
                  <div className={`p-6 text-center ${activeTheme.bg}`}>
                    <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: activeTheme.color }}><activeTheme.icon size={28} /></div>
                    <h5 className="font-russo text-lg uppercase text-slate-800 leading-tight">@{profile.slug || 'advisor'}</h5>
                    <p className="text-[9px] font-black uppercase mt-1" style={{ color: activeTheme.color }}>{profile.fullName || 'Ambassador'}</p>
                    <p className="font-pacifico text-[#34a4b8] text-sm mt-1">Cruisy Ambassador</p>
                    <p className="text-[9px] text-slate-500 italic mt-2 line-clamp-3 leading-relaxed">{profile.bio || "No bio provided."}</p>
                  </div>
                  <div className="px-5 py-2 border-y border-slate-50 flex items-center justify-between"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Curated Experiences</p><Compass size={10} className="text-slate-300" /></div>
                  <div className="px-5 pb-5 space-y-2 overflow-y-auto scrollbar-hide flex-1 pt-3">
                    {selectedIds.length === 0 && <p className="text-center py-10 text-[10px] italic text-slate-300">No experiences selected yet.</p>}
                    {selectedIds.map(id => {
                      const it = itineraries.find(i => i.id === id);
                      if (!it) return null;
                      return (
                        <div key={id} className="p-2 bg-white border border-slate-100 rounded-xl flex items-center gap-2 shadow-sm"><div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">{it.img ? <img src={it.img} className="w-full h-full object-cover" /> : <Ship className="m-auto opacity-20" size={16} />}</div><div className="flex-1 min-w-0 text-left"><span className="text-[8px] font-bold text-slate-700 uppercase truncate block leading-none">{it.name}</span><span className="text-[7px] font-black text-[#34a4b8] uppercase tracking-tighter mt-1 block">{it.price}</span></div><ChevronRight size={10} className="text-slate-300" /></div>
                      );
                    })}
                    {selectedIds.length > 0 && <div className="text-center"><button className="w-full text-white py-3 rounded-xl font-russo text-[9px] uppercase mt-4 shadow-lg" style={{ backgroundColor: activeTheme.color }}><Mail size={12} /> Contact Advisor</button><p className="font-pacifico text-[#34a4b8] text-[10px] mt-2">Cruisy Ambassador</p></div>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col h-full min-h-[580px]">
               {currentStep === 'disclosure' && (
                 <div className="space-y-6 animate-in">
                   <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-6 shadow-2xl border border-white/10">
                      <div className="flex items-center gap-3"><ShieldCheck className="text-[#34a4b8]" size={28} /><h4 className="font-russo text-lg uppercase leading-none">Program Disclosure</h4></div>
                      <div className="space-y-4 text-xs leading-relaxed text-slate-300 text-left">
                         <p>We are a technology partner and sub affiliate platform, not an employer.</p>
                         <p>We charge zero advisor fees (unlike most other programs).</p>
                         <p>We handle guest inquiries and follow up on weather cancellations for you.</p>
                         <p>The 10 to 12 percent commission covers the cost of the free website, your custom QR code, and our administrative support.</p>
                      </div>
                      <div className="pt-4 border-t border-white/10"><label className="flex items-start gap-3 cursor-pointer group text-left"><div className="relative flex items-center justify-center h-5 w-5 mt-0.5"><input type="checkbox" className="peer h-full w-full opacity-0 absolute cursor-pointer" checked={disclosureAgreed} onChange={(e) => setDisclosureAgreed(e.target.checked)} /><div className="h-full w-full border-2 border-white/20 rounded peer-checked:bg-[#34a4b8] peer-checked:border-[#34a4b8] transition-all" /><CircleCheck size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" /></div><span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">We understand the value of the Cruisy Ambassador Program and agree to these terms.</span></label></div>
                   </div>
                   <div className="flex gap-4">
                     <button onClick={() => setCurrentStep('preview')} className="flex-1 bg-slate-100 text-slate-500 py-6 rounded-[2.2rem] font-russo uppercase text-xs tracking-widest cursor-pointer border-none">Go Back</button>
                     <button disabled={!disclosureAgreed} onClick={() => setCurrentStep('final')} className={`flex-[2] py-6 rounded-[2.2rem] font-russo uppercase tracking-widest shadow-xl transition-all border-none cursor-pointer ${disclosureAgreed ? 'bg-[#34a4b8] text-white shadow-[#34a4b8]/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>Finish Selection</button>
                   </div>
                 </div>
               )}

               {currentStep === 'final' && (
                 <div className="space-y-6 animate-in">
                    <div className="p-8 bg-blue-50 border border-blue-200 rounded-[2.5rem] shadow-xl text-center space-y-6">
                       <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20"><AlertCircle size={40} /></div>
                       <div className="space-y-2"><h4 className="font-russo text-2xl text-blue-900 uppercase leading-none">Action Required</h4><p className="text-xs text-blue-700 leading-relaxed">To complete your setup, we need you to manually email us your profile details. Follow the two steps below.</p></div>
                       <div className="space-y-4 pt-4">
                          <div className="text-left"><p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">Step 1: Get your data</p><button onClick={handleCopyToClipboard} className={`w-full py-5 rounded-2xl font-russo uppercase tracking-widest flex items-center justify-center gap-3 transition-all border-none cursor-pointer ${copyStatus ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white shadow-slate-900/20'}`}>{copyStatus ? <><CircleCheck size={20} /> Copied!</> : <><Clipboard size={20} /> Copy My Profile Info</>}</button></div>
                          <div className="text-left"><p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">Step 2: Send to us</p><button onClick={() => window.location.href = `mailto:hello@cruisytravel.com?subject=New Travel Advisor Sign-Up: ${profile.fullName}`} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#34a4b8]/20 border-none cursor-pointer"><Mail size={20} /> Open Email to Send</button></div>
                       </div>
                       <div className="p-5 bg-white rounded-2xl text-[10px] text-slate-500 text-left border border-blue-100">
                          <p className="font-bold text-[#34a4b8] mb-2 uppercase tracking-widest leading-none text-center">Important Notice</p>
                          <p className="leading-relaxed mb-3 text-center">Click the button above to copy your info, then click the open email button and <span className="font-bold text-blue-900 uppercase underline">paste your info</span> into the body of the email to send it to us at <span className="font-bold">hello@cruisytravel.com</span>.</p>
                          <p className="italic opacity-70 text-center">Your profile will go live within 72 hours of verification.</p>
                       </div>
                    </div>
                    <button onClick={() => { setCurrentStep('preview'); setDisclosureAgreed(false); }} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#34a4b8] transition-colors bg-transparent border-none cursor-pointer">Edit Profile Before Sending</button>
                 </div>
               )}
            </div>
          </div>
        </Modal>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Roboto:wght@300;400;500;700;900&family=Russo+One&display=swap');
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
