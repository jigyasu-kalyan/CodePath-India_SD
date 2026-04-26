import React from 'react';

const LoadingSpinner: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-orange-500"></div>
        <div className="absolute top-0 left-0 animate-pulse rounded-full h-16 w-16 border-4 border-transparent border-b-green-500 opacity-50"></div>
      </div>
      <p className="text-gray-900 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Loading Path...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        {spinner}
      </div>
    );
  }

  return <div className="w-full py-20 flex items-center justify-center bg-white">{spinner}</div>;
};

export default LoadingSpinner;
