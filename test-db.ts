
import { supabaseAdmin } from './src/integrations/supabase/client.server';

async function test() {
  try {
    const { data, error } = await supabaseAdmin
      .from('registration_codes')
      .select('*')
      .eq('code', 'FAT2FIT');
    
    console.log('RESULT:', JSON.stringify({ data, error }, null, 2));
  } catch (e) {
    console.error('CRASH:', e.message);
  }
}

test();
