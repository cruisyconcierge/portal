import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, AlertCircle,
  LogOut, CheckCircle2, Navigation, Ship, Anchor, Waves, Info, X, Settings
} from 'lucide-react';

/**
 * CRUISY TRAVEL ADVISOR PORTAL
 * Brand Identity: Pacifico & Russo One
 * Theme: Island Vibes (Teal, White, Sand)
 * Optimized for portal.cruisytravel.com
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const WP_BASE_URL = 'https://cruisytravel.com';
const CPT_SLUG = 'itinerary';
const BRAND_TEAL = '#34a4b8';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'itinerary', 'preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  
  const [profile, setProfile] = useState({
    fullName: '',
    slug: '', 
    bio: 'Certified Travel Advisor with Cruisy Travel.',
    destination: 'Key West',
    password: ''
  });
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [copyStatus, setCopyStatus] = useState(false);

  // Initial Sync from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('cruisy_advisor_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && data.profile) {
          setProfile(data.profile);
          setSelectedIds(data.selectedIds || []);
          setIsLoggedIn(true);
        }
      } catch (e) { 
        console.error("Session reset due to parse error", e); 
        localStorage.removeItem('cruisy_advisor_session');
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('cruisy_advisor_session', JSON.stringify({ profile, selectedIds }));
    }
  }, [profile, selectedIds, isLoggedIn]);

  const fetchItineraries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/${CPT_SLUG}?per_page=100&_embed`);
      
      if (!response.ok) {
        throw new Error(`Failed to sync: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from WordPress.");
      }
      
      const mapped = data.map(item => ({
        id: item.id,
        name: item.title?.rendered || 'Untitled Experience',
        category: item.acf?.category || 'Experiences',
        destination: item.acf?.destination_tag || 'Key West',
        price: item.acf?.price ? `$${item.acf.price}` : 'Book Now',
        duration: item.acf?.duration || 'Flexible',
        bookingUrl: item.acf?.booking_url || item.link,
        img: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
      }));
      
      setItineraries(mapped);
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.message || "Unable to sync with Cruisy Travel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchItineraries();
  }, [isLoggedIn]);

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cruisy_advisor_session');
  };

  // --- UI COMPONENTS: MODAL ---
  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-russo text-xl text-slate-800 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto font-roboto text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );

  // --- VIEW: LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-roboto flex items-center justify-center relative p-6 bg-slate-50">
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }} />
        <div className="fixed inset-0 z-0 bg-white/70 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
            <div className="p-12 text-center space-y-8">
              <div className="space-y-2">
                <h1 className="flex items-center justify-center gap-2">
                  <span className="font-pacifico text-4xl text-slate-800 lowercase">Cruisy</span>
                  <span className="font-russo text-3xl text-[#34a4b8] uppercase">travel</span>
                </h1>
                <p className="font-russo text-xs text-slate-400 tracking-[0.3em] uppercase">Advisor Portal</p>
              </div>

              <div className="space-y-4">
                <input 
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none transition-all text-slate-800 font-medium text-center"
                  placeholder="Advisor ID / Username"
                  value={profile.slug}
                  onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})}
                />
                <input 
                  type="password"
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none transition-all text-slate-800 font-medium text-center"
                  placeholder="Access Password"
                  value={profile.password}
                  onChange={e => setProfile({...profile, password: e.target.value})}
                />
                <button 
                  onClick={() => { if(profile.slug) setIsLoggedIn(true); }}
                  className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo text-lg shadow-xl shadow-[#34a4b8]/20 hover:scale-[1.02] transition-all"
                >
                  Enter Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#f1f5f9] font-roboto text-slate-800">
      
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-pacifico text-2xl text-slate-800 lowercase">Cruisy</span>
          <span className="font-russo text-xl text-[#34a4b8] uppercase">travel</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="font-russo text-[10px] text-slate-400 tracking-widest uppercase leading-none">Cruisy Advisor</span>
            <span className="font-pacifico text-[#34a4b8] text-lg leading-none mt-1 lowercase">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* PROGRESS TRACKER */}
      <div className="w-full h-1.5 flex bg-white">
        <div className={`h-full flex-1 transition-all duration-700 ${activeModal === 'profile' || selectedIds.length > 0 ? 'bg-[#34a4b8] shadow-[0_0_10px_#34a4b8]' : 'bg-slate-200'}`} />
        <div className={`h-full flex-1 transition-all duration-700 ${selectedIds.length > 0 ? 'bg-[#34a4b8]/60 shadow-[0_0_10px_#34a4b8]' : 'bg-slate-200'}`} />
        <div className={`h-full flex-1 transition-all duration-700 ${activeModal === 'preview' ? 'bg-[#34a4b8]/40 shadow-[0_0_10px_#34a4b8]' : 'bg-slate-200'}`} />
      </div>

      <main className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* DASHBOARD ACTIONS */}
        <div className="lg:col-span-12">
            <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-6 relative z-10 max-w-xl">
                    <h2 className="text-4xl md:text-5xl font-russo text-slate-800 uppercase leading-tight">Advisor<br/><span className="text-[#34a4b8]">Control Center</span></h2>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">Manage your profile, curate client itineraries, and launch your personalized booking portal below.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                    <button onClick={() => setActiveModal('profile')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group">
                        <User className="text-[#34a4b8] group-hover:scale-110 transition-transform" size={32} />
                        <span className="font-russo text-[10px] uppercase tracking-[0.2em] text-slate-400">Settings</span>
                        <span className="font-russo text-xs text-slate-800 uppercase">Edit Profile</span>
                    </button>
                    <button onClick={() => setActiveModal('itinerary')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group">
                        <Palmtree className="text-[#34a4b8] group-hover:scale-110 transition-transform" size={32} />
                        <span className="font-russo text-[10px] uppercase tracking-[0.2em] text-slate-400">Inventory</span>
                        <span className="font-russo text-xs text-slate-800 uppercase">Select Items</span>
                    </button>
                    <button onClick={() => setActiveModal('preview')} className="sm:col-span-2 p-8 bg-[#34a4b8] rounded-[2.5rem] flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-[#34a4b8]/20 group">
                        <Eye className="text-white group-hover:scale-110 transition-transform" size={24} />
                        <div className="flex flex-col items-start">
                            <span className="font-russo text-[10px] uppercase tracking-[0.2em] text-white/60">Launch Portal</span>
                            <span className="font-russo text-sm text-white uppercase">Live Preview & Share</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        {/* QUICK STATUS BAR */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 p-8 rounded-[2rem] border border-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <MapPin className="text-[#34a4b8]" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Port</p>
                        <p className="font-russo text-slate-800 uppercase">{profile.destination}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/60 p-8 rounded-[2rem] border border-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-[#34a4b8]" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Curated Experiences</p>
                        <p className="font-russo text-slate-800 uppercase">{selectedIds.length} Selections</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/60 p-8 rounded-[2rem] border border-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Anchor className="text-[#34a4b8]" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tracking Status</p>
                        <p className="font-russo text-slate-800 uppercase">ACTIVE</p>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* MODAL: PROFILE SETUP */}
      {activeModal === 'profile' && (
        <Modal title="Profile Setup" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Display Name</label>
              <input 
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none font-bold text-slate-800"
                value={profile.fullName}
                onChange={e => setProfile({...profile, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Destination</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DESTINATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setProfile({...profile, destination: d})}
                    className={`p-3 rounded-xl border text-[10px] font-black transition-all uppercase
                      ${profile.destination === d 
                        ? 'bg-[#34a4b8] border-[#34a4b8] text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Advisor Bio</label>
              <textarea 
                rows="4"
                className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none text-sm leading-relaxed text-slate-800 font-medium"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-4 rounded-2xl font-russo uppercase tracking-widest shadow-xl shadow-[#34a4b8]/20">Save Profile</button>
          </div>
        </Modal>
      )}

      {/* MODAL: ITINERARY SELECTION */}
      {activeModal === 'itinerary' && (
        <Modal title="Itinerary Management" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="p-6 bg-[#34a4b8]/5 rounded-3xl flex items-center gap-4 border border-[#34a4b8]/10">
              <div className="bg-[#34a4b8] p-2 rounded-xl text-white">
                <Info size={20} />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Choose the activities for your custom <strong>{profile.destination}</strong> itinerary. Your tracking ref is automatically injected into all links.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {loading && <div className="flex justify-center p-12 text-[#34a4b8]"><Loader2 className="animate-spin" /></div>}
              {error && <div className="p-6 bg-red-50 text-red-500 rounded-3xl text-xs font-bold text-center border border-red-100">{error}</div>}
              
              {itineraries
                .filter(exp => exp.destination === profile.destination)
                .map((itinerary) => (
                  <div 
                    key={itinerary.id}
                    onClick={() => toggleExperience(itinerary.id)}
                    className={`p-4 rounded-3xl border-2 flex items-center gap-4 cursor-pointer transition-all
                      ${selectedIds.includes(itinerary.id) ? 'border-[#34a4b8] bg-[#34a4b8]/5 shadow-lg' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden relative flex-shrink-0">
                      {itinerary.img && <img src={itinerary.img} className="w-full h-full object-cover" alt={itinerary.name} />}
                      {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-[#34a4b8]/80 flex items-center justify-center text-white"><CheckCircle2 size={32} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-russo text-sm text-slate-800 uppercase tracking-tight truncate">{itinerary.name}</h4>
                      <p className="text-xs text-slate-400 font-medium mb-2">{itinerary.category}</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[#34a4b8] font-black text-xs">{itinerary.price}</span>
                         <span className="text-[10px] text-slate-300 uppercase font-black">{itinerary.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-4 rounded-2xl font-russo uppercase tracking-widest mt-4">Confirm Itinerary</button>
          </div>
        </Modal>
      )}

      {/* MODAL: LIVE PREVIEW */}
      {activeModal === 'preview' && (
        <Modal title="Client View Preview" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl relative border-[8px] border-slate-800">
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
                  <div className="h-4 bg-[#34a4b8]" />
                  <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col text-slate-900 text-center font-roboto">
                    <div className="p-8 bg-slate-50">
                       <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 border-2 border-[#34a4b8] flex items-center justify-center font-pacifico text-3xl text-[#34a4b8] overflow-hidden uppercase">
                         {profile.fullName?.charAt(0) || 'C'}
                       </div>
                       <h5 className="font-russo text-lg text-slate-800 uppercase leading-none">{profile.fullName || 'Advisor'}</h5>
                       <p className="text-[10px] font-black text-[#34a4b8] uppercase tracking-widest mt-2">{profile.destination} Specialist</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {selectedIds.length === 0 && (
                        <p className="text-center py-10 text-[10px] italic text-slate-400 font-medium">Add experiences to view them here.</p>
                      )}
                      {selectedIds.map(id => {
                        const it = itineraries.find(i => i.id === id);
                        if (!it) return null;
                        return (
                          <div key={id} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                            <span className="text-[10px] font-bold text-slate-700 truncate w-32 text-left">{it.name}</span>
                            <ChevronRight size={14} className="text-slate-300" />
                          </div>
                        );
                      })}
                      <button className="w-full bg-[#34a4b8] text-white py-4 rounded-2xl font-russo text-[10px] uppercase shadow-lg shadow-[#34a4b8]/20 mt-4">
                        Book My Itinerary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
               <div className="p-8 bg-slate-50 rounded-[2rem] space-y-6 border border-slate-100">
                 <h6 className="font-russo text-xs text-slate-800 uppercase tracking-widest">Share Your Link</h6>
                 <div className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center gap-3">
                   <div className="flex-1 text-xs font-bold text-[#34a4b8] truncate tracking-wider lowercase">portal.cruisytravel.com/{profile.slug || 'advisor'}</div>
                   <button 
                    onClick={() => { 
                      const url = `https://portal.cruisytravel.com/${profile.slug || 'advisor'}`;
                      navigator.clipboard.writeText(url); 
                      setCopyStatus(true); 
                      setTimeout(() => setCopyStatus(false), 2000); 
                    }}
                    className="p-3 text-[#34a4b8] bg-[#34a4b8]/5 hover:bg-[#34a4b8]/10 rounded-xl transition-colors"
                   >
                     {copyStatus ? <CheckCircle2 size={18} /> : <Clipboard size={18} />}
                   </button>
                 </div>
                 <div className="p-5 bg-black/[0.02] rounded-2xl space-y-2">
                    <p className="font-russo text-[10px] text-[#34a4b8] uppercase tracking-widest">Tracking Logic</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Your reference tag <strong>?asn-ref={profile.slug}</strong> is automatically appended to every booking button on this landing page.</p>
                 </div>
               </div>
               
               <button onClick={() => alert("Launching portal request received. You will be notified via email.")} className="w-full bg-[#34a4b8] text-white py-6 rounded-[2rem] font-russo text-sm uppercase tracking-widest shadow-xl shadow-[#34a4b8]/30">
                 Finalize & Launch
               </button>
            </div>
          </div>
        </Modal>
      )}

      <footer className="mt-20 py-20 bg-white border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-6 opacity-30 grayscale mb-8">
           <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-10" alt="Cruisy Travel" />
        </div>
        <p className="text-[11px] font-russo uppercase tracking-[0.5em] text-slate-300">Cruisy Travel Advisor Network</p>
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
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
}
