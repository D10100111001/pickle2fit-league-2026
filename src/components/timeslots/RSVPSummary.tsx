import React from 'react';
import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { INITIAL_TEAMS } from './timeslotHelpers';

export const RSVPSummary = ({ rsvps, comingRsvps, getPlayerName }) => {
  if (rsvps.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 text-center">
        <p className="text-slate-400 text-sm">No RSVPs yet. Be the first!</p>
      </div>
    );
  }

  // Group coming players by team
  const playersByTeam = useMemo(() => {
    const grouped = {};

    comingRsvps.forEach(rsvp => {
      const team = INITIAL_TEAMS.find(t => t.players.includes(rsvp.playerId));
      if (team) {
        if (!grouped[team.id]) {
          grouped[team.id] = {
            team,
            players: []
          };
        }
        grouped[team.id].players.push(rsvp);
      }
    });

    return Object.values(grouped);
  }, [comingRsvps]);

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Users className="text-lime-400" size={18} />
        <span className="font-bold text-white">
          {comingRsvps.length} Coming
        </span>
      </div>
      {comingRsvps.length > 0 && (
        <div className="space-y-3">
          {playersByTeam.map(({ team, players }) => (
            <div key={team.id} className="space-y-2">
              {/* Team Header */}
              <div className="flex items-center gap-2">
                {team.logo && (
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-5 h-5 object-contain"
                  />
                )}
                <div className={`text-xs font-bold bg-gradient-to-r ${team.color} bg-clip-text text-transparent`}>
                  {team.name}
                </div>
                <div className="text-xs text-slate-500">({players.length})</div>
              </div>

              {/* Team Players */}
              <div className="flex flex-wrap gap-2 pl-1">
                {players.map(rsvp => (
                  <div
                    key={rsvp.id}
                    className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm flex items-center gap-2"
                    title={rsvp.onBehalfOf ? `RSVP by ${rsvp.respondedBy}` : ''}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-300 font-medium">
                      {getPlayerName(rsvp.playerId)}
                    </span>
                    {rsvp.onBehalfOf && (
                      <span className="text-green-500/60 text-xs">👤</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
