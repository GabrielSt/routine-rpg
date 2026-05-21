-- =============================================================================
-- MIGRATION 001 — habits.id uuid → text (para suportar slugs do localStorage)
-- Correr no SQL Editor do Supabase
-- =============================================================================

-- 1. Remover a FK de daily_logs → habits (para poder alterar o tipo)
alter table daily_logs drop constraint if exists daily_logs_habit_id_fkey;

-- 2. Alterar o tipo de habits.id para text
alter table habits alter column id set default null;
alter table habits alter column id type text using id::text;

-- 3. Alterar o tipo de daily_logs.habit_id para text
alter table daily_logs alter column habit_id type text using habit_id::text;

-- 4. Recriar a FK
alter table daily_logs
  add constraint daily_logs_habit_id_fkey
  foreign key (habit_id) references habits(id) on delete cascade;

-- 5. Verificar
select column_name, data_type
from information_schema.columns
where table_name in ('habits', 'daily_logs')
  and column_name in ('id', 'habit_id')
order by table_name, column_name;
