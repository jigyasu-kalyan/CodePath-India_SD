import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { challengeService } from '../services/challengeService';
import { submissionService } from '../services/submissionService';
import { Challenge, Submission } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import TestCasePanel from '../components/challenges/TestCasePanel';

const SolveProblem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Submission | null>(null);

  const languages = [
    { name: 'C++', value: 'cpp', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}' },
    { name: 'Python', value: 'python', defaultCode: 'def solve():\n    # your code here\n    pass\n\nif __name__ == "__main__":\n    solve()' },
    { name: 'Java', value: 'java', defaultCode: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}' },
    { name: 'JavaScript', value: 'javascript', defaultCode: 'function solve() {\n    // your code here\n}\n\nsolve();' },
  ];

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;
      try {
        const data = await challengeService.getChallengeById(parseInt(id));
        setChallenge(data);
        setCode(languages[0].defaultCode);
      } catch (err) {
        console.error('Failed to fetch challenge', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const langObj = languages.find(l => l.value === newLang);
    if (langObj) setCode(langObj.defaultCode);
  };

  const handleSubmit = async () => {
    if (!id || !code || submitting) return;
    setSubmitting(true);
    setResult(null);

    try {
      const sub = await submissionService.submitCode(parseInt(id), code, language);
      setResult(sub);
    } catch (err) {
      console.error('Submission failed', err);
      setResult({
        id: Math.random(),
        challengeId: parseInt(id),
        userId: 0,
        code,
        language,
        status: 'WRONG_ANSWER',
        createdAt: new Date().toISOString()
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-white">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Challenge not found</h2>
        <p className="text-gray-600">The problem you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-white">
      {/* Left Panel - Problem Description */}
      <div className="lg:w-1/2 w-full bg-white border-r border-gray-200 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-black text-gray-900 mb-4">{challenge.title}</h1>
          <div className="flex gap-3 mb-8">
            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${
              challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-700 border-green-200' :
              challenge.difficulty === 'MEDIUM' ? 'bg-orange-100 text-orange-700 border-orange-200' :
              'bg-red-100 text-red-700 border-red-200'
            }`}>
              {challenge.difficulty}
            </span>
            {challenge.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="prose prose-orange max-w-none mb-10">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
          </div>

          <div className="pt-8 border-t border-gray-100">
             <TestCasePanel input={challenge.sampleInput} output={challenge.sampleOutput} />
          </div>
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className="lg:w-1/2 w-full flex flex-col bg-gray-900">
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <select
              className="bg-gray-700 text-white text-sm font-bold rounded-lg px-4 py-2 focus:outline-none border border-gray-600 hover:bg-gray-600 transition-colors"
              value={language}
              onChange={handleLanguageChange}
            >
              {languages.map(l => (
                <option key={l.value} value={l.value}>{l.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-6">
            {result && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-white shadow-lg ${
                result.status === 'ACCEPTED' ? 'bg-green-500 shadow-green-500/20' :
                result.status === 'WRONG_ANSWER' ? 'bg-red-500 shadow-red-500/20' :
                'bg-orange-500 shadow-orange-500/20'
              }`}>
                {result.status === 'ACCEPTED' ? '✓ Accepted' : 
                 result.status === 'WRONG_ANSWER' ? '✕ Wrong Answer' : 
                 '⚠ Error'}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-8 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all shadow-lg ${
                submitting 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' 
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20'
              }`}
            >
              {submitting ? 'Judging...' : 'Submit Code'}
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              padding: { top: 20 },
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SolveProblem;
