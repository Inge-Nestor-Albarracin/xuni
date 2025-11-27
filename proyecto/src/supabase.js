import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://nqrjnjmedzknhbjyjygw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcmpuam1lZHprbmhianlqeWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTE5MTYsImV4cCI6MjA3OTc4NzkxNn0.BxBOfUY4C709VXLIFKFO8SBFBZ8ScUJ21JNkRYt68jM';
export const supabase = createClient(supabaseUrl, supabaseKey);
