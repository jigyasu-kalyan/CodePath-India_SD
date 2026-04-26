import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { submissionService } from '../services/submissionService';
import api from '../services/api';
import { Submission } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [subData, badgeRes] = await Promise.all([
          submissionService.getMySubmissions(),
          api.get('/users/me/badges')
        ]);
        setSubmissions(subData);
        setBadges(badgeRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch profile data', err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-500 text-white shadow-green-500/20';
      case 'WRONG_ANSWER': return 'bg-red-500 text-white shadow-red-500/20';
      case 'RUNTIME_ERROR': return 'bg-orange-500 text-white shadow-orange-500/20';
      default: return 'bg-gray-400 text-white shadow-gray-400/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Info Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-2xl text-center">
            <div className="w-28 h-28 bg-orange-50 border-4 border-white rounded-3xl shadow-xl mx-auto flex items-center justify-center text-4xl font-black text-orange-500 mb-6 relative">
               {user?.name.charAt(0)}
               <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-lg"></div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">{user?.name}</h2>
            <p className="text-gray-500 font-bold text-sm mb-6">{user?.email}</p>
            <div className="flex justify-center mb-10">
              <span className="px-5 py-2 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 text-xs font-black uppercase tracking-widest">
                {user?.role}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-8 border-t border-gray-50">
              <div className="text-center">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Solved</p>
                <p className="text-3xl font-black text-gray-900">
                  {submissions.filter(s => s.status === 'ACCEPTED').length}
                </p>
              </div>
              <div className="text-center border-l border-gray-50">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Attempted</p>
                <p className="text-3xl font-black text-gray-900">
                  {new Set(submissions.map(s => s.challengeId)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
              Your Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {badges.length === 0 ? (
                <p className="text-gray-400 text-sm font-medium italic">No badges earned yet. Keep solving!</p>
              ) : (
                badges.map((badge) => (
                  <span key={badge.id} className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 text-xs font-black uppercase tracking-tight shadow-sm flex items-center gap-2">
                    <span>{badge.icon}</span> {badge.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Submission History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xl">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Submission History</h3>
              <span className="text-xs font-bold text-gray-400">{submissions.length} Total</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Challenge</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Language</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-gray-400 font-bold italic">
                        No submissions yet. Start solving challenges!
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-black">
                          Challenge #{sub.challengeId}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusStyle(sub.status)}`}>
                            {sub.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-bold uppercase">
                          {sub.language}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400 font-medium">
                          {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
