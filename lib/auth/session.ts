import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single();
  return profile ? { user, profile } : null;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireBraider() {
  const session = await requireSession();
  if (session.profile.role !== 'braider') redirect('/braiders');
  return session;
}
