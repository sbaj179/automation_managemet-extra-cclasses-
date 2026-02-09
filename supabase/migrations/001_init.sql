-- Extra Class Command Center schema

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  auth_user_id uuid unique,
  role text not null check (role in ('admin', 'tutor')),
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  full_name text not null,
  grade text,
  guardian_name text,
  guardian_phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.student_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, subject_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  tutor_id uuid references public.users(id),
  starts_at timestamptz not null,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.session_students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  present boolean not null default false,
  recorded_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create table if not exists public.message_queue (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  guardian_phone text not null,
  message_body text not null,
  status text not null default 'queued',
  send_after timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists students_school_id_idx on public.students (school_id);
create index if not exists subjects_school_id_idx on public.subjects (school_id);
create index if not exists student_subjects_school_subject_idx on public.student_subjects (school_id, subject_id);
create index if not exists sessions_school_starts_idx on public.sessions (school_id, starts_at);
create index if not exists session_students_school_session_idx on public.session_students (school_id, session_id);
create index if not exists attendance_school_session_idx on public.attendance (school_id, session_id);
create index if not exists message_queue_school_status_send_after_idx on public.message_queue (school_id, status, send_after);

create or replace function public.current_school_id()
returns uuid
language sql
stable
as $$
  select school_id from public.users where auth_user_id = auth.uid();
$$;

alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.student_subjects enable row level security;
alter table public.sessions enable row level security;
alter table public.session_students enable row level security;
alter table public.attendance enable row level security;
alter table public.message_queue enable row level security;

create policy "Schools scoped" on public.schools
  for select using (id = public.current_school_id());

create policy "Users read" on public.users
  for select using (school_id = public.current_school_id());

create policy "Users admin insert" on public.users
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Users admin update" on public.users
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Users admin delete" on public.users
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Students read" on public.students
  for select using (school_id = public.current_school_id());

create policy "Students admin write" on public.students
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Students admin update" on public.students
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Students admin delete" on public.students
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Subjects read" on public.subjects
  for select using (school_id = public.current_school_id());

create policy "Subjects admin write" on public.subjects
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Subjects admin update" on public.subjects
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Subjects admin delete" on public.subjects
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Student subjects read" on public.student_subjects
  for select using (school_id = public.current_school_id());

create policy "Student subjects admin write" on public.student_subjects
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Student subjects admin update" on public.student_subjects
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Student subjects admin delete" on public.student_subjects
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Sessions admin write" on public.sessions
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Sessions admin update" on public.sessions
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Sessions admin delete" on public.sessions
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Sessions read" on public.sessions
  for select using (
    school_id = public.current_school_id()
    and (
      exists (
        select 1 from public.users
        where auth_user_id = auth.uid()
          and role = 'admin'
      )
      or tutor_id = (
        select id from public.users
        where auth_user_id = auth.uid()
      )
    )
  );

create policy "Session students admin write" on public.session_students
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Session students admin update" on public.session_students
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Session students admin delete" on public.session_students
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Session students read" on public.session_students
  for select using (
    school_id = public.current_school_id()
    and (
      exists (
        select 1 from public.users
        where auth_user_id = auth.uid()
          and role = 'admin'
      )
      or session_id in (
        select id from public.sessions
        where tutor_id = (
          select id from public.users where auth_user_id = auth.uid()
        )
      )
    )
  );

create policy "Attendance read" on public.attendance
  for select using (
    school_id = public.current_school_id()
    and (
      exists (
        select 1 from public.users
        where auth_user_id = auth.uid()
          and role = 'admin'
      )
      or session_id in (
        select id from public.sessions
        where tutor_id = (
          select id from public.users where auth_user_id = auth.uid()
        )
      )
    )
  );

create policy "Message queue admin read" on public.message_queue
  for select using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Message queue admin write" on public.message_queue
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Message queue tutor write" on public.message_queue
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'tutor'
    )
  );

create policy "Message queue admin update" on public.message_queue
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Message queue admin delete" on public.message_queue
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Attendance admin inserts" on public.attendance
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Attendance admin updates" on public.attendance
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Attendance admin deletes" on public.attendance
  for delete using (
    school_id = public.current_school_id()
    and exists (
      select 1 from public.users
      where auth_user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Tutor attendance inserts" on public.attendance
  for insert with check (
    school_id = public.current_school_id()
    and exists (
      select 1
      from public.sessions
      where sessions.id = attendance.session_id
        and sessions.tutor_id = (
          select id from public.users where auth_user_id = auth.uid()
        )
    )
  );

create policy "Tutor attendance updates" on public.attendance
  for update using (
    school_id = public.current_school_id()
    and exists (
      select 1
      from public.sessions
      where sessions.id = attendance.session_id
        and sessions.tutor_id = (
          select id from public.users where auth_user_id = auth.uid()
        )
    )
  );
