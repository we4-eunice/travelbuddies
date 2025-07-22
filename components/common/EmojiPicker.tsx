
import React, { useRef, useEffect } from 'react';
import { PARTICIPANT_EMOJIS } from '../../constants';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  targetElement: HTMLElement | null;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ isOpen, onClose, onSelect, targetElement }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !targetElement) return null;

  const rect = targetElement.getBoundingClientRect();
  const top = rect.bottom + 8; // place below the target
  const left = rect.left; // align with left of target

  return (
    <div
      ref={pickerRef}
      className="fixed z-20 bg-white rounded-xl shadow-lg p-2 border border-slate-200 animate-fade-in-up"
      style={{ top: `${top}px`, left: `${left}px`, minWidth: '200px' }}
      role="dialog"
      aria-label="Emoji picker"
    >
      <div className="grid grid-cols-6 gap-1">
        {PARTICIPANT_EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="text-2xl p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label={`Select emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.2s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default EmojiPicker;
