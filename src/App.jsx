import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, AlertCircle,
  LogOut, CheckCircle2, Navigation, Ship, Anchor, Waves, Info, X, Settings
} from 'lucide-react';

/**
 * ADVISOR PORTAL - portal.cruisytravel.com
 * Theme: Island Lounge / Professional Coastal
 * Fonts: Pacifico (Cruisy), Russo One (Travel/Headers), Roboto (Body)
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const WP_BASE_URL = 'https://cruisytravel.com';
const CPT_SLUG = 'itinerary';
const BRAND_TEAL = '#34a4b8';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
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

  // Initial Sync from LocalStorage to keep the Advisor logged in
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
        localStorage.removeItem('cruisy_advisor_session');
      }
    }
  }, []);

  // Persistent state saving
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
        throw new Error(`WordPress Sync Failed: ${response.status}`);
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
      setError("Syncing with Cruisy database... Ensure CORS and REST API are active.");
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

  // Reusable Modal UI Component
  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-russo text-xl text-slate-800 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center relative p-6 bg-slate-50">
        <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }} />
        <div className="fixed inset-0 z-0 bg-white/70 backdrop-blur-[4px]" />

        <div className="relative z-10 max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
            <div className="p-12 text-center space-y-10">
              <div className="space-y-2">
                <h1 className="flex items-center justify-center gap-2">
                  <span className="font-pacifico text-4xl text-slate-800 lowercase">Cruisy</span>
                  <span className="font-russo text-3xl text-[#34a4b8] uppercase">travel</span>
                </h1>
                <p className="font-russo text-[10px] text-slate-400 tracking-[0.4em] uppercase">Advisor Portal</p>
              </div>

              <div className="space-y-4">
                <input 
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none transition-all text-slate-800 font-bold text-center"
                  placeholder="Advisor ID"
                  value={profile.slug}
                  onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})}
                />
                <input 
                  type="password"
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none transition-all text-slate-800 font-medium text-center"
                  placeholder="Password"
                  value={profile.password}
                  onChange={e => setProfile({...profile, password: e.target.value})}
                />
                <button 
                  onClick={() => { if(profile.slug) setIsLoggedIn(true); }}
                  className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo text-lg shadow-xl shadow-[#34a4b8]/20 hover:scale-[1.02] transition-all"
                >
                  Enter Lounge
                </button>
              </div>
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">90 Miles to Cuba</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800">
      
      {/* BRAND HEADER */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-pacifico text-2xl text-slate-800 lowercase">Cruisy</span>
          <span className="font-russo text-xl text-[#34a4b8] uppercase">travel</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="font-russo text-[10px] text-slate-400 tracking-widest uppercase leading-none">Cruisy Advisor</span>
            <span className="font-pacifico text-[#34a4b8] text-lg leading-none mt-1 lowercase">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-200">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* DASHBOARD BODY */}
      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        
        {/* CONTROL CENTER HERO */}
        <section className="bg-white rounded-[4rem] p-10 md:p-16 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
                <Ship size={400} />
            </div>
            
            <div className="space-y-6 relative z-10 max-w-xl text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-russo text-slate-800 uppercase leading-tight tracking-tight">Advisor<br/><span className="text-[#34a4b8]">Control Center</span></h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">Curate premium itineraries, update your advisor identity, and launch your personalized booking link below.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                <button onClick={() => setActiveModal('profile')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#34a4b8] shadow-sm group-hover:scale-110 transition-transform">
                        <Settings size={24} />
                    </div>
                    <span className="font-russo text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2">Identity</span>
                    <span className="font-russo text-xs text-slate-800 uppercase text-center">Profile Setup</span>
                </button>
                <button onClick={() => setActiveModal('itinerary')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#34a4b8] shadow-sm group-hover:scale-110 transition-transform">
                        <Palmtree size={24} />
                    </div>
                    <span className="font-russo text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2">Inventory</span>
                    <span className="font-russo text-xs text-slate-800 uppercase text-center">Itinerary Select</span>
                </button>
                <button onClick={() => setActiveModal('preview')} className="sm:col-span-2 p-8 bg-[#34a4b8] rounded-[2.5rem] flex items-center justify-center gap-6 hover:brightness-105 transition-all shadow-xl shadow-[#34a4b8]/20 group">
                    <Eye className="text-white group-hover:scale-110 transition-transform" size={28} />
                    <div className="flex flex-col items-start text-left">
                        <span className="font-russo text-[10px] uppercase tracking-[0.2em] text-white/70">Advisor View</span>
                        <span className="font-russo text-lg text-white uppercase tracking-tight">Live Preview & Launch</span>
                    </div>
                </button>
            </div>
        </section>

        {/* STATUS METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur p-10 rounded-[3rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]">
                    <MapPin size={32} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Port</p>
                    <p className="font-russo text-xl text-slate-800 uppercase">{profile.destination}</p>
                </div>
            </div>
            <div className="bg-white/60 backdrop-blur p-10 rounded-[3rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]">
                    <CheckCircle2 size={32} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Curated Items</p>
                    <p className="font-russo text-xl text-slate-800 uppercase">{selectedIds.length} Experiences</p>
                </div>
            </div>
            <div className="bg-white/60 backdrop-blur p-10 rounded-[3rem] border border-white flex items-center gap-6 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-[#34a4b8]/10 flex items-center justify-center text-[#34a4b8]">
                    <Anchor size={32} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Affiliate Status</p>
                    <p className="font-russo text-xl text-slate-800 uppercase">ACTIVE</p>
                </div>
            </div>
        </section>
      </main>

      {/* POPUPS (MODALS) */}
      
      {activeModal === 'profile' && (
        <Modal title="Profile Setup" onClose={() => setActiveModal(null)}>
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Display Name</label>
              <input 
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none font-bold text-slate-800"
                value={profile.fullName}
                onChange={e => setProfile({...profile, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Market</label>
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
                className="w-full p-6 rounded-3xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none text-sm leading-relaxed text-slate-800 font-medium"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase tracking-widest shadow-xl shadow-[#34a4b8]/20">Save Profile</button>
          </div>
        </Modal>
      )}

      {activeModal === 'itinerary' && (
        <Modal title="Itinerary Management" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="p-6 bg-[#34a4b8]/5 rounded-[2rem] flex items-center gap-4 border border-[#34a4b8]/10">
              <div className="bg-[#34a4b8] p-2 rounded-xl text-white">
                <Info size={24} />
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Curate custom activities for <strong>{profile.destination}</strong>. Your tracking tag is automatically injected.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {loading && <div className="flex justify-center p-12 text-[#34a4b8]"><Loader2 className="animate-spin" /></div>}
              {error && <div className="p-8 bg-red-50 text-red-500 rounded-3xl text-xs font-bold text-center border border-red-100">{error}</div>}
              
              {itineraries
                .filter(exp => exp.destination === profile.destination)
                .map((itinerary) => (
                  <div 
                    key={itinerary.id}
                    onClick={() => toggleExperience(itinerary.id)}
                    className={`p-5 rounded-[2.5rem] border-2 flex items-center gap-6 cursor-pointer transition-all
                      ${selectedIds.includes(itinerary.id) ? 'border-[#34a4b8] bg-[#34a4b8]/5 shadow-lg' : 'border-slate-50 bg-white hover:border-slate-100'}`}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden relative flex-shrink-0 shadow-sm border border-white">
                      {itinerary.img && <img src={itinerary.img} className="w-full h-full object-cover" alt={itinerary.name} />}
                      {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-[#34a4b8]/80 flex items-center justify-center text-white"><CheckCircle2 size={32} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase text-[#34a4b8] tracking-widest">{itinerary.category}</span>
                      <h4 className="font-russo text-sm text-slate-800 uppercase tracking-tight truncate leading-none mt-1">{itinerary.name}</h4>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/50">
                         <span className="text-[#34a4b8] font-bold text-sm">{itinerary.price}</span>
                         <span className="text-[10px] text-slate-400 uppercase font-black">{itinerary.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase tracking-widest mt-6">Confirm Selections</button>
          </div>
        </Modal>
      )}

      {activeModal === 'preview' && (
        <Modal title="Digital Advisor Preview" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex justify-center">
              <div className="w-[300px] h-[620px] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl relative border-[8px] border-slate-800">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col shadow-inner">
                  <div className="h-4 bg-[#34a4b8]" />
                  <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col text-slate-900 text-center font-roboto">
                    <div className="p-8 bg-slate-50">
                       <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 border-2 border-[#34a4b8] flex items-center justify-center font-pacifico text-3xl text-[#34a4b8] shadow-md uppercase">
                         {profile.fullName?.charAt(0) || 'C'}
                       </div>
                       <h5 className="font-russo text-lg text-slate-800 uppercase leading-none">{profile.fullName || 'Advisor'}</h5>
                       <p className="text-[10px] font-black text-[#34a4b8] uppercase tracking-widest mt-2">{profile.destination} Specialist</p>
                    </div>
                    <div className="p-5 space-y-3">
                      {selectedIds.length === 0 && (
                        <p className="text-center py-10 text-[11px] italic text-slate-300 font-medium">Add experiences to populate preview.</p>
                      )}
                      {selectedIds.map(id => {
                        const it = itineraries.find(i => i.id === id);
                        if (!it) return null;
                        return (
                          <div key={id} className="p-4 bg-white border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm">
                            <span className="text-[11px] font-bold text-slate-700 truncate w-32 text-left uppercase tracking-tight">{it.name}</span>
                            <ChevronRight size={14} className="text-slate-300" />
                          </div>
                        );
                      })}
                      <button className="w-full bg-[#34a4b8] text-white py-4 rounded-2xl font-russo text-[11px] uppercase shadow-lg shadow-[#34a4b8]/20 mt-6 tracking-widest">
                        Book Itinerary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
               <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6 border border-slate-100 shadow-sm">
                 <h6 className="font-russo text-xs text-slate-800 uppercase tracking-widest">Portal Share Link</h6>
                 <div className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center gap-3 shadow-inner">
                   <div className="flex-1 text-xs font-bold text-[#34a4b8] truncate tracking-wider lowercase">portal.cruisytravel.com/{profile.slug || 'id'}</div>
                   <button 
                    onClick={() => { 
                      const url = `https://portal.cruisytravel.com/${profile.slug || 'advisor'}`;
                      navigator.clipboard.writeText(url); 
                      setCopyStatus(true); 
                      setTimeout(() => setCopyStatus(false), 2000); 
                    }}
                    className="p-3 text-[#34a4b8] bg-[#34a4b8]/5 hover:bg-[#34a4b8]/10 rounded-xl transition-colors"
                   >
                     {copyStatus ? <CheckCircle2 size={20} /> : <Clipboard size={20} />}
                   </button>
                 </div>
                 <div className="p-6 bg-[#34a4b8]/5 rounded-2xl space-y-3 border border-[#34a4b8]/5">
                    <p className="font-russo text-[10px] text-[#34a4b8] uppercase tracking-widest flex items-center gap-2">
                        <Waves size={14} /> Tracking Active
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Your tag <strong>?asn-ref={profile.slug}</strong> is hardwired to every booking link on your custom portal.</p>
                 </div>
               </div>
               
               <button onClick={() => alert("Launching portal request received.")} className="w-full bg-[#34a4b8] text-white py-6 rounded-[2rem] font-russo text-sm uppercase tracking-widest shadow-xl shadow-[#34a4b8]/30 hover:scale-[1.01] transition-transform">
                 Go Live Official
               </button>
            </div>
          </div>
        </Modal>
      )}

      <footer className="mt-20 py-20 bg-white border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-8 opacity-30 grayscale mb-10">
           <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-10" alt="Cruisy Travel" />
        </div>
        <p className="text-[11px] font-russo uppercase tracking-[0.6em] text-slate-200">Advisor Portal Logistics</p>
      </footer>

      {/* Embedded Styles for Brand Overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&family=Pacifico&family=Russo+One&display=swap');
        
        .font-pacifico { font-family: 'Pacifico', cursive; }
        .font-russo { font-family: 'Russo One', sans-serif; }

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
