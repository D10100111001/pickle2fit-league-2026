import { Calendar, Edit3 } from 'lucide-react';
import { usePlayers } from '../providers';
import { Badge } from '../common';
import { Match, Team, PlayerId } from '../../types';
import { getMatchScore, getMatchWinner, isTeamAFlex, isTeamBFlex } from '../../utils/matchUtils';

interface MatchCardProps {
  match: Match;
  teams: Team[];
  searchQuery?: string;
  highlightedPlayerIds?: PlayerId[];
  onEdit: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, teams, searchQuery = '', highlightedPlayerIds = [], onEdit }) => {
  const { getPlayerName } = usePlayers();
  const matchWinner = getMatchWinner(match);
  const matchScore = getMatchScore(match);
  const isPlayed = !!matchWinner;
  const teamAData = teams.find(t => t.id === match.teamA);
  const teamBData = teams.find(t => t.id === match.teamB);

  // Original player assignments
  const originalPA1 = match.originalPA1;
  const originalPA2 = match.originalPA2;
  const originalPB1 = match.originalPB1;
  const originalPB2 = match.originalPB2;

  // Compute flex status
  const teamAUsedFlex = isTeamAFlex(match);
  const teamBUsedFlex = isTeamBFlex(match);

  // Determine match status
  const getMatchStatus = () => {
    if (isPlayed) {
      return { label: 'Completed', className: 'bg-green-500/20 text-green-400' };
    } else if (match.scheduledDate) {
      return { label: 'Scheduled', className: 'bg-blue-500/20 text-blue-400' };
    } else {
      return { label: 'Unscheduled', className: 'bg-slate-700 text-slate-400' };
    }
  };

  const matchStatus = getMatchStatus();

  // Helper to highlight player name if it's in the highlighted list
  const renderPlayerName = (playerId: PlayerId): React.ReactNode => {
    const playerName = getPlayerName(playerId);
    const isHighlighted = highlightedPlayerIds.includes(playerId);

    if (isHighlighted) {
      return (
        <span className="bg-lime-400/30 text-lime-100 font-medium">
          {playerName}
        </span>
      );
    }

    // Fallback to search query highlighting if no player IDs are highlighted
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const textLower = playerName.toLowerCase();
      const matchIndex = textLower.indexOf(query);

      if (matchIndex !== -1) {
        return (
          <>
            {playerName.substring(0, matchIndex)}
            <span className="bg-lime-400/30 text-lime-100">
              {playerName.substring(matchIndex, matchIndex + query.length)}
            </span>
            {playerName.substring(matchIndex + query.length)}
          </>
        );
      }
    }

    return playerName;
  };

  // Format scheduled date with time in local timezone
  const formatDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Format time in local timezone
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: date.getMinutes() !== 0 ? '2-digit' : undefined,
      hour12: true
    });

    if (compareDate.getTime() === today.getTime()) return `Today at ${timeStr}`;
    if (compareDate.getTime() === tomorrow.getTime()) return `Tomorrow at ${timeStr}`;

    const dateOnlyStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
    return `${dateOnlyStr} at ${timeStr}`;
  };

  return (
    <div
      onClick={onEdit}
      className={`relative group bg-slate-800/50 border border-white/5 rounded-xl p-4 transition-all hover:bg-slate-800 hover:border-lime-500/30 cursor-pointer ${isPlayed ? 'opacity-70 hover:opacity-100' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <Badge className={`${matchStatus.className} self-start`}>
            {matchStatus.label}
          </Badge>
          {isPlayed && match.reportedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(match.reportedDate)}</span>
            </div>
          )}
          {!isPlayed && match.scheduledDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(match.scheduledDate)}</span>
            </div>
          )}
        </div>
        <span className="text-xs font-mono text-slate-500">Game #{match.id}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Team A */}
        <div className="flex-1">
          <div className={`font-bold text-lg ${matchWinner === match.teamA ? 'text-lime-400' : 'text-white'}`}>
            {teamAData?.name || match.teamA}
          </div>
          <div className="text-xs text-slate-400 flex flex-col mt-1 gap-0.5">
            <div>
              {teamAUsedFlex && match.pA1 !== originalPA1 && (
                <span className="line-through text-slate-600 mr-1">{renderPlayerName(originalPA1)}</span>
              )}
              <span className={teamAUsedFlex && match.pA1 !== originalPA1 ? 'text-pink-400' : ''}>{renderPlayerName(match.pA1)}</span>
            </div>
            <div>
              {teamAUsedFlex && match.pA2 !== originalPA2 && (
                <span className="line-through text-slate-600 mr-1">{renderPlayerName(originalPA2)}</span>
              )}
              <span className={teamAUsedFlex && match.pA2 !== originalPA2 ? 'text-pink-400' : ''}>{renderPlayerName(match.pA2)}</span>
            </div>
          </div>
          {teamAUsedFlex && <span className="text-[10px] text-pink-400 border border-pink-500/30 px-1 rounded mt-1 inline-block">Flex Used</span>}
        </div>

        {/* VS / Score */}
        <div className="px-4 text-center">
          {isPlayed ? (
            <div className="flex flex-col gap-1">
              <div className="bg-slate-900 rounded-lg px-3 py-1 font-mono font-bold text-xl border border-white/10">
                {matchScore}
              </div>
              {match.games && match.games.length > 0 && (
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  {match.games.filter(g => g.scoreA && g.scoreB).map((game, i) => (
                    <div key={i} className="font-mono">
                      {game.scoreA}-{game.scoreB}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-600 font-bold text-sm bg-slate-900/50 w-8 h-8 rounded-full flex items-center justify-center">
              VS
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex-1 text-right">
          <div className={`font-bold text-lg ${matchWinner === match.teamB ? 'text-lime-400' : 'text-white'}`}>
            {teamBData?.name || match.teamB}
          </div>
          <div className="text-xs text-slate-400 flex flex-col items-end mt-1 gap-0.5">
            <div>
              {teamBUsedFlex && match.pB1 !== originalPB1 && (
                <span className="line-through text-slate-600 mr-1">{renderPlayerName(originalPB1)}</span>
              )}
              <span className={teamBUsedFlex && match.pB1 !== originalPB1 ? 'text-pink-400' : ''}>{renderPlayerName(match.pB1)}</span>
            </div>
            <div>
              {teamBUsedFlex && match.pB2 !== originalPB2 && (
                <span className="line-through text-slate-600 mr-1">{renderPlayerName(originalPB2)}</span>
              )}
              <span className={teamBUsedFlex && match.pB2 !== originalPB2 ? 'text-pink-400' : ''}>{renderPlayerName(match.pB2)}</span>
            </div>
          </div>
          {teamBUsedFlex && <span className="text-[10px] text-pink-400 border border-pink-500/30 px-1 rounded mt-1 inline-block">Flex Used</span>}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-[1px] rounded-xl">
        <button className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-2 px-6 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2">
          <Edit3 size={16} /> {isPlayed ? 'View Details' : 'Edit Match'}
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
