import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Challenges', path: '/challenges' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Classroom', path: '/classroom' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="bg-white border-b-2 border-orange-500 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-black text-orange-500 tracking-tight">
                CodePath <span className="text-gray-900">India</span>
              </span>
            </Link>
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`${
                        location.pathname === link.path
                          ? 'text-orange-500 border-b-2 border-orange-500'
                          : 'text-gray-700 hover:text-orange-500'
                      } px-1 py-5 text-sm font-bold transition-all duration-200`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 text-sm font-bold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-700 hover:text-orange-500 font-bold text-sm">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
