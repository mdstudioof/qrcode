import { createClient } from '@supabase/supabase-js';

// Tenta ler do env, se falhar usa as chaves diretamente (Fallback)
const supabaseUrl = process.env.SUPABASE_URL || "https://hovvnkbjeihrujhjwbkv.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdnZua2JqZWlocnVqaGp3Ymt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTk2MzksImV4cCI6MjA4NjgzNTYzOX0.6eNBPuM2whQu-2OhW7xstkjndOW8GQzp3A6CY5nNnAo";

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);