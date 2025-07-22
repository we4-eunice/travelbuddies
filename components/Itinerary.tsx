import React from 'react';
import type { ItineraryDay } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface ItineraryProps {
  itinerary: ItineraryDay[];
  updateItinerary: (newItinerary: ItineraryDay[]) => void;
}

const Itinerary: React.FC<ItineraryProps> = ({ itinerary, updateItinerary }) => {
  const handleDaysChange = (days: number) => {
    if (days < 1) return;
    const newItinerary: ItineraryDay[] = [];
    for (let i = 1; i <= days; i++) {
      newItinerary.push(itinerary.find(d => d.day === i) || { day: i, accommodation: '', spots: [], restaurants: [] });
    }
    updateItinerary(newItinerary);
  };

  const updateDay = (day: number, field: keyof Omit<ItineraryDay, 'day'>, value: string) => {
    updateItinerary(itinerary.map(d => d.day === day ? { ...d, [field]: value } : d));
  };
  
  const updateList = (day: number, field: 'spots' | 'restaurants', value: string, index: number) => {
     updateItinerary(itinerary.map(d => {
        if (d.day === day) {
            const newList = [...d[field]];
            newList[index] = value;
            return { ...d, [field]: newList };
        }
        return d;
     }));
  };

  const addListItem = (day: number, field: 'spots' | 'restaurants') => {
      updateItinerary(itinerary.map(d => d.day === day ? { ...d, [field]: [...d[field], ''] } : d));
  };
  
  const removeListItem = (day: number, field: 'spots' | 'restaurants', index: number) => {
    updateItinerary(itinerary.map(d => {
        if (d.day === day) {
            const newList = d[field].filter((_, i) => i !== index);
            return { ...d, [field]: newList };
        }
        return d;
    }));
  };


  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Itinerary</h2>
      <div className="mb-4">
        <label htmlFor="travel-days" className="block text-sm font-medium text-gray-700 mb-1">
          How many days is the trip?
        </label>
        <input
          type="number"
          id="travel-days"
          min="1"
          value={itinerary.length}
          onChange={(e) => handleDaysChange(parseInt(e.target.value, 10) || 1)}
          className="p-2 border border-slate-300 rounded-lg w-24 focus:ring-blue-400"
        />
      </div>

      <div className="space-y-6">
        {itinerary.map(day => (
          <div key={day.day} className="p-4 bg-slate-50 rounded-lg">
            <h3 className="text-xl font-semibold text-slate-700 mb-3">Day {day.day}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">🏠 Accommodation</label>
                <input
                  type="text"
                  placeholder="e.g., The Grand Hotel"
                  value={day.accommodation}
                  onChange={(e) => updateDay(day.day, 'accommodation', e.target.value)}
                  className="w-full p-2 mt-1 border rounded-md border-slate-300 focus:ring-blue-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">📍 Spots to Visit</label>
                {day.spots.map((spot, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-1">
                        <input type="text" placeholder="e.g., Central Park" value={spot} onChange={e => updateList(day.day, 'spots', e.target.value, index)} className="flex-grow p-2 border rounded-md border-slate-300 focus:ring-blue-400" />
                        <button onClick={() => removeListItem(day.day, 'spots', index)} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                ))}
                <button onClick={() => addListItem(day.day, 'spots')} className="text-blue-600 hover:text-blue-800 mt-2 text-sm flex items-center"><PlusIcon className="h-4 w-4 mr-1"/>Add Spot</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">🍽️ Restaurants</label>
                {day.restaurants.map((restaurant, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-1">
                        <input type="text" placeholder="e.g., Pizza Place" value={restaurant} onChange={e => updateList(day.day, 'restaurants', e.target.value, index)} className="flex-grow p-2 border rounded-md border-slate-300 focus:ring-blue-400" />
                        <button onClick={() => removeListItem(day.day, 'restaurants', index)} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                ))}
                <button onClick={() => addListItem(day.day, 'restaurants')} className="text-blue-600 hover:text-blue-800 mt-2 text-sm flex items-center"><PlusIcon className="h-4 w-4 mr-1"/>Add Restaurant</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Itinerary;