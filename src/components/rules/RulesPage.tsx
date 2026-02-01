import { Trophy, Zap } from 'lucide-react';
import { Card } from '../common';

const RulesPage: React.FC = () => (
  <div className="space-y-6">
    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-yellow-400" size={28} />
        <h2 className="text-2xl font-black text-white">Playoff Format</h2>
      </div>
      <div className="space-y-6">
        <div className="relative pl-6 border-l-2 border-lime-500">
           <h3 className="font-bold text-lime-400 text-lg">🥇 Championship Match</h3>
           <p className="text-slate-300 text-sm mt-1">1st Place vs 2nd Place</p>
           <p className="text-slate-400 text-xs mt-1">Best of 5 Matches. First to 3 wins takes the crown.</p>
        </div>
        <div className="relative pl-6 border-l-2 border-orange-500">
           <h3 className="font-bold text-orange-400 text-lg">🥉 Third-Place Match</h3>
           <p className="text-slate-300 text-sm mt-1">3rd Place vs 4th Place</p>
           <p className="text-slate-400 text-xs mt-1">Best of 5 Matches.</p>
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Zap className="text-pink-400" /> Flex Game Rule
      </h3>
      <ul className="space-y-3 text-sm text-slate-300">
        <li className="flex gap-2">
          <span className="text-pink-400 font-bold">•</span>
          Each team gets 10 Flex Games during the season.
        </li>
        <li className="flex gap-2">
          <span className="text-pink-400 font-bold">•</span>
          Switch player combinations freely during flex games.
        </li>
        <li className="flex gap-2">
          <span className="text-pink-400 font-bold">•</span>
          Once 10 flex games are used, you must return to standard pairings.
        </li>
      </ul>
    </Card>

    <Card className="p-6">
       <h3 className="font-bold text-lg mb-4 text-red-400">🔥 Tie-Breaker (Game 5)</h3>
       <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
         <p className="mb-2 font-bold text-red-300">If playoff match reaches 2-2:</p>
         <ul className="list-disc list-inside space-y-1 text-slate-300">
           <li>Played to 21 points</li>
           <li>Reshuffle partners every 5 points (5, 10, 15)</li>
           <li>Avoid repeating partners if possible</li>
         </ul>
       </div>
    </Card>
  </div>
);

export default RulesPage;
