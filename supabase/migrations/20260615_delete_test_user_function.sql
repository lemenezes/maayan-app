-- ============================================================
-- Migration: Função para deletar usuários de teste com trigger bypass
-- Data: 2026-06-15
-- ============================================================

create or replace function public.delete_test_user_and_auth(email_to_delete text)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_id_to_delete uuid;
  affected_rows_access_requests int;
  affected_rows_profiles int;
  affected_rows_auth_users int;
begin
  -- Verificar se o usuario atual é admin (usa security definer para ver profiles)
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    return json_build_object('error', 'Only admins can delete test users');
  end if;

  -- Encontrar o user_id pelo email (com security definer para acessar auth.users)
  select id into user_id_to_delete
  from auth.users
  where email = email_to_delete;

  if user_id_to_delete is null then
    return json_build_object('error', 'User not found', 'email', email_to_delete);
  end if;

  -- DISABLE TRIGGER to prevent handle_new_user() recreation
  alter table auth.users disable trigger on_auth_user_created;

  begin
    -- Deletar em cascata com security definer:
    -- 1. access_requests referencing this user
    delete from public.access_requests
    where auth_user_id = user_id_to_delete or email = email_to_delete;
    get diagnostics affected_rows_access_requests = row_count;

    -- 2. profiles
    delete from public.profiles
    where id = user_id_to_delete or email = email_to_delete;
    get diagnostics affected_rows_profiles = row_count;

    -- 3. auth.users (com security definer, consegue deletar diretamente)
    delete from auth.users
    where id = user_id_to_delete or email = email_to_delete;
    get diagnostics affected_rows_auth_users = row_count;

    -- RE-ENABLE TRIGGER
    alter table auth.users enable trigger on_auth_user_created;

    return json_build_object(
      'success', true,
      'message', 'Test user completely deleted',
      'user_id', user_id_to_delete,
      'email', email_to_delete,
      'deleted_rows', json_build_object(
        'access_requests', affected_rows_access_requests,
        'profiles', affected_rows_profiles,
        'auth_users', affected_rows_auth_users
      )
    );
  exception when others then
    -- RE-ENABLE TRIGGER even if error
    alter table auth.users enable trigger on_auth_user_created;
    raise;
  end;
end;
$$;

-- Grant execute to authenticated users (admins only, via security definer)
grant execute on function public.delete_test_user_and_auth(text) to authenticated, anon;
