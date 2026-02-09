# Extra Class Command Center

An admin-focused MVP for managing extra classes, attendance, and WhatsApp-ready parent updates.

## Tech Stack
- Next.js App Router
- Supabase Auth + Postgres + RLS
- @supabase/ssr for server/client auth

## Routes
- `/login`
- `/dashboard`
- `/students`
- `/subjects`
- `/sessions`
- `/sessions/[id]`
- `/messages`

## Environment Variables
Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup
1. Create a Supabase project.
2. Run the migration SQL in `supabase/migrations/001_init.sql`.
3. (Optional) Run `supabase/seed/seed.sql` for demo data.
4. Create auth users in Supabase Auth. Update `public.users.auth_user_id` to link them.

## Development
```
npm install
npm run dev
```

## Attendance Messaging Logic
- Attendance is saved per session per student.
- Messages are queued into `message_queue` with quiet hours (08:00–17:00).
- Use the Messages page to copy or open WhatsApp, then mark messages as sent.
