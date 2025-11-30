# Detective SQL

## Local environment variables
1. Copy `.env.example` to `.env` and put your Supabase Project URL and anon key in **.env**, not in `.env.example`.
2. Keep `.env` local only — it is ignored by git. Check `git status` before committing to confirm `.env` is untracked.
3. If you accidentally added secrets to `.env.example` or committed them, remove them and rotate the keys in Supabase.

## Submitting a rating
After finishing a game, click “Оцените игру,” select 1–5 stars, optionally add a comment, and press “Отправить.” The app will send the rating and feedback to the `detective_sql_csat` table using the Supabase credentials from your `.env` file.
