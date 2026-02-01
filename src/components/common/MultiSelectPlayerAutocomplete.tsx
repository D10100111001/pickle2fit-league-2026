import { useState, useEffect, useMemo } from 'react';
import { Search, X, Users } from 'lucide-react';
import { Player, PlayerId } from '../../types';

interface MultiSelectPlayerAutocompleteProps {
  players: Player[];
  selectedPlayerIds?: PlayerId[];
  onPlayerSelect: (playerId: PlayerId, player: Player) => void;
  onPlayerRemove: (playerId: PlayerId) => void;
  onClearAll?: () => void;
  getPlayerName: (playerId: PlayerId) => string;
  placeholder?: string;
  showChips?: boolean;
  chipVariant?: 'default' | 'avatar';
  className?: string;
}

/**
 * Multi-select player autocomplete component
 * Allows selecting multiple players with search and autocomplete
 */
const MultiSelectPlayerAutocomplete: React.FC<MultiSelectPlayerAutocompleteProps> = ({
  players,
  selectedPlayerIds = [],
  onPlayerSelect,
  onPlayerRemove,
  onClearAll,
  getPlayerName,
  placeholder = "Search for a player...",
  showChips = true,
  chipVariant = 'default',
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.player-search-container')) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    // Filter out already selected players
    const availablePlayers = players.filter(
      player => !selectedPlayerIds.includes(player.id)
    );

    if (!searchQuery.trim()) return availablePlayers.slice(0, 8);

    const query = searchQuery.toLowerCase();
    return availablePlayers
      .filter(player => {
        const name = player.name || getPlayerName(player.id);
        return name.toLowerCase().includes(query);
      })
      .slice(0, 8);
  }, [players, searchQuery, selectedPlayerIds, getPlayerName]);

  const handleSelect = (player: Player) => {
    const playerId = player.id;
    if (!selectedPlayerIds.includes(playerId)) {
      onPlayerSelect(playerId, player);
    }
    setSearchQuery('');
    setShowAutocomplete(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || filteredPlayers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredPlayers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredPlayers[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setSelectedIndex(-1);
    }
  };

  const renderChip = (playerId: PlayerId, player?: Player) => {
    const name = player?.name || getPlayerName(playerId);

    if (chipVariant === 'avatar') {
      return (
        <div
          key={playerId}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-500/20 border border-lime-500/30 rounded-lg text-sm text-lime-300"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-slate-900 font-bold text-xs">
            {name?.[0]?.toUpperCase()}
          </div>
          <span>{name}</span>
          <button
            type="button"
            onClick={() => onPlayerRemove(playerId)}
            className="ml-1 p-0.5 hover:bg-lime-500/30 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={playerId}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-lime-500/20 border border-lime-500/30 rounded-lg text-sm text-lime-300"
      >
        <Users className="w-3.5 h-3.5" />
        <span>{name}</span>
        <button
          type="button"
          onClick={() => onPlayerRemove(playerId)}
          className="ml-1 p-0.5 hover:bg-lime-500/30 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const renderPlayerOption = (player: Player, idx: number) => {
    const playerId = player.id;
    const playerName = player.name || getPlayerName(playerId);
    const query = searchQuery.toLowerCase();
    const playerLower = playerName.toLowerCase();
    const matchIndex = playerLower.indexOf(query);

    if (chipVariant === 'avatar') {
      return (
        <button
          key={playerId}
          type="button"
          onClick={() => handleSelect(player)}
          onMouseEnter={() => setSelectedIndex(idx)}
          className={`w-full px-4 py-2.5 text-left text-sm text-white transition-colors flex items-center gap-3 ${
            idx === selectedIndex
              ? 'bg-lime-500/15'
              : 'hover:bg-slate-700/50'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-slate-900 font-bold text-sm">
            {playerName[0].toUpperCase()}
          </div>
          <span className={`${idx === selectedIndex ? 'text-white font-medium' : 'text-slate-300'}`}>
            {matchIndex >= 0 && query ? (
              <>
                {playerName.substring(0, matchIndex)}
                <span className="bg-lime-400/30 text-lime-200">
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
    }

    return (
      <button
        key={playerId}
        type="button"
        onClick={() => handleSelect(player)}
        onMouseEnter={() => setSelectedIndex(idx)}
        className={`w-full px-4 py-2.5 text-left text-sm text-white transition-colors flex items-center gap-3 ${
          idx === selectedIndex
            ? 'bg-lime-500/15'
            : 'hover:bg-slate-700/50'
        } ${idx !== filteredPlayers.length - 1 ? 'border-b border-white/5' : ''}`}
      >
        <Users className={`w-4 h-4 flex-shrink-0 ${idx === selectedIndex ? 'text-lime-400' : 'text-slate-400'}`} />
        <span className={`${idx === selectedIndex ? 'text-white font-medium' : 'text-slate-300'}`}>
          {matchIndex >= 0 ? (
            <>
              {playerName.substring(0, matchIndex)}
              <span className="bg-lime-400/30 text-lime-200">
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
  };

  return (
    <div className={`relative player-search-container ${className}`}>
      {/* Selected Players Chips */}
      {showChips && selectedPlayerIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedPlayerIds.map(playerId => {
            const player = players.find(p => p.id === playerId);
            return renderChip(playerId, player);
          })}
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowAutocomplete(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowAutocomplete(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setShowAutocomplete(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && filteredPlayers.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto">
            {filteredPlayers.map((player, idx) => renderPlayerOption(player, idx))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectPlayerAutocomplete;
