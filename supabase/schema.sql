-- =============================================================================
-- ROUTINE RPG — Supabase SQL
-- Executar no SQL Editor do Supabase (dashboard → SQL Editor → New Query)
-- =============================================================================

-- Ativar extensão para UUIDs (já ativa por padrão no Supabase)
create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

create type habit_frequency as enum ('daily', 'every3days', 'weekly');
create type habit_kind       as enum ('boolean', 'quantity');
create type stat_key         as enum ('strength', 'health', 'discipline', 'mind');
create type theme_id         as enum ('balanced', 'athlete', 'hacker', 'monk');
create type shop_category    as enum ('food', 'leisure', 'wellness', 'gear');

-- =============================================================================
-- USERS
-- Identificação simples por UUID gerado no cliente (sem auth por agora).
-- Quando integrarmos Google OAuth, auth_id ficará ligado a auth.users.id.
-- =============================================================================

create table if not exists users (
  id           text        primary key,           -- 'usr_' + UUID gerado no cliente
  name         text        not null default 'Runner',
  theme        theme_id    not null default 'balanced',
  auth_id      uuid        unique,                -- futuro: auth.users.id (Google OAuth)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column users.id      is 'UUID gerado no cliente (localStorage). Formato: usr_<16hex>';
comment on column users.auth_id is 'Ligação futura ao auth.users do Supabase (Google OAuth, magic link, etc.)';

-- =============================================================================
-- CHARACTER
-- Um por utilizador. Stats RPG, XP, level, creds, streak.
-- =============================================================================

create table if not exists character (
  user_id        text    primary key references users(id) on delete cascade,
  level          integer not null default 1 check (level >= 1),
  xp             integer not null default 0 check (xp >= 0),
  total_xp       integer not null default 0 check (total_xp >= 0),
  creds          integer not null default 0 check (creds >= 0),
  -- stats RPG
  stat_strength  numeric(6,2) not null default 1.0,
  stat_health    numeric(6,2) not null default 1.0,
  stat_discipline numeric(6,2) not null default 1.0,
  stat_mind      numeric(6,2) not null default 1.0,
  -- streaks
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak    integer not null default 0 check (best_streak >= 0),
  last_active    date,                            -- data da última daily completa (>= 70%)
  updated_at     timestamptz not null default now()
);

comment on table character is 'Dados RPG do utilizador: level, XP, Creds, stats e streaks.';

-- =============================================================================
-- HABITS
-- Quests personalizadas por utilizador.
-- Inclui quests de tipo boolean (fiz/não fiz) e quantity (valor vs meta).
-- =============================================================================

create table if not exists habits (
  id           uuid            primary key default gen_random_uuid(),
  user_id      text            not null references users(id) on delete cascade,
  label        text            not null,
  icon         text            not null default '⚡',
  xp           integer         not null default 10 check (xp > 0),
  creds        integer         not null default 2  check (creds >= 0),
  stat         stat_key        not null default 'discipline',
  frequency    habit_frequency not null default 'daily',
  kind         habit_kind      not null default 'boolean',
  target_value integer,                            -- só para kind = 'quantity'
  unit         text,                               -- ex: 'copos', 'min', 'passos'
  sort_order   integer         not null default 0,
  active       boolean         not null default true,
  created_at   timestamptz     not null default now()
);

comment on column habits.kind         is 'boolean = checkbox; quantity = input numérico com barra de progresso';
comment on column habits.target_value is 'Meta numérica para quests do tipo quantity (ex: 8 copos, 20 min)';
comment on column habits.unit         is 'Unidade exibida na UI (copos, min, passos, páginas, ...)';

-- Index para listar hábitos de um utilizador por ordem
create index if not exists habits_user_id_idx on habits(user_id, sort_order);

-- =============================================================================
-- DAILY_LOGS
-- Registo diário por hábito. value = 1 para boolean, ou o valor numérico para quantity.
-- Uma linha por (user_id, habit_id, date).
-- =============================================================================

create table if not exists daily_logs (
  id         bigserial    primary key,
  user_id    text         not null references users(id) on delete cascade,
  habit_id   uuid         not null references habits(id) on delete cascade,
  log_date   date         not null default current_date,
  value      numeric(10,2) not null default 1,      -- 1 = done (boolean), ou valor real (quantity)
  logged_at  timestamptz  not null default now(),
  unique (user_id, habit_id, log_date)
);

comment on column daily_logs.value is '1 para boolean concluído; valor numérico para quantity (ex: 7.5 copos)';

create index if not exists daily_logs_user_date_idx on daily_logs(user_id, log_date);

-- =============================================================================
-- DAILY_SUMMARY
-- Snapshot diário: quantas quests feitas, % de conclusão, se a daily foi completa (>= 70%).
-- Atualizado pelo cliente ou por trigger.
-- =============================================================================

create table if not exists daily_summary (
  user_id         text    not null references users(id) on delete cascade,
  summary_date    date    not null default current_date,
  habits_total    integer not null default 0,
  habits_done     integer not null default 0,
  completion_pct  numeric(5,2) not null default 0,  -- 0.00 a 100.00
  daily_complete  boolean not null default false,    -- >= 70%
  xp_earned       integer not null default 0,
  creds_earned    integer not null default 0,
  primary key (user_id, summary_date)
);

comment on table daily_summary is 'Cache diária do progresso. Permite calcular streaks sem varrer daily_logs.';

create index if not exists daily_summary_user_date_idx on daily_summary(user_id, summary_date desc);

-- =============================================================================
-- WEIGHT_LOGS
-- Histórico de peso corporal.
-- =============================================================================

create table if not exists weight_logs (
  id         bigserial    primary key,
  user_id    text         not null references users(id) on delete cascade,
  value_kg   numeric(5,2) not null check (value_kg > 0),
  logged_at  timestamptz  not null default now()
);

create index if not exists weight_logs_user_idx on weight_logs(user_id, logged_at desc);

-- =============================================================================
-- WATER_LOGS
-- Registo diário de copos de água (agregado por dia).
-- =============================================================================

create table if not exists water_logs (
  user_id    text    not null references users(id) on delete cascade,
  log_date   date    not null default current_date,
  glasses    integer not null default 0 check (glasses >= 0),
  primary key (user_id, log_date)
);

-- =============================================================================
-- SHOP_ITEMS
-- Catálogo global de recompensas (não é por utilizador).
-- Gerido manualmente via Supabase dashboard ou seed.
-- =============================================================================

create table if not exists shop_items (
  id          text         primary key,             -- slug ex: 'dinner_out'
  label       text         not null,
  description text         not null default '',
  icon        text         not null default '🎁',
  cost        integer      not null check (cost > 0),
  category    shop_category not null,
  active      boolean      not null default true,
  sort_order  integer      not null default 0
);

-- =============================================================================
-- PURCHASES
-- Historial de compras de recompensas.
-- =============================================================================

create table if not exists purchases (
  id           bigserial    primary key,
  user_id      text         not null references users(id) on delete cascade,
  item_id      text         not null references shop_items(id),
  creds_before integer      not null,
  creds_after  integer      not null,
  tx_id        text         not null unique,         -- ID único gerado no cliente
  purchased_at timestamptz  not null default now()
);

create index if not exists purchases_user_idx on purchases(user_id, purchased_at desc);

-- =============================================================================
-- ACHIEVEMENTS (estrutura preparada — lógica de desbloqueio em roadmap)
-- =============================================================================

create table if not exists achievements (
  id          text primary key,                     -- slug ex: 'first_blood'
  label       text not null,
  description text not null default '',
  icon        text not null default '🏆',
  secret      boolean not null default false        -- hidden até ser desbloqueado
);

create table if not exists user_achievements (
  user_id      text        not null references users(id) on delete cascade,
  achievement_id text      not null references achievements(id),
  unlocked_at  timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- =============================================================================
-- UPDATED_AT TRIGGER (users + character)
-- =============================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger character_updated_at
  before update on character
  for each row execute function set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- Cada utilizador só acede aos seus próprios dados.
-- Por agora a app usa o user_id do cliente diretamente (sem JWT).
-- Quando integrarmos Google OAuth, mudar a policy para auth.uid()::text = user_id.
-- =============================================================================

alter table users             enable row level security;
alter table character         enable row level security;
alter table habits            enable row level security;
alter table daily_logs        enable row level security;
alter table daily_summary     enable row level security;
alter table weight_logs       enable row level security;
alter table water_logs        enable row level security;
alter table purchases         enable row level security;
alter table user_achievements enable row level security;

-- shop_items e achievements são públicos (read-only para todos)
alter table shop_items   enable row level security;
alter table achievements enable row level security;

create policy "shop_items public read"   on shop_items   for select using (true);
create policy "achievements public read" on achievements for select using (true);

-- Policies temporárias usando anon key (sem auth) — usar service_role key na app por agora
-- TODO: substituir por auth.uid()::text = user_id quando Google OAuth estiver ativo
create policy "users: own data"          on users             for all using (true);
create policy "character: own data"      on character         for all using (true);
create policy "habits: own data"         on habits            for all using (true);
create policy "daily_logs: own data"     on daily_logs        for all using (true);
create policy "daily_summary: own data"  on daily_summary     for all using (true);
create policy "weight_logs: own data"    on weight_logs       for all using (true);
create policy "water_logs: own data"     on water_logs        for all using (true);
create policy "purchases: own data"      on purchases         for all using (true);
create policy "user_achievements: own"   on user_achievements for all using (true);

-- =============================================================================
-- SEED — shop_items
-- =============================================================================

insert into shop_items (id, label, description, icon, cost, category, sort_order) values
  ('coffee',         'Café Especial',         'Um café de especialidade ou drink à tua escolha.',           '☕',  50,  'food',     1),
  ('burger',         'Hambúrguer Especial',   'Um bom hambúrguer artesanal quando quiseres.',               '🍔',  100, 'food',     2),
  ('sushi',          'Noite de Sushi',        'Um jantar de sushi premium, sem culpa.',                     '🍣',  250, 'food',     3),
  ('dinner_out',     'Jantar Fora',           'Mereces um bom jantar num restaurante à tua escolha.',       '🍽️', 300, 'food',     4),
  ('gaming_session', 'Sessão Gaming Livre',   'Uma tarde inteira a jogar sem culpa.',                       '🎮',  80,  'leisure',  1),
  ('series_binge',   'Maratona de Série',     'Uma tarde/noite a ver uma série à tua escolha.',             '📺',  110, 'leisure',  2),
  ('movie_night',    'Noite de Cinema',       'Uma sessão de cinema com pipocas incluídas.',                '🎬',  150, 'leisure',  3),
  ('day_off',        'Dia de Descanso Total', 'Um dia inteiro sem obrigações. Mereces.',                    '😴',  400, 'leisure',  4),
  ('supplement',     'Suplemento',            'Um suplemento ou produto de saúde à tua escolha.',           '💊',  200, 'wellness', 1),
  ('massage',        'Massagem',              'Uma sessão de massagem para recuperação.',                    '💆',  350, 'wellness', 2),
  ('book',           'Livro Novo',            'Compra aquele livro que tens em wishlist.',                   '📚',  180, 'gear',     1),
  ('new_gear',       'Roupa de Treino',       'Uma peça nova de roupa de treino à tua escolha.',            '👟',  600, 'gear',     2),
  ('tech_gadget',    'Gadget Tech',           'Um pequeno gadget ou acessório tech que estejas a querer.',  '🔧',  700, 'gear',     3)
on conflict (id) do nothing;

-- =============================================================================
-- SEED — achievements
-- =============================================================================

insert into achievements (id, label, description, icon, secret) values
  ('first_quest',     'Primeira Quest',        'Completa a tua primeira quest.',                   '⚡', false),
  ('first_daily',     'Dia Completo',          'Completa >= 70% das quests num dia.',              '✅', false),
  ('streak_3',        'Em Chama',              '3 dias consecutivos com daily completa.',          '🔥', false),
  ('streak_7',        'Semana Perfeita',       '7 dias consecutivos.',                             '🌟', false),
  ('streak_30',       'Mês de Ferro',          '30 dias consecutivos.',                            '💎', true),
  ('level_5',         'Street Rat',            'Atinge o nível 5.',                                '🐀', false),
  ('level_10',        'Runner Confirmado',     'Atinge o nível 10.',                               '🏃', false),
  ('level_20',        'Edgerunner',            'Atinge o nível 20.',                               '🦾', true),
  ('first_purchase',  'Primeira Recompensa',   'Faz a tua primeira compra na loja.',               '🛍️', false),
  ('big_spender',     'Big Spender',           'Gasta 1000 Creds no total.',                       '💸', true),
  ('all_daily',       'Perfecionista',         'Completa 100% das quests num dia.',                '💯', false),
  ('creds_100',       'Primeiros Creds',       'Acumula 100 Creds.',                               '₡',  false),
  ('creds_500',       'Runner Rico',           'Acumula 500 Creds de uma vez.',                    '💰', true)
on conflict (id) do nothing;

-- =============================================================================
-- VIEWS ÚTEIS
-- =============================================================================

-- Vista do perfil completo de um utilizador
create or replace view v_user_profile as
select
  u.id                as user_id,
  u.name,
  u.theme,
  u.created_at,
  c.level,
  c.xp,
  c.total_xp,
  c.creds,
  c.stat_strength,
  c.stat_health,
  c.stat_discipline,
  c.stat_mind,
  c.current_streak,
  c.best_streak,
  c.last_active
from users u
left join character c on c.user_id = u.id;

-- Vista do top de streaks (leaderboard futuro)
create or replace view v_leaderboard_streak as
select
  u.name,
  c.level,
  c.current_streak,
  c.best_streak,
  c.total_xp
from character c
join users u on u.id = c.user_id
order by c.best_streak desc, c.total_xp desc
limit 50;

-- =============================================================================
-- FIM
-- =============================================================================
