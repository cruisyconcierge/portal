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

  // Initial Sync
  useEffect(() => {
    const saved = localStorage.getItem('cruisy_advisor_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProfile(data.profile);
        setSelectedIds(data.selectedIds || []);
        setIsLoggedIn(true);
      } catch (e) { console.error("Session reset"); }
    }
  }, []);

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
      if (!response.ok) throw new Error("Could not sync with the itinerary database.");
      const data = await response.json();
      
      const mapped = data.map(item => ({
        id: item.id,
        name: item.title?.rendered || 'Activity',
        category: item.acf?.category || 'Experiences',
        destination: item.acf?.destination_tag || 'Key West',
        price: item.acf?.price ? `$${item.acf.price}` : 'Book Now',
        duration: item.acf?.duration || 'Flexible',
        bookingUrl: item.acf?.booking_url || item.link,
        img: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
      }));
      setItineraries(mapped);
    } catch (err) {
      setError("Synchronizing with Cruisy Travel... Please ensure API access is open.");
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

  // --- UI COMPONENTS: MODALS ---

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-russo text-xl text-slate-800 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
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
    <div className="min-h-screen bg-[#f8fafc] font-roboto text-slate-800">
      
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-pacifico text-2xl text-slate-800 lowercase">Cruisy</span>
          <span className="font-russo text-xl text-[#34a4b8] uppercase">travel</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="font-russo text-[10px] text-slate-400 tracking-widest uppercase leading-none">Advisor</span>
            <span className="font-pacifico text-[#34a4b8] text-lg leading-none mt-1 lowercase">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* DASHBOARD HERO */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="bg-gradient-to-br from-[#34a4b8] to-[#2c8ba0] rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
            <Ship size={240} />
          </div>
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-4xl md:text-5xl font-russo uppercase leading-tight">Welcome to the<br/>Advisor Lounge</h2>
            <p className="text-lg text-white/80 font-medium">Curate custom itineraries for your clients and generate your personalized booking portal in seconds.</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => setActiveModal('profile')} className="bg-white text-[#34a4b8] px-8 py-4 rounded-2xl font-russo text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-slate-50 transition-all">
                <Settings size={16} /> Edit Profile
              </button>
              <button onClick={() => setActiveModal('itinerary')} className="bg-slate-900/20 backdrop-blur text-white border border-white/20 px-8 py-4 rounded-2xl font-russo text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-all">
                <Palmtree size={16} /> Choose Experiences
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* QUICK STATS & TOOLS */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-[#34a4b8]/10 rounded-2xl flex items-center justify-center text-[#34a4b8] mb-2">
            <Navigation size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Port</span>
          <span className="font-russo text-xl text-slate-800 uppercase">{profile.destination}</span>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-[#34a4b8]/10 rounded-2xl flex items-center justify-center text-[#34a4b8] mb-2">
            <CheckCircle2 size={24} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Items</span>
          <span className="font-russo text-xl text-slate-800 uppercase">{selectedIds.length} Experiences</span>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center space-y-4">
          <button 
            onClick={() => setActiveModal('preview')}
            className="w-full h-full flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-12 h-12 bg-[#34a4b8] rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg shadow-[#34a4b8]/20 group-hover:scale-110 transition-all">
              <Eye size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Preview</span>
            <span className="font-russo text-sm text-[#34a4b8] uppercase">Launch View</span>
          </button>
        </div>
      </section>

      {/* MODAL: PROFILE SETUP */}
      {activeModal === 'profile' && (
        <Modal title="Profile Settings" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
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
                        ? 'bg-[#34a4b8] border-[#34a4b8] text-white' 
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
                className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none text-sm leading-relaxed"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-4 rounded-2xl font-russo uppercase tracking-widest">Save Settings</button>
          </div>
        </Modal>
      )}

      {/* MODAL: ITINERARY SELECTION */}
      {activeModal === 'itinerary' && (
        <Modal title="Select Experiences" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
              <Info size={18} className="text-[#34a4b8]" />
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Choose the best activities for your clients in <strong>{profile.destination}</strong>. Your affiliate tracking is automatically attached.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {loading && <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#34a4b8]" /></div>}
              {error && <div className="p-6 bg-red-50 text-red-500 rounded-2xl text-xs font-bold text-center">{error}</div>}
              
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
                      {itinerary.img && <img src={itinerary.img} className="w-full h-full object-cover" />}
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
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-4 rounded-2xl font-russo uppercase tracking-widest mt-4">Confirm Selection</button>
          </div>
        </Modal>
      )}

      {/* MODAL: LIVE PREVIEW */}
      {activeModal === 'preview' && (
        <Modal title="Live Preview" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl relative border-[8px] border-slate-800">
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
                  <div className="h-4 bg-gradient-to-r from-[#34a4b8] to-[#2c8ba0]" />
                  <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col text-slate-900 text-center font-roboto">
                    <div className="p-8 bg-slate-50">
                       <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 border-2 border-[#34a4b8] flex items-center justify-center font-pacifico text-3xl text-[#34a4b8] overflow-hidden">
                         {profile.fullName?.charAt(0) || 'C'}
                       </div>
                       <h5 className="font-russo text-lg text-slate-800 uppercase leading-none">{profile.fullName || 'Advisor'}</h5>
                       <p className="text-[10px] font-black text-[#34a4b8] uppercase tracking-widest mt-2">{profile.destination} Specialist</p>
                    </div>
                    <div className="p-4 space-y-3">
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
               <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                 <h6 className="font-russo text-xs text-slate-800 uppercase tracking-widest">Share Your Link</h6>
                 <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                   <div className="flex-1 text-xs font-bold text-[#34a4b8] truncate">cruisytravel.com/{profile.slug}</div>
                   <button 
                    onClick={() => { navigator.clipboard.writeText(`https://cruisytravel.com/${profile.slug}`); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }}
                    className="p-2 text-[#34a4b8] hover:bg-slate-100 rounded-lg transition-colors"
                   >
                     {copyStatus ? <CheckCircle2 size={18} /> : <Clipboard size={18} />}
                   </button>
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">Your affiliate tag (?asn-ref={profile.slug}) is hardwired into every experience on this page.</p>
               </div>
               
               <button onClick={() => alert("Cruisy HQ notified! We will process your launch request.")} className="w-full bg-[#34a4b8] text-white py-5 rounded-3xl font-russo text-sm uppercase tracking-widest shadow-xl shadow-[#34a4b8]/20">
                 Request Launch
               </button>
            </div>
          </div>
        </Modal>
      )}

      <footer className="mt-20 py-20 bg-white border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-6 opacity-30 grayscale mb-8">
           <img src="https://cruisytravel.com/wp-content/uploads/2024/01/cropped-20240120_025955_0000.png" className="h-10" />
        </div>
        <p className="text-[11px] font-russo uppercase tracking-[0.6em] text-slate-300">Certified Cruisy Travel Advisor Network</p>
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
