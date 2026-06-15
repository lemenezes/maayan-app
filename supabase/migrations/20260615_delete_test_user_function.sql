-- ============================================================
-- Migration: Função para deletar usuários de teste
-- Data: 2026-06-15
-- ============================================================

create or replace function public.delete_test_user(email_to_delete text)
returns json
language plpgsql
security definer
as $$
declare
  user_id_to_delete uuid;
  result_message text;
begin
  -- Verificar se o usuario atual é admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    return json_build_object('error', 'Only admins can delete test users');
  end if;

  -- Encontrar o user_id pelo email
  select id into user_id_to_delete
  from auth.users
  where email = email_to_delete;

  if user_id_to_delete is null then
    return json_build_object('error', 'User not found', 'email', email_to_delete);
  end if;

  -- Deletar em cascata (order importa para RLS):
  -- 1. access_requests referencing this user
  delete from public.access_requests
  where auth_user_id = user_id_to_delete or email = email_to_delete;

  -- 2. profiles
  delete from public.profiles
  where id = user_id_to_delete or email = email_to_delete;

  -- 3. auth.users (isso vai através do Supabase, não pelo SQL direto)
  -- Por enquanto, apenas retornamos a necessidade de deletar via dashboard

  return json_build_object(
    'success', true,
    'message', 'Test user data deleted',
    'user_id', user_id_to_delete,
    'email', email_to_delete,
    'note', 'Auth user still exists and must be deleted via Supabase Dashboard to prevent recreation'
  );
end;
$$;

-- Grant execute to authenticated users (admins only, via security definer)
grant execute on function public.delete_test_user(text) to authenticated, anon;
