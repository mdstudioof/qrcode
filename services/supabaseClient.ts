import { createClient } from '@supabase/supabase-js';

// Função auxiliar para acessar variáveis de ambiente com segurança
// Evita erro "ReferenceError: process is not defined" em navegadores/Vercel
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Tenta ler do env, se falhar usa as chaves diretamente (Fallback)
const supabaseUrl = getEnv('SUPABASE_URL') || "https://hovvnkbjeihrujhjwbkv.supabase.co";
const supabaseKey = getEnv('SUPABASE_ANON_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdnZua2JqZWlocnVqaGp3Ymt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTk2MzksImV4cCI6MjA4NjgzNTYzOX0.6eNBPuM2whQu-2OhW7xstkjndOW8GQzp3A6CY5nNnAo";

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);