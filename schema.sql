-- Enable Row Level Security (RLS) on all tables for enhanced security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Profiles table: Stores user-specific data associated with auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- Users can insert their own profile (e.g., during signup trigger)
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Users cannot delete profiles directly

-- Tasks table: Stores individual tasks for users
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'completed'
  priority TEXT DEFAULT 'medium' NOT NULL, -- e.g., 'low', 'medium', 'high'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMETZ DEFAULT NOW()
);

-- RLS policies for tasks table
-- Users can view their own tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
-- Users can create their own tasks
CREATE POLICY "Users can create own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Notes table: Stores rich-text notes for users
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- Optional link to a task
  title TEXT NOT NULL,
  content JSONB, -- For rich text content
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTZ DEFAULT NOW()
);

-- RLS policies for notes table
-- Users can view their own notes
CREATE POLICY "Users can view own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
-- Users can create their own notes
CREATE POLICY "Users can create own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own notes
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
-- Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Optional: Create a trigger to automatically create a profile for new users
-- This trigger function creates a profile entry when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link the trigger to the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up the updated_at column to automatically update on changes
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Add moddatetime trigger to profiles table
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

-- Add moddatetime trigger to tasks table
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

-- Add moddatetime trigger to notes table
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');