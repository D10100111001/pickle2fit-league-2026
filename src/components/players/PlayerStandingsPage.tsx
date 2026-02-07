import { Match, Team } from '../../types';
import { PlayerStandings } from '../dashboard';

interface PlayerStandingsPageProps {
  matches: Match[];
  teams: Team[];
}

const PlayerStandingsPage: React.FC<PlayerStandingsPageProps> = ({ matches, teams }) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
              Player Rankings
            </h2>
            <p className="text-white/80 font-medium">
              Complete player statistics and performance metrics
            </p>
          </div>
        </div>
      </div>

      {/* Full Player Standings with Sorting */}
      <PlayerStandings
        matches={matches}
        teams={teams}
        enableSorting={true}
      />
    </div>
  );
};

export default PlayerStandingsPage;
