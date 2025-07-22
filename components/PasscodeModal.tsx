
import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';

interface PasscodeModalProps {
  onVerify: (passcode: string) => boolean;
  onCancel: () => void;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ onVerify, onCancel }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVerify(passcode)) {
      // Success, the parent will close the modal
    } else {
      setError('Incorrect passcode. Please try again.');
      setPasscode('');
    }
  };

  return (
    <Modal title="Passcode Required" onClose={onCancel}>
        <p className="text-gray-600 mb-4">This trip is protected by a passcode. Please enter it to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
              }}
              className={`w-full p-3 text-lg border rounded-lg focus:border-transparent ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-400'}`}
              placeholder="Enter trip passcode"
              required
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Join Trip</Button>
            </div>
        </form>
    </Modal>
  );
};

export default PasscodeModal;