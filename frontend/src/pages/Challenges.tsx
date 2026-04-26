import React, { useEffect, useState } from 'react';
import { challengeService } from '../services/challengeService';
import { Challenge } from '../types';
import ChallengeCard from '../components/challenges/ChallengeCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [maxRating, setMaxRating] = useState<number | ''>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const data = await challengeService.getChallenges();
        setChallenges(data);
        setFilteredChallenges(data);
      } catch (err) {
        console.error('Failed to fetch challenges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  useEffect(() => {
    let result = challenges;
    
    if (search) {
      result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (difficultyFilter !== 'ALL') {
      result = result.filter(c => c.difficulty === difficultyFilter);
    }
    
    if (tagFilter) {
      const tagSearch = tagFilter.toLowerCase().trim();
      result = result.filter(c => c.tags?.some(tag => tag.toLowerCase().includes(tagSearch)));
    }

    if (minRating !== '') {
      result = result.filter(c => c.rating && c.rating >= minRating);
    }
    
    if (maxRating !== '') {
      result = result.filter(c => c.rating && c.rating <= maxRating);
    }
    
    setFilteredChallenges(result);
  }, [search, difficultyFilter, tagFilter, minRating, maxRating, challenges]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
      <div className="flex flex-col mb-12 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Coding Challenges</h1>
          <p className="text-gray-600 font-medium">Test your skills with problems from the community.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tag */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 font-bold">#</span>
            </span>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
              placeholder="Tag (e.g. math)"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            />
          </div>

          {/* Rating */}
          <div className="flex gap-2">
            <input
              type="number"
              className="block w-1/2 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
              placeholder="Min Rt"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value ? parseInt(e.target.value) : '')}
            />
            <input
              type="number"
              className="block w-1/2 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
              placeholder="Max Rt"
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value ? parseInt(e.target.value) : '')}
            />
          </div>
          
          {/* Difficulty */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-200 w-full overflow-x-auto">
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`flex-1 min-w-[60px] px-2 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${
                  difficultyFilter === diff
                    ? 'bg-gray-100 text-orange-500 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredChallenges.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-100">
          <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-black text-gray-900">No challenges found</h3>
          <p className="text-gray-600 mt-2 font-medium">Try adjusting your filters or search term.</p>
          <button 
            onClick={() => {setSearch(''); setDifficultyFilter('ALL'); setTagFilter('');}}
            className="mt-6 text-orange-500 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Challenges;
