import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm py-4 px-4 sm:px-6 lg:px-8 w-full border-b border-gray-200">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to={user ? '/dashboard' : '/'} className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
          Task Dailies
        </Link>
        <nav>
          {user ? (
            <ul className="flex items-center space-x-4 sm:space-x-6">
              <li>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/notes" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  Notes
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  Settings
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul className="flex items-center space-x-4 sm:space-x-6">
              <li>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
                  Register
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;