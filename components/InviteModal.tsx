
import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import ClipboardIcon from './icons/ClipboardIcon';

interface InviteModalProps {
  link: string;
  tripName: string;
  passcode?: string;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ link, tripName, passcode, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailBody = `Hey! Let's plan our trip together. Here's the link to our shared planner:\n\n${link}` +
    (passcode ? `\n\nYou'll need this passcode to join: ${passcode}` : '');


  return (
    <Modal title="Invite Your Friends" onClose={onClose}>
      <p className="text-gray-600 mb-4">Share this link with your friends to let them join the trip planning!</p>
      
      {passcode && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
            <p className="font-bold">Passcode: <span className="font-mono bg-yellow-200 px-2 py-1 rounded">{passcode}</span></p>
            <p className="text-sm">Don't forget to share the passcode with your friends!</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          value={link}
          readOnly
          className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Invitation link"
        />
        <Button onClick={handleCopy} className="w-full sm:w-32 flex-shrink-0">
          {copied ? 'Copied!' : <><ClipboardIcon className="h-5 w-5 inline-block mr-1"/> Copy Link</>}
        </Button>
      </div>
      <div className="mt-4">
        <a 
          href={`mailto:?subject=${encodeURIComponent(`Join our trip: ${tripName}`)}&body=${encodeURIComponent(emailBody)}`}
          className="w-full inline-block text-center px-4 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          Share via Email
        </a>
      </div>
       <p className="text-xs text-gray-400 mt-4 text-center">Anyone with the link can view the trip details. Share wisely!</p>
    </Modal>
  );
};

export default InviteModal;