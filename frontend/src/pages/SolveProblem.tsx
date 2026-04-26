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
  
  // Editor States
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  
  // Codeforces Verify State
  const [cfHandle, setCfHandle] = useState(''); 
  
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
        const data = await challengeService.getChallengeById(id);
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

  const handleVerify = async () => {
    if (!id || !cfHandle || submitting) return;
    setSubmitting(true);
    setResult(null);

    try {
      const sub = await submissionService.verifyCodeforces(id as string, cfHandle);
      setResult(sub);
    } catch (err) {
      console.error('Verification failed', err);
      setResult({
        id: Math.random().toString(),
        challengeId: id as string,
        userId: '0',
        code: '',
        language: '',
        status: 'WRONG_ANSWER',
        createdAt: new Date().toISOString()
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!id || !code || submitting) return;
    setSubmitting(true);
    setResult(null);

    try {
      // Assuming manual challenge submission is the same as the previous submitCode method but takes id as string
      // Note: we need to ensure submissionService.submitCode accepts string challengeId now
      const sub = await submissionService.submitCode(id as string, code, language);
      setResult(sub);
    } catch (err) {
      console.error('Submission failed', err);
      setResult({
        id: Math.random().toString(),
        challengeId: id as string,
        userId: '0',
        code,
        language,
        status: 'WRONG_ANSWER',
        createdAt: new Date().toISOString()
      } as any);
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
             <TestCasePanel input={challenge.sampleInput || ''} output={challenge.sampleOutput || ''} />
          </div>
        </div>
      </div>

      {challenge.source === 'Codeforces' ? (
        <div className="lg:w-1/2 w-full flex flex-col bg-gray-50 border-l border-gray-200 p-8">
          {/* Right Panel - Verification Flow */}
          <div className="max-w-xl mx-auto w-full flex flex-col h-full justify-center">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Solve on Codeforces</h2>
              <p className="text-gray-600 font-medium mb-6">
                This problem is hosted on Codeforces. Click the button below to solve it there.
              </p>
              <a 
                href={`https://codeforces.com/problemset/problem/${id!.split('-')[0]}/${id!.split('-')[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-8 py-4 bg-[#1f8ACB] hover:bg-[#1a73aa] text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
              >
                Open Problem on Codeforces
              </a>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 mb-4">Verify Submission</h3>
              <p className="text-gray-600 font-medium text-sm mb-6">
                Once you've solved the problem on Codeforces, enter your handle below to verify your submission and earn points.
              </p>
              
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Your Codeforces Handle"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  value={cfHandle}
                  onChange={(e) => setCfHandle(e.target.value)}
                />
                
                <button
                  onClick={handleVerify}
                  disabled={submitting || !cfHandle}
                  className={`w-full px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg ${
                    submitting || !cfHandle
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20'
                  }`}
                >
                  {submitting ? 'Verifying...' : 'Verify Submission'}
                </button>
                
                {result && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    result.status === 'ACCEPTED' ? 'bg-green-50 border-green-200 text-green-700' :
                    'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      {result.status === 'ACCEPTED' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                      <div>
                        <p className="font-bold">{result.status === 'ACCEPTED' ? 'Verification Successful!' : 'Verification Failed'}</p>
                        <p className="text-sm font-medium opacity-80">
                          {result.status === 'ACCEPTED' ? 'You have successfully solved this problem.' : 'No accepted submission found for this handle.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="lg:w-1/2 w-full flex flex-col bg-gray-900">
          {/* Right Panel - Editor for Manual Problems */}
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
                onClick={handleSubmitCode}
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
      )}
    </div>
  );
};

export default SolveProblem;
