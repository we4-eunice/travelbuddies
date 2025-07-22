import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => {
  // Close modal on background click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200">
            <h3 id="modal-title" className="text-xl font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-slate-100" aria-label="Close modal">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default Modal;
