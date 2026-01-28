import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, CircleAlert,
  LogOut, CircleCheck, Navigation, Ship, Anchor, Waves, Info, X, Settings, UserPlus
} from 'lucide-react';

/**
 * ADVISOR PORTAL - portal.cruisytravel.com
 * Theme: Island Lounge / Professional Coastal
 * Branding: Ultra-Bold "Cruisy" with Capital C
 * Persistence: Browser LocalStorage (Independent of WP Auth)
 * Automation: Make.com Webhook -> https://hook.us2.make.com/amuzvrmqyllbuctip7gayb94zwqbvat3
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const WP_BASE_URL = 'https://cruisytravel.com';
const ITINERARY_CPT = 'itinerary'; 
const BRAND_TEAL = '#34a4b8';

// MODAL COMPONENT (Defined outside App to ensure input focus remains during typing)
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
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('cruisy_current_session_slug') !== null;
  });

  const [authMode, setAuthMode] = useState('login'); 
  const [activeModal, setActiveModal] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  
  const [profile, setProfile] = useState(() => {
    const activeSlug = localStorage.getItem('cruisy_current_session_slug');
    if (activeSlug) {
      const savedData = localStorage.getItem(`cruisy_user_${activeSlug}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          return parsed.profile || { fullName: '', slug: activeSlug, bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '' };
        } catch (e) { return { fullName: '', slug: activeSlug, bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '' }; }
      }
    }
    return { fullName: '', slug: '', bio: 'Certified Travel Advisor with Cruisy Travel.', destination: 'Key West', password: '' };
  });
  
  const [selectedIds, setSelectedIds] = useState(() => {
    const activeSlug = localStorage.getItem('cruisy_current_session_slug');
    if (activeSlug) {
      const savedData = localStorage.getItem(`cruisy_user_${activeSlug}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          return Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [];
        } catch (e) { return []; }
      }
    }
    return [];
  });

  const [copyStatus, setCopyStatus] = useState(false);

  // --- PERSISTENCE ---
  useEffect(() => {
    if (isLoggedIn && profile.slug) {
      localStorage.setItem(`cruisy_user_${profile.slug}`, JSON.stringify({ profile, selectedIds }));
      localStorage.setItem('cruisy_current_session_slug', profile.slug);
    }
  }, [profile, selectedIds, isLoggedIn]);

  // --- API LOGIC ---
  const fetchItineraries = async () => {
    setLoading(true);
    setError(null);
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
              description: item.content?.rendered || '', 
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
      } catch (err) { console.warn(`Failed fetch on /${slug}:`, err); }
    }

    if (!success) { setError("WordPress API Error (404). Check 'itinerary' CPT REST visibility."); }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchItineraries();
  }, [isLoggedIn]);

  // --- ACTIONS ---
  const triggerSyncWebhook = async (advisorData) => {
    const webhookUrl = "https://hook.us2.make.com/amuzvrmqyllbuctip7gayb94zwqbvat3"; 
    
    if (!advisorData.fullName || advisorData.fullName.trim() === "") {
      const msg = document.createElement('div');
      msg.className = "fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-4";
      msg.innerText = "Error: Please enter a Display Name in Settings before syncing.";
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 4000);
      setActiveModal('profile');
      return;
    }

    // UPDATED PAYLOAD: sending selected_experiences as an Array [] instead of a string ""
    // This is required for ACF Relationship fields to pick up the data automatically.
    const payload = {
      fullName: advisorData.fullName.trim(),
      slug: advisorData.slug,
      bio: advisorData.bio,
      destination: advisorData.destination,
      selected_experiences: selectedIds, // RAW ARRAY
      registration_date: new Date().toISOString()
    };

    console.log("SYNCING DATA TO MAKE.COM:", payload);

    setLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const confirmBox = document.createElement('div');
        confirmBox.className = "fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-[#34a4b8] text-white px-8 py-4 rounded-2xl font-bold shadow-2xl animate-in slide-in-from-top-4";
        confirmBox.innerText = "Cruisy Portal Synced Successfully!";
        document.body.appendChild(confirmBox);
        setTimeout(() => confirmBox.remove(), 3000);
      } else {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status})`);
      }
      
      setLoading(false);
      return true;
    } catch (e) {
      console.error("Webhook Error", e);
      setLoading(false);
      alert(`Sync failed: ${e.message}. Ensure your Make.com Scenario is ON.`);
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      if (!profile.fullName || !profile.slug) return alert("Required fields missing.");
      await triggerSyncWebhook(profile);
      setIsLoggedIn(true);
    } else {
      const savedData = localStorage.getItem(`cruisy_user_${profile.slug}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setProfile(parsed.profile);
          setSelectedIds(parsed.selectedIds || []);
        } catch (e) { /* fallback */ }
      }
      setIsLoggedIn(true);
    }
  };

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cruisy_current_session_slug');
  };

  // --- LOGIN / SIGNUP VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center relative p-6 bg-slate-900">
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000" 
          style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }} 
        />
        
        <div className="relative z-10 max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/50">
            
            <div className="pt-10 px-12 text-center">
              <h1 className="flex flex-col items-center justify-center gap-0">
                <span className="font-pacifico text-7xl md:text-8xl text-slate-900 leading-[0.7] tracking-tighter">Cruisy</span>
                <span className="font-russo text-4xl md:text-5xl text-[#34a4b8] uppercase leading-none tracking-widest mt-3">travel</span>
              </h1>
              <p className="font-russo text-[10px] text-slate-500 tracking-[0.5em] uppercase mt-4 font-bold">Advisor Portal</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex bg-slate-900/10 p-1 rounded-2xl">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-2.5 rounded-xl font-russo text-[10px] uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-600'}`}>Login</button>
                <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2.5 rounded-xl font-russo text-[10px] uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-600'}`}>Sign Up</button>
              </div>

              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <>
                    <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none font-bold text-slate-800" placeholder="Display Name (e.g. Matt S.)" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                    <textarea className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800 font-medium text-sm" placeholder="Tell us about yourself..." rows="2" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
                  </>
                )}
                <input required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none font-bold text-slate-800" placeholder="Advisor Username" value={profile.slug} onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                <input type="password" required className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-[#34a4b8] outline-none text-slate-800" placeholder="Password" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} />
                
                <button type="submit" disabled={loading} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo text-lg shadow-xl shadow-[#34a4b8]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mt-2">
                  {loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'ENTER LOUNGE' : 'JOIN NETWORK')}
                  {!loading && <Ship size={20} />}
                </button>
              </form>
              <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-widest">90 Miles to Cuba</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-pacifico text-4xl md:text-5xl text-slate-800 leading-none">Cruisy</span>
          <span className="font-russo text-3xl text-[#34a4b8] uppercase leading-none tracking-tighter">travel</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="font-russo text-[10px] text-slate-400 tracking-widest uppercase leading-none font-bold">Active Advisor</span>
            <span className="font-pacifico text-[#34a4b8] text-2xl leading-none mt-1 uppercase">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-200"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <section className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none"><Ship size={400} /></div>
            <div className="space-y-6 relative z-10 max-w-xl text-center md:text-left">
                <h2 className="text-5xl md:text-7xl font-russo text-slate-800 uppercase leading-[0.85] tracking-tight tracking-tighter">Advisor<br/><span className="text-[#34a4b8]">Control</span></h2>
                <p className="text-slate-500 font-medium text-lg md:text-xl leading-relaxed">
                  Curate experiences and manage your official advisor landing page. <span className="text-[#34a4b8] font-bold underline">cruisytravel.com/{profile.slug || 'username'}</span>
                </p>
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]">
                    <MapPin size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Port</p>
                    <p className="font-russo text-lg text-slate-800 uppercase">{profile.destination || 'N/A'}</p>
                </div>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]">
                    <CircleCheck size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Experiences</p>
                    <p className="font-russo text-lg text-slate-800 uppercase">{selectedIds.length} Selections</p>
                </div>
            </div>
            <div className="bg-white/60 backdrop-blur p-8 rounded-[2.5rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]">
                    <Anchor size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tracking Status</p>
                    <p className="font-russo text-lg text-slate-800 uppercase">ACTIVE</p>
                </div>
            </div>
        </section>
      </main>

      {/* MODALS */}
      {activeModal === 'profile' && (
        <Modal title="Identity Settings" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Display Name</label>
              <input 
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-800 focus:border-[#34a4b8] transition-colors" 
                value={profile.fullName} 
                onChange={e => setProfile(prev => ({...prev, fullName: e.target.value}))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Specialization Port</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DESTINATIONS.map(d => (
                  <button key={d} onClick={() => setProfile(prev => ({...prev, destination: d}))} className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${profile.destination === d ? 'bg-[#34a4b8] border-[#34a4b8] text-white shadow-md' : 'bg-white text-slate-400 hover:border-slate-300'}`}>{d}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Professional Bio</label>
              <textarea 
                rows="4" 
                className="w-full p-6 rounded-3xl bg-slate-50 border border-slate-100 outline-none text-slate-800 font-medium focus:border-[#34a4b8] transition-colors" 
                value={profile.bio} 
                onChange={e => setProfile(prev => ({...prev, bio: e.target.value}))} 
              />
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase tracking-widest shadow-lg shadow-[#34a4b8]/20">Update Advisor Profile</button>
          </div>
        </Modal>
      )}

      {activeModal === 'itinerary' && (
        <Modal title="Curate Experiences" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="p-6 bg-[#34a4b8]/5 rounded-[2.5rem] border border-[#34a4b8]/10 text-center">
                 <p className="text-sm font-medium text-slate-600">Select the best activities for <strong>{profile.destination}</strong> travelers.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {error && (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-[2.5rem] text-center space-y-4 shadow-sm">
                    <CircleAlert className="mx-auto text-red-500" size={40} />
                    <p className="text-sm text-red-600 font-bold leading-relaxed">{error}</p>
                  </div>
                )}
                
                {itineraries
                  .filter(exp => {
                    const port = profile.destination.toLowerCase();
                    const tagMatch = String(exp.destinationTag).toLowerCase().includes(port);
                    const descMatch = String(exp.description).toLowerCase().includes(port);
                    const nameMatch = String(exp.name).toLowerCase().includes(port);
                    return tagMatch || descMatch || nameMatch;
                  })
                  .map((itinerary) => (
                  <div key={itinerary.id} onClick={() => toggleExperience(itinerary.id)} className={`p-5 rounded-[2.5rem] border-2 flex items-center gap-6 cursor-pointer transition-all ${selectedIds.includes(itinerary.id) ? 'border-[#34a4b8] bg-[#34a4b8]/5 shadow-md' : 'border-slate-50 bg-white hover:border-slate-100'}`}>
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden relative shadow-sm border border-slate-200">
                      {itinerary.img ? (
                        <img src={itinerary.img} className="w-full h-full object-cover" alt={itinerary.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 text-3xl">🚢</div>
                      )}
                      {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-[#34a4b8]/80 flex items-center justify-center text-white"><CircleCheck size={32} /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase text-[#34a4b8] tracking-widest">{itinerary.category}</span>
                      <h4 className="font-russo text-sm uppercase text-slate-800 leading-tight truncate">{itinerary.name}</h4>
                      <p className="text-[#34a4b8] font-bold text-sm mt-1">{itinerary.price}</p>
                      </div>
                  </div>
                ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase mt-6 shadow-lg shadow-[#34a4b8]/20">Confirm Selections</button>
          </div>
        </Modal>
      )}

      {activeModal === 'preview' && (
        <Modal title="Digital Advisor Preview" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="flex justify-center">
              <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3.5rem] p-2.5 shadow-2xl relative border-[8px] border-slate-800">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                  {/* BUOY STRIPE */}
                  <div className="h-4 bg-[#34a4b8]" />
                  
                  <div className="p-6 text-center bg-slate-50">
                    <h5 className="font-russo text-xl uppercase text-slate-800 leading-tight">@{profile.slug || 'advisor'}</h5>
                    <p className="text-[10px] font-black text-[#34a4b8] uppercase mt-2 tracking-widest">{profile.fullName || 'Advisor'}</p>
                    <div className="h-px bg-slate-200 w-12 mx-auto my-3" />
                    <p className="text-[10px] text-slate-500 leading-relaxed italic line-clamp-3">{profile.bio}</p>
                  </div>

                  <div className="px-4 py-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Curated {profile.destination} Experiences</p>
                  </div>

                  <div className="px-4 pb-4 space-y-2.5 overflow-y-auto scrollbar-hide flex-1">
                    {selectedIds.length === 0 && <p className="text-center py-10 text-[10px] italic text-slate-300">No experiences selected yet.</p>}
                    {selectedIds.map(id => {
                      const it = itineraries.find(i => i.id === id);
                      if (!it) return null;
                      return (
                        <div key={id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-sm group transition-transform active:scale-[0.98]">
                          {it.img && (
                            <div className="h-20 w-full overflow-hidden">
                               <img src={it.img} className="w-full h-full object-cover" alt={it.name} />
                            </div>
                          )}
                          <div className="p-2 flex justify-between items-center">
                            <span className="text-[9px] font-bold truncate pr-2 text-slate-700 uppercase">{it.name}</span>
                            <div className="bg-slate-50 p-1 rounded-lg">
                               <ChevronRight size={10} className="text-[#34a4b8]" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {selectedIds.length > 0 && <button className="w-full bg-[#34a4b8] text-white py-3.5 rounded-2xl font-russo text-[10px] uppercase mt-3 shadow-lg shadow-[#34a4b8]/20">Book Full Itinerary</button>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-4 pb-8">
               <div className="p-6 bg-slate-50 rounded-[2rem] space-y-5 border border-slate-100 shadow-sm text-center lg:text-left">
                 <h6 className="font-russo text-xs uppercase tracking-widest text-slate-400">Share Your Link</h6>
                 <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-inner overflow-hidden">
                   <div className="flex-1 text-[11px] font-bold text-[#34a4b8] truncate lowercase">cruisytravel.com/{profile.slug}</div>
                   <button onClick={() => { navigator.clipboard.writeText(`https://cruisytravel.com/${profile.slug}`); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} className="p-2.5 text-[#34a4b8] bg-[#34a4b8]/10 rounded-xl transition-all hover:bg-[#34a4b8]/20 flex-shrink-0">
                     {copyStatus ? <CircleCheck size={18} /> : <Clipboard size={18} />}
                   </button>
                 </div>
                 <div className="p-5 bg-[#34a4b8]/5 rounded-xl space-y-2">
                    <p className="font-russo text-[9px] text-[#34a4b8] uppercase flex items-center justify-center lg:justify-start gap-2 font-bold leading-none"><Waves size={12} /> Tracking Active</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">The tag <strong>?asn-ref={profile.slug}</strong> is hardwired to every button.</p>
                 </div>
               </div>
               <button 
                 onClick={() => triggerSyncWebhook(profile)} 
                 disabled={loading}
                 className="w-full bg-[#34a4b8] text-white py-6 rounded-[2rem] font-russo text-lg shadow-xl shadow-[#34a4b8]/30 hover:scale-[1.01] transition-transform uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Sync Official Portal"}
               </button>
            </div>
          </div>
        </Modal>
      )}

      <footer className="mt-20 py-20 bg-white border-t border-slate-100 text-center">
        <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-10 mx-auto opacity-30 grayscale mb-8" alt="Cruisy" />
        <p className="text-[11px] font-russo uppercase tracking-[0.6em] text-slate-200 font-bold">Certified Advisor Logistics</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&family=Pacifico&family=Russo+One&display=swap');
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
