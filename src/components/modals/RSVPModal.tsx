import React from 'react';
import { useState } from 'react';
import { Users, X, Loader2 } from 'lucide-react';
import { useTimeSlots, usePlayers } from '../providers';
import { MultiSelectPlayerAutocomplete } from '../common';

const RSVPModal = ({ timeSlot, onClose }) => {
  const { submitRSVP } = useTimeSlots();
  const { players } = usePlayers();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [status, setStatus] = useState('coming');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePlayerSelect = (playerId) => {
    if (!selectedPlayers.includes(playerId)) {
      setSelectedPlayers(prev => [...prev, playerId]);
    }
  };

  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(prev => prev.filter(id => id !== playerId));
  };

  const handleClearPlayers = () => {
    setSelectedPlayers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPlayers.length === 0) {
      setError('Please select at least one player');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const onBehalfOf = false;
      // Submit RSVP for all selected players
      await Promise.all(
        selectedPlayers.map(playerId =>
          submitRSVP(timeSlot.id, playerId, status, notes, onBehalfOf)
        )
      );
      onClose();
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      setError('Failed to submit RSVP. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-lime-400" size={24} />
            RSVP
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Player Search with Autocomplete */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Players *
            </label>
            <MultiSelectPlayerAutocomplete
              players={Object.values(players)}
              selectedPlayerIds={selectedPlayers}
              onPlayerSelect={handlePlayerSelect}
              onPlayerRemove={handleRemovePlayer}
              onClearAll={handleClearPlayers}
              getPlayerName={(playerId) => players[playerId]?.name || playerId}
              placeholder="Search for a player..."
              chipVariant="avatar"
            />
          </div>

          {/* Status Toggle Buttons */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Are you coming? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('coming')}
                className={`relative px-6 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${
                  status === 'coming'
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-slate-900/50 text-slate-400 border border-white/10 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`text-3xl ${status === 'coming' ? 'animate-bounce' : ''}`}>✅</div>
                  <span>Coming</span>
                </div>
                {status === 'coming' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/20 to-transparent animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setStatus('not_coming')}
                className={`relative px-6 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${
                  status === 'not_coming'
                    ? 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-lg shadow-red-500/30 scale-105'
                    : 'bg-slate-900/50 text-slate-400 border border-white/10 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">❌</div>
                  <span>Not Coming</span>
                </div>
                {status === 'not_coming' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-400/20 to-transparent animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || selectedPlayers.length === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                `Submit RSVP${selectedPlayers.length > 1 ? ` (${selectedPlayers.length})` : ''}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RSVPModal;
