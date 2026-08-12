-- ============================================================
-- FAT2FIT — fresh single-brand foundation
-- ============================================================

-- 1. Tear down multi-tenant era
drop table if exists public.tenant_signup_credentials cascade;
drop table if exists public.whatsapp_otp_codes cascade;
drop table if exists public.whatsapp_settings cascade;
drop table if exists public.referrals cascade;
drop table if exists public.task_completions cascade;
drop table if exists public.daily_logs cascade;
drop table if exists public.measurements cascade;
drop table if exists public.customer_measurements cascade;
drop table if exists public.progress_photos cascade;
drop table if exists public.enrollments cascade;
drop table if exists public.day_tasks cascade;
drop table if exists public.program_products cascade;
drop table if exists public.program_days cascade;
drop table if exists public.programs cascade;
drop table if exists public.products cascade;
drop table if exists public.faqs cascade;
drop table if exists public.tips cascade;
drop table if exists public.customers cascade;
drop table if exists public.profiles cascade;
drop table if exists public.tenants cascade;

drop function if exists public.complete_onboarding(uuid,text,text,integer,numeric,numeric,uuid,date,numeric,numeric,numeric,numeric,numeric,numeric) cascade;
drop function if exists public.get_at_risk_list(uuid) cascade;
drop function if exists public.get_at_risk_customers_count(uuid) cascade;
drop function if exists public.get_reorder_list(uuid) cascade;
drop function if exists public.get_reorder_customers_count(uuid) cascade;
drop function if exists public.get_program_day_with_tasks(uuid,date,date) cascade;
drop function if exists public.can_access_customer(uuid,uuid) cascade;
drop function if exists public.is_tenant_member(uuid,uuid) cascade;
drop function if exists public.current_customer_ids(uuid) cascade;
drop function if exists public.get_my_auth_context() cascade;

-- 2. Shared helpers
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- 3. Admins
create table public.app_admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);
grant select on public.app_admins to authenticated;
grant all on public.app_admins to service_role;
alter table public.app_admins enable row level security;

create or replace function public.is_app_admin(_uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.app_admins where user_id = _uid);
$$;

create policy "admins read admin list" on public.app_admins
  for select to authenticated using (public.is_app_admin(auth.uid()));

insert into public.app_admins (user_id)
select id from auth.users where lower(email) = 'teamnevorai@gmail.com'
on conflict do nothing;

-- 4. Distributors
create table public.distributors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  phone text,
  whatsapp_number text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.distributors to authenticated;
grant all on public.distributors to service_role;
alter table public.distributors enable row level security;
create trigger distributors_updated before update on public.distributors
  for each row execute function public.set_updated_at();

create policy "signed in can read distributors" on public.distributors
  for select to authenticated using (true);
create policy "admins manage distributors" on public.distributors
  for all to authenticated using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));

insert into public.distributors (name, whatsapp_number, is_default)
values ('Nevorai', '', true);

create or replace function public.default_distributor_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.distributors where is_default order by created_at limit 1;
$$;

-- 5. App settings
create table public.app_settings (
  id boolean primary key default true,
  brand_name text not null default 'Fat2Fit',
  tagline text not null default 'Your 9-day reset, guided day by day.',
  whatsapp_number text not null default '',
  health_disclaimer text not null default 'This program is for general wellness support only. It is not medical advice, and results vary from person to person. Typical results, not guaranteed. Talk to your doctor before starting if you are pregnant, nursing, under 18, or managing any medical condition or medication.',
  results_disclaimer text not null default 'Typical results, not guaranteed.',
  constraint app_settings_singleton check (id)
);
grant select on public.app_settings to authenticated, anon;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "anyone reads settings" on public.app_settings for select to anon, authenticated using (true);
create policy "admins write settings" on public.app_settings
  for all to authenticated using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));
insert into public.app_settings (id) values (true);

-- 6. Programs / content
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  duration_days integer not null,
  sort_order integer not null default 0,
  next_program_code text,
  summary text,
  created_at timestamptz not null default now()
);

create table public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  track text not null default 'standard' check (track in ('standard','dx4')),
  day_number integer not null,
  title text not null default '',
  focus text,
  tip text,
  unique (program_id, track, day_number)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  kit_quantity text,
  daily_use text,
  how_to_use text,
  warnings text,
  image_url text,
  video_url text,
  sort_order integer not null default 0
);

create table public.day_tasks (
  id uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references public.program_days(id) on delete cascade,
  slot text not null check (slot in ('morning','mid_morning','noon','early_evening','evening','all_day')),
  title text not null,
  detail text,
  product_id uuid references public.products(id) on delete set null,
  sort_order integer not null default 0
);
create index day_tasks_day_idx on public.day_tasks(program_day_id, sort_order);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  calorie_bucket integer not null default 600,
  is_veg boolean not null default true,
  ingredients text,
  method text,
  sort_order integer not null default 0
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order integer not null default 0
);

create table public.tips (
  id uuid primary key default gen_random_uuid(),
  day_number integer,
  body text not null,
  sort_order integer not null default 0
);

grant select on public.programs, public.program_days, public.products, public.day_tasks, public.meals, public.faqs, public.tips to authenticated;
grant all on public.programs, public.program_days, public.products, public.day_tasks, public.meals, public.faqs, public.tips to service_role;

alter table public.programs enable row level security;
alter table public.program_days enable row level security;
alter table public.products enable row level security;
alter table public.day_tasks enable row level security;
alter table public.meals enable row level security;
alter table public.faqs enable row level security;
alter table public.tips enable row level security;

create policy "read programs" on public.programs for select to authenticated using (true);
create policy "read program_days" on public.program_days for select to authenticated using (true);
create policy "read products" on public.products for select to authenticated using (true);
create policy "read day_tasks" on public.day_tasks for select to authenticated using (true);
create policy "read meals" on public.meals for select to authenticated using (true);
create policy "read faqs" on public.faqs for select to authenticated using (true);
create policy "read tips" on public.tips for select to authenticated using (true);

create policy "admins write programs" on public.programs for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));
create policy "admins write program_days" on public.program_days for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));
create policy "admins write products" on public.products for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));
create policy "admins write day_tasks" on public.day_tasks for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));
create policy "admins write meals" on public.meals for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));
create policy "admins write faqs" on public.faqs for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));
create policy "admins write tips" on public.tips for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));

-- 7. Customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  distributor_id uuid not null default public.default_distributor_id() references public.distributors(id),
  name text not null default '',
  phone text not null unique,
  gender text check (gender in ('male','female','other')),
  age integer,
  height_cm numeric,
  goal_weight_kg numeric,
  program_id uuid references public.programs(id) on delete set null,
  track text not null default 'standard' check (track in ('standard','dx4')),
  start_date date,
  language text not null default 'hinglish' check (language in ('en','hi','hinglish')),
  disclaimer_accepted_at timestamptz,
  onboarding_complete boolean not null default false,
  share_consent boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create trigger customers_updated before update on public.customers
  for each row execute function public.set_updated_at();

create or replace function public.my_customer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.customers where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_my_distributor(_customer uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.customers c
    join public.distributors d on d.id = c.distributor_id
    where c.id = _customer and d.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_customer(_customer uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_app_admin(auth.uid())
     or public.is_my_distributor(_customer)
     or exists (select 1 from public.customers where id = _customer and user_id = auth.uid());
$$;

create policy "customers read own" on public.customers for select to authenticated
  using (user_id = auth.uid() or public.is_app_admin(auth.uid())
         or exists (select 1 from public.distributors d where d.id = distributor_id and d.user_id = auth.uid()));
create policy "customers update own" on public.customers for update to authenticated
  using (user_id = auth.uid() or public.is_app_admin(auth.uid()))
  with check (user_id = auth.uid() or public.is_app_admin(auth.uid()));
create policy "admins insert customers" on public.customers for insert to authenticated
  with check (public.is_app_admin(auth.uid())
    or exists (select 1 from public.distributors d where d.id = distributor_id and d.user_id = auth.uid()));

-- 8. Access codes (never readable from the app)
create table public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  phone text not null,
  customer_id uuid references public.customers(id) on delete cascade,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
grant all on public.access_codes to service_role;
alter table public.access_codes enable row level security;
create policy "admins manage access codes" on public.access_codes for all to authenticated
  using (public.is_app_admin(auth.uid())) with check (public.is_app_admin(auth.uid()));

-- 9. Logs and measurements
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  log_date date not null,
  day_number integer not null,
  note text,
  created_at timestamptz not null default now(),
  unique (customer_id, log_date)
);

create table public.task_completions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  day_task_id uuid not null references public.day_tasks(id) on delete cascade,
  log_date date not null,
  completed_at timestamptz not null default now(),
  unique (customer_id, day_task_id, log_date)
);
create index task_completions_lookup on public.task_completions(customer_id, log_date);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  day_number integer not null check (day_number in (1,10)),
  taken_on date not null,
  weight_kg numeric,
  chest_cm numeric,
  waist_cm numeric,
  hip_cm numeric,
  thigh_cm numeric,
  arm_cm numeric,
  created_at timestamptz not null default now(),
  unique (customer_id, day_number)
);

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  day_number integer not null,
  storage_path text not null,
  share_consent boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.daily_logs, public.task_completions, public.measurements, public.progress_photos to authenticated;
grant all on public.daily_logs, public.task_completions, public.measurements, public.progress_photos to service_role;

alter table public.daily_logs enable row level security;
alter table public.task_completions enable row level security;
alter table public.measurements enable row level security;
alter table public.progress_photos enable row level security;

create policy "own daily logs" on public.daily_logs for all to authenticated
  using (customer_id = public.my_customer_id()) with check (customer_id = public.my_customer_id());
create policy "coach reads daily logs" on public.daily_logs for select to authenticated
  using (public.can_access_customer(customer_id));

create policy "own completions" on public.task_completions for all to authenticated
  using (customer_id = public.my_customer_id()) with check (customer_id = public.my_customer_id());
create policy "coach reads completions" on public.task_completions for select to authenticated
  using (public.can_access_customer(customer_id));

create policy "own measurements" on public.measurements for all to authenticated
  using (customer_id = public.my_customer_id()) with check (customer_id = public.my_customer_id());
create policy "coach reads measurements" on public.measurements for select to authenticated
  using (public.can_access_customer(customer_id));

create policy "own photos" on public.progress_photos for all to authenticated
  using (customer_id = public.my_customer_id()) with check (customer_id = public.my_customer_id());

-- 10. Auth context
create or replace function public.get_my_auth_context()
returns json language plpgsql stable security definer set search_path = public, auth as $$
declare
  _uid uuid := auth.uid();
  _role text := 'guest';
  _c record;
  _d uuid;
begin
  if _uid is null then
    return json_build_object('role', 'guest');
  end if;

  if public.is_app_admin(_uid) then
    _role := 'admin';
  else
    select id into _d from public.distributors where user_id = _uid limit 1;
    if _d is not null then _role := 'distributor'; end if;
  end if;

  select id, name, onboarding_complete, disclaimer_accepted_at, start_date, track, program_id
    into _c from public.customers where user_id = _uid limit 1;

  if _c.id is not null and _role = 'guest' then
    _role := 'customer';
  end if;

  return json_build_object(
    'role', _role,
    'distributor_id', _d,
    'customer_id', _c.id,
    'name', _c.name,
    'onboarding_complete', coalesce(_c.onboarding_complete, false),
    'disclaimer_accepted', _c.disclaimer_accepted_at is not null,
    'start_date', _c.start_date,
    'track', _c.track,
    'program_id', _c.program_id
  );
end; $$;

-- 11. Access-code redemption (checked server-side only)
create or replace function public.claim_access_code(_phone text, _code text)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare
  _row record;
  _cust uuid;
begin
  select * into _row from public.access_codes
   where upper(code) = upper(trim(_code))
     and regexp_replace(phone, '\D', '', 'g') = regexp_replace(_phone, '\D', '', 'g')
     and used_at is null
     and (expires_at is null or expires_at > now())
   limit 1;

  if _row.id is null then
    raise exception 'Invalid or already used access code';
  end if;

  _cust := _row.customer_id;
  if _cust is null then
    raise exception 'This access code is not linked to a customer';
  end if;

  update public.access_codes set used_at = now() where id = _row.id;
  update public.customers set user_id = auth.uid() where id = _cust and user_id is null;
  return _cust;
end; $$;
revoke all on function public.claim_access_code(text, text) from anon;
grant execute on function public.claim_access_code(text, text) to authenticated, service_role;

-- 12. Day resolver (IST)
create or replace function public.current_day_number(_start_date date)
returns integer language sql stable set search_path = public as $$
  select ((now() at time zone 'UTC' at time zone 'Asia/Kolkata')::date - _start_date) + 1;
$$;

create or replace function public.get_day_with_tasks(_customer uuid, _day integer)
returns json language plpgsql stable security definer set search_path = public as $$
declare _res json; _track text; _prog uuid;
begin
  if not public.can_access_customer(_customer) then
    raise exception 'Not authorised';
  end if;
  select track, program_id into _track, _prog from public.customers where id = _customer;

  select json_build_object(
    'day_number', _day,
    'day', (select row_to_json(pd) from public.program_days pd
             where pd.program_id = _prog and pd.track = _track and pd.day_number = _day),
    'tasks', (select json_agg(t order by t.slot_rank, t.sort_order) from (
        select dt.id, dt.slot, dt.title, dt.detail, dt.sort_order, dt.product_id,
               case dt.slot when 'morning' then 1 when 'mid_morning' then 2 when 'noon' then 3
                            when 'early_evening' then 4 when 'evening' then 5 else 6 end as slot_rank
        from public.day_tasks dt
        join public.program_days pd on pd.id = dt.program_day_id
        where pd.program_id = _prog and pd.track = _track and pd.day_number = _day
      ) t)
  ) into _res;
  return _res;
end; $$;

-- ============================================================
-- 13. SEED: programs, products, C9 both tracks
-- ============================================================
insert into public.programs (code, name, duration_days, sort_order, next_program_code, summary) values
  ('DX4',    'DX4',     4,  1, 'C9',     'A 4-day quarterly reset, ideal to run just before C9.'),
  ('C9',     'C9',      9,  2, 'FIT1',   'The 9-day entry reset. Maximum twice a year.'),
  ('FIT1',   'FIT1',    15, 3, 'FIT2',   'The 15-day follow-on that builds your fitness base.'),
  ('FIT2',   'FIT2',    15, 4, 'VITAL5', 'The second 15-day block.'),
  ('VITAL5', 'Vital 5', 30, 5, null,     'Ongoing daily maintenance. Pause during DX4, C9 and FIT blocks.');

insert into public.products (name, short_name, kit_quantity, daily_use, how_to_use, sort_order) values
  ('Aloe Vera Gel drink', 'Aloe', '2 x 1 litre Tetra Pak', 'As per the day schedule', 'Take 120 ml at a time, 30 minutes after your capsules. Refrigerate after opening.', 1),
  ('Fiber', 'Fiber', '9 packets', '1 packet per day', 'Mix one packet into 240-300 ml water and drink straight away. Always take it on its own - fibre binds to some nutrients and reduces how much you absorb.', 2),
  ('Therm', 'Therm', '18 tablets', '2 tablets per day', 'Take with a minimum of 240 ml water, as scheduled.', 3),
  ('Garcinia Plus', 'Garcinia', '54 softgels', '6 softgels per day', 'Take with a minimum of 240 ml water, 30 minutes before your drink or meal.', 4),
  ('Lite Ultra shake', 'Shake', '1 serving pouch (15 shakes)', 'As per the day schedule', 'One scoop in 300 ml water, almond milk, light soy or coconut milk. 18 shakes if you did DX4 first.', 5);

do $seed$
declare
  _c9 uuid;
  _aloe uuid; _fiber uuid; _therm uuid; _garc uuid; _shake uuid;
  _track text; _day integer; _pd uuid; _pattern text;
  _tips text[] := array[
    'Day 1 - aaj sirf shuruaat pe dhyaan do. Paani zyada, expectations kam.',
    'Day 2 - sar bhaari lag sakta hai, ye normal hai. Paani badhao, aaram karo.',
    'Day 3 - solid meal wapas aa gaya. Portion chhota, protein pura.',
    'Day 4 - kapde thode dheele lagenge, weighing machine ko chhodo.',
    'Day 5 - aadha safar poora. Aaj 30 minute walk miss nahi karna.',
    'Day 6 - cravings peak pe hote hain. Ek glass paani, 10 minute wait.',
    'Day 7 - do din bache. Sochna shuru karo ki iske baad kya.',
    'Day 8 - photo lene ka din. Kal ka comparison isi pe khada hai.',
    'Day 9 - aaj noon shake ki jagah halka meal. Kal measurements.'
  ];
begin
  select id into _c9 from public.programs where code = 'C9';
  select id into _aloe from public.products where short_name = 'Aloe';
  select id into _fiber from public.products where short_name = 'Fiber';
  select id into _therm from public.products where short_name = 'Therm';
  select id into _garc from public.products where short_name = 'Garcinia';
  select id into _shake from public.products where short_name = 'Shake';

  foreach _track in array array['standard','dx4'] loop
    for _day in 1..9 loop
      -- standard: days 1-2 are reset days; dx4-first runs the solid-meal pattern all 9 days
      if _track = 'standard' and _day <= 2 then _pattern := 'reset'; else _pattern := 'meal'; end if;

      insert into public.program_days (program_id, track, day_number, title, focus, tip)
      values (_c9, _track, _day, 'Day ' || _day,
        case when _pattern = 'reset' then 'Reset day - no solid meal' else 'Solid meal day' end,
        _tips[_day])
      returning id into _pd;

      if _pattern = 'reset' then
        insert into public.day_tasks (program_day_id, slot, title, detail, product_id, sort_order) values
          (_pd,'morning','2 x Garcinia Plus','With minimum 240 ml water',_garc,1),
          (_pd,'morning','1 x Therm','With minimum 240 ml water',_therm,2),
          (_pd,'morning','Wait 30 minutes, then 120 ml Aloe Vera Gel',null,_aloe,3),
          (_pd,'mid_morning','1 x Fiber packet','In 240-300 ml water. Always take Fiber on its own.',_fiber,1),
          (_pd,'noon','2 x Garcinia Plus + 1 x Therm','With minimum 240 ml water',_garc,1),
          (_pd,'noon','1 scoop Lite Ultra shake',null,_shake,2),
          (_pd,'noon','Wait 30 minutes, then 120 ml Aloe Vera Gel',null,_aloe,3),
          (_pd,'early_evening','2 x Garcinia Plus','With minimum 240 ml water',_garc,1),
          (_pd,'early_evening','Wait 30 minutes, then 120 ml Aloe Vera Gel',null,_aloe,2),
          (_pd,'evening','120 ml Aloe Vera Gel',null,_aloe,1),
          (_pd,'all_day','8 glasses of water',null,null,1),
          (_pd,'all_day','5-minute stretch',null,null,2),
          (_pd,'all_day','30 minutes light movement','Slow to moderate walk, gentle stretching or beginner yoga. No medium or high intensity training during C9.',null,3),
          (_pd,'all_day','Stay active through the day','Cleaning, gardening, laundry, shopping, walking. This adds up to more than the workout itself.',null,4);
      else
        insert into public.day_tasks (program_day_id, slot, title, detail, product_id, sort_order) values
          (_pd,'morning','2 x Garcinia Plus + 1 x Therm','Minimum 240 ml water with each',_garc,1),
          (_pd,'morning','Wait 30 minutes, then 120 ml Aloe Vera Gel',null,_aloe,2),
          (_pd,'morning','1 scoop Lite Ultra shake','In 300 ml water, almond, light soy or coconut milk',_shake,3),
          (_pd,'mid_morning','1 x Fiber packet','In 240-300 ml water. Always take Fiber on its own.',_fiber,1),
          (_pd,'noon','2 x Garcinia Plus','With minimum 240 ml water',_garc,1),
          (_pd,'early_evening','2 x Garcinia Plus','With minimum 240 ml water',_garc,1),
          (_pd,'early_evening','Wait 30 minutes, then your meal up to 600 calories','Lunch or dinner, your choice. Women around 1,000 kcal a day, men around 1,200 kcal.',null,2),
          (_pd,'evening','Minimum 240 ml water',null,null,1),
          (_pd,'all_day','8 glasses of water',null,null,1),
          (_pd,'all_day','5-minute stretch',null,null,2),
          (_pd,'all_day','30 minutes light movement','Slow to moderate walk, gentle stretching or beginner yoga. No medium or high intensity training during C9.',null,3),
          (_pd,'all_day','Stay active through the day','Cleaning, gardening, laundry, shopping, walking. This adds up to more than the workout itself.',null,4);

        if _day = 9 then
          insert into public.day_tasks (program_day_id, slot, title, detail, product_id, sort_order) values
            (_pd,'noon','Wait 30 minutes, then a 300-calorie meal + 1 x Therm','Day 9 swaps the noon shake for a light meal. This is your transition into FIT1.',_therm,2);
        else
          insert into public.day_tasks (program_day_id, slot, title, detail, product_id, sort_order) values
            (_pd,'noon','Wait 30 minutes, then 1 scoop Lite Ultra + 1 x Therm',null,_shake,2);
        end if;
      end if;
    end loop;
  end loop;
end $seed$;

-- 14. Free-food and cut lists as FAQ-style guide content
insert into public.faqs (question, answer, category, sort_order) values
 ('Which foods can I eat freely?','Unlimited: rocket, spinach, lettuce, chicory, celery, cucumber, spring onion. Two servings a day of vegetables (75 g / 5 tbsp, raw or lightly steamed, no oil or salt): beetroot, carrot, brussels sprouts, squash, kale, cabbage, asparagus, sugarsnap peas, string beans, sea vegetables, cauliflower, broccoli. Two servings a day of fruit (75 g berries or one whole fruit): blueberries, grapes, raspberries, blackberries, strawberries, cherries, or one grapefruit, apple, pear, peach, orange, banana, or two plums. One serving a day of raw unsalted nuts and seeds (28 g / 2 tbsp): walnuts, pecans, pumpkin seeds, almonds, hemp, flax, pomegranate seeds.','Food',1),
 ('What do I cut out during the program?','Alcohol, caffeine, soda and fizzy or sugar-free drinks, processed and fast food, dairy, added sugar of any kind, hydrogenated and vegetable oils, margarine, trans fats, non-lean meat, and grains such as oats, quinoa, pasta, bread and cereal. Wild rice and whole-grain couscous are allowed. Chicken, turkey and fish are fine.','Food',2),
 ('Can I use salt?','Keep it to a minimum, it holds water in the body. Use ginger, garlic, basil, cinnamon, rosemary, thyme and turmeric instead. Your masala dabba already has everything you need.','Food',3),
 ('I am using Aloe Berry Nectar or Aloe Peaches instead. Any change?','Yes, one change. Drop the one serving a day of nuts and seeds, because the flavoured aloe already adds carbs and sugar.','Food',4),
 ('Why can I not weigh myself every day?','Weight moves up and down day to day for reasons that have nothing to do with fat. The program records weight on Day 1 and Day 10 only, and the app locks it to those days. Judge progress by how your clothes fit in between.','Progress',5),
 ('Can I go to the gym?','Not during C9. Stick to 30 minutes of light movement a day and stay generally active. No medium or high intensity training.','Movement',6);

insert into public.tips (day_number, body, sort_order)
select pd.day_number, pd.tip, pd.day_number
from public.program_days pd
join public.programs p on p.id = pd.program_id
where p.code = 'C9' and pd.track = 'standard' and pd.tip is not null;
