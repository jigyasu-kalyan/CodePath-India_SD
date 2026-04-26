import React from 'react';

interface TestCasePanelProps {
  input: string;
  output: string;
}

const TestCasePanel: React.FC<TestCasePanelProps> = ({ input, output }) => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
           <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Sample Input</h3>
        </div>
        <pre className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 text-orange-600 font-black font-mono text-sm overflow-x-auto shadow-inner">
          {input || 'None'}
        </pre>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
           <div className="w-1 h-4 bg-green-500 rounded-full"></div>
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Sample Output</h3>
        </div>
        <pre className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 text-green-600 font-black font-mono text-sm overflow-x-auto shadow-inner">
          {output || 'None'}
        </pre>
      </div>
    </div>
  );
};

export default TestCasePanel;
