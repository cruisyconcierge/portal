import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, CircleAlert,
  LogOut, CircleCheck, Navigation, Ship, Anchor, Waves, Info, X, Settings, UserPlus
} from 'lucide-react';

/**
 * ADVISOR PORTAL - portal.cruisytravel.com
 * Theme: Island Lounge / Professional Coastal
 * Branding: Large "Cruisy" with Capital C
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const WP_BASE_URL = 'https://cruisytravel.com';
const BRAND_TEAL = '#34a4b8';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
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

  useEffect(() => {
    const saved = localStorage.getItem('cruisy_advisor_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }));
          setSelectedIds(Array.isArray(data.selectedIds) ? data.selectedIds : []);
          setIsLoggedIn(true);
        }
      } catch (e) { 
        localStorage.removeItem('cruisy_advisor_session');
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('cruisy_advisor_session', JSON.stringify({ profile, selectedIds }));
    }
  }, [profile, selectedIds, isLoggedIn]);

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/itinerary?per_page=100&_embed`);
      const data = await response.json();
      if (Array.isArray(data)) {
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
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchItineraries();
  }, [isLoggedIn]);

  /**
   * WEBHOOK INTEGRATION
   * Since we cannot touch functions.php, we send data to a Webhook.
   * You can use the "WP Webhooks" plugin or Zapier to catch this
   * and create the WordPress page automatically.
   */
  const triggerSignupWebhook = async (advisorData) => {
    // PASTE YOUR ZAPIER/MAKE/WP-WEBHOOK URL HERE
    const webhookUrl = "YOUR_WEBHOOK_URL_HERE"; 
    
    if (webhookUrl === "YOUR_WEBHOOK_URL_HERE") {
      console.log("Mocking Webhook: No URL provided.");
      return true;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advisorData)
      });
      return response.ok;
    } catch (e) {
      console.error("Webhook Error", e);
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      if (!profile.fullName || !profile.slug) return alert("Please fill in all fields.");
      setLoading(true);
      await triggerSignupWebhook(profile);
      setLoading(false);
      setIsLoggedIn(true);
    } else {
      if (profile.slug) setIsLoggedIn(true);
    }
  };

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('cruisy_advisor_session');
    setSelectedIds([]);
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-russo text-xl text-slate-800 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  // --- LOGIN / SIGNUP VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center relative p-6 bg-slate-50">
        <div className="fixed inset-0 z-0 bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }} />
        <div className="fixed inset-0 z-0 bg-white/60 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white">
            
            {/* BRANDING: Capital C and Scaled Up */}
            <div className="pt-16 px-12 text-center">
              <h1 className="flex flex-col items-center justify-center gap-0">
                <span className="font-pacifico text-7xl md:text-8xl text-slate-800 leading-none">Cruisy</span>
                <span className="font-russo text-4xl md:text-5xl text-[#34a4b8] uppercase leading-none tracking-tighter -mt-3">travel</span>
              </h1>
              <p className="font-russo text-[11px] text-slate-400 tracking-[0.5em] uppercase mt-8">Advisor Portal</p>
            </div>

            <div className="p-10 space-y-8">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-russo text-xs uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-400'}`}>Login</button>
                <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl font-russo text-xs uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-white shadow-md text-[#34a4b8]' : 'text-slate-400'}`}>Sign Up</button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <>
                    <input required className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none font-bold text-slate-800" placeholder="Your Full Name" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
                    <textarea className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none text-slate-800 font-medium text-sm" placeholder="Tell us about yourself..." rows="2" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
                  </>
                )}
                <input required className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none font-bold text-slate-800" placeholder="Advisor Username" value={profile.slug} onChange={e => setProfile({...profile, slug: e.target.value.toLowerCase().replace(/\s/g, '')})} />
                <input type="password" required className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#34a4b8] outline-none text-slate-800" placeholder="Password" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} />
                
                <button type="submit" disabled={loading} className="w-full bg-[#34a4b8] text-white py-6 rounded-2xl font-russo text-xl shadow-xl shadow-[#34a4b8]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'ENTER LOUNGE' : 'JOIN NETWORK')}
                  {!loading && <Ship size={24} />}
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-300 font-black uppercase tracking-widest">90 Miles to Cuba</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-800">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-pacifico text-4xl text-slate-800 leading-none">Cruisy</span>
          <span className="font-russo text-3xl text-[#34a4b8] uppercase leading-none tracking-tighter">travel</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="font-russo text-[10px] text-slate-400 tracking-widest uppercase leading-none font-bold">Active Advisor</span>
            <span className="font-pacifico text-[#34a4b8] text-xl leading-none mt-1">{profile.slug}</span>
          </div>
          <button onClick={handleLogout} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors border border-slate-200"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        <section className="bg-white rounded-[4rem] p-10 md:p-16 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none"><Ship size={400} /></div>
            <div className="space-y-6 relative z-10 max-w-xl text-center md:text-left">
                <h2 className="text-5xl md:text-7xl font-russo text-slate-800 uppercase leading-[0.85] tracking-tight">Advisor<br/><span className="text-[#34a4b8]">Control</span></h2>
                <p className="text-slate-500 font-medium text-lg">Curate itineraries and manage your official /<span className="font-bold text-slate-800">{profile.slug}</span> landing page.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                <button onClick={() => setActiveModal('profile')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <Settings className="text-[#34a4b8] group-hover:rotate-45 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Profile</span>
                </button>
                <button onClick={() => setActiveModal('itinerary')} className="p-8 bg-slate-50 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white transition-all border border-transparent hover:border-slate-200 group hover:shadow-lg">
                    <Palmtree className="text-[#34a4b8] group-hover:scale-110 transition-transform" size={32} />
                    <span className="font-russo text-xs text-slate-800 uppercase">Curate</span>
                </button>
                <button onClick={() => setActiveModal('preview')} className="sm:col-span-2 p-8 bg-[#34a4b8] rounded-[2.5rem] flex items-center justify-center gap-6 hover:brightness-105 transition-all shadow-xl shadow-[#34a4b8]/20">
                    <Eye className="text-white" size={32} />
                    <span className="font-russo text-xl text-white uppercase tracking-tight">Live View</span>
                </button>
            </div>
        </section>
      </main>

      {/* MODALS */}
      {activeModal === 'profile' && (
        <Modal title="Identity Settings" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <input className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DESTINATIONS.map(d => (
                <button key={d} onClick={() => setProfile({...profile, destination: d})} className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${profile.destination === d ? 'bg-[#34a4b8] border-[#34a4b8] text-white' : 'bg-white text-slate-400'}`}>{d}</button>
              ))}
            </div>
            <textarea rows="4" className="w-full p-6 rounded-3xl bg-slate-50 border border-slate-100 outline-none" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase tracking-widest">Save Changes</button>
          </div>
        </Modal>
      )}

      {activeModal === 'itinerary' && (
        <Modal title="Curate Experiences" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-1 gap-4">
            {itineraries.filter(exp => exp.destination === profile.destination).map((itinerary) => (
              <div key={itinerary.id} onClick={() => toggleExperience(itinerary.id)} className={`p-5 rounded-[2.5rem] border-2 flex items-center gap-6 cursor-pointer transition-all ${selectedIds.includes(itinerary.id) ? 'border-[#34a4b8] bg-[#34a4b8]/5' : 'border-slate-50 bg-white'}`}>
                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden relative">
                  {itinerary.img && <img src={itinerary.img} className="w-full h-full object-cover" alt={itinerary.name} />}
                  {selectedIds.includes(itinerary.id) && <div className="absolute inset-0 bg-[#34a4b8]/80 flex items-center justify-center text-white"><CircleCheck size={32} /></div>}
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black uppercase text-[#34a4b8] tracking-widest">{itinerary.category}</span>
                  <h4 className="font-russo text-sm uppercase">{itinerary.name}</h4>
                  <p className="text-[#34a4b8] font-bold text-sm">{itinerary.price}</p>
                </div>
              </div>
            ))}
            <button onClick={() => setActiveModal(null)} className="w-full bg-[#34a4b8] text-white py-5 rounded-2xl font-russo uppercase mt-6">Confirm Selections</button>
          </div>
        </Modal>
      )}

      {activeModal === 'preview' && (
        <Modal title="Advisor Landing Page" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex justify-center">
              <div className="w-[300px] h-[600px] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl relative border-[8px] border-slate-800">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
                  <div className="h-4 bg-[#34a4b8]" />
                  <div className="p-8 text-center bg-slate-50">
                    <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-2 border-[#34a4b8] flex items-center justify-center font-pacifico text-5xl text-slate-800 uppercase shadow-md">{profile.fullName?.charAt(0) || 'C'}</div>
                    <h5 className="font-russo text-xl uppercase">{profile.fullName || 'Advisor'}</h5>
                    <p className="text-[10px] font-black text-[#34a4b8] uppercase mt-2">{profile.destination} Specialist</p>
                  </div>
                  <div className="p-5 space-y-3 overflow-y-auto">
                    {selectedIds.map(id => {
                      const it = itineraries.find(i => i.id === id);
                      if (!it) return null;
                      return <div key={id} className="p-4 bg-white border border-slate-100 rounded-3xl flex justify-between items-center"><span className="text-[11px] font-bold truncate w-32">{it.name}</span><ChevronRight size={14} className="text-slate-300" /></div>
                    })}
                    <button className="w-full bg-[#34a4b8] text-white py-4 rounded-2xl font-russo text-[11px] uppercase mt-4 shadow-lg shadow-[#34a4b8]/20">Book Itinerary</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-6">
               <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6 border border-slate-100 shadow-sm text-center md:text-left">
                 <h6 className="font-russo text-xs uppercase tracking-widest">Share Your Link</h6>
                 <div className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center gap-3">
                   <div className="flex-1 text-xs font-bold text-[#34a4b8]">cruisytravel.com/{profile.slug}</div>
                   <button onClick={() => { navigator.clipboard.writeText(`https://cruisytravel.com/${profile.slug}`); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} className="p-3 text-[#34a4b8] bg-[#34a4b8]/10 rounded-xl">{copyStatus ? <CircleCheck size={20} /> : <Clipboard size={20} />}</button>
                 </div>
                 <div className="p-6 bg-[#34a4b8]/5 rounded-2xl space-y-2">
                    <p className="font-russo text-[10px] text-[#34a4b8] uppercase flex items-center gap-2 font-bold"><Waves size={14} /> Tracking Engine</p>
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">All links automatically tag with <strong>?asn-ref={profile.slug}</strong>.</p>
                 </div>
               </div>
               <button onClick={() => alert("Advisor Profile Sync Request Published.")} className="w-full bg-[#34a4b8] text-white py-7 rounded-[2rem] font-russo text-xl shadow-xl shadow-[#34a4b8]/30">Launch Official Portal</button>
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
