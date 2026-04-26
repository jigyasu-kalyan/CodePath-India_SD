import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Master DSA. <br />
            <span className="text-orange-500">Get Placed. 🚀</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl">
            India's smartest coding platform for students and teachers. Solve challenges, compete with peers, and level up your skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/register"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-lg transition-all shadow-lg hover:shadow-orange-500/20"
            >
              Start Coding Free
            </Link>
            <Link
              to="/challenges"
              className="px-8 py-4 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold rounded-lg text-lg transition-all"
            >
              Browse Challenges
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-orange-500/10">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="font-mono text-sm text-gray-300 overflow-hidden">
              <code>{`function solve(n, arr) {
  // Finding the optimal path
  const dp = new Array(n).fill(0);
  dp[0] = arr[0];
  
  for (let i = 1; i < n; i++) {
    dp[i] = Math.max(
      dp[i-1] + arr[i],
      arr[i]
    );
  }
  
  return Math.max(...dp);
}

// CodePath India: Level Up!
console.log(solve(5, [1, -2, 3, 4, -1]));`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-orange-500 py-10 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">🧑‍💻</span>
              <span className="text-3xl font-bold text-white">500+</span>
              <span className="text-orange-100 font-medium">Students</span>
            </div>
            <div className="flex flex-col items-center border-y sm:border-y-0 sm:border-x border-orange-400/50 py-6 sm:py-0">
              <span className="text-4xl mb-2">🎯</span>
              <span className="text-3xl font-bold text-white">200+</span>
              <span className="text-orange-100 font-medium">Challenges</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">🏆</span>
              <span className="text-3xl font-bold text-white">50+</span>
              <span className="text-orange-100 font-medium">Classrooms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to crack interviews</h2>
            <div className="h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="text-orange-500 text-3xl mb-4">🔥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Execution</h3>
              <p className="text-gray-600">Run and test code instantly with Judge0 integration supporting 50+ languages.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="text-orange-500 text-3xl mb-4">🏅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Leaderboard & Badges</h3>
              <p className="text-gray-600">Compete with peers across India and earn exclusive badges for your profile.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="text-orange-500 text-3xl mb-4">🏫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Classroom Management</h3>
              <p className="text-gray-600">Teachers can create private rooms, assign problems, and track student growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get started in 3 steps</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
            <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-orange-200 -z-10"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold flex items-center justify-center rounded-full mb-6 shadow-lg">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Account</h3>
              <p className="text-gray-600 max-w-xs">Sign up as a student or teacher in seconds.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold flex items-center justify-center rounded-full mb-6 shadow-lg">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Join Classroom</h3>
              <p className="text-gray-600 max-w-xs">Connect with your peers or create your own hub.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold flex items-center justify-center rounded-full mb-6 shadow-lg">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Solve & Win</h3>
              <p className="text-gray-600 max-w-xs">Climb the leaderboard and master DSA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-2xl font-bold text-orange-500 mb-2">CodePath India</h3>
            <p className="text-gray-600">Empowering the next generation of Indian developers.</p>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium">Home</Link>
            <Link to="/challenges" className="text-gray-600 hover:text-orange-500 font-medium">Challenges</Link>
            <Link to="/leaderboard" className="text-gray-600 hover:text-orange-500 font-medium">Leaderboard</Link>
            <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium">Login</Link>
          </div>
          <div className="text-gray-600">
            Made with ❤️ in India
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
