import React from 'react';
import { X, Sparkles, Zap, Trophy, Activity, Wifi, Users, Info } from 'lucide-react';

const AppInfoModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/30">
                <Sparkles className="w-6 h-6 text-red-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Live League Dashboard</h3>
              <p className="text-xs text-slate-400">Real-time pickleball league management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* What is This */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-lime-400" />
              What is Pickle2Fit League?
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              Welcome to the Pickle2Fit League 2026! This is a live, real-time pickleball tournament platform where players compete across 4 teams in a full round-robin format with 96 total matches.
            </p>
            <div className="bg-gradient-to-r from-lime-500/10 to-green-500/10 border border-lime-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-lime-500/20 p-2 rounded-lg flex-shrink-0">
                  <Trophy className="w-5 h-5 text-lime-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-lime-400 mb-1">Live Sync Enabled</div>
                  <div className="text-xs text-slate-300">
                    All changes sync instantly across all devices. When anyone reports a match result, everyone sees it in real-time!
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-lime-400" />
              How It Works
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Sign In with Google</div>
                  <div className="text-xs text-slate-400">Quick authentication - your name is automatically recognized</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">View Live Dashboard</div>
                  <div className="text-xs text-slate-400">See real-time standings, upcoming matches, and team stats</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Report Match Results</div>
                  <div className="text-xs text-slate-400">After playing, click any match to report the score and winner</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  4
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Watch Standings Update</div>
                  <div className="text-xs text-slate-400">Standings automatically recalculate as results come in</div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lime-400" />
              Key Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wifi className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Real-Time Sync</div>
                </div>
                <div className="text-xs text-slate-400">Instant updates across all devices</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Player Tracking</div>
                </div>
                <div className="text-xs text-slate-400">Know who reported each result</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Match History</div>
                </div>
                <div className="text-xs text-slate-400">Track changes and edits over time</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Auto Standings</div>
                </div>
                <div className="text-xs text-slate-400">Rankings update automatically</div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-lime-400" />
              Powered By
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-400">
                React
              </span>
              <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-medium text-orange-400">
                Firebase
              </span>
              <span className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-medium text-cyan-400">
                Tailwind CSS
              </span>
              <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-medium text-purple-400">
                Firestore
              </span>
              <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium text-green-400">
                Google Auth
              </span>
            </div>
          </section>

          {/* Help Section */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-lime-400" />
              Need Help?
            </h4>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Can't see matches?</span> Make sure you're signed in and check your internet connection.
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Results not updating?</span> The app uses real-time sync - refresh if needed.
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Wrong score reported?</span> Click the match again to edit - your changes are tracked!
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppInfoModal;
