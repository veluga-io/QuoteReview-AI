-- Check if tables exist
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'templates', 'submissions', 'findings', 'audit_logs')
ORDER BY table_name;
