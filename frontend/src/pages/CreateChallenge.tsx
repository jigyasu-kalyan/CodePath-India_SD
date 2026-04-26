import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const CreateChallenge: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    rating: '',
    tags: '',
    sampleInput: '',
    sampleOutput: ''
  });
  const [testCases, setTestCases] = useState<{ input: string; output: string }[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <h2 className="text-2xl font-black text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">Only teachers and admins can create challenges.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      await api.post('/challenges', {
        ...formData,
        rating: formData.rating ? parseInt(formData.rating) : null,
        tags: tagsArray,
        testCases: testCases.length > 0 ? testCases : undefined
      });
      navigate('/challenges');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create challenge');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 bg-white">
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Create New Challenge</h1>
        <p className="text-gray-600 mb-8 font-medium">Add a custom coding problem for your students.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. Two Sum"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Detailed problem statement..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
              <select 
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Rating (Optional)</label>
              <input 
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. 1500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
              <input 
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="arrays, math, sorting"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sample Input</label>
              <textarea 
                name="sampleInput"
                value={formData.sampleInput}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sample Output</label>
              <textarea 
                name="sampleOutput"
                value={formData.sampleOutput}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Hidden Test Cases (Checker)</h3>
              <button 
                type="button" 
                onClick={addTestCase}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold border border-purple-200 hover:bg-purple-100 transition-colors text-sm flex items-center gap-2"
              >
                + Add Test Case
              </button>
            </div>
            
            {testCases.length === 0 ? (
              <p className="text-gray-500 text-sm font-medium italic bg-white p-6 rounded-xl border border-gray-200 text-center">
                No hidden test cases added. The compiler will only check against the Sample Input/Output.
              </p>
            ) : (
              <div className="space-y-6">
                {testCases.map((tc, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 relative shadow-sm">
                    <button 
                      type="button" 
                      onClick={() => removeTestCase(index)}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      ✕
                    </button>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Test Case #{index + 1}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Input</label>
                        <textarea 
                          value={tc.input}
                          onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                          placeholder="Hidden input data"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Expected Output</label>
                        <textarea 
                          value={tc.output}
                          onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                          placeholder="Expected result"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-6 border-t border-gray-200 flex justify-end">
            <button 
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-white transition-all shadow-lg ${
                submitting ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
              }`}
            >
              {submitting ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallenge;
