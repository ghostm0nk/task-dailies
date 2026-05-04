import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import AuthForm from './pages/AuthForm';

// Placeholder components for future pages
const DashboardPage = () => <div className="p-8 text-center text-2xl text-gray-700">Dashboard Page (Coming Soon!)</div>;
const TaskDetailPage = () => <div className="p-8 text-center text-2xl text-gray-700">Task Detail Page (Coming Soon!)</div>;
const NotesListPage = () => <div className="p-8 text-center text-2xl text-gray-700">Notes List Page (Coming Soon!)</div>;
const NoteEditorPage = () => <div className="p-8 text-center text-2xl text-gray-700">Note Editor Page (Coming Soon!)</div>;
const SettingsPage = () => <div className="p-8 text-center text-2xl text-gray-700">Settings Page (Coming Soon!)</div>;
const LandingPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
    <h1 className="text-5xl font-extrabold text-gray-900 mb-6 text-center">Welcome to Task Dailies</h1>
    <p className="text-xl text-gray-700 mb-8 text-center max-w-2xl">
      Your ultimate companion for daily task management and rich-text note-taking. Stay organized, boost productivity.
    </p>
    <div className="flex space-x-4">
      <Link to="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold text-lg">
        Get Started
      </Link>
      <Link to="/register" className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transform hover:scale-105 transition-all duration-200 font-semibold text-lg">
        Learn More
      </Link>
    </div>
  </div>
);

// ProtectedRoute component to guard routes that require authentication
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-700">Loading application...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/login" element={<AuthForm isRegister={false} />} />
            <Route path="/register" element={<AuthForm isRegister={true} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={session?.user}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute user={session?.user}>
                  <TaskDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute user={session?.user}>
                  <NotesListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes/:id"
              element={
                <ProtectedRoute user={session?.user}>
                  <NoteEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute user={session?.user}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<div className="p-8 text-center text-3xl text-red-600">404 - Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;