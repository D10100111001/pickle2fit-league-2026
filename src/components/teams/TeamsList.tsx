import React from 'react';
import { useState } from 'react';
import { Crown, Edit3 } from 'lucide-react';
import { usePlayers } from '../providers';
import EditTeamModal from './EditTeamModal';

const TeamsList = ({ teams }) => {
  const { getPlayerName } = usePlayers();
  const [editingTeam, setEditingTeam] = useState(null);

  return (
    <>
      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
        />
      )}
      <div className="grid gap-6">
        {teams.map(team => (
          <div key={team.id} className="relative overflow-hidden rounded-2xl bg-slate-800/60 border border-white/5 shadow-xl">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${team.color}`} />
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                {team.logo && (
                  <div className="flex-shrink-0">
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="w-20 h-20 object-contain rounded-xl bg-white/5 p-2"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-white">{team.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{team.players.length} Players</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
                    title="Edit team players"
                  >
                    <Edit3 size={18} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                  <div className="bg-yellow-500/20 p-2 rounded-full">
                    <Crown size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Captain</div>
                    <div className="font-bold text-slate-200">{getPlayerName(team.captain, true)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {team.players.filter(p => p !== team.captain).map(playerId => (
                    <div key={playerId} className="bg-slate-700/30 p-2 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      {getPlayerName(playerId, true)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TeamsList;
