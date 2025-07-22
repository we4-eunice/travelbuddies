import React, { useState } from 'react';
import type { ToBringItem } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import { generateToBringList } from '../services/geminiService';

interface ToBringListProps {
  list: ToBringItem[];
  updateList: (newList: ToBringItem[]) => void;
}

const ToBringList: React.FC<ToBringListProps> = ({ list, updateList }) => {
  const [newItemText, setNewItemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addItem = () => {
    if (newItemText.trim()) {
      updateList([...list, { id: crypto.randomUUID(), text: newItemText, checked: false }]);
      setNewItemText('');
    }
  };
  
  const removeItem = (id: string) => {
    updateList(list.filter(item => item.id !== id));
  };
  
  const toggleItem = (id: string) => {
    updateList(list.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleSuggestItems = async () => {
    setIsLoading(true);
    try {
      const suggestions = await generateToBringList();
      const newItems = suggestions.map(text => ({ id: crypto.randomUUID(), text, checked: false }));
      updateList([...list, ...newItems]);
    } catch (error) {
        console.error("Failed to suggest items:", error);
        alert("Sorry, couldn't fetch AI suggestions. Please try again later.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">To-Bring List</h2>
      
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="New item..."
          className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-blue-400"
        />
        <Button onClick={addItem} aria-label="Add item"><PlusIcon className="h-5 w-5"/></Button>
      </div>

      <ul className="space-y-2 mb-4">
        {list.map(item => (
          <li key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-gray-700 group-hover:text-blue-600 transition-colors ${item.checked ? 'line-through text-gray-400' : ''}`}>
                {item.text}
              </span>
            </label>
            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500" aria-label={`Remove ${item.text}`}>
              <TrashIcon className="h-5 w-5"/>
            </button>
          </li>
        ))}
         {list.length === 0 && <p className="text-gray-500 italic text-center">Your list is empty. Add some items!</p>}
      </ul>

      <Button onClick={handleSuggestItems} disabled={isLoading} variant="secondary" className="w-full">
        {isLoading ? 'Thinking...' : '✨ Suggest Items with AI'}
      </Button>
    </Card>
  );
};

export default ToBringList;