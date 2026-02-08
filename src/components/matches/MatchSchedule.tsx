import { useState, useMemo } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { User } from 'firebase/auth';
import { usePlayers } from '../providers';
import { MultiSelectPlayerAutocomplete } from '../common';
import MatchCard from './MatchCard';
import { Match, Team, PlayerId, Player, ReportModalProps } from '../../types';
import { getMatchWinner, isTeamAFlex, isTeamBFlex } from '../../utils/matchUtils';

interface MatchScheduleProps {
  matches: Match[];
  updateMatch: (matchId: number, data: Partial<Match>) => void;
  teams: Team[];
  user: User | null;
  playerName: string | null;
  initialFilter?: 'all' | 'completed' | 'upcoming' | 'flexed';
  ReportModal?: React.ComponentType<ReportModalProps>;
}

const MatchSchedule: React.FC<MatchScheduleProps> = ({
  matches,
  updateMatch,
  teams,
  user,
  playerName,
  initialFilter = 'all',
  ReportModal
}) => {
  const { getPlayerName, players } = usePlayers();
  const [filterTeam, setFilterTeam] = useState<string>('All');
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerId[]>([]);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'date' | 'status'>('id');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'upcoming' | 'flexed'>(initialFilter === 'flexed' ? 'flexed' : initialFilter);

  // Get all unique players, filtered by team if selected
  const allPlayers = useMemo((): Player[] => {
    if (filterTeam === 'All') {
      const allPlayerIds = [...new Set(teams.flatMap(t => t.players))];
      return allPlayerIds.map(id => players[id]).filter(Boolean);
    } else {
      const team = teams.find(t => t.id === filterTeam);
      return team ? team.players.map(id => players[id]).filter(Boolean) : [];
    }
  }, [teams, filterTeam, players]);

  // Filter and sort matches by team and/or player
  const filteredMatches = matches
    .filter(m => {
      // Use computed winner function instead of stored property
      const winner = getMatchWinner(m);
      if (completionFilter === 'completed' && !winner) return false;
      if (completionFilter === 'upcoming' && winner) return false;
      if (completionFilter === 'flexed') {
        // Use computed flex functions instead of stored properties
        const isFlexed = isTeamAFlex(m) || isTeamBFlex(m);
        if (!isFlexed) return false;
      }

      const teamMatch = filterTeam === 'All' || m.teamA === filterTeam || m.teamB === filterTeam;

      if (selectedPlayers.length > 0) {
        const matchPlayers = [m.pA1, m.pA2, m.pB1, m.pB2];
        const playerMatch = selectedPlayers.every(playerId => matchPlayers.includes(playerId));
        return teamMatch && playerMatch;
      }

      return teamMatch;
    })
    .sort((a, b) => {
      if (completionFilter === 'completed') {
        if (a.reportedDate && b.reportedDate) {
          return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime();
        }
        return b.id - a.id;
      }

      if (sortBy === 'date') {
        if (a.scheduledDate && !b.scheduledDate) return -1;
        if (!a.scheduledDate && b.scheduledDate) return 1;
        if (a.scheduledDate && b.scheduledDate) {
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        }
        return a.id - b.id;
      } else if (sortBy === 'status') {
        // Use computed winner function instead of stored property
        const aCompleted = !!getMatchWinner(a);
        const bCompleted = !!getMatchWinner(b);
        if (aCompleted !== bCompleted) {
          return aCompleted ? 1 : -1;
        }
        return a.id - b.id;
      } else {
        return a.id - b.id;
      }
    });

  const handlePlayerSelect = (playerId: PlayerId, _player: Player) => {
    if (!selectedPlayers.includes(playerId)) {
      setSelectedPlayers(prev => [...prev, playerId]);
    }
  };

  const handleRemovePlayer = (playerId: PlayerId) => {
    setSelectedPlayers(prev => prev.filter(id => id !== playerId));
  };

  const handleClearAllPlayers = () => {
    setSelectedPlayers([]);
  };

  const handleTeamFilter = (teamId: string) => {
    setFilterTeam(teamId);
    setSelectedPlayers([]);
  };

  return (
    <div className="space-y-4">
      {/* Team Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => handleTeamFilter('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterTeam === 'All' ? 'bg-lime-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          All Games
        </button>
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => handleTeamFilter(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterTeam === t.id ? 'bg-lime-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Completion Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Show:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCompletionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${completionFilter === 'all' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
          >
            All Matches
          </button>
          <button
            onClick={() => setCompletionFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${completionFilter === 'completed' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
          >
            Completed
          </button>
          <button
            onClick={() => setCompletionFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${completionFilter === 'upcoming' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setCompletionFilter('flexed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${completionFilter === 'flexed' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
          >
            Flexed
          </button>
        </div>
      </div>

      {/* Sort Options */}
      {completionFilter !== 'completed' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('id')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === 'id' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
            >
              Game #
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${sortBy === 'date' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
            >
              <Calendar className="w-3 h-3" />
              Date
            </button>
            <button
              onClick={() => setSortBy('status')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === 'status' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
            >
              Status
            </button>
          </div>
        </div>
      )}

      {/* Player Search with Autocomplete */}
      <MultiSelectPlayerAutocomplete
        players={allPlayers}
        selectedPlayerIds={selectedPlayers}
        onPlayerSelect={handlePlayerSelect}
        onPlayerRemove={handleRemovePlayer}
        onClearAll={handleClearAllPlayers}
        getPlayerName={getPlayerName}
        placeholder={`Search players${filterTeam !== 'All' ? ` in ${teams.find(t => t.id === filterTeam)?.name}` : ''}...`}
        chipVariant="default"
      />

      {/* Results Summary */}
      {(selectedPlayers.length > 0 || filterTeam !== 'All' || completionFilter !== 'all') && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3 h-3" />
          <span>
            Showing {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
            {selectedPlayers.length > 0 && ` with all of: ${selectedPlayers.map(id => getPlayerName(id)).join(', ')}`}
            {completionFilter === 'completed' && ' (sorted by most recent)'}
          </span>
        </div>
      )}

      {/* Match List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-500 mb-2">No matches found</div>
            <button
              onClick={() => {
                setFilterTeam('All');
                setSelectedPlayers([]);
                setCompletionFilter('all');
              }}
              className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              teams={teams}
              highlightedPlayerIds={selectedPlayers}
              onEdit={() => setEditingMatch(match)}
            />
          ))
        )}
      </div>

      {editingMatch && ReportModal && (
        <ReportModal
          match={editingMatch}
          teams={teams}
          user={user}
          playerName={playerName}
          onClose={() => setEditingMatch(null)}
          onSave={(id, data) => {
            updateMatch(id, data);
            setEditingMatch(null);
          }}
        />
      )}
    </div>
  );
};

export default MatchSchedule;
