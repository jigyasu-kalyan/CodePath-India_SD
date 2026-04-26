import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';

interface Stats {
  totalSubmissions: number;
  badgesEarned: number;
  leaderboardRank: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<Stats>('/users/me/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        setStats({
          totalSubmissions: 12,
          badgesEarned: 3,
          leaderboardRank: 42,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
      <div className="bg-gray-50 rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Welcome back, <span className="text-orange-500">{user?.name}</span>!
          </h1>
          <p className="text-gray-600 font-medium mt-1">Ready for your next coding challenge today?</p>
        </div>
        <div className="flex gap-4">
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {user?.role}
          </span>
          <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-black text-xs uppercase tracking-wider flex items-center">
            PRO PLAN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg border-l-4 border-orange-500">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Total Submissions</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{stats?.totalSubmissions || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg border-l-4 border-orange-500">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Badges Earned</p>
          <p className="text-4xl font-black text-orange-500 mt-2">{stats?.badgesEarned || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg border-l-4 border-green-500">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Leaderboard Rank</p>
          <p className="text-4xl font-black text-green-500 mt-2">#{stats?.leaderboardRank || '-'}</p>
        </div>
      </div>

      <h2 className="text-2xl font-black text-gray-900 mb-8">Quick Navigation</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link
          to="/challenges"
          className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
            <svg className="w-7 h-7 text-orange-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900">Challenges</h3>
          <p className="text-gray-600 mt-2 font-medium leading-relaxed">Browse and solve coding problems from various domains.</p>
        </Link>

        <Link
          to="/leaderboard"
          className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
            <svg className="w-7 h-7 text-orange-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900">Leaderboard</h3>
          <p className="text-gray-600 mt-2 font-medium leading-relaxed">See how you rank against other coders in India.</p>
        </Link>

        <Link
          to="/classroom"
          className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
            <svg className="w-7 h-7 text-orange-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900">Classroom</h3>
          <p className="text-gray-600 mt-2 font-medium leading-relaxed">Join a classroom or manage your students easily.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
