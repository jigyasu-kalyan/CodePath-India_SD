import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '../../types';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const navigate = useNavigate();

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-50 text-green-700 border-green-100';
      case 'MEDIUM': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'HARD': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div
      onClick={() => navigate(`/solve/${challenge.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl transition-all cursor-pointer group shadow-lg border-l-8 border-l-orange-500 transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-500 transition-colors leading-tight">
          {challenge.title}
        </h3>
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${getDifficultyStyles(challenge.difficulty)}`}>
          {challenge.difficulty}
        </span>
      </div>
      <p className="text-gray-600 text-sm line-clamp-3 mb-8 font-medium leading-relaxed">
        {challenge.description}
      </p>
      <div className="flex flex-wrap gap-2 mt-auto">
        {challenge.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-gray-100">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ChallengeCard;
