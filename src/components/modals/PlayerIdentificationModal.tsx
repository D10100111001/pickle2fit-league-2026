import React from 'react';
import { useState, useMemo } from 'react';
import { Users, Search } from 'lucide-react';
import { usePlayers } from '../providers';

const PlayerIdentificationModal = ({ teams, onIdentify }) => {
  const { getPlayerName } = usePlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Get all unique players from all teams
  const allPlayers = useMemo(() => {
    return [...new Set(teams.flatMap(t => t.players))];
  }, [teams]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return allPlayers.slice(0, 10); // Show first 10 if no query
    const query = searchQuery.toLowerCase();
    return allPlayers.filter(playerId => getPlayerName(playerId).toLowerCase().includes(query)).slice(0, 10);
  }, [allPlayers, searchQuery, getPlayerName]);

  const handlePlayerSelect = (player) => {
    onIdentify(player);
  };

  const handleKeyDown = (e) => {
    if (filteredPlayers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredPlayers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredPlayers.length - 1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handlePlayerSelect(filteredPlayers[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-500/20 to-green-500/20 border-b border-lime-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-lime-500/20 p-2.5 rounded-full">
              <Users className="w-5 h-5 text-lime-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Who are you?</h2>
          </div>
          <p className="text-sm text-slate-300 ml-11">Select your name from the player list</p>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search for your name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
            />
          </div>

          {/* Player List */}
          <div className="max-h-80 overflow-y-auto bg-slate-800/30 rounded-xl border border-white/5">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((playerId, idx) => {
                const playerName = getPlayerName(playerId);
                const query = searchQuery.toLowerCase();
                const playerLower = playerName.toLowerCase();
                const matchIndex = query ? playerLower.indexOf(query) : -1;

                return (
                  <button
                    key={playerId}
                    onClick={() => handlePlayerSelect(playerName)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-4 py-3 text-left text-sm text-white transition-all flex items-center gap-3 ${
                      idx === selectedIndex
                        ? 'bg-lime-500/20 border-l-2 border-lime-500'
                        : 'hover:bg-lime-500/10'
                    } ${idx !== filteredPlayers.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <Users className={`w-4 h-4 flex-shrink-0 ${idx === selectedIndex ? 'text-lime-300' : 'text-lime-400'}`} />
                    <span className={`font-medium ${idx === selectedIndex ? 'text-lime-200' : ''}`}>
                      {matchIndex >= 0 ? (
                        <>
                          {playerName.substring(0, matchIndex)}
                          <span className="bg-lime-400/30 text-lime-100 px-0.5 rounded">
                            {playerName.substring(matchIndex, matchIndex + query.length)}
                          </span>
                          {playerName.substring(matchIndex + query.length)}
                        </>
                      ) : (
                        playerName
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No players found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerIdentificationModal;
