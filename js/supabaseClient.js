// =========================================================
// Настройки подключения к Supabase.
// Замените SUPABASE_URL и SUPABASE_ANON_KEY на значения
// из вашего проекта: Supabase Dashboard → Project Settings → API
// =========================================================
const SUPABASE_URL = 'https://kbskhtigbkwtfinsctux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtic2todGlnYmt3dGZpbnNjdHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzE5ODUsImV4cCI6MjEwMzk0Nzk4NX0.2uUKO-mtV_45EeKdLbxTYW-agJKD7ELZkQIuPvqpbzA';
// Библиотека @supabase/supabase-js подключается через <script> в каждой
// html-странице (см. index.html) и создаёт глобальный объект window.supabase.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
