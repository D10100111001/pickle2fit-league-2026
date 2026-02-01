import React from 'react';
import { useState } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';

export const DeleteConfirmModal = ({ onClose, onConfirm, timeSlot }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error deleting:', err);
      setDeleting(false);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800/95 backdrop-blur-md border border-red-500/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Trash2 className="text-red-400" size={24} />
            Delete Time Slot
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete this time slot?
          </p>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
            <div className="text-lime-400 font-bold mb-1">
              {formatDateTime(timeSlot.dateTime)}
            </div>
            {timeSlot.location && (
              <div className="text-slate-400 text-sm">
                📍 {timeSlot.location}
              </div>
            )}
          </div>

          <p className="text-red-400 text-sm">
            This action cannot be undone. All RSVPs for this time slot will also be deleted.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
