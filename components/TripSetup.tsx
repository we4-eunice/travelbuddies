import React, { useState } from 'react';
import type { Participant } from '../types';
import { CURRENCIES, PARTICIPANT_EMOJIS } from '../constants';
import Card from './common/Card';
import Button from './common/Button';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';
import EmojiPicker from './common/EmojiPicker';

interface TripSetupProps {
  onTripStart: (tripName: string, participants: Participant[], passcode: string, currency: string) => void;
}

const TripSetup: React.FC<TripSetupProps> = ({ onTripStart }) => {
  const [tripName, setTripName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0].code);
  const [participants, setParticipants] = useState<Participant[]>([{ id: crypto.randomUUID(), name: '', emoji: PARTICIPANT_EMOJIS[0] }]);
  const [pickerState, setPickerState] = useState<{ open: boolean; target: HTMLElement | null; participantId: string | null }>({ open: false, target: null, participantId: null });

  const handleAddParticipant = () => {
    const newEmoji = PARTICIPANT_EMOJIS[participants.length % PARTICIPANT_EMOJIS.length];
    setParticipants([...participants, { id: crypto.randomUUID(), name: '', emoji: newEmoji }]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleNameChange = (id: string, name: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name } : p));
  };
  
  const handleEmojiChange = (id: string, emoji: string) => {
    setParticipants(participants.map(p => (p.id === id ? { ...p, emoji } : p)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tripName.trim() === '') {
      alert('Please give your trip a name!');
      return;
    }
    const validParticipants = participants.filter(p => p.name.trim() !== '');
    if (validParticipants.length > 1) {
      onTripStart(tripName, validParticipants, passcode, currency);
    } else {
      alert('Please add at least two friends with names!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
       <EmojiPicker
        isOpen={pickerState.open}
        onClose={() => setPickerState({ open: false, target: null, participantId: null })}
        onSelect={(emoji) => {
            if (pickerState.participantId) {
                handleEmojiChange(pickerState.participantId, emoji);
            }
        }}
        targetElement={pickerState.target}
      />
      <Card className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">Let's start travelling</h1>
        <p className="text-center text-gray-500 mb-6">Create your trip, set a currency, and invite your friends.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="sm:col-span-2">
                <label htmlFor="trip-name" className="block text-sm font-medium text-gray-700">Trip Name</label>
                <input
                  id="trip-name"
                  type="text"
                  placeholder="e.g., Summer trip to Italy"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="mt-1 w-full p-2 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <select 
                    id="currency" 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value)}
                    className="mt-1 w-full p-2 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>)}
                </select>
              </div>
          </div>
            <div>
                <label htmlFor="passcode" className="block text-sm font-medium text-gray-700">Trip Passcode (Optional)</label>
                <div className="relative mt-1">
                    <input
                      id="passcode"
                      type={showPasscode ? 'text' : 'password'}
                      placeholder="Add a passcode to protect your trip"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full p-2 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600"
                        aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                    >
                        {showPasscode ? <EyeOffIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                    </button>
                </div>
            </div>

          <hr className="border-slate-200" />

          {participants.map((p, index) => (
            <div key={p.id} className="flex items-center space-x-3">
               <button
                  type="button"
                  onClick={(e) => setPickerState({ open: true, target: e.currentTarget, participantId: p.id })}
                  className="text-3xl w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
                  aria-label={`Change emoji for ${p.name || `Traveller ${index + 1}`}`}
                >
                  {p.emoji}
                </button>
              <input
                type="text"
                placeholder={`Traveller ${index + 1}`}
                value={p.name}
                onChange={(e) => handleNameChange(p.id, e.target.value)}
                className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
              {participants.length > 1 && (
                <button type="button" onClick={() => handleRemoveParticipant(p.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={handleAddParticipant} className="w-full text-left text-blue-600 font-semibold hover:text-blue-800 p-2 rounded-lg flex items-center space-x-2">
             <PlusIcon className="h-5 w-5" />
             <span>Bigger Group?</span>
          </button>
          
          <div className="pt-4">
            <Button type="submit" className="w-full">
              Start Planning!
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TripSetup;