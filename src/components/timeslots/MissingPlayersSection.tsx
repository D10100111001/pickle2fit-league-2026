import React from 'react';
import { Info } from 'lucide-react';

export const MissingPlayersSection = ({ missingPlayers, expanded }) => {
  if (missingPlayers.length === 0) return null;

  const getPriorityStars = (count) => {
    if (count >= 5) return '⭐⭐⭐';
    if (count >= 3) return '⭐⭐';
    return '⭐';
  };

  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="text-orange-400" size={18} />
        <span className="font-bold text-orange-300">
          Key Missing Players
        </span>
      </div>
      <div className="space-y-2">
        {missingPlayers.map((player, idx) => (
          <div
            key={player.playerId}
            className="bg-slate-900/50 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  <span className="text-orange-400">{idx + 1}.</span>
                  {player.playerName}
                  {player.team && (
                    <div className="flex items-center gap-1">
                      {player.team.logo && (
                        <img
                          src={player.team.logo}
                          alt={player.team.name}
                          className="w-4 h-4 object-contain opacity-70"
                          title={player.team.name}
                        />
                      )}
                      <span className={`text-[10px] font-bold bg-gradient-to-r ${player.team.color} bg-clip-text text-transparent opacity-80`}>
                        {player.team.name.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                  )}
                  <span className="text-xs">{getPriorityStars(player.matchCount)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Would unlock {player.matchCount} match{player.matchCount !== 1 ? 'es' : ''}
                </div>
              </div>
            </div>
            {expanded && (
              <div className="mt-2 text-xs text-slate-500">
                Matches: {player.matches.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
