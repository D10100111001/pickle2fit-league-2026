import React from 'react';
import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { usePlayers, useTimeSlots } from '../providers';
import { INITIAL_TEAMS } from './timeslotHelpers';

export const PlayableMatchesSection = ({ playableMatches, timeSlot, totalRsvps }) => {
  const { linkMatchToTimeSlot } = useTimeSlots();
  const { getPlayerName } = usePlayers();
  const [linking, setLinking] = useState({});

  const handleLinkMatch = async (matchId, shouldLink) => {
    setLinking({ ...linking, [matchId]: true });
    try {
      await linkMatchToTimeSlot(timeSlot.id, matchId, shouldLink);
    } catch (err) {
      console.error('Error linking match:', err);
    } finally {
      setLinking({ ...linking, [matchId]: false });
    }
  };

  // Sort matches: linked ones first, then unlinked
  const sortedMatches = useMemo(() => {
    return [...playableMatches].sort((a, b) => {
      const aLinked = timeSlot.linkedMatches?.includes(a.id);
      const bLinked = timeSlot.linkedMatches?.includes(b.id);
      if (aLinked && !bLinked) return -1;
      if (!aLinked && bLinked) return 1;
      return a.id - b.id;
    });
  }, [playableMatches, timeSlot.linkedMatches]);

  const linkedCount = timeSlot.linkedMatches?.length || 0;

  return (
    <div className={`${playableMatches.length > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900/50 border-white/10'} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={playableMatches.length > 0 ? 'text-green-400' : 'text-slate-500'} size={18} />
        <span className={`font-bold ${playableMatches.length > 0 ? 'text-green-300' : 'text-slate-400'}`}>
          {playableMatches.length > 0
            ? `Can Play ${playableMatches.length} Match${playableMatches.length !== 1 ? 'es' : ''}`
            : 'Playable Matches'
          }
        </span>
        {linkedCount > 0 && (
          <span className="text-xs text-lime-400 bg-lime-500/20 px-2 py-0.5 rounded-full">
            {linkedCount} linked
          </span>
        )}
      </div>

      {playableMatches.length === 0 ? (
        <div className="text-sm text-slate-400">
          {totalRsvps === 0 ? (
            <>No RSVPs yet. Add RSVPs to see which matches can be played.</>
          ) : totalRsvps < 4 ? (
            <>Need at least 4 players to play a match. Currently {totalRsvps} player{totalRsvps !== 1 ? 's' : ''} coming.</>
          ) : (
            <>No complete matches yet. Need all 4 players from the same match to RSVP "coming".</>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMatches.map(match => {
            const isLinked = timeSlot.linkedMatches?.includes(match.id);

            // Find teams for this match
            const teamA = INITIAL_TEAMS.find(t => t.players.includes(match.pA1));
            const teamB = INITIAL_TEAMS.find(t => t.players.includes(match.pB1));

            return (
              <div
                key={match.id}
                className={`bg-slate-900/50 rounded-lg p-3 flex items-center justify-between gap-3 ${
                  isLinked ? 'ring-1 ring-lime-500/30' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    Match #{match.id}
                    {isLinked && (
                      <span className="text-[10px] text-lime-400">📌</span>
                    )}
                    {/* Team indicators */}
                    {teamA && teamB && (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {teamA.logo && (
                            <img
                              src={teamA.logo}
                              alt={teamA.name}
                              className="w-3.5 h-3.5 object-contain opacity-60"
                              title={teamA.name}
                            />
                          )}
                          <span className={`text-[9px] font-bold bg-gradient-to-r ${teamA.color} bg-clip-text text-transparent opacity-70`}>
                            {teamA.name.split(' ').map(w => w[0]).join('')}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-600">vs</span>
                        <div className="flex items-center gap-0.5">
                          {teamB.logo && (
                            <img
                              src={teamB.logo}
                              alt={teamB.name}
                              className="w-3.5 h-3.5 object-contain opacity-60"
                              title={teamB.name}
                            />
                          )}
                          <span className={`text-[9px] font-bold bg-gradient-to-r ${teamB.color} bg-clip-text text-transparent opacity-70`}>
                            {teamB.name.split(' ').map(w => w[0]).join('')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {getPlayerName(match.pA1)} & {getPlayerName(match.pA2)} vs{' '}
                    {getPlayerName(match.pB1)} & {getPlayerName(match.pB2)}
                  </div>
                </div>
                <button
                  onClick={() => handleLinkMatch(match.id, !isLinked)}
                  disabled={linking[match.id]}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isLinked
                      ? 'bg-lime-500/20 text-lime-400 hover:bg-lime-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {linking[match.id] ? '...' : isLinked ? 'Linked' : 'Link'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
