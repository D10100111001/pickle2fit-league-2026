import React from 'react';
import { useState } from 'react';
import { X, Edit3, Crown } from 'lucide-react';
import { usePlayers } from '../providers';

const EditTeamModal = ({ team, onClose }) => {
  const { players, updatePlayer } = usePlayers();
  const [editedPlayers, setEditedPlayers] = useState({});

  const handlePlayerNameChange = (playerId, newName) => {
    setEditedPlayers(prev => ({ ...prev, [playerId]: newName }));
  };

  const handleSave = async () => {
    // Update all edited players
    for (const [playerId, newName] of Object.entries(editedPlayers)) {
      if (newName.trim() && newName !== players[playerId]?.name) {
        await updatePlayer(playerId, newName.trim());
      }
    }
    onClose();
  };

  const getPlayerName = (playerId) => {
    return editedPlayers[playerId] !== undefined
      ? editedPlayers[playerId]
      : players[playerId]?.name || playerId;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Edit3 size={24} className="text-lime-400" />
              Edit {team.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {team.players.map(playerId => (
              <div key={playerId} className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  {playerId === team.captain && <Crown size={14} className="text-yellow-400" />}
                  {playerId === team.captain ? 'Captain' : 'Player'}
                </label>
                <input
                  type="text"
                  value={getPlayerName(playerId)}
                  onChange={(e) => handlePlayerNameChange(playerId, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="Player name"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-slate-900 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-lime-500/20 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTeamModal;
