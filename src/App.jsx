import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, CircleAlert,
  LogOut, CircleCheck, Navigation, Ship, Anchor, Waves, Info, X, Settings, UserPlus
} from 'lucide-react';

/**
 * ADVISOR PORTAL - portal.cruisytravel.com
 * Theme: Island Lounge / Professional Coastal
 * Branding: Russo One / Pacifico
 * Automation: Make.com Webhook -> WordPress Standard Post
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
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

  // --- STATE INITIALIZATION ---
  const [profile, setProfile] = useState(() => {
    const activeSlug = localStorage.getItem('cruisy_current_session_slug');
    if (activeSlug) {
      const saved = localStorage.getItem(`cruisy_user_${activeSlug}`);
      if (saved) return JSON.parse(saved).profile;
    }
    return { fullName: '', slug: '', bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '' };
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

  // --- CLEAN DATA SYNC ---
  const syncToWordPress = async (currentProfile, currentIds) => {
    const webhookUrl = "https://hook.us2.make.com/amuzvrmqyllbuctip7gayb94zwqbvat3"; 
    
    if (!currentProfile.fullName || currentProfile.fullName.trim() === "") {
      alert("Name is required.");
      return false;
    }

    const payload = {
      fullName: currentProfile.fullName.trim(),
      slug: currentProfile.slug.trim().toLowerCase(),
      bio: currentProfile.bio,
      destination: currentProfile.destination,
      selected_experiences: currentIds.join(','),
      timestamp: new Date().toISOString()
    };

    setLoading(true);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const confirmBox = document.createElement('div');
        confirmBox.className = "fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-[#34a4b8] text-white px-8 py-4 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-4";
        confirmBox.innerText = "Cruisy Page Successfully Created/Updated!";
        document.body.appendChild(confirmBox);
        setTimeout(() => confirmBox.remove(), 3000);
        setLoading(false);
        return true;
      }
    } catch (e) {
      alert("Make.com is not responding. Ensure scenario is ON.");
    }
    setLoading(false);
    return false;
  };

  // --- AUTH ACTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const success = await syncToWordPress(profile, selectedIds);
      if (success) setIsLoggedIn(true);
    } else {
      const saved = localStorage.getItem(`cruisy_user_${profile.slug}`);
      if (saved) {
        const data = JSON.parse(saved);
        setProfile(data.profile);
        setSelectedIds(data.selectedIds);
      }
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cruisy_current_session_slug');
    // DEEP RESET state to prevent data leakage to next login
    setProfile({ fullName: '', slug: '', bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '' });
    setSelectedIds([]);
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    // Clear fields when switching to signup so old user data doesn't populate
    if (mode === 'signup') {
      setProfile({ fullName: '', slug: '', bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '' });
      setSelectedIds([]);
    }
  };

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

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
                    <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-slate-800 shadow-sm" placeholder="Display Name (e.g. Matt S.)" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                    <textarea className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none text-slate-800 font-medium text-sm shadow-sm" placeholder="Short Bio" rows="2" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
                  </>
                )}
                <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none font-bold text-slate-800 shadow-sm" placeholder="Advisor Username" value={profile.slug} onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                <input type="password" required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800 shadow-sm" placeholder="Password" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} />
                <button type="submit" disabled={loading} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo text-lg shadow-xl shadow-[#34a4b8]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'ENTER LOUNGE' : 'JOIN NETWORK')}
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
            {/* UPDATED FONT FOR USERNAME */}
            <span className="font-russo text-[#34a4b8] text-xl leading-none mt-1 uppercase tracking-tight">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-200"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <section className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none"><Ship size={400} /></div>
            <div className="space-y-6 relative z-10 max-w-xl text-center md:text-left">
                <h2 className="text-5xl md:text-7xl font-russo text-slate-800 uppercase leading-[0.85] tracking-tight">Advisor<br/><span className="text-[#34a4b8]">Control</span></h2>
                <p className="text-slate-500 font-medium text-lg md:text-xl">Manage your official page at <span className="text-[#34a4b8] font-bold underline">cruisytravel.com/{profile.slug}</span></p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                <button onClick={() => setActiveModal('profile')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <Settings className="text-[#34a4b8] group-hover:rotate-45 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Profile Settings</span>
                </button>
                <button onClick={() => setActiveModal('itinerary')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <Palmtree className="text-[#34a4b8] group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Select Experiences</span>
                </button>
                <button onClick={() => setActiveModal('preview')} className="sm:col-span-2 p-8 bg-[#34a4b8] rounded-[2.5rem] flex items-center justify-center gap-6 hover:brightness-105 transition-all shadow-xl shadow-[#34a4b8]/20 group">
                    <Eye className="text-white group-hover:scale-110 transition-transform" size={32} />
                    <div className="flex flex-col items-start">
                         <span className="font-russo text-xl text-white uppercase tracking-tight leading-none">Live View</span>
                         <span className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-1">Digital Card</span>
                    </div>
                </button>
            </div>
        </section>

        {/* STATS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]"><MapPin size={28} /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Port</p><p className="font-russo text-lg uppercase">{profile.destination}</p></div>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]"><CircleCheck size={28} /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Experiences</p><p className="font-russo text-lg uppercase">{selectedIds.length} Selected</p></div>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]"><Anchor size={28} /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</p><p className="font-russo text-lg uppercase">ACTIVE</p></div>
            </div>
        </section>
      </main>

      {/* MODALS */}
      {activeModal === 'profile' && (
        <Modal title="Identity Settings" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Display Name</label>
              <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 shadow-sm" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Specialization</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DESTINATIONS.map(d => (
                  <button key={d} onClick={() => setProfile({...profile, destination: d})} className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${profile.destination === d ? 'bg-[#34a4b8] text-white' : 'bg-white text-slate-400'}`}>{d}</button>
                ))}
              </div>
            </div>
            <button onClick={() => { setActiveModal(null); syncToWordPress(profile, selectedIds); }} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase tracking-widest shadow-lg shadow-[#34a4b8]/20">Update Official Page</button>
          </div>
        </Modal>
      )}

      {activeModal === 'itinerary' && (
        <Modal title="Curate Experiences" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
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
            <button onClick={() => { setActiveModal(null); syncToWordPress(profile, selectedIds); }} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase mt-4 shadow-lg shadow-[#34a4b8]/20">Confirm & Sync</button>
          </div>
        </Modal>
      )}

      {activeModal === 'preview' && (
        <Modal title="Live Preview" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
            <div className="flex justify-center">
              <div className="w-[260px] h-[540px] bg-slate-900 rounded-[3rem] p-2 relative border-[6px] border-slate-800 shadow-xl">
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
                  <div className="h-3 bg-[#34a4b8]" />
                  <div className="p-4 text-center">
                    <h5 className="font-russo text-lg uppercase text-slate-800">@{profile.slug}</h5>
                    <p className="text-[9px] font-black text-[#34a4b8] uppercase mt-1">{profile.fullName}</p>
                    <p className="text-[9px] text-slate-500 italic mt-2 line-clamp-2">{profile.bio}</p>
                  </div>
                  <div className="px-4 pb-4 space-y-2 overflow-y-auto scrollbar-hide flex-1">
                    {selectedIds.map(id => {
                      const it = itineraries.find(i => i.id === id);
                      if (!it) return null;
                      return (
                        <div key={id} className="p-2 bg-slate-50 rounded-xl flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden"><img src={it.img} className="w-full h-full object-cover" /></div>
                           <span className="text-[8px] font-bold text-slate-700 uppercase truncate">{it.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 pb-10">
               <div className="p-5 bg-slate-50 rounded-[2rem] space-y-4 text-center lg:text-left border border-slate-100">
                 <h6 className="font-russo text-[10px] uppercase text-slate-400">Advisor Link</h6>
                 <div className="p-3 bg-white rounded-xl flex items-center gap-2 border border-slate-200">
                   <div className="flex-1 text-[10px] font-bold text-[#34a4b8] truncate lowercase">cruisytravel.com/{profile.slug}</div>
                   <button onClick={() => { navigator.clipboard.writeText(`https://cruisytravel.com/${profile.slug}`); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} className="p-2 text-[#34a4b8] bg-[#34a4b8]/10 rounded-lg">
                     {copyStatus ? <CircleCheck size={14} /> : <Clipboard size={14} />}
                   </button>
                 </div>
               </div>
               <button onClick={() => syncToWordPress(profile, selectedIds)} disabled={loading} className="w-full bg-[#34a4b8] text-white py-5 rounded-[2rem] font-russo uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : "Sync Official Page"}
               </button>
            </div>
          </div>
        </Modal>
      )}

      <footer className="mt-20 py-20 bg-white border-t border-slate-100 text-center">
        <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-10 mx-auto opacity-30 grayscale mb-8" />
        <p className="text-[11px] font-russo uppercase tracking-[0.6em] text-slate-200 font-bold">Advisor Logistics</p>
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
