
import React, { useState, useEffect, useMemo } from 'react';
import type { Participant, Expense, ItineraryDay, ToBringItem, TripState } from './types';
import { CURRENCIES } from './constants';
import TripSetup from './components/TripSetup';
import Expenses from './components/Expenses';
import Itinerary from './components/Itinerary';
import TobringList from './components/TobringList';
import ShareIcon from './components/icons/ShareIcon';
import InviteModal from './components/InviteModal';
import PasscodeModal from './components/PasscodeModal';
import Button from './components/common/Button';
import pako from 'pako';

const App: React.FC = () => {
  const [tripState, setTripState] = useState<TripState | null>(null);
  const [unverifiedTripState, setUnverifiedTripState] = useState<TripState | null>(null);
  const [isAwaitingPasscode, setIsAwaitingPasscode] = useState(false);

  const [tripId, setTripId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Memoize currency symbol for performance
  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.code === tripState?.currency)?.symbol || '$';
  }, [tripState?.currency]);
  
  // Effect to load trip state from URL hash or localStorage
  useEffect(() => {
    const loadTrip = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        setTripState(null);
        setTripId(null);
        setUnverifiedTripState(null);
        setIsAwaitingPasscode(false);
        return;
      }

      const params = new URLSearchParams(hash);
      const id = params.get('tripId');
      const data = params.get('data');

      if (!id) return;
      
      setTripId(id);
      let loadedState: TripState | null = null;

      if (data) {
        // Handle invitation link with encoded data
        try {
          const decodedData = atob(decodeURIComponent(data));
          const jsonString = pako.inflate(Uint8Array.from(decodedData, c => c.charCodeAt(0)), { to: 'string' });
          loadedState = JSON.parse(jsonString);
          localStorage.setItem(`trip-${id}`, jsonString);
          window.history.replaceState(null, '', `#tripId=${id}`);
        } catch (e) {
          console.error("Failed to parse trip data from URL", e);
          alert("The invitation link seems to be broken.");
          window.location.hash = '';
          return;
        }
      } else {
        // Handle returning user with just a tripId
        const savedData = localStorage.getItem(`trip-${id}`);
        if (savedData) {
          loadedState = JSON.parse(savedData);
        } else {
          alert("We couldn't find the trip you were looking for.");
          window.location.hash = '';
          return;
        }
      }

      if (loadedState) {
        // Check for passcode
        const isVerified = sessionStorage.getItem(`verified-${id}`) === 'true';
        if (loadedState.passcode && !isVerified) {
          setUnverifiedTripState(loadedState);
          setIsAwaitingPasscode(true);
          setTripState(null);
        } else {
          setTripState(loadedState);
          setIsAwaitingPasscode(false);
          setUnverifiedTripState(null);
        }
      }
    };
    
    loadTrip();
    window.addEventListener('hashchange', loadTrip);
    return () => window.removeEventListener('hashchange', loadTrip);
  }, []);
  
  // Effect to save trip state to localStorage whenever it changes
  useEffect(() => {
    if (tripState && tripId) {
      localStorage.setItem(`trip-${tripId}`, JSON.stringify(tripState));
    }
  }, [tripState, tripId]);


  const handleTripStart = (newTripName: string, newParticipants: Participant[], passcode: string, currency: string) => {
    const newTripId = crypto.randomUUID();
    const initialState: TripState = {
      tripName: newTripName,
      participants: newParticipants,
      passcode: passcode || undefined,
      currency,
      expenses: [],
      itinerary: [{ day: 1, accommodation: '', spots: [], restaurants: [] }],
      toBringList: [],
    };
    
    window.location.hash = `tripId=${newTripId}`;
    setTripId(newTripId);
    setTripState(initialState);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start a new trip? All current data will be lost.')) {
        if (tripId) {
            localStorage.removeItem(`trip-${tripId}`);
            sessionStorage.removeItem(`verified-${tripId}`);
        }
        window.location.hash = '';
    }
  };

  const generateInviteLink = () => {
    if (!tripState || !tripId) return '';
    const jsonString = JSON.stringify(tripState);
    const compressed = pako.deflate(jsonString);
    const base64 = btoa(String.fromCharCode.apply(null, Array.from(compressed)));
    const url = new URL(window.location.href);
    url.hash = `tripId=${tripId}&data=${encodeURIComponent(base64)}`;
    return url.toString();
  };

  const handlePasscodeVerify = (enteredPasscode: string): boolean => {
    if (unverifiedTripState && unverifiedTripState.passcode === enteredPasscode) {
        sessionStorage.setItem(`verified-${tripId}`, 'true');
        setTripState(unverifiedTripState);
        setUnverifiedTripState(null);
        setIsAwaitingPasscode(false);
        return true;
    }
    return false;
  };

  // State update functions passed down to children
  const updateState = (updater: (prevState: TripState) => TripState) => {
    setTripState(prev => prev ? updater(prev) : null);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    updateState(prev => ({ ...prev, expenses: [...prev.expenses, { ...expense, id: crypto.randomUUID() }] }));
  };

  const removeExpense = (id: string) => {
    updateState(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const updateItinerary = (newItinerary: ItineraryDay[]) => {
    updateState(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const updateToBringList = (newList: ToBringItem[]) => {
    updateState(prev => ({ ...prev, toBringList: newList }));
  };
  
  if (isAwaitingPasscode) {
    return <PasscodeModal 
        onVerify={handlePasscodeVerify} 
        onCancel={() => window.location.hash = ''} 
    />;
  }

  if (!tripState) {
    return <TripSetup onTripStart={handleTripStart} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {showInviteModal && <InviteModal link={generateInviteLink()} tripName={tripState.tripName} passcode={tripState.passcode} onClose={() => setShowInviteModal(false)} />}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{tripState.tripName}</h1>
                    <div className="mt-2 flex items-center space-x-4">
                      <p className="text-gray-600">With:</p>
                      <div className="flex items-center flex-wrap gap-2">
                        {tripState.participants.map(p => (
                          <div key={p.id} className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full shadow-sm">
                            <span className="text-lg leading-none">{p.emoji}</span>
                            <span className="text-sm font-medium text-gray-700">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setShowInviteModal(true)}>
                        <ShareIcon className="h-5 w-5 inline-block mr-2" />
                        Invite Friends
                    </Button>
                    <Button onClick={handleReset} variant="secondary">
                        Start New Trip
                    </Button>
                </div>
            </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Expenses 
                participants={tripState.participants} 
                expenses={tripState.expenses} 
                addExpense={addExpense} 
                removeExpense={removeExpense}
                currencySymbol={currencySymbol}
            />
            <Itinerary itinerary={tripState.itinerary} updateItinerary={updateItinerary} />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <TobringList list={tripState.toBringList} updateList={updateToBringList} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;