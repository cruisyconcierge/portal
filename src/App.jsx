import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, CircleAlert,
  LogOut, CircleCheck, Navigation, Ship, Anchor, Waves, Info, X, Settings, 
  Sun, Umbrella, Sunset, Compass, Sparkles, Mail, BookOpen, Lightbulb, TrendingUp, Zap, ShieldCheck,
  AlertCircle, Layout, Fingerprint, Plane
} from 'lucide-react';

/**
 * CRUISY AMBASSADOR PROGRAM - portal.cruisytravel.com
 * Theme: Island Lounge / Professional Coastal
 * Workflow: Popup-based Hub with Mailto/Copy fallback
 * Branding: Russo One / Pacifico / Teal #34a4b8
 * Constraints: No em dashes. Email body uses "I/my".
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const THEMES = [
  { id: 'tropical', label: 'Tropical', color: '#34a4b8', icon: Palmtree, bg: 'bg-emerald-50' },
  { id: 'summer', label: 'Summer', color: '#f59e0b', icon: Sun, bg: 'bg-amber-50' },
  { id: 'cruise', label: 'Cruise', color: '#1e3a8a', icon: Ship, bg: 'bg-blue-50' },
  { id: 'island', label: 'Island', color: '#10b981', icon: Anchor, bg: 'bg-teal-50' },
  { id: 'vacation', label: 'Vacation', color: '#ec4899', icon: Plane, bg: 'bg-rose-50' }
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

  // --- VALIDATION ---
  const isProfileComplete = profile.fullName && profile.slug && profile.email && profile.bio && profile.bio.length > 5;
  const hasExperiences = selectedIds.length > 0;
  const canFinalize = isProfileComplete && hasExperiences;

  // --- EMAIL COMPILATION ---
  const handleOpenEmail = () => {
    const experiencesList = selectedIds.map(id => {
      const it = itineraries.find(i => i.id === id);
      return `- ${it ? it.name : id}`;
    }).join('\r\n');

    const subject = `Ambassador Profile Setup: ${profile.fullName}`;
    const body = `Hello Cruisy Team,\r\n\r\nI have finished my curation. Please set up my profile with the following details:\r\n\r\nAdvisor Name: ${profile.fullName}\r\nAdvisor Email: ${profile.email}\r\nUsername/URL: cruisytravel.com/${profile.slug}\r\nBase Port: ${profile.destination}\r\nTheme: ${profile.theme}\r\n\r\nBio Hook:\r\n${profile.bio}\r\n\r\nCurated Experiences:\r\n${experiencesList}\r\n\r\nThank you!`;
    
    const mailto = `mailto:hello@cruisytravel.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const generateProfileTextBlock = () => {
    const experiencesList = selectedIds.map(id => {
      const it = itineraries.find(i => i.id === id);
      return `- ${it ? it.name : id}`;
    }).join('\n');

    return `CRUISY AMBASSADOR PROGRAM SUBMISSION\n--------------------------------------\nAdvisor Name: ${profile.fullName}\nAdvisor Email: ${profile.email}\nTarget URL: cruisytravel.com/${profile.slug}\nBase Port: ${profile.destination}\nTheme Choice: ${profile.theme}\n\nBIO HOOK:\n${profile.bio}\n\nCURATED EXPERIENCES:\n${experiencesList}\n--------------------------------------`;
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

  // --- ACTIONS ---
  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      if (!profile.fullName || !profile.slug || !profile.email) {
        return alert("Please fill out your identity fields including your email.");
      }
      if (profile.password.length < 7) {
        return alert("Please choose a password with more than 6 characters.");
      }
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
                <input 
                  type="password" 
                  required 
                  minLength={7}
                  className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800 shadow-sm" 
                  placeholder="Password (more than 6 characters)" 
                  value={profile.password} 
                  autoComplete={authMode === 'signup' ? "new-password" : "current-password"}
                  onChange={e => setProfile({...profile, password: e.target.value})} 
                />
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

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 pb-20">
        <section className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none" style={{ color: activeTheme.color }}><Ship size={400} /></div>
            <div className="space-y-6 relative z-10 max-w-xl text-center md:text-left">
                <div className="inline-block px-4 py-1.5 bg-[#34a4b8]/10 rounded-full mb-2">
                    <span className="font-pacifico text-[#34a4b8] text-xl">Cruisy Ambassador</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-russo text-slate-800 uppercase leading-[0.85] tracking-tight tracking-tighter">Advisor<br/><span style={{ color: activeTheme.color }}>Control</span></h2>
                <p className="text-slate-500 font-medium text-lg md:text-xl leading-relaxed">
                  Welcome to the Ambassador control panel. Complete your identity and curation to publish your live link at <span className="font-bold underline" style={{ color: activeTheme.color }}>cruisytravel.com/{profile.slug || 'username'}</span>
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                <button onClick={() => setActiveModal('profile')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg cursor-pointer border-none">
                    <Fingerprint style={{ color: activeTheme.color }} className="group-hover:rotate-12 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Profile Identity</span>
                </button>
                <button onClick={() => setActiveModal('itinerary')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg cursor-pointer border-none">
                    <Palmtree style={{ color: activeTheme.color }} className="group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Curated Experiences</span>
                </button>
                <button onClick={() => setActiveModal('resources')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg cursor-pointer border-none">
                    <BookOpen style={{ color: activeTheme.color }} className="group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Ambassador Toolkit</span>
                </button>
                <button 
                  onClick={() => { setActiveModal('preview'); setCurrentStep('preview'); }} 
                  className={`p-8 rounded-[2.5rem] flex items-center justify-center gap-6 hover:brightness-105 transition-all shadow-xl group cursor-pointer border-none text-white ${canFinalize ? 'opacity-100' : 'opacity-70'}`}
                  style={{ backgroundColor: activeTheme.color }}
                >
                    <Eye size={32} className="group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start text-left">
                         <span className="font-russo text-xl uppercase tracking-tight leading-none">Live View</span>
                         <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">Finalize & Send</span>
                    </div>
                </button>
            </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border flex items-center gap-6 shadow-sm transition-colors ${profile.fullName && profile.slug && profile.email && profile.bio ? 'border-emerald-200' : 'border-white'}`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeTheme.color}15`, color: activeTheme.color }}>
                  {profile.fullName && profile.slug && profile.email && profile.bio ? <CircleCheck size={28} className="text-emerald-500" /> : <User size={28} />}
                </div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity Status</p><p className="font-russo text-lg uppercase">{profile.fullName ? 'Complete' : 'Pending'}</p></div>
            </div>
            <div className={`bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border flex items-center gap-6 shadow-sm transition-colors ${selectedIds.length > 0 ? 'border-emerald-200' : 'border-white'}`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeTheme.color}15`, color: activeTheme.color }}>
                  {selectedIds.length > 0 ? <CircleCheck size={28} className="text-emerald-500" /> : <Sparkles size={28} />}
                </div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Curated Experiences</p><p className="font-russo text-lg uppercase">{selectedIds.length} Selected</p></div>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeTheme.color}15`, color: activeTheme.color }}><MapPin size={28} /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Port</p><p className="font-russo text-lg uppercase">{profile.destination}</p></div>
            </div>
        </section>
      </main>

      {/* MODALS */}
      {activeModal === 'profile' && (
        <Modal title="Profile Identity" onClose={() => setActiveModal(null)}>
          <div className="space-y-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Name <span className="text-red-500">*</span></label>
                <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" placeholder="e.g. Jane Smith" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Personal Email <span className="text-red-500">*</span></label>
                <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" type="email" placeholder="For setup notifications" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ambassador Username (Slug) <span className="text-red-500">*</span></label>
              <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" placeholder="e.g. jsmithtravel" value={profile.slug} onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} />
              <p className="text-[10px] text-[#34a4b8] font-bold mt-2 italic">This defines your URL: cruisytravel.com/{profile.slug || 'username'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Main Port</label>
              <select className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm focus:border-[#34a4b8]" value={profile.destination} onChange={e => setProfile({...profile, destination: e.target.value})}>
                {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bio Hook <span className="text-red-500">*</span></label>
              <textarea rows="3" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-slate-800 font-medium shadow-sm focus:border-[#34a4b8]" placeholder="A short blurb for your digital card..." value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
            </div>

            <button 
              disabled={!profile.fullName || !profile.email || !profile.slug || !profile.bio}
              onClick={() => setActiveModal(null)} 
              className={`w-full py-5 rounded-2xl font-russo uppercase tracking-widest shadow-lg border-none cursor-pointer transition-all ${(!profile.fullName || !profile.email || !profile.slug || !profile.bio) ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white shadow-slate-900/20'}`}
            >
              Update Profile
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'itinerary' && (
        <Modal title="Curated Experiences" onClose={() => setActiveModal(null)}>
          <div className="space-y-6 pb-4">
            <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold flex items-center gap-3 border border-blue-100">
               <Sparkles size={16} /> Select curated experiences you want on your profile page.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {itineraries.length > 0 ? itineraries
                  .filter(exp => {
                    const port = profile.destination.toLowerCase();
                    return String(exp.destinationTag || '').toLowerCase().includes(port) || 
                           String(exp.name || '').toLowerCase().includes(port);
                  })
                  .map((itinerary) => (
                  <div key={itinerary.id} onClick={() => toggleExperience(itinerary.id)} className={`p-4 rounded-[2rem] border-2 flex items-center gap-5 cursor-pointer transition-all ${selectedIds.includes(itinerary.id) ? 'border-[#34a4b8] bg-[#34a4b8]/5 shadow-sm' : 'border-slate-50 bg-white hover:border-slate-100'}`}>
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200 flex-shrink-0">
                      {itinerary.img ? <img src={itinerary.img} className="w-full h-full object-cover" alt={itinerary.name} /> : <div className="w-full h-full flex items-center justify-center text-slate-300">🚢</div>}
                      {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-[#34a4b8]/80 flex items-center justify-center text-white"><CircleCheck size={24} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black uppercase text-[#34a4b8] tracking-widest">{itinerary.category}</span>
                      <h4 className="font-bold text-xs truncate">{itinerary.name}</h4>
                      <p className="text-[#34a4b8] font-bold text-xs mt-1">{itinerary.price}</p>
                      </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-slate-400 italic md:col-span-2">Connecting to Cruisy database...</div>
                )}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase mt-4 shadow-lg border-none cursor-pointer">Confirm Selection</button>
          </div>
        </Modal>
      )}

      {activeModal === 'resources' && (
        <Modal title="Ambassador Toolkit" onClose={() => setActiveModal(null)}>
          <div className="space-y-6 pb-6 text-center">
            <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 shadow-sm mb-4">
              <div className="w-16 h-16 bg-[#34a4b8]/10 text-[#34a4b8] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#34a4b8]/20">
                <Sparkles size={32} />
              </div>
              <h4 className="font-russo text-2xl text-slate-900 uppercase mb-2">Coming Soon</h4>
              <p className="text-sm text-slate-50 leading-relaxed max-w-sm mx-auto">
                We are currently building our Ambassador Toolkit. This section will soon feature success stories, product updates, and growth tips for you as a Travel Advisor.
              </p>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-russo uppercase tracking-widest shadow-xl border-none cursor-pointer">Close Toolkit</button>
          </div>
        </Modal>
      )}

      {activeModal === 'preview' && (
        <Modal title="Live View & Send" onClose={() => { setActiveModal(null); setCurrentStep('preview'); setDisclosureAgreed(false); }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-8">
            <div className="flex justify-center">
              <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-2 relative border-[8px] border-slate-800 shadow-xl shadow-black/40">
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
                  <div className="h-3 w-full" style={{ backgroundColor: activeTheme.color }} />
                  <div className={`p-6 text-center ${activeTheme.bg}`}>
                    <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: activeTheme.color }}><activeTheme.icon size={28} /></div>
                    <h5 className="font-russo text-lg uppercase text-slate-800 leading-tight">@{profile.slug || 'advisor'}</h5>
                    <p className="text-[9px] font-black uppercase mt-1" style={{ color: activeTheme.color }}>{profile.fullName || 'Travel Advisor'}</p>
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
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col h-full min-h-[580px]">
               {currentStep === 'preview' && (
                 <div className="space-y-6 animate-in">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                        <Layout size={18} className="text-[#34a4b8]" />
                        <h4 className="font-russo text-xs uppercase text-slate-800">Visual Theme Select</h4>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {THEMES.map(t => (
                          <button key={t.id} onClick={() => setProfile({...profile, theme: t.id})} className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${profile.theme === t.id ? 'border-[#34a4b8] bg-white shadow-md' : 'bg-white text-slate-300 border-slate-50 hover:border-slate-100'}`}>
                            <t.icon size={16} style={{ color: profile.theme === t.id ? t.color : 'inherit' }} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-4">
                       <h6 className="font-russo text-[10px] uppercase text-slate-400 tracking-widest font-black leading-none">Content Check</h6>
                       <button 
                         onClick={() => setActiveModal('itinerary')}
                         className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-slate-100 text-slate-600 rounded-2xl font-russo text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all border-none cursor-pointer"
                       >
                         <Plus size={14} className="text-[#34a4b8]" /> Manage Curated Experiences
                       </button>
                    </div>

                    {!canFinalize && (
                      <div className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] flex gap-4 shadow-sm items-start">
                         <div className="p-2 bg-red-400 rounded-full text-white flex-shrink-0"><AlertCircle size={20} /></div>
                         <div className="space-y-1">
                           <p className="text-xs font-bold text-red-900 leading-none">Setup Incomplete</p>
                           <p className="text-[10px] text-red-800 leading-relaxed">We need your name, username, email, bio, and at least one curated experience before we can proceed.</p>
                         </div>
                      </div>
                    )}

                    <button 
                      disabled={!canFinalize}
                      onClick={() => setCurrentStep('disclosure')}
                      className={`w-full py-6 rounded-[2.2rem] font-russo uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-none cursor-pointer mt-auto ${canFinalize ? 'bg-[#34a4b8] text-white shadow-[#34a4b8]/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                    >
                        Proceed to Final Step <ChevronRight size={20} />
                    </button>
                 </div>
               )}

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
                     <button disabled={!disclosureAgreed} onClick={() => setCurrentStep('final')} className={`flex-[2] py-6 rounded-[2.2rem] font-russo uppercase tracking-widest shadow-xl transition-all border-none cursor-pointer ${disclosureAgreed ? 'bg-[#34a4b8] text-white shadow-[#34a4b8]/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>Confirm and Send</button>
                   </div>
                 </div>
               )}

               {currentStep === 'final' && (
                 <div className="space-y-6 animate-in">
                    <div className="p-8 bg-blue-50 border border-blue-200 rounded-[2.5rem] shadow-xl text-center space-y-6">
                       <div className="w-16 h-16 bg-[#34a4b8] rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20"><Mail size={40} /></div>
                       <div className="space-y-2"><h4 className="font-russo text-2xl text-blue-900 uppercase leading-none">The Final Step</h4><p className="text-xs text-blue-700 leading-relaxed max-w-xs mx-auto">Click below to open your email client with your pre compiled setup data.</p></div>
                       <div className="space-y-4 pt-4">
                          <button onClick={handleOpenEmail} className="w-full bg-[#34a4b8] text-white py-6 rounded-2xl font-russo uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#34a4b8]/30 border-none cursor-pointer active:scale-95 transition-all"><Mail size={24} /> Open Email to Send</button>
                          
                          <div className="pt-4 border-t border-blue-100">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Fallback Option (If email is blank)</p>
                            <button onClick={handleCopyToClipboard} className={`w-full py-4 rounded-xl font-russo uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all border-none cursor-pointer ${copyStatus ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white opacity-80 hover:opacity-100'}`}>{copyStatus ? <><CircleCheck size={16} /> Copied!</> : <><Clipboard size={16} /> Copy and Paste Manually</>}</button>
                          </div>
                       </div>
                       <div className="p-5 bg-white rounded-2xl text-[10px] text-slate-500 text-left border border-blue-100">
                          <p className="font-bold text-[#34a4b8] mb-2 uppercase tracking-widest leading-none text-center">Setup Instructions</p>
                          <p className="leading-relaxed text-center">We need your setup data at <span className="font-bold">hello@cruisytravel.com</span> to build your custom page. Your profile will go live within 72 hours of verification.</p>
                       </div>
                    </div>
                    <button onClick={() => { setCurrentStep('preview'); setDisclosureAgreed(false); }} className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-[#34a4b8] transition-colors bg-transparent border-none cursor-pointer">Return to Dashboard</button>
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
