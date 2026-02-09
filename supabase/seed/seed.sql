-- Optional seed data
insert into public.schools (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Demo School')
on conflict do nothing;

-- Create a placeholder admin user row; link auth_user_id after creating auth account.
insert into public.users (school_id, role, full_name)
values ('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User')
on conflict do nothing;
