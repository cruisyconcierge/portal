import React, { useState, useEffect } from 'react';
import { 
  Palmtree, User, MapPin, Eye, Share2, Plus, Minus,
  ExternalLink, ChevronRight, Clipboard, Send, Loader2, AlertCircle,
  LogOut, CheckCircle2, Navigation, Ship, Anchor, Waves, Info
} from 'lucide-react';

/**
 * CRUISY TRAVEL AMBASSADOR PORTAL
 * Refined Brand Identity: Russo One, Pacifico, Roboto
 * Palette: Southernmost Buoy (Red, Yellow, Black) + Cruisy Teal
 */

const DESTINATIONS = [
  'Key West', 'Miami', 'St Thomas', 'Cozumel', 'Nassau', 'Orlando', 'Honolulu'
];

const WP_BASE_URL = 'https://cruisytravel.com';
const CPT_SLUG = 'itinerary';
const BRAND_BLUE = '#34a4b8';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
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

  useEffect(() => {
    const savedSession = localStorage.getItem('cruisy_session');
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        setProfile(data.profile);
        setSelectedIds(data.selectedIds || []);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Session parse error", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('cruisy_session', JSON.stringify({ profile, selectedIds }));
    }
  }, [profile, selectedIds, isLoggedIn]);

  const fetchItineraries = async () => {
    setLoading(true);
    setError(null);
    try {
      // Added a timeout to the fetch to prevent indefinite hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/${CPT_SLUG}?per_page=100&_embed`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`The endpoint /wp-json/wp/v2/${CPT_SLUG} was not found. Please check your CPT slug.`);
        }
        throw new Error(`WordPress error (${response.status}). Check if the REST API is enabled for this CPT.`);
      }

      const data = await response.json();
      
      const mapped = data.map(item => ({
        id: item.id,
        name: item.title?.rendered || 'Untitled Activity',
        category: item.acf?.category || 'General',
        destination: item.acf?.destination_tag || 'Key West',
        price: item.acf?.price ? `$${item.acf.price}` : 'View Pricing',
        duration: item.acf?.duration || 'Varies',
        bookingUrl: item.acf?.booking_url || item.link,
        img: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '🚢'
      }));
      setItineraries(mapped);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.name === 'AbortError') {
        setError("Connection timed out. Your WordPress site might be responding slowly.");
      } else {
        setError(err.message || "Failed to sync with WordPress. Ensure CORS is allowed.");
      }
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
    } else {
      alert("Please enter both a Full Name and a Slug.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('setup');
    localStorage.removeItem('cruisy_session');
  };

  const toggleExperience = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getAffiliateLink = (originalUrl) => {
    const ref = profile.slug || 'ambassador';
    const connector = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${connector}asn=cruisyconcierge&asn-ref=${ref}`;
  };

  // --- LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen font-roboto flex items-center justify-center relative p-4">
        {/* Full Screen Southernmost Background */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[10%] brightness-[50%]"
          style={{ backgroundImage: "url('https://cruisytravel.com/wp-content/uploads/2026/01/southernmost-scaled.avif')" }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

        <div className="relative z-10 max-w-md w-full animate-in">
          {/* Buoy Branding Card */}
          <div className="bg-black rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-4 border-zinc-800 overflow-hidden">
            {/* The Buoy Accent Strip */}
            <div className="h-6 flex">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#34a4b8]" />
            </div>

            <div className="p-10 space-y-8
