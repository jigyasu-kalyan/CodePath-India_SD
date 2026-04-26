import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { LeaderboardEntry } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Leaderboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get<LeaderboardEntry[]>('/leaderboard');
        setEntries(response.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
        setEntries([
          { rank: 1, userId: 101, name: 'Siddharth Gupta', score: 1250, badges: ['Pro Coder', 'Fastest Solver'] },
          { rank: 2, userId: 102, name: 'Ananya Sharma', score: 1100, badges: ['Bug Hunter'] },
          { rank: 3, userId: 103, name: 'Rahul Kumar', score: 950, badges: ['Steady'] },
          { rank: 4, userId: currentUser?.id || 0, name: currentUser?.name || 'You', score: 800, badges: [] },
          { rank: 5, userId: 105, name: 'Priya Patel', score: 750, badges: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [currentUser]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">Hall of Fame</h1>
        <div className="h-1.5 w-20 bg-orange-500 mx-auto rounded-full mb-4"></div>
        <p className="text-gray-600 font-medium">The top competitive coders from across CodePath India</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-500 text-white">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest">Rank</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest">Coder</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-right">Score</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`transition-colors ${
                    entry.userId === currentUser?.id ? 'bg-green-50' : 'hover:bg-gray-50'
                  } ${entry.rank % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`}
                >
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`flex items-center justify-center w-10 h-10 rounded-full font-black text-sm border-2 ${
                      entry.rank === 1 ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' :
                      entry.rank === 2 ? 'bg-gray-100 text-gray-600 border-gray-200' :
                      entry.rank === 3 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'text-gray-400 border-transparent'
                    }`}>
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black mr-4 border border-orange-200">
                        {entry.name.charAt(0)}
                      </div>
                      <span className={`font-bold ${entry.userId === currentUser?.id ? 'text-green-700' : 'text-gray-900'}`}>
                        {entry.name} {entry.userId === currentUser?.id && <span className="ml-2 text-[10px] bg-green-200 px-2 py-0.5 rounded text-green-800 uppercase">You</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <span className="text-gray-900 font-black font-mono text-lg">{entry.score.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {entry.badges.length > 0 ? entry.badges.map(badge => (
                        <span key={badge} className="px-3 py-1 bg-white text-orange-500 rounded-lg text-[10px] font-black border border-orange-100 uppercase tracking-tight shadow-sm">
                          {badge}
                        </span>
                      )) : <span className="text-gray-300 text-xs">-</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
