import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

function AuthForm({ isRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let authError = null;
    let authData = null;

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      authError = error;
      authData = data;
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
      authData = data;
    }

    if (authError) {
      setError(authError.message);
    } else if (authData?.user) {
      navigate('/dashboard');
    } else if (isRegister && authData?.user === null) {
      // This case happens if email confirmation is required but no error is returned
      setError('Please check your email to confirm your account.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? 'Register for Task Dailies' : 'Login to Task Dailies'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (isRegister ? 'Registering...' : 'Logging In...') : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:underline font-medium"
              >
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthForm;