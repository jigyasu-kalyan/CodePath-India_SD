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
  const [meetLink, setMeetLink] = useState('');
  const [scheduleDays, setScheduleDays] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchClassrooms = async () => {
    try {
      const response = await api.get<ClassroomType[]>('/classrooms');
      setClassrooms(response.data);
    } catch (err) {
      console.error('Failed to fetch classrooms', err);
      // Removed fallback mock logic since API is now implemented
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
      await api.post('/classrooms', { 
        name: newClassName,
        meetLink,
        scheduleDays,
        scheduleTime 
      });
      setMessage({ type: 'success', text: 'Classroom created successfully!' });
      setNewClassName('');
      setMeetLink('');
      setScheduleDays('');
      setScheduleTime('');
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
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="e.g. Data Structures Section A"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Google Meet Link (Optional)</label>
                    <input
                      type="url"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="https://meet.google.com/..."
                      value={meetLink}
                      onChange={(e) => setMeetLink(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Days</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="e.g. Mon, Wed, Fri"
                        value={scheduleDays}
                        onChange={(e) => setScheduleDays(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="e.g. 5:00 PM"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
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
                    <a 
                      key={cls.id} 
                      href={cls.meetLink || '#'} 
                      target={cls.meetLink ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      className={`block bg-white border-2 border-gray-50 rounded-2xl p-6 transition-all shadow-sm transform group ${cls.meetLink ? 'hover:border-orange-500 hover:shadow-xl hover:-translate-y-1' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                         <h4 className={`text-lg font-black text-gray-900 leading-tight transition-colors ${cls.meetLink ? 'group-hover:text-orange-500' : ''}`}>{cls.name}</h4>
                         <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                           Live
                         </span>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex items-center text-sm font-bold text-gray-600 mb-1">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {cls.scheduleDays || 'TBD'}
                        </div>
                        <div className="flex items-center text-sm font-bold text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {cls.scheduleTime || 'TBD'}
                        </div>
                      </div>

                      {cls.meetLink && (
                        <div className="w-full bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          Join Google Meet
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Join Code</span>
                          <span className="text-orange-600 font-black font-mono text-lg tracking-widest">{cls.joinCode}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Students</span>
                          <span className="text-gray-900 font-black text-xl">{cls._count?.students || 0}</span>
                        </div>
                      </div>
                    </a>
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
