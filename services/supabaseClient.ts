import { createClient } from '@supabase/supabase-js';

// No Vite, usamos o acesso direto para que o plugin 'define' possa substituir a string durante o build.
// O acesso dinâmico (process.env[key]) não funciona porque 'process' não existe no navegador.
const supabaseUrl = process.env.SUPABASE_URL || "https://hovvnkbjeihrujhjwbkv.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdnZua2JqZWlocnVqaGp3Ymt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTk2MzksImV4cCI6MjA4NjgzNTYzOX0.6eNBPuM2whQu-2OhW7xstkjndOW8GQzp3A6CY5nNnAo";

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL e Key são obrigatórios.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);