
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

export class DatabaseService {
  constructor(private supabase: SupabaseClient) {}

  async storeUserQuery(data: { user_id: string | null; email: string; message_text: string }) {
    console.log('Storing user query in database');
    
    const { error: dbError } = await this.supabase
      .from('user_queries')
      .insert(data);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to store query: ${dbError.message}`);
    }
    
    console.log('User query successfully stored in database');
    return true;
  }
}

export async function storeContactSubmission(formData: any): Promise<boolean> {
  console.log('Storing contact form data in database - legacy function');
  // This is kept for backward compatibility but not used
  return true;
}
