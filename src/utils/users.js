import { supabase } from './supabase';

/**
 * Fetch the list of allowed users to populate the dropdown.
 * Uses the `profiles` table with columns: id, name, email.
 * Adjust the table/columns if your schema differs.
 */
export async function fetchAllowedUsersPublic() {
    const { data, error } = await supabase
      .from('profiles_public')
      .select('id, name, email')
      .order('name', { ascending: true });
  
    if (error) throw error;
    return data || [];
  }
  