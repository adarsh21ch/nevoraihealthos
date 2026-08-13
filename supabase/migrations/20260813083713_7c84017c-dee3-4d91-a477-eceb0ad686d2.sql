-- Add performance indexes for frequently queried columns

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_onboarding_complete ON public.customers(onboarding_complete);

-- Participant programs indexes
CREATE INDEX IF NOT EXISTS idx_participant_programs_participant_id ON public.participant_programs(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_programs_program_id ON public.participant_programs(program_id);

-- Daily logs indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_customer_id_date ON public.daily_logs(customer_id, log_date);

-- Task completions indexes
CREATE INDEX IF NOT EXISTS idx_task_completions_customer_id_date ON public.task_completions(customer_id, log_date);

-- Tips and FAQs order indexes
CREATE INDEX IF NOT EXISTS idx_tips_sort_order ON public.tips(sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON public.faqs(sort_order);

-- Day tasks sort order
CREATE INDEX IF NOT EXISTS idx_day_tasks_program_day_sort ON public.day_tasks(program_day_id, sort_order);