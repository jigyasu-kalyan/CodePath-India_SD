import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { Classroom as ClassroomType } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Classroom: React.FC = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<ClassroomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchClassrooms = async () => {
    try {
      const response = await api.get<ClassroomType[]>('/classrooms');
      setClassrooms(response.data);
    } catch (err) {
      console.error('Failed to fetch classrooms', err);
      if (user?.role === 'TEACHER') {
        setClassrooms([{ id: 1, name: 'Advanced Algorithms 2024', joinCode: 'ALGO123', teacherId: user.id, _count: { students: 15 } }]);
      } else {
        setClassrooms([{ id: 1, name: 'Advanced Algorithms 2024', joinCode: 'ALGO123', teacherId: 99, _count: { students: 15 } }]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post('/classrooms/join', { joinCode });
      setMessage({ type: 'success', text: 'Successfully joined the classroom!' });
      setJoinCode('');
      fetchClassrooms();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to join classroom. Check the code.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post('/classrooms', { name: newClassName });
      setMessage({ type: 'success', text: 'Classroom created successfully!' });
      setNewClassName('');
      fetchClassrooms();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create classroom.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">Classroom Hub</h1>
        <div className="h-1.5 w-16 bg-orange-500 rounded-full mb-4"></div>
        <p className="text-gray-600 font-medium">
          {user?.role === 'TEACHER' 
            ? 'Manage your classrooms and track student progress easily.' 
            : 'Join classrooms and interact with your instructors.'}
        </p>
      </div>

      {message && (
        <div className={`mb-8 p-5 rounded-2xl border-2 shadow-sm font-bold ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
             <span className="text-xl">{message.type === 'success' ? '✓' : '✕'}</span>
             {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl">
            {user?.role === 'TEACHER' ? (
              <form onSubmit={handleCreateClassroom}>
                <h3 className="text-xl font-black text-gray-900 mb-6">Create New Classroom</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Classroom Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="e.g. Data Structures Section A"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest text-sm"
                  >
                    {actionLoading ? 'Creating...' : 'Create Classroom'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleJoinClassroom}>
                <h3 className="text-xl font-black text-gray-900 mb-6">Join a Classroom</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Join Code</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-black focus:ring-2 focus:ring-orange-500 outline-none uppercase tracking-widest text-center text-xl transition-all"
                      placeholder="XXXXXX"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest text-sm"
                  >
                    {actionLoading ? 'Joining...' : 'Join Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xl">
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">Active Classrooms</h3>
            </div>
            
            <div className="p-8">
              {classrooms.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 font-bold italic">No classrooms joined yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {classrooms.map((cls) => (
                    <div key={cls.id} className="bg-white border-2 border-gray-50 rounded-2xl p-6 hover:border-orange-500 transition-all shadow-sm hover:shadow-xl transform hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                         <h4 className="text-lg font-black text-gray-900 leading-tight">{cls.name}</h4>
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm">Active</span>
                      </div>
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Join Code</span>
                          <span className="text-orange-600 font-black font-mono text-lg tracking-widest">{cls.joinCode}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Students</span>
                          <span className="text-gray-900 font-black text-xl">{cls._count?.students || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classroom;
